import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Building2, PiggyBank, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import blockToHomeFlow from "@/assets/BlockToHome_flow.png";
import logo from "@/assets/logo.svg";

const GetStarted: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, connect } = useWallet();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isConnected) {
      navigate(from);
    }
  }, [isConnected, navigate, from]);

  const handleConnect = async () => {
    if (!isConnected) {
      connect();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-naples-yellow/5">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-28 w-28 mx-auto mb-8 rounded-full bg-naples-yellow flex items-center justify-center shadow-lg">
                <img src={logo} alt="BlockToHome Logo" className="h-24 w-24" />
              </div>

              <h1 className="text-5xl font-bold mb-6 text-yale-blue font-montserrat">
                Welcome to the Future of Mortgage Financing
              </h1>

              <p className="text-2xl text-gray-700 mb-4">
                BlockToHome is a smarter way to finance homes
              </p>
              <p className="text-2xl text-gray-700 mb-8">One Block at a Time</p>
              <p className="text-lg text-gray-500 mb-4 max-w-2xl mx-auto">
                Join the revolution in property tokenization and mortgage
                solutions.
              </p>
              <p className="text-lg text-gray-500 mb-4 max-w-2xl mx-auto">
                Own property. Invest globally. Powered by blockchain.
              </p>
            </div>

            <div className="mb-12">
              <div className="w-full max-w-4xl mx-auto bg-naples-yellow p-2 rounded-xl shadow-lg">
                <img
                  src={blockToHomeFlow}
                  alt="BlockToHome Flow"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center gap-4">
                <Link
                  to="/"
                  className="px-8 py-4 border-2 border-naples-yellow text-naples-yellow hover:bg-naples-yellow/10 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Explore Features
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleConnect}
                  className="px-8 py-4 bg-naples-yellow text-yale-blue hover:bg-naples-yellow/90 font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isConnected ? "Connected" : "Connect Wallet"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
