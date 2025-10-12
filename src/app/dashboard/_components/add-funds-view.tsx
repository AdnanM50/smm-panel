"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, CreditCard, DollarSign } from "lucide-react"

export function AddFundsView() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            Add Funds
          </h1>
          <p className="text-slate-400">Top up your account balance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
              <div className="space-y-3">
                {["Credit Card", "PayPal", "Cryptocurrency", "Bank Transfer"].map((method) => (
                  <button
                    key={method}
                    className="w-full p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-white font-medium">{method}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Amount</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-300 font-medium">
                    Enter Amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50, 100, 250, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="bg-slate-800/50 border-slate-700 hover:bg-blue-600 hover:border-blue-600 text-white"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white h-12 text-base font-semibold shadow-lg shadow-emerald-600/30 mt-6">
                  Add Funds
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
