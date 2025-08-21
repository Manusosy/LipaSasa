# 📘 Product Requirements Document (PRD)

**Product Name:** ChapaPay
**Category:** FinTech SaaS (Payment Links + Invoicing)
**Primary Market:** Kenya (M-Pesa Paybill/Till, Airtel Money), later expand to East/West Africa.
**Business Model:** SaaS subscription (Starter $9/mo, Pro $29/mo).

---

## 1. Product Overview

ChapaPay is a SaaS platform that enables SMEs and freelancers to **collect payments easily** via **M-Pesa Paybill/Till, Airtel Money, and card payments** by leveraging existing PSPs (Flutterwave, Paystack).

Instead of merchants setting up heavy integrations, ChapaPay provides:

* A **simple dashboard** to manage invoices, payment links, customers, and receipts.
* An **admin dashboard** for platform owner(s) to manage users, payments, and subscriptions.
* Seamless **WhatsApp-first payment experience** for customers.

**Key Differentiator:** Businesses can link their **already registered Paybill/Till numbers or Airtel Money accounts** into ChapaPay and instantly generate professional invoices & links.

---

## 2. Users & Roles

1. **Seller (SME/Freelancer/Business owner)**

   * Signs up, configures payment methods (Paybill, Till, Airtel, Flutterwave/Paystack).
   * Creates and shares payment links & invoices.
   * Tracks customer payments.
   * Manages account & subscription.

2. **Platform Owner (You/Admin)**

   * Manages users (approve/reject, suspend, delete).
   * Views platform-wide analytics (revenue, active users, transaction volume).
   * Manages subscription plans & billing (via Lemon Squeezy).
   * Oversees support, logs, and compliance.

---

## 3. System Architecture

* **Frontend:** Next.js (Vercel hosting)
* **Backend:** Supabase (Postgres + Auth + Functions)
* **Payment Integrations:**

  * **M-Pesa (Paybill/Till via Flutterwave/Paystack APIs)**
  * **Airtel Money (via PSP)**
  * **Card Payments (via PSP)**
* **Billing (for SaaS):** Lemon Squeezy (Merchant-of-Record for subscriptions)
* **Notifications:** Email (via Resend/SendGrid) + WhatsApp templates (via Twilio/360Dialog)
* **Storage:** Supabase Storage (for receipts, invoice PDFs)
* **Analytics:** Supabase logs + optional Posthog/Segment

---

## 4. User Dashboard (Seller)

### 4.1 Pages & Features

#### **1. Onboarding & Setup**

* **Fields:** Business Name, Contact Info, Country, Industry.
* **Payment Setup:**

  * Add M-Pesa Paybill/Till (verify with test payment).
  * Add Airtel Money account.
  * Connect Flutterwave/Paystack (OAuth).
* **Subscription Setup:** Redirect to Lemon Squeezy checkout.
* **Confirmation:** Dashboard only unlocked once subscription is active.

---

#### **2. Dashboard Home**

* **Metrics Summary (cards):**

  * Total Received (KSh + breakdown by method)
  * Pending Invoices
  * Active Customers
  * Month-to-Date Revenue
* **Graph:** Payments over time (daily/weekly/monthly).
* **Recent Activity Feed:** Paid/Unpaid invoices.

---

#### **3. Invoices / Payment Links**

* **Create Invoice:**

  * Fields: Customer Name, Phone/Email, Items, Amount, Due Date.
  * Auto-generate Payment Link via API (PSP).
  * AI Helper: Parse free-text invoice description.
* **Manage Invoices:**

  * List view: Status (Paid, Pending, Overdue).
  * Download PDF invoice.
  * Resend via WhatsApp/Email.

---

#### **4. Customers**

* **List of customers** (Name, Contact, Total Paid, Outstanding Balance).
* **Customer Profile:** Transaction history, average invoice size, preferred payment method.

---

#### **5. Receipts & Reports**

* Auto-generated PDF receipts per payment.
* Bulk export (CSV/Excel) for accounting.
* Monthly/Quarterly statement downloads.

---

#### **6. Subscription & Billing**

* View current plan (Starter/Pro).
* Upgrade/Downgrade.
* Cancel subscription (requires confirmation step).

---

#### **7. Account Settings**

* Edit profile info.
* Manage connected payment methods (Paybill/Till/Airtel/Flutterwave).
* Security: Change password, 2FA.
* **Account Deletion Request:**

  * User requests deletion.
  * System triggers confirmation email + admin approval.
  * Data anonymized & account closed after approval.

---

## 5. Admin Dashboard (Platform Owner)

### 5.1 Pages & Features

#### **1. Admin Home**

* **Platform KPIs:**

  * Total Users (Active, Inactive).
  * Total Transactions (volume, amount).
  * Subscription Revenue (via Lemon Squeezy API).
  * Top payment methods used (M-Pesa, Airtel, Cards).
* **Recent User Activity Feed.**

---

#### **2. User Management**

* Search, filter, and view all registered sellers.
* User status: Active, Suspended, Deleted.
* Force reset password / suspend user.
* Review & approve deletion requests.

---

#### **3. Payments Overview**

* View aggregated payments across all users.
* Sort by PSP (M-Pesa, Airtel, Card).
* Export data for compliance/reporting.

---

#### **4. Subscription Management**

* Pull subscription data from Lemon Squeezy.
* View revenue by plan.
* Identify churned users.

---

#### **5. System Logs**

* API call logs (failed/successful PSP requests).
* Webhook event logs.
* Error reports.

---

#### **6. Settings (Platform Level)**

* Update branding (logo, app colors).
* Configure PSP API keys (global).
* Configure email/WhatsApp providers.

---

## 6. Infrastructure Needed

1. **Core Backend:** Supabase (Auth, Postgres, Functions).
2. **Payment Integrations:**

   * Flutterwave/Paystack for M-Pesa, Airtel, Card.
   * Direct PSP credentials managed securely.
3. **Billing for SaaS:** Lemon Squeezy subscription handling.
4. **Notifications:** Email (SendGrid/Resend) + WhatsApp API.
5. **Hosting:** Vercel for frontend/backend routes.
6. **Storage:** Supabase for receipts/invoices.
7. **Analytics:** Built-in + optional Posthog for behavior tracking.

---

## 7. Data Model (Simplified)

**Users Table**

* id, name, email, role (seller/admin), subscription_status

**Payment_Methods Table**

* id, user_id, type (Paybill, Till, Airtel, Flutterwave), credentials

**Invoices Table**

* id, user_id, customer_id, amount, status (paid/pending), payment_link, due_date

**Customers Table**

* id, user_id, name, phone, email, total_paid

**Transactions Table**

* id, invoice_id, amount, payment_method, PSP_reference, status, timestamp

**Deletion Requests Table**

* id, user_id, status (pending, approved, rejected), requested_at

---

## 8. Security & Compliance

* **All PSP credentials encrypted** in DB.
* **Webhook validation** (signatures) for payment confirmation.
* GDPR-style **data deletion handling**.
* Role-based access control (Seller vs Admin).

---

## 9. Roadmap

**Phase 1:** Core invoice creation, M-Pesa Paybill/Till integration, Flutterwave/Paystack link generation, WhatsApp sharing, dashboards.
* **Phase 2:** Airtel Money, AI invoice assistant, PDF receipts.
* **Phase 3:** Multi-country rollout (Nigeria, Uganda, Ghana).