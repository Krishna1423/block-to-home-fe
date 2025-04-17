import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Copy,
  CopyCheckIcon,
  ExternalLink,
  MoreHorizontal,
  Share2,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useClipboard } from "@mantine/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";

interface Opportunity {
  loanId: string;
  borrower: string;
  amount: string;
  interestRate: string;
  duration: string;
  propertyValue: string;
  tokenizedPortion: number;
  tokenizedValue: string;
  collateralType: "USDT" | "GOLD";
  status: "OPEN" | "CLOSED" | "PENDING";
  funded: number;
  startDate: string;
  endDate: string;
  propertyImageUrl: string;
  propertyAddress: string;
  country: string;
  city: string;
}

const InvestorPool = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<keyof Opportunity | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOpportunityForDrawer, setSelectedOpportunityForDrawer] =
    useState<Opportunity | null>(null);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [
    selectedOpportunityForInvestment,
    setSelectedOpportunityForInvestment,
  ] = useState<Opportunity | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [estimatedReturn, setEstimatedReturn] = useState<number>(0);
  const [isAmountValid, setIsAmountValid] = useState<boolean>(true);
  const [amountErrorMessage, setAmountErrorMessage] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [notifyOnFunding, setNotifyOnFunding] = useState(false);

  const clipboard = useClipboard();

  const { balance, setBalance } = useWallet();

  const walletBalance = parseFloat(balance.replace(/[^0-9.-]+/g, ""));

  const copyToClipboard = (text: string) => {
    clipboard.copy(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      loanId: "00123",
      borrower: "John Doe",
      amount: "$70,000",
      interestRate: "5%",
      duration: "15 years",
      propertyValue: "$100,000",
      tokenizedPortion: 50,
      tokenizedValue: "$50,000",
      collateralType: "USDT",
      status: "OPEN",
      funded: 35,
      startDate: "2023-04-01",
      endDate: "2038-04-01",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "123 Main St, Anytown, USA",
      country: "USA",
      city: "Anytown",
    },
    {
      loanId: "00124",
      borrower: "Alice Smith",
      amount: "$120,000",
      interestRate: "6%",
      duration: "20 years",
      propertyValue: "$180,000",
      tokenizedPortion: 75,
      tokenizedValue: "$135,000",
      collateralType: "GOLD",
      status: "CLOSED",
      funded: 100,
      startDate: "2022-11-15",
      endDate: "2042-11-15",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "45 Bahnhofstrasse, Zurich, Switzerland",
      country: "Switzerland",
      city: "Zurich",
    },
    {
      loanId: "00125",
      borrower: "Bob Johnson",
      amount: "$90,000",
      interestRate: "5.5%",
      duration: "18 years",
      propertyValue: "$130,000",
      tokenizedPortion: 60,
      tokenizedValue: "$78,000",
      collateralType: "USDT",
      status: "OPEN",
      funded: 70,
      startDate: "2023-01-20",
      endDate: "2041-01-20",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "789 Oak St, Lakeside, USA",
      country: "USA",
      city: "Lakeside",
    },
    {
      loanId: "00126",
      borrower: "Emily White",
      amount: "$150,000",
      interestRate: "6.5%",
      duration: "25 years",
      propertyValue: "$220,000",
      tokenizedPortion: 80,
      tokenizedValue: "$176,000",
      collateralType: "GOLD",
      status: "OPEN",
      funded: 0,
      startDate: "2023-05-10",
      endDate: "2048-05-10",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "101 Pine St, Hilltop, USA",
      country: "USA",
      city: "Hilltop",
    },
    {
      loanId: "00127",
      borrower: "David Brown",
      amount: "$80,000",
      interestRate: "4.8%",
      duration: "16 years",
      propertyValue: "$110,000",
      tokenizedPortion: 40,
      tokenizedValue: "$44,000",
      collateralType: "USDT",
      status: "OPEN",
      funded: 20,
      startDate: "2022-09-01",
      endDate: "2038-09-01",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "222 Maple St, Valleyview, USA",
      country: "USA",
      city: "Valleyview",
    },
    {
      loanId: "00128",
      borrower: "Sarah Green",
      amount: "$110,000",
      interestRate: "5.2%",
      duration: "19 years",
      propertyValue: "$160,000",
      tokenizedPortion: 65,
      tokenizedValue: "$104,000",
      collateralType: "GOLD",
      status: "CLOSED",
      funded: 100,
      startDate: "2023-02-28",
      endDate: "2042-02-28",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "333 Cherry St, Riverdale, USA",
      country: "USA",
      city: "Riverdale",
    },
    {
      loanId: "00129",
      borrower: "James Wilson",
      amount: "$250,000",
      interestRate: "4.2%",
      duration: "30 years",
      propertyValue: "$350,000",
      tokenizedPortion: 70,
      tokenizedValue: "$245,000",
      collateralType: "USDT",
      status: "OPEN",
      funded: 45,
      startDate: "2023-06-15",
      endDate: "2053-06-15",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "45 Kensington High St, London, UK",
      country: "UK",
      city: "London",
    },
    {
      loanId: "00130",
      borrower: "Emma Thompson",
      amount: "$180,000",
      interestRate: "5.8%",
      duration: "25 years",
      propertyValue: "$260,000",
      tokenizedPortion: 60,
      tokenizedValue: "$156,000",
      collateralType: "GOLD",
      status: "OPEN",
      funded: 30,
      startDate: "2023-07-20",
      endDate: "2048-07-20",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "78 Istiklal Caddesi, Istanbul, Turkey",
      country: "Turkey",
      city: "Istanbul",
    },
    {
      loanId: "00131",
      borrower: "Ahmed Al-Sayed",
      amount: "$300,000",
      interestRate: "4.5%",
      duration: "20 years",
      propertyValue: "$450,000",
      tokenizedPortion: 75,
      tokenizedValue: "$337,500",
      collateralType: "USDT",
      status: "OPEN",
      funded: 25,
      startDate: "2023-08-10",
      endDate: "2043-08-10",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "123 Sheikh Zayed Road, Dubai, UAE",
      country: "UAE",
      city: "Dubai",
    },
    {
      loanId: "00132",
      borrower: "Hans Mueller",
      amount: "$220,000",
      interestRate: "3.8%",
      duration: "25 years",
      propertyValue: "$320,000",
      tokenizedPortion: 65,
      tokenizedValue: "$208,000",
      collateralType: "GOLD",
      status: "OPEN",
      funded: 40,
      startDate: "2023-09-05",
      endDate: "2048-09-05",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "45 Bahnhofstrasse, Zurich, Switzerland",
      country: "Switzerland",
      city: "Zurich",
    },
    {
      loanId: "00133",
      borrower: "Li Wei",
      amount: "$280,000",
      interestRate: "4.0%",
      duration: "30 years",
      propertyValue: "$400,000",
      tokenizedPortion: 70,
      tokenizedValue: "$280,000",
      collateralType: "USDT",
      status: "OPEN",
      funded: 35,
      startDate: "2023-10-15",
      endDate: "2053-10-15",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "88 Orchard Road, Singapore",
      country: "Singapore",
      city: "Singapore",
    },
    {
      loanId: "00134",
      borrower: "Michael O'Connor",
      amount: "$200,000",
      interestRate: "4.7%",
      duration: "25 years",
      propertyValue: "$290,000",
      tokenizedPortion: 60,
      tokenizedValue: "$174,000",
      collateralType: "GOLD",
      status: "OPEN",
      funded: 50,
      startDate: "2023-11-20",
      endDate: "2048-11-20",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "123 Yonge Street, Toronto, Canada",
      country: "Canada",
      city: "Toronto",
    },
    {
      loanId: "00135",
      borrower: "Jennifer Lee",
      amount: "$240,000",
      interestRate: "4.3%",
      duration: "25 years",
      propertyValue: "$340,000",
      tokenizedPortion: 65,
      tokenizedValue: "$221,000",
      collateralType: "USDT",
      status: "OPEN",
      funded: 30,
      startDate: "2023-12-10",
      endDate: "2048-12-10",
      propertyImageUrl:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      propertyAddress: "456 Granville Street, Vancouver, Canada",
      country: "Canada",
      city: "Vancouver",
    },
  ]);

  const filteredOpportunities = opportunities.filter(
    (opportunity) =>
      (opportunity.borrower.toLowerCase().includes(filter.toLowerCase()) ||
      opportunity.loanId.toLowerCase().includes(filter.toLowerCase()) ||
        opportunity.propertyAddress
          .toLowerCase()
          .includes(filter.toLowerCase())) &&
      (statusFilter === "all" ||
        opportunity.status.toLowerCase() === statusFilter.toLowerCase()) &&
      (countryFilter === "all" || opportunity.country === countryFilter) &&
      (cityFilter === "all" || opportunity.city === cityFilter)
  );

  const sortedOpportunities = React.useMemo(() => {
    if (!sortColumn) return filteredOpportunities;

    return [...filteredOpportunities].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortColumn] > b[sortColumn]) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredOpportunities, sortColumn, sortDirection]);

  const paginatedOpportunities = sortedOpportunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: keyof Opportunity) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const totalPages = Math.ceil(sortedOpportunities.length / itemsPerPage);

  const calculateEstimatedReturn = (
    amount: string,
    opportunity: Opportunity
  ) => {
    if (!amount || isNaN(Number(amount))) {
      setEstimatedReturn(0);
      return;
    }

    const investment = Number(amount);
    const loanAmount = Number(opportunity.amount.replace(/[^0-9.-]+/g, ""));
    const interestRate =
      Number(opportunity.interestRate.replace("%", "")) / 100;
    const duration = Number(opportunity.duration.replace(/[^0-9.-]+/g, ""));

    // Calculate monthly interest rate
    const monthlyRate = interestRate / 12;
    // Calculate total number of payments (months)
    const numberOfPayments = duration * 12;

    // Calculate monthly payment using the loan amortization formula
    const monthlyPayment =
      (investment * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Calculate total return (monthly payment * number of payments)
    const totalReturn = monthlyPayment * numberOfPayments;

    // Calculate total interest (total return - principal)
    const totalInterest = totalReturn - investment;

    setEstimatedReturn(totalReturn);
  };

  const validateInvestmentAmount = (amount: string) => {
    if (!amount || isNaN(Number(amount))) {
      setIsAmountValid(false);
      setAmountErrorMessage("Please enter a valid amount");
      return false;
    }

    const numAmount = Number(amount);

    if (numAmount <= 0) {
      setIsAmountValid(false);
      setAmountErrorMessage("Investment amount must be greater than 0");
      return false;
    }

    if (numAmount > walletBalance) {
      setIsAmountValid(false);
      setAmountErrorMessage(
        `Insufficient funds. Your wallet balance is ${balance}`
      );
      return false;
    }

    if (selectedOpportunityForInvestment) {
      const loanAmount = Number(
        selectedOpportunityForInvestment.amount.replace(/[^0-9.-]+/g, "")
      );
      const remainingAmount =
        loanAmount -
        (loanAmount * selectedOpportunityForInvestment.funded) / 100;

      if (numAmount > remainingAmount) {
        setIsAmountValid(false);
        setAmountErrorMessage(
          `Maximum investment amount is $${remainingAmount.toLocaleString()}`
        );
        return false;
      }
    }

    setIsAmountValid(true);
    setAmountErrorMessage("");
    return true;
  };

  const handleInvestmentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setInvestmentAmount(value);

    validateInvestmentAmount(value);

    if (selectedOpportunityForInvestment) {
      calculateEstimatedReturn(value, selectedOpportunityForInvestment);
    }
  };

  const openInvestModal = (opportunity: Opportunity) => {
    setSelectedOpportunityForInvestment(opportunity);
    setInvestmentAmount("");
    setEstimatedReturn(0);
    setIsAmountValid(true);
    setAmountErrorMessage("");
    setIsInvestModalOpen(true);
  };

  const handleInvestSubmit = () => {
    if (!selectedOpportunityForInvestment || !investmentAmount) return;

    if (!validateInvestmentAmount(investmentAmount)) {
      return;
    }

    // Calculate new balance
    const currentBalance = parseFloat(balance.replace(/[^0-9.-]+/g, ""));
    const investmentValue = parseFloat(investmentAmount);
    const newBalance = currentBalance - investmentValue;

    // Update wallet balance
    setBalance(`${newBalance.toLocaleString()} USDT`);

    // Update the funded percentage for the selected opportunity
    setOpportunities((prevOpportunities) =>
      prevOpportunities.map((opportunity) => {
        if (opportunity.loanId === selectedOpportunityForInvestment.loanId) {
          const loanAmount = parseFloat(
            opportunity.amount.replace(/[^0-9.-]+/g, "")
          );
          const currentFundedAmount = (loanAmount * opportunity.funded) / 100;
          const newFundedAmount = currentFundedAmount + investmentValue;
          const newFundedPercentage = Math.min(
            (newFundedAmount / loanAmount) * 100,
            100
          );

          // If the loan is now fully funded, update its status
          const newStatus =
            newFundedPercentage >= 100
              ? ("CLOSED" as const)
              : ("OPEN" as const);

          // Show notification preference in toast if enabled
          if (notifyOnFunding) {
            toast({
              title: "Notification Preference Saved",
              description: `You will be notified when loan ${opportunity.loanId} reaches 75% funding.`,
            });
          }

          return {
            ...opportunity,
            funded: Math.round(newFundedPercentage),
            status: newStatus,
          };
        }
        return opportunity;
      })
    );

    toast({
      title: "Investment submitted",
      description: `You have invested $${investmentAmount} in loan ${selectedOpportunityForInvestment.loanId}`,
    });

    // Reset notification preference
    setNotifyOnFunding(false);
    setIsInvestModalOpen(false);
  };

  // Extract unique countries and cities from opportunities
  const uniqueCountries = React.useMemo(() => {
    const countries = new Set<string>();
    opportunities.forEach((opportunity) => {
      countries.add(opportunity.country);
    });
    return Array.from(countries).sort();
  }, [opportunities]);

  const citiesByCountry = React.useMemo(() => {
    const citiesMap = new Map<string, string[]>();
    opportunities.forEach((opportunity) => {
      if (!citiesMap.has(opportunity.country)) {
        citiesMap.set(opportunity.country, []);
      }
      citiesMap.get(opportunity.country)?.push(opportunity.city);
    });

    // Sort cities within each country
    citiesMap.forEach((cities) => {
      cities.sort();
    });

    return citiesMap;
  }, [opportunities]);

  // Get cities for the selected country
  const citiesForSelectedCountry = React.useMemo(() => {
    if (countryFilter === "all") return [];
    return citiesByCountry.get(countryFilter) || [];
  }, [countryFilter, citiesByCountry]);

  // Reset city filter when country changes
  React.useEffect(() => {
    setCityFilter("all");
  }, [countryFilter]);

  const renderOpportunityItem = (opportunity: Opportunity) => {
    const fundedPercentage = opportunity.funded;

    return (
      <Card key={opportunity.loanId} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <Badge 
                variant={
                  opportunity.status === "OPEN"
                    ? "default"
                    : opportunity.status === "CLOSED"
                    ? "outline"
                    : "secondary"
                }
                className="mb-2"
              >
                {opportunity.status}
              </Badge>
              <CardTitle className="text-xl">{opportunity.borrower}</CardTitle>
              <CardDescription>Loan ID: {opportunity.loanId}</CardDescription>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => copyToClipboard(opportunity.loanId)}
                  >
                    {isCopied ? (
                      <CopyCheckIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Copy Loan ID
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-md overflow-hidden mb-4"
          >
            <img 
              src={opportunity.propertyImageUrl} 
              alt={`Property of ${opportunity.borrower}`}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Loan Amount
              </p>
              <p className="font-semibold">{opportunity.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Interest Rate
              </p>
              <p className="font-semibold">{opportunity.interestRate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Duration
              </p>
              <p className="font-semibold">{opportunity.duration}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Property Value
              </p>
              <p className="font-semibold">{opportunity.propertyValue}</p>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-md mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Tokenized Portion:</span>
              <span className="text-sm font-medium">
                {opportunity.tokenizedPortion}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tokenized Value:</span>
              <span className="text-sm font-medium">
                {opportunity.tokenizedValue}
              </span>
            </div>
          </div>

          <p className="text-sm font-medium text-muted-foreground mb-1">
            Location
          </p>
          <p className="text-sm mb-4">{opportunity.propertyAddress}</p>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Funding Progress</span>
              <span className="text-sm font-medium">{fundedPercentage}%</span>
            </div>
            <Progress value={fundedPercentage} className="h-2" />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            disabled={opportunity.status !== "OPEN"}
            variant={opportunity.status === "OPEN" ? "default" : "outline"}
            onClick={() =>
              opportunity.status === "OPEN" && openInvestModal(opportunity)
            }
          >
            {opportunity.status === "OPEN"
              ? "Invest Now"
              : opportunity.status === "CLOSED"
              ? "Funded"
              : "Pending"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Investment Opportunities
            </h1>
            <p className="text-muted-foreground">
              Browse available mortgage investment opportunities
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search investments..."
              className="w-full md:w-[250px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={cityFilter}
              onValueChange={setCityFilter}
              disabled={countryFilter === "all"}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {citiesForSelectedCountry.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {paginatedOpportunities.map(renderOpportunityItem)}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">
              No investment opportunities found
            </h3>
            <p className="text-muted-foreground mb-8">
              Try changing your search criteria
            </p>
            <Button onClick={() => setFilter("")}>Clear Search</Button>
          </div>
        )}
        
        {filteredOpportunities.length > 0 && (
          <Pagination className="mb-8">
            <PaginationContent>
              <PaginationItem>
                {currentPage <= 1 ? (
                  <PaginationPrevious className="pointer-events-none opacity-50" />
                ) : (
                <PaginationPrevious 
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                />
                )}
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem
                  key={i}
                  className={
                    currentPage === i + 1
                      ? "hidden md:inline-block"
                      : "hidden md:inline-block"
                  }
                >
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {totalPages > 3 && currentPage < totalPages - 1 && (
                <PaginationItem className="hidden md:inline-block">
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                {currentPage >= totalPages ? (
                  <PaginationNext className="pointer-events-none opacity-50" />
                ) : (
                <PaginationNext 
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
      <Footer />

      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invest in Loan</DialogTitle>
            <DialogDescription>
              Enter the amount you want to invest in this loan opportunity.
            </DialogDescription>
          </DialogHeader>

          {selectedOpportunityForInvestment && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Borrower
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.borrower}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Loan ID
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.loanId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Loan Amount
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Interest Rate
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.interestRate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Duration
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Property Value
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.propertyValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tokenized Portion
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.tokenizedPortion}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tokenized Value
                    </p>
                    <p className="font-semibold">
                      {selectedOpportunityForInvestment.tokenizedValue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Your Wallet Balance:
                  </span>
                  <span className="font-semibold">{balance}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-amount">Investment Amount ($)</Label>
                <Input
                  id="investment-amount"
                  type="number"
                  placeholder="Enter amount to invest"
                  value={investmentAmount}
                  onChange={handleInvestmentAmountChange}
                  className={!isAmountValid ? "border-red-500" : ""}
                />
                {!isAmountValid && (
                  <p className="text-sm text-red-500">{amountErrorMessage}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notification-preference"
                  checked={notifyOnFunding}
                  onCheckedChange={setNotifyOnFunding}
                />
                <Label htmlFor="notification-preference">
                  Notify me at 75% funding
                </Label>
              </div>

              {estimatedReturn > 0 && isAmountValid && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Estimated Return</h3>
                  <div className="flex justify-between">
                    <span>Principal:</span>
                    <span>${Number(investmentAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest:</span>
                    <span>
                      $
                      {(
                        estimatedReturn - Number(investmentAmount)
                      ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total Return:</span>
                    <span>
                      $
                      {estimatedReturn.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInvestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvestSubmit}
              disabled={
                !isAmountValid ||
                !investmentAmount ||
                Number(investmentAmount) <= 0
              }
            >
              Confirm Investment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorPool;
