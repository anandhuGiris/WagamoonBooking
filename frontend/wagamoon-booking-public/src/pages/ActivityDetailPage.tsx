import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Compass,
  ChevronRight,
  ShieldCheck,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { activityApi } from '../api/activityApi';
import { PublicActivityDto } from '../types/activity';
import { ImageGallery } from '../components/properties/ImageGallery';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { Skeleton } from '../components/ui/Skeleton';

export const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<PublicActivityDto | null>(null);
  const [relatedActivities, setRelatedActivities] = useState<PublicActivityDto[]>([]);
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

        const data = await activityApi.getActivityById(id);
        setActivity(data);
        document.title = `${data.name} — Wagamon Adventure Tours`;

        try {
          const all = await activityApi.getActivities();
          const others = all.filter((a) => a.id !== id).slice(0, 2);
          setRelatedActivities(others);
        } catch {
          // Non-critical
        }
      } catch (err: any) {
        console.error('Failed to load activity details:', err);
        setError(err.message || 'Activity not found or is currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activity?.name,
        text: `Check out ${activity?.name} in Wagamon`,
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

  if (error || !activity) {
    return (
      <div className="section-padding" style={{ backgroundColor: 'var(--color-bg)', minHeight: '70vh' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '540px', margin: '4rem auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Activity Unavailable</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            {error || 'This activity is not currently listed or has been modified.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/activities" className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>All Activities</span>
            </Link>
            <WhatsAppButton label="Ask Concierge" />
          </div>
        </div>
      </div>
    );
  }

  const imagesForGallery = activity.images.map((img) => ({
    url: img.url,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  }));

  const bookingMessage = `Hi, I'm interested in booking the ${activity.name} activity in Wagamon. Could you please share available slots and group details?`;
  const bookingUrl =
    activity.whatsAppUrl ||
    `https://wa.me/917034749777?text=${encodeURIComponent(bookingMessage)}`;

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg)' }}>
        <div className="container" style={{ padding: '1rem 1.5rem' }}>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={14} />
            <Link to="/activities" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              Activities
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>{activity.name}</span>
          </nav>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        {/* Title Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-sage-light)',
                color: 'var(--color-primary-dark)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Compass size={12} />
              <span>Adventure Experience</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.85rem)', marginBottom: '0.65rem' }}>
              {activity.name}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                color: 'var(--color-text-muted)',
                fontSize: '0.92rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--color-accent-dark)" />
                <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>{activity.location}</span>
              </div>
              {activity.duration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} color="var(--color-sage-dark)" />
                  <span>Duration: <strong>{activity.duration}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Share Action */}
          <div>
            <button
              onClick={handleShare}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Share2 size={15} />
              <span>{copiedLink ? 'Link Copied!' : 'Share Activity'}</span>
            </button>
          </div>
        </div>

        {/* Interactive Photo Gallery */}
        <div style={{ marginBottom: '3.5rem' }}>
          <ImageGallery images={imagesForGallery} propertyName={activity.name} />
        </div>

        {/* Content & Booking Split */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)',
            gap: '3.5rem',
            alignItems: 'start',
          }}
          className="activity-detail-grid"
        >
          {/* Left Column: Full Description & Highlights */}
          <div>
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>About this Adventure</h2>
              <div
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: 'var(--color-text)',
                  whiteSpace: 'pre-line',
                }}
              >
                {activity.description}
              </div>
            </div>

            {/* Experience Guidelines & Features */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                marginBottom: '3rem',
              }}
            >
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--color-accent-dark)" />
                Experience Highlights & Preparation
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="var(--color-sage-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Experienced Guidance:</strong> Led by local nature specialists familiar with terrain and weather.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="var(--color-sage-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Safety Equipment:</strong> All required safety harnesses, life jackets, or protective gear provided.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="var(--color-sage-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Recommended Attire:</strong> Comfortable outdoor clothing, sturdy footwear, and a light windcheater.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="var(--color-sage-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Flexible Scheduling:</strong> Morning and afternoon departure slots available based on mist conditions.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sticky WhatsApp Booking Card */}
          <aside style={{ position: 'sticky', top: '100px' }}>
            <div
              className="glass-surface"
              style={{
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Expedition Rate
                </span>
                <div style={{ marginTop: '0.25rem' }}>
                  {activity.price ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                        ₹{activity.price.toLocaleString('en-IN')}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>/ per participant</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      Enquire for Custom Pricing
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Info Box */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>Location</span>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>{activity.location}</strong>
                </div>
                {activity.duration && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>Estimated Duration</span>
                    <strong style={{ color: 'var(--color-primary-dark)' }}>{activity.duration}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>Confirmation</span>
                  <strong style={{ color: 'var(--color-primary-dark)' }}>Instant via WhatsApp</strong>
                </div>
              </div>

              {/* Booking CTA Button */}
              <WhatsAppButton
                url={bookingUrl}
                label="Book on WhatsApp"
                size="lg"
                style={{ width: '100%', marginBottom: '1rem' }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginTop: '1.25rem',
                  padding: '0.85rem',
                  backgroundColor: 'var(--color-sage-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  color: 'var(--color-primary-dark)',
                }}
              >
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>Direct coordination with certified local tour guides. No advance payment required for inquiry.</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Other Adventure Suggestions */}
        {relatedActivities.length > 0 && (
          <div style={{ marginTop: '5rem', paddingTop: '3.5rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
              <div>
                <span className="tagline">Explore More</span>
                <h2 style={{ fontSize: '2rem' }}>Other Wagamon Adventures</h2>
              </div>
              <Link to="/activities" className="btn btn-secondary btn-sm">
                View All Adventures
              </Link>
            </div>

            <div className="grid grid-2">
              {relatedActivities.map((rel) => {
                const cover = rel.images[0]?.url || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80';
                return (
                  <div key={rel.id} className="luxury-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <Link to={`/activities/${rel.id}`} style={{ height: '220px', overflow: 'hidden', display: 'block' }}>
                      <img src={cover} alt={rel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Link>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
                        <Link to={`/activities/${rel.id}`} style={{ textDecoration: 'none', color: 'var(--color-primary-dark)' }}>
                          {rel.name}
                        </Link>
                      </h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', flexGrow: 1 }}>
                        {rel.location} {rel.duration ? `• ${rel.duration}` : ''}
                      </p>
                      <Link to={`/activities/${rel.id}`} className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                        Explore Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .activity-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
