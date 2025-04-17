import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/components/ui/use-toast";
import logo from "@/assets/logo.svg";
import usdtLogo from "@/assets/tether-usdt-logo.svg";
import goldIngot from "@/assets/gold_ingot.svg";
import {
  Building2,
  Wallet2,
  BadgeDollarSign,
  Shield,
  BarChartHorizontal,
  FileCheck,
  ChevronRight,
  Check,
  Coins,
} from "lucide-react";

const Index = () => {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const howItWorksRef = useRef<HTMLElement>(null);

  const handleLearnMore = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProtectedAction = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isConnected) {
      e.preventDefault();
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to access this feature",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section with new color scheme */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-yale-blue via-yale-blue/95 to-yale-blue overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-persian-green/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-naples-yellow/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-tiffany-blue/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-block bg-naples-yellow/10 px-4 py-2 rounded-full text-naples-yellow text-sm font-medium font-montserrat mb-2">
              Blockchain-Powered Real Estate Financing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-montserrat leading-tight">
              Bridging Blockchain and Homeownership
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              We connect borrowers with global investors using secure smart
              contracts and real estate tokenization. BlockToHome is an
              innovative fintech platform that combines blockchain technology
              with real estate finance to reinvent the mortgage experience.
            </p>
            <div className="flex flex-wrap gap-4">
              {!isConnected ? (
                <WalletConnect />
              ) : (
                <Button
                  asChild
                  className="bg-naples-yellow text-yale-blue hover:bg-naples-yellow/90 transition-all duration-300 font-medium font-montserrat group"
                  size="lg"
                >
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-tiffany-blue text-black border-black hover:bg-white font-montserrat"
                size="lg"
                onClick={handleLearnMore}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Decorative Graphics - Independent Floating Boxes */}
          <div className="hidden md:flex justify-center items-center relative w-full h-full">
            {/* Main Logo Box */}
            <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-persian-green to-tiffany-blue p-1 animate-float z-10">
              <div className="bg-yale-blue rounded-2xl h-full w-full flex items-center justify-center p-8">
                <div className="w-full h-full rounded-xl bg-naples-yellow flex items-center justify-center p-2">
                  <img
                    src={logo}
                    alt="BlockToHome Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            {/* USDT Logo Box - Independent */}
            <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-persian-green to-tiffany-blue p-1 rotate-12 animate-float-delayed absolute top-0 right-0 mr-8 mt-8 z-0">
              <div className="bg-yale-blue rounded-2xl h-full w-full flex items-center justify-center p-6">
                <div className="w-full h-full rounded-xl bg-naples-yellow flex items-center justify-center p-2">
                  <img
                    src={goldIngot}
                    alt="Gold Ingot"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* GoldToken Logo Box - Independent */}
            <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-persian-green to-tiffany-blue p-1 -rotate-12 animate-float-more-delayed absolute bottom-0 right-0 mr-8 mb-8 z-0">
              <div className="bg-yale-blue rounded-2xl h-full w-full flex items-center justify-center p-6">
                <div className="w-full h-full rounded-xl bg-naples-yellow flex items-center justify-center p-2">
                  <img
                    src={usdtLogo}
                    alt="USDT Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-naples-yellow rounded-2xl -rotate-12 -z-10 opacity-60"></div>
          </div>
        </div>
      </section>

      {/* How It Works with new color scheme */}
      <section ref={howItWorksRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-yale-blue font-montserrat">
              How BlockToHome Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're buying your first home or investing in
              property-backed loans, BlockToHome makes it simple, borderless,
              and trustworthy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Property Owners */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="h-16 w-16 rounded-full bg-yale-blue/10 flex items-center justify-center mb-6 group-hover:bg-yale-blue/20 transition-colors">
                <Building2 className="h-8 w-8 text-yale-blue" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-yale-blue font-montserrat">
                For Property Owners
              </h3>
              <p className="text-gray-600 mb-6">
                Transform your real estate assets into digital tokens, unlocking
                new liquidity and investment opportunities.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">
                    Digitize property ownership
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">
                    Access instant liquidity
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">
                    Flexible backing options
                  </span>
                </li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="w-full border-yale-blue text-yale-blue hover:bg-yale-blue/10 font-montserrat"
              >
                <Link to="/tokenize" onClick={handleProtectedAction}>
                  Tokenize Property
                </Link>
              </Button>
            </div>

            {/* For Borrowers */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="h-16 w-16 rounded-full bg-yale-blue/10 flex items-center justify-center mb-6 group-hover:bg-yale-blue/20 transition-colors">
                <Wallet2 className="h-8 w-8 text-yale-blue" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-yale-blue font-montserrat">
                For Borrowers
              </h3>
              <p className="text-gray-600 mb-6">
                Secure mortgage loans with competitive rates, backed by
                tokenized assets on the blockchain.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">
                    Competitive interest rates
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">Fast approval process</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">Transparent loan terms</span>
                </li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="w-full border-yale-blue text-yale-blue hover:bg-yale-blue/10 font-montserrat"
              >
                <Link to="/mortgage" onClick={handleProtectedAction}>
                  Apply for Mortgage
                </Link>
              </Button>
            </div>

            {/* For Investors */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <div className="h-16 w-16 rounded-full bg-yale-blue/10 flex items-center justify-center mb-6 group-hover:bg-yale-blue/20 transition-colors">
                <BadgeDollarSign className="h-8 w-8 text-yale-blue" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-yale-blue font-montserrat">
                For Investors
              </h3>
              <p className="text-gray-600 mb-6">
                Invest in asset-backed mortgage pools and earn attractive,
                reliable returns through blockchain technology.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">Secured by real estate</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">Diverse risk profiles</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-persian-green mr-2" />
                  <span className="text-gray-700">
                    Monthly investment returns
                  </span>
                </li>
              </ul>
              <Button
                asChild
                variant="outline"
                className="w-full border-yale-blue text-yale-blue hover:bg-yale-blue/10 font-montserrat"
              >
                <Link to="/invest" onClick={handleProtectedAction}>
                  Browse Investments
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section with new color scheme */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-yale-blue font-montserrat">
              Platform Benefits
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of decentralized real estate financing with
              unparalleled security, transparency, and efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefits cards with new color scheme */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group border border-gray-100">
              <div className="h-14 w-14 rounded-lg bg-naples-yellow flex items-center justify-center p-1">
                <img
                  src={logo}
                  alt="BlockToHome Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="text-lg font-bold mb-2 text-yale-blue font-montserrat">
                Secure & Transparent
              </h3>
              <p className="text-gray-600">
                Blockchain guarantees immutable records and transparent
                processes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group border border-gray-100">
              <div className="h-14 w-14 rounded-lg bg-naples-yellow flex items-center justify-center p-2">
                <Shield className="h-8 w-8 text-yale-blue" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-yale-blue font-montserrat">
                Asset-Backed Security
              </h3>
              <p className="text-gray-600">
                Loans are secured by tokenized properties with gold or USDT
                collateral.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group border border-gray-100">
              <div className="h-14 w-14 rounded-lg bg-naples-yellow flex items-center justify-center p-2">
                <BarChartHorizontal className="h-8 w-8 text-yale-blue" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-yale-blue font-montserrat">
                Competitive Returns
              </h3>
              <p className="text-gray-600">
                Investors gain attractive yields with reduced risk through
                collateralization.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group border border-gray-100">
              <div className="h-14 w-14 rounded-lg bg-naples-yellow flex items-center justify-center p-2">
                <FileCheck className="h-8 w-8 text-yale-blue" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-yale-blue font-montserrat">
                Regulatory Compliance
              </h3>
              <p className="text-gray-600">
                Designed with regulatory frameworks to ensure legal and secure
                operation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with new color scheme */}
      <section className="py-16 bg-gradient-to-br from-yale-blue to-persian-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-montserrat">
            Transform Your Real Estate Journey
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join BlockToHome and unlock a new era of collaborative,
            blockchain-powered property financing.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              asChild
              size="lg"
              className="bg-naples-yellow text-yale-blue hover:bg-white hover:text-yale-blue font-montserrat"
            >
              <Link to="/tokenize" onClick={handleProtectedAction}>
                Tokenize Property
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-naples-yellow text-yale-blue hover:bg-white hover:text-yale-blue font-montserrat"
            >
              <Link to="/mortgage" onClick={handleProtectedAction}>
                Apply for Mortgage
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-naples-yellow text-yale-blue hover:bg-white hover:text-yale-blue font-montserrat"
            >
              <Link to="/invest" onClick={handleProtectedAction}>
                Start Investing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
