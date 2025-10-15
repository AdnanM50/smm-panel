import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  TrendingUp,
  ArrowRight,
  Search,
  Plus,
  FileStack,
  MessageSquare,
  Music2,
  Linkedin,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Send,
  CheckCircle,
  Percent,
  User,
  Filter,
} from "lucide-react";

export default function Dashboard() {
  const platforms = [
    { name: "All", icon: Plus },
    { name: "Telegram", icon: Send },
    { name: "Twitter", icon: Twitter },
    { name: "Discord", icon: MessageSquare },
    { name: "SoundCloud", icon: Music2 },
    { name: "LinkedIn", icon: Linkedin },
    { name: "YouTube", icon: Youtube },
    { name: "Facebook", icon: Facebook },
    { name: "Instagram", icon: Instagram },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Current Balance</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--dashboard-green)' }}>
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>$15.87007</div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Total Spending</CardTitle>
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--dashboard-red)' }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-text-primary)' }}>$249.77993</div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--dashboard-text-secondary)' }}>Current Level</CardTitle>
            <Button size="sm" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
              Benefits <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--dashboard-blue)' }}>JUNIOR</div>
            <div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>5%</div>
            <div className="text-xs" style={{ color: 'var(--dashboard-text-muted)' }}>Next Level: FREQUENT</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Order */}
        <div className="lg:col-span-2">
          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--dashboard-text-primary)' }}>
                <Plus className="h-5 w-5" />
                Create order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Type Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New order
                </Button>
                <Button variant="outline" className="flex-1" style={{ borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}>
                  <FileStack className="h-4 w-4 mr-2" />
                  Mass order
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--dashboard-text-muted)' }} />
                <Input placeholder="Search" className="pl-10" style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }} />
              </div>

              {/* Social Media Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button size="sm" className="whitespace-nowrap" style={{ backgroundColor: 'var(--dashboard-blue)' }}>
                  <Plus className="h-4 w-4 mr-1" />
                  All
                </Button>
                {platforms.slice(1).map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <Button key={platform.name} size="sm" variant="outline" className="whitespace-nowrap" style={{ borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}>
                      <IconComponent className="h-4 w-4 mr-1" />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Category</Label>
                <Select defaultValue="youtube">
                  <SelectTrigger style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}>
                    <SelectValue placeholder="YouTube Adword Views - SKIPPABLE ADS [PACKAGES]" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }}>
                    <SelectItem value="youtube">YouTube Adword Views - SKIPPABLE ADS [PACKAGES]</SelectItem>
                    <SelectItem value="telegram">Telegram Services</SelectItem>
                    <SelectItem value="twitter">Twitter Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Service</Label>
                <Select defaultValue="service1">
                  <SelectTrigger style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}>
                    <SelectValue placeholder="4414 - YouTube Adword Packages [Skippable Ads] [50K] [Nondrop] Start 0-24 Hrs" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }}>
                    <SelectItem value="service1">4414 - YouTube Adword Packages [Skippable Ads] [50K] [Nondrop] Start 0-24 Hrs</SelectItem>
                    <SelectItem value="service2">Service 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Link Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Link</Label>
                <Input
                  placeholder="Enter your link"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)' }}
                />
              </div>

              {/* Charge Display */}
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: 'var(--dashboard-text-primary)' }}>Charge</Label>
                <Input
                  value="$43.20"
                  readOnly
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--dashboard-text-primary)', fontWeight: '600' }}
                />
              </div>

              {/* Submit Button */}
              <Button className="w-full" style={{ backgroundColor: 'var(--dashboard-blue)', fontSize: '1.125rem', padding: '1.5rem 0' }}>
                Submit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Statistics Card */}
          <Card style={{ background: 'linear-gradient(to bottom, var(--dashboard-blue-dark), var(--dashboard-blue-darker))', border: 'none' }}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Statistics Button */}
                <Button 
                  variant="ghost" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 justify-start h-auto py-3"
                >
                  Statistics
                </Button>
                
                {/* Read Before Ordering Button */}
                <Button 
                  variant="ghost" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20 justify-start h-auto py-3"
                >
                  Read Before Ordering
                </Button>
                
                {/* Divider */}
                <div className="border-t border-white/20 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Username Card */}
                    <div 
                      className="p-3 rounded-lg flex items-center gap-2"
                      style={{ background: 'linear-gradient(to bottom, var(--dashboard-blue-dark), var(--dashboard-blue-darker))' }}
                    >
                      <User className="h-4 w-4 text-white" />
                      <div>
                        <p className="text-xs text-white/70">Username</p>
                        <p className="text-sm font-semibold text-white">shoaibsanto</p>
                      </div>
                    </div>
                    
                    {/* Discount Rate Card */}
                    <div 
                      className="p-3 rounded-lg flex items-center gap-2"
                      style={{ background: 'linear-gradient(to bottom, var(--dashboard-blue-dark), var(--dashboard-blue-darker))' }}
                    >
                      <Percent className="h-4 w-4 text-white" />
                      <div>
                        <p className="text-xs text-white/70">Discount Rate</p>
                        <p className="text-sm font-semibold text-white">0%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders Card */}
          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8" style={{ color: 'var(--dashboard-green)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--dashboard-green)' }}>52</div>
              <div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>Active Orders</div>
            </CardContent>
          </Card>

          {/* Unread Tickets Card */}
          <Card style={{ backgroundColor: 'var(--dashboard-bg-card)' }}>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="h-8 w-8" style={{ color: 'var(--dashboard-blue)' }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--dashboard-blue)' }}>1</div>
              <div className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>Unread Tickets</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
