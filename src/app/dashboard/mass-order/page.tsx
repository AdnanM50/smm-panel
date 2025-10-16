'use client'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Info, Sparkles, Zap, Star, DollarSign, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { submitMassOrder, parseMassOrderInput, calculateTotalProfit, type MassOrderItem } from "./massOrder-api";

export default function MassOrder() {
  const { token } = useAuth()
  const [input, setInput] = useState("")
  const [orders, setOrders] = useState<MassOrderItem[]>([])
  const [totalProfit, setTotalProfit] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Parse input and calculate profit in real-time
  const updateOrdersAndProfit = useCallback(async (inputValue: string) => {
    if (!token) return

    const parsedOrders = parseMassOrderInput(inputValue)
    setOrders(parsedOrders)
    setErrors([])

    if (parsedOrders.length === 0) {
      setTotalProfit(0)
      return
    }

    // Validate orders
    const validationErrors: string[] = []
    parsedOrders.forEach((order, index) => {
      if (isNaN(order.serviceId) || order.serviceId <= 0) {
        validationErrors.push(`Line ${index + 1}: Invalid service ID`)
      }
      if (!order.link || order.link.length === 0) {
        validationErrors.push(`Line ${index + 1}: Link is required`)
      }
      if (isNaN(order.quantity) || order.quantity <= 0) {
        validationErrors.push(`Line ${index + 1}: Invalid quantity`)
      }
    })

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setTotalProfit(0)
      return
    }

    // Calculate profit
    setIsCalculating(true)
    try {
      const profit = await calculateTotalProfit(parsedOrders, token)
      setTotalProfit(profit)
    } catch (error) {
      console.error('Profit calculation error:', error)
      setTotalProfit(0)
    } finally {
      setIsCalculating(false)
    }
  }, [token])

  // Debounced effect for real-time calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      updateOrdersAndProfit(input)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [input, updateOrdersAndProfit])

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Authentication required")
      return
    }

    if (orders.length === 0) {
      toast.error("No valid orders to submit")
      return
    }

    if (errors.length > 0) {
      toast.error("Please fix validation errors before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitMassOrder(orders, token)
      
      if (result.status === 'Success') {
        toast.success("Mass Order Submitted!", {
          description: result.message
        })
        setInput("")
        setOrders([])
        setTotalProfit(0)
        setErrors([])
      } else {
        toast.error("Submission Failed", {
          description: result.message
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while submitting the mass order"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mass-order space-y-8 max-w-6xl">
      {/* Enhanced Header Section */}
      <div className="text-center space-y-4">
        <div className="mo-hero">
          <div className="mo-hero-icon">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="mo-hero-title">Mass Order</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Place multiple orders at once with our bulk ordering system
        </p>
      </div>

      {/* Enhanced Main Card with strict light-mode gradient */}
      <Card className="mo-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10 flex items-start gap-4 text-white">
          <div className="mo-card-icon p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Layers className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-300" />
              Bulk Order Processing
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Please ensure the order format is correct when placing your bulk orders. Our system will process them efficiently and securely.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-300" />
                <span>Bulk Processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span>Instant Validation</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-8 bg-gradient-card border-border glow-on-hover">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-info">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mass Order Form</h2>
              <p className="text-muted-foreground">Enter your orders in the correct format below</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-lg font-semibold text-foreground">
                  One order per line in format
                </label>
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <Textarea
                placeholder="service_id | link | quantity&#10;4084 | https://web.telegram.org/a/#8092633438 | 10&#10;2199 | https://example.com | 5"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] bg-background border-border font-mono text-sm hover:border-primary/50 transition-colors"
              />
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">Validation Errors:</p>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 rounded-xl bg-gradient-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Info className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground mb-2">Format Instructions</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Use the format: service_id | link | quantity</p>
                    <p>• Each order should be on a separate line</p>
                    <p>• Separate multiple orders with commas or new lines</p>
                    <p>• Ensure all links are valid and accessible</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || orders.length === 0 || errors.length > 0}
              className="w-full bg-gradient-primary text-xl py-6 glow-on-hover"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Zap className="mr-3 h-6 w-6" />
                  Submit Mass Order ({orders.length} orders)
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Profit Display Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border glow-on-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-success">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-foreground">Total Profit</h3>
            </div>
            
            <div className="text-center">
              {isCalculating ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24 mx-auto" />
                  <p className="text-sm text-muted-foreground">Calculating...</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-success mb-2">
                    ${totalProfit.toFixed(4)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {orders.length} order{orders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Order Preview */}
          {orders.length > 0 && (
            <Card className="p-6 bg-gradient-card border-border glow-on-hover">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-info">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-foreground">Order Preview</h3>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {orders.map((order, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline">Service {order.serviceId}</Badge>
                      <span className="text-sm font-semibold">Qty: {order.quantity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate" title={order.link}>
                      {order.link}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
