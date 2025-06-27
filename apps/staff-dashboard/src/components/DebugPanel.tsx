import { useState, useEffect } from 'react'

export function DebugPanel() {
  const [localStorageData, setLocalStorageData] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    refreshLocalStorageData()
    
    // Update every 2 seconds
    const interval = setInterval(refreshLocalStorageData, 2000)
    return () => clearInterval(interval)
  }, [])

  const refreshLocalStorageData = () => {
    const data: any = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          const value = localStorage.getItem(key)
          data[key] = value ? JSON.parse(value) : value
        } catch {
          data[key] = localStorage.getItem(key) // Store as string if not JSON
        }
      }
    }
    setLocalStorageData(data)
  }

  const testLocalStorageSharing = () => {
    const testData = {
      id: Date.now(),
      queueNumber: 999,
      customerName: 'Debug Test Customer',
      status: 'PENDING_PAYMENT',
      totalAmount: 99.99,
      notes: 'This is a test order for debugging localStorage sharing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: Date.now(),
          orderId: Date.now(),
          menuItemId: 1,
          quantity: 1,
          unitPrice: 99.99,
          totalPrice: 99.99,
          notes: 'Test item',
          menuItem: {
            id: 1,
            name: 'Debug Test Item',
            price: 99.99,
            category: 'KANOM',
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ]
    }

    const existingOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
    existingOrders.push(testData)
    localStorage.setItem('tokyojung_orders', JSON.stringify(existingOrders))
    
    console.log('🧪 Test order added to localStorage:', testData)
    alert('Test order added! Check if it appears in the orders list.')
    refreshLocalStorageData()
  }

  const clearTestData = () => {
    const existingOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
    const filteredOrders = existingOrders.filter((order: any) => order.customerName !== 'Debug Test Customer')
    localStorage.setItem('tokyojung_orders', JSON.stringify(filteredOrders))
    
    console.log('🧹 Test orders cleared from localStorage')
    alert('Test orders cleared!')
    refreshLocalStorageData()
  }

  const clearAllLocalStorage = () => {
    if (confirm('Are you sure you want to clear ALL localStorage data?')) {
      localStorage.clear()
      alert('All localStorage data cleared!')
      refreshLocalStorageData()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!')
    })
  }

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        🔍 Debug Panel
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      backgroundColor: 'white',
      border: '2px solid #ddd',
      borderRadius: '10px',
      padding: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      overflow: 'auto',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>🔍 Debug Panel</h3>
        <button onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>❌</button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>📍 Current Context</h4>
        <div><strong>URL:</strong> {window.location.href}</div>
        <div><strong>Domain:</strong> {window.location.hostname}</div>
        <div><strong>Path:</strong> {window.location.pathname}</div>
        <div><strong>Protocol:</strong> {window.location.protocol}</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>🧪 Test Actions</h4>
        <button onClick={testLocalStorageSharing} style={{ marginRight: '5px', marginBottom: '5px', padding: '5px 10px' }}>
          Add Test Order
        </button>
        <button onClick={clearTestData} style={{ marginRight: '5px', marginBottom: '5px', padding: '5px 10px' }}>
          Clear Test Orders
        </button>
        <button onClick={refreshLocalStorageData} style={{ marginRight: '5px', marginBottom: '5px', padding: '5px 10px' }}>
          Refresh Data
        </button>
        <button onClick={clearAllLocalStorage} style={{ marginBottom: '5px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>
          Clear All
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>💾 localStorage Contents</h4>
        <div style={{ maxHeight: '300px', overflow: 'auto', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
          {Object.keys(localStorageData).length === 0 ? (
            <div>No data in localStorage</div>
          ) : (
            Object.entries(localStorageData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                <div style={{ fontWeight: 'bold', color: '#007bff' }}>{key}</div>
                <div style={{ 
                  wordBreak: 'break-all', 
                  maxHeight: '100px', 
                  overflow: 'auto',
                  backgroundColor: '#fff',
                  padding: '5px',
                  borderRadius: '3px',
                  marginTop: '3px'
                }}>
                  {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                </div>
                <button 
                  onClick={() => copyToClipboard(typeof value === 'string' ? value : JSON.stringify(value, null, 2))}
                  style={{ fontSize: '10px', padding: '2px 5px', marginTop: '3px' }}
                >
                  📋 Copy
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h4>📊 Statistics</h4>
        <div><strong>Orders:</strong> {localStorageData.tokyojung_orders?.length || 0}</div>
        <div><strong>Menu Items:</strong> {localStorageData.tokyojung_menu?.length || 0}</div>
        <div><strong>Auth Token:</strong> {localStorageData.authToken ? '✅' : '❌'}</div>
        <div><strong>User:</strong> {localStorageData.user ? '✅' : '❌'}</div>
      </div>
    </div>
  )
}