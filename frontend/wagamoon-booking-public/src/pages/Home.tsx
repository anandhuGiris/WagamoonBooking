import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Sparkles,
  ShieldCheck,
  Mountain,
  HeartHandshake,
  MessageCircle,
  CheckCircle,
} from 'lucide-react';
import { propertyApi } from '../api/propertyApi';
import { PublicPropertyDto } from '../types/property';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

export const Home: React.FC = () => {
  const [properties, setProperties] = useState<PublicPropertyDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Wagamon Booking — Luxury Villas & Nature Retreats in Wagamon';
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await propertyApi.getProperties();
        setProperties(data.slice(0, 3)); // Display up to 3 featured properties
      } catch (err: any) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-dark)',
          color: '#FFFFFF',
          paddingTop: '6rem',
          paddingBottom: '6rem',
          overflow: 'hidden',
        }}
      >
        {/* Cinematic Backdrop Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.38,
            transform: 'scale(1.02)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(18, 33, 24, 0.4) 0%, rgba(18, 33, 24, 0.95) 100%)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '820px' }} className="animate-fade-in">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-light)',
                marginBottom: '1.75rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Compass size={15} color="var(--color-accent)" />
              <span>Boutique Hill Station Hospitality</span>
            </div>

            <h1
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(2.6rem, 5.2vw, 4.5rem)',
                marginBottom: '1.5rem',
                lineHeight: 1.1,
                fontWeight: 600,
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
            >
              Escape to the Serenity of Wagamon
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                color: 'var(--color-sage-light)',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
                maxWidth: '680px',
              }}
            >
              Immerse yourself in cool highland breezes, rolling pine forests, and mist-laden valley views. Experience private, comfortable villas thoughtfully designed for tranquil getaways.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/properties" className="btn btn-primary btn-lg">
                <span>Explore Our Properties</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTRODUCTION SECTION (Editorial Layout) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(2.5rem, 5vw, 5rem)',
              alignItems: 'center',
            }}
          >
            {/* Left Image Composition */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  height: 'clamp(380px, 50vw, 520px)',
                  backgroundColor: '#E5DFD5',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85"
                  alt="Wagamon luxury villa amidst misty mountains"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Accent Floating Card */}
              <div
                className="glass-surface"
                style={{
                  position: 'absolute',
                  bottom: '-24px',
                  right: '24px',
                  padding: '1.25rem 1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  maxWidth: '260px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <Sparkles size={18} color="var(--color-accent-dark)" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                    Highland Haven
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                  Surrounded by sprawling tea plantations and refreshing mountain mist.
                </p>
              </div>
            </div>

            {/* Right Text Editorial */}
            <div>
              <span className="section-tag">Welcome to Wagamon Booking</span>
              <h2 className="section-title">
                A Peaceful Mountain Haven Above the Clouds
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Perched high in the Western Ghats of Kerala, Wagamon is renowned for its untouched pine forests, verdant green meadows, and eternal cool climate.
              </p>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                At Wagamon Booking, we provide a thoughtfully curated selection of private holiday homes, boutique hillside cottages, and spacious luxury villas. Whether you are traveling as a couple seeking a romantic hideaway or as a family looking for peaceful time in nature, our team connects you directly with the property host on WhatsApp for immediate and personalized reservations.
              </p>

              {/* Quick Feature Checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Scenic Hillside Vistas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Direct WhatsApp Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Curated Quality Homes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="var(--color-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Private & Quiet Retreats</span>
                </div>
              </div>

              <Link to="/about" className="btn btn-secondary">
                <span>Learn More About Wagamon</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES SECTION */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            <div>
              <span className="section-tag">Exclusive Stays</span>
              <h2 className="section-title">Featured Holiday Villas</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                Handpicked highland homes offering unmatched views and comfortable modern amenities.
              </p>
            </div>
            <Link to="/properties" className="btn btn-secondary">
              <span>View All Properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Property Cards Grid */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : properties.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '2rem',
              }}
            >
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} featured />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Mountain size={44} color="var(--color-sage)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Properties Updating</h3>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                We are currently curating upcoming properties for the upcoming season. Feel free to contact our team for private availability.
              </p>
              <WhatsAppButton
                url="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20villa%20availability%20in%20Wagamon."
                label="Inquire via WhatsApp"
              />
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span className="section-tag">Distinctive Stays</span>
            <h2 className="section-title">Why Stay With Us in Wagamon</h2>
            <p className="section-subtitle">
              We prioritize privacy, authentic local hospitality, and direct communication without unnecessary reservation friction.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Card 1 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mountain size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                Secluded Highland Vistas
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                Every villa is chosen for its serene natural setting, offering unhindered valley perspectives, sunrise vistas, and whispering pine hills.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HeartHandshake size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                Direct Personal Hospitality
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                No impersonal reservation queues or automated bots. Speak directly with knowledgeable local caretakers and managers who care about your holiday experience.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                Verified Comfort & Amenities
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                Each property description, photo gallery, and facility list is individually inspected to ensure your stay matches the visual promise.
              </p>
            </div>

            {/* Card 4 */}
            <div
              className="luxury-card"
              style={{
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                Instant WhatsApp Booking
              </h3>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                Enquire in one tap with pre-filled property specifics. Receive swift responses, local travel guidance, and easy check-in coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXPERIENCE WAGAMON (Destination Highlights) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-dark)', color: '#FFFFFF' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span className="section-tag" style={{ color: 'var(--color-accent)' }}>
              Explore the Hills
            </span>
            <h2 className="section-title" style={{ color: '#FFFFFF' }}>
              The Wagamon Experience
            </h2>
            <p className="section-subtitle" style={{ color: 'var(--color-sage-light)' }}>
              From whispering pine forests to misty tea gardens, immerse yourself in one of Kerala’s most peaceful highland sanctuaries.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Wagamon Experience 1 */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border-dark)',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80"
                  alt="Pine Forest of Wagamon"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.75rem' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Wagamon Pine Forest
                </h3>
                <p style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Towering pine groves with peaceful shaded forest trails. Perfect for quiet morning walks, reading, or nature photography.
                </p>
              </div>
            </div>

            {/* Wagamon Experience 2 */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border-dark)',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
                  alt="Wagamon Tea Gardens"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.75rem' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Rolling Tea Plantations
                </h3>
                <p style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Kilometers of undulating green slopes enveloped in morning mist. Breathe fresh mountain air and enjoy local highland tea.
                </p>
              </div>
            </div>

            {/* Wagamon Experience 3 */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border-dark)',
              }}
            >
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                  alt="Kurisumala Meadows in Wagamon"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '1.75rem' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  Meadows & Valleys
                </h3>
                <p style={{ color: 'var(--color-sage-light)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Vast grassy hilltops offering panoramic views across the Western Ghats. Watch changing cloud patterns and breathtaking sunsets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT CTA SECTION */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(2.5rem, 6vw, 4.5rem)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Subtle decorative ring */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none',
              }}
            />

            <span
              style={{
                display: 'inline-block',
                textTransform: 'uppercase',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: 'var(--color-accent-light)',
                marginBottom: '1rem',
              }}
            >
              Plan Your Highland Getaway
            </span>
            <h2
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
                maxWidth: '680px',
                margin: '0 auto 1.25rem auto',
              }}
            >
              Ready to Discover Your Wagamon Sanctuary?
            </h2>
            <p
              style={{
                color: 'var(--color-sage-light)',
                fontSize: '1.1rem',
                maxWidth: '560px',
                margin: '0 auto 2.5rem auto',
                lineHeight: 1.6,
              }}
            >
              Reach out directly on WhatsApp to check seasonal availability, discuss villa options, and plan your relaxing retreat.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <WhatsAppButton
                url="https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20plan%20a%20stay%20in%20Wagamon.%20Could%20you%20share%20current%20availability%3F"
                label="Chat with Our Team on WhatsApp"
                size="lg"
              />
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                <span>View Contact Details</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
