import { useState } from 'react'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { orderApi } from '../api/client'

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

interface OrderConfirmProps {
  cart: CartItem[]
  customerName: string
  orderNotes: string
  totalAmount: number
  onConfirmOrder: (order: any) => void
  onBack: () => void
}

export function OrderConfirm({ cart, customerName, orderNotes, totalAmount, onConfirmOrder, onBack }: OrderConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleConfirmOrder = async () => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const orderData = {
        customerName,
        notes: orderNotes,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes
        }))
      }

      const result = await orderApi.create(orderData)
      
      if (result.status === 'success') {
        onConfirmOrder(result.data)
      } else {
        setSubmitError('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      setSubmitError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="order-confirm">
      <div className="confirm-header">
        <button className="back-button" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={20} />
          กลับไปแก้ไข
        </button>
        <h2>✅ ยืนยันการสั่งซื้อ</h2>
      </div>

      <div className="confirm-content">
        <div className="customer-section">
          <h3>ข้อมูลลูกค้า</h3>
          <div className="customer-info">
            <p><strong>ชื่อ:</strong> {customerName}</p>
            {orderNotes && (
              <p><strong>หมายเหตุ:</strong> {orderNotes}</p>
            )}
          </div>
        </div>

        <div className="order-section">
          <h3>รายการที่สั่ง</h3>
          <div className="order-items">
            {cart.map(item => (
              <div key={item.menuItemId} className="confirm-item">
                <div className="item-info">
                  <div className="item-icon">
                    {item.menuItem.category === 'KANOM' ? '🥞' : '🥤'}
                  </div>
                  <div className="item-details">
                    <h4>{item.menuItem.name}</h4>
                    {item.menuItem.nameEn && (
                      <p className="item-name-en">{item.menuItem.nameEn}</p>
                    )}
                  </div>
                </div>
                <div className="item-quantity-price">
                  <span className="quantity">x{item.quantity}</span>
                  <span className="price">฿{(item.quantity * item.unitPrice).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="total-section">
          <div className="total-row">
            <span className="total-label">ยอดรวมทั้งสิ้น</span>
            <span className="total-amount">฿{totalAmount.toFixed(0)}</span>
          </div>
        </div>

        {submitError && (
          <div className="error-message">
            <p>{submitError}</p>
          </div>
        )}

        <div className="confirm-actions">
          <button 
            className="confirm-button"
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner small"></div>
                กำลังสั่งซื้อ...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                ยืนยันการสั่งซื้อ
              </>
            )}
          </button>
        </div>

        <div className="payment-note">
          <p>💡 <strong>หมายเหตุ:</strong> ชำระเงินที่หน้าร้านหลังจากได้รับหมายเลขคิว</p>
        </div>
      </div>
    </div>
  )
}