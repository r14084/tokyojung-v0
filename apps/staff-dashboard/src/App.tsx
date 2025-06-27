import { useState, useEffect } from 'react'
import { Package, BarChart3, Settings, LogOut, Bell, RefreshCw, Power, PowerOff, Clock, CheckCircle, XCircle, CreditCard, Plus, Upload, Save, X, Edit, Trash2, Download, Calendar, TrendingUp, PieChart } from 'lucide-react'
import { LoginForm } from './components/LoginForm'
import { menuApi, orderApi, reportsApi, type MenuItem, type Order, type TodayStats, type ReportData, type DailyReport, type MenuItemReport } from './api/client'
import './App.css'

type ViewType = 'dashboard' | 'orders' | 'menu' | 'reports' | 'settings'

interface User {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'CASHIER' | 'KITCHEN'
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (_token: string, userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setCurrentView('dashboard')
  }

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🥞 Tokyojung Staff</h1>
            <p>กำลังโหลด...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="tokyojung-staff">
      <header className="staff-header">
        <div className="header-content">
          <h1 className="staff-title">👨‍💼 Tokyojung Staff Dashboard</h1>
          <p className="staff-subtitle">ระบบจัดการร้าน - Staff Management System</p>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <button className="refresh-btn">
              <RefreshCw size={20} />
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className="staff-layout">
        <nav className="staff-sidebar">
          <div className="sidebar-content">
            <div className="user-info">
              <div className="user-avatar">👨‍💼</div>
              <div className="user-details">
                <h3>{user?.name}</h3>
                <p className="user-role">
                  {user?.role === 'ADMIN' && 'ผู้ดูแลระบบ'}
                  {user?.role === 'CASHIER' && 'พนักงานการเงิน'}
                  {user?.role === 'KITCHEN' && 'พนักงานครัว'}
                </p>
              </div>
            </div>

            <ul className="nav-menu">
              <li>
                <button 
                  className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setCurrentView('dashboard')}
                >
                  <BarChart3 size={20} />
                  <span>แดชบอร์ด</span>
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${currentView === 'orders' ? 'active' : ''}`}
                  onClick={() => setCurrentView('orders')}
                >
                  <Package size={20} />
                  <span>จัดการออเดอร์</span>
                  <span className="badge">5</span>
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${currentView === 'menu' ? 'active' : ''}`}
                  onClick={() => setCurrentView('menu')}
                >
                  <Package size={20} />
                  <span>จัดการเมนู</span>
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
                  onClick={() => setCurrentView('reports')}
                >
                  <BarChart3 size={20} />
                  <span>รายงาน</span>
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
                  onClick={() => setCurrentView('settings')}
                >
                  <Settings size={20} />
                  <span>ตั้งค่า</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="staff-main">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'orders' && <OrdersView />}
          {currentView === 'menu' && <MenuView user={user} />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  )
}

