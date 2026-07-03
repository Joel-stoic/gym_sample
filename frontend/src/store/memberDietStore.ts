// src/store/memberDietStore.ts

import { create } from 'zustand'

interface MemberDietStore {
  loaded: boolean

  diets: any[]

  ptEnrollments: any[]

  weightData: any

  setData: (data: {
    diets: any[]
    ptEnrollments: any[]
    weightData: any
  }) => void

  clearData: () => void
}

export const useMemberDietStore =
  create<MemberDietStore>((set) => ({
    loaded: false,

    diets: [],

    ptEnrollments: [],

    weightData: null,

    setData: (data) =>
      set({
        diets: data.diets,
        ptEnrollments: data.ptEnrollments,
        weightData: data.weightData,
        loaded: true
      }),

    clearData: () =>
      set({
        loaded: false,
        diets: [],
        ptEnrollments: [],
        weightData: null
      })
  }))