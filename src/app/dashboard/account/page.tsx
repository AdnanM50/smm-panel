'use client'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Copy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Account() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    // Redirect to login page after a brief delay to show toast
    setTimeout(() => {
      window.location.href = '/login';
    }, 300);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Enhanced Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-gradient-primary">
            <User className="h-8 w-8 !text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
            Account Settings
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your account preferences and security settings
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mood-tabs grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="general" className="mood-tab-trigger">
            <User className="mr-2 h-5 w-5" />
            <span className="font-semibold">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="mood-tab-trigger">
            <Bell className="mr-2 h-5 w-5" />
            <span className="font-semibold">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 p-8 bg-gradient-card border-border glow-on-hover">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4 bg-gradient-primary">
                  <AvatarFallback className="bg-transparent text-white text-3xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-foreground">{user?.name || user?.username || 'User'}</h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20">✓</Badge>
                  </div>
                  <p className="text-muted-foreground">{user?.email || 'No email'}</p>
                  <p className="text-sm text-muted-foreground mt-1">@{user?.username || 'username'}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center mb-8">
                <Button className="bg-gradient-primary">
                  <User className="mr-2 h-4 w-4" />
                  Male
                </Button>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Female
                </Button>
              </div>

                <div className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Button className="w-full bg-gradient-primary text-lg py-6">
                    Change password
                  </Button>
                </div>

               

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <div className="flex gap-2">
                      <Select defaultValue="english">
                        <SelectTrigger id="language" className="bg-background border-border flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="bg-gradient-primary">Save</Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <div className="flex gap-2">
                      <Select defaultValue="utc">
                        <SelectTrigger id="timezone" className="bg-background border-border flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="utc">(UTC +6:00) Bangladesh Standard Time, Bhutan Time, Omsk Time</SelectItem>
                          <SelectItem value="est">Eastern Standard Time</SelectItem>
                          <SelectItem value="pst">Pacific Standard Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="bg-gradient-primary">Save</Button>
                    </div>
                  </div>

                  <div>
                    <Label>API key Created: 2025-10-03 15:45:57</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="password"
                        value="********************************"
                        readOnly
                        className="bg-background border-border flex-1"
                      />
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button className="bg-gradient-primary">Generate new</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-card border-border h-fit glow-on-hover">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-danger">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Two-factor authentication</h3>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Email-based option to add an extra layer of protection to your account. When signing in you'll need to enter a code that will be sent to your email address.
              </p>
              <Button className="w-full bg-gradient-primary text-lg py-6 pulse-button glow-on-hover">
                <Shield className="mr-3 h-5 w-5" />
                Enable 2FA
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-8 bg-gradient-card border-border glow-on-hover">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-info">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Notification Preferences</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">Configure how you receive notifications</p>
            
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-success/10 border border-success/20">
                <h3 className="font-semibold text-foreground mb-2">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive important updates via email</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-warning/10 border border-warning/20">
                <h3 className="font-semibold text-foreground mb-2">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Get instant alerts on your device</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-info/10 border border-info/20">
                <h3 className="font-semibold text-foreground mb-2">SMS Notifications</h3>
                <p className="text-sm text-muted-foreground">Critical alerts via text message</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
