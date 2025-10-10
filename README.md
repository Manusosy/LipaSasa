# LipaSasa - FinTech SaaS Platform

**LipaSasa** is a no-custody FinTech SaaS for East Africa that lets SMEs and freelancers accept payments via M-Pesa (Paybill/Till) and bank, using invoice and payment links. LipaSasa does not hold merchant funds; payments go directly to the merchant’s configured destination. We only charge SaaS subscriptions.

## 🚀 What is LipaSasa?

LipaSasa eliminates the complexity of payment integrations by providing:

- **Simple Dashboard** for managing invoices, payment links, and customers
- **M-Pesa Support** to your Paybill/Till (no Daraja keys required from merchants)
- **Bank Settlement** to local accounts (Equity, KCB, NCBA, Co-op, ABSA, Stanbic, DTB)
- **WhatsApp-First Experience** for seamless customer interactions
- **Professional Invoicing** with automated receipt generation
- **Admin Dashboard** for platform management and analytics

## 🎯 Key Features

### For Business Owners (Sellers)

- Configure how you get paid: M-Pesa Paybill, M-Pesa Till, or Bank
- Create invoices and shareable payment links
- Customers get an STK push on link checkout
- Track payment status in real-time
- Export reports and get notifications

### For Platform Administrators

- User management and analytics
- Monitor transactions and webhooks (no funds custody)
- Subscription management
- System logs, security, compliance

## 🛠 Technology Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Functions)
- **Payments:** Aggregator connector to Safaricom M-Pesa (STK Push), bank payout rails
- **Billing:** Lemon Squeezy
- **Notifications:** Email + WhatsApp API
- **Hosting:** Vercel
- **Build Tool:** Vite

## 🏗 Project Structure

```text
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
│   │   ├── PaymentLinks.tsx  # Manage payment links
│   │   └── PaymentMethods.tsx # Configure M-Pesa/Bank
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
**Secondary:** East Africa (Uganda, Tanzania, Rwanda)

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

## 📈 Roadmap (high level)

- Aggregator connector for STK Push (no merchant Daraja keys)
- Merchant APIs: create invoice, initiate STK, check status, register webhooks
- Webhooks, idempotency, rate limits, signature verification
- Settlement methods for banks across East Africa

## 🤝 Contributing

To contribute:

1. Use the Lovable interface for rapid development
2. Or clone locally and push changes
3. Follow the existing code patterns and design system

## 🌍 Market Impact

LipaSasa aims to democratize payment collection for African SMEs, making it as easy to accept digital payments as it is to receive cash. By leveraging existing M-Pesa infrastructure while providing modern SaaS tools, we're bridging traditional and digital commerce.

---

See DEVELOPMENT.md for engineering details and next steps.
