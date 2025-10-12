"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Shield, Mail, Eye, EyeOff } from "lucide-react"

export function AccountView() {
  const [activeTab, setActiveTab] = useState<"general" | "notifications">("general")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800/50">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === "general" ? "text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          General
          {activeTab === "general" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === "notifications" ? "text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Notifications
          {activeTab === "notifications" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-blue-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold">
                    S
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">shoaibsanto</h3>
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>santosarker00@gmail.com</span>
                </div>
              </div>

              {/* Gender Selection */}
              <div className="w-full pt-4">
                <Label className="text-sm text-slate-400 mb-3 block">Gender</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender("male")}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      gender === "male"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                      gender === "female"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-gradient-to-br from-red-950/30 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-red-900/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Two-factor authentication</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Email-based option to add an extra layer of protection to your account. When signing in you'll need to
                  enter a code that will be sent to your email address.
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30">
                Enable
              </Button>
            </div>
          </div>

          {/* Password Change - Full Width */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm text-slate-400">
                  Current password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm text-slate-400">
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm text-slate-400">
                  Confirm new password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30">
              Change password
            </Button>
          </div>

          {/* Language Settings */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-bold text-white mb-4">Language</h3>
            <div className="space-y-4">
              <Select defaultValue="english">
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30">
                Save
              </Button>
            </div>
          </div>

          {/* Timezone Settings */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
            <h3 className="text-lg font-bold text-white mb-4">Timezone</h3>
            <div className="space-y-4">
              <Select defaultValue="bangladesh">
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="bangladesh">
                    (UTC +6:00) Bangladesh Standard Time, Bhutan Time, Omsk Time
                  </SelectItem>
                  <SelectItem value="utc">(UTC +0:00) Coordinated Universal Time</SelectItem>
                  <SelectItem value="est">(UTC -5:00) Eastern Standard Time</SelectItem>
                  <SelectItem value="pst">(UTC -8:00) Pacific Standard Time</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
          <h3 className="text-lg font-bold text-white mb-4">Notification Settings</h3>
          <p className="text-slate-400">Notification preferences will be displayed here.</p>
        </div>
      )}
    </div>
  )
}
