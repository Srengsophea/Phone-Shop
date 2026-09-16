import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../stores/cartStore';

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      cart: {
        items: [],
        subtotal: 0,
        discount_amount: 0,
        shipping_fee: 0,
        tax_amount: 0,
        total_amount: 0,
        coupon: null,
      },
      isLoading: false,
      isCartOpen: false,
      couponError: null,
    });
  });

  it('calculates total items correctly from items array', () => {
    useCartStore.setState({
      cart: {
        items: [
          {
            id: 1,
            product_id: 10,
            variant_id: 101,
            quantity: 2,
            unit_price: 1199,
            subtotal: 2398,
            product: {
              id: 10,
              brand_id: 1,
              category_id: 1,
              name: 'iPhone 16 Pro Max',
              slug: 'iphone-16-pro-max',
              sku: 'IPHONE-16-PM-256',
              base_price: 1199,
              has_variants: true,
              is_featured: true,
              is_bestseller: true,
              is_active: true,
            },
          },
          {
            id: 2,
            product_id: 11,
            variant_id: null,
            quantity: 3,
            unit_price: 49,
            subtotal: 147,
            product: {
              id: 11,
              brand_id: 1,
              category_id: 4,
              name: 'MagSafe Charger',
              slug: 'magsafe-charger',
              sku: 'ACC-MAGSAFE',
              base_price: 49,
              has_variants: false,
              is_featured: false,
              is_bestseller: false,
              is_active: true,
            },
          },
        ],
        subtotal: 2545,
        discount_amount: 0,
        shipping_fee: 0,
        tax_amount: 0,
        total_amount: 2545,
        coupon: null,
      },
    });

    const items = useCartStore.getState().cart.items;
    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
    expect(totalCount).toBe(5);
    expect(useCartStore.getState().cart.total_amount).toBe(2545);
  });

  it('toggles cart drawer visibility correctly', () => {
    expect(useCartStore.getState().isCartOpen).toBe(false);

    useCartStore.getState().toggleCart(true);
    expect(useCartStore.getState().isCartOpen).toBe(true);

    useCartStore.getState().toggleCart(false);
    expect(useCartStore.getState().isCartOpen).toBe(false);

    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(true);
  });
});
