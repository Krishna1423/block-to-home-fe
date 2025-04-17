import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  CheckCircle,
  Building,
  FileText,
  ArrowRight,
  Lock,
  Image,
  X,
  MapPin,
  DollarSign,
  FileCheck,
} from "lucide-react";
import { parseNumericString } from "@/lib/utils";

interface PropertyTokenizationFormProps {
  onFormDataChange?: (data: any) => void;
  onImagePreviewChange?: (preview: string | null) => void;
  onDeedStatusChange?: (status: boolean) => void;
}

const PropertyTokenizationForm: React.FC<PropertyTokenizationFormProps> = ({
  onFormDataChange,
  onImagePreviewChange,
  onDeedStatusChange,
}) => {
  const { toast } = useToast();
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
  const [isUploading, setIsUploading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Update parent component when form data changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  // Update parent component when image preview changes
  useEffect(() => {
    if (onImagePreviewChange) {
      onImagePreviewChange(imagePreview);
    }
  }, [imagePreview, onImagePreviewChange]);

  // Update parent component when deed upload status changes
  useEffect(() => {
    if (onDeedStatusChange) {
      onDeedStatusChange(uploadComplete);
    }
  }, [uploadComplete, onDeedStatusChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Calculate tokenized value when valuation or tokenized portion changes
    if (name === "valuation" || name === "tokenizedPortion") {
      const newFormData = {
        ...formData,
        [name]: value,
      };

      if (name === "valuation" && formData.tokenizedPortion) {
        const valuation = parseNumericString(value);
        const portion = parseNumericString(formData.tokenizedPortion);
        const tokenizedValue = ((valuation * portion) / 100).toFixed(2);
        newFormData.tokenizedValue = tokenizedValue;
      } else if (name === "tokenizedPortion" && formData.valuation) {
        const valuation = parseNumericString(formData.valuation);
        const portion = parseNumericString(value);
        const tokenizedValue = ((valuation * portion) / 100).toFixed(2);
        newFormData.tokenizedValue = tokenizedValue;
      }

      setFormData(newFormData);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);

      // Simulate file upload delay
      setTimeout(() => {
        setFormData({
          ...formData,
          deed: e.target.files ? e.target.files[0] : null,
        });
        setIsUploading(false);
        setUploadComplete(true);
        toast({
          title: "Document uploaded",
          description: "Property deed uploaded successfully",
        });
      }, 1500);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsImageUploading(true);

      const file = e.target.files[0];

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsImageUploading(false);

        setFormData({
          ...formData,
          propertyImage: file,
        });

        toast({
          title: "Image uploaded",
          description: "Property image uploaded successfully",
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      propertyImage: null,
    });
  };

  const handleCollateralChange = (value: string) => {
    setFormData({
      ...formData,
      collateralType: value,
    });
  };

  const handleTokenize = () => {
    // Validate all required fields
    if (
      !formData.address ||
      !formData.city ||
      !formData.country ||
      !formData.valuation
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required property details",
        variant: "destructive",
      });
      return;
    }

    if (!formData.deed) {
      toast({
        title: "Document Required",
        description: "Please upload property deed document",
        variant: "destructive",
      });
      return;
    }

    setIsTokenizing(true);

    // Simulate tokenization process
    setTimeout(() => {
      setIsTokenizing(false);
      toast({
        title: "Tokenization Successful",
        description:
          "Your property has been tokenized and recorded on the blockchain",
      });
      // Redirect to dashboard after successful tokenization
      // window.location.href = '/dashboard';
    }, 2000);
  };

  const calculateCollateralValue = () => {
    return formData.tokenizedValue
      ? parseNumericString(formData.tokenizedValue).toLocaleString()
      : "0";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-8">
        {/* Step 1: Property Details */}
        <div className="relative bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            1
          </div>
          <h2 className="text-xl font-bold mb-6">Property Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Property Image Upload */}
              <div>
                <Label htmlFor="propertyImage">Property Image</Label>
                <div className="mt-2">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-white">
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Upload Property Image
                      </h3>
                      <p className="text-gray-500 mb-4 text-sm">
                        JPG, PNG up to 5MB
                      </p>
                      <Input
                        id="propertyImage"
                        name="propertyImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("propertyImage")?.click()
                        }
                        disabled={isImageUploading}
                        className="relative"
                      >
                        {isImageUploading ? "Uploading..." : "Select Image"}
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Property"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Property Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="valuation">Property Valuation (USD)</Label>
                <Input
                  id="valuation"
                  name="valuation"
                  type="number"
                  placeholder="Property value in USD"
                  value={formData.valuation}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="tokenizedPortion">Tokenized Portion (%)</Label>
                <Input
                  id="tokenizedPortion"
                  name="tokenizedPortion"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Percentage of property to tokenize"
                  value={formData.tokenizedPortion}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the percentage of the property you want to tokenize
                </p>
              </div>

              {formData.tokenizedValue && (
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tokenized Value:</span>
                    <span className="font-medium">
                      {parseInt(formData.tokenizedValue).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Document Upload */}
        <div className="relative bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            2
          </div>
          <h2 className="text-xl font-bold mb-6">Upload Documentation</h2>
          <p className="text-gray-600 mb-6">
            Please upload your property deed or title document. This will be
            securely stored and linked to your tokenized property.
          </p>

          <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-white">
            {!uploadComplete ? (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Upload Property Deed
                </h3>
                <p className="text-gray-500 mb-4 text-sm">
                  PDF, JPG or PNG up to 10MB
                </p>
                <Input
                  id="deed"
                  name="deed"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("deed")?.click()}
                  disabled={isUploading}
                  className="relative"
                >
                  {isUploading ? "Uploading..." : "Select File"}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Document Uploaded</h3>
                <p className="text-gray-600">
                  {formData.deed?.name || "property-deed.pdf"}
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setUploadComplete(false);
                    setFormData({ ...formData, deed: null });
                  }}
                >
                  Upload a different file
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Backing Selection */}
        <div
          className={`relative ${
            !uploadComplete ? "opacity-50 pointer-events-none" : ""
          } bg-purple-50 p-6 rounded-lg border border-purple-100`}
        >
          <div
            className={`absolute -top-4 -left-4 h-8 w-8 rounded-full ${
              uploadComplete ? "bg-purple-500" : "bg-gray-400"
            } flex items-center justify-center text-white font-bold`}
          >
            3
          </div>
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-bold">Select Backing Asset</h2>
            {!uploadComplete && (
              <div className="ml-4 flex items-center text-gray-500">
                <Lock className="h-4 w-4 mr-1" />
                <span className="text-sm">Upload deed to unlock</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-6">
            Choose the type of collateral that will back your tokenized
            property.
          </p>

          <RadioGroup
            value={formData.collateralType}
            onValueChange={handleCollateralChange}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-white cursor-pointer bg-white">
              <RadioGroupItem value="Gold" id="gold" />
              <Label htmlFor="gold" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-yellow-600">Au</span>
                  </span>
                  <div>
                    <h4 className="font-medium">Gold Token</h4>
                    <p className="text-sm text-gray-500">
                      Physical gold-backed tokens stored in secure vaults
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-white cursor-pointer bg-white">
              <RadioGroupItem value="USDT" id="usdt" />
              <Label htmlFor="usdt" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="font-bold text-blue-600">$</span>
                  </span>
                  <div>
                    <h4 className="font-medium">USD Tether (USDT)</h4>
                    <p className="text-sm text-gray-500">
                      Stable cryptocurrency pegged to the US Dollar
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-100">
            <h3 className="font-medium mb-2">Collateral Value</h3>
            <div className="text-2xl font-bold">
              {calculateCollateralValue()} USDT
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Based on your property valuation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTokenizationForm;
