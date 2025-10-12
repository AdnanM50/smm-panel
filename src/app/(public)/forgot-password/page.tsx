"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { OTPModal } from "@/components/otp-modal"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const { verifyEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await verifyEmail(email)
      
      if (result.success) {
        toast.success(result.message)
        setIsSubmitted(true)
        setShowOTPModal(true)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">BEST SMM</span>
        </Link>

        <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-800/50 p-8">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-orange-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                <p className="text-slate-400">No worries, we'll send you reset instructions</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-slate-400 mb-6">
                We've sent a verification code to
                <br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <Button
                onClick={() => setShowOTPModal(true)}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
              >
                Enter Verification Code
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-300 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-300">
            ← Back to home
          </Link>
        </div>
      </div>

      <OTPModal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)} email={email} />
    </div>
  )
}
