# Prompt for Nikita T. (Variant 24) - Order/Delivery Module

## Introduction

You are developing the order and delivery module for the L_Shop online store. The project already contains basic infrastructure, authentication, and (by the time of your work) product and cart modules. Your task is to implement the backend and frontend for order checkout.

## Variant 24 - Features

For your variant, add:
- Delivery type selection: `deliveryType: 'courier' | 'pickup'`
- Order comment: `comment?: string`

## Backend

### Model update:

Add to `src/backend/models/order.model.ts`:
```typescript
interface Order {
  // ... base fields
  deliveryType?: 'courier' | 'pickup';
  comment?: string;
}
```

### Files to create:

1. `src/backend/controllers/order.controller.ts`
2. `src/backend/services/order.service.ts`
3. `src/backend/routes/order.routes.ts`

### API Endpoints:

#### POST /api/orders

Create an order.

**Requires:** Authorization

**Request body:**
```json
{
  "deliveryAddress": "ul. Pushkina, d. 10, kv. 5",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Call before delivery"
}
```

**Logic:**
1. Get the current user's cart
2. If cart is empty - error 400
3. Create an order with a copy of products from the cart
4. Set status to `pending`
5. Clear the user's cart
6. Return the created order

**Response 201:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [...],
  "deliveryAddress": "ul. Pushkina, d. 10, kv. 5",
  "phone": "+375291234567",
  "email": "ivan@example.com",
  "paymentMethod": "cash",
  "deliveryType": "courier",
  "comment": "Call before delivery",
  "status": "pending",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### GET /api/orders

List of current user's orders.

**Requires:** Authorization

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z",
    ...
  }
]
```

### Service implementation:

```typescript
// order.service.ts
import { readJsonFile, writeJsonFile } from '../utils/file.utils';
import { Order } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { generateId } from '../utils/id.utils';

const ORDERS_FILE = 'orders.json';
const CARTS_FILE = 'carts.json';

export class OrderService {
  async createOrder(
    userId: string,
    data: {
      deliveryAddress: string;
      phone: string;
      email: string;
      paymentMethod: 'cash' | 'card' | 'online';
      deliveryType?: 'courier' | 'pickup';
      comment?: string;
    }
  ) {
    // 1. Get cart
    const carts = await readJsonFile<Cart>(CARTS_FILE);
    const cart = carts.find(c => c.userId === userId);
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // 2. Create order
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    const newOrder: Order = {
      id: generateId(),
      userId,
      items: cart.items,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);
    
    // 3. Clear cart
    const updatedCarts = carts.map(c => 
      c.userId === userId ? { ...c, items: [] } : c
    );
    await writeJsonFile(CARTS_FILE, updatedCarts);
    
    return newOrder;
  }
  
  async getOrders(userId: string) {
    const orders = await readJsonFile<Order>(ORDERS_FILE);
    return orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
```

### Connecting routes:

Add to `src/backend/app.ts`:
```typescript
import orderRoutes from './routes/order.routes';
// ...
app.use('/api/orders', orderRoutes);
```

## Frontend

### File structure:

```
src/frontend/
  pages/
    DeliveryPage.ts
    OrdersPage.ts
  components/
    DeliveryForm.ts
    OrderCard.ts
  services/
    orderApi.ts
```

### Components:

#### DeliveryForm

Delivery checkout form with fields:
- Delivery address (textarea)
- Phone (input)
- Email (input)
- Payment method (radio: cash, card, online)
- Delivery type (radio: courier, pickup) - variant 24
- Comment (textarea) - variant 24
- "Checkout" button

**Attribute:** `data-delivery` on the `<form>` element

#### OrdersPage

List of user's orders (optional).

### Data-attributes:

On the delivery form:
- `data-delivery` - on the form element

## Git

1. Create branch: `git checkout -b feature/orders-nikita-t`
2. Make commits in English
3. Create PR to `main`

## Final checklist

- [ ] Backend: controller, service, routes
- [ ] API: POST /api/orders
- [ ] API: GET /api/orders
- [ ] Frontend: Delivery page
- [ ] Frontend: DeliveryForm component
- [ ] Data-attributes: data-delivery
- [ ] Variant 24: deliveryType, comment
- [ ] Git: branch, commits, PR