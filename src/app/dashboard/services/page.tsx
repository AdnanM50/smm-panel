'use client'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, ShoppingCart } from "lucide-react";

export default function Services() {
  const services = [
    {
      id: "4414",
      name: "YouTube Adword Packages [ Skippable Ads ] [ 50K ] [ Nondrop]",
      rate: "$43.20",
      minOrder: "1",
      maxOrder: "1",
      duration: "Start 0-24 Hrs",
    },
    {
      id: "4415",
      name: "YouTube Adword Packages [ Skippable Ads ] [ 100K ] [ Nondrop]",
      rate: "$81.00",
      minOrder: "1",
      maxOrder: "1",
      duration: "Start 0-24 Hrs",
    },
    {
      id: "4416",
      name: "YouTube Adword Packages [ Skippable Ads ] [ 250K ] [ Nondrop]",
      rate: "$205.20",
      minOrder: "1",
      maxOrder: "1",
      duration: "Start 0-24 Hrs",
    },
    {
      id: "4417",
      name: "YouTube Adword Packages [ Skippable Ads ] [ 500K ] [ Nondrop]",
      rate: "$399.60",
      minOrder: "1",
      maxOrder: "1",
      duration: "Start 0-24 Hrs",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">Browse and order our services</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Service"
              className="pl-10 bg-background border-border"
            />
          </div>
          <Button className="bg-gradient-primary">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="mb-6">
          <Badge className="bg-gradient-primary text-primary-foreground text-base px-4 py-2">
            YouTube Adword Views - SKIPPABLE ADS [ PACKAGES ]
          </Badge>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">Favorite</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rate per 1000</TableHead>
                <TableHead>Min order - Max order</TableHead>
                <TableHead>Service Detail</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="text-muted-foreground">☆</span>
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{service.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.duration}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{service.rate}</TableCell>
                  <TableCell>
                    {service.minOrder} - {service.maxOrder}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button className="bg-gradient-primary" size="sm">
                      <ShoppingCart className="mr-2 h-4 w-4" />
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
  );
}
