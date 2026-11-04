import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, Home as HomeIcon, Filter, X } from 'lucide-react';
import { propertyApi } from '../api/propertyApi';
import { categoryApi } from '../api/categoryApi';
import { PublicPropertyDto } from '../types/property';
import { PublicStayCategoryDto } from '../types/category';
import { PropertyCard } from '../components/properties/PropertyCard';
import { PropertyCardSkeleton } from '../components/ui/Skeleton';
import { PageHeader } from '../components/layout/PageHeader';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';

export const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<PublicPropertyDto[]>([]);
  const [categories, setCategories] = useState<PublicStayCategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestFilter, setSelectedGuestFilter] = useState<'all' | '2' | '4' | '6+'>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [propsData, catsData] = await Promise.all([
        propertyApi.getProperties(),
        categoryApi.getCategories().catch(() => [] as PublicStayCategoryDto[]),
      ]);
      setProperties(propsData);
      setCategories(catsData);
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
    fetchData();
  }, []);

  // Filter properties by search query (name or location), category, and guest capacity
  const filteredProperties = properties.filter((property) => {
    // Category match
    if (selectedCategory !== 'all') {
      const matchCat =
        property.categorySlug?.toLowerCase() === selectedCategory.toLowerCase() ||
        property.categoryId === selectedCategory;
      if (!matchCat) return false;
    }

    // Search query match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      property.name.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query) ||
      property.description.toLowerCase().includes(query) ||
      (property.categoryName && property.categoryName.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Guest filter
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

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedGuestFilter('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery.trim() !== '' || selectedGuestFilter !== 'all';

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
          {/* Stay Category Filter Pills */}
          {categories.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-text-muted)',
                    marginRight: '0.4rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Filter size={14} /> Category:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '0.55rem 1.2rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: selectedCategory === 'all' ? 'var(--color-primary-dark)' : 'var(--color-border)',
                    backgroundColor: selectedCategory === 'all' ? 'var(--color-primary-dark)' : '#FFFFFF',
                    color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--color-text)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  All Stays ({properties.length})
                </button>
                {categories.map((cat) => {
                  const count = properties.filter(
                    (p) => p.categorySlug?.toLowerCase() === cat.slug.toLowerCase() || p.categoryId === cat.id
                  ).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      style={{
                        padding: '0.55rem 1.2rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: selectedCategory === cat.slug ? 'var(--color-primary-dark)' : 'var(--color-border)',
                        backgroundColor: selectedCategory === cat.slug ? 'var(--color-primary-dark)' : '#FFFFFF',
                        color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--color-text)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat.name} {count > 0 ? `(${count})` : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Guest Filter Bar */}
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
                maxWidth: '480px',
              }}
            >
              <Search size={18} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search by name, location, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.95rem',
                  color: 'var(--color-text)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Guest Capacity Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Guests:
              </span>
              {(['all', '2', '4', '6+'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedGuestFilter(filter)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor:
                      selectedGuestFilter === filter ? 'var(--color-primary-dark)' : 'var(--color-border)',
                    backgroundColor:
                      selectedGuestFilter === filter ? 'var(--color-primary-dark)' : 'var(--color-bg-card)',
                    color: selectedGuestFilter === filter ? '#FFFFFF' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {filter === 'all' ? 'Any' : `${filter} Guests`}
                </button>
              ))}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: '1px dashed #ef4444',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
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
              <button onClick={fetchData} className="btn btn-primary btn-sm">
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && filteredProperties.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                  Showing <strong style={{ color: 'var(--color-primary-dark)' }}>{filteredProperties.length}</strong> available properties
                  {selectedCategory !== 'all' && (
                    <span> in <em>{categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</em></span>
                  )}
                </p>
              </div>

              <div className="grid grid-3">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProperties.length === 0 && (
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
                <HomeIcon size={28} />
              </div>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>No Properties Found</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {hasActiveFilters
                  ? 'No stays matched your selected category and filters. Try clearing or expanding your criteria.'
                  : 'We currently do not have active listings published. Reach out to our concierge for custom recommendations.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary btn-sm"
                  style={{ margin: '0 auto' }}
                >
                  Reset All Filters
                </button>
              ) : (
                <WhatsAppButton label="Enquire Directly" />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
