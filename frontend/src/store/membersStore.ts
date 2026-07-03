// src/store/membersStore.ts

import { create } from 'zustand'
import { Member } from '@/src/types'

interface MembersStore {
  loaded: boolean

  members: Member[]
  total: number

  page: number
  search: string
  status: string
  plan: string

  setMembersData: (
    members: Member[],
    total: number
  ) => void

  setPage: (page: number) => void
  setSearch: (search: string) => void
  setStatus: (status: string) => void
  setPlan: (plan: string) => void
}

export const useMembersStore =
  create<MembersStore>((set) => ({
    loaded: false,

    members: [],
    total: 0,

    page: 1,
    search: '',
    status: '',
    plan: '',

    setMembersData: (members, total) =>
      set({
        members,
        total,
        loaded: true
      }),

    setPage: (page) => set({ page }),
    setSearch: (search) => set({ search }),
    setStatus: (status) => set({ status }),
    setPlan: (plan) => set({ plan })
  }))