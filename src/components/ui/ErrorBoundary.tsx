import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
    console.error("Uncaught React Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[hsl(222_47%_8%)] text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div>
              <h2 className="font-cinzel text-2xl font-bold text-white mb-2">
                White Rock Beach Club
              </h2>
              <p className="text-sm text-slate-300 font-light">
                Terjadi kesalahan tampilan sementara. Silakan segarkan halaman.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 text-left text-xs font-mono text-amber-300/80 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <Button
              variant="luxury"
              onClick={this.handleReload}
              className="w-full rounded-full py-6 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Segarkan Halaman
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
