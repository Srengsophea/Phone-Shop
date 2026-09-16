export const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return '$0.00';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getImageUrl = (path?: string | null): string => {
  if (!path) return '/images/products/iphone-16-pro.jpg';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/images/')) {
    return path;
  }
  if (path.startsWith('images/')) {
    return `/${path}`;
  }
  return `/storage/${path.replace(/^\//, '')}`;
};
