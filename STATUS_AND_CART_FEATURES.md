# Status and Cart Features Documentation

## Product Status Types

All status types are fully implemented and working:

### 1. **Draft** (Gray Badge)
- Status: `draft`
- Visibility: Not shown on public website
- Use case: Products being prepared/edited

### 2. **Published** (Green Badge)
- Status: `published`
- Visibility: Shown on public website
- Use case: Active, available products

### 3. **Hidden** (Yellow Badge)
- Status: `hidden`
- Visibility: Not shown on public website
- Use case: Temporarily hide products without deleting

### 4. **Discontinued** (Red Badge)
- Status: `discontinued`
- Visibility: Shown on website with red badge
- Use case: Products no longer available

### 5. **Out of Stock / Not Available** (Orange Badge)
- Status: `out_of_stock`
- Visibility: Shown on website with orange badge and blurred effect
- Use case: Products temporarily unavailable
- Visual: Product card is blurred, grayscale, and shows "Not Available" button

## Status Update Features

### Real-time Updates
- Products automatically refresh every 3 seconds via polling
- Real-time subscription available (requires Supabase real-time setup)
- Manual refresh button (↻) available on category pages

### Status Display
- Status badges visible on all product cards
- Color-coded for easy identification
- Status updates instantly when changed in admin panel

## Cart/Quote Features

### Add to Cart Functionality
- **Toast Notification**: Shows success message when product is added
- **Visual Feedback**: Button changes to green "Added!" with checkmark
- **Quantity Display**: Shows current quantity in cart
- **Disabled State**: Out of stock/discontinued products cannot be added

### Cart Features
- Add products to quote cart
- View cart items
- Update quantities
- Remove items
- Submit quotation request

## Visual Feedback

### When Product Added to Cart:
1. **Toast Notification** appears: "Product added to cart!"
   - Shows product name and quantity
   - Auto-dismisses after 2-3 seconds

2. **Button State Change**:
   - Changes from "Add to Quote" to "Added!" (green)
   - Shows checkmark icon
   - Reverts after 2 seconds

3. **Cart Count**: Updates in header/navigation

## Testing Checklist

### Status Testing:
- [ ] Create product with "Draft" status - verify badge appears
- [ ] Change to "Published" - verify green badge on website
- [ ] Change to "Hidden" - verify product hidden from website
- [ ] Change to "Discontinued" - verify red badge appears
- [ ] Change to "Out of Stock" - verify orange badge and blur effect
- [ ] Verify status updates appear within 3 seconds on website

### Cart Testing:
- [ ] Click "Add to Quote" on product card
- [ ] Verify toast notification appears
- [ ] Verify button changes to "Added!" (green)
- [ ] Verify cart count updates
- [ ] Try adding same product again - verify quantity increases
- [ ] Try adding out-of-stock product - verify button is disabled
- [ ] Check quote cart page shows all added items

## SQL Migrations Required

Run these SQL scripts in order:

1. `add-out-of-stock-status.sql` - Adds out_of_stock to status constraint
2. `add-update-policies.sql` - Allows authenticated users to update products
3. `fix-product-status.sql` - Sets default status for existing products
4. `enable-realtime.sql` - Enables real-time subscriptions (optional)

## Troubleshooting

### Status not updating on website:
1. Check browser console for errors
2. Verify polling is working (check console logs)
3. Click refresh button (↻) to manually update
4. Verify SQL migrations were run

### Cart not working:
1. Check browser console for errors
2. Verify QuoteCartProvider is wrapping the app
3. Check that toast notifications are enabled
