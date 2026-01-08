import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/WebPage/HomePage";
import UpdatesPage from "./pages/WebPage/UpdatesPage";
import ContactUsPage from "./pages/WebPage/ContactUsPage";
import AboutUsPage from "./pages/WebPage/AboutUsPage";
import DisclaimerPage from "./pages/WebPage/DisclaimerPage";
import RefundPolicyPage from "./pages/WebPage/RefundPolicyPage";
import DisclosuresPage from "./pages/WebPage/DisclosuresPage";
import TermsAndConditionPage from "./pages/WebPage/TermsAndConditionPage";
import PrivacyPolicyPage from "./pages/WebPage/PrivacyPolicyPage";
import FAQPage from "./pages/WebPage/FAQPage";
import WebLayout from "./Layouts/WebLayout";
import DashboardLayout from "./Layouts/DashboardLayout";
import Homepage from "./pages/DashboardPage/Homepage";
import UpdatesPageDashboard from "./pages/DashboardPage/UpdatesPage";
import ProfitPage from "./pages/DashboardPage/ProfitPage";
import FeedBackPage from "./pages/DashboardPage/FeedBackPage";
import LearnFromUsPage from "./pages/DashboardPage/LearnFromUsPage";
import CalculatorsPage from "./pages/DashboardPage/CalculatorsPage";
import { RiskProvider } from "./contexts/RiskContext";
import Notifications from "./Components/Dashboard/Notifications";
import MyProfilePage from "./pages/DashboardPage/MyProfilePage";
import MyPlanPage from "./pages/DashboardPage/MyPlanPage";
import MarketDepthPage from "./pages/DashboardPage/MarketDepthPage";
import MonryActionPage from "./pages/DashboardPage/MoneyActionPage";
import AiSwingTradesPage from "./pages/DashboardPage/AiSwingTradesPage";
import OptionClockPage from "./pages/DashboardPage/OptionClockPage";
import FinancialCalendar from "./pages/DashboardPage/FinancialCalendar";
import OurStrategy from "./pages/DashboardPage/OurStrategy";
import TradingJournal from "./pages/DashboardPage/TradingJournal";
import IndexDepthPage from "./pages/DashboardPage/IndexDepthPage";
import FIIDIIPage from "./pages/DashboardPage/FIIDIIPage";
import AiSectorDepthPage from "./pages/DashboardPage/AiSectorDepthPage";
import TestRazorpay from "./pages/DashboardPage/TestRazorpay";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./utils/ProtectedRoutes";
import RequireAuthAndSubscription from "./utils/RequireAuthAndSubscription";
// import RequireAuth from "./components/auth/RequireAuth";
import Testimonials from "./pages/WebPage/Testimonial";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import PasswordChanged from "./pages/PasswordChanged";
import OTPModal from "./pages/OTPModal";
import Home from "./pages/AdminPages/Home";
import ProtectedRouteAdmin from "./utils/admin/ProtectedRouteAdmin";
import AdminLogin from "./pages/AdminPages/AdminLogin";
import LatestTransactions from "./pages/AdminPages/LatestTransactions";
import ManageOrders from "./pages/AdminPages/ManageOrders";
import Feedback from "./pages/AdminPages/Feedback";
import Ticker from "./pages/AdminPages/Ticker";
import PaymentMethod from "./pages/AdminPages/PaymentMethod";
import Updates from "./pages/AdminPages/Updates";
import DataAPI from "./pages/AdminPages/DataAPI";
import Profile from "./pages/AdminPages/Profile";
import SettingsUpload from "./pages/AdminPages/SettingsUpload";
import OurStrategyAdmin from "./pages/AdminPages/OurStrategyAdmin";
import Dashboard from "./pages/AdminPages/Dashboard";
import { AdminAuthProvider } from "./contexts/adminContext/AdminAuthContext";
import StockDetails from "./pages/AdminPages/StockDetails";
import AIOptionInsiderPage from "./pages/DashboardPage/AIOptionInsiderPage";
import Coupon from "./pages/AdminPages/Coupon";
import { Toaster } from "react-hot-toast";
import AIOptionDataPage from "./pages/DashboardPage/AiOptionDataPage";
import MaintenancePage from "./pages/WebPage/MaintenancePage";

