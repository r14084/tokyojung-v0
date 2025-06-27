// Cross-origin communication utilities for localStorage sharing
// This provides alternatives when localStorage sharing doesn't work

export interface CrossOriginMessage {
  type: 'NEW_ORDER' | 'ORDER_UPDATE' | 'MENU_UPDATE' | 'SYNC_REQUEST' | 'SYNC_RESPONSE'
  data: any
  timestamp: string
  from: 'customer-pwa' | 'staff-dashboard'
}

export class CrossOriginComms {
  private listeners: Map<string, ((data: any) => void)[]> = new Map()
  private customerOrigin: string
  
  constructor(customerOrigin = window.location.origin) {
    this.customerOrigin = customerOrigin
    this.setupMessageListener()
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Only accept messages from our origin (same domain)
      if (event.origin !== this.customerOrigin) {
        return
      }

      try {
        const message: CrossOriginMessage = event.data
        if (message.type && message.from) {
          console.log('📬 Received cross-origin message:', message)
          this.notifyListeners(message.type, message.data)
        }
      } catch (error) {
        console.error('Error parsing cross-origin message:', error)
      }
    })
  }

  private notifyListeners(type: string, data: any) {
    const listeners = this.listeners.get(type) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error('Error in cross-origin listener:', error)
      }
    })
  }

  public on(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)
  }

  public off(type: string, listener: (data: any) => void) {
    const listeners = this.listeners.get(type) || []
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  public sendToCustomerPWA(type: string, data: any) {
    const message: CrossOriginMessage = {
      type: type as any,
      data,
      timestamp: new Date().toISOString(),
      from: 'staff-dashboard'
    }

    // Send to parent window (if in iframe) or opener window
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, this.customerOrigin)
    }
    
    if (window.opener) {
      window.opener.postMessage(message, this.customerOrigin)
    }

    console.log('📤 Sent message to customer PWA:', message)
  }

  public requestSync() {
    this.sendToCustomerPWA('SYNC_REQUEST', {
      requestedData: ['orders', 'menu'],
      timestamp: new Date().toISOString()
    })
  }
}

// Singleton instance
export const crossOriginComms = new CrossOriginComms()

// Utility functions for localStorage + cross-origin fallback
export const shareOrder = (order: any) => {
  // First try localStorage
  try {
    const existingOrders = JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
    existingOrders.push(order)
    localStorage.setItem('tokyojung_orders', JSON.stringify(existingOrders))
    console.log('✅ Order saved to localStorage')
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error)
  }

  // Also broadcast via postMessage
  crossOriginComms.sendToCustomerPWA('NEW_ORDER', order)
}

export const getSharedOrders = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('tokyojung_orders') || '[]')
  } catch (error) {
    console.error('❌ Failed to read from localStorage:', error)
    return []
  }
}

export const shareMenu = (menuItems: any[]) => {
  try {
    localStorage.setItem('tokyojung_menu', JSON.stringify(menuItems))
    console.log('✅ Menu saved to localStorage')
  } catch (error) {
    console.error('❌ Failed to save menu to localStorage:', error)
  }

  crossOriginComms.sendToCustomerPWA('MENU_UPDATE', menuItems)
}