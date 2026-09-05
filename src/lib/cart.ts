export interface StoredCartItem {
  productId: number;
  productName: string;
  cadCode: string;
  packageId: number;
  packageName: string;
  price: number;
  quantity: number;
}

export const CART_STORAGE_KEY = 'ktp_cart';
export const CART_UPDATED_EVENT = 'cart_updated';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStoredCartItem(value: unknown): value is StoredCartItem {
  if (!isRecord(value)) return false;

  return (
    typeof value.productId === 'number' &&
    typeof value.productName === 'string' &&
    typeof value.cadCode === 'string' &&
    typeof value.packageId === 'number' &&
    typeof value.packageName === 'string' &&
    typeof value.price === 'number' &&
    typeof value.quantity === 'number'
  );
}

export function parseCartItems(value: string | null): StoredCartItem[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isStoredCartItem);
  } catch {
    return [];
  }
}

export function getCartSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  return window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]';
}

export function getCartServerSnapshot(): null {
  return null;
}

export function subscribeToCartUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', callback);
  window.addEventListener(CART_UPDATED_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CART_UPDATED_EVENT, callback);
  };
}

export function saveCartItems(items: StoredCartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
