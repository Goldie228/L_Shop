# Prompt for Nikita P. (Variant 17) - Product Module

## Introduction

You are developing the product module for the L_Shop online store. The project already contains basic infrastructure created by the team lead (Gleb). Your task is to implement the backend and frontend for working with products.

## Variant 17 - Features

For your variant, add additional fields to the Product model:
```typescript
interface Product {
  // ... base fields
  rating?: number;        // average rating (1-5)
  reviewsCount?: number;  // number of reviews
}
```

## Backend

### Files to create:

1. `src/backend/controllers/product.controller.ts`
2. `src/backend/services/product.service.ts`
3. `src/backend/routes/product.routes.ts`

### API Endpoints:

#### GET /api/products

List of products with query-parameters support:
- `search` (string) - search by `name` and `description` fields (case-insensitive)
- `sort` (string) - values: `price_asc`, `price_desc`
- `category` (string) - filter by category
- `inStock` (boolean) - `true` or `false`
- `minRating` (number) - minimum rating (for variant 17)

**Request example:**
```
GET /api/products?search=phone&sort=price_asc&category=electronics&inStock=true&minRating=4
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "iPhone 15",
    "description": "Smartphone from Apple",
    "price": 999,
    "category": "electronics",
    "inStock": true,
    "imageUrl": "/images/iphone.jpg",
    "rating": 4.5,
    "reviewsCount": 128
  }
]
```

#### GET /api/products/:id

Get a single product by ID.

**Response 200:** Product object
**Response 404:** `{ "message": "Product not found" }`

### Service implementation:

```typescript
// product.service.ts
import { readJsonFile } from '../utils/file.utils';
import { Product } from '../models/product.model';

const PRODUCTS_FILE = 'products.json';

export class ProductService {
  async getProducts(filters: {
    search?: string;
    sort?: string;
    category?: string;
    inStock?: string;
    minRating?: string;
  }): Promise<Product[]> {
    let products = await readJsonFile<Product>(PRODUCTS_FILE);
    
    // Search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term)
      );
    }
    
    // Category filter
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    // In stock filter
    if (filters.inStock !== undefined) {
      products = products.filter(p => p.inStock === (filters.inStock === 'true'));
    }
    
    // Rating filter (variant 17)
    if (filters.minRating) {
      const min = Number(filters.minRating);
      products = products.filter(p => (p.rating || 0) >= min);
    }
    
    // Sorting
    if (filters.sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    }
    
    return products;
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const products = await readJsonFile<Product>(PRODUCTS_FILE);
    return products.find(p => p.id === id) || null;
  }
}
```

### Connecting routes:

Add to `src/backend/app.ts`:
```typescript
import productRoutes from './routes/product.routes';
// ...
app.use('/api/products', productRoutes);
```

## Frontend

### File structure:

```
src/frontend/
  pages/
    MainPage.ts
  components/
    ProductCard.ts
    Filters.ts
    SearchBar.ts
  services/
    productApi.ts
  types/
    product.ts
```

### Components:

#### ProductCard

Product card with:
- Image (or placeholder)
- Name (with `data-title` attribute)
- Price (with `data-price` attribute)
- Rating and number of reviews (variant 17)
- "Add to cart" button (for authorized users)

#### Filters

Filter block with:
- Search field (input)
- Sorting select
- Category select
- "In stock only" checkbox
- Minimum rating input (variant 17)

### Data-attributes:

On the main page:
- `data-title` - on the element with product name
- `data-price` - on the element with product price

## Git

1. Create branch: `git checkout -b feature/products-nikita`
2. Make commits in English: `feat: add product filtering`
3. Create PR to `main`
4. Request review from colleagues

## Final checklist

- [ ] Backend: controller, service, routes
- [ ] API: GET /api/products with filters
- [ ] API: GET /api/products/:id
- [ ] Frontend: Main page
- [ ] Frontend: ProductCard, Filters components
- [ ] Data-attributes: data-title, data-price
- [ ] Variant 17: rating, reviewsCount, minRating filter
- [ ] Git: branch, commits, PR