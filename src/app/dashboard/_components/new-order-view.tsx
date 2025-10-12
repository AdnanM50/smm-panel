"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CirclePlus, Info, Sparkles } from "lucide-react"

export function NewOrderView() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [charge, setCharge] = useState("43.20")

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <CirclePlus className="w-6 h-6 text-blue-400" />
            </div>
            Create New Order
          </h1>
          <p className="text-slate-400">Fill in the details below to place your order</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <div className="p-6 md:p-8">
            <div className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-300 font-medium">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger
                    id="category"
                    className="bg-slate-800/50 border-slate-700 text-white h-12 hover:bg-slate-800 transition-colors"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="youtube" className="text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">▶</span>
                        YouTube Adword Views - SKIPPABLE ADS [ PACKAGES ]
                      </div>
                    </SelectItem>
                    <SelectItem value="telegram" className="text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">✈️</span>
                        Telegram Services
                      </div>
                    </SelectItem>
                    <SelectItem value="instagram" className="text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-pink-500">📷</span>
                        Instagram Services
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service */}
              <div className="space-y-2">
                <Label htmlFor="service" className="text-slate-300 font-medium">
                  Service
                </Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger
                    id="service"
                    className="bg-slate-800/50 border-slate-700 text-white h-12 hover:bg-slate-800 transition-colors"
                  >
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="4414" className="text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">▶</span>
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">44K</span>
                        YouTube Adword Packages [ Skippable Ads ] [ 50K ] [ Nondrop] Start 0-24 Hrs
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {selectedService && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-300">
                      This service provides high-quality YouTube adword views with skippable ads. Start time: 0-24
                      hours. No drop guarantee.
                    </p>
                  </div>
                )}
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="text-slate-300 font-medium">
                  Link
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 hover:bg-slate-800 transition-colors"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-300 font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 hover:bg-slate-800 transition-colors"
                />
                <p className="text-xs text-slate-400">Min: 1 - Max: 1,000,000</p>
              </div>

              {/* Charge */}
              <div className="space-y-2">
                <Label htmlFor="charge" className="text-slate-300 font-medium">
                  Charge
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                  <Input
                    id="charge"
                    type="text"
                    value={charge}
                    readOnly
                    className="pl-8 bg-slate-800/50 border-slate-700 text-white h-12 font-semibold"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-base font-semibold shadow-lg shadow-blue-600/30">
                <Sparkles className="w-5 h-5 mr-2" />
                Place Order
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
