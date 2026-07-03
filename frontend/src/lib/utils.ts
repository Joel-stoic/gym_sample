import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// paise to rupees
export const toRupees = (paise: number) => {
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  })
}

// rupees to paise
export const toPaise = (rupees: number) => rupees * 100

// days until date
export const daysUntil = (date: string | Date) => {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// format date
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800'
    case 'EXPIRED': return 'bg-red-100 text-red-800'
    case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800'
    // case 'INACTIVE': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}