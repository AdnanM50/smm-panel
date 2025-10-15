"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import {
  TrendingUp,
  Menu,
  X,
  Shield,
  Zap,
  DollarSign,
  Users,
  Clock,
  Star,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  MessageCircle,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Lock,
  CreditCard,
  Headphones,
} from "lucide-react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 landing-page">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BEST SMM</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#services" className="text-slate-300 hover:text-orange-400 transition-colors">
                Services
              </Link>
              <Link href="#features" className="text-slate-300 hover:text-orange-400 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-slate-300 hover:text-orange-400 transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-slate-300 hover:text-orange-400 transition-colors">
                FAQ
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-slate-800 hover:text-orange-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800/50">
              <nav className="flex flex-col gap-4">
                <Link
                  href="#services"
                  className="text-slate-300 hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="#features"
                  className="text-slate-300 hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-slate-300 hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#faq"
                  className="text-slate-300 hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/50">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full text-white hover:bg-slate-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="inline-block px-3 sm:px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <span className="text-orange-400 text-xs sm:text-sm font-medium">
                  🏆 World's #1 Cheapest SMM Panel - Since 2020
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Grow Your Social Media{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Instantly
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Boost your social media presence with our premium SMM services. Get real followers, likes, views, and
                engagement across all major platforms at unbeatable prices.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                >
                  View Services
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8">
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400">500K+</div>
                  <div className="text-xs sm:text-sm text-slate-400">Active Users</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400">10M+</div>
                  <div className="text-xs sm:text-sm text-slate-400">Orders Completed</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400">24/7</div>
                  <div className="text-xs sm:text-sm text-slate-400">Support</div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/3d-illustration-of-person-using-smartphone-with-so.jpg"
                  alt="Social Media Growth Illustration"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
                {/* Gradient overlay for better integration */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 to-transparent pointer-events-none" />
              </div>

              {/* Floating stats cards - Responsive positioning */}
              <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 bg-slate-900/90 backdrop-blur-lg border border-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-white">+250%</div>
                    <div className="text-xs text-slate-400">Growth Rate</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-3 sm:-top-6 -right-3 sm:-right-6 bg-slate-900/90 backdrop-blur-lg border border-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-xl z-10 landing-stats-card">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-white">500K+</div>
                    <div className="text-xs text-slate-400">Happy Clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 sm:py-12 px-4 lg:px-8 border-y border-slate-800/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-60">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="text-slate-300 text-sm sm:text-base">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="text-slate-300 text-sm sm:text-base">100% Safe</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span className="text-slate-300 text-sm sm:text-base">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              <span className="text-slate-300 text-sm sm:text-base">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="features" className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Our SMM Panel?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              We provide the best quality services at the most affordable prices
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Delivery",
                description: "Get your orders delivered instantly after payment confirmation",
                gradient: "from-purple-600 to-purple-400",
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Cheapest Prices",
                description: "Best prices in the market with no hidden charges",
                gradient: "from-orange-600 to-orange-400",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "100% Safe & Secure",
                description: "Your account safety is our top priority",
                gradient: "from-blue-600 to-blue-400",
              },
              {
                icon: <Headphones className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Our support team is always ready to help you",
                gradient: "from-green-600 to-green-400",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${feature.gradient} p-6 border-0 hover:scale-105 transition-transform duration-300`}
              >
                <div className="text-white mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-4 lg:px-8 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Premium Services</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Boost your presence across all major social media platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Instagram className="w-8 h-8" />, name: "Instagram", color: "from-pink-600 to-purple-600" },
              { icon: <Youtube className="w-8 h-8" />, name: "YouTube", color: "from-red-600 to-red-500" },
              { icon: <Facebook className="w-8 h-8" />, name: "Facebook", color: "from-blue-600 to-blue-500" },
              { icon: <Twitter className="w-8 h-8" />, name: "Twitter", color: "from-sky-600 to-sky-500" },
              { icon: <MessageCircle className="w-8 h-8" />, name: "TikTok", color: "from-slate-800 to-slate-700" },
              { icon: <Sparkles className="w-8 h-8" />, name: "Telegram", color: "from-cyan-600 to-cyan-500" },
            ].map((service, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer"
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <div className="text-white">{service.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-slate-400 mb-4">Followers, Likes, Views, Comments & More</p>
                <Button variant="ghost" className="text-orange-400 hover:text-orange-300 p-0">
                  View Services <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Clients Say</h2>
            <p className="text-slate-400 text-lg">Trusted by thousands of satisfied customers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Influencer",
                rating: 5,
                text: "Best SMM panel I've ever used! Fast delivery and great prices. Highly recommended!",
              },
              {
                name: "Mike Chen",
                role: "Business Owner",
                rating: 5,
                text: "Excellent service and support. Helped grow my business social media presence significantly.",
              },
              {
                name: "Emma Davis",
                role: "Content Creator",
                rating: 5,
                text: "Amazing quality and instant delivery. The customer support is outstanding!",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 lg:px-8 bg-slate-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Features of Our SMM Panel</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Target />, title: "High Quality Services", desc: "Premium quality guaranteed" },
              { icon: <Clock />, title: "Fast Delivery", desc: "Instant order processing" },
              { icon: <Shield />, title: "Secure Payment", desc: "100% safe transactions" },
              { icon: <BarChart3 />, title: "Real-Time Tracking", desc: "Monitor your orders live" },
              { icon: <Users />, title: "Real Engagement", desc: "Authentic users only" },
              { icon: <Sparkles />, title: "Auto Refill", desc: "Automatic order refill" },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 p-6 hover:border-orange-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <div className="text-orange-400">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">Everything you need to know about our services</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is an SMM Panel?",
                a: "An SMM Panel is a platform that provides social media marketing services like followers, likes, views, and engagement across various social media platforms.",
              },
              {
                q: "How fast will I receive my order?",
                a: "Most orders start processing instantly after payment confirmation. Delivery time varies by service, but typically completes within minutes to a few hours.",
              },
              {
                q: "Is it safe to use your services?",
                a: "Yes, absolutely! We use secure methods that comply with platform guidelines. Your account safety is our top priority.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept various payment methods including credit cards, PayPal, cryptocurrency, and other popular payment gateways.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer refunds for orders that are not delivered as promised. Please check our refund policy for more details.",
              },
            ].map((faq, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-300">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8 bg-gradient-to-r from-orange-600 to-orange-500">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Grow Your Social Media?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and start boosting your social media presence today!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BEST SMM</span>
              </Link>
              <p className="text-slate-400 text-sm">
                The world's most affordable and reliable SMM panel for all your social media marketing needs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    YouTube
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-400">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
            <p>&copy; 2025 BEST SMM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
