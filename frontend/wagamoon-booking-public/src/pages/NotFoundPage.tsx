import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found — Wagamon Booking';
  }, []);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
      }}
    >
      <div className="container-narrow text-center">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
          }}
        >
          <Compass size={32} />
        </div>

        <span className="section-tag">Error 404</span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', marginBottom: '1rem' }}>
          Lost in the Mist?
        </h1>
        <p style={{ maxWidth: '480px', margin: '0 auto 2.5rem auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          The page you are looking for doesn't exist or has wandered off into the Wagamon hills.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Return to Homepage</span>
          </Link>
          <Link to="/properties" className="btn btn-secondary">
            <span>Explore Properties</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
