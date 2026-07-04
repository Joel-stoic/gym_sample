'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/src/lib/api'
import axios from 'axios'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    ArrowLeft,
    Plus,
    Utensils,
    Weight,
    TrendingDown,
    TrendingUp,
    Minus,
    ChevronDown,
    ChevronUp,
    Flame,
    Calendar,
    User,
    Loader2,
    Scale,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ─── Types ────────────────────────────────────────────────
interface Meal {
    id?: string
    time: string
    items: string[]
    calories: number | null
}

interface DietPlan {
    id: string
    title: string
    description: string | null
    notes: string | null
    validFrom: string
    validTo: string | null
    createdAt: string
    meals: Meal[]
    createdBy: { name: string; role: string }
}

interface WeightEntry {
    id: string
    weight: number
    notes: string | null
    loggedAt: string
}

interface WeightSummary {
    latest: number | null
    oldest: number | null
    change: number | null
    totalEntries: number
}

// ─── Panel wrapper ────────────────────────────────────────
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('rounded-xl border border-border bg-card p-5 shadow-sm', className)}>
            {children}
        </div>
    )
}

// ─── Section label ────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[13px] uppercase tracking-[0.1em] text-muted-foreground font-semibold mb-4">
            {children}
        </p>
    )
}

// ─── Meal time color ──────────────────────────────────────
const mealColors: Record<string, string> = {
    Breakfast: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Lunch: 'bg-green-500/10 text-green-500 border-green-500/20',
    Dinner: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Pre-workout': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
    'Post-workout': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    Snacks: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
}
const defaultMealColor = 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'

