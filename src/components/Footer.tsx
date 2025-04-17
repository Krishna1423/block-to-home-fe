import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import logo from '@/assets/logo.svg';

const Footer: React.FC = () => {
  return (
    <footer className="bg-yale-blue text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-naples-yellow flex items-center justify-center p-0.5 shadow-sm hover:shadow-md transition-shadow">
                <img src={logo} alt="BlockToHome Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold font-montserrat tracking-wider">BlockToHome</span>
            </Link>
            <p className="text-gray-400 text-sm">
              A blockchain-based collaborative mortgage system enabling property tokenization 
              and decentralized lending backed by gold and USDT.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Platform</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/dashboard" className="hover:text-naples-yellow transition-colors">Dashboard</Link></li>
              <li><Link to="/tokenize" className="hover:text-naples-yellow transition-colors">Tokenize Property</Link></li>
              <li><Link to="/mortgage" className="hover:text-naples-yellow transition-colors">Apply for Mortgage</Link></li>
              <li><Link to="/invest" className="hover:text-naples-yellow transition-colors">Invest in Loans</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Resources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Documentation</Link></li>
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Whitepaper</Link></li>
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">FAQs</Link></li>
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Legal</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Compliance</Link></li>
              <li><Link to="/" className="hover:text-naples-yellow transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BlockToHome. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-naples-yellow transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-naples-yellow transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-naples-yellow transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
