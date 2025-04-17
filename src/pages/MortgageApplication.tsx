
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MortgageApplicationForm from '@/components/MortgageApplicationForm';
import { 
  Building, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

const MortgageApplication: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Mortgage Loan Application</h1>
            <p className="text-gray-600">
              Apply for a mortgage loan using your tokenized property as collateral,
              with competitive rates and streamlined approval process.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <MortgageApplicationForm />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Loan Information */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">About Our Mortgage Loans</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calculator className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Competitive Interest Rates</h4>
                      <p className="text-sm text-gray-600">
                        Our decentralized lending pool offers rates starting at 4.5% annually,
                        often lower than traditional financial institutions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Flexible Durations</h4>
                      <p className="text-sm text-gray-600">
                        Choose loan terms from 6 months to 10 years, with early repayment options
                        available with no penalties.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Secure Collateral Management</h4>
                      <p className="text-sm text-gray-600">
                        Your property token is securely held in a smart contract escrow
                        until the loan is repaid in full.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <div>
                      <h4 className="font-medium">Up to 70% Loan-to-Value</h4>
                      <p className="text-sm text-gray-600">
                        Borrow up to 70% of your tokenized property's value,
                        with the option to adjust your loan amount as needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Eligibility Criteria */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Eligibility Criteria</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Must own a tokenized property</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Completed KYC verification</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Property value verified within last 6 months</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-gray-700">No existing loans on the same property token</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-gray-700">No default history on previous BlockToHome loans</span>
                  </div>
                </div>
              </div>
              
              {/* Process Timeline */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="font-medium mb-4">Application Process</h3>
                <div className="space-y-6">
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-bcms-blue-light flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Submit Application</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Complete the form with loan details
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-bcms-blue-light flex items-center justify-center text-white text-xs">
                      2
                    </div>
                    <div className="border-l-2 border-dashed border-gray-300 absolute left-2.5 top-[-24px] h-6"></div>
                    <div>
                      <h4 className="font-medium">Investor Review</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Investors review and fund your loan (1-3 days)
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-bcms-blue-light flex items-center justify-center text-white text-xs">
                      3
                    </div>
                    <div className="border-l-2 border-dashed border-gray-300 absolute left-2.5 top-[-24px] h-6"></div>
                    <div>
                      <h4 className="font-medium">Loan Disbursement</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Funds transferred to your wallet
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-bcms-blue-light flex items-center justify-center text-white text-xs">
                      4
                    </div>
                    <div className="border-l-2 border-dashed border-gray-300 absolute left-2.5 top-[-24px] h-6"></div>
                    <div>
                      <h4 className="font-medium">Repayment Period</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Make monthly payments until loan completion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MortgageApplication;
