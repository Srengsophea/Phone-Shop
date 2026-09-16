import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

describe('ProductCard Component', () => {
  const sampleProduct: Product = {
    id: 1,
    brand_id: 1,
    category_id: 1,
    name: 'Samsung Galaxy S25 Ultra',
    slug: 'samsung-galaxy-s25-ultra',
    sku: 'S25-ULTRA-512',
    base_price: 1299,
    sale_price: 1199,
    has_variants: true,
    is_featured: true,
    is_bestseller: true,
    is_active: true,
    brand: {
      id: 1,
      name: 'Samsung',
      slug: 'samsung',
    },
    variants: [
      {
        id: 10,
        product_id: 1,
        sku: 'S25-ULTRA-512-TI',
        name: '512GB Titanium Black',
        color: 'Titanium Black',
        storage: '512GB',
        price: 1299,
        sale_price: 1199,
        stock: 15,
      },
    ],
  };

  it('renders product title, brand, and price correctly', () => {
    render(
      <BrowserRouter>
        <ProductCard product={sampleProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText('Samsung Galaxy S25 Ultra')).toBeDefined();
    expect(screen.getByText('Samsung')).toBeDefined();
    expect(screen.getByText('$1,199.00')).toBeDefined();
  });

  it('displays featured and bestseller badges when present', () => {
    render(
      <BrowserRouter>
        <ProductCard product={sampleProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText(/FEATURED/i)).toBeDefined();
    expect(screen.getByText(/BESTSELLER/i)).toBeDefined();
  });
});
