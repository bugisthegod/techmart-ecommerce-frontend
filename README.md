# TechMart E-Commerce Frontend

A modern, full-featured e-commerce frontend application built with React, Vite, and shadcn/ui components. This application provides a complete online shopping experience with product browsing, cart management, checkout, and order tracking.

## 🚀 Features

### User Authentication
- **Login & Registration**: Secure user authentication with JWT tokens
- **Session Management**: Automatic session restoration on page refresh
- **Protected Routes**: Route protection for authenticated users

### Product Browsing
- **Product Listing**: Grid-based product display with pagination
- **Product Details**: Detailed product pages with image galleries
- **Product Search**: Search functionality for finding products
- **Category Navigation**: Browse products by categories
- **Responsive Design**: Mobile-first responsive layout

### Shopping Cart
- **Add to Cart**: Add products with quantity selection
- **Cart Management**: Update quantities, remove items, and select items for checkout
- **Cart Persistence**: Cart state synchronized with backend
- **Real-time Updates**: Live cart total and item count in header
- **Item Selection**: Select specific items for checkout

### Checkout & Orders
- **Address Management**: Create, save, and manage multiple shipping addresses
- **Payment Integration**: Stripe payment integration with 3D Secure support
- **Multiple Payment Methods**: Credit Card (Stripe), PayPal, Cash on Delivery
- **Secure Card Input**: PCI-compliant card input with Stripe Elements
- **Order Creation**: Generate orders with selected cart items
- **Order Tracking**: View order history with status updates
- **Order Details**: Detailed order information and status tracking
- **Order Actions**: Cancel orders, process payments

### UI/UX Features
- **Modern UI**: Built with shadcn/ui components
- **Dark Mode Support**: Theme switching capability
- **Toast Notifications**: User-friendly feedback with Sonner
- **Loading States**: Skeleton loaders and loading indicators
- **Form Validation**: Zod schema validation with react-hook-form
- **Breadcrumb Navigation**: Easy navigation through pages
- **Smooth Animations**: Tailwind CSS animations

## 🛠️ Tech Stack

### Core
- **React 18.3.1**: Modern React with hooks
- **Vite**: Lightning-fast build tool and dev server
- **React Router DOM 7.8.2**: Client-side routing

### UI Components & Styling
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Headless UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Form Management & Validation
- **React Hook Form 7.68.0**: Performant form library
- **Zod 4.1.13**: TypeScript-first schema validation
- **@hookform/resolvers**: Validation resolvers

### State Management
- **React Context API**: Global state for auth and cart
- **useReducer**: Complex state management

### API & Integration
- **Axios 1.11.0**: HTTP client
- **JWT Decode**: Token parsing
- **Stripe JS**: Payment processing (@stripe/stripe-js, @stripe/react-stripe-js)
- **Orval**: OpenAPI client generation

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 📁 Project Structure

```
ecommerce-frontend/
├── public/                  # Static assets
│   ├── TechMart.png        # Brand logo
│   ├── TMicon.png          # Favicon
│   └── whale.png           # Additional images
├── src/
│   ├── assets/             # App assets
│   ├── components/
│   │   ├── common/         # Shared components
│   │   │   ├── Header.tsx  # App header with cart badge
│   │   │   └── Footer.tsx  # App footer
│   │   └── ui/             # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       └── ... (20+ components)
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── pages/
│   │   ├── Login.tsx       # Login & registration page
│   │   ├── ProductList.tsx # Product catalog with pagination
│   │   ├── ProductDetail.tsx # Individual product page
│   │   ├── Cart.tsx        # Shopping cart management
│   │   ├── Checkout.tsx    # Checkout with address & payment
│   │   ├── Orders.tsx      # Order history & management
│   │   └── OrderSuccess.tsx # Order confirmation page
│   ├── services/
│   │   ├── api.ts          # Axios instance & interceptors
│   │   ├── authService.ts  # Authentication API calls
│   │   ├── productService.ts # Product API calls
│   │   ├── cartService.ts  # Cart API calls
│   │   ├── orderService.ts # Order API calls
│   │   └── addressService.ts # Address API calls
│   ├── store/
│   │   ├── authContext.tsx # Authentication state management
│   │   └── cartContext.tsx # Cart state management
│   ├── types/
│   │   └── Product.ts      # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   ├── App.css             # App styles
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── components.json         # shadcn/ui configuration
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (default: http://localhost:8080)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bugisthegod/techmart-ecommerce-frontend.git
cd techmart-ecommerce-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_key
```