// ─── Diet Plan Card ───────────────────────────────────────
function DietPlanCard({ plan }: { plan: DietPlan }) {
    const [expanded, setExpanded] = useState(false)

    const totalCalories = plan.meals.reduce((sum, m) => sum + (m.calories || 0), 0)

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
            {/* HEADER */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-5 py-4 flex items-start justify-between text-left hover:bg-muted/50 transition-all"
            >
                <div className="flex-1 min-w-0">
                    {/* TITLE */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <Utensils className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground leading-tight">
                                {plan.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Created by <span className="text-foreground font-medium">{plan.createdBy.name}</span>
                            </p>
                        </div>
                    </div>

                    {/* META */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted border border-border rounded-lg px-2.5 py-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(parseISO(plan.validFrom), 'd MMM yyyy')}
                            {plan.validTo && ` → ${format(parseISO(plan.validTo), 'd MMM yyyy')}`}
                        </div>
                        {totalCalories > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1 font-medium">
                                <Flame className="h-3.5 w-3.5" />
                                {totalCalories} kcal/day
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg font-medium">
                            {plan.meals.length} meals
                        </div>
                    </div>
                </div>

                {/* DROPDOWN */}
                <div className="ml-4 flex-shrink-0">
                    <div className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-muted">
                        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                </div>
            </button>

            {/* CONTENT */}
            {expanded && (
                <div className="px-5 pb-5 border-t border-border mt-1">
                    {/* DESCRIPTION */}
                    {plan.description && (
                        <div className="mt-4 rounded-xl border border-border bg-muted/50 p-4">
                            <p className="text-sm text-foreground">
                                {plan.description}
                            </p>
                        </div>
                    )}

                    {/* MEALS */}
                    <div className="space-y-3 mt-4">
                        {plan.meals.map((meal, idx) => {
                            const color = mealColors[meal.time] || defaultMealColor
                            return (
                                <div key={idx} className="rounded-xl border border-border bg-background p-4 shadow-sm hover:border-border transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={cn('text-xs font-bold px-2.5 py-1 rounded-md border', color)}>
                                            {meal.time}
                                        </span>
                                        {meal.calories && (
                                            <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold">
                                                <Flame className="h-3.5 w-3.5" />
                                                {meal.calories} kcal
                                            </div>
                                        )}
                                    </div>
                                    <ul className="space-y-2">
                                        {meal.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                                                <span className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 bg-primary/60" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>

                    {/* NOTES */}
                    {plan.notes && (
                        <div className="mt-4 rounded-xl border border-primary/20 p-4 bg-primary/5">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
                                Trainer Notes
                            </p>
                            <p className="text-sm text-foreground">
                                {plan.notes}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Add Diet Modal ───────────────────────────────────────
function AddDietModal({
    memberId,
    onClose,
    onSuccess,
}: {
    memberId: string
    onClose: () => void
    onSuccess: () => void
}) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [notes, setNotes] = useState('')
    const [validFrom, setValidFrom] = useState('')
    const [validTo, setValidTo] = useState('')
    
    const mealTimes = ['Breakfast', 'Lunch', 'Dinner', 'Pre-workout', 'Post-workout', 'Snacks']
    
    // Store simple raw text and calories for each possible meal time
    const [mealsData, setMealsData] = useState<Record<string, { rawText: string, calories: string }>>({
        Breakfast: { rawText: '', calories: '' },
        Lunch: { rawText: '', calories: '' },
        Dinner: { rawText: '', calories: '' },
        'Pre-workout': { rawText: '', calories: '' },
        'Post-workout': { rawText: '', calories: '' },
        Snacks: { rawText: '', calories: '' }
    })
    
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!title.trim()) { toast.error('Diet plan title is required'); return }

        // Parse textareas into structured Meal arrays
        const cleanMeals = mealTimes.map(time => {
            const m = mealsData[time]
            const items = m.rawText.split('\n').map(i => i.trim()).filter(Boolean)
            if (items.length === 0) return null
            return {
                time,
                items,
                calories: m.calories ? Number(m.calories) : undefined
            }
        }).filter(Boolean)

        if (cleanMeals.length === 0) { toast.error('Add at least one meal with food items'); return }

        setSaving(true)
        try {
            await api.post(`/api/members/${memberId}/diet`, {
                title,
                description: description || undefined,
                notes: notes || undefined,
                validFrom: validFrom || undefined,
                validTo: validTo || undefined,
                meals: cleanMeals
            })
            toast.success('Diet plan created!')
            onSuccess()
            onClose()
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create diet plan')
        } finally {
            setSaving(false)
        }
    }

    const inputCls = 'w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
                <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Create Diet Plan</h2>
                    <button onClick={onClose} className="h-8 w-8 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* ── LEFT: DETAILS ── */}
                        <div className="lg:w-[35%] space-y-6">
                            <div>
                                <SectionLabel>Plan Details</SectionLabel>
                                <div className="space-y-4">
                                    <input className={inputCls} placeholder="Plan Title * (e.g. 4-Week Fat Loss)" value={title} onChange={e => setTitle(e.target.value)} />
                                    <input className={inputCls} placeholder="Short Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valid From</label>
                                            <input type="date" className={inputCls} value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valid To (optional)</label>
                                            <input type="date" className={inputCls} value={validTo} onChange={e => setValidTo(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <SectionLabel>Trainer Notes</SectionLabel>
                                <textarea
                                    className={cn(inputCls, 'resize-none h-24')}
                                    placeholder="Additional instructions or notes for the member (optional)"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ── RIGHT: MEALS ── */}
                        <div className="lg:w-[65%]">
                            <div className="flex items-center justify-between mb-4">
                                <SectionLabel>Meals</SectionLabel>
                                <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">Leave empty to skip</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mealTimes.map((time) => {
                                    const color = mealColors[time] || defaultMealColor
                                    return (
                                        <div key={time} className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-border/80">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={cn('text-xs font-bold px-2 py-1 rounded-md border', color)}>
                                                    {time}
                                                </span>
                                                <div className="relative w-[85px]">
                                                    <input
                                                        type="number"
                                                        placeholder="kcal"
                                                        value={mealsData[time].calories}
                                                        onChange={e => setMealsData(p => ({ ...p, [time]: { ...p[time], calories: e.target.value } }))}
                                                        className="w-full bg-background border border-border rounded-lg pl-3 pr-8 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                                                    />
                                                    <span className="absolute right-2 top-1.5 text-[10px] text-muted-foreground font-medium">kcal</span>
                                                </div>
                                            </div>

                                            <textarea
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors resize-none h-24 placeholder:text-muted-foreground/40 leading-relaxed"
                                                placeholder={`e.g. 2 whole eggs\n1 cup oats\n1 apple`}
                                                value={mealsData[time].rawText}
                                                onChange={e => setMealsData(p => ({ ...p, [time]: { ...p[time], rawText: e.target.value } }))}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ── FOOTER ── */}
                <div className="flex-shrink-0 bg-card border-t border-border p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? 'Saving...' : 'Save Diet Plan'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────
export default function MemberDietWeightPage() {
    const { id } = useParams()
    const router = useRouter()
    const memberId = String(id)

    const [memberName, setMemberName] = useState('')
    const [diets, setDiets] = useState<DietPlan[]>([])
    const [weightData, setWeightData] = useState<{ entries: WeightEntry[]; summary: WeightSummary } | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDietModal, setShowDietModal] = useState(false)

    const fetchAll = async () => {
        try {
            const [memberRes, dietRes, weightRes] = await Promise.all([
                api.get(`/api/members/${memberId}`),
                api.get(`/api/members/${memberId}/diet`),
                api.get(`/api/members/${memberId}/weights`),
            ])
            setMemberName(memberRes.data.data.name)
            setDiets(dietRes.data.data)
            setWeightData(weightRes.data.data)
        } catch {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [memberId])

    const summary = weightData?.summary ?? null
    const entries = weightData?.entries || []

    const change = summary?.change ?? null

    const changeColor =
        change === null ? 'text-muted-foreground'
            : change < 0 ? 'text-green-500'
                : change > 0 ? 'text-red-500'
                    : 'text-zinc-500'

    const ChangeIcon =
        change === null ? Minus
            : change < 0 ? TrendingDown
                : change > 0 ? TrendingUp
                    : Minus

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-10">
            {showDietModal && (
                <AddDietModal
                    memberId={memberId}
                    onClose={() => setShowDietModal(false)}
                    onSuccess={fetchAll}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">{memberName}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Diet & Weight tracking</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowDietModal(true)}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                    Add Diet Plan
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* ── LEFT — Weight ── */}
                <div className="space-y-5">
                    {/* Weight summary */}
                    <Panel>
                        <SectionLabel>Weight summary</SectionLabel>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="rounded-xl bg-background border border-border p-4 text-center shadow-sm">
                                <p className="text-xl font-bold text-foreground">{summary?.latest ?? '—'}</p>
                                <p className="text-xs font-medium text-muted-foreground mt-1">Current (kg)</p>
                            </div>
                            <div className="rounded-xl bg-background border border-border p-4 text-center shadow-sm">
                                <p className="text-xl font-bold text-foreground">{summary?.oldest ?? '—'}</p>
                                <p className="text-xs font-medium text-muted-foreground mt-1">Starting (kg)</p>
                            </div>
                            <div className="rounded-xl bg-background border border-border p-4 text-center shadow-sm">
                                <p className={cn('text-xl font-bold flex items-center justify-center gap-1', changeColor)}>
                                    <ChangeIcon className="h-4 w-4" />
                                    {change !== null ? Math.abs(change) : '—'}
                                </p>
                                <p className="text-xs font-medium text-muted-foreground mt-1">
                                    {change === null ? 'Change' : change < 0 ? 'Lost' : change > 0 ? 'Gained' : 'No change'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Scale className="h-4 w-4" />
                                {summary?.totalEntries || 0} entries logged
                            </span>
                        </div>
                    </Panel>

                    {/* Weight history */}
                    <Panel>
                        <SectionLabel>Weight history</SectionLabel>
                        {entries.length === 0 ? (
                            <div className="py-10 flex flex-col items-center gap-3 text-muted-foreground">
                                <Scale className="h-8 w-8 opacity-50" />
                                <p className="text-sm font-medium">No weight logs yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                                {entries.map((entry, idx) => {
                                    const prev = entries[idx + 1]?.weight
                                    const diff = prev !== undefined ? +(entry.weight - prev).toFixed(1) : null
                                    return (
                                        <div key={entry.id} className="rounded-xl border border-border bg-background p-4 flex items-center gap-4 shadow-sm hover:border-primary/20 transition-colors">
                                            <div className="h-10 w-10 flex items-center justify-center flex-shrink-0 bg-primary/10 rounded-lg border border-primary/20">
                                                <Scale className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-foreground">{entry.weight} kg</p>
                                                <p className="text-xs font-medium text-muted-foreground mt-0.5">{format(parseISO(entry.loggedAt), 'd MMM yyyy')}</p>
                                            </div>
                                            {diff !== null && (
                                                <span className={cn('text-lg font-bold', diff < 0 ? 'text-green-500' : diff > 0 ? 'text-red-500' : 'text-muted-foreground')}>
                                                    {diff > 0 ? '+' : ''}{diff} kg
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </Panel>
                </div>

                {/* ── RIGHT — Diet Plans ── */}
                <div className="xl:col-span-2">
                    <Panel className="h-full">
                        <div className="flex items-center justify-between mb-5">
                            <SectionLabel>Diet plans</SectionLabel>
                            <span className="text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-md">{diets.length} plan{diets.length !== 1 ? 's' : ''}</span>
                        </div>

                        {diets.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <Utensils className="h-6 w-6 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">No diet plans yet</p>
                                <button
                                    onClick={() => setShowDietModal(true)}
                                    className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Create first plan
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {diets.map(plan => <DietPlanCard key={plan.id} plan={plan} />)}
                            </div>
                        )}
                    </Panel>
                </div>
            </div>
        </div>
    )
}
