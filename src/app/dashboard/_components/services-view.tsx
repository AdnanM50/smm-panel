"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Star, Eye, ShoppingCart } from "lucide-react"

const services = [
  {
    id: "4414",
    category: "YouTube Adword Views",
    name: "YouTube Adword Packages [ Skippable Ads ] [ 50K ] [ Nondrop] Start 0-24 Hrs",
    rate: "$43.20",
    min: 1,
    max: 1000000,
    favorite: false,
  },
  {
    id: "4415",
    category: "YouTube Adword Views",
    name: "YouTube Adword Packages [ Skippable Ads ] [ 100K ] [ Nondrop] Start 0-24 Hrs",
    rate: "$81.00",
    min: 1,
    max: 1000000,
    favorite: false,
  },
  {
    id: "4416",
    category: "YouTube Adword Views",
    name: "YouTube Adword Packages [ Skippable Ads ] [ 250K ] [ Nondrop] Start 0-24 Hrs",
    rate: "$205.20",
    min: 1,
    max: 1000000,
    favorite: false,
  },
  {
    id: "4417",
    category: "YouTube Adword Views",
    name: "YouTube Adword Packages [ Skippable Ads ] [ 500K ] [ Nondrop] Start 0-24 Hrs",
    rate: "$399.60",
    min: 1,
    max: 1000000,
    favorite: false,
  },
]

export function ServicesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Services</h1>
        <p className="text-slate-400">Browse and purchase our social media marketing services</p>
      </div>

      {/* Search and Filter */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-10"
            />
          </div>
        </div>
      </Card>

      {/* Category Header */}
      <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">▶</span>
          YouTube Adword Views - SKIPPABLE ADS [ PACKAGES ]
        </h2>
      </div>

      {/* Services Table */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-300 font-semibold">Favorite</TableHead>
                <TableHead className="text-slate-300 font-semibold">ID</TableHead>
                <TableHead className="text-slate-300 font-semibold">Service</TableHead>
                <TableHead className="text-slate-300 font-semibold">Rate per 1000</TableHead>
                <TableHead className="text-slate-300 font-semibold">Min - Max order</TableHead>
                <TableHead className="text-slate-300 font-semibold">Service Detail</TableHead>
                <TableHead className="text-slate-300 font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <TableCell>
                    <button
                      onClick={() => toggleFavorite(service.id)}
                      className="text-slate-400 hover:text-yellow-400 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${favorites.has(service.id) ? "fill-yellow-400 text-yellow-400" : ""}`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="font-mono text-slate-300">{service.id}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">▶</span>
                      <div>
                        <Badge className="bg-blue-600 text-white border-0 mb-1">44K</Badge>
                        <p className="text-sm text-white">{service.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-400">{service.rate}</TableCell>
                  <TableCell className="text-slate-300">
                    <span className="text-emerald-400">{service.min}</span>
                    {" - "}
                    <span className="text-rose-400">{service.max.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
