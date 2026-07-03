'use client'

import { useState, useEffect } from 'react'
import memberApi from '@/src/lib/memberApi'
import {
  CalendarCheck, CreditCard, Clock,
  AlertCircle, CheckCircle,
  Utensils, ChevronRight, Activity, CalendarDays
} from 'lucide-react'
import { formatDate } from '@/src/lib/utils'
import Link from 'next/link'
import {
  useMemberStore
} from '@/src/store/memberStore'


export default function MemberPortalPage() {
  const profile = useMemberStore(state => state.profile)
  const setProfile = useMemberStore(state => state.setProfile)
  const [loading, setLoading] = useState(!profile)
  const [now] = useState(() => Date.now()) // Fix impurity warning

  useEffect(() => {
    if (profile) {
      setLoading(false)
      return
    }

    memberApi
      .get('/api/members/portal/profile')
      .then((res) => {
        setProfile(res.data.data)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 font-medium">
        Failed to load profile
      </div>
    )
  }

  const daysLeft = profile.membershipExpiry
    ? Math.ceil(
      (new Date(profile.membershipExpiry).getTime() - now) /
      (1000 * 60 * 60 * 24)
    )
    : null

  const isExpiringSoon = daysLeft !== null && daysLeft <= 7
  const isExpired = profile.status === 'EXPIRED'

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pb-10">

      {/* Welcome & Avatar */}
      <div className="text-center py-6 sm:py-8 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none rounded-3xl" />
        <div className="h-24 w-24 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-indigo-500/20 mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden ring-1 ring-white/10 ring-offset-2 ring-offset-black">
          <span className="relative z-10">{profile.name?.charAt(0).toUpperCase()}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {profile.name}
        </h2>
        <p className="text-indigo-300 font-medium tracking-wide mt-1">{profile.phone}</p>
      </div>

      {/* Expiry warning */}
      {(isExpiringSoon || isExpired) && (
        <div className={`rounded-2xl p-4 flex items-start gap-3 border backdrop-blur-md ${isExpired ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium leading-relaxed">
            {isExpired
              ? 'Your membership has expired. Please contact your gym to renew your plan.'
              : daysLeft === 0
                ? 'Your membership expires today! Renew now to keep your access.'
                : `Your membership expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Please renew to avoid interruption.`
            }
          </p>
        </div>
      )}

      {/* Primary Membership Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              Membership
            </p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide uppercase ${profile.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {profile.status}
          </span>
        </div>

        <div className="space-y-5 relative z-10">
          {profile.plan && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500">Plan Name</span>
              <span className="text-sm font-semibold text-white bg-white/5 px-3 py-1 rounded-lg border border-white/5">{profile.plan.name}</span>
            </div>
          )}
          {profile.membershipStart && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500">Started</span>
              <span className="text-sm text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-500" />
                {formatDate(profile.membershipStart)}
              </span>
            </div>
          )}
          {profile.membershipExpiry && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-500">Expires</span>
              <span className={`text-sm font-medium flex items-center gap-1.5 ${isExpiringSoon ? 'text-amber-400' : 'text-zinc-300'}`}>
                <CalendarDays className={`w-4 h-4 ${isExpiringSoon ? 'text-amber-400' : 'text-zinc-500'}`} />
                {formatDate(profile.membershipExpiry)}
              </span>
            </div>
          )}
          
          {/* Progress Bar */}
          {profile.membershipStart && profile.membershipExpiry && (
            <div className="pt-6 mt-6 border-t border-white/5">
              {(() => {
                const start = new Date(profile.membershipStart).getTime()
                const end = new Date(profile.membershipExpiry).getTime()
                
                const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
                const usedDays = Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)))
                const percentage = Math.min(100, Math.max(0, (usedDays / totalDays) * 100))

                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-zinc-400">
                        <strong className="text-white text-sm">{daysLeft}</strong> days remaining
                      </span>
                      <span className="text-xs font-medium text-indigo-400">
                        {Math.round(percentage)}% used
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden ring-1 ring-white/5 ring-inset">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{
                          width: `${percentage}%`,
                          background: daysLeft && daysLeft <= 7 ? '#f59e0b' : 'linear-gradient(90deg, #6366f1, #a855f7)'
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20" />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Personal Training Section */}
      {profile.ptEnrollments?.[0] && (
        <div className="rounded-3xl p-6 sm:p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-400" />
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              Personal Training
            </p>
          </div>

          {(() => {
            const pt = profile.ptEnrollments[0]
            const progress = pt.totalSessions > 0 ? (pt.usedSessions / pt.totalSessions) * 100 : 0

            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {pt.package.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${pt.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {pt.status}
                  </span>
                </div>

                <div className="flex justify-between mb-3 text-sm">
                  <span className="font-medium text-zinc-500">Session Progress</span>
                  <span className="font-semibold text-white">{pt.usedSessions} / {pt.totalSessions}</span>
                </div>

                <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden ring-1 ring-white/5 ring-inset mb-6">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl p-4 bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-1 z-10">Remaining</p>
                    <p className="text-3xl font-bold text-emerald-50 z-10">{pt.remainingSessions}</p>
                  </div>
                  <div className="rounded-2xl p-4 bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1 z-10">Total</p>
                    <p className="text-3xl font-bold text-white z-10">{pt.totalSessions}</p>
                  </div>
                </div>

                {pt.sessions?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                      Upcoming Sessions
                    </p>
                    <div className="space-y-3">
                      {pt.sessions
                        .filter((s: any) => new Date(s.scheduledAt) > new Date() && s.status !== 'CANCELLED')
                        .slice(0, 5)
                        .map((session: any) => (
                          <div
                            key={session.id}
                            className="rounded-2xl p-4 flex items-center justify-between bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
                          >
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-semibold text-white">
                                {new Date(session.scheduledAt).toLocaleString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                              <p className="text-xs text-zinc-500 font-medium">
                                Trainer: <span className="text-zinc-300">{session.trainer?.name || 'Not Assigned'}</span>
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {session.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* Grid for Monthly & Diet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* This month */}
        <div className="rounded-3xl p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 group hover:border-white/10 transition-colors">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            This Month
          </p>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <CalendarCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">
                {profile.visitsThisMonth}
              </p>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">gym visits</p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <Link
          href="/member/diet"
          className="rounded-3xl p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col justify-between group hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all shadow-lg shadow-transparent hover:shadow-indigo-500/10 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <Utensils className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
              Diet & Weight
            </p>
            <p className="text-xs font-medium text-zinc-500">
              View your diet plan and track your weight journey
            </p>
          </div>
        </Link>
      </div>

      {/* Recent attendance */}
      {profile.attendance?.length > 0 && (
        <div className="rounded-3xl p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">
            Recent Visits
          </p>
          <div className="space-y-1">
            {profile.attendance.slice(0, 5).map((record: any) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {formatDate(record.checkInAt)}
                  </span>
                </div>
                <span className="text-xs font-medium text-zinc-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  {new Date(record.checkInAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}