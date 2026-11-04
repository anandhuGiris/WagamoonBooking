import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`shimmer ${className}`}
      style={{
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
    />
  );
};

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <Skeleton style={{ height: '240px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
        <Skeleton style={{ height: '26px', width: '70%' }} />
        <Skeleton style={{ height: '18px', width: '45%' }} />
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
          <Skeleton style={{ height: '20px', width: '30%' }} />
          <Skeleton style={{ height: '20px', width: '30%' }} />
        </div>
        <Skeleton style={{ height: '50px', width: '100%', marginTop: '0.5rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
          <Skeleton style={{ height: '44px', width: '50%', borderRadius: 'var(--radius-full)' }} />
          <Skeleton style={{ height: '44px', width: '50%', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
    </div>
  );
};

