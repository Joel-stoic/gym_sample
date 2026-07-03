'use client'

import { useState, useEffect } from 'react'
import memberApi from '@/src/lib/memberApi'
import {
  CalendarCheck, CreditCard, Clock,
  AlertCircle, CheckCircle,
  Utensils, ChevronRight
} from 'lucide-react'
import { formatDate } from '@/src/lib/utils'
import Link from 'next/link'
import {
  useMemberStore
} from '@/src/store/memberStore'


export default function MemberPortalPage() {
  const profile =
    useMemberStore(
      state => state.profile
    )

  const setProfile =
    useMemberStore(
      state => state.setProfile
    )

  const [loading, setLoading] =
    useState(!profile)

  useEffect(() => {

    if (profile) {
      setLoading(false)
      return
    }

    memberApi
      .get('/api/members/portal/profile')
      .then((res) => {

        setProfile(
          res.data.data
        )

      })
      .finally(() => {

        setLoading(false)

      })

  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Failed to load profile
      </div>
    )
  }

  const daysLeft = profile.membershipExpiry
    ? Math.ceil(
      (new Date(profile.membershipExpiry).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
    )
    : null

  const isExpiringSoon = daysLeft !== null && daysLeft <= 7
  const isExpired = profile.status === 'EXPIRED'

  return (
    <div className="space-y-4 max-w-lg mx-auto">

      {/* Welcome */}
      <div className="text-center py-4">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-foreground mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          {profile.name?.charAt(0).toUpperCase()}
        </div>
        <h2
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {profile.name}
        </h2>
        <p className="text-muted-foreground text-sm">{profile.phone}</p>
      </div>

      {/* Expiry warning */}
      {(isExpiringSoon || isExpired) && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{
            background: isExpired ? '#ef444410' : '#f9731610',
            border: `1px solid ${isExpired ? '#ef444430' : '#f9731630'}`
          }}
        >
          <AlertCircle
            size={16}
            className="mt-0.5 flex-shrink-0"
            style={{ color: isExpired ? '#ef4444' : '#f97316' }}
          />
          <p
            className="text-[13px]"
            style={{ color: isExpired ? '#ef4444' : '#f97316' }}
          >
            {isExpired
              ? 'Your membership has expired. Contact your gym to renew.'
              : daysLeft === 0
                ? 'Your membership expires today!'
                : `Your membership expires in ${daysLeft} day${daysLeft && daysLeft > 1 ? 's' : ''}. Please renew.`
            }
          </p>
        </div>
      )}

      {/* Membership card */}
      <div
        className="rounded-2xl p-5"
        
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
            Membership
          </p>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{
              background: profile.status === 'ACTIVE' ? '#16a34a20' : '#ef444420',
              color: profile.status === 'ACTIVE' ? '#4ade80' : '#f87171'
            }}
          >
            {profile.status}
          </span>
        </div>

        <div className="space-y-3">
          {profile.plan && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard size={14} />
                <span className="text-[13px]">Plan</span>
              </div>
              <span className="text-[13px] font-medium text-foreground">
                {profile.plan.name}
              </span>
            </div>
          )}
          {profile.membershipStart && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span className="text-[13px]">Started</span>
              </div>
              <span className="text-[13px] text-foreground">
                {formatDate(profile.membershipStart)}
              </span>
            </div>
          )}
          {profile.membershipExpiry && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarCheck size={14} />
                <span className="text-[13px]">Expires</span>
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: isExpiringSoon ? '#f97316' : 'white' }}
              >
                {formatDate(profile.membershipExpiry)}
              </span>
            </div>
          )}
          {profile.membershipStart && profile.membershipExpiry && (
            <>
              {(() => {
                const start = new Date(profile.membershipStart).getTime()
                const end = new Date(profile.membershipExpiry).getTime()
                const now = Date.now()

                const totalDays = Math.max(
                  1,
                  Math.ceil((end - start) / (1000 * 60 * 60 * 24))
                )

                const usedDays = Math.max(
                  0,
                  Math.ceil((now - start) / (1000 * 60 * 60 * 24))
                )

                const percentage = Math.min(
                  100,
                  Math.max(0, (usedDays / totalDays) * 100)
                )

                return (
                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-muted-foreground">
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                      </span>

                      <span className="text-[12px] text-muted-foreground">
                        {Math.round(percentage)}% used
                      </span>
                    </div>

                    <div
                      className="h-2 w-full rounded-full overflow-hidden"
                      style={{ background: '#ffffff10' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          background:
                            daysLeft && daysLeft <= 7
                              ? '#f97316'
                              : 'linear-gradient(90deg, #7c3aed, #a855f7)'
                        }}
                      />
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </div>
      </div>
      {profile.ptEnrollments?.[0] && (
        <div
          className="rounded-2xl p-5"
          
        >
          <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Personal Training
          </p>

          {(() => {
            const pt = profile.ptEnrollments[0]

            const progress =
              pt.totalSessions > 0
                ? (pt.usedSessions / pt.totalSessions) * 100
                : 0

            return (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-foreground font-medium">
                    {pt.package.name}
                  </span>

                  <span
                    className="px-2 py-1 rounded-lg text-[11px]"
                    style={{
                      background:
                        pt.status === 'ACTIVE'
                          ? '#10b98115'
                          : '#ef444415',
                      color:
                        pt.status === 'ACTIVE'
                          ? '#10b981'
                          : '#ef4444'
                    }}
                  >
                    {pt.status}
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Session Progress
                  </span>

                  <span className="text-xs text-foreground">
                    {pt.usedSessions}/{pt.totalSessions}
                  </span>
                </div>


                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: '#ffffff10' }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${progress}%`,
                      background:
                        'linear-gradient(90deg,#7c3aed,#a855f7)'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <div
                    className="rounded-xl p-3"
                    style={{ background: '#10b98110' }}
                  >
                    <p className="text-[11px] text-emerald-400">
                      Remaining
                    </p>

                    <p className="text-2xl font-bold text-foreground">
                      {pt.remainingSessions}
                    </p>
                  </div>

                  <div
                    className="rounded-xl p-3"
                    style={{ background: '#7c3aed15' }}
                  >
                    <p className="text-[11px] text-violet-400">
                      Total
                    </p>

                    <p className="text-2xl font-bold text-foreground">
                      {pt.totalSessions}
                    </p>
                  </div>

                </div>
                {/* eee */}
                {pt.sessions?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
                      Upcoming Sessions
                    </p>

                    <div className="space-y-2">
                      {pt.sessions
                        .filter(
                          (s: any) =>
                            new Date(s.scheduledAt) > new Date() &&
                            s.status !== 'CANCELLED'
                        )
                        .slice(0, 5)
                        .map((session: any) => (
                          <div
                            key={session.id}
                            className="rounded-xl p-3 flex items-center justify-between"
                            style={{
                              background: '#ffffff08',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div>
                              <p className="text-sm text-foreground font-medium">
                                {new Date(session.scheduledAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Trainer: {session.trainer?.name || 'Not Assigned'}
                              </p>
                            </div>

                            <span
                              className="px-2 py-1 rounded-lg text-[11px]"
                              style={{
                                background: '#7c3aed15',
                                color: '#a855f7'
                              }}
                            >
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

      {/* This month */}
      <div
        className="rounded-2xl p-5"
        
      >
        <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
          This Month
        </p>
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: '#7c3aed20' }}
          >
            <CalendarCheck size={20} className="text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {profile.visitsThisMonth}
            </p>
            <p className="text-[12px] text-muted-foreground">gym visits</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <Link
        href="/member/diet"
        className="flex items-center justify-between rounded-2xl p-4 transition-colors"
        
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: '#7c3aed20' }}
          >
            <Utensils size={16} className="text-violet-400" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">
              Diet & Weight
            </p>
            <p className="text-[11px] text-muted-foreground">
              View your diet plan and track weight
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </Link>

      {/* Recent attendance */}
      {profile.attendance?.length > 0 && (
        <div
          className="rounded-2xl p-5"
          
        >
          <p className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Recent Visits
          </p>
          <div className="space-y-2">
            {profile.attendance.slice(0, 5).map((record: any) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <span className="text-[13px] text-foreground">
                    {formatDate(record.checkInAt)}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(record.checkInAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
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