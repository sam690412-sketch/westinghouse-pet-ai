import React from "react";

interface SafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
}

export class SafeComponent extends React.Component<SafeProps, State> {
  constructor(props: SafeProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[SafeComponent:${this.props.name}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            <span className="text-error">⚠</span> {this.props.name} 載入失敗
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export function Safe({
  children,
  name,
  fallback,
}: {
  children: React.ReactNode;
  name: string;
  fallback?: React.ReactNode;
}) {
  return (
    <SafeComponent name={name} fallback={fallback}>
      {children}
    </SafeComponent>
  );
}
