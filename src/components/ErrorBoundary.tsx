import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorScreen } from "./ErrorScreen";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/** Catches a crash anywhere below it, so the visitor never sees a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorScreen actionLabel="Reload the page" onAction={() => window.location.reload()} />
      );
    }
    return this.props.children;
  }
}
