export const ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  TRAINER: 'TRAINER',
  FRONT_DESK: 'FRONT_DESK',
  MEMBER: 'MEMBER'
} as const

export const MEMBER_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE'
} as const

export const PAYMENT_METHODS = [
  { label: 'Cash', value: 'CASH' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Card', value: 'CARD' },
  { label: 'Online', value: 'ONLINE' }
]

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Members', href: '/members', icon: 'Users' },
  { label: 'Plans', href: '/plans', icon: 'CreditCard' },
  { label: 'Payments', href: '/payments', icon: 'IndianRupee' },
  { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck' },
  { label: 'Leads', href: '/leads', icon: 'UserPlus' },
  { label: 'Settings', href: '/settings', icon: 'Settings' }
]