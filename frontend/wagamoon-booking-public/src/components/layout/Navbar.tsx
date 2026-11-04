import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Compass } from 'lucide-react';
import { WhatsAppButton } from '../ui/WhatsAppButton';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Stays', path: '/properties' },
    { name: 'Activities', path: '/activities' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: isScrolled ? 'rgba(250, 248, 245, 0.92)' : 'rgba(250, 248, 245, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isScrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        transition: 'all var(--transition-normal)',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(27, 59, 43, 0.25)',
            }}
          >
            <Compass size={22} color="var(--color-accent-light)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--color-primary-dark)' }}>
              Wagamon
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent-dark)' }}>
              Booking & Retreats
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  position: 'relative',
                  padding: '0.4rem 0',
                }}
              >
                {link.name}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: 'var(--color-accent)',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Header Button */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-actions">
          <WhatsAppButton
            url="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20villa%20availability%20in%20Wagamon."
            label="Direct Enquiry"
            size="sm"
          />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary-dark)',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-lg)',
          }}
          className="mobile-drawer"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '1.1rem',
                fontWeight: location.pathname === link.path ? 700 : 500,
                color: location.pathname === link.path ? 'var(--color-primary)' : 'var(--color-text-main)',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ paddingTop: '0.75rem' }}>
            <WhatsAppButton
              url="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20villa%20availability%20in%20Wagamon."
              label="Contact on WhatsApp"
              fullWidth
            />
          </div>
        </div>
      )}

      {/* Responsive Media Query Styles */}
      <style>{`
        @media (min-width: 820px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
};
