import { Component, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <AlertTriangle className="mb-4 h-16 w-16 text-error/60" />
          <h1 className="text-xl font-bold text-foreground">頁面發生錯誤</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            我們已收到錯誤通知，請稍後重試或返回首頁。
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重新載入
            </Button>
            <Button asChild>
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                回到首頁
              </a>
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
