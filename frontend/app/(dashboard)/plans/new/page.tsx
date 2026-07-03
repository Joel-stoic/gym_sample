'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/src/lib/api'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { ArrowLeft, Loader2, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'


const planSchema = z.object({
  name: z.string().min(2, 'Plan name required'),
  durationDays: z.string().min(1, 'Duration required'),
  price: z.string().min(1, 'Price required'),
  description: z.string().optional()
})

type PlanForm = z.infer<typeof planSchema>

const PRESETS = [
  { label: '1 Month', days: '30' },
  { label: '3 Months', days: '90' },
  { label: '6 Months', days: '180' },
  { label: '1 Year', days: '365' }
]

export default function NewPlanPage() {
  const queryClient = useQueryClient() 
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<PlanForm>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      durationDays: '',
      price: '',
      description: ''
    }
  })

  const onSubmit = async (data: PlanForm) => {
    setLoading(true)

    try {
      await api.post('/api/plans', {
        name: data.name,
        durationDays: parseInt(data.durationDays),
        price: parseInt(data.price) * 100,
        description: data.description
      })

      toast.success('Plan created successfully')
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      router.push('/plans')
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to create plan'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="mx-auto max-w-2xl space-y-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[20px] font-bold tracking-tight text-white"
            style={{
              fontFamily: "'Syne', sans-serif",
              letterSpacing: '-0.02em'
            }}
          >
            Create Plan
          </h1>

          <p className="mt-1 text-[13px] text-[#6b6b80]">
            Add a new membership plan
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-150"
          style={{
            background: '#111118',
            border: '1px solid #ffffff0f'
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#111118',
          border: '1px solid #ffffff0a'
        }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: '#7c3aed20',
              color: '#a855f7'
            }}
          >
            <CreditCard className="h-4 w-4" />
          </div>

          <div>
            <h2
              className="text-[15px] font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Membership Details
            </h2>

            <p className="text-[12px] text-[#6b6b80]">
              Configure your gym membership plan
            </p>
          </div>
        </div>

        <div
          className="mb-6"
          style={{ borderTop: '1px solid #ffffff06' }}
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Plan Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-[#9898b0]">
                    Plan Name *
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Monthly / Quarterly / Annual"
                      className="h-11 rounded-xl border-white/10 bg-[#0e0e16] text-white placeholder:text-[#5c5c72] focus-visible:ring-violet-500"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-[#9898b0]">
                    Duration (days) *
                  </FormLabel>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() =>
                          form.setValue(
                            'durationDays',
                            preset.days
                          )
                        }
                        className="rounded-xl px-3 py-2 text-[12px] font-medium transition-all"
                        style={{
                          background:
                            field.value === preset.days
                              ? '#7c3aed20'
                              : '#ffffff05',
                          border:
                            field.value === preset.days
                              ? '1px solid #7c3aed40'
                              : '1px solid #ffffff0a',
                          color:
                            field.value === preset.days
                              ? '#a855f7'
                              : '#9898b0'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <FormControl>
                    <Input
                      placeholder="30"
                      type="number"
                      className="h-11 rounded-xl border-white/10 bg-[#0e0e16] text-white placeholder:text-[#5c5c72]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-[#9898b0]">
                    Price (₹) *
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="1000"
                      type="number"
                      className="h-11 rounded-xl border-white/10 bg-[#0e0e16] text-white placeholder:text-[#5c5c72]"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription className="text-[#6b6b80]">
                    Enter in rupees 
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-[#9898b0]">
                    Description
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Includes all gym equipment access..."
                      className="h-11 rounded-xl border-white/10 bg-[#0e0e16] text-white placeholder:text-[#5c5c72]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-medium text-white transition-all duration-150"
              style={{
                background:
                  'linear-gradient(135deg,#7c3aed,#a855f7)',
                boxShadow: '0 4px 20px #7c3aed30'
              }}
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </form>
        </Form>
      </div>
    </div>
  )
}