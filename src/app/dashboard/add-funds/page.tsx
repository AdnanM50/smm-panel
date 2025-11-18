'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, DollarSign, TrendingUp, Info, Sparkles, Zap, Star, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AddFunds() {
  const { user, token } = useAuth();
  
  const paymentOptions: Record<string, { label: string; description: string }> = {
    // binance: {
    //   label: "Binance Pay",
    //   description:
    //     "Min: $5 | Bonus: $1-99 5% | $100+ 6% | $500+ 7% | $1000+ 10%",
    // },
    // paypal: {
    //   label: "PayPal",
    //   description: "Secure PayPal integration",
    // },
    stripe: {
      label: "Stripe",
      description: "Credit/Debit card payments",
    },
    manual: {
      label: "Add Balance Manually",
      description: "Add balance directly to your account",
    },
  };

  const [paymentMethod, setPaymentMethod] = useState<string>("binance");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualBalance, setManualBalance] = useState("");
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smm-panel-khan-it.up.railway.app/api";
  const USD_TO_BDT_RATE = 122.27;
  const numericManualAmount = Number(manualBalance);
  const isManualAmountValid = !Number.isNaN(numericManualAmount) && numericManualAmount > 0;
  const amountInBdt = isManualAmountValid
    ? currency === "USD"
      ? numericManualAmount * USD_TO_BDT_RATE
      : numericManualAmount
    : 0;
  const currentBalance = user?.balance || 0;
  const [tabValue, setTabValue] = useState<string>("add");

  // Transaction history state
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Array<{
    _id: string;
    type: string;
    amount: number;
    description: string;
    balanceBefore: number;
    balanceAfter: number;
    orderId?: string;
    createdAt: string;
  }>>([]);

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    if (value === "manual") {
      setIsManualModalOpen(true);
    }
  };

  const handleProceedToPayment = () => {
    if (paymentMethod === "manual") {
      setIsManualModalOpen(true);
    } else {
      // Handle other payment methods
      console.log("Proceeding with payment method:", paymentMethod);
    }
  };

  const fetchTransactionHistory = async () => {
    if (isHistoryLoading) return;
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch('https://smm-panel-khan-it.up.railway.app/api/viewTransactionHistory', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('auth_token') ? { token: String(localStorage.getItem('auth_token')) } : {}),
        },
        next: { revalidate: 60 },
      });
      const data = await res.json();
      if (res.ok && data?.status === 'Success' && Array.isArray(data.data)) {
        setTransactions(data.data);
      } else {
        setHistoryError(data?.message || 'Failed to load transaction history');
      }
    } catch (e) {
      setHistoryError('Network error while loading history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 'history') {
      fetchTransactionHistory();
    }
  }, [tabValue]);

  const handleManualBalanceUpdate = async () => {
    if (!isManualAmountValid) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid positive number for the balance.",
      });
      return;
    }

    const amountForRequest = currency === "USD"
      ? numericManualAmount * USD_TO_BDT_RATE
      : numericManualAmount;

    setIsProcessingPayment(true);
    try {
      const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
      const response = await fetch(`${API_BASE_URL}/initiatePayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { token: authToken } : {}),
        },
        body: JSON.stringify({ amount: Number(amountForRequest.toFixed(2)) }),
      });
      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.warn("initiatePayment response parse failed", jsonError);
      }
      if (!response.ok || !data?.payment_url) {
        const message = data?.message || data?.error || `Server responded with ${response.status}`;
        throw new Error(message);
      }

      toast.success("Redirecting to payment gateway", {
        description: "You will be redirected shortly to complete the payment.",
      });
      setIsManualModalOpen(false);
      setManualBalance("");
      setPaymentMethod("binance");
      setCurrency("BDT");

      if (typeof window !== "undefined") {
        window.location.assign(data.payment_url);
      }
    } catch (error) {
      toast.error("Payment Failed", {
        description: (error as Error).message || "Unable to start payment. Please try again.",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="mass-order w-full overflow-x-hidden space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
      {/* Hero section - identical structure/classes to Mass Order */}
      <div className="text-center space-y-4">
        <div className="mo-hero">
          <div className="mo-hero-icon">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="mo-hero-title text-3xl sm:text-4xl lg:text-5xl">Add Funds</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Power up your account with our secure payment system and unlock premium features
        </p>
      </div>

      {/* Main gradient card - same class as Mass Order */}
  <Card className="mo-card w-full p-6 sm:p-8 relative overflow-hidden">
    <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
    <div className="hidden sm:block absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-4 text-white">
          <div className="mo-card-icon p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Wallet className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-300" />
              Instant Fund Addition
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Please ensure the payment details are correct before generating your invoice. Our system will process it efficiently and securely.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-300" />
                <span>Up to 10% Bonus</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span>Instant Processing</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
  <Card className="w-full lg:col-span-2 p-6 sm:p-8 bg-gradient-card h-fit border-border glow-on-hover overflow-hidden">
          <Tabs defaultValue="add" className="w-full" onValueChange={setTabValue}>
              <TabsList className="mood-tabs flex flex-row flex-nowrap items-center gap-3 mb-4 sm:mb-8 w-full overflow-x-auto py-1">
                <TabsTrigger value="add" className="mood-tab-trigger !py-3 flex items-center justify-center w-auto min-w-0 px-3  text-sm rounded-full">
                  <DollarSign className="mr-2 h-5 w-5" />
                  <span className="font-semibold truncate">Add Balance</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="mood-tab-trigger !py-3 flex items-center justify-center w-auto min-w-0 px-3  text-sm rounded-full">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  <span className="font-semibold truncate">Transaction History</span>
                </TabsTrigger>
              </TabsList>

            <TabsContent value="add" className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-info">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Add Balance</h2>
                  <p className="text-muted-foreground">Choose your preferred payment method</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground block">Payment Method</label>
                <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger className="w-full max-w-full min-h-[48px] items-center py-2 px-3 bg-background border-border hover:border-primary/50 transition-colors">
                      <div className="flex flex-col text-left w-full">
                        <span className="font-semibold leading-5">
                          {paymentOptions[paymentMethod]?.label}
                        </span>
                          <span className="text-sm text-muted-foreground leading-5 break-words">
                            {paymentOptions[paymentMethod]?.description}
                          </span>
                      </div>
                    </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="binance" className="py-3">
                      <div className="flex flex-col">
                          <span className="font-semibold">Binance Pay</span>
                          <span className="text-sm text-muted-foreground break-words">Min: $5 | Bonus: $1-99 5% | $100+ 6% | $500+ 7% | $1000+ 10%</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal" className="py-3">
                      <div className="flex flex-col">
                          <span className="font-semibold">PayPal</span>
                          <span className="text-sm text-muted-foreground break-words">Secure PayPal integration</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe" className="py-3">
                      <div className="flex flex-col">
                          <span className="font-semibold">Stripe</span>
                          <span className="text-sm text-muted-foreground break-words">Credit/Debit card payments</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="manual" className="py-3">
                      <div className="flex flex-col">
                          <span className="font-semibold flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="">Add Balance Manually</span>
                          </span>
                          <span className="text-sm text-muted-foreground break-words">Add balance directly to your account</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 sm:p-6 rounded-xl bg-gradient-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Info className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-2">Important Instructions</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>• Minimum deposit: $100</p>
                      <p>• Processing time: Instant to 24 hours</p>
                      <p>• All transactions are secure and encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-primary text-lg sm:text-xl py-3 sm:py-6 pulse-button glow-on-hover"
              >
                <Zap className="mr-3 h-6 w-6" />
                Proceed to Payment
              </Button>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Transaction History</h3>
            
              </div>

              {isHistoryLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : historyError ? (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{historyError}</p>
                  <Button variant="outline" onClick={fetchTransactionHistory}>Try Again</Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="p-6 rounded-full bg-gradient-info/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Payment History</h3>
                  <p className="text-muted-foreground text-lg">Your payment transactions will appear here</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-12">Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Before</TableHead>
                          <TableHead>After</TableHead>
                          <TableHead>Date</TableHead>
                          {/* <TableHead>Order ID</TableHead> */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((t) => (
                          <TableRow key={t._id}>
                            <TableCell className="capitalize">{t.type}</TableCell>
                            <TableCell className={`font-semibold ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{t.amount >= 0 ? '+' : ''}${t.amount.toFixed(6)}</TableCell>
                            <TableCell className="max-w-md">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="truncate cursor-help">
                                      {t.description}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-sm break-words">
                                    <p className="text-sm">{t.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>${t.balanceBefore.toFixed(6)}</TableCell>
                            <TableCell>${t.balanceAfter.toFixed(6)}</TableCell>
                            <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                            {/* <TableCell>{t.orderId ? <code className="text-xs bg-muted px-2 py-1 rounded">{t.orderId}</code> : <span className="text-muted-foreground">-</span>}</TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          {/* Enhanced Information Card */}
          <Card className="w-full p-8 bg-gradient-card border-border floating-card glow-on-hover overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-success">
                <Info className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Account Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-info/10 border border-info/20">
                <p className="text-sm text-muted-foreground mb-2">Welcome back,</p>
                <p className="text-lg font-semibold text-foreground">{user?.name || user?.username || 'User'}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                <p className="text-3xl font-bold text-success">${user?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                <p className="text-2xl font-bold text-warning">${user?.totalSpent?.toFixed(2) || '0.00'}</p>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="font-semibold text-foreground">Pro Tips</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Keep your balance topped up for uninterrupted service</p>
                  <p>• Higher deposits earn more bonus rewards</p>
                  <p>• All transactions are 100% secure</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats Card */}
          <Card className="w-full p-6 bg-gradient-card border-border glow-on-hover overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-danger">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-foreground">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-gradient-success/10">
                <p className="text-2xl font-bold text-success">12</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-info/10">
                <p className="text-2xl font-bold text-info">98%</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Manual Balance Modal */}
      <Dialog 
        open={isManualModalOpen} 
        onOpenChange={(open) => {
          setIsManualModalOpen(open);
          if (!open) {
            setManualBalance("");
            setPaymentMethod("binance"); // Reset to default payment method
            setCurrency("BDT");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Balance Manually
            </DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to your account balance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="balance"
                type="number"
                placeholder="0.00"
                value={manualBalance}
                onChange={(e) => setManualBalance(e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <div className="col-span-3">
                <Select
                  value={currency}
                  onValueChange={(value) => setCurrency(value as "BDT" | "USD")}
                >
                  <SelectTrigger className="w-full min-h-[48px] py-2 px-3">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="BDT">BDT</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isManualAmountValid && (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-sm text-muted-foreground">
                Equivalent: <span className="font-semibold text-foreground">BDT {amountInBdt.toFixed(2)}</span>
                {currency === "USD" && (
                  <span className="text-xs text-muted-foreground ml-2">(1 USD = 122.27 BDT)</span>
                )}
              </div>
            )}
            {user && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Current Balance: <span className="font-semibold text-foreground">${currentBalance.toFixed(2)}</span>
                </p>
                {isManualAmountValid && (
                  <p className="text-sm text-muted-foreground mt-1">
                    New Balance: <span className="font-semibold text-success">${(currentBalance + numericManualAmount).toFixed(2)}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsManualModalOpen(false);
                setManualBalance("");
                setPaymentMethod("binance"); // Reset to default payment method
                setCurrency("BDT");
              }}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleManualBalanceUpdate}
              disabled={isProcessingPayment || !isManualAmountValid}
              className="bg-gradient-primary"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initiating Payment...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Balance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
