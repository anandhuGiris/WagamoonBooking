import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Users,
  ChevronRight,
  ShieldCheck,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { propertyApi } from '../api/propertyApi';
import { PublicPropertyDto } from '../types/property';
import { ImageGallery } from '../components/properties/ImageGallery';
import { AmenityList } from '../components/properties/AmenityList';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { PropertyCard } from '../components/properties/PropertyCard';
import { Skeleton } from '../components/ui/Skeleton';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<PublicPropertyDto | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<PublicPropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        window.scrollTo(0, 0);

        // Fetch target property
        const data = await propertyApi.getPropertyById(id);
        setProperty(data);
        document.title = `${data.name} — Wagamon Booking`;

        // Fetch related properties
        try {
          const all = await propertyApi.getProperties();
          const others = all.filter((p) => p.id !== id).slice(0, 2);
          setRelatedProperties(others);
        } catch {
          // Non-critical if related fails
        }
      } catch (err: any) {
        console.error('Failed to load property details:', err);
        setError(err.message || 'Property not found or is currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.name,
        text: `Check out ${property?.name} in Wagamon`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="section-padding" style={{ backgroundColor: 'var(--color-bg)', minHeight: '80vh' }}>
        <div className="container">
          <Skeleton style={{ height: '30px', width: '250px', marginBottom: '2rem' }} />
          <Skeleton style={{ height: '480px', width: '100%', borderRadius: 'var(--radius-xl)', marginBottom: '2.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            <div>
              <Skeleton style={{ height: '44px', width: '70%', marginBottom: '1rem' }} />
              <Skeleton style={{ height: '24px', width: '40%', marginBottom: '2rem' }} />
              <Skeleton style={{ height: '140px', width: '100%' }} />
            </div>
            <div>
              <Skeleton style={{ height: '260px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="section-padding" style={{ backgroundColor: 'var(--color-bg)', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <div className="container-narrow text-center">
          <h2 style={{ marginBottom: '1rem' }}>Property Unavailable</h2>
          <p style={{ marginBottom: '2rem' }}>
            {error || 'This property could not be found or is currently not listed.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/properties" className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Back to Properties</span>
            </Link>
            <WhatsAppButton
              url="https://wa.me/917034749777?text=Hi%2C%20I%20am%20inquiring%20about%20villa%20availability%20in%20Wagamon."
              label="Contact Host"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', paddingBottom: '6rem' }}>
      {/* Breadcrumb Header Strip */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-alt)',
          borderBottom: '1px solid var(--color-border)',
          paddingTop: '1rem',
          paddingBottom: '1rem',
        }}
      >
        <div className="container">
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/" style={{ color: 'var(--color-text-muted)' }}>
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to="/properties" style={{ color: 'var(--color-text-muted)' }}>
              Properties
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>
              {property.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        {/* Title & Location Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                marginBottom: '0.5rem',
                color: 'var(--color-primary-dark)',
              }}
            >
              {property.name}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--color-sage-dark)',
                fontSize: '0.98rem',
                fontWeight: 600,
              }}
            >
              <MapPin size={17} color="var(--color-accent-dark)" />
              <span>{property.location || 'Wagamon, Kerala'}</span>
            </div>
          </div>

          {/* Quick Share Button */}
          <button
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Share2 size={16} />
            <span>{copiedLink ? 'Link Copied!' : 'Share Stay'}</span>
          </button>
        </div>

        {/* Interactive Photo Gallery with Lightbox */}
        <div style={{ marginBottom: '3.5rem' }}>
          <ImageGallery property={property} />
        </div>

        {/* 2-Column Showcase Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(2rem, 5vw, 4rem)',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Details, Description, Amenities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Quick Specs Overview Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
              }}
            >
              {property.bedrooms !== null && (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <Bed size={22} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bedrooms</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>{property.bedrooms}</strong>
                </div>
              )}

              {property.bathrooms !== null && (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <Bath size={22} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bathrooms</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>{property.bathrooms}</strong>
                </div>
              )}

              {property.maxGuests !== null && (
                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <Users size={22} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Guests</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)' }}>Up to {property.maxGuests}</strong>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-card)',
                padding: '2.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.25rem' }}>About this Retreat</h2>
              <div
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: 'var(--color-text-main)',
                  whiteSpace: 'pre-line',
                }}
              >
                {property.description}
              </div>
            </div>

            {/* Amenities Section */}
            {property.facilities && property.facilities.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  padding: '2.5rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Amenities & Facilities</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
                  Features provided at this property for your comfort and convenience.
                </p>
                <AmenityList facilities={property.facilities} variant="grid" />
              </div>
            )}

            {/* Location & Hospitality Guidelines */}
            <div
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(27, 59, 43, 0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <ShieldCheck size={26} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
                  Direct Caretaker & Host Assistance
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Upon reaching Wagamon, our team and caretaker will assist with directions, check-in, and local sight recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky WhatsApp Enquiry Box */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div
              className="luxury-card"
              style={{
                padding: '2.25rem',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sparkles size={18} color="var(--color-accent-dark)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-dark)' }}>
                  Direct Booking
                </span>
              </div>

              <h3 style={{ fontSize: '1.7rem', marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>
                Enquire for {property.name}
              </h3>

              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Chat directly with our Wagamon team on WhatsApp. Confirm dates, custom group requirements, and receive instant booking confirmation.
              </p>

              {/* Verified Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <span>Direct contact with property manager</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <span>No platform middleman fees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="var(--color-primary)" />
                  <span>Flexible check-in coordination</span>
                </div>
              </div>

              {/* Direct WhatsApp CTA Button */}
              <WhatsAppButton
                url={property.whatsAppUrl}
                label="Book via WhatsApp"
                size="lg"
                fullWidth
              />

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                  Opens WhatsApp with pre-filled property enquiry
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties Suggestion Strip */}
        {relatedProperties.length > 0 && (
          <div style={{ marginTop: '5.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '4rem' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <span className="section-tag">Discover More Stays</span>
              <h2>Other Retreats in Wagamon</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {relatedProperties.map((related) => (
                <PropertyCard key={related.id} property={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
