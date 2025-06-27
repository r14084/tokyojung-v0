import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MenuView } from './components/MenuView'
import { CartView } from './components/CartView'
import { OrderConfirm } from './components/OrderConfirm'
import { OrderTracking } from './components/OrderTracking'
import type { MenuItem, OrderItem } from './api/client'
import './App.css'

const queryClient = new QueryClient()

type AppState = 'menu' | 'cart' | 'confirm' | 'tracking'

interface CartItem extends OrderItem {
  menuItem: MenuItem
}

function AppContent() {
  const [currentView, setCurrentView] = useState<AppState>('menu')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [currentOrder, setCurrentOrder] = useState<any>(null)

  const addToCart = (menuItem: MenuItem, quantity: number = 1, notes?: string) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setCart([...cart, {
        menuItemId: menuItem.id,
        quantity,
        unitPrice: Number(menuItem.price),
        notes,
        menuItem
      }])
    }
  }

  const updateCartItem = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.menuItemId !== menuItemId))
    } else {
      setCart(cart.map(item => 
        item.menuItemId === menuItemId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
  }

  const proceedToCart = () => {
    if (cart.length > 0) {
      setCurrentView('cart')
    }
  }

  const proceedToConfirm = (name: string, notes: string) => {
    setCustomerName(name)
    setOrderNotes(notes)
    setCurrentView('confirm')
  }

  const submitOrder = (order: any) => {
    setCurrentOrder(order)
    setCurrentView('tracking')
    // Clear cart after successful order
    setCart([])
    setCustomerName('')
    setOrderNotes('')
  }

  const startNewOrder = () => {
    setCurrentView('menu')
    setCurrentOrder(null)
  }

  return (
    <div className="tokyojung-app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🥞 Tokyojung Grab & Go</h1>
          <p className="app-subtitle">ขนมครกและเครื่องดื่มแสนอร่อย</p>
          
          {/* Shopping Cart Icon */}
          {currentView === 'menu' && cart.length > 0 && (
            <div className="cart-icon-container" onClick={proceedToCart}>
              <div className="cart-icon">
                🛒
                <span className="cart-count">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {currentView === 'menu' && (
          <MenuView 
            onAddToCart={addToCart}
            onProceedToCart={proceedToCart}
            cartItemsCount={cart.reduce((total, item) => total + item.quantity, 0)}
          />
        )}

        {currentView === 'cart' && (
          <CartView 
            cart={cart}
            onUpdateItem={updateCartItem}
            onProceedToConfirm={proceedToConfirm}
            onBackToMenu={() => setCurrentView('menu')}
            totalAmount={getTotalAmount()}
          />
        )}

        {currentView === 'confirm' && (
          <OrderConfirm 
            cart={cart}
            customerName={customerName}
            orderNotes={orderNotes}
            totalAmount={getTotalAmount()}
            onConfirmOrder={submitOrder}
            onBack={() => setCurrentView('cart')}
          />
        )}

        {currentView === 'tracking' && currentOrder && (
          <OrderTracking 
            order={currentOrder}
            onStartNewOrder={startNewOrder}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2024 Tokyojung Restaurant - Thai Style Kanom & Drinks</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
        <AppContent />
      </div>
    </QueryClientProvider>
  )
}

export default App
