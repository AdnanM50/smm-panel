"use client"

import { Badge } from "@/components/ui/badge"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Code2, Copy, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function ApiView() {
  const [showKey, setShowKey] = useState(false)
  const apiKey = "sk_test_1234567890abcdefghijklmnop"

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-purple-400" />
            </div>
            API Documentation
          </h1>
          <p className="text-slate-400">Integrate our services into your application</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your API Key</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="bg-slate-800/50 border-slate-700 text-white font-mono pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => navigator.clipboard.writeText(apiKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Regenerate</Button>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">API Endpoints</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-600 text-white border-0">GET</Badge>
                  <code className="text-sm text-blue-400">/api/services</code>
                </div>
                <p className="text-sm text-slate-400">Get list of available services</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600 text-white border-0">POST</Badge>
                  <code className="text-sm text-blue-400">/api/order</code>
                </div>
                <p className="text-sm text-slate-400">Create a new order</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-600 text-white border-0">GET</Badge>
                  <code className="text-sm text-blue-400">/api/status</code>
                </div>
                <p className="text-sm text-slate-400">Check order status</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
