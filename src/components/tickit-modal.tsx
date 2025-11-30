"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TickitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualBalance: string;
  onManualBalanceChange: (value: string) => void;
  currency: "BDT" | "USD";
  onCurrencyChange: (value: "BDT" | "USD") => void;
  isManualAmountValid: boolean;
  amountInBdt: number;
  usdToBdtRate?: number;
  showUserSummary: boolean;
  currentBalance: number;
  projectedBalance: number;
  isProcessingPayment: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  title?: string;
  description?: string;
}

export function TickitModal({
  open,
  onOpenChange,
  manualBalance,
  onManualBalanceChange,
  currency,
  onCurrencyChange,
  isManualAmountValid,
  amountInBdt,
  usdToBdtRate = 122.27,
  showUserSummary,
  currentBalance,
  projectedBalance,
  isProcessingPayment,
  onCancel,
  onSubmit,
  title = "Add Balance Manually",
  description = "Enter the amount you want to add to your account balance.",
}: TickitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">
              Amount
            </Label>
            <Input
              id="balance"
              type="number"
              placeholder="0.00"
              value={manualBalance}
              onChange={(e) => onManualBalanceChange(e.target.value)}
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
              <Select value={currency} onValueChange={(value) => onCurrencyChange(value as "BDT" | "USD")}>
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
                <span className="text-xs text-muted-foreground ml-2">(1 USD = {usdToBdtRate} BDT)</span>
              )}
            </div>
          )}
          {showUserSummary && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Current Balance: <span className="font-semibold text-foreground">${currentBalance.toFixed(2)}</span>
              </p>
              {isManualAmountValid && (
                <p className="text-sm text-muted-foreground mt-1">
                  New Balance: <span className="font-semibold text-success">${projectedBalance.toFixed(2)}</span>
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessingPayment}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
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
  );
}
