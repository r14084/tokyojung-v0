import { useState } from 'react'
import { Package, BarChart3, Settings, LogOut, Bell, RefreshCw } from 'lucide-react'
import './App.css'

type ViewType = 'dashboard' | 'orders' | 'menu' | 'reports' | 'settings'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')

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
            <button className="logout-btn">
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
                <h3>Admin User</h3>
                <p className="user-role">ผู้ดูแลระบบ</p>
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
          {currentView === 'menu' && <MenuView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  )
}

function DashboardView() {
  return (
    <div className="dashboard-view">
      <h2>📊 แดชบอร์ดภาพรวม</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orders">📦</div>
          <div className="stat-content">
            <h3>ออเดอร์วันนี้</h3>
            <p className="stat-number">24</p>
            <p className="stat-change positive">+12% จากเมื่อวาน</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3>รายได้วันนี้</h3>
            <p className="stat-number">฿1,840</p>
            <p className="stat-change positive">+8% จากเมื่อวาน</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">⏰</div>
          <div className="stat-content">
            <h3>ออเดอร์รอดำเนินการ</h3>
            <p className="stat-number">5</p>
            <p className="stat-change">คิวถัดไป: #26</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon popular">🌟</div>
          <div className="stat-content">
            <h3>เมนูยอดนิยม</h3>
            <p className="stat-number">ขนมครกหวาน</p>
            <p className="stat-change">ขายแล้ว 8 ใบ</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h3>ออเดอร์ล่าสุด</h3>
        <div className="orders-list">
          <div className="order-item">
            <div className="order-info">
              <span className="order-number">#25</span>
              <span className="customer-name">คุณสมชาย</span>
              <span className="order-time">10:30</span>
            </div>
            <div className="order-status preparing">กำลังเตรียม</div>
            <div className="order-total">฿75</div>
          </div>
          
          <div className="order-item">
            <div className="order-info">
              <span className="order-number">#24</span>
              <span className="customer-name">คุณสมหญิง</span>
              <span className="order-time">10:25</span>
            </div>
            <div className="order-status ready">พร้อมรับ</div>
            <div className="order-total">฿120</div>
          </div>
          
          <div className="order-item">
            <div className="order-info">
              <span className="order-number">#23</span>
              <span className="customer-name">คุณชาติ</span>
              <span className="order-time">10:20</span>
            </div>
            <div className="order-status completed">เสร็จแล้ว</div>
            <div className="order-total">฿95</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrdersView() {
  return (
    <div className="orders-view">
      <h2>📦 จัดการออเดอร์</h2>
      <p>ระบบจัดการออเดอร์จะแสดงที่นี่</p>
    </div>
  )
}

function MenuView() {
  return (
    <div className="menu-view">
      <h2>🍽️ จัดการเมนู</h2>
      <p>ระบบจัดการเมนูจะแสดงที่นี่</p>
    </div>
  )
}

function ReportsView() {
  return (
    <div className="reports-view">
      <h2>📊 รายงาน</h2>
      <p>ระบบรายงานจะแสดงที่นี่</p>
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
