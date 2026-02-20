"use client";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="glass-card p-6">
        <div className="skeleton h-4 w-40 mb-4" />
        <div className="skeleton h-64 w-full" />
      </div>
      {/* Table */}
      <div className="glass-card p-6">
        <div className="skeleton h-4 w-40 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-12 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-sol-text mb-2">Failed to Load Data</h3>
      <p className="text-sol-text-muted mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-lg bg-sol-purple/20 text-sol-purple border border-sol-purple/30 hover:bg-sol-purple/30 transition-all font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
}
