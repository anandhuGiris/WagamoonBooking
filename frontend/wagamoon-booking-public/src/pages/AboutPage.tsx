import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Wind, Heart, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Wagamon Booking — Hillside Hospitality & Nature Retreats';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Page Header */}
      <PageHeader
        tag="Our Story & Philosophy"
        title="Quiet Luxury Amidst the Pine Forests"
        description="Dedicated to connecting discerning travelers with peaceful private villas and nature escapes in the highlands of Wagamon, Kerala."
        backgroundImage="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1920&q=80"
      />

      {/* Story & Destination Narrative */}
      <section className="section-padding">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(2.5rem, 5vw, 5rem)',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="section-tag">Highland Sanctuary</span>
              <h2 className="section-title">The Magic of Wagamon</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                Located at an elevation of 1,100 meters above sea level in the Idukki district of Kerala, Wagamon remains one of south India’s most pristine and unspoiled hill stations.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.25rem', color: 'var(--color-text-muted)' }}>
                Unlike crowded commercial tourist hubs, Wagamon is characterized by quiet tea estates, deep pine groves, rolling meadows, and crisp mountain mist. It is a destination where time slows down, allowing guests to awaken to birdsong and relax in pure highland tranquility.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                Our mission at <strong>Wagamon Booking</strong> is simple: to offer guests a seamless way to discover and reserve handpicked private villas and scenic holiday homes, while ensuring transparent, direct communication with caring local hosts.
              </p>

              <Link to="/properties" className="btn btn-primary">
                <span>Browse Our Available Villas</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Visual Photography Collage */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  height: '460px',
                  backgroundColor: '#E2DBD0',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85"
                  alt="Wagamon Tea Plantation hills"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospitality Philosophy */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span className="section-tag">Our Approach</span>
            <h2 className="section-title">How We Welcome You</h2>
            <p className="section-subtitle">
              We believe a mountain holiday should be simple, personal, and rejuvenating.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Value 1 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mountain size={24} />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
                Handpicked Scenic Locations
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.65 }}>
                We only list villas that offer peaceful privacy and scenic immersion. We avoid noisy roadside locations in favor of secluded ridge-lines and hillside panoramas.
              </p>
            </div>

            {/* Value 2 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wind size={24} />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
                Thoughtful Comfort
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.65 }}>
                From spacious bedrooms and private balconies to hot water, reliable amenities, and curated kitchens, our retreats are equipped for restful family gatherings.
              </p>
            </div>

            {/* Value 3 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
                Direct Host Communication
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.65 }}>
                No impersonal reservation engines or confusing booking policies. Communicate directly via WhatsApp with the host for quick confirmation and travel advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="section-padding">
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--color-bg-dark)',
              color: '#FFFFFF',
              padding: 'clamp(2.5rem, 5vw, 4rem)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '2rem',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '2.2rem', marginBottom: '0.75rem' }}>
                Plan Your Escape to Wagamon
              </h2>
              <p style={{ color: 'var(--color-sage-light)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Discover our current active listings or message our team to discuss customized family or couple packages.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/properties" className="btn btn-primary">
                <span>Explore Villas</span>
              </Link>
              <WhatsAppButton
                url="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20know%20more%20about%20Wagamon%20Booking."
                label="Message on WhatsApp"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
