import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function FarmerProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'VEGETABLES',
    unit: 'KG',
    pricePerUnit: '',
    stockQty: '',
    minOrderQty: '1',
    qualityGrade: 'STANDARD',
    isColdChain: false
  })

  useEffect(() => {
    if (isEditing) {
      fetch(`${import.meta.env.VITE_API_URL}/farmer/products/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => setFormData(data))
        .catch(console.error)
    }
  }, [id, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      ...formData,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      stockQty: parseFloat(formData.stockQty),
      minOrderQty: parseFloat(formData.minOrderQty)
    }

    const url = `${import.meta.env.VITE_API_URL}/farmer/products${isEditing ? `/${id}` : ''}`
    const method = isEditing ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        navigate('/farmer/products')
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save product')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink)]">{isEditing ? 'Edit Listing' : 'Create Product Listing'}</h1>
        <button onClick={() => navigate('/farmer/products')} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--surface-1)] border border-[var(--hairline)] rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Product Name</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2" placeholder="e.g. Roma Tomatoes" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Category</label>
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2">
            {['VEGETABLES', 'FRUITS', 'GRAINS', 'TUBERS', 'LIVESTOCK', 'DAIRY', 'POULTRY'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Price per Unit (₦)</label>
          <input required type="number" step="0.01" value={formData.pricePerUnit} onChange={e => setFormData({...formData, pricePerUnit: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2" placeholder="0.00" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Unit Type</label>
          <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2">
            {['KG', 'GRAM', 'CRATE', 'BAG', 'BUNCH', 'BASKET', 'LITRE'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Available Stock Qty</label>
          <input required type="number" step="0.01" value={formData.stockQty} onChange={e => setFormData({...formData, stockQty: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2" placeholder="e.g. 200" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Quality Grade</label>
          <select value={formData.qualityGrade} onChange={e => setFormData({...formData, qualityGrade: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2">
            <option value="PREMIUM">Premium</option>
            <option value="STANDARD">Standard</option>
            <option value="BUDGET">Budget</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-mono text-xs text-[var(--ink-muted)]">Description</label>
          <textarea rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="border border-[var(--hairline)] rounded bg-[var(--canvas)] p-2" placeholder="Describe your product..."></textarea>
        </div>

        <div className="flex items-center gap-2 md:col-span-2 mt-2">
          <input type="checkbox" id="coldChain" checked={formData.isColdChain} onChange={e => setFormData({...formData, isColdChain: e.target.checked})} />
          <label htmlFor="coldChain" className="text-sm">Requires Cold Chain (Refrigerated) Delivery</label>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
          <button type="button" onClick={() => navigate('/farmer/products')} className="px-4 py-2 bg-[var(--surface-2)] border border-[var(--hairline)] rounded font-medium">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded font-medium">{isEditing ? 'Save Changes' : 'Publish Listing'}</button>
        </div>
      </form>
    </div>
  )
}
