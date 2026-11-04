import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';

export const ContactPage: React.FC = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryDates, setInquiryDates] = useState('');
  const [inquiryGuests, setInquiryGuests] = useState('2');
  const [inquiryMessage, setInquiryMessage] = useState('');

  useEffect(() => {
    document.title = 'Contact & Location — Wagamon Booking';
    window.scrollTo(0, 0);
  }, []);

  // Generates custom WhatsApp message from input fields
  const getCustomWhatsAppUrl = () => {
    const text = `Hi Wagamon Booking! My name is ${inquiryName || 'a guest'}. I am planning to visit Wagamon around ${inquiryDates || 'upcoming dates'} for ${inquiryGuests} guests. ${inquiryMessage ? 'Note: ' + inquiryMessage : ''}`;
    return `https://wa.me/917034749777?text=${encodeURIComponent(text)}`;
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Page Header */}
      <PageHeader
        tag="Get in Touch"
        title="We are Here to Welcome You"
        description="Have questions about villa availability, directions to Wagamon, or special stay requests? Reach out directly to our hosting team."
        backgroundImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
      />

      <section className="section-padding">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'clamp(2rem, 5vw, 4.5rem)',
              alignItems: 'start',
            }}
          >
            {/* Left: Contact Info & Location Guidelines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div>
                <span className="section-tag">Direct Hospitality</span>
                <h2 className="section-title">Reach Out to Our Team</h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                  We prioritize direct communication via WhatsApp and phone call for fast, personalized assistance.
                </p>

                {/* Contact Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* WhatsApp */}
                  <div
                    className="luxury-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#E8FBF0',
                        color: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <MessageCircle size={24} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-light)' }}>
                        Instant Chat (Fastest Response)
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                        WhatsApp Direct Line
                      </div>
                    </div>
                    <a
                      href="https://wa.me/917034749777?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20villa%20availability%20in%20Wagamon."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                    >
                      Chat Now
                    </a>
                  </div>

                  {/* Phone */}
                  <div
                    className="luxury-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-soft)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-light)' }}>
                        Call Us Directly
                      </div>
                      <a
                        href="tel:+917034749777"
                        style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-dark)', textDecoration: 'none' }}
                      >
                        +91 70347 49777
                      </a>
                    </div>
                  </div>

                  {/* Location Address */}
                  <div
                    className="luxury-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1.25rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-soft)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <MapPin size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-light)' }}>
                        Resort Location
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
                        Wagamon, Idukki District, Kerala
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                        PIN: 685503 — Nestled among tea estates and pine groves.
                      </div>
                      <a
                        href="https://maps.google.com/?q=Wagamon+Kerala"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                        }}
                      >
                        <span>Open Wagamon on Google Maps</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive WhatsApp Enquiry Builder */}
            <div>
              <div
                className="luxury-card"
                style={{
                  padding: '2.5rem',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Compass size={18} color="var(--color-accent-dark)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-dark)' }}>
                    Quick Enquiry
                  </span>
                </div>

                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
                  Send a Quick Stay Enquiry
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '2rem' }}>
                  Fill in your travel preferences and click to open a pre-filled WhatsApp conversation with our team.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.open(getCustomWhatsAppUrl(), '_blank');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Anandhu"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                        Approximate Dates
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Next Weekend"
                        value={inquiryDates}
                        onChange={(e) => setInquiryDates(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg)',
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                        Number of Guests
                      </label>
                      <select
                        value={inquiryGuests}
                        onChange={(e) => setInquiryGuests(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg)',
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      >
                        <option value="1-2">1 - 2 Guests (Couple)</option>
                        <option value="3-4">3 - 4 Guests (Small Family)</option>
                        <option value="5-8">5 - 8 Guests (Family Group)</option>
                        <option value="9+">9+ Guests (Large Group)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--color-primary-dark)' }}>
                      Special Requests / Preferred Villa
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Looking for a quiet mountain view villa with balcony..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-whatsapp btn-lg"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    <MessageCircle size={20} />
                    <span>Send via WhatsApp</span>
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Opens WhatsApp web or mobile app directly.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
