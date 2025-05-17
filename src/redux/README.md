# Redux Implementation for Organic Funda

This directory contains the Redux implementation for the Organic Funda application. Redux is used for state management with data persistence.

## Structure

```
src/redux/
├── store.ts                # Redux store configuration
├── hooks.ts               # Typed Redux hooks
├── ReduxProvider.tsx      # Redux provider component
├── slices/                # Redux slices
│   ├── authSlice.ts       # Authentication state
│   └── cartSlice.ts       # Shopping cart state
├── middleware/            # Custom middleware
│   └── logger.ts          # Logging middleware
└── thunks/                # Async thunks
    └── authThunks.ts      # Authentication thunks
```

## Usage

### Using Redux in Components

To use Redux in your components, import the custom hooks from `@/hooks/useAuth` and `@/hooks/useCart`:

```tsx
// For authentication
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  // ...
};

// For cart functionality
import { useCart } from '@/hooks/useCart';

const MyComponent = () => {
  const { cart, addToCart, removeFromCart, updateQuantity, totalItems, totalAmount } = useCart();
  // ...
};
```

### Adding Items to Cart

```tsx
import { useCart } from '@/hooks/useCart';
import { Product } from '@/redux/slices/cartSlice';

const ProductComponent = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const cartItem: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    };
    addToCart(cartItem);
  };

  return (
    <button onClick={handleAddToCart}>Add to Cart</button>
  );
};
```

### Persistence

Cart and authentication data is automatically persisted using `redux-persist` with localStorage. The implementation includes:

1. Redux Persist configuration in `store.ts`
2. `CartSyncProvider` component that syncs cart data with localStorage
3. PersistGate in `ReduxProvider.tsx` to delay rendering until persisted state is retrieved

## Development

### Adding a New Slice

To add a new slice to the Redux store:

1. Create a new file in the `slices` directory
2. Define the slice using `createSlice` from Redux Toolkit
3. Add the reducer to the root reducer in `store.ts`
4. Create a custom hook in the `hooks` directory to access the slice state and actions

### Debugging

The application includes a logger middleware that logs all Redux actions and state changes to the console. This makes it easier to debug and understand the flow of data in the application.
