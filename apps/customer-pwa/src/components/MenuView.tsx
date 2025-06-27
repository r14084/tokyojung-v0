import { useState, useEffect } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { type MenuItem, menuApi } from '../api/client'

interface MenuViewProps {
  onAddToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void
  onProceedToCart: () => void
  cartItemsCount: number
}

export function MenuView({ onAddToCart, onProceedToCart, cartItemsCount }: MenuViewProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true)
        console.log('🔄 กำลังโหลดเมนู...')
        console.log('API URL:', import.meta.env.VITE_API_URL)
        const items = await menuApi.getAll()
        console.log('📋 เมนูที่ได้รับ:', items)
        setMenuItems(items)
        setError(null)
      } catch (err) {
        console.error('❌ ไม่สามารถโหลดเมนูได้:', err)
        setError('ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  if (loading) {
    return (
      <div className="menu-view">
        <div className="menu-header">
          <h2>🍽️ เมนูของเรา</h2>
          <p>กำลังโหลดเมนู...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="menu-view">
        <div className="menu-header">
          <h2>🍽️ เมนูของเรา</h2>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    )
  }

  const kanomItems = menuItems.filter(item => item.category === 'KANOM') || []
  const drinkItems = menuItems.filter(item => item.category === 'DRINK') || []

  return (
    <div className="menu-view">
      <div className="menu-header">
        <h2>🍽️ เมนูของเรา</h2>
        <p>เลือกขนมครกและเครื่องดื่มที่คุณชอบ</p>
      </div>

      {/* Kanom Section */}
      <section className="menu-section">
        <h3 className="section-title">🥞 ขนมครก (Kanom Krok)</h3>
        <div className="menu-grid">
          {kanomItems.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Drinks Section */}
      <section className="menu-section">
        <h3 className="section-title">🥤 เครื่องดื่ม (Drinks)</h3>
        <div className="menu-grid">
          {drinkItems.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Cart Button */}
      {cartItemsCount > 0 && (
        <div className="cart-button-container">
          <button 
            className="cart-button"
            onClick={onProceedToCart}
          >
            <ShoppingCart size={20} />
            <span>ดูตะกร้า ({cartItemsCount} รายการ)</span>
          </button>
        </div>
      )}
    </div>
  )
}

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void
}

function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const handleAddToCart = () => {
    onAddToCart(item, 1)
  }

  return (
    <div className="menu-item-card">
      <div className="item-image">
        {item.category === 'KANOM' ? '🥞' : '🥤'}
      </div>
      
      <div className="item-content">
        <h4 className="item-name">{item.name}</h4>
        {item.nameEn && (
          <p className="item-name-en">{item.nameEn}</p>
        )}
        {item.description && (
          <p className="item-description">{item.description}</p>
        )}
        
        <div className="item-footer">
          <span className="item-price">฿{Number(item.price).toFixed(0)}</span>
          <button 
            className="add-button"
            onClick={handleAddToCart}
            disabled={!item.available}
          >
            <Plus size={16} />
            {item.available ? 'เพิ่ม' : 'หมด'}
          </button>
        </div>
      </div>
      
      {!item.available && (
        <div className="item-unavailable">หมด</div>
      )}
    </div>
  )
}