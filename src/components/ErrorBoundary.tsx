import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component hierarchy:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#09090b] p-6">
          <div className="max-w-md w-full bg-white dark:bg-[#161618] rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto text-3xl border border-rose-500/20 shadow-inner">
              <i className="fas fa-triangle-exclamation"></i>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                500 • Application Error
              </span>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We encountered an unexpected error while loading this page. Our engineers have been notified.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-2xl bg-gray-100 dark:bg-zinc-900 text-left text-[11px] font-mono text-rose-600 dark:text-rose-400 overflow-x-auto max-h-32 border border-gray-200 dark:border-zinc-800">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-gray-950 font-extrabold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="fas fa-rotate-right"></i>
                <span>Return to Home</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold text-xs transition-all cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
