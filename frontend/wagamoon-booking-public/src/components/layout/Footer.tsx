import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-bg-dark)',
        color: 'var(--color-text-inverse)',
        paddingTop: '5rem',
        paddingBottom: '3rem',
        borderTop: '1px solid var(--color-border-dark)',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3.5rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '340px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={22} color="var(--color-accent-light)" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Wagamon
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                  Booking & Retreats
                </div>
              </div>
            </Link>
            <p style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Curated boutique villas and nature retreats nestled in the tranquil hill station of Wagamon, Kerala. Seamless direct booking via WhatsApp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem' }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem' }}>
                  Villas & Properties
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem' }}>
                  About Wagamon
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem' }}>
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Assistance */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Connect & Enquire
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-sage-light)', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>Wagamon, Idukki District, Kerala, India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MessageCircle size={18} color="#25D366" style={{ flexShrink: 0 }} />
                <a
                  href="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20villa%20availability%20in%20Wagamon."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#25D366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  Chat on WhatsApp <ArrowUpRight size={14} />
                </a>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                Direct enquiries & personalized assistance for families, couples, and groups.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.85rem',
            color: 'var(--color-text-light)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Wagamon Booking. All rights reserved.
          </div>
          <div>
            Dedicated to serene highland hospitality in Kerala.
          </div>
        </div>
      </div>
    </footer>
  );
};