const App = () => {
  return (
    <>
      <div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          containerStyle={{ zIndex: 9999999 }}
        />
        <AdminAuthProvider>
          <AuthProvider>
            <RiskProvider>
              <ScrollToTop />
              <Routes>
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<RegisterPage />} />
                <Route path="forget-password" element={<ForgetPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="password-changed" element={<PasswordChanged />} />
                <Route path="otp" element={<OTPModal />} />
                <Route path="/" element={<WebLayout />}>
                  <Route index element={<HomePage />} />

                  <Route path="/updates" element={<UpdatesPage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                  <Route path="/refund-policy" element={<RefundPolicyPage />} />
                  <Route path="/disclosures" element={<DisclosuresPage />} />
                  <Route
                    path="/terms-and-condition"
                    element={<TermsAndConditionPage />}
                  />
                  <Route
                    path="/privacy-policy"
                    element={<PrivacyPolicyPage />}
                  />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/testimonial" element={<Testimonials />} />
                </Route>

                {/* ----------------------------ALL PROTECTED ROUTE--------------------------------------- */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Homepage />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="profile" element={<MyProfilePage />} />
                    <Route path="plan" element={<MyPlanPage />} />
                    
                    {/* Routes requiring both Auth and Subscription */}
                    <Route element={<RequireAuthAndSubscription />}>
                      <Route path="market-depth" element={<MarketDepthPage />} />
                      <Route path="smart-action" element={<MonryActionPage />} />
                      <Route
                        path="swing-trades"
                        element={<AiSwingTradesPage />}
                      />
                      <Route path="option-clock" element={<OptionClockPage />} />
                      <Route path="option-data" element={<AIOptionDataPage />} />
                      <Route
                        path="option-insider"
                        element={<AIOptionInsiderPage />}
                      />
                      <Route path="index-depth" element={<IndexDepthPage />} />
                      <Route path="fii-dii" element={<FIIDIIPage />} />
                      <Route
                        path="sector-depth"
                        element={<AiSectorDepthPage />}
                      />
                      <Route path="updates" element={<UpdatesPageDashboard />} />
                      <Route path="profit" element={<ProfitPage />} />
                      <Route path="feedback" element={<FeedBackPage />} />
                      <Route path="learn-from-us" element={<LearnFromUsPage />} />
                      <Route path="calculator" element={<CalculatorsPage />} />
                      <Route path="calender" element={<FinancialCalendar />} />
                      <Route path="our-strategy" element={<OurStrategy />} />
                      <Route
                        path="trading-journal"
                        element={<TradingJournal />}
                      />
                      <Route path="testing-razorpay" element={<TestRazorpay />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route element={<ProtectedRouteAdmin />}>
                  <Route path="/admin" element={<Home />}>
                    <Route index element={<Dashboard />} />
                    <Route
                      path="manage-users"
                      element={<LatestTransactions />}
                    />
                    <Route path="manage-orders" element={<ManageOrders />} />
                    <Route path="feedback" element={<Feedback />} />
                    <Route path="ticker" element={<Ticker />} />
                    <Route path="coupon" element={<Coupon />} />
                    <Route path="payment-method" element={<PaymentMethod />} />
                    <Route path="updates" element={<Updates />} />
                    <Route path="data-api" element={<DataAPI />} />
                    <Route path="our-strategy" element={<OurStrategyAdmin />} />
                    <Route path="stockdetails" element={<StockDetails />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="setting" element={<SettingsUpload />} />
                  </Route>
                </Route>
              </Routes>
            </RiskProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </div>{" "}
    </>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default App;
