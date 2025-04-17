import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyTokenizationForm from "@/components/PropertyTokenizationForm";
import {
  Building,
  ListChecks,
  FileBadge,
  DollarSign,
  ArrowRight,
  MapPin,
  FileCheck,
  Image,
  CheckCircle,
  FileText,
  Download,
  X,
  Check,
} from "lucide-react";

const PropertyTokenization: React.FC = () => {
  // State to track form data for the summary
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "",
    valuation: "",
    tokenizedPortion: "100",
    tokenizedValue: "",
    deed: null,
    propertyImage: null,
    collateralType: "USDT",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [deedPreview, setDeedPreview] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Function to update form data from the PropertyTokenizationForm component
  const updateFormData = (data: any) => {
    setFormData(data);

    // Create a preview URL for the deed if it exists
    if (data.deed && !deedPreview) {
      const deedUrl = URL.createObjectURL(data.deed);
      setDeedPreview(deedUrl);
    }
  };

  // Function to update image preview
  const updateImagePreview = (preview: string | null) => {
    setImagePreview(preview);
  };

  // Function to update deed upload status
  const updateDeedStatus = (status: boolean) => {
    setUploadComplete(status);
  };

  // Check if any property details have been entered
  const hasPropertyDetails = () => {
    return (
      formData.address !== "" ||
      formData.city !== "" ||
      formData.country !== "" ||
      formData.valuation !== "" ||
      imagePreview !== null
    );
  };

  // Check if section 3 (backing asset) has been filled
  const isSection3Complete = () => {
    return formData.collateralType !== "";
  };

  // Check if all required sections are complete
  const isFormComplete = () => {
    return (
      formData.address !== "" &&
      formData.city !== "" &&
      formData.country !== "" &&
      formData.valuation !== "" &&
      formData.deed !== null &&
      isSection3Complete()
    );
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (deedPreview) {
        URL.revokeObjectURL(deedPreview);
      }
    };
  }, [deedPreview]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showNotification) {
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showNotification]);

  // Handle tokenization process
  const handleTokenize = () => {
    // Validate all required fields
    if (
      !formData.address ||
      !formData.city ||
      !formData.country ||
      !formData.valuation
    ) {
      // No alert, just return
      return;
    }

    if (!formData.deed) {
      // No alert, just return
      return;
    }

    setIsTokenizing(true);

    // Simulate tokenization process
    setTimeout(() => {
      setIsTokenizing(false);
      setShowNotification(true);
      // No alert, just complete the process
      // Redirect to dashboard after successful tokenization
      // window.location.href = '/dashboard';
    }, 2000);
  };

  // Handle showing the summary modal without starting tokenization
  const handleShowSummary = () => {
    setShowSummaryModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Property Tokenization</h1>
            <p className="text-gray-600">
              Convert your physical real estate asset into a digital token on
              the blockchain, opening new possibilities for financing and
              collateralization.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <PropertyTokenizationForm
                onFormDataChange={updateFormData}
                onImagePreviewChange={updateImagePreview}
                onDeedStatusChange={updateDeedStatus}
              />

              {/* Show Property Summary Button - Always visible */}
              <div className="mt-6">
                <button
                  onClick={handleShowSummary}
                  className="w-full bg-bcms-blue-light hover:bg-bcms-blue text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center"
                >
                  <FileCheck className="h-5 w-5 mr-2" />
                  Show Property Summary & Tokenize
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* How It Works */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4">
                  How Tokenization Works
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-8 w-8 rounded-full bg-bcms-blue-light flex items-center justify-center text-white font-medium">
                        1
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Enter Property Details</h4>
                      <p className="text-sm text-gray-600">
                        Provide information about your property, including
                        address, valuation, and other relevant details.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-8 w-8 rounded-full bg-bcms-blue-light flex items-center justify-center text-white font-medium">
                        2
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Upload Documentation</h4>
                      <p className="text-sm text-gray-600">
                        Upload your property deed and ownership documents for
                        verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-8 w-8 rounded-full bg-bcms-blue-light flex items-center justify-center text-white font-medium">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Select Backing Asset</h4>
                      <p className="text-sm text-gray-600">
                        Choose between Gold tokens or USDT as the backing
                        collateral for your property token.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-8 w-8 rounded-full bg-bcms-blue-light flex items-center justify-center text-white font-medium">
                        4
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Create Digital Token</h4>
                      <p className="text-sm text-gray-600">
                        Your property is verified and a unique digital token is
                        created on the blockchain representing your property.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4">
                  Benefits of Tokenization
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Building className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <span className="text-gray-700">
                      Convert illiquid assets into tokenized form
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FileBadge className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <span className="text-gray-700">
                      Immutable proof of ownership on blockchain
                    </span>
                  </li>
                  <li className="flex items-start">
                    <ListChecks className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <span className="text-gray-700">
                      Easier property transfers and mortgage applications
                    </span>
                  </li>
                  <li className="flex items-start">
                    <DollarSign className="h-5 w-5 text-bcms-blue-light mr-3 shrink-0" />
                    <span className="text-gray-700">
                      Access to DeFi mortgage opportunities
                    </span>
                  </li>
                </ul>
              </div>

              {/* Requirements */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="font-medium mb-3">Requirements</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Valid property deed</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Recent property valuation</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Connected blockchain wallet</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                    <span>KYC verification completed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Property Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Property Summary</h3>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Property Image */}
              <div className="mb-4">
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Property"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <Image className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 text-sm ml-2">
                      No image uploaded
                    </p>
                  </div>
                )}
              </div>

              {/* Property Information */}
              <div className="space-y-4 mb-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-gray-600 text-sm">
                      {formData.address && (
                        <>
                          {formData.address}
                          {formData.city && formData.country && (
                            <>
                              <br />
                              {formData.city}, {formData.country}
                            </>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Valuation</h4>
                    <p className="text-gray-600 text-sm">
                      {formData.valuation && (
                        <>
                          {parseInt(formData.valuation).toLocaleString()} USD
                          {formData.tokenizedPortion &&
                            formData.tokenizedValue && (
                              <>
                                <br />
                                <span className="text-gray-500">
                                  Tokenized: {formData.tokenizedPortion}% (
                                  {parseInt(
                                    formData.tokenizedValue
                                  ).toLocaleString()}{" "}
                                  USD)
                                </span>
                              </>
                            )}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileCheck className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Documentation</h4>
                    <p className="text-gray-600 text-sm">
                      {formData.deed ? (
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          {formData.deed.name || "property-deed.pdf"}
                        </span>
                      ) : (
                        <span className="text-gray-400">No deed uploaded</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Deed Preview */}
              {formData.deed && deedPreview && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 className="font-medium">Property Deed</h4>
                    </div>
                    <a
                      href={deedPreview}
                      download={formData.deed.name || "property-deed.pdf"}
                      className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    {formData.deed.type === "application/pdf" ? (
                      <iframe
                        src={deedPreview}
                        title="Property Deed"
                        className="w-full h-96 bg-gray-50"
                        style={{ border: "none" }}
                      />
                    ) : (
                      <img
                        src={deedPreview}
                        alt="Property Deed"
                        className="w-full h-96 object-contain bg-gray-50"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Tokenization Status */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-3">Tokenization Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Property Details</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        uploadComplete ? "bg-green-500" : "bg-gray-300"
                      } mr-2`}
                    ></div>
                    <span className="text-sm">Documentation</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        uploadComplete ? "bg-green-500" : "bg-gray-300"
                      } mr-2`}
                    ></div>
                    <span className="text-sm">Backing Asset</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        uploadComplete ? "bg-green-500" : "bg-gray-300"
                      } mr-2`}
                    ></div>
                    <span className="text-sm">Review & Submit</span>
                  </div>
                </div>
              </div>

              {/* Confirmation Buttons */}
              {isSection3Complete() ? (
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowSummaryModal(false)}
                    className="px-4 py-2 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleTokenize();
                      setShowSummaryModal(false);
                    }}
                    disabled={isTokenizing || !isFormComplete()}
                    className={`px-4 py-2 ${
                      isFormComplete()
                        ? "bg-bcms-blue-light hover:bg-bcms-blue"
                        : "bg-gray-300 cursor-not-allowed"
                    } text-white rounded-md transition-colors flex items-center`}
                  >
                    {isTokenizing ? (
                      <>
                        <span className="mr-2">Processing...</span>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </>
                    ) : (
                      "Confirm & Tokenize"
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700 text-sm">
                    Please complete section 3 (Backing Asset) before proceeding
                    with tokenization.
                  </p>
                </div>
              )}

              {isSection3Complete() && !isFormComplete() && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700 text-sm">
                    Please complete all required information before proceeding
                    with tokenization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-fade-in-up">
          <Check className="h-5 w-5 mr-2" />
          <span>Property successfully tokenized!</span>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyTokenization;
