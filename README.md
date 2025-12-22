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
│   │   │   ├── Header.jsx  # App header with cart badge
│   │   │   └── Footer.jsx  # App footer
│   │   └── ui/             # shadcn/ui components
│   │       ├── button.jsx
│   │       ├── card.jsx
│   │       ├── form.jsx
│   │       ├── input.jsx
│   │       └── ... (20+ components)
│   ├── lib/
│   │   └── utils.js        # Utility functions
│   ├── pages/
│   │   ├── Login.jsx       # Login & registration page
│   │   ├── ProductList.jsx # Product catalog with pagination
│   │   ├── ProductDetail.jsx # Individual product page
│   │   ├── Cart.jsx        # Shopping cart management
│   │   ├── Checkout.jsx    # Checkout with address & payment
│   │   ├── Orders.jsx      # Order history & management
│   │   └── OrderSuccess.jsx # Order confirmation page
│   ├── services/
│   │   ├── api.js          # Axios instance & interceptors
│   │   ├── authService.js  # Authentication API calls
│   │   ├── productService.js # Product API calls
│   │   ├── cartService.js  # Cart API calls
│   │   ├── orderService.js # Order API calls
│   │   └── addressService.js # Address API calls
│   ├── store/
│   │   ├── authContext.jsx # Authentication state management
│   │   └── cartContext.jsx # Cart state management
│   ├── types/
│   │   └── Product.ts      # TypeScript type definitions
│   ├── App.jsx             # Main app component
│   ├── App.css             # App styles
│   ├── main.jsx            # App entry point
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
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Note**: For Stripe integration, you'll need a Stripe account. Get your publishable key from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). Use test mode keys (pk_test_...) during development.

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

## 💳 Stripe Testing

For testing Stripe payments in development, use these test card numbers:

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure Required**: 4000 0025 0000 3155
- **Insufficient Funds**: 4000 0000 0000 9995

Use any future expiry date, any 3-digit CVC, and any postal code.

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
