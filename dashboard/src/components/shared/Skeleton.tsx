interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="rectangular" width={60} height={22} className="rounded-full" />
      </div>
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="80%" height={16} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" width="30%" height={14} />
        <Skeleton variant="text" width="20%" height={14} />
      </div>
    </div>
  );
}

export function SkeletonKanbanColumn() {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton variant="circular" width={8} height={8} />
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="rectangular" width={28} height={22} className="rounded-full" />
      </div>
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function SkeletonScorecard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={140} height={24} />
        <Skeleton variant="rectangular" width={60} height={32} />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="py-2 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width={40} height={16} />
          </div>
          <Skeleton variant="rectangular" width="100%" height={8} className="rounded-full" />
        </div>
      ))}
    </div>
  );
}
