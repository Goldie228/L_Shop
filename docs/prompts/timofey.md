# Prompt for Timofey (Variant 21) - Cart Module

## Introduction

You are developing the cart module for the L_Shop online store. The project already contains basic infrastructure and authentication. Your task is to implement the backend and frontend for working with the cart.

## Variant 21 - Features

For your variant, add discount support:
- Add `discountPercent?: number` (0-100) field to the Product model
- Consider the discount when calculating the cost in the cart
- Display the old price crossed out and the new price with discount

## Backend

### Files to create:

1. `src/backend/controllers/cart.controller.ts`
2. `src/backend/services/cart.service.ts`
3. `src/backend/routes/cart.routes.ts`

### API Endpoints:

#### GET /api/cart

Get the current user's cart.

**Requires:** Authorization

**Response:**
```json
{
  "userId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "name": "iPhone 15",
      "price": 999,
      "discountPercent": 10,
      "total": 1798.2
    }
  ],
  "totalSum": 1798.2,
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### POST /api/cart/items

Add a product to the cart.

**Requires:** Authorization

**Request body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Logic:**
- Check product existence
- Check stock availability (`inStock`)
- If product is already in cart - increase quantity

#### PUT /api/cart/items/:productId

Change product quantity.

**Request body:**
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/items/:productId

Remove product from cart.

### Service implementation:

```typescript
// cart.service.ts
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

const CARTS_FILE = 'carts.json';
const PRODUCTS_FILE = 'products.json';

export class CartService {
  async getCart(userId: string) {
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    
    let cart = carts.find(c => c.userId === userId);
    if (!cart) {
      cart = { userId, items: [], updatedAt: new Date().toISOString() };
    }
    
    // Enrich with product data
    const items = cart.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const price = product?.price || 0;
      const discount = product?.discountPercent || 0;
      const total = item.quantity * price * (1 - discount / 100);
      
      return {
        ...item,
        name: product?.name || 'Unknown',
        price,
        discountPercent: discount,
        total
      };
    });
    
    const totalSum = items.reduce((sum, item) => sum + item.total, 0);
    
    return { ...cart, items, totalSum };
  }
  
  async addItem(userId: string, productId: string, quantity: number) {
    // Implement add logic
  }
  
  async updateItem(userId: string, productId: string, quantity: number) {
    // Implement update logic
  }
  
  async removeItem(userId: string, productId: string) {
    // Implement remove logic
  }
}
```

### Connecting routes:

Add to `src/backend/app.ts`:
```typescript
import cartRoutes from './routes/cart.routes';
// ...
app.use('/api/cart', cartRoutes);
```

## Frontend

### File structure:

```
src/frontend/
  pages/
    CartPage.ts
  components/
    Cart.ts
    CartItem.ts
  services/
    cartApi.ts
```

### Components:

#### Cart

List of products in the cart with:
- Name (with `data-title="basket"` attribute)
- Price per unit (with `data-price="basket"` attribute)
- Quantity with +/- buttons
- Total cost per item
- Cart total sum
- "Checkout" button

#### CartItem

Product card in the cart with discount display (variant 21).

### Data-attributes:

In the cart:
- `data-title="basket"` - on the element with product name
- `data-price="basket"` - on the element with product price

## Testing

### Unit tests for CartService

Create `src/backend/services/__tests__/cart.service.test.ts`:

```typescript
import { CartService } from '../cart.service';
import { readJsonFile, writeJsonFile } from '../../utils/file.utils';
import { Cart } from '../../models/cart.model';
import { Product } from '../../models/product.model';

jest.mock('../../utils/file.utils');

const mockReadJsonFile = readJsonFile as jest.MockedFunction<typeof readJsonFile>;
const mockWriteJsonFile = writeJsonFile as jest.MockedFunction<typeof writeJsonFile>;

describe('CartService', () => {
  let cartService: CartService;

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'iPhone 15',
      description: 'Smartphone',
      price: 1000,
      category: 'electronics',
      inStock: true,
      discountPercent: 10, // Variant 21
    },
    {
      id: 'product-2',
      name: 'Samsung Galaxy',
      description: 'Smartphone',
      price: 800,
      category: 'electronics',
      inStock: true,
    },
  ];

  const mockCarts: Cart[] = [
    {
      userId: 'user-1',
      items: [
        { productId: 'product-1', quantity: 2 },
      ],
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    cartService = new CartService();
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return cart with enriched items', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('iPhone 15');
    });

    it('should calculate discount correctly (variant 21)', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('user-1');

      // 2 items * 1000 price * 0.9 (10% discount) = 1800
      expect(result.items[0].total).toBe(1800);
      expect(result.items[0].discountPercent).toBe(10);
    });

    it('should return empty cart for new user', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockProducts);

      const result = await cartService.getCart('new-user');

      expect(result.items).toHaveLength(0);
      expect(result.totalSum).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should add new item to cart', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.addItem('user-1', 'product-2', 1);

      expect(mockWriteJsonFile).toHaveBeenCalled();
    });

    it('should increase quantity if item exists', async () => {
      mockReadJsonFile
        .mockResolvedValueOnce(mockCarts)
        .mockResolvedValueOnce(mockProducts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.addItem('user-1', 'product-1', 1);

      // Should increase from 2 to 3
      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      const item = savedCart[0].items.find(i => i.productId === 'product-1');
      expect(item?.quantity).toBe(3);
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockCarts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.updateItem('user-1', 'product-1', 5);

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      const item = savedCart[0].items.find(i => i.productId === 'product-1');
      expect(item?.quantity).toBe(5);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      mockReadJsonFile.mockResolvedValueOnce(mockCarts);
      mockWriteJsonFile.mockResolvedValue();

      await cartService.removeItem('user-1', 'product-1');

      const savedCart = mockWriteJsonFile.mock.calls[0][1] as Cart[];
      expect(savedCart[0].items).toHaveLength(0);
    });
  });
});
```

### Run tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

## Git

1. Create branch: `git checkout -b feature/cart-timofey`
2. Make commits in English
3. Create PR to `main`

## Final checklist

- [ ] Backend: controller, service, routes
- [ ] API: GET /api/cart
- [ ] API: POST /api/cart/items
- [ ] API: PUT /api/cart/items/:productId
- [ ] API: DELETE /api/cart/items/:productId
- [ ] Frontend: Cart page
- [ ] Frontend: Cart, CartItem components
- [ ] Data-attributes: data-title="basket", data-price="basket"
- [ ] Variant 21: discounts, discountPercent
- [ ] Tests: unit tests for CartService
- [ ] Git: branch, commits, PR