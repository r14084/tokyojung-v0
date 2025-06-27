# Debugging localStorage Sharing Between Customer PWA and Staff Dashboard

## Problem Analysis

The issue is that orders created in the Customer PWA are not appearing in the Staff Dashboard, even though both apps are deployed on the same domain (`tokyojung-v0-01.vercel.app`).

## Root Cause Investigation

Based on the code analysis, localStorage **should** work between the apps since they're on the same domain:
- Customer PWA: `tokyojung-v0-01.vercel.app/` (root)
- Staff Dashboard: `tokyojung-v0-01.vercel.app/staff/` (subdirectory)

## Solutions Implemented

### 1. Enhanced Debugging & Logging

**Customer PWA** (`apps/customer-pwa/src/api/client.ts`):
- Added debug logging when orders are saved to localStorage
- Shows order details and localStorage count

**Staff Dashboard** (`apps/staff-dashboard/src/api/client.ts`):
- Added debug logging when reading from localStorage
- Shows count of orders found in localStorage

### 2. Real-time Detection

**Staff Dashboard** (`apps/staff-dashboard/src/App.tsx`):
- Added `storage` event listeners to detect localStorage changes
- Polls localStorage every 5 seconds as fallback
- Auto-refreshes order list when changes detected

### 3. Debug Panel

**Staff Dashboard** (`apps/staff-dashboard/src/components/DebugPanel.tsx`):
- Visual debugging interface
- Shows all localStorage contents
- Test order creation/deletion
- Domain and path information

### 4. Configuration Fixes

**Staff Dashboard** (`apps/staff-dashboard/vite.config.ts`):
- Added `base: '/staff/'` for proper subdirectory deployment

### 5. Cross-Origin Communication Fallback

**Staff Dashboard** (`apps/staff-dashboard/src/utils/crossOriginComms.ts`):
- PostMessage-based communication for edge cases
- Alternative if localStorage sharing fails

## Testing Steps

### 1. Deploy and Access Both Apps
```
Customer PWA: https://tokyojung-v0-01.vercel.app/
Staff Dashboard: https://tokyojung-v0-01.vercel.app/staff/
```

### 2. Open Browser Developer Tools
- Open Console in both apps
- Look for debug messages starting with 🍜 (Customer) and 📦 (Staff)

### 3. Test Order Creation
1. **In Customer PWA:**
   - Add items to cart
   - Submit an order
   - Check console for: `🍜 Customer PWA: Saved order to localStorage`

2. **In Staff Dashboard:**
   - Go to Orders tab
   - Check console for: `📦 Staff Dashboard: Found X orders in localStorage`
   - Orders should appear automatically (5-second polling)

### 4. Use Debug Panel
1. **In Staff Dashboard:**
   - Click "🔍 Debug Panel" button (bottom-right)
   - Check localStorage contents
   - Try "Add Test Order" button
   - Verify test order appears in orders list

### 5. Manual Verification
```javascript
// In both apps' console, run:
debugLocalStorage()

// This shows:
// - Current URL and domain
// - localStorage contents
// - Number of orders found
```

## Expected Behavior

### ✅ Working Correctly
- Both apps show same domain in debug info
- Customer PWA saves orders to `tokyojung_orders` key
- Staff Dashboard reads from `tokyojung_orders` key
- Orders appear in Staff Dashboard within 5 seconds
- Debug panel shows orders in localStorage

### ❌ Issues to Investigate
- Different domains shown in debug info
- Orders saved in Customer PWA but not found in Staff Dashboard
- localStorage appears empty in Staff Dashboard
- No debug messages in console

## Troubleshooting

### Issue: Orders Not Appearing
1. Check if both apps are on exact same domain
2. Verify localStorage key is identical: `tokyojung_orders`
3. Check browser console for error messages
4. Use Debug Panel to inspect localStorage directly

### Issue: Different Domains
If apps are on different subdomains:
- Customer: `customer.domain.com`
- Staff: `staff.domain.com`

This breaks localStorage sharing. Solution: Deploy both on same domain with different paths.

### Issue: Browser Security
Some browsers block localStorage in certain contexts:
- Private/Incognito mode
- Cross-origin restrictions
- Third-party cookie blocks

### Fallback Solutions
1. Use `sessionStorage` instead of `localStorage`
2. Implement server-side state sharing
3. Use URL parameters for order sharing
4. Implement WebSocket real-time updates

## Verification Commands

```javascript
// Check localStorage contents
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key))
})

// Test localStorage access
localStorage.setItem('test', 'value')
console.log('Test value:', localStorage.getItem('test'))

// Check current domain
console.log('Domain:', window.location.hostname)
console.log('Full URL:', window.location.href)
```

## Next Steps

1. Deploy updated code to Vercel
2. Test with real orders in production
3. Monitor console logs for debug messages
4. Use Debug Panel to investigate any issues
5. Implement server-side synchronization if localStorage sharing fails