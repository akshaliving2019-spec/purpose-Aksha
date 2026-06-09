import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { LanguageProvider } from '@/contexts/LanguageContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HomePage from '@/pages/HomePage.jsx';
import DiscoveryPage from '@/pages/DiscoveryPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import SciencePage from '@/pages/SciencePage.jsx';
import SampleAnalysisPage from '@/pages/SampleAnalysisPage.jsx';
import PricingPage from '@/pages/PricingPage.jsx';
import WhyWeExistPage from '@/pages/WhyWeExistPage.jsx';
import CheckoutPage from '@/pages/CheckoutPage.jsx';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage.jsx';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/science" element={<SciencePage />} />
              <Route path="/sample-analysis" element={<SampleAnalysisPage />} />
              <Route path="/discover" element={<DiscoveryPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/why-we-exist" element={<WhyWeExistPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/thank-you" element={<PaymentSuccessPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
