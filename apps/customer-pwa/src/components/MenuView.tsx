import { Plus, ShoppingCart } from 'lucide-react'
import { type MenuItem } from '../api/client'

interface MenuViewProps {
  onAddToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void
  onProceedToCart: () => void
  cartItemsCount: number
}

export function MenuView({ onAddToCart, onProceedToCart, cartItemsCount }: MenuViewProps) {
  // Temporary static data for demo (until API is connected)
  const demoMenuItems: MenuItem[] = [
    {
      id: 1,
      name: 'ขนมครกหวาน',
      nameEn: 'Sweet Kanom Krok',
      description: 'ขนมครกแบบดั้งเดิม หวานหอม กรอบนอกนุ่มใน',
      price: 35,
      category: 'KANOM',
      available: true
    },
    {
      id: 2,
      name: 'ขนมครกเค็ม',
      nameEn: 'Savory Kanom Krok',
      description: 'ขนมครกใส่หอมใหญ่และใบโหระพา รสเค็มกำลังดี',
      price: 40,
      category: 'KANOM',
      available: true
    },
    {
      id: 3,
      name: 'ชาไทย',
      nameEn: 'Thai Tea',
      description: 'ชาไทยเข้มข้น หวานมัน เย็นชื่นใจ',
      price: 25,
      category: 'DRINK',
      available: true
    },
    {
      id: 4,
      name: 'กาแฟโบราณ',
      nameEn: 'Traditional Coffee',
      description: 'กาแฟโบราณชงสด หอมกรุ่น รสชาติเข้มข้น',
      price: 30,
      category: 'DRINK',
      available: true
    }
  ]

  const kanomItems = demoMenuItems.filter(item => item.category === 'KANOM') || []
  const drinkItems = demoMenuItems.filter(item => item.category === 'DRINK') || []

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
        <div className="cart-floating-button">
          <button 
            className="cart-button"
            onClick={onProceedToCart}
          >
            <ShoppingCart size={20} />
            <span>ตะกร้า ({cartItemsCount})</span>
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
          <span className="item-price">฿{item.price.toFixed(0)}</span>
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