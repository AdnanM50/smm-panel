'use client'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Info, Sparkles, Zap, Star } from "lucide-react";

export default function MassOrder() {
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

      <Card className="p-8 bg-gradient-card border-border glow-on-hover">
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
              placeholder="service_id | link | quantity"
              className="min-h-[300px] bg-background border-border font-mono text-sm hover:border-primary/50 transition-colors"
            />
          </div>

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
                  <p>• Ensure all links are valid and accessible</p>
                </div>
              </div>
            </div>
          </div>

          <Button className="w-full bg-gradient-primary text-xl py-6 pulse-button glow-on-hover">
            <Zap className="mr-3 h-6 w-6" />
            Submit Mass Order
          </Button>
        </div>
      </Card>
    </div>
  );
}
