import React from 'react';

interface PageHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  tag,
  title,
  description,
  backgroundImage = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80',
  children,
}) => {
  return (
    <section
      style={{
        position: 'relative',
        paddingTop: 'clamp(5rem, 9vw, 8rem)',
        paddingBottom: 'clamp(4rem, 7vw, 6rem)',
        backgroundColor: 'var(--color-bg-dark)',
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Background with Dark Subtle Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.28,
          filter: 'saturate(0.8)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(18, 33, 24, 0.7) 0%, rgba(18, 33, 24, 0.95) 100%)',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: '780px' }}>
          {tag && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: 'var(--color-accent)',
                marginBottom: '1rem',
              }}
            >
              <span>{tag}</span>
            </div>
          )}

          <h1
            style={{
              color: '#FFFFFF',
              marginBottom: '1.25rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {title}
          </h1>

          {description && (
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                color: 'var(--color-sage-light)',
                lineHeight: 1.6,
                marginBottom: children ? '1.5rem' : 0,
              }}
            >
              {description}
            </p>
          )}

          {children}
        </div>
      </div>
    </section>
  );
};

