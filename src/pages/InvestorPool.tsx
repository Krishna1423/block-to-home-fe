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
import { useAvailableLoans } from "@/hooks/useLoans";
import { useFundLoan } from "@/hooks/useFundLoan";
import { usePoolDeposit } from "@/hooks/usePoolDeposit";
import { useUSDTBalance } from "@/hooks/useUSDTBalance";
import { Loader2, AlertCircle } from "lucide-react";
import { useChainId, useWatchContractEvent, useReadContract, useAccount } from "wagmi";
import { LOAN_CONTRACT_ABI } from "@/lib/loanContract";
import { getLiquidityPoolAddress, LIQUIDITY_POOL_ABI } from "@/lib/liquidityPool";
import { useQueryClient } from "@tanstack/react-query";

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
  status: "PENDING" | "OPEN" | "FUNDED" | "ACTIVE" | "COMPLETED" | "DEFAULTED" | "CLOSED";
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

  // Fetch real loans from blockchain
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { loans: availableLoans, isLoading: isLoadingLoans, error: loansError, refetch: refetchLoans, loanContractAddress } = useAvailableLoans();
  const { fundLoan, isPending: isFundingLoan, isSuccess: isLoanFunded, hash: fundingHash } = useFundLoan();
  const { deposit: depositToPool, isPending: isDepositing, isSuccess: isDeposited, hash: depositHash, minDepositAmount } = usePoolDeposit();
  const { balance: usdtBalance, formattedBalance: usdtFormattedBalance, isLoading: isLoadingBalance } = useUSDTBalance();
  
  // Investment amount state (for pool deposit)
  const [depositAmount, setDepositAmount] = useState<string>("100");

  // Read pool balance and loans funded
  const liquidityPoolAddress = getLiquidityPoolAddress(chainId);
  const { data: totalPoolBalanceBigInt, refetch: refetchTotalPoolBalance } = useReadContract({
    address: liquidityPoolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalPoolBalance',
    query: {
      enabled: !!liquidityPoolAddress,
      refetchInterval: 2000, // Refetch every 2 seconds for faster updates
      staleTime: 0, // Always consider data stale - force fresh reads
      gcTime: 0, // Don't cache - always fetch fresh
    },
  });
  const { data: totalLoansFundedBigInt, refetch: refetchTotalLoansFunded } = useReadContract({
    address: liquidityPoolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'totalLoansFunded',
    query: {
      enabled: !!liquidityPoolAddress,
      refetchInterval: 2000, // Refetch every 2 seconds for faster updates
      staleTime: 0, // Always consider data stale - force fresh reads
      gcTime: 0, // Don't cache - always fetch fresh
    },
  });
  
  // Calculate available balance = totalPoolBalance - totalLoansFunded
  const totalPoolBalance = totalPoolBalanceBigInt ? Number(totalPoolBalanceBigInt) / 1e6 : 0; // USDT has 6 decimals
  const totalLoansFunded = totalLoansFundedBigInt ? Number(totalLoansFundedBigInt) / 1e6 : 0; // USDT has 6 decimals
  const poolBalance = totalPoolBalance - totalLoansFunded; // Available balance

  // Refetch function that refetches both values
  const refetchPoolBalance = React.useCallback(() => {
    refetchTotalPoolBalance();
    refetchTotalLoansFunded();
  }, [refetchTotalPoolBalance, refetchTotalLoansFunded]);

  // Debug logging for pool balance
  React.useEffect(() => {
    console.log('💧 Pool Balance Update:', {
      totalPoolBalance: totalPoolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalLoansFunded: totalLoansFunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      availableBalance: poolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      liquidityPoolAddress,
      chainId,
    });
  }, [totalPoolBalance, totalLoansFunded, poolBalance, liquidityPoolAddress, chainId]);

  // Refetch pool balance when loan is successfully funded
  React.useEffect(() => {
    if (isLoanFunded) {
      console.log('🔄 Loan funded - invalidating pool balance cache');
      // Invalidate all readContract queries for the liquidity pool (both totalPoolBalance and totalLoansFunded)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          // Check if this is a readContract query for the liquidity pool
          if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
          const params = queryKey[1] as any;
          return params?.address?.toLowerCase() === liquidityPoolAddress?.toLowerCase() &&
                 (params?.functionName === 'totalPoolBalance' || params?.functionName === 'totalLoansFunded');
        },
      });
      // Also manually refetch
      setTimeout(() => {
        console.log('🔄 Refetching pool balance (1s delay)');
        refetchPoolBalance();
      }, 1000);
      setTimeout(() => {
        console.log('🔄 Refetching pool balance (3s delay)');
        refetchPoolBalance();
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
            const params = queryKey[1] as any;
            return params?.address?.toLowerCase() === liquidityPoolAddress?.toLowerCase() &&
                   params?.functionName === 'totalPoolBalance';
          },
        });
      }, 3000);
      setTimeout(() => {
        console.log('🔄 Refetching pool balance (5s delay)');
        refetchPoolBalance();
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
            const params = queryKey[1] as any;
            return params?.address?.toLowerCase() === liquidityPoolAddress?.toLowerCase() &&
                   params?.functionName === 'totalPoolBalance';
          },
        });
      }, 5000);
    }
  }, [isLoanFunded, refetchPoolBalance, queryClient, liquidityPoolAddress]);

  // Read user's pool participation
  const { address: userAddress } = useAccount();
  const { data: userParticipantData } = useReadContract({
    address: liquidityPoolAddress,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getParticipant',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!liquidityPoolAddress && !!userAddress,
      refetchInterval: 5000,
    },
  });
  const userPoolDeposit = userParticipantData ? Number(userParticipantData.totalDeposited) / 1e6 : 0;
  const userPoolShare = userParticipantData && poolBalance > 0 
    ? (userPoolDeposit / poolBalance) * 100 
    : 0;

  // Watch for new loan creation events and refetch when detected
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'LoanRequestCreated',
    onLogs() {
      // Refetch loans when a new one is created
      setTimeout(() => {
        refetchLoans();
      }, 2000); // Wait 2 seconds for transaction to be mined
    },
  });

  // Watch for loan funding events and refetch when detected
  useWatchContractEvent({
    address: loanContractAddress,
    abi: LOAN_CONTRACT_ABI,
    eventName: 'LoanFunded',
    onLogs(logs) {
      console.log('📢 LoanFunded event detected:', logs);
      // Refetch loans and pool balance when a loan is funded
      // Pool balance decreases when loan is funded, so we need to refetch it
      setTimeout(() => {
        console.log('🔄 Event listener: Refetching pool balance (2s delay)');
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
            const params = queryKey[1] as any;
            return params?.address?.toLowerCase() === liquidityPoolAddress?.toLowerCase() &&
                   params?.functionName === 'totalPoolBalance';
          },
        });
        refetchLoans();
        refetchPoolBalance();
      }, 2000); // Wait 2 seconds for transaction to be mined
    },
  });

  // Mock data (commented out - kept for reference)
  /*
  const [mockOpportunities] = useState<Opportunity[]>([
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
  */

  // Transform real loans to Opportunity format
  const opportunities: Opportunity[] = React.useMemo(() => {
    if (!availableLoans || availableLoans.length === 0) return [];

    return availableLoans.map((loan) => {
      // Format borrower address (show first 6 and last 4 characters)
      const borrowerAddress = loan.borrower;
      const borrowerDisplay = `${borrowerAddress.slice(0, 6)}...${borrowerAddress.slice(-4)}`;
      
      // Calculate duration in years (approximate)
      const durationYears = Math.round(loan.duration / 12);
      const durationDisplay = durationYears > 0 ? `${durationYears} year${durationYears > 1 ? 's' : ''}` : `${loan.duration} month${loan.duration > 1 ? 's' : ''}`;
      
      // Calculate end date (approximate)
      const startDate = new Date(loan.createdAt * 1000);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + loan.duration);
      
      // Extract country and city from property address if available
      const addressParts = loan.propertyAddress?.split(',') || [];
      const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() || 'Unknown' : 'Unknown';
      const country = addressParts.length > 0 ? addressParts[addressParts.length - 1]?.trim() || 'Unknown' : 'Unknown';

      return {
        loanId: loan.loanId,
        borrower: borrowerDisplay,
        amount: `$${loan.loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        interestRate: `${loan.interestRate.toFixed(1)}%`,
        duration: durationDisplay,
        propertyValue: loan.propertyValue ? `$${loan.propertyValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A',
        tokenizedPortion: loan.tokenizedPortion || 0,
        tokenizedValue: loan.tokenizedValue ? `$${loan.tokenizedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A',
        collateralType: (loan.collateralType?.toUpperCase() === 'GOLD' ? 'GOLD' : 'USDT') as 'USDT' | 'GOLD',
        status: loan.status as "PENDING" | "OPEN" | "FUNDED" | "ACTIVE" | "COMPLETED" | "DEFAULTED" | "CLOSED",
        funded: loan.fundedPercentage,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        propertyImageUrl: loan.propertyImageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
        propertyAddress: loan.propertyAddress || 'Address not available',
        country,
        city,
      };
    });
  }, [availableLoans]);

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

    // Note: This is a pool-based funding model
    // Individual investments are not directly made to loans
    // Instead, users deposit to the liquidity pool, and loans are funded from the pool
    // For now, we'll show a message explaining this
    toast({
      title: "Pool-Based Funding Model",
      description: "Loans are funded from the liquidity pool. Please deposit to the pool to enable loan funding. Individual loan investments are not supported.",
      variant: "default",
    });

    // Reset notification preference
    setNotifyOnFunding(false);
    setIsInvestModalOpen(false);
  };

  // Extract unique countries and cities from opportunities
  const uniqueCountries = React.useMemo(() => {
    const countries = new Set<string>();
    opportunities.forEach((opportunity) => {
      if (opportunity.country && opportunity.country !== 'Unknown') {
        countries.add(opportunity.country);
      }
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
              <span className="text-sm font-medium">Loan Funding Status</span>
              <span className="text-sm font-medium">{fundedPercentage}%</span>
            </div>
            <Progress value={fundedPercentage} className="h-2" />
            {poolBalance > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Pool Available:</span>
                <span className={`font-medium ${
                  Number(opportunity.amount.replace(/[^0-9.-]+/g, "")) <= poolBalance 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {poolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </span>
                {Number(opportunity.amount.replace(/[^0-9.-]+/g, "")) > poolBalance && (
                  <span className="text-orange-600">⚠️ Insufficient</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            disabled={opportunity.status !== "OPEN" && opportunity.status !== "PENDING"}
            variant={opportunity.status === "OPEN" || opportunity.status === "PENDING" ? "default" : "outline"}
            onClick={() =>
              (opportunity.status === "OPEN" || opportunity.status === "PENDING") && openInvestModal(opportunity)
            }
          >
            {opportunity.status === "OPEN" || opportunity.status === "PENDING"
              ? "View Details"
              : opportunity.status === "FUNDED" || opportunity.status === "ACTIVE" || opportunity.status === "COMPLETED" || opportunity.status === "CLOSED"
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

        {/* Pool Statistics Section */}
        {liquidityPoolAddress && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💧</span>
                Liquidity Pool Statistics
              </CardTitle>
              <CardDescription>
                Track the shared liquidity pool that funds all loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Pool Balance
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {poolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available for loan funding
                  </p>
                </div>
                {userAddress && userPoolDeposit > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Your Pool Deposit
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {userPoolDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {userPoolShare.toFixed(2)}% of total pool
                    </p>
                  </div>
                )}
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Available Loans
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {availableLoans?.filter(loan => loan.status === 'OPEN' || loan.status === 'PENDING').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waiting for funding
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 rounded-md">
                <p className="text-xs text-blue-900">
                  <strong>💡 How it works:</strong> The liquidity pool is a shared fund where investors deposit USDT. 
                  When loans are funded, funds are transferred from the pool to borrowers. 
                  Pool balance ≠ Loan funding status. A loan shows 0% funded until someone clicks "Fund Loan from Pool" when the pool has enough funds.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingLoans ? (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-bcms-blue-light mb-4" />
            <p className="text-gray-600">Loading investment opportunities...</p>
          </div>
        ) : loansError ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600 mb-2">Error loading loans</p>
            <p className="text-sm text-gray-600 mb-2">{loansError.message}</p>
            {!loanContractAddress && (
              <p className="text-xs text-gray-500 mt-2">
                LoanContract address not configured for this chain.
                <br />
                Please set VITE_LOAN_CONTRACT_ADDRESS_{chainId} in your .env file.
              </p>
            )}
            <Button onClick={() => refetchLoans()} className="mt-4">Retry</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {paginatedOpportunities.map(renderOpportunityItem)}
            </div>

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">
                  No investment opportunities found
                </h3>
                <p className="text-muted-foreground mb-8">
                  {opportunities.length === 0 
                    ? "No loans are currently available for investment. Check back later!"
                    : "Try changing your search criteria"}
                </p>
                {opportunities.length > 0 && (
                  <Button onClick={() => setFilter("")}>Clear Search</Button>
                )}
              </div>
            )}
          </>
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
            <DialogTitle>Loan Funding Information</DialogTitle>
            <DialogDescription>
              This platform uses a pool-based funding model. Loans are funded from the liquidity pool, not through individual investments.
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

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">Pool-Based Funding Model</h3>
                <p className="text-sm text-blue-800 mb-3">
                  This platform uses a <strong>pool-based funding model</strong>. Here's how it works:
                </p>
                <div className="bg-white p-3 rounded border border-blue-100 mb-3">
                  <p className="text-xs text-blue-900 font-medium mb-2">📋 Two-Step Process:</p>
                  <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                    <li><strong>Step 1:</strong> Deposit USDT into the liquidity pool (adds funds to the shared pool)</li>
                    <li><strong>Step 2:</strong> Fund the loan from the pool (transfers funds from pool to borrower)</li>
                  </ol>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Loan Amount:</span>
                    <span className="font-semibold">{selectedOpportunityForInvestment.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Current Pool Balance:</span>
                    <span className="font-semibold">{poolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Funding Status:</span>
                    <span className="font-semibold">
                      {selectedOpportunityForInvestment.funded !== undefined 
                        ? `${selectedOpportunityForInvestment.funded}% funded`
                        : 'Not funded'}
                    </span>
                  </div>
                  {poolBalance > 0 && Number(selectedOpportunityForInvestment.amount.replace(/[^0-9.-]+/g, "")) > poolBalance && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md mt-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <p className="font-medium">Pool balance insufficient</p>
                        <p className="mt-1">
                          Pool has {poolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT, 
                          but loan requires {selectedOpportunityForInvestment.amount}. 
                          Please deposit more USDT to the pool first.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="deposit-amount">Deposit Amount (USDT)</Label>
                    <span className="text-xs text-gray-500">
                      Balance: {isLoadingBalance ? '...' : `${usdtFormattedBalance || '0'} USDT`}
                    </span>
                  </div>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder={`Minimum: ${minDepositAmount} USDT`}
                    value={depositAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                        setDepositAmount(value);
                      }
                    }}
                    min={minDepositAmount}
                    step="1"
                    className="w-full"
                  />
                  {depositAmount && Number(depositAmount) < minDepositAmount && (
                    <p className="text-sm text-red-500">
                      Minimum deposit is {minDepositAmount} USDT
                    </p>
                  )}
                  {depositAmount && usdtBalance && Number(depositAmount) > Number(usdtFormattedBalance || '0') && (
                    <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">Insufficient balance</p>
                        <p className="text-xs mt-1">
                          You have {usdtFormattedBalance || '0'} USDT, but need {depositAmount} USDT.
                          Please mint MockUSDT tokens first.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(selectedOpportunityForInvestment.status === 'OPEN' || selectedOpportunityForInvestment.status === 'PENDING') && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ Important:</p>
                  <p className="text-xs text-yellow-700">
                    You must complete <strong>both steps</strong> to fund this loan:
                  </p>
                  <ol className="text-xs text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
                    <li>First, deposit USDT to the pool using the "Deposit" button</li>
                    <li>Then, click "Fund Loan from Pool" to transfer funds from the pool to the borrower</li>
                  </ol>
                  <p className="text-xs text-yellow-600 mt-2 italic">
                    Note: The pool must have enough balance to cover the full loan amount before you can fund it.
                  </p>
                </div>
              )}

              {selectedOpportunityForInvestment.status !== 'OPEN' && selectedOpportunityForInvestment.status !== 'PENDING' && (
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    This loan is {selectedOpportunityForInvestment.status.toLowerCase()} and cannot be funded.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsInvestModalOpen(false);
                setDepositAmount("100"); // Reset on close
              }}
              disabled={isFundingLoan || isDepositing}
            >
              Close
            </Button>
            {selectedOpportunityForInvestment && (
              <>
                <Button
                  onClick={async () => {
                    if (!depositAmount || Number(depositAmount) < minDepositAmount) {
                      toast({
                        title: "Invalid amount",
                        description: `Please enter at least ${minDepositAmount} USDT`,
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      await depositToPool(depositAmount);
                      // Refetch pool balance and loans after successful deposit
                      setTimeout(() => {
                        refetchPoolBalance();
                        refetchLoans();
                      }, 2000);
                    } catch (error) {
                      console.error('Error depositing to pool:', error);
                    }
                  }}
                  disabled={isDepositing || isFundingLoan || !depositAmount || Number(depositAmount) < minDepositAmount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isDepositing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    `Deposit ${depositAmount || '0'} USDT to Pool`
                  )}
                </Button>
                <Button
                  onClick={async () => {
                    const loanAmount = Number(selectedOpportunityForInvestment.amount.replace(/[^0-9.-]+/g, ""));
                    if (poolBalance < loanAmount) {
                      toast({
                        title: "Insufficient pool balance",
                        description: `Pool has ${poolBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT, but loan requires ${loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT. Please deposit more USDT to the pool first.`,
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      await fundLoan(selectedOpportunityForInvestment.loanId);
                      // Refetch pool balance and loans after successful funding
                      // Use multiple timeouts to ensure balance updates (pool balance decreases when loan is funded)
                      console.log('✅ Fund loan transaction submitted - starting refetch sequence');
                      setTimeout(() => {
                        console.log('🔄 Button handler: Refetching pool balance (1s delay)');
                        queryClient.invalidateQueries({
                          predicate: (query) => {
                            const queryKey = query.queryKey;
          if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
          const params = queryKey[1] as any;
          return params?.address?.toLowerCase() === liquidityPoolAddress?.toLowerCase() &&
                 params?.functionName === 'totalPoolBalance';
                          },
                        });
                        refetchPoolBalance();
                        refetchLoans();
                      }, 1000);
                      setTimeout(() => {
                        console.log('🔄 Button handler: Refetching pool balance (3s delay)');
                        queryClient.invalidateQueries({
                          predicate: (query) => {
                            const queryKey = query.queryKey;
          if (queryKey[0] !== 'readContract' || !queryKey[1]) return false;
          const params = queryKey[1] as any;
          return params?.address?.toLowerCase() === liquidityPoolAddress?.toLowerCase() &&
                 params?.functionName === 'totalPoolBalance';
                          },
                        });
                        refetchPoolBalance();
                        refetchLoans();
                        setIsInvestModalOpen(false);
                        setDepositAmount("100"); // Reset on close
                      }, 3000);
                    } catch (error) {
                      console.error('Error funding loan:', error);
                    }
                  }}
                  disabled={
                    isFundingLoan || 
                    isDepositing || 
                    (selectedOpportunityForInvestment.status !== 'OPEN' && selectedOpportunityForInvestment.status !== 'PENDING') ||
                    poolBalance < Number(selectedOpportunityForInvestment.amount.replace(/[^0-9.-]+/g, ""))
                  }
                  className="bg-bcms-blue hover:bg-bcms-blue/90"
                >
                  {isFundingLoan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Funding Loan...
                    </>
                  ) : (
                    'Fund Loan from Pool'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
          {(depositHash || fundingHash) && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Transaction submitted:</strong> {(depositHash || fundingHash)?.slice(0, 10)}...{(depositHash || fundingHash)?.slice(-8)}
              </p>
              {(isDepositing || isFundingLoan) ? (
                <>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Waiting for confirmation...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    If MetaMask shows success but this is still loading, the transaction may be confirmed. Try refreshing the page.
                  </p>
                </>
              ) : (
                <p className="text-xs text-green-700 mt-1 font-medium">
                  ✓ Transaction confirmed!
                </p>
              )}
              <a
                href={`https://polkadot-hub-testnet.subscan.io/extrinsic/${depositHash || fundingHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
              >
                View on Subscan →
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestorPool;
