import { api } from '@/lib/axios';

export const cartService = {
  getCart: () => api.get('/cart'),
  
  addItem: (data: { productId: string; variantId?: string; quantity?: number }) => 
    api.post('/cart/items', data),
    
  updateItemQuantity: (itemId: string, quantity: number) => 
    api.patch(`/cart/items/${itemId}`, { quantity }),
    
  removeItem: (itemId: string) => 
    api.delete(`/cart/items/${itemId}`),
    
  applyCoupon: (code: string) => 
    api.post('/cart/coupon', { code }),
    
  removeCoupon: () => 
    api.delete('/cart/coupon'),
};

export const checkoutService = {
  processCheckout: (data: { shippingAddressId?: string; notes?: string }) => 
    api.post('/checkout/process', data),
};
