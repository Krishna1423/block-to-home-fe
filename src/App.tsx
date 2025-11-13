import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { wagmiConfig } from "@/lib/wagmi";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PropertyTokenization from "./pages/PropertyTokenization";
import MortgageApplication from "./pages/MortgageApplication";
import InvestorPool from "./pages/InvestorPool";
import GetStarted from "./pages/GetStarted";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WalletProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/get-started" element={<GetStarted />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tokenize"
                    element={
                      <ProtectedRoute>
                        <PropertyTokenization />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mortgage"
                    element={
                      <ProtectedRoute>
                        <MortgageApplication />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invest"
                    element={
                      <ProtectedRoute>
                        <InvestorPool />
                      </ProtectedRoute>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WalletProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
};

export default App;
