"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Layers, Info, Sparkles } from "lucide-react"

export function MassOrderView() {
  const [orderText, setOrderText] = useState("")

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            Mass Order
          </h1>
          <p className="text-slate-400">Please ensure the order format is correct when placing your bulk orders.</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-blue-300 font-semibold mb-2">Order Format</h3>
                <p className="text-sm text-blue-300 mb-2">One order per line in format:</p>
                <code className="block p-3 rounded bg-slate-900/50 text-blue-300 text-sm font-mono">
                  service_id | link | quantity
                </code>
                <p className="text-xs text-blue-300/70 mt-2">
                  Example: 4414 | https://youtube.com/watch?v=example | 1000
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">Mass Order</label>
                <Textarea
                  placeholder="4414 | https://youtube.com/watch?v=example | 1000&#10;4415 | https://youtube.com/watch?v=example2 | 2000"
                  value={orderText}
                  onChange={(e) => setOrderText(e.target.value)}
                  className="min-h-[300px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 font-mono text-sm resize-none"
                />
                <p className="text-xs text-slate-400">Enter one order per line following the format above</p>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-base font-semibold shadow-lg shadow-blue-600/30">
                <Sparkles className="w-5 h-5 mr-2" />
                Submit Mass Order
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
