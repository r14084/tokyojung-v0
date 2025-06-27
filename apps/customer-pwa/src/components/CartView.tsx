import { useState } from 'react'
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'

interface CartItem {
  menuItemId: number
  quantity: number
  unitPrice: number
  notes?: string
  menuItem: {
    id: number
    name: string
    nameEn?: string
    price: number
    category: string
  }
}

interface CartViewProps {
  cart: CartItem[]
  onUpdateItem: (menuItemId: number, quantity: number) => void
  onProceedToConfirm: (customerName: string, notes: string) => void
  onBackToMenu: () => void
  totalAmount: number
}

export function CartView({ cart, onUpdateItem, onProceedToConfirm, onBackToMenu, totalAmount }: CartViewProps) {
  const [customerName, setCustomerName] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  const handleProceed = () => {
    if (customerName.trim() && cart.length > 0) {
      onProceedToConfirm(customerName.trim(), orderNotes.trim())
    }
  }

  if (cart.length === 0) {
    return (
      <div className="cart-view">
        <div className="cart-header">
          <button className="back-button" onClick={onBackToMenu}>
            <ArrowLeft size={20} />
            กลับไปเมนู
          </button>
          <h2>🛒 ตะกร้าของคุณ</h2>
        </div>
        
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>ตะกร้าว่างเปล่า</h3>
          <p>กรุณาเลือกสินค้าจากเมนู</p>
          <button className="back-to-menu-button" onClick={onBackToMenu}>
            เลือกเมนู
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-view">
      <div className="cart-header">
        <button className="back-button" onClick={onBackToMenu}>
          <ArrowLeft size={20} />
          กลับไปเมนู
        </button>
        <h2>🛒 ตะกร้าของคุณ</h2>
      </div>

      <div className="cart-items">
        {cart.map(item => (
          <CartItemRow 
            key={item.menuItemId}
            item={item}
            onUpdateQuantity={(quantity) => onUpdateItem(item.menuItemId, quantity)}
          />
        ))}
      </div>

      <div className="cart-summary">
        <div className="total-row">
          <span className="total-label">ยอดรวม</span>
          <span className="total-amount">฿{totalAmount.toFixed(0)}</span>
        </div>
      </div>

      <div className="customer-info">
        <h3>ข้อมูลการสั่งซื้อ</h3>
        
        <div className="form-group">
          <label htmlFor="customerName">ชื่อลูกค้า *</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="กรุณาใส่ชื่อของคุณ"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="orderNotes">หมายเหตุ (ถ้ามี)</label>
          <textarea
            id="orderNotes"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="หมายเหตุเพิ่มเติม เช่น ไม่ใส่น้ำตาล"
            className="form-textarea"
            rows={3}
          />
        </div>
      </div>

      <div className="cart-actions">
        <button 
          className="proceed-button"
          onClick={handleProceed}
          disabled={!customerName.trim()}
        >
          ดำเนินการต่อ (฿{totalAmount.toFixed(0)})
        </button>
      </div>
    </div>
  )
}

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (quantity: number) => void
}

function CartItemRow({ item, onUpdateQuantity }: CartItemRowProps) {
  const handleDecrease = () => {
    onUpdateQuantity(item.quantity - 1)
  }

  const handleIncrease = () => {
    onUpdateQuantity(item.quantity + 1)
  }

  const handleRemove = () => {
    onUpdateQuantity(0)
  }

  const itemTotal = item.quantity * item.unitPrice

  return (
    <div className="cart-item-row">
      <div className="item-info">
        <div className="item-icon">
          {item.menuItem.category === 'KANOM' ? '🥞' : '🥤'}
        </div>
        <div className="item-details">
          <h4 className="item-name">{item.menuItem.name}</h4>
          {item.menuItem.nameEn && (
            <p className="item-name-en">{item.menuItem.nameEn}</p>
          )}
          <p className="item-price">฿{item.unitPrice.toFixed(0)} x {item.quantity}</p>
        </div>
      </div>

      <div className="item-controls">
        <div className="quantity-controls">
          <button 
            className="quantity-button"
            onClick={handleDecrease}
          >
            <Minus size={16} />
          </button>
          <span className="quantity">{item.quantity}</span>
          <button 
            className="quantity-button"
            onClick={handleIncrease}
          >
            <Plus size={16} />
          </button>
        </div>
        
        <button 
          className="remove-button"
          onClick={handleRemove}
          title="ลบออกจากตะกร้า"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="item-total">
        ฿{itemTotal.toFixed(0)}
      </div>
    </div>
  )
}