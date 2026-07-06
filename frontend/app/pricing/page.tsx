'use client'

import { useState } from 'react'
import { Bebas_Neue, Inter } from 'next/font/google'
import { Check, ChevronDown } from 'lucide-react'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: 'STARTER',
      monthlyPrice: 999,
      yearlyPrice: 999 * 12 * 0.8,
      features: [
        'Up to 100 members',
        'Staff management',
        'Attendance tracking',
        'WhatsApp notifications',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'GROWTH',
      monthlyPrice: 1999,
      yearlyPrice: 1999 * 12 * 0.8,
      features: [
        'Up to 300 members',
        'Everything in Starter',
        'Biometric device integration',
        'Payment tracking',
        'Lead management',
        'PT module',
        'Priority support'
      ],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'PRO',
      monthlyPrice: 3499,
      yearlyPrice: 3499 * 12 * 0.8,
      features: [
        'Unlimited members',
        'Everything in Growth',
        'Multi-branch support',
        'Advanced analytics',
        'Dedicated onboarding',
        'SLA support'
      ],
      cta: 'Contact Us',
      popular: false
    }
  ]

  const faqs = [
    {
      q: 'Do I need a credit card to start?',
      a: 'No, you can start your 14-day free trial without a credit card. We only ask for payment when you decide to upgrade to a paid plan.'
    },
    {
      q: 'Can I change my plan later?',
      a: 'Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges or credits will be applied automatically.'
    },
    {
      q: 'Are there any hidden setup fees?',
      a: 'Zero. You only pay the flat subscription fee. There are no setup fees, cancellation fees, or hidden charges.'
    },
    {
      q: 'Do you offer support for migration?',
      a: 'Yes! Our Growth and Pro plans include assisted migration. Our team will help you import your existing members and data.'
    }
  ]

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  return (
    <div className={`min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#D05B37]/30 ${inter.className}`}>
      <main className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className={`text-5xl md:text-7xl tracking-wide mb-4 ${bebas.className}`}>
            SIMPLE PRICING FOR <span className="text-[#D05B37]">SERIOUS GYMS</span>
          </h1>
          <p className="text-[#6B7280] text-lg">
            No hidden fees. No contracts. Cancel anytime.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center items-center gap-4 mb-16">
          <span className={`text-sm font-medium ${!isYearly ? 'text-[#FFFFFF]' : 'text-[#6B7280]'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 rounded-full bg-[#13131F] border border-[#ffffff20] transition-colors hover:border-[#ffffff40]"
          >
            <div 
              className={`absolute top-1 w-4 h-4 rounded-full bg-[#D05B37] transition-all duration-300 ${isYearly ? 'left-8' : 'left-1.5'}`} 
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isYearly ? 'text-[#FFFFFF]' : 'text-[#6B7280]'}`}>Yearly</span>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-[#D05B37]/10 text-[#D05B37] border border-[#D05B37]/20 px-2 py-0.5 rounded">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative flex flex-col rounded-[8px] bg-[#0F0F1A] border ${
                plan.popular ? 'border-[#D05B37] shadow-[0_0_30px_rgba(208,91,55,0.15)] scale-100 md:scale-105 z-10' : 'border-[#ffffff10] hover:border-[#ffffff20]'
              } transition-all duration-300 p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#D05B37] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className={`text-2xl tracking-widest mb-4 ${bebas.className}`}>{plan.name}</h3>
              
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold">₹{isYearly ? plan.yearlyPrice.toLocaleString() : plan.monthlyPrice.toLocaleString()}</span>
                  <span className="text-[#6B7280] mb-1">/{isYearly ? 'year' : 'month'}</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-[#22C55E] mt-2 font-medium">Billed annually</p>
                )}
              </div>

              <button 
                className={`w-full py-3 px-4 rounded-[6px] font-semibold text-sm transition-all duration-200 mb-8 ${
                  plan.popular 
                    ? 'bg-[#D05B37] text-white hover:bg-[#D05B37]/90 hover:shadow-[0_0_20px_rgba(208,91,55,0.3)]' 
                    : 'bg-[#13131F] border border-[#ffffff20] text-white hover:bg-[#ffffff10]'
                }`}
              >
                {plan.cta}
              </button>

              <div className="flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#22C55E] shrink-0" />
                    <span className="text-sm text-[#FFFFFF]/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-3xl tracking-wider text-center mb-10 ${bebas.className}`}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-[#0F0F1A] border border-[#ffffff10] rounded-[8px] overflow-hidden transition-colors hover:border-[#ffffff20]"
              >
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-sm">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ${openFaqIndex === i ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
