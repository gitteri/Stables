"use client";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-28 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="skeleton h-3 w-32 mb-4" />
        <div className="skeleton h-[280px] w-full" />
      </div>
      <div className="glass-card p-6">
        <div className="skeleton h-3 w-32 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-11 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-card p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[#0F172A] mb-1">Failed to Load Data</h3>
      <p className="text-sm text-[#64748B] mb-5 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
