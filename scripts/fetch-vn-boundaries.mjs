#!/usr/bin/env node
/**
 * Lấy ranh giới hành chính Việt Nam SAU SÁP NHẬP (mô hình 2 cấp từ 01/07/2025)
 * từ OpenStreetMap qua Overpass, ghép mã đơn vị hành chính, đơn giản hóa
 * (giữ topology để không hở/đè giữa các xã liền kề), ghi ra public/.
 *
 * OSM admin_level cho VN sau cải cách (mô hình 2 cấp, KHÔNG còn cấp huyện):
 *   - 4  = tỉnh / thành phố trực thuộc TW   (34 đơn vị)
 *   - 6  = phường / xã / đặc khu            (~3.3k đơn vị)
 *
 * Khóa join: OSM không mang mã GSO ổn định (ref rỗng) → dùng `osm_id` làm
 * khóa chính (+ province_osm_id/province_name). Liên kết xã→tỉnh lấy trực
 * tiếp từ vòng lặp tải theo từng tỉnh, không cần spatial join.
 * Clip ranh giới biển/EEZ bằng mask đất liền geoBoundaries ADM0.
 *
 * Chạy:  node scripts/fetch-vn-boundaries.mjs
 * Yêu cầu: Node >= 18 (global fetch). Tự gọi osmtogeojson + mapshaper qua npx.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Sau cải cách 2025, OSM VN map xã/phường/đặc khu (mô hình 2 cấp) ở
// admin_level=6 (≈3.3k đơn vị, tên "Phường…/Xã…"). Cấp huyện cũ đã bỏ.
const WARD_ADMIN_LEVEL = 6;

// % giữ lại khi simplify. Tỉnh có thể mạnh tay, xã cần giữ chi tiết hơn.
const SIMPLIFY = { provinces: '6%', wards: '12%' };

// Mask đất liền VN (geoBoundaries ADM0, theo đường bờ biển, KHÔNG có EEZ).
// Dùng để clip — vì admin boundary OSM của VN bao cả ranh giới biển/EEZ,
// simplify nối thành đường thẳng phủ kín biển. Clip xong chỉ còn đất liền.
// (ADM0 không gồm Trường Sa/Hoàng Sa nên vài xã đảo xa sẽ bị loại — chấp
// nhận được cho bản đồ AQI; bỏ clip nếu cần giữ.)
const LAND_MASK_URL =
  'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/VNM/ADM0/geoBoundaries-VNM-ADM0.geojson';

async function overpass(query) {
  let lastErr;
  for (const url of OVERPASS_MIRRORS) {
    try {
      console.log(`  → Overpass: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'air-quality-fe/1.0 (VN admin boundaries fetch; contact letruongle325@gmail.com)',
        },
        body: 'data=' + encodeURIComponent(query),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.elements?.length) throw new Error('rỗng (0 elements)');
      return json;
    } catch (err) {
      console.warn(`    ✗ ${err.message} — thử mirror khác`);
      lastErr = err;
    }
  }
  throw new Error(`Tất cả Overpass mirror đều lỗi: ${lastErr?.message}`);
}

// Recursion output (._;>;) + out body: trả relation + way + node để
// osmtogeojson ghép multipolygon chuẩn. (out geom toàn quốc bị osmtogeojson
// bỏ sót gần hết → phải tải theo từng tỉnh cho gọn.)
function provincesQuery() {
  return `[out:json][timeout:600];
area["ISO3166-1"="VN"][admin_level=2]->.vn;
relation(area.vn)["boundary"="administrative"]["admin_level"="4"];
(._;>;);
out body;`;
}

// Xã/phường trong phạm vi 1 tỉnh. map_to_area đáng tin hơn việc tự cộng
// offset 3600000000 (offset sai khi relation chưa có area tương ứng).
function wardsInProvinceQuery(provRelId) {
  return `[out:json][timeout:300];
rel(${provRelId});map_to_area->.p;
relation(area.p)["boundary"="administrative"]["admin_level"="${WARD_ADMIN_LEVEL}"];
(._;>;);
out body;`;
}

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { stdio: ['pipe', 'pipe', 'inherit'], maxBuffer: 1 << 30, ...opts });
}

function osmToGeojson(osmJson, tmp, tag) {
  const inFile = join(tmp, `${tag}.osm.json`);
  writeFileSync(inFile, JSON.stringify(osmJson));
  // osmtogeojson ghép boundary relation thành (Multi)Polygon hoàn chỉnh.
  const out = run('npx', ['--yes', 'osmtogeojson', inFile]);
  return JSON.parse(out.toString());
}

function pickCode(props = {}) {
  return (
    props['ref:VN'] ||
    props.ref ||
    props['ISO3166-2'] ||
    null
  );
}

// osmtogeojson đặt id dạng "relation/12345" — tách lấy số.
function osmRelId(feature) {
  const m = /relation\/(\d+)/.exec(feature.id || '');
  return m ? Number(m[1]) : null;
}

// Chỉ giữ relation đa giác (bỏ way trùng/điểm nhãn).
function polygonFeatures(fc) {
  return fc.features.filter(
    (f) => f.geometry && /Polygon$/.test(f.geometry.type) && /^relation\//.test(f.id || '')
  );
}

function mapshaper(args) {
  run('npx', ['--yes', 'mapshaper', ...args]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const tmp = mkdtempSync(join(tmpdir(), 'vn-bnd-'));
  try {
    console.log('1/5  Tải ranh giới TỈNH (admin_level=4) sau sáp nhập…');
    const provRaw = await overpass(provincesQuery());
    const provPolys = polygonFeatures(osmToGeojson(provRaw, tmp, 'prov'));
    console.log(`  Tỉnh: ${provPolys.length} đơn vị`);

    const provGeo = {
      type: 'FeatureCollection',
      features: provPolys.map((f) => {
        const p = f.properties || {};
        const name = p['name:vi'] || p.name || 'Không rõ';
        return {
          type: 'Feature',
          properties: {
            // OSM không mang mã GSO ổn định (ref rỗng) → osm_id là khóa
            // join chính, code chỉ là phụ nếu OSM có ref:VN/ref.
            osm_id: osmRelId(f),
            code: pickCode(p),
            name,
            shapeName: name,
          },
          geometry: f.geometry,
        };
      }),
    };

    console.log('2/5  Tải XÃ/PHƯỜNG theo từng tỉnh (34 request)…');
    const wardFeatures = [];
    for (let i = 0; i < provPolys.length; i++) {
      const pf = provPolys[i];
      const relId = osmRelId(pf);
      const pProps = pf.properties || {};
      const pName = pProps['name:vi'] || pProps.name || `Tỉnh ${i}`;
      const pCode = pickCode(pProps);
      if (!relId) {
        console.warn(`  ! ${pName}: không có relation id, bỏ qua`);
        continue;
      }
      try {
        const raw = await overpass(wardsInProvinceQuery(relId));
        const polys = polygonFeatures(osmToGeojson(raw, tmp, `w${relId}`));
        for (const w of polys) {
          const wp = w.properties || {};
          const wName = wp['name:vi'] || wp.name || 'Không rõ';
          wardFeatures.push({
            type: 'Feature',
            properties: {
              osm_id: osmRelId(w),
              code: pickCode(wp),
              name: wName,
              shapeName: wName,
              province_osm_id: relId,
              province_code: pCode,
              province_name: pName,
            },
            geometry: w.geometry,
          });
        }
        console.log(`  [${i + 1}/${provPolys.length}] ${pName}: ${polys.length} xã/phường`);
      } catch (err) {
        console.warn(`  ! ${pName}: lỗi (${err.message}) — bỏ qua`);
      }
      await sleep(1200); // lịch sự với Overpass, tránh 429
    }

    const provIn = join(tmp, 'prov.geojson');
    const wardIn = join(tmp, 'ward.geojson');
    writeFileSync(provIn, JSON.stringify(provGeo));
    writeFileSync(
      wardIn,
      JSON.stringify({ type: 'FeatureCollection', features: wardFeatures })
    );
    const wardWithCode = wardFeatures.filter((f) => f.properties.code).length;
    console.log(`  Tổng: ${wardFeatures.length} xã/phường, ${wardWithCode} có mã`);

    console.log('3/5  Tải mask đất liền VN (geoBoundaries ADM0)…');
    const landMask = join(tmp, 'land.geojson');
    const lm = await fetch(LAND_MASK_URL, {
      headers: { 'User-Agent': 'air-quality-fe/1.0 (letruongle325@gmail.com)' },
    });
    if (!lm.ok) throw new Error(`Tải land mask lỗi HTTP ${lm.status}`);
    writeFileSync(landMask, await lm.text());

    console.log('4/5  Clip biển + simplify giữ topology cho TỈNH…');
    mapshaper([
      provIn,
      '-clip', landMask,
      '-simplify', SIMPLIFY.provinces, 'keep-shapes',
      '-clean',
      '-o', 'format=geojson', 'precision=0.0001',
      join(PUBLIC_DIR, 'vn-provinces.geojson'),
    ]);

    console.log('5/5  Clip biển + simplify giữ topology cho XÃ/PHƯỜNG…');
    mapshaper([
      wardIn,
      '-clip', landMask,
      '-simplify', SIMPLIFY.wards, 'keep-shapes',
      '-clean',
      '-o', 'format=geojson', 'precision=0.0001',
      join(PUBLIC_DIR, 'vn-wards.geojson'),
    ]);

    const provN = JSON.parse(readFileSync(join(PUBLIC_DIR, 'vn-provinces.geojson'))).features.length;
    const wardN = JSON.parse(readFileSync(join(PUBLIC_DIR, 'vn-wards.geojson'))).features.length;
    console.log(`\n✓ Xong. public/vn-provinces.geojson (${provN}) · public/vn-wards.geojson (${wardN})`);
    console.log('  Lưu ý: cấu trúc 2 cấp — KHÔNG còn vn-districts.geojson. Cần sửa AQIMap bỏ cấp huyện.');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error('\n✗ Lỗi:', e.message);
  process.exit(1);
});
