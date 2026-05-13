import { Component, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled error in tree:", error, info);
  }

  handleRefresh = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-6 max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertOctagon className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-lg font-display font-semibold text-foreground">
            Đã xảy ra lỗi không mong muốn
          </h1>
          <p className="text-xs text-muted-foreground break-words">
            {this.state.error.message || "Lỗi không xác định"}
          </p>
          <button
            onClick={this.handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tải lại ứng dụng
          </button>
        </div>
      </div>
    );
  }
}
