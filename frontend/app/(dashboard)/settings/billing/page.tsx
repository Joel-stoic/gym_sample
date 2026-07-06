'use client'

import { useState } from 'react'
import { Bebas_Neue, Inter } from 'next/font/google'
import { AlertCircle, Calendar, Users, Download, CreditCard, CheckCircle2 } from 'lucide-react'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function BillingPage() {
  const [isExpired, setIsExpired] = useState(false)

  const billingHistory = [
    { id: 'INV-001', date: '15 Aug 2024', plan: 'Growth Plan - Yearly', amount: 19190, status: 'Paid' },
    { id: 'INV-002', date: '15 Aug 2023', plan: 'Growth Plan - Yearly', amount: 19190, status: 'Paid' },
    { id: 'INV-003', date: '15 Aug 2022', plan: 'Starter Plan - Yearly', amount: 9590, status: 'Paid' },
  ]

  return (
    <div className={`p-4 md:p-8 space-y-6 ${inter.className}`}>
      
      {/* Demo State Toggle */}
      <div className="flex items-center gap-3 p-4 bg-[#0F0F1A] border border-[#ffffff10] rounded-[8px] mb-8 w-max">
        <span className="text-sm text-[#6B7280]">Demo State:</span>
        <div className="flex items-center bg-[#13131F] rounded-md p-1 border border-[#ffffff10]">
          <button 
            onClick={() => setIsExpired(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${!isExpired ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'text-[#6B7280]'}`}
          >
            ACTIVE
          </button>
          <button 
            onClick={() => setIsExpired(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${isExpired ? 'bg-red-500/10 text-red-500' : 'text-[#6B7280]'}`}
          >
            EXPIRED
          </button>
        </div>
      </div>

      {isExpired && (
        <div className="w-full bg-[#D05B37] text-white p-4 rounded-[8px] flex items-center gap-3 shadow-lg mb-8">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold">Subscription Expired</h3>
            <p className="text-sm text-white/90">Your plan has expired. Please renew your subscription to restore full access to all features.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className={`text-3xl tracking-widest text-white mb-6 uppercase ${bebas.className}`}>Billing & Subscription</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Plan Card */}
        <div className={`bg-[#0F0F1A] rounded-[8px] p-6 md:p-8 border transition-colors duration-300 ${isExpired ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-[#ffffff10]'}`}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-[#6B7280] text-xs font-bold tracking-widest uppercase mb-1">Current Plan</p>
              <h2 className={`text-4xl text-[#D05B37] tracking-wider ${bebas.className}`}>GROWTH PLAN</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border flex items-center gap-1.5 ${
              isExpired 
                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
            }`}>
              {isExpired ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {isExpired ? 'Expired' : 'Active'}
            </span>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#FFFFFF]">
                <Calendar className="w-5 h-5 text-[#6B7280]" />
                <span className="text-sm font-medium">Expires on 15 Aug 2025</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                isExpired ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
              }`}>
                {isExpired ? 'EXPIRED' : '23 days remaining'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#FFFFFF]">
                  <Users className="w-5 h-5 text-[#6B7280]" />
                  <span className="text-sm font-medium">Members used</span>
                </div>
                <span className="text-sm text-[#6B7280]"><span className="text-white font-medium">187</span> / 300</span>
              </div>
              <div className="w-full h-2 bg-[#13131F] rounded-full overflow-hidden">
                <div className="h-full bg-[#D05B37] rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Renewal Section */}
        <div className="bg-[#0F0F1A] rounded-[8px] p-6 md:p-8 border border-[#ffffff10] flex flex-col justify-center">
          <h3 className={`text-2xl text-white tracking-widest mb-6 uppercase ${bebas.className}`}>Renew your plan</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button className="flex-1 bg-[#13131F] border border-[#ffffff20] text-white hover:border-[#D05B37] hover:bg-[#D05B37]/5 px-4 py-3.5 rounded-[6px] font-semibold text-sm transition-all text-center">
              Renew Monthly — ₹1,999
            </button>
            <button className="flex-1 bg-[#D05B37] text-white hover:bg-[#D05B37]/90 hover:shadow-[0_0_20px_rgba(208,91,55,0.3)] px-4 py-3.5 rounded-[6px] font-semibold text-sm transition-all text-center relative overflow-hidden group">
              <span className="relative z-10">Renew Yearly — ₹19,190</span>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 blur-2xl group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 justify-center text-center">
            <CreditCard className="w-4 h-4 text-[#6B7280]" />
            <p className="text-[11px] text-[#6B7280]">
              Payments processed securely via <span className="font-semibold text-white/60">Razorpay</span>. UPI, Cards, Net Banking accepted.
            </p>
          </div>
        </div>
      </div>

      {/* Billing History Table */}
      <div className="mt-8 bg-[#0F0F1A] rounded-[8px] border border-[#ffffff10] overflow-hidden">
        <div className="p-6 border-b border-[#ffffff10]">
          <h3 className={`text-2xl text-white tracking-widest uppercase ${bebas.className}`}>Billing History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#13131F] text-[#6B7280]">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff08]">
              {billingHistory.map((invoice, i) => (
                <tr key={i} className="hover:bg-[#13131F]/50 transition-colors">
                  <td className="px-6 py-4 text-white">{invoice.date}</td>
                  <td className="px-6 py-4 text-[#6B7280]">{invoice.plan}</td>
                  <td className="px-6 py-4 text-white font-medium">₹{invoice.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-xs font-medium">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
