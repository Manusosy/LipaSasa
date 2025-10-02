import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GetStarted from "./pages/onboarding/GetStarted";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Invoices from "./pages/dashboard/Invoices";
import Transactions from "./pages/dashboard/Transactions";
import MpesaSetup from "./pages/dashboard/MpesaSetup";
import ApiIntegrations from "./pages/dashboard/ApiIntegrations";
import Subscription from "./pages/dashboard/Subscription";
import Settings from "./pages/dashboard/Settings";
import PayInvoice from "./pages/pay/[invoiceId]";
import { AboutUs } from "./pages/about";
import { ContactUs } from "./pages/contact";
import { ApiDocs } from "./pages/docs";
import { Blog } from "./pages/blog";
import { Careers } from "./pages/careers";
import { PressKit } from "./pages/press";
import { HelpCenter } from "./pages/help";
import { SystemStatus } from "./pages/status";
import { TermsOfService } from "./pages/terms";
import { PrivacyPolicy } from "./pages/privacy";
import { AuthPage } from "./pages/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard Routes - No Header/Footer */}
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/dashboard/invoices" element={<Invoices />} />
          <Route path="/dashboard/transactions" element={<Transactions />} />
          <Route path="/dashboard/mpesa-setup" element={<MpesaSetup />} />
          <Route path="/dashboard/api" element={<ApiIntegrations />} />
          <Route path="/dashboard/subscription" element={<Subscription />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/pay/:invoiceId" element={<PayInvoice />} />
          
          {/* Main Site Routes - With Header/Footer */}
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/get-started" element={<Layout><GetStarted /></Layout>} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
          <Route path="/docs" element={<Layout><ApiDocs /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/careers" element={<Layout><Careers /></Layout>} />
          <Route path="/press" element={<Layout><PressKit /></Layout>} />
          <Route path="/help" element={<Layout><HelpCenter /></Layout>} />
          <Route path="/status" element={<Layout><SystemStatus /></Layout>} />
          <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
          <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
          <Route path="/auth" element={<Layout><AuthPage /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
