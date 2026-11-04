import React from 'react';
import {
  Wifi,
  Car,
  Utensils,
  Wind,
  Tv,
  Waves,
  Mountain,
  Sun,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface AmenityListProps {
  facilities: string[];
  variant?: 'pills' | 'grid';
  className?: string;
  maxDisplay?: number;
}

export const getAmenityIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('wifi') || normalized.includes('internet')) return <Wifi size={16} />;
  if (normalized.includes('park')) return <Car size={16} />;
  if (normalized.includes('kitchen') || normalized.includes('cook')) return <Utensils size={16} />;
  if (normalized.includes('air') || normalized.includes('ac')) return <Wind size={16} />;
  if (normalized.includes('tv')) return <Tv size={16} />;
  if (normalized.includes('pool') || normalized.includes('swim')) return <Waves size={16} />;
  if (normalized.includes('mountain') || normalized.includes('hill')) return <Mountain size={16} />;
  if (normalized.includes('lake') || normalized.includes('river')) return <Eye size={16} />;
  if (normalized.includes('balcony') || normalized.includes('terrace')) return <Sun size={16} />;
  return <CheckCircle2 size={16} />;
};

export const AmenityList: React.FC<AmenityListProps> = ({
  facilities,
  variant = 'pills',
  className = '',
  maxDisplay,
}) => {
  if (!facilities || facilities.length === 0) {
    return null;
  }

  const displayed = maxDisplay ? facilities.slice(0, maxDisplay) : facilities;
  const remaining = maxDisplay && facilities.length > maxDisplay ? facilities.length - maxDisplay : 0;

  if (variant === 'grid') {
    return (
      <div
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {displayed.map((facility, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              color: 'var(--color-primary-dark)',
              fontWeight: 500,
            }}
          >
            <span style={{ color: 'var(--color-primary)' }}>{getAmenityIcon(facility)}</span>
            <span>{facility}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
      }}
    >
      {displayed.map((facility, index) => (
        <span
          key={index}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.8rem',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid rgba(27, 59, 43, 0.08)',
          }}
        >
          {getAmenityIcon(facility)}
          <span>{facility}</span>
        </span>
      ))}
      {remaining > 0 && (
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            padding: '0.35rem 0.6rem',
          }}
        >
          +{remaining} more
        </span>
      )}
    </div>
  );
};
