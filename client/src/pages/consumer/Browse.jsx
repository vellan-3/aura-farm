import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ProductCard from '../../components/consumer/ProductCard'

export default function Browse() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const query = new URLSearchParams()
        if (search) query.append('search', search)
        if (category) query.append('category', category)
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products?${query.toString()}`)
        const data = await res.json()
        if (Array.isArray(data)) setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [search, category])

  const mockProducts = [
    { id: 'm1', name: 'Roma Tomatoes', farmer: { farmName: 'Adeyemi Farms' }, region: 'Lagos', pricePerUnit: 380, unit: 'kg', qualityGrade: 'PREMIUM', stockQuantity: 42, trend: 'Below avg', trendClass: 'badge-trend-down', harvestDate: 'Harvest: 15 Feb' },
    { id: 'm2', name: 'White Maize', farmer: { farmName: 'Musa Grain Co' }, region: 'Kano', pricePerUnit: 650, unit: 'bag (50kg)', qualityGrade: 'STANDARD', stockQuantity: 200, trend: 'At avg', trendClass: 'badge-trend-neutral' },
    { id: 'm3', name: 'Pounded Yam Tubers', farmer: { farmName: 'Nwachukwu Roots' }, region: 'Enugu', pricePerUnit: 1200, unit: 'crate', qualityGrade: 'PREMIUM', stockQuantity: 85, trend: 'Above avg', trendClass: 'badge-trend-up' },
    { id: 'm4', name: 'Tatashe (Red Bell Pepper)', farmer: { farmName: 'Ojo Pepper Farm' }, region: 'Oyo', pricePerUnit: 290, unit: 'kg', qualityGrade: 'STANDARD', stockQuantity: 8, trend: 'Low stock', trendClass: 'badge-trend-down', harvestDate: 'Pre-order available' },
    { id: 'm5', name: 'Red Onions', farmer: { farmName: 'Lawal Onion Farm' }, region: 'Kebbi', pricePerUnit: 170, unit: 'kg', qualityGrade: 'BUDGET', stockQuantity: 500, trend: 'Below avg', trendClass: 'badge-trend-down' },
    { id: 'm6', name: 'Ugwu (Fluted Pumpkin)', farmer: { farmName: 'Emeka Veggies' }, region: 'Anambra', pricePerUnit: 120, unit: 'bunch', qualityGrade: 'PREMIUM', stockQuantity: 320, trend: 'In season', trendClass: 'badge-trend-up' },
  ]

  const displayedProducts = products.length > 0 ? products : mockProducts

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">Consumer view — browse</div>
        <h1 className="page-title">Fresh from Nigerian farms</h1>
        <p className="page-sub">Verified farmers · Direct pricing · Escrow-protected payments</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Active listings</div>
          <div className="stat-value">{user ? displayedProducts.length : '-'}</div>
          <div className="stat-delta">{user ? '↑ 12 new today' : '\u00A0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Verified farms</div>
          <div className="stat-value">{user ? '47' : '-'}</div>
          <div className="stat-delta">{user ? '↑ 3 this week' : '\u00A0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg tomato price</div>
          <div className="stat-value">{user ? '₦420' : '-'}</div>
          <div className="stat-delta down">{user ? '↓ ₦30 from last week' : '\u00A0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders placed today</div>
          <div className="stat-value">{user ? '61' : '-'}</div>
          <div className="stat-delta">{user ? '↑ 8% vs yesterday' : '\u00A0'}</div>
        </div>
      </div>

      <div className="browse-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="6"/><path d="M15 15l3 3"/></svg>
          <input 
            className="search-input" 
            type="text" 
            placeholder="Search tomatoes, yam, cassava…" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tab-group">
          <button onClick={() => setCategory('')} className={`filter-tab ${category === '' ? 'active' : ''}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`filter-tab capitalize ${category === c ? 'active' : ''}`}>
              {c.toLowerCase()}
            </button>
          ))}
        </div>
        <select className="sort-select form-input">
          <option>Sort: Newest</option>
          <option>Price: Low to high</option>
          <option>Price: High to low</option>
          <option>Best rated</option>
          <option>Near me</option>
        </select>
      </div>

      <div className="page-tabs">
        <div className="page-tab active">Products</div>
        <div className="page-tab">Farms</div>
        <div className="page-tab">Price charts</div>
        <div className="page-tab">Scarcity alerts</div>
      </div>

      {user && (
        <div className="section">
          <div style={{ paddingTop: '20px' }}>
            <div className="scarcity-banner">
              <span className="scarcity-icon">⚠️</span>
              <div>
                <strong>Seasonal scarcity alert:</strong> Tomatoes are approaching off-season (Apr–Jun). Prices may rise 25–40% over the next 6 weeks.
                <a href="#" style={{ color: 'var(--warning)', fontWeight: 500, marginLeft: '6px' }}>View price forecast →</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <div className="section-title">{displayedProducts.length} products available</div>
          <button className="btn btn-ghost btn-sm">Filter ↓</button>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>Loading products...</div>
        ) : (
          <div className="product-grid">
            {displayedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {/* DASHBOARD MOCK DATA - ONLY SHOW IF LOGGED IN */}
      {user && (
        <div className="two-col">
          <div className="two-col-main">
            
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Tomato price history — Lagos region</div>
                  <div className="price-compare" style={{ marginTop: '4px' }}>
                    Market avg this week: <strong>₦420/kg</strong>
                    <span style={{ color: 'var(--ink-muted)' }}>· Lowest: ₦310 · Highest: ₦580</span>
                  </div>
                </div>
                <div className="chart-tabs">
                  <button className="chart-tab active">30d</button>
                  <button className="chart-tab">90d</button>
                  <button className="chart-tab">1yr</button>
                </div>
              </div>
              <div className="chart-area">
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '55%'}}></div><div className="chart-bar-label">Jan 1</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '60%'}}></div><div className="chart-bar-label">Jan 5</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '52%'}}></div><div className="chart-bar-label">Jan 9</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '70%'}}></div><div className="chart-bar-label">Jan 13</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '65%'}}></div><div className="chart-bar-label">Jan 17</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '80%'}}></div><div className="chart-bar-label">Jan 21</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '75%'}}></div><div className="chart-bar-label">Jan 25</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '68%'}}></div><div className="chart-bar-label">Jan 29</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '72%'}}></div><div className="chart-bar-label">Feb 2</div></div>
                <div className="chart-bar-wrap"><div className="chart-bar" style={{height: '90%', opacity: 1}}></div><div className="chart-bar-label">Feb 6</div></div>
              </div>
              <div className="chart-legend">
                <div className="chart-legend-item"><div className="chart-legend-dot" style={{background: 'var(--accent)'}}></div>Aura Farm avg</div>
                <div className="chart-legend-item"><div className="chart-legend-dot" style={{background: 'var(--hairline-strong)'}}></div>National market index</div>
              </div>
            </div>

            <div>
              <div className="section-header" style={{ paddingTop: '8px' }}>
                <div className="section-title">My recent orders</div>
                <Link to="/orders" className="btn btn-ghost btn-sm">View all →</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Farm</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="order-id">#ORD-0041</span></td>
                      <td>Adeyemi Farms</td>
                      <td>Roma Tomatoes · 5kg</td>
                      <td className="amount">₦1,900</td>
                      <td><span className="status-pill status-dispatched"><span className="status-dot"></span>Dispatched</span></td>
                      <td><button className="btn btn-accent btn-sm">Confirm delivery</button></td>
                    </tr>
                    <tr>
                      <td><span className="order-id">#ORD-0038</span></td>
                      <td>Musa Grain Co</td>
                      <td>White Maize · 2 bags</td>
                      <td className="amount">₦1,300</td>
                      <td><span className="status-pill status-delivered"><span className="status-dot"></span>Delivered</span></td>
                      <td><button className="btn btn-secondary btn-sm">Rate order</button></td>
                    </tr>
                    <tr>
                      <td><span className="order-id">#ORD-0035</span></td>
                      <td>Emeka Veggies</td>
                      <td>Ugwu · 10 bunches</td>
                      <td className="amount">₦1,200</td>
                      <td><span className="status-pill status-delivered"><span className="status-dot"></span>Delivered</span></td>
                      <td><button className="btn btn-ghost btn-sm">Receipt</button></td>
                    </tr>
                    <tr>
                      <td><span className="order-id">#ORD-0031</span></td>
                      <td>Nwachukwu Roots</td>
                      <td>Yam Tubers · 3 crates</td>
                      <td className="amount">₦3,600</td>
                      <td><span className="status-pill status-confirmed"><span className="status-dot"></span>Confirmed</span></td>
                      <td><button className="btn btn-ghost btn-sm">Track</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="two-col-aside">
            <div className="farm-card">
              <div className="farm-avatar">🌱</div>
              <div className="farm-name">Adeyemi Farms</div>
              <div className="farm-location">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/></svg>
                Ikorodu, Lagos State
              </div>
              <div className="farm-meta-row">
                <div className="farm-meta-item">
                  <span className="farm-meta-label">Rating</span>
                  <span className="farm-meta-value">4.8 ★</span>
                </div>
                <div className="farm-meta-item">
                  <span className="farm-meta-label">Orders</span>
                  <span className="farm-meta-value">142</span>
                </div>
                <div className="farm-meta-item">
                  <span className="farm-meta-label">Products</span>
                  <span className="farm-meta-value">8</span>
                </div>
              </div>
              <div className="farm-bio">
                Family-run tomato and pepper farm operating since 2011. We grow without chemical pesticides and harvest twice per season.
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="kyc-badge">
                  <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M8.6 14.6L4 10l1.4-1.4 3.2 3.2 6.8-6.8L16.8 6.4z"/></svg>
                  KYC Verified
                </span>
                <div className="zone-tags">
                  <span className="zone-tag">Lagos <span className="zone-cost">₦500</span></span>
                  <span className="zone-tag">Ogun <span className="zone-cost">₦800</span></span>
                </div>
              </div>
            </div>

            <div>
              <div className="section-header" style={{ paddingTop: 0, marginBottom: '12px' }}>
                <div className="section-title">Notifications</div>
                <button className="btn btn-ghost btn-sm">Mark all read</button>
              </div>
              <div className="notif-list">
                <div className="notif-item unread">
                  <div className="notif-dot"></div>
                  <div className="notif-body">
                    <div className="notif-text"><strong>Order #ORD-0041</strong> has been dispatched by Adeyemi Farms. Expected delivery today.</div>
                    <div className="notif-time">2 minutes ago</div>
                  </div>
                </div>
                <div className="notif-item unread">
                  <div className="notif-dot"></div>
                  <div className="notif-body">
                    <div className="notif-text"><strong>Price alert:</strong> Tomato prices in Lagos are 18% below the national average this week.</div>
                    <div className="notif-time">1 hour ago</div>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-dot read"></div>
                  <div className="notif-body">
                    <div className="notif-text">Your weekly subscription to <strong>Ugwu bunches</strong> from Emeka Veggies is ready to renew.</div>
                    <div className="notif-time">Yesterday, 9:14am</div>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-dot read"></div>
                  <div className="notif-body">
                    <div className="notif-text"><strong>KYC approved:</strong> Lawal Onion Farm is now a verified seller on Aura Farm.</div>
                    <div className="notif-time">2 days ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
