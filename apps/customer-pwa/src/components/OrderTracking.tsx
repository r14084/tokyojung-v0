import { RefreshCw, CheckCircle, Clock, ChefHat, ShoppingBag } from 'lucide-react'

interface Order {
  id: number
  queueNumber: number
  customerName: string
  status: string
  totalAmount: number
  items?: any[]
}

interface OrderTrackingProps {
  order: Order
  onStartNewOrder: () => void
}

export function OrderTracking({ order, onStartNewOrder }: OrderTrackingProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          icon: <Clock size={24} className="status-icon pending" />,
          text: 'รอชำระเงิน',
          description: 'กรุณาไปชำระเงินที่หน้าร้าน',
          color: 'pending'
        }
      case 'PAID':
        return {
          icon: <CheckCircle size={24} className="status-icon paid" />,
          text: 'ชำระเงินแล้ว',
          description: 'ร้านกำลังเตรียมอาหาร',
          color: 'paid'
        }
      case 'PREPARING':
        return {
          icon: <ChefHat size={24} className="status-icon preparing" />,
          text: 'กำลังเตรียม',
          description: 'เชฟกำลังทำอาหารให้คุณ',
          color: 'preparing'
        }
      case 'READY':
        return {
          icon: <ShoppingBag size={24} className="status-icon ready" />,
          text: 'พร้อมรับ',
          description: 'อาหารพร้อมแล้ว กรุณามารับ',
          color: 'ready'
        }
      case 'COMPLETED':
        return {
          icon: <CheckCircle size={24} className="status-icon completed" />,
          text: 'เสร็จสิ้น',
          description: 'ขอบคุณที่ใช้บริการ',
          color: 'completed'
        }
      default:
        return {
          icon: <Clock size={24} className="status-icon pending" />,
          text: 'กำลังดำเนินการ',
          description: 'กรุณารอสักครู่',
          color: 'pending'
        }
    }
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="order-tracking">
      <div className="tracking-header">
        <h2>📋 ติดตามออเดอร์</h2>
        <button className="refresh-button" title="รีเฟรช">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="queue-number-card">
        <div className="queue-number">
          <h1>{order.queueNumber}</h1>
        </div>
        <div className="queue-info">
          <h3>หมายเลขคิวของคุณ</h3>
          <p>เรียกแล้ว: {order.queueNumber > 5 ? order.queueNumber - 5 : 1} คิว</p>
        </div>
      </div>

      <div className="status-card">
        <div className={`status-indicator ${statusInfo.color}`}>
          {statusInfo.icon}
          <div className="status-text">
            <h3>{statusInfo.text}</h3>
            <p>{statusInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="order-progress">
        <div className="progress-steps">
          <div className={`progress-step ${['PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
            <div className="step-icon">💳</div>
            <span>ชำระเงิน</span>
          </div>
          
          <div className={`progress-step ${['PAID', 'PREPARING', 'READY', 'COMPLETED'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
            <div className="step-icon">👨‍🍳</div>
            <span>เตรียมอาหาร</span>
          </div>
          
          <div className={`progress-step ${['READY', 'COMPLETED'].indexOf(order.status) >= 0 ? 'completed' : ''}`}>
            <div className="step-icon">🛍️</div>
            <span>พร้อมรับ</span>
          </div>
          
          <div className={`progress-step ${order.status === 'COMPLETED' ? 'completed' : ''}`}>
            <div className="step-icon">✅</div>
            <span>เสร็จสิ้น</span>
          </div>
        </div>
      </div>

      <div className="order-details">
        <h3>รายละเอียดออเดอร์</h3>
        <div className="order-info">
          <p><strong>ลูกค้า:</strong> {order.customerName}</p>
          <p><strong>ยอดรวม:</strong> ฿{order.totalAmount.toFixed(0)}</p>
          <p><strong>เลขที่ออเดอร์:</strong> #{order.id}</p>
        </div>
      </div>

      {order.status === 'READY' && (
        <div className="ready-alert">
          <div className="alert-content">
            <h3>🔔 อาหารพร้อมแล้ว!</h3>
            <p>กรุณามารับออเดอร์ที่หน้าร้าน</p>
            <p>แสดงหมายเลขคิว: <strong>{order.queueNumber}</strong></p>
          </div>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <div className="completed-actions">
          <div className="thank-you">
            <h3>🙏 ขอบคุณที่ใช้บริการ!</h3>
            <p>หวังว่าจะได้รับใช้ท่านอีกครับ</p>
          </div>
          <button 
            className="new-order-button"
            onClick={onStartNewOrder}
          >
            สั่งซื้อใหม่
          </button>
        </div>
      )}

      {order.status !== 'COMPLETED' && (
        <div className="tracking-actions">
          <button 
            className="new-order-button secondary"
            onClick={onStartNewOrder}
          >
            สั่งซื้อใหม่
          </button>
        </div>
      )}

      <div className="contact-info">
        <p>💬 หากมีข้อสงสัย กรุณาติดต่อเจ้าหน้าที่ที่หน้าร้าน</p>
      </div>
    </div>
  )
}