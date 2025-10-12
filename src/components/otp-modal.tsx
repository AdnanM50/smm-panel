"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, CheckCircle2, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface OTPModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export function OTPModal({ isOpen, onClose, email }: OTPModalProps) {
  const { verifyOTP, resetPassword } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<'otp' | 'new-password' | 'success'>('otp')
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await verifyOTP(email, otp)
      
      if (result.success) {
        toast.success(result.message)
        setStep('new-password')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters long')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await resetPassword(email, otp, newPassword)
      
      if (result.success) {
        toast.success(result.message)
        setStep('success')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('otp')
    setOtp("")
    setNewPassword("")
    setConfirmPassword("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'new-password' && 'Set New Password'}
            {step === 'success' && 'Password Reset Successful'}
          </DialogTitle>
        </DialogHeader>

        {step === 'otp' && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-400 text-xl">🔐</span>
              </div>
              <p className="text-slate-400 text-sm">
                Enter the 6-digit code sent to
                <br />
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
                disabled={isSubmitting || otp.length !== 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          </Card>
        )}

        {step === 'new-password' && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-slate-400 text-sm">
                Code verified! Now set your new password
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pl-10 pr-10"
                    required
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </Card>
        )}

        {step === 'success' && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Reset Successful!</h3>
              <p className="text-slate-400 mb-4">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to login page...
              </p>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
