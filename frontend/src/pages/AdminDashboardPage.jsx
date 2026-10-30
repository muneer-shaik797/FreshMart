import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, DollarSign, 
  AlertTriangle, Plus, Trash2, Edit, CheckCircle2, 
  RefreshCw, Search, Clock, ChevronDown, Bell, Eye, CreditCard, XCircle
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { productApi } from '../api/productApi';
import { couponApi } from '../api/couponApi';
import { paymentApi } from '../api/paymentApi';
import { wsService } from '../services/websocketService';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'inventory', 'payments', 'coupons'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Filter & Search states
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [inventorySearch, setInventorySearch] = useState('');

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Fresh Produce',
    price: 99,
    originalPrice: 120,
    unit: '1 kg',
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: '',
    isOrganic: true,
    isFeatured: false,
  });

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, prodsRes, coupRes] = await Promise.all([
        orderApi.getDashboardStats(),
        orderApi.getAllOrdersAdmin(),
        productApi.getProducts(),
        couponApi.getActiveCoupons(),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(prodsRes.data);
      setCoupons(coupRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to STOMP WebSocket for real-time order alerts!
    const sub = wsService.subscribeToAdminOrders((eventData) => {
      console.log('Real-time admin WebSocket order event:', eventData);
      setNewOrderAlert(`⚡ New activity on Order #${eventData.orderNumber}: ${eventData.status}`);
      // Refresh order table and metrics automatically
      fetchData();
      setTimeout(() => setNewOrderAlert(null), 7000);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateOrderStatus(orderId, {
        status: newStatus,
        description: `Order marked as ${newStatus} by Admin`,
      });
      setOrders(orders.map((o) => (o.id === orderId ? res.data : o)));
      // Refresh stats
      const statsRes = await orderApi.getDashboardStats();
      setStats(statsRes.data);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    const val = parseInt(newStock, 10);
    if (isNaN(val) || val < 0) return;
    try {
      const res = await productApi.adminUpdateStock(productId, val);
      setProducts(products.map((p) => (p.id === productId ? res.data : p)));
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await productApi.adminDeleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await productApi.adminAddProduct(newProd);
      setProducts([res.data, ...products]);
      setShowAddProductModal(false);
      setNewProd({
        name: '',
        category: 'Fresh Produce',
        price: 99,
        originalPrice: 120,
        unit: '1 kg',
        stockQuantity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        description: '',
        isOrganic: true,
        isFeatured: false,
      });
    } catch (err) {
      alert('Failed to create product: ' + err.message);
    }
  };

  const filteredOrders = orderStatusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === orderStatusFilter);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Real-time Order Alert Toast Banner */}
      {newOrderAlert && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'linear-gradient(135deg, #0284c7, #075985)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 9999,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <Bell size={18} className="animate-pulse-subtle" />
          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{newOrderAlert}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <LayoutDashboard size={18} />
            <span>Store Operations Hub</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.2rem' }}>FreshMart Admin Portal</h1>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="btn-emerald"
          style={{ padding: '0.7rem 1.3rem', fontSize: '0.92rem', gap: '0.4rem' }}
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metric Cards KPI Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{ background: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: '600' }}>
            <span>Total Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>
            ₹{stats?.totalRevenue?.toLocaleString() || '0'}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>✓ Verified Sales</span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: '600' }}>
            <span>Total Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {stats?.totalOrders || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across all customers</span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: '600' }}>
            <span>Catalog Products</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {stats?.totalProducts || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In 8 grocery categories</span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: '600' }}>
            <span>Low Stock Alerts</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: stats?.lowStockProducts > 0 ? '#d97706' : 'var(--text-main)', marginTop: '0.5rem' }}>
            {stats?.lowStockProducts || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: stats?.lowStockProducts > 0 ? '#b45309' : 'var(--text-muted)', fontWeight: '600' }}>
            {stats?.lowStockProducts > 0 ? 'Action required (≤ 10 items)' : 'Optimal inventory'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-strong)', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.4rem',
            fontWeight: '700',
            fontSize: '0.92rem',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'orders' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
          }}
        >
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.75rem 1.4rem',
            fontWeight: '700',
            fontSize: '0.92rem',
            color: activeTab === 'inventory' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'inventory' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
          }}
        >
          Inventory Management ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          style={{
            padding: '0.75rem 1.4rem',
            fontWeight: '700',
            fontSize: '0.92rem',
            color: activeTab === 'coupons' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'coupons' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
          }}
        >
          Promotional Coupons ({coupons.length})
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Status Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {['ALL', 'PLACED', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  background: orderStatusFilter === st ? 'var(--primary)' : '#ffffff',
                  color: orderStatusFilter === st ? '#ffffff' : 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Orders Table Card */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Order Number</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Items</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total (₹)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Delivery Slot</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Current Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Update Status (WebSocket)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      #{ord.orderNumber}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '600' }}>{ord.customerName}</div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{ord.customerPhone}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {ord.items.length} items
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>
                      ₹{ord.total}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {ord.deliverySlot?.type} • {ord.deliverySlot?.date}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge badge-status-${ord.status}`}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border-strong)',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          outline: 'none',
                          background: '#ffffff',
                        }}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKING">PACKING</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <a
                        href={`/track-order/${ord.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: 'var(--primary)',
                          fontWeight: '700',
                          fontSize: '0.82rem',
                        }}
                      >
                        <Eye size={14} /> Live View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory & Products Management */}
      {activeTab === 'inventory' && (
        <div>
          {/* Inventory search bar */}
          <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search products by title or department..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                outline: 'none',
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Price (₹)</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Unit</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Stock Count</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Availability</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '600' }}>{p.name}</div>
                          {p.isOrganic && <span className="badge badge-organic" style={{ fontSize: '0.65rem' }}>Organic</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--primary)', fontWeight: '600' }}>
                      {p.category}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '800' }}>
                      ₹{p.price}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {p.unit}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <input
                        type="number"
                        min="0"
                        defaultValue={p.stockQuantity}
                        onBlur={(e) => handleStockUpdate(p.id, e.target.value)}
                        style={{
                          width: '75px',
                          padding: '0.35rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: p.stockQuantity <= 10 ? '2px solid #f59e0b' : '1px solid var(--border-strong)',
                          fontWeight: '700',
                          textAlign: 'center',
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: p.inStock ? '#16a34a' : '#ef4444',
                        background: p.inStock ? '#dcfce7' : '#fee2e2',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        style={{ color: '#ef4444', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Coupons */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {coupons.map((c) => (
            <div key={c.id} style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px dashed var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  {c.code}
                </span>
                <span className="badge badge-cyan">Active</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{c.description}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <div>Min Order: <strong>₹{c.minOrderValue}</strong></div>
                <div>Max Discount: <strong>₹{c.maxDiscount}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Product */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowAddProductModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} />

          <div style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 10,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem' }}>Add New Grocery Product</h2>

            <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Seedless Watermelon"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Category *</label>
                <select
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem', background: '#fff' }}
                >
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Bakery & Bread">Bakery & Bread</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Pantry & Staples">Pantry & Staples</option>
                  <option value="Snacks & Confectionery">Snacks & Confectionery</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Organic & Health">Organic & Health</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Unit (e.g. 1 kg, 500g, 1L) *</label>
                <input
                  type="text"
                  required
                  value={newProd.unit}
                  onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Discounted Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Original MRP (₹)</label>
                <input
                  type="number"
                  value={newProd.originalPrice}
                  onChange={(e) => setNewProd({ ...newProd, originalPrice: parseFloat(e.target.value) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Initial Stock Quantity *</label>
                <input
                  type="number"
                  required
                  value={newProd.stockQuantity}
                  onChange={(e) => setNewProd({ ...newProd, stockQuantity: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Certified Organic?</label>
                <div style={{ marginTop: '0.4rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={newProd.isOrganic}
                      onChange={(e) => setNewProd({ ...newProd, isOrganic: e.target.checked })}
                    />
                    <span>Yes, 100% Organic</span>
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Image URL (Unsplash or direct URL) *</label>
                <input
                  type="url"
                  required
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Freshly sourced directly from organic farms..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', marginTop: '0.2rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="btn-secondary"
                  style={{ padding: '0.6rem 1.2rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald"
                  style={{ padding: '0.6rem 1.4rem' }}
                >
                  Add Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
