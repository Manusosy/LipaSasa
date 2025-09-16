# LipaSasa - FinTech SaaS Platform

**LipaSasa** is a comprehensive SaaS platform that enables SMEs and freelancers in Kenya to collect payments easily via M-Pesa Paybill/Till, Airtel Money, and card payments. Built for simplicity and efficiency, LipaSasa bridges the gap between traditional payment methods and modern business needs.

## 🚀 What is LipaSasa?

LipaSasa eliminates the complexity of payment integrations by providing:

- **Simple Dashboard** for managing invoices, payment links, and customers
- **M-Pesa Integration** via existing Paybill/Till numbers
- **Multi-Payment Support** including Airtel Money and card payments
- **WhatsApp-First Experience** for seamless customer interactions
- **Professional Invoicing** with automated receipt generation
- **Admin Dashboard** for platform management and analytics

## 🎯 Key Features

### For Business Owners (Sellers)
- Link existing M-Pesa Paybill/Till numbers
- Create and share professional invoices
- Generate payment links instantly
- Track customer payments and history
- Export financial reports
- WhatsApp integration for payment notifications

### For Platform Administrators
- User management and analytics
- Transaction monitoring across all users
- Subscription management via Lemon Squeezy
- System logs and compliance reporting
- Platform-wide KPIs and insights

## 🛠 Technology Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Functions)
- **Payment Processors:** Flutterwave, Paystack
- **Billing:** Lemon Squeezy
- **Notifications:** Email + WhatsApp API
- **Hosting:** Vercel
- **Build Tool:** Vite

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn-ui components
│   ├── Header.tsx      # Navigation header
│   ├── HeroSection.tsx # Landing page hero
│   └── ...
├── pages/              # Application pages
│   ├── Index.tsx       # Landing page
│   ├── onboarding/     # Step-by-step setup
│   ├── dashboard/      # User dashboards
│   └── admin/          # Admin interface
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── integrations/       # Third-party integrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd lipasasa

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📋 Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=development
```

## 🎨 Design System

ChapaPay uses a carefully crafted design system with:

- **Colors:** Professional blue/green palette with semantic tokens
- **Typography:** Inter font family with proper hierarchy
- **Components:** Consistent shadcn-ui based components
- **Animations:** Smooth transitions and micro-interactions
- **Responsive:** Mobile-first design approach

## 📱 Target Market

**Primary:** Kenya (M-Pesa ecosystem)
**Secondary:** East Africa (Uganda, Tanzania)
**Future:** West Africa (Nigeria, Ghana)

## 💰 Business Model

- **Starter Plan:** $9/month - Basic features
- **Pro Plan:** $29/month - Advanced features + analytics
- **Enterprise:** Custom pricing for large businesses

## 🔒 Security & Compliance

- Encrypted storage of payment credentials
- GDPR-compliant data handling
- Webhook validation for payment confirmations
- Role-based access control
- Audit logs for all transactions

## 📈 Roadmap

**Phase 1 (Current):** Core invoice creation, M-Pesa integration, basic dashboards
**Phase 2:** Airtel Money, AI invoice assistant, advanced analytics
**Phase 3:** Multi-country expansion, API for developers

## 🤝 Contributing

To contribute:
1. Use the Lovable interface for rapid development
2. Or clone locally and push changes
3. Follow the existing code patterns and design system

## 🌍 Market Impact

LipaSasa aims to democratize payment collection for African SMEs, making it as easy to accept digital payments as it is to receive cash. By leveraging existing M-Pesa infrastructure while providing modern SaaS tools, we're bridging traditional and digital commerce.

---

**Built with Lovable** - Turning ideas into production-ready applications.
