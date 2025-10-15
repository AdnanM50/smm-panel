'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, DollarSign, TrendingUp, Info, Sparkles, Zap, Star } from "lucide-react";

export default function AddFunds() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Enhanced Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-gradient-primary">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Funds
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Power up your account with our secure payment system and unlock premium features
        </p>
      </div>

      {/* Enhanced Main Card with Floating Animation */}
      <Card className="p-8 bg-gradient-primary border-none floating-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 flex items-start gap-4 text-white">
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Wallet className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-300" />
              Instant Fund Addition
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Generate secure invoices and add funds instantly. Multiple payment methods available with exclusive bonuses!
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
        <Card className="lg:col-span-2 p-8 bg-gradient-card border-border glow-on-hover">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="mood-tabs grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="add" className="mood-tab-trigger">
                <DollarSign className="mr-2 h-5 w-5" />
                <span className="font-semibold">Add Balance</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="mood-tab-trigger">
                <TrendingUp className="mr-2 h-5 w-5" />
                <span className="font-semibold">Payment History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-info">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Add Balance</h2>
                  <p className="text-muted-foreground">Choose your preferred payment method</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground block">Payment Method</label>
                <Select defaultValue="binance">
                  <SelectTrigger className="h-14 text-lg bg-background border-border hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="binance" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">Binance Pay</span>
                        <span className="text-sm text-muted-foreground">Min: $5 | Bonus: $1-99 5% | $100+ 6% | $500+ 7% | $1000+ 10%</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">PayPal</span>
                        <span className="text-sm text-muted-foreground">Secure PayPal integration</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe" className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold">Stripe</span>
                        <span className="text-sm text-muted-foreground">Credit/Debit card payments</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 rounded-xl bg-gradient-warning/10 border border-warning/20">
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

              <Button className="w-full bg-gradient-primary text-xl py-6 pulse-button glow-on-hover">
                <Zap className="mr-3 h-6 w-6" />
                Proceed to Payment
              </Button>
            </TabsContent>

            <TabsContent value="history">
              <div className="text-center py-16">
                <div className="p-6 rounded-full bg-gradient-info/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No Payment History</h3>
                <p className="text-muted-foreground text-lg">Your payment transactions will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          {/* Enhanced Information Card */}
          <Card className="p-8 bg-gradient-card border-border floating-card glow-on-hover">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-success">
                <Info className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Account Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-info/10 border border-info/20">
                <p className="text-sm text-muted-foreground mb-2">Welcome back,</p>
                <p className="text-lg font-semibold text-foreground">shoaibsanto</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-success/10 border border-success/20">
                <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                <p className="text-3xl font-bold text-success">$15.87</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-warning/10 border border-warning/20">
                <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
                <p className="text-2xl font-bold text-warning">$249.78</p>
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
          <Card className="p-6 bg-gradient-card border-border glow-on-hover">
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
    </div>
  );
}
