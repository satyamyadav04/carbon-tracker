const SkeletonCard = ({ lines = 3, width = '100%' }) => (
  <div className="skeleton-card">
    {[...Array(lines)].map((_, index) => (
      <div className="skeleton-line" key={index} style={{ width }} />
    ))}
  </div>
);

export default SkeletonCard;
