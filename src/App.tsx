import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useLogoStore } from "./store/logoStore";

// Layout Components
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { VerifyOtpPage } from "./pages/auth/VerifyOtpPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

// Dashboard Pages
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { CategoriesPage } from "./pages/categories/CategoriesPage";
import { SubCategoriesPage } from "./pages/subcategories/SubCategoriesPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { ProductFormPage } from "./pages/products/ProductFormPage";
import { UsersPage } from "./pages/users/UsersPage";
import { OrdersPage } from "./pages/orders/OrdersPage";
import { PaymentsPage } from "./pages/payments/PaymentsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { BannersPage } from "./pages/banners/BannersPage";
import { CustomerReviewsPage } from "./pages/customer-reviews/CustomerReviewsPage";
import { ReelsPage } from "./pages/reels/ReelsPage";
import { CouponsPage } from "./pages/coupons/CouponsPage";
import { HomeScreenPage } from "./pages/homescreen/HomeScreenPage";
import { SmsConfigPage } from "./pages/system/SmsConfigPage";
import { EmailConfigPage } from "./pages/system/EmailConfigPage";
import { PaymentConfigPage } from "./pages/system/PaymentConfigPage";
import { GoogleMapsConfigPage } from "./pages/system/GoogleMapsConfigPage";
import { FirebaseConfigPage } from "./pages/system/FirebaseConfigPage";
import { SupportConfigPage } from "./pages/system/SupportConfigPage";
import { LogosPage } from "./pages/logos/LogosPage";
import { GoldRatePage } from "./pages/gold-rate/GoldRatePage";
import { ChargesConfigPage } from "./pages/system/ChargesConfigPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { ContactSubmissionsPage } from "./pages/contact/ContactSubmissionsPage";
import { StaticPagesPage } from "./pages/static-pages/StaticPagesPage";
import { StoresPage } from "./pages/stores/StoresPage";
import { RolesPage } from "./pages/team/RolesPage";
import { StaffPage } from "./pages/team/StaffPage";

function useApplyBrandAssets() {
  const byType = useLogoStore((s) => s.byType);
  const fetchLogos = useLogoStore((s) => s.fetch);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  useEffect(() => {
    const faviconUrl = byType.favicon?.imageUrl;
    if (!faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [byType.favicon?.imageUrl]);

  useEffect(() => {
    const title = byType.primary?.title || byType.favicon?.title;
    if (title) document.title = `${title} Admin`;
  }, [byType.primary?.title, byType.favicon?.title]);
}

function App() {
  useApplyBrandAssets();
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/home-screen" element={<HomeScreenPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/subcategories" element={<SubCategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/banners" element={<BannersPage />} />
            <Route path="/customer-reviews" element={<CustomerReviewsPage />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/system/sms" element={<SmsConfigPage />} />
            <Route path="/system/email" element={<EmailConfigPage />} />
            <Route path="/system/payment" element={<PaymentConfigPage />} />
            <Route path="/system/google-maps" element={<GoogleMapsConfigPage />} />
            <Route path="/system/firebase" element={<FirebaseConfigPage />} />
            <Route path="/system/support" element={<SupportConfigPage />} />
            <Route path="/logos" element={<LogosPage />} />
            <Route path="/gold-rate" element={<GoldRatePage />} />
            <Route path="/system/charges" element={<ChargesConfigPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/contact-submissions" element={<ContactSubmissionsPage />} />
            <Route path="/static-pages" element={<StaticPagesPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
