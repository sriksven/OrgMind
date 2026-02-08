export function Skeleton({ height = 16, width = '100%', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height={16} width="50%" />
      <Skeleton height={10} width="80%" />
      <Skeleton height={10} width="70%" />
      <Skeleton height={10} width="90%" />
    </div>
  )
}
