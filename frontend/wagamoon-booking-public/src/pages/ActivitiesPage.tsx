import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Compass, RefreshCw, AlertCircle, Camera } from 'lucide-react';
import { activityApi } from '../api/activityApi';
import { PublicActivityDto } from '../types/activity';
import { PageHeader } from '../components/layout/PageHeader';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { getPropertyFallbackImage } from '../utils/imageHelper';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<PublicActivityDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityApi.getActivities();
      setActivities(data);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError('Unable to load activities at this moment. Please retry in a few moments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Wagamon Adventure Tours & Outdoor Activities — Wagamon Booking';
    fetchActivities();
  }, []);

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        tag="Western Ghats Expeditions"
        title="Wagamon Adventure Activities"
        description="Immerse yourself in nature with guided pine forest treks, 4x4 rugged jeep safaris, serene lake kayaking, and high-range outdoor experiences."
        backgroundImage="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=80"
      />

      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '3rem',
              }}
            >
              <AlertCircle size={36} color="#D97706" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#92400E', marginBottom: '0.5rem' }}>
                Service Temporarily Sleeping
              </h3>
              <p style={{ color: '#78350F', maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
                {error}
              </p>
              <button onClick={fetchActivities} className="btn btn-primary btn-sm">
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="luxury-card"
                  style={{ height: '420px', backgroundColor: '#F0ECE1', animation: 'shimmer 1.5s infinite' }}
                />
              ))}
            </div>
          )}

          {/* Activities Grid */}
          {!loading && !error && activities.length > 0 && (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  Showing <strong style={{ color: 'var(--color-primary-dark)' }}>{activities.length}</strong> outdoor adventures and experiences
                </p>
              </div>

              <div className="grid grid-3">
                {activities.map((act) => {
                  const primaryImage =
                    act.images.find((img) => img.isPrimary)?.url ||
                    act.images[0]?.url ||
                    getPropertyFallbackImage(act.name);

                  const imageCount = act.images.length;

                  return (
                    <article
                      key={act.id}
                      className="luxury-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                      }}
                    >
                      {/* Cover Photo */}
                      <Link
                        to={`/activities/${act.id}`}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '240px',
                          overflow: 'hidden',
                          backgroundColor: '#EBE7DE',
                          display: 'block',
                        }}
                      >
                        <img
                          src={primaryImage}
                          alt={act.name}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform var(--transition-slow)',
                          }}
                          className="activity-card-img"
                        />

                        {/* Location Tag */}
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
                          <span>{act.location}</span>
                        </div>

                        {/* Photo Count */}
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
                      </Link>

                      {/* Content Body */}
                      <div
                        style={{
                          padding: '1.6rem',
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: 1,
                        }}
                      >
                        {/* Specs Strip */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                            fontSize: '0.82rem',
                            color: 'var(--color-text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {act.duration && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={14} color="var(--color-sage-dark)" />
                              <span>{act.duration}</span>
                            </div>
                          )}
                          {act.price ? (
                            <span style={{ color: 'var(--color-primary-dark)', fontWeight: 800, fontSize: '0.95rem' }}>
                              ₹{act.price.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Enquire for rates</span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.65rem' }}>
                          <Link
                            to={`/activities/${act.id}`}
                            style={{
                              color: 'var(--color-primary-dark)',
                              textDecoration: 'none',
                              transition: 'color var(--transition-fast)',
                            }}
                            className="activity-title-link"
                          >
                            {act.name}
                          </Link>
                        </h3>

                        <p
                          style={{
                            fontSize: '0.92rem',
                            color: 'var(--color-text-muted)',
                            lineHeight: 1.55,
                            marginBottom: '1.5rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {act.description}
                        </p>

                        {/* Actions */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid var(--color-border-subtle)',
                            marginTop: 'auto',
                          }}
                        >
                          <Link
                            to={`/activities/${act.id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                          >
                            <span>Details</span>
                            <ArrowRight size={14} />
                          </Link>
                          <WhatsAppButton
                            url={
                              act.whatsAppUrl ||
                              `https://wa.me/917034749777?text=${encodeURIComponent(
                                `Hi, I'm interested in booking the ${act.name} activity in Wagamon.`
                              )}`
                            }
                            label="Book Tour"
                            size="sm"
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>

                      <style>{`
                        .luxury-card:hover .activity-card-img {
                          transform: scale(1.05);
                        }
                        .activity-title-link:hover {
                          color: var(--color-primary-light);
                        }
                      `}</style>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && activities.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 1rem',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-sage-light)',
                  color: 'var(--color-primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <Compass size={28} />
              </div>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>No Activities Published Yet</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                We are curating exciting high-range adventure tours. Contact our concierge to arrange custom Wagamon jeep safaris and trekking.
              </p>
              <WhatsAppButton label="Enquire with Concierge" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