**Important Notes**:
- The `.env.example` file contains detailed documentation for each variable
- Never commit your `.env` file to version control (already in `.gitignore`)
- For Stripe: Sign up at [Stripe](https://stripe.com), then get your test key from [API Keys](https://dashboard.stripe.com/test/apikeys)
- Use test mode keys (starting with `pk_test_`) during development

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-api` - Generate API client from OpenAPI spec

## 🔒 Security Considerations

### Current Security Status

**✅ IMPROVED**: Several critical security improvements have been implemented to enhance frontend security:

#### Authentication & Token Security
- **Secure Logout Flow**: ✅ **FIXED** - Logout now properly awaits server-side token invalidation
  - Async logout with error handling
  - Defensive approach: clears local data even if server call fails
  - Handles edge cases (network failures, expired tokens)

- **Token Validation**: ✅ **IMPLEMENTED** - Multi-layer token validation
  - JWT format validation before storage
  - Token expiration checking with 30-second clock skew tolerance
  - API response validation with Zod schemas
  - See `src/lib/validation.ts` for implementation

- **Input Sanitization**: ✅ **IMPLEMENTED** - All user data sanitized before storage
  - HTML tag stripping to prevent stored XSS
  - Data type validation and length limits
  - Username, email, and phone sanitization
  - See `src/lib/validation.ts` for utilities

- **Security Headers**: ✅ **IMPLEMENTED** - Multiple security headers in place
  - Content Security Policy (CSP) to block inline script injection
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - X-XSS-Protection: enabled
  - Referrer-Policy: strict-origin-when-cross-origin

- **No Sensitive Logging**: ✅ **FIXED** - Token values no longer logged
  - Only token presence (true/false) logged in development
  - User data sanitized in logs

#### Remaining Considerations
- **JWT tokens still in localStorage**: While functional, this approach is vulnerable to XSS attacks. For maximum security, consider:
  - Moving to httpOnly cookies for token storage (requires backend changes)
  - Implementing refresh token rotation (requires backend changes)

#### Development Artifacts
- **Console.log statements**: ✅ **FIXED** - All console statements now use development-only logger
  - 77 console statements replaced with `logger` utility that only outputs in development
  - Production builds have zero console output, preventing data leakage
  - See `CONSOLE_CLEANUP.md` for details

#### Input Validation
- **Client-side validation only**: Current form validation happens only in the frontend
  - Backend should also validate all inputs (quantities, IDs, user data)
  - Implement sanitization for numeric inputs to prevent manipulation

#### Recommendations for Production
1. **Implement Error Boundaries**: Add React error boundaries to prevent full app crashes
2. **Route Protection**: Add route guards for protected pages (checkout, orders)
3. **CSRF Protection**: If migrating to cookies, implement CSRF token validation
4. **Rate Limiting**: Add debouncing for sensitive operations
5. **Environment Variables**: Never commit real API keys or secrets to version control

### Test Card Numbers (Stripe Development)
For testing payments in development mode:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155
- **Insufficient Funds**: 4000 0000 0000 9995

Use any future expiry date, any 3-digit CVC, and any postal code.

## 🧪 Testing Status

**Current Status**: ⚠️ **No test coverage**

This project currently has **zero automated tests**. For production deployment, implementing comprehensive testing is critical.

### Recommended Testing Strategy

#### 1. Unit Tests (Priority: High)
- Service layer functions (`authService`, `cartService`, `orderService`)
- Utility functions (`lib/utils`)
- Form validation schemas
- API interceptors and error handling

#### 2. Integration Tests (Priority: High)
- Context providers (`AuthContext`, `CartContext`)
- API communication flows
- Authentication flow (login → token storage → session restore)
- Cart management (add → update → checkout)

#### 3. E2E Tests (Priority: Medium)
- Critical user journeys:
  - Login → Browse products → Add to cart → Checkout → Order success
  - User registration → Email verification
  - Order tracking and management

### Recommended Testing Stack
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "playwright": "^1.40.0"
  }
}
```

### Test Coverage Goals
- **Minimum for Production**: 60% coverage on critical paths
- **Target**: 80% overall coverage
- **Critical**: 100% coverage on authentication and payment flows

## ⚠️ Known Issues & Limitations

### High Priority Issues
1. **No Error Boundaries**: Application crashes propagate to white screen instead of graceful fallback
2. ~~**Unsafe Logout**~~: ✅ **FIXED** - `authService.logout()` now properly awaits API response
3. **Missing Route Guards**: Users can manually navigate to protected routes without authentication
4. **Race Condition**: Cart may load before authentication is fully restored on page refresh

### Medium Priority Issues
1. **No Lazy Loading**: All route components load eagerly, increasing initial bundle size
2. **Magic Numbers**: Hard-coded values (tax rate 0.1, free shipping threshold 50) should be constants
3. **Inconsistent Error Handling**: No centralized error logging strategy
4. **Missing Input Sanitization**: Quantity inputs can accept negative or extremely large numbers

### Low Priority Issues
1. **Console Logs in Production**: Debugging statements not wrapped in environment checks
2. **Unused Variables**: TypeScript warnings for unused destructured variables
3. **Missing JSDoc**: Service methods lack documentation comments

### Performance Considerations
- **Bundle Size**: Current dist folder is 2.4MB (acceptable, but can be optimized)
- **No Bundle Analysis**: Consider adding `rollup-plugin-visualizer` to identify large dependencies
- **Header Re-renders**: Component re-renders on every cart/auth state change

## 🚀 Production Deployment Checklist

Before deploying to production, ensure you complete the following:

### Critical (Must Do)
- [x] Remove or environment-gate all `console.log` statements (✅ Completed - See `CONSOLE_CLEANUP.md`)
- [x] Fix logout to await API response (✅ Completed - Async logout with error handling)
- [x] Add Content Security Policy (CSP) headers (✅ Completed - CSP meta tag in index.html)
- [x] Add security meta tags (✅ Completed - X-Frame-Options, X-Content-Type-Options, etc.)
- [x] Add input validation/sanitization (✅ Completed - See `src/lib/validation.ts`)
- [x] Add API response validation (✅ Completed - Zod schemas for LoginResponse, UserResponse)
- [x] Update `.env.example` with all required variables (✅ Completed - Comprehensive .env.example created)
- [x] Add `.env` to `.gitignore` (✅ Completed - Prevents accidental commit of secrets)
- [x] Run dependency security audit (✅ Completed - Fixed axios vulnerability, upgraded to 1.13.2)
- [ ] Implement React Error Boundary components
- [ ] Add proper route guards for protected pages
- [ ] Configure environment variables in hosting platform
- [ ] Review and remove test/development Stripe keys from codebase
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)

