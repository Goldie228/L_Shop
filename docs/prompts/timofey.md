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
- [ ] Git: branch, commits, PR