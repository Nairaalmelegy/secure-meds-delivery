# MediLink Frontend - Secure Meds Delivery Platform

A comprehensive healthcare platform for medicine delivery, prescription management, and doctor-patient interactions.

## Author

Naira Almelegy: `nairaalmelegy@gmail.com`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=MediLink
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React


## 🔐 Authentication & Security

- **JWT tokens** now stored in **HttpOnly, Secure cookies** (no localStorage)
- **Strict Content Security Policy (CSP)** enforced by backend
- **CSRF protection**: All state-changing requests require a CSRF token (see `/api/csrf-token`)
- **XSS protection**: All user-generated HTML is sanitized with **DOMPurify** before rendering
- **Password strength indicator and requirements** on registration form
- **Automatic token refresh** on API calls
- **Redirect to login** on 401 responses
- **Role-based access control (RBAC)**

### Default Admin Credentials
- **Email**: `Pharmatec@fayoum.com`
- **Password**: `Pharmatec@5173`
- ⚠️ **Security Notice**: Admin must change password on first login

### Protected Routes
- `/admin` - Pharmacy admin only
- `/dashboard` - Patient only  
- `/doctor-dashboard` - Doctor only (requires admin approval)
- `/pharmacy-dashboard` - Pharmacy only
- `/profile`, `/account-settings` - All authenticated users

## 👥 User Roles & Permissions

### Patient
- Order medicines and track deliveries
- Upload and manage prescriptions
- View medical records
- Manage profile and account settings

### Doctor
- View and verify patient prescriptions
- Search patients by National ID
- Access patient medical records
- Earn commissions/points from patient orders
- **Note**: Requires pharmacy admin approval to access features

### Pharmacy/Admin
- Manage medicine inventory
- Process and fulfill orders
- Approve/reject doctor registrations
- View analytics and reports
- Manage user accounts

## 🌐 API Integration

### Backend Endpoints Used

#### Authentication
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

#### User Management
```typescript
GET /api/users/me
PUT /api/users/me
PUT /api/users/me/password
GET /api/users?role=doctor&status=pending
PUT /api/users/:id/approve
PUT /api/users/:id/reject
```

#### Medicines
```typescript
GET /api/medicines
GET /api/medicines/search?q=searchTerm
GET /api/medicines/:id
```

#### Prescriptions
```typescript
POST /api/prescriptions/upload
GET /api/prescriptions/my
PUT /api/prescriptions/:id/verify
```

#### Orders
```typescript
POST /api/orders
GET /api/orders/my
GET /api/orders/:id
PUT /api/orders/:id/status
```

#### Commissions
```typescript
GET /api/commissions
```

### Request/Response Examples

#### Login Request
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```typescript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64xxxx",
    "name": "John Doe", 
    "email": "user@example.com",
    "role": "patient"
  }
}
```

#### Create Order Request
```typescript
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "medicines": [
    { "id": "med123", "qty": 2 },
    { "id": "med456", "qty": 1 }
  ],
  "address": "123 Main Street, Cairo, Egypt"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Medical Blue (`hsl(210 100% 50%)`)
- **Secondary**: Medical Green (`hsl(157 65% 48%)`)
- **Success**: Green (`hsl(157 65% 48%)`)
- **Warning**: Orange (`hsl(43 96% 56%)`)
- **Destructive**: Red (`hsl(0 84% 60%)`)

### Typography
- **Font Family**: Inter (system fallbacks)
- **Headings**: Bold weights with proper hierarchy
- **Body**: Regular weight, optimized for readability

### Components
All UI components follow healthcare design principles:
- Clean, minimal aesthetic
- High contrast for accessibility
- Consistent spacing and typography
- Responsive design patterns

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   └── AdminRoute.tsx      # Admin-only route wrapper
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   └── CartContext.tsx     # Shopping cart state
├── hooks/
│   ├── use-toast.ts        # Toast notifications
│   └── use-mobile.tsx      # Mobile detection
├── lib/
│   ├── api.ts             # API client and endpoints
│   └── utils.ts           # Utility functions
├── pages/
│   ├── Index.tsx          # Landing page
│   ├── Login.tsx          # Login page
│   ├── Register.tsx       # Registration page
│   ├── Dashboard.tsx      # Patient dashboard
│   ├── DoctorDashboard.tsx # Doctor dashboard
│   ├── PharmacyDashboard.tsx # Admin/pharmacy dashboard
│   ├── AccountSettings.tsx # Account management
│   └── ...                # Other pages
└── App.tsx                # Main app component
```

## 🔄 State Management

### Authentication Context
- User authentication state
- Login/logout functions
- Token management
- Role-based access control

### Cart Context  
- Shopping cart items
- Add/remove items
- Quantity management
- Checkout calculations

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
vercel --prod
```

## 🧪 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Use semantic HTML elements
- Ensure responsive design

### Security Considerations
- Validate all user inputs
- Sanitize data before API calls
- Implement proper error boundaries
- Use HTTPS in production
- Regular security audits

### Performance
- Lazy load components where appropriate
- Optimize images and assets
- Implement proper loading states
- Use React.memo for expensive components

## 🐛 Troubleshooting

### Common Issues

#### Authentication Failures
- Check backend server is running
- Verify API endpoint URLs
- Ensure tokens haven't expired
- Check network connectivity

#### CORS Errors
- Configure backend CORS settings
- Verify API base URL in environment variables

#### Build Failures
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all imports are correct

### Debug Mode
Enable development mode for detailed error messages:
```bash
npm run dev
```

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review API documentation
- Contact the development team

## 🔮 Future Enhancements

- Implement real-time notifications
- Add payment gateway integration
- Mobile app development
- Advanced analytics dashboard
- Multi-language support
- PWA capabilities

---

**Last Updated**: January 2025
**Version**: 1.0.0
