import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, Home as HomeIcon } from 'lucide-react';
import { propertyApi } from '../api/propertyApi';
import { PublicPropertyDto } from '../types/property';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import { PageHeader } from '../components/layout/PageHeader';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

export const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<PublicPropertyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestFilter, setSelectedGuestFilter] = useState<'all' | '2' | '4' | '6+'>('all');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyApi.getProperties();
      setProperties(data);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(
        'Unable to reach our property servers right now. If the backend is waking up from idle, please retry in a moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Properties & Private Villas — Wagamon Booking';
    fetchProperties();
  }, []);

  // Filter properties by search query (name or location) and guest capacity
  const filteredProperties = properties.filter((property) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      property.name.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query) ||
      property.description.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedGuestFilter === '2') {
      return (property.maxGuests || 0) >= 2;
    }
    if (selectedGuestFilter === '4') {
      return (property.maxGuests || 0) >= 4;
    }
    if (selectedGuestFilter === '6+') {
      return (property.maxGuests || 0) >= 6;
    }

    return true;
  });

  return (
    <div>
      {/* Page Hero Header */}
      <PageHeader
        tag="Exclusive Listings"
        title="Boutique Villas & Hillside Stays"
        description="Browse our handpicked collection of tranquil holiday homes, private cottages, and panoramic view villas in Wagamon, Kerala."
        backgroundImage="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80"
      />

      {/* Main Content Area */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          {/* Search & Filter Bar */}
          <div
            className="glass-surface"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '3rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.65rem 1.25rem',
                flex: '1 1 280px',
                maxWidth: '420px',
              }}
            >
              <Search size={18} color="var(--color-sage-dark)" />
              <input
                type="text"
                placeholder="Search by villa name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.92rem',
                  color: 'var(--color-text-main)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Guest Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
                Capacity:
              </span>
              {(['all', '2', '4', '6+'] as const).map((filter) => {
                const label = filter === 'all' ? 'All Stays' : filter === '6+' ? '6+ Guests' : `${filter}+ Guests`;
                const isActive = selectedGuestFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedGuestFilter(filter)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-card)',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listings State Views */}
          {loading ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                <RefreshCw size={20} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                <span>Loading available properties from Wagamon...</span>
              </div>
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
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </div>
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <AlertCircle size={44} color="#D97706" style={{ margin: '0 auto 1.25rem auto' }} />
              <h3 style={{ marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>Connecting to Server</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                {error}
              </p>
              <button onClick={fetchProperties} className="btn btn-primary">
                <RefreshCw size={16} />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredProperties.length > 0 ? (
            <>
              {/* Properties Count */}
              <div style={{ marginBottom: '1.75rem', fontSize: '0.92rem', color: 'var(--color-text-muted)' }}>
                Showing <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'retreat' : 'retreats'} in Wagamon
              </div>

              {/* Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '2.25rem',
                }}
              >
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '4.5rem 2rem',
                backgroundColor: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <HomeIcon size={44} color="var(--color-sage)" style={{ margin: '0 auto 1.25rem auto' }} />
              <h3 style={{ marginBottom: '0.75rem' }}>No Properties Matched</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                We couldn't find any stays matching "{searchQuery}". Try adjusting your search term or guest filter.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGuestFilter('all');
                  }}
                  className="btn btn-secondary"
                >
                  Reset Filters
                </button>
                <WhatsAppButton
                  url="https://wa.me/919876543210?text=Hi%2C%20I%20am%20looking%20for%20a%20specific%20villa%20in%20Wagamon."
                  label="Enquire Directly"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
