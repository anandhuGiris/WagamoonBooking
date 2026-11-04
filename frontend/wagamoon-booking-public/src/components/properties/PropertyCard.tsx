import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Users, Camera, ArrowRight } from 'lucide-react';
import { PublicPropertyDto } from '../../types/property';
import { getPropertyPrimaryImage } from '../../utils/imageHelper';
import { WhatsAppButton } from '../ui/WhatsAppButton';
import { AmenityList } from './AmenityList';

interface PropertyCardProps {
  property: PublicPropertyDto;
  featured?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, featured = false }) => {
  const primaryImage = getPropertyPrimaryImage(property);
  const imageCount = property.images?.length || 0;

  return (
    <article
      className="luxury-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Property Cover Image */}
      <Link
        to={`/properties/${property.id}`}
        style={{
          position: 'relative',
          width: '100%',
          height: featured ? '290px' : '240px',
          overflow: 'hidden',
          backgroundColor: '#EBE7DE',
          display: 'block',
        }}
      >
        <img
          src={primaryImage}
          alt={property.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-slow)',
          }}
          className="property-card-img"
        />

        {/* Photo Count Tag */}
        {imageCount > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              backgroundColor: 'rgba(18, 33, 24, 0.75)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Camera size={13} />
            <span>{imageCount} Photos</span>
          </div>
        )}

        {/* Location Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(250, 248, 245, 0.92)',
            color: 'var(--color-primary-dark)',
            fontSize: '0.76rem',
            fontWeight: 700,
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <MapPin size={12} color="var(--color-accent-dark)" />
          <span>{property.location || 'Wagamon'}</span>
        </div>

        {/* Category Badge */}
        {property.categoryName && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'var(--color-primary-dark)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {property.categoryName}
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div
        style={{
          padding: '1.6rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <h3
          style={{
            fontSize: '1.45rem',
            marginBottom: '0.5rem',
          }}
        >
          <Link
            to={`/properties/${property.id}`}
            style={{
              color: 'var(--color-primary-dark)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            className="property-title-link"
          >
            {property.name}
          </Link>
        </h3>

        {/* Specs Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            paddingBottom: '0.9rem',
            marginBottom: '0.9rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
          }}
        >
          {property.bedrooms !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Bed size={16} color="var(--color-sage-dark)" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Bath size={16} color="var(--color-sage-dark)" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
          {property.maxGuests !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={16} color="var(--color-sage-dark)" />
              <span>Up to {property.maxGuests} Guests</span>
            </div>
          )}
        </div>

        {/* Description Excerpt */}
        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {property.description}
        </p>

        {/* Facility Pills */}
        <div style={{ marginBottom: '1.5rem', marginTop: 'auto' }}>
          <AmenityList facilities={property.facilities} maxDisplay={3} />
        </div>

        {/* Actions Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <Link
            to={`/properties/${property.id}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>
          <WhatsAppButton
            url={property.whatsAppUrl}
            label="Enquire"
            size="sm"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <style>{`
        .luxury-card:hover .property-card-img {
          transform: scale(1.05);
        }
        .property-title-link:hover {
          color: var(--color-primary-light);
        }
      `}</style>
    </article>
  );
};

