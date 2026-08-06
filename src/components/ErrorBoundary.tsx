import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Relaxio SPA ErrorBoundary] Caught uncaught application error:', error, errorInfo);
    this.setState({ errorInfo });
    
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      sessionStorage.setItem('last_app_error', JSON.stringify(errorLog));
    } catch {}
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4 sm:p-6 selection:bg-[#C5A059]/30">
          <div className="w-full max-w-xl rounded-3xl glass-panel border border-red-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                  Application Runtime Error
                </span>
                <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white mt-1">
                  An Unexpected Error Occurred
                </h1>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                Relaxio Spa CRM encountered an unhandled interface exception. Your underlying data remains safe in the database.
              </p>

              {this.state.error && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono text-red-300 overflow-x-auto max-h-40">
                  <div className="font-semibold text-gray-400">Error Description:</div>
                  <div>{this.state.error.message}</div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Try reloading the page. If the issue persists, contact your system administrator.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
              >
                <Home className="h-4 w-4" />
                <span>Return to Dashboard</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#D4AF37] hover:from-[#B38F48] hover:to-[#C5A059] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
