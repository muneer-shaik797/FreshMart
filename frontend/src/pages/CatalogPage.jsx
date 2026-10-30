import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, X, Leaf, CheckCircle2 } from 'lucide-react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'ALL';
  const searchTerm = searchParams.get('search') || '';
  const organicOnly = searchParams.get('organic') === 'true';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const sortBy = searchParams.get('sortBy') || '';

  useEffect(() => {
    productApi.getCategories().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: searchTerm || undefined,
          organic: organicOnly ? true : undefined,
          inStockOnly: inStockOnly ? true : undefined,
          sortBy: sortBy || undefined,
        };
        const res = await productApi.getProducts(params);
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, [selectedCategory, searchTerm, organicOnly, inStockOnly, sortBy]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' || value === 'ALL') {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || !!searchTerm || organicOnly || inStockOnly || !!sortBy;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
          {selectedCategory !== 'ALL' ? selectedCategory : searchTerm ? `Results for "${searchTerm}"` : 'All Fresh Groceries'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Explore our wide selection of crisp organic vegetables, fresh fruits, and daily kitchen essentials.
        </p>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }} className="catalog-grid-layout">
        {/* Sidebar Filters */}
        <aside style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-subtle)', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1rem' }}>
              <Filter size={18} color="var(--primary)" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: '700' }}
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => updateParam('category', 'ALL')}
                style={{
                  textAlign: 'left',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  fontWeight: selectedCategory === 'ALL' ? '700' : '500',
                  background: selectedCategory === 'ALL' ? 'var(--primary-light)' : 'transparent',
                  color: selectedCategory === 'ALL' ? 'var(--primary-dark)' : 'var(--text-main)',
                  transition: 'var(--transition-fast)'
                }}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => updateParam('category', cat)}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    fontWeight: selectedCategory === cat ? '700' : '500',
                    background: selectedCategory === cat ? 'var(--primary-light)' : 'transparent',
                    color: selectedCategory === cat ? 'var(--primary-dark)' : 'var(--text-main)',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary & Stock Toggles */}
          <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.86rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              Preferences
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => updateParam('organic', e.target.checked ? 'true' : '')}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-emerald)' }}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Leaf size={14} color="#16a34a" /> 100% Organic Only
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Catalog Results */}
        <main>
          {/* Top Sort and Metrics Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong> fresh products
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-strong)',
                  background: '#ffffff',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  outline: 'none'
                }}
              >
                <option value="">Featured / Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="discount">Highest Discount %</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Loading farm fresh groceries...
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥗</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>No matching products found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Try adjusting your search keywords or removing applied filters.
              </p>
              <button onClick={handleClearAll} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