function DashboardView() {
  const [stats, setStats] = useState<TodayStats>({ todayOrders: 0, todayRevenue: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, ordersData] = await Promise.all([
        orderApi.getTodayStats(),
        orderApi.getAll()
      ])
      
      setStats(statsData)
      // Get 5 most recent orders
      const sorted = ordersData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      setRecentOrders(sorted)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 'รอชำระเงิน'
      case 'PAID': return 'ชำระแล้ว'
      case 'PREPARING': return 'กำลังเตรียม'
      case 'READY': return 'พร้อมรับ'
      case 'COMPLETED': return 'เสร็จแล้ว'
      case 'CANCELLED': return 'ยกเลิก'
      default: return status
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 'pending-payment'
      case 'PAID': return 'paid'
      case 'PREPARING': return 'preparing'
      case 'READY': return 'ready'
      case 'COMPLETED': return 'completed'
      case 'CANCELLED': return 'cancelled'
      default: return 'unknown'
    }
  }

  if (loading) {
    return (
      <div className="dashboard-view">
        <h2>📊 แดชบอร์ดภาพรวม</h2>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h2>📊 แดชบอร์ดภาพรวม</h2>
        <button className="refresh-dashboard-btn" onClick={loadDashboardData}>
          <RefreshCw size={16} />
          รีเฟรช
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">📦</div>
          <div className="stat-content">
            <h3>ออเดอร์วันนี้</h3>
            <p className="stat-number">{stats.todayOrders}</p>
            <p className="stat-change">ออเดอร์ทั้งหมดวันนี้</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3>รายได้วันนี้</h3>
            <p className="stat-number">฿{stats.todayRevenue.toLocaleString()}</p>
            <p className="stat-change">รายได้สะสมวันนี้</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">⏰</div>
          <div className="stat-content">
            <h3>ออเดอร์รอดำเนินการ</h3>
            <p className="stat-number">{stats.pendingOrders}</p>
            <p className="stat-change">ต้องดำเนินการ</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon popular">🌟</div>
          <div className="stat-content">
            <h3>ออเดอร์ล่าสุด</h3>
            <p className="stat-number">
              {recentOrders.length > 0 ? `#${recentOrders[0].queueNumber}` : '-'}
            </p>
            <p className="stat-change">
              {recentOrders.length > 0 ? recentOrders[0].customerName : 'ไม่มีออเดอร์'}
            </p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h3>ออเดอร์ล่าสุด</h3>
        {recentOrders.length > 0 ? (
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <span className="order-number">#{order.queueNumber}</span>
                  <span className="customer-name">{order.customerName}</span>
                  <span className="order-time">
                    {new Date(order.createdAt).toLocaleTimeString('th-TH', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
                <div className="order-total">฿{order.totalAmount}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recent-orders">
            <p>ไม่มีออเดอร์ล่าสุด</p>
          </div>
        )}
      </div>
    </div>
  )
}

function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const orderData = await orderApi.getAll()
      setOrders(orderData)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string, paymentMethod?: string) => {
    try {
      setUpdatingOrder(orderId)
      await orderApi.updateStatus(orderId, newStatus, paymentMethod)
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any, paymentMethod: paymentMethod as any }
            : order
        )
      )
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะออเดอร์')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return '#ff9800'
      case 'PAID': return '#2196f3'
      case 'PREPARING': return '#ff5722'
      case 'READY': return '#4caf50'
      case 'COMPLETED': return '#9e9e9e'
      case 'CANCELLED': return '#f44336'
      default: return '#9e9e9e'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 'รอชำระเงิน'
      case 'PAID': return 'ชำระแล้ว'
      case 'PREPARING': return 'กำลังเตรียม'
      case 'READY': return 'พร้อมรับ'
      case 'COMPLETED': return 'เสร็จสิ้น'
      case 'CANCELLED': return 'ยกเลิก'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT': return <CreditCard size={16} />
      case 'PAID': return <CheckCircle size={16} />
      case 'PREPARING': return <Clock size={16} />
      case 'READY': return <Bell size={16} />
      case 'COMPLETED': return <CheckCircle size={16} />
      case 'CANCELLED': return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  const sortedOrders = filteredOrders.sort((a, b) => {
    // Sort by creation time (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return (
      <div className="orders-view">
        <h2>📦 จัดการออเดอร์</h2>
        <p>กำลังโหลดข้อมูลออเดอร์...</p>
      </div>
    )
  }

  return (
    <div className="orders-view">
      <div className="orders-header">
        <h2>📦 จัดการออเดอร์</h2>
        <div className="orders-actions">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="PENDING_PAYMENT">รอชำระเงิน</option>
            <option value="PAID">ชำระแล้ว</option>
            <option value="PREPARING">กำลังเตรียม</option>
            <option value="READY">พร้อมรับ</option>
            <option value="COMPLETED">เสร็จสิ้น</option>
          </select>
          <button className="refresh-orders-btn" onClick={loadOrders}>
            <RefreshCw size={16} />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="orders-grid">
        {sortedOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-queue">
                <span className="queue-number">#{order.queueNumber}</span>
                <span className="customer-name">{order.customerName}</span>
              </div>
              <div 
                className="order-status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </div>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <span className="item-name">{item.menuItem.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                  <span className="item-price">฿{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-info">
                <div className="order-total">รวม: ฿{order.totalAmount}</div>
                <div className="order-time">
                  {new Date(order.createdAt).toLocaleTimeString('th-TH')}
                </div>
              </div>

              <div className="order-actions">
                {order.status === 'PENDING_PAYMENT' && (
                  <>
                    <button
                      className="status-btn paid"
                      onClick={() => updateOrderStatus(order.id, 'PAID', 'CASH')}
                      disabled={updatingOrder === order.id}
                    >
                      เงินสด
                    </button>
                    <button
                      className="status-btn paid"
                      onClick={() => updateOrderStatus(order.id, 'PAID', 'CREDIT_CARD')}
                      disabled={updatingOrder === order.id}
                    >
                      บัตร
                    </button>
                  </>
                )}

                {order.status === 'PAID' && (
                  <button
                    className="status-btn preparing"
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    disabled={updatingOrder === order.id}
                  >
                    เริ่มทำ
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    className="status-btn ready"
                    onClick={() => updateOrderStatus(order.id, 'READY')}
                    disabled={updatingOrder === order.id}
                  >
                    พร้อมรับ
                  </button>
                )}

                {order.status === 'READY' && (
                  <button
                    className="status-btn completed"
                    onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                    disabled={updatingOrder === order.id}
                  >
                    เสร็จสิ้น
                  </button>
                )}

                {updatingOrder === order.id && (
                  <RefreshCw size={16} className="spinning" />
                )}
              </div>
            </div>

            {order.notes && (
              <div className="order-notes">
                <strong>หมายเหตุ:</strong> {order.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedOrders.length === 0 && (
        <div className="no-orders">
          <p>ไม่มีออเดอร์{statusFilter !== 'all' ? 'ในสถานะนี้' : ''}</p>
        </div>
      )}
    </div>
  )
}

function MenuView({ user }: { user: User | null }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingItem, setUpdatingItem] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    price: '',
    category: 'KANOM' as 'KANOM' | 'DRINK',
    image: ''
  })

  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const items = await menuApi.getAll()
      setMenuItems(items)
    } catch (error) {
      console.error('Error loading menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (itemId: number, currentAvailable: boolean) => {
    try {
      setUpdatingItem(itemId)
      await menuApi.updateAvailability(itemId, !currentAvailable, 'Updated from staff dashboard')
      
      // Update local state
      setMenuItems(items => 
        items.map(item => 
          item.id === itemId 
            ? { ...item, available: !currentAvailable }
            : item
        )
      )
    } catch (error) {
      console.error('Error updating menu item:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดตเมนู')
    } finally {
      setUpdatingItem(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      price: '',
      category: 'KANOM',
      image: ''
    })
    setEditingItem(null)
    setShowCreateForm(false)
  }

  const handleCreateNew = () => {
    resetForm()
    setShowCreateForm(true)
  }

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      nameEn: item.nameEn || '',
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: item.image || ''
    })
    setEditingItem(item)
    setShowCreateForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      alert('กรุณากรอกชื่อเมนูและราคา')
      return
    }

    const priceValue = parseFloat(formData.price)
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('กรุณากรอกราคาที่ถูกต้อง')
      return
    }

    try {
      const menuData = {
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        description: formData.description.trim() || undefined,
        price: priceValue,
        category: formData.category,
        image: formData.image || undefined
      }

      console.log('Sending menu data:', menuData)
      console.log('Auth token exists:', !!localStorage.getItem('authToken'))

      if (editingItem) {
        // Update existing item
        await menuApi.update(editingItem.id, menuData)
        setMenuItems(items => 
          items.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...menuData }
              : item
          )
        )
      } else {
        // Create new item
        const newItem = await menuApi.create(menuData)
        setMenuItems(items => [...items, newItem])
      }

      resetForm()
      alert(editingItem ? 'อัปเดตเมนูเรียบร้อย' : 'สร้างเมนูใหม่เรียบร้อย')
    } catch (error: any) {
      console.error('Error saving menu item:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'เกิดข้อผิดพลาดในการบันทึกเมนู'
      
      if (error.response?.status === 401) {
        errorMessage = 'ไม่มีสิทธิ์เข้าใช้งาน กรุณาล็อกอินใหม่'
      } else if (error.response?.status === 403) {
        errorMessage = 'ไม่มีสิทธิ์ในการสร้างเมนู'
      } else if (error.response?.data?.error?.message) {
        errorMessage = `เกิดข้อผิดพลาด: ${error.response.data.error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`ต้องการลบเมนู "${item.name}" หรือไม่?`)) {
      return
    }

    try {
      await menuApi.delete(item.id)
      setMenuItems(items => items.filter(i => i.id !== item.id))
      alert('ลบเมนูเรียบร้อย')
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('เกิดข้อผิดพลาดในการลบเมนู')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now, just store the file name. In production, you'd upload to a CDN
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="menu-view">
        <h2>🍽️ จัดการเมนู</h2>
        <p>กำลังโหลดข้อมูลเมนู...</p>
      </div>
    )
  }

  const kanomItems = menuItems.filter(item => item.category === 'KANOM')
  const drinkItems = menuItems.filter(item => item.category === 'DRINK')

  return (
    <div className="menu-view">
      <div className="menu-header">
        <h2>🍽️ จัดการเมนู</h2>
        <div className="menu-header-actions">
          {user?.role === 'ADMIN' && (
            <button className="create-menu-btn" onClick={handleCreateNew}>
              <Plus size={16} />
              เพิ่มเมนู
            </button>
          )}
          <button className="refresh-menu-btn" onClick={loadMenuItems}>
            <RefreshCw size={16} />
            รีเฟรช
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="menu-form-overlay">
          <div className="menu-form-modal">
            <div className="menu-form-header">
              <h3>{editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}</h3>
              <button className="close-form-btn" onClick={resetForm}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="menu-form">
              <div className="form-row">
                <div className="form-group">
                  <label>ชื่อเมนู (ไทย) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="เช่น ขนมครกหวาน"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ชื่อเมนู (อังกฤษ)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    placeholder="e.g. Sweet Kanom"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ราคา (บาท) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="25.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ประเภท *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'KANOM' | 'DRINK' }))}
                    required
                  >
                    <option value="KANOM">ขนมครก (Kanom)</option>
                    <option value="DRINK">เครื่องดื่ม (Drink)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>คำอธิบาย</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="คำอธิบายเมนู..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>รูปภาพ</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="image-upload-btn">
                    <Upload size={16} />
                    เลือกรูปภาพ
                  </label>
                  {formData.image && (
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  ยกเลิก
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  {editingItem ? 'อัปเดต' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="menu-categories">
        <div className="menu-category">
          <h3>🥞 ขนมครก (Kanom)</h3>
          <div className="menu-items-grid">
            {kanomItems.map(item => (
              <div key={item.id} className={`menu-item-card ${!item.available ? 'unavailable' : ''}`}>
                <div className="menu-item-info">
                  <h4>{item.name}</h4>
                  {item.nameEn && <p className="menu-item-name-en">{item.nameEn}</p>}
                  {item.description && <p className="menu-item-description">{item.description}</p>}
                  <p className="menu-item-price">฿{item.price}</p>
                </div>
                <div className="menu-item-actions">
                  {user?.role === 'ADMIN' && (
                    <div className="menu-item-buttons">
                      <button
                        className="edit-menu-btn"
                        onClick={() => handleEdit(item)}
                        title="แก้ไขเมนู"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="delete-menu-btn"
                        onClick={() => handleDelete(item)}
                        title="ลบเมนู"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <button
                    className={`availability-toggle ${item.available ? 'available' : 'unavailable'}`}
                    onClick={() => toggleAvailability(item.id, item.available)}
                    disabled={updatingItem === item.id}
                  >
                    {updatingItem === item.id ? (
                      <RefreshCw size={16} className="spinning" />
                    ) : item.available ? (
                      <Power size={16} />
                    ) : (
                      <PowerOff size={16} />
                    )}
                    {item.available ? 'พร้อมขาย' : 'หยุดขาย'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-category">
          <h3>🥤 เครื่องดื่ม (Drinks)</h3>
          <div className="menu-items-grid">
            {drinkItems.map(item => (
              <div key={item.id} className={`menu-item-card ${!item.available ? 'unavailable' : ''}`}>
                <div className="menu-item-info">
                  <h4>{item.name}</h4>
                  {item.nameEn && <p className="menu-item-name-en">{item.nameEn}</p>}
                  {item.description && <p className="menu-item-description">{item.description}</p>}
                  <p className="menu-item-price">฿{item.price}</p>
                </div>
                <div className="menu-item-actions">
                  {user?.role === 'ADMIN' && (
                    <div className="menu-item-buttons">
                      <button
                        className="edit-menu-btn"
                        onClick={() => handleEdit(item)}
                        title="แก้ไขเมนู"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="delete-menu-btn"
                        onClick={() => handleDelete(item)}
                        title="ลบเมนู"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <button
                    className={`availability-toggle ${item.available ? 'available' : 'unavailable'}`}
                    onClick={() => toggleAvailability(item.id, item.available)}
                    disabled={updatingItem === item.id}
                  >
                    {updatingItem === item.id ? (
                      <RefreshCw size={16} className="spinning" />
                    ) : item.available ? (
                      <Power size={16} />
                    ) : (
                      <PowerOff size={16} />
                    )}
                    {item.available ? 'พร้อมขาย' : 'หยุดขาย'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportsView() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [menuItemReports, setMenuItemReports] = useState<MenuItemReport[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'menu'>('overview')

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const [periodData, dailyData, menuData] = await Promise.all([
        reportsApi.getPeriodReport(selectedPeriod),
        reportsApi.getDailyReports(selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90),
        reportsApi.getMenuItemReports(selectedPeriod)
      ])
      
      setReportData(periodData)
      setDailyReports(dailyData)
      setMenuItemReports(menuData)
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await reportsApi.exportReport(selectedPeriod, format)
      alert(`รายงานถูกดาวน์โหลดเป็น ${format.toUpperCase()} แล้ว`)
    } catch (error) {
      console.error('Export error:', error)
      alert('เกิดข้อผิดพลาดในการส่งออกรายงาน')
    }
  }

  const getPeriodText = (period: string) => {
    switch (period) {
      case '7d': return '7 วันที่ผ่านมา'
      case '30d': return '30 วันที่ผ่านมา'
      case '90d': return '90 วันที่ผ่านมา'
      default: return period
    }
  }

  if (loading) {
    return (
      <div className="reports-view">
        <h2>📊 รายงาน</h2>
        <p>กำลังโหลดข้อมูลรายงาน...</p>
      </div>
    )
  }

  return (
    <div className="reports-view">
      <div className="reports-header">
        <h2>📊 รายงาน</h2>
        <div className="reports-controls">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="7d">7 วันที่ผ่านมา</option>
            <option value="30d">30 วันที่ผ่านมา</option>
            <option value="90d">90 วันที่ผ่านมา</option>
          </select>
          <button className="export-btn" onClick={() => handleExport('csv')}>
            <Download size={16} />
            CSV
          </button>
          <button className="export-btn" onClick={() => handleExport('pdf')}>
            <Download size={16} />
            PDF
          </button>
          <button className="refresh-btn" onClick={loadReportData}>
            <RefreshCw size={16} />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="report-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          ภาพรวม
        </button>
        <button 
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <Calendar size={16} />
          รายวัน
        </button>
        <button 
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          <PieChart size={16} />
          เมนู
        </button>
      </div>

      {activeTab === 'overview' && reportData && (
        <div className="overview-tab">
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>ออเดอร์ทั้งหมด</h3>
                <p className="stat-number">{reportData.totalOrders}</p>
                <p className="stat-period">{getPeriodText(selectedPeriod)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>รายได้รวม</h3>
                <p className="stat-number">฿{reportData.totalRevenue.toLocaleString()}</p>
                <p className="stat-period">{getPeriodText(selectedPeriod)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>ยอดขายเฉลี่ย</h3>
                <p className="stat-number">฿{reportData.averageOrderValue.toFixed(2)}</p>
                <p className="stat-period">ต่อออเดอร์</p>
              </div>
            </div>
          </div>

          <div className="top-items-section">
            <h3>🌟 เมนูยอดนิยม</h3>
            <div className="top-items-grid">
              {reportData.topItems.map((item, index) => (
                <div key={index} className="top-item-card">
                  <div className="item-rank">#{index + 1}</div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>ขายแล้ว {item.quantity} รายการ</p>
                    <p className="item-revenue">รายได้ ฿{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="daily-tab">
          <h3>📈 รายงานรายวัน</h3>
          <div className="daily-chart-container">
            <div className="chart-placeholder">
              <TrendingUp size={48} color="#ccc" />
              <p>กราฟรายวันจะแสดงที่นี่</p>
            </div>
          </div>
          <div className="daily-table">
            <table className="report-table">
              <thead>
                <tr>
                  <th>วันที่</th>
                  <th>ออเดอร์</th>
                  <th>รายได้</th>
                  <th>ยอดขายเฉลี่ย</th>
                </tr>
              </thead>
              <tbody>
                {dailyReports.map((day, index) => (
                  <tr key={index}>
                    <td>{new Date(day.date).toLocaleDateString('th-TH')}</td>
                    <td>{day.orders}</td>
                    <td>฿{day.revenue.toLocaleString()}</td>
                    <td>฿{day.averageOrderValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="menu-tab">
          <h3>🍽️ รายงานเมนู</h3>
          <div className="menu-table">
            <table className="report-table">
              <thead>
                <tr>
                  <th>เมนู</th>
                  <th>ประเภท</th>
                  <th>จำนวนขาย</th>
                  <th>จำนวนออเดอร์</th>
                  <th>รายได้</th>
                </tr>
              </thead>
              <tbody>
                {menuItemReports.map((item) => (
                  <tr key={item.id}>
                    <td className="menu-name">{item.name}</td>
                    <td>
                      <span className={`category-badge ${item.category.toLowerCase()}`}>
                        {item.category === 'KANOM' ? 'ขนมครก' : 'เครื่องดื่ม'}
                      </span>
                    </td>
                    <td>{item.totalQuantity}</td>
                    <td>{item.orderCount}</td>
                    <td>฿{item.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsView() {
  return (
    <div className="settings-view">
      <h2>⚙️ ตั้งค่า</h2>
      <p>ระบบตั้งค่าจะแสดงที่นี่</p>
    </div>
  )
}

export default App
