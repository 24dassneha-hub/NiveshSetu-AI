import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NiveshSetu UI Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F3EFE5] text-[#171717] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-6 sm:p-8 shadow-[0_12px_40px_rgba(23,23,23,0.08)] text-center">
            <div className="w-12 h-12 rounded-full bg-[#B85C4A]/10 border border-[#B85C4A]/30 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-[#B85C4A]" />
            </div>

            <div className="font-mono-data text-[10px] text-[#B85C4A] font-bold uppercase tracking-wider mb-1">
              INTERFACE RECOVERY
            </div>

            <h2 className="text-xl font-bold text-[#171717] uppercase tracking-tight mb-2">
              Something went wrong
            </h2>

            <p className="text-xs text-[#6E6A61] font-sans leading-relaxed mb-6">
              A temporary display glitch was detected. Your enterprise data is safe and intact. You can reload the view or return to the overview dashboard.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-4 py-2 bg-[#FAF8F2] border border-[#262522] text-xs font-mono-data font-bold text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RELOAD VIEW</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 bg-[#18324A] text-xs font-mono-data font-bold text-[#FAF8F2] hover:bg-[#122435] rounded-[3px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>RETURN TO DASHBOARD</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
