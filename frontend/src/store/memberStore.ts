import { create } from 'zustand'

interface MemberStore {
  profile: any | null
  setProfile: (profile: any) => void
}

export const useMemberStore =
  create<MemberStore>((set) => ({
    profile: null,

    setProfile: (profile) =>
      set({ profile })
  }))