### High Priority (Should Do)
- [ ] Implement basic test coverage (at least auth and cart flows)
- [ ] Add lazy loading for route components
- [ ] Extract magic numbers to named constants
- [ ] Optimize Header component with `React.memo`
- [ ] Add bundle size analysis to build pipeline
- [ ] Configure CSP headers in hosting environment
- [ ] Set up CI/CD pipeline with linting and build checks

### Medium Priority (Nice to Have)
- [ ] Migrate token storage to httpOnly cookies
- [ ] Implement refresh token rotation
- [ ] Add CSRF protection (if using cookies)
- [ ] Create centralized logging strategy
- [ ] Add accessibility audit with axe-core
- [ ] Implement analytics tracking
- [ ] Add bundle size limits to prevent bloat

### Security Checklist
- [x] All API keys are environment variables (not hardcoded) ✅
- [x] `.env` files are in `.gitignore` ✅
- [x] Security headers implemented (CSP, X-Frame-Options, etc.) ✅
- [x] Input sanitization for user data ✅
- [x] API response validation with Zod schemas ✅
- [x] JWT token format validation ✅
- [x] Async logout with server-side token invalidation ✅
- [x] No sensitive data logged in production ✅
- [ ] All user inputs are validated on both client and server
- [ ] HTTPS is enforced on production domain
- [ ] Stripe is in production mode with real keys
- [ ] Authentication flows are tested thoroughly

## 🔑 Key Features Explained

### Authentication Flow
1. User registers or logs in
2. JWT token stored in localStorage
3. Token automatically added to API requests via Axios interceptor
4. Session restored on page refresh
5. Logout clears token and redirects to login

### Cart Management
1. Products added to cart via ProductDetail or ProductList
2. Cart state managed with React Context and backend API
3. Cart items can be selected/deselected for checkout
4. Quantities updated in real-time
5. Cart badge in header shows total item count

### Checkout Process
1. User selects items in cart
2. Navigate to checkout page
3. Select or create shipping address
4. Choose payment method (Credit Card via Stripe, PayPal, or Cash on Delivery)
5. For credit card payments:
   - Enter card details in secure Stripe form
   - Stripe handles 3D Secure authentication if required
   - Test with card: 4242 4242 4242 4242 (any future expiry, any CVC)
6. Review order summary
7. Complete payment
8. Order confirmation with order ID

### Order Management
1. View all orders with filters (All, Pending, Paid, Shipped, etc.)
2. Track order status
3. View detailed order information
4. Cancel pending orders
5. Process payments for unpaid orders

## 🎨 UI Components

The project uses shadcn/ui components for a consistent, accessible UI:
- Alert Dialog
- Avatar
- Badge
- Breadcrumb
- Button
- Card
- Checkbox
- Dialog
- Dropdown Menu
- Form
- Input
- Label
- Pagination
- Radio Group
- Scroll Area
- Select
- Separator
- Sheet
- Skeleton
- Table
- Tabs
- Toast (Sonner)

## 🔧 Configuration

### API Integration
The base API URL is configured in `src/services/api.js`:
```javascript
baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") + "/api"
```

### Routing
All routes are defined in `src/App.jsx`:
- `/` - Login page
- `/login` - Login/Register
- `/products` - Product listing
- `/products/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/order-success/:orderId` - Order confirmation

## 🌐 API Endpoints Used

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Products**: `/api/products`, `/api/products/:id`
- **Cart**: `/api/cart`, `/api/cart/add`, `/api/cart/update`, `/api/cart/remove`
- **Orders**: `/api/orders`, `/api/orders/:id`, `/api/orders/generate-token`
- **Addresses**: `/api/addresses`, `/api/addresses/create`
- **Payments**: `/api/payments/checkout`, `/api/payments/order/:orderId`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**bugisthegod**
- GitHub: [@bugisthegod](https://github.com/bugisthegod)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

Built with ❤️ using React and Vite
