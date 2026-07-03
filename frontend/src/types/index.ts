export interface Member {
  id: string
  name: string
  phone: string
  mustChangePassword?: boolean
  email?: string
  photoUrl?: string
  gender?: string
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INACTIVE'
  membershipStart?: string
  membershipExpiry?: string
  planId?: string
  plan?: Plan
  createdAt: string
}

export interface Plan {
  id: string
  name: string
  durationDays: number
  price: number
  description?: string
  isActive: boolean
  _count?: {          // ← add this
    members: number
  }
}

export interface Payment {
  id: string
  memberId: string
  member: { name: string; phone: string }
  planId: string
  plan: { name: string }
  amount: number
  discount: number
  finalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
}

export interface Attendance {
  id: string
  memberId: string
  member: { name: string; phone: string }
  checkInAt: string
  markedBy: string
}

export interface DashboardMetrics {
  members: {
    total: number
    active: number
    expired: number
    newThisMonth: number
    expiringThisWeek: number
  }
  attendance: {
    today: number
  }
  revenue: {
    thisMonth: number
    pendingDues: number
  }
}

export interface Lead {
  id: string
  name: string
  phone: string
  status: string
  source?: string
  notes?: string
  createdAt: string

  contactedAt?: string

  contactedBy?: {
    name: string
    role: string
  }
}

export interface Staff {
  id: string
  name: string
  phone: string
  email?: string
  role: string

  mustChangePassword?: boolean

  createdAt?: string
}