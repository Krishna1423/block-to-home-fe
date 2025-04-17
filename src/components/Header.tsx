import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Wallet2, 
  BarChartHorizontal, 
  Building2, 
  BadgeDollarSign, 
  Pyramid 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WalletConnect from './WalletConnect';
import logo from '@/assets/logo.svg';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { title: 'Home', path: '/', icon: <Home size={18} /> },
    { title: 'Dashboard', path: '/dashboard', icon: <BarChartHorizontal size={18} /> },
    { title: 'Tokenize Property', path: '/tokenize', icon: <Building2 size={18} /> },
    { title: 'Apply for Loan', path: '/mortgage', icon: <Wallet2 size={18} /> },
    { title: 'Invest', path: '/invest', icon: <BadgeDollarSign size={18} /> },
  ];

  return (
    <header 
      className={cn(
        "py-4 sticky top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-yale-blue shadow-md" : "bg-yale-blue/90 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-naples-yellow flex items-center justify-center p-0.5 shadow-sm hover:shadow-md transition-shadow">
            <img src={logo} alt="BlockToHome Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-bold text-white font-montserrat tracking-wider">
            BlockToHome
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors",
                isActive(link.path)
                  ? "text-naples-yellow"
                  : "text-gray-300 hover:text-tiffany-blue"
              )}
            >
              {link.icon}
              <span className="font-montserrat">{link.title}</span>
            </Link>
          ))}
        </nav>

        {/* Wallet Connect */}
        <div className="hidden md:block">
          <WalletConnect />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-yale-blue border-t border-yale-blue/30">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md",
                  isActive(link.path)
                    ? "bg-persian-green text-white"
                    : "text-gray-300 hover:bg-persian-green/20 hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span className="font-montserrat">{link.title}</span>
              </Link>
            ))}
            <div className="pt-2">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
