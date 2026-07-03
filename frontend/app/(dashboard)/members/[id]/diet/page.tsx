'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/src/lib/api'
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
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

// ─── Types ────────────────────────────────────────────────
interface Meal {
    id: string
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
        <div className={cn('rounded-2xl border border-border bg-white/[0.03] p-5', className)}>
            {children}
        </div>
    )
}

// ─── Section label ────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className=" uppercase text-md text-foreground font-extrabold mb-4">
            {children}
        </p>
    )
}

// ─── Meal time color ──────────────────────────────────────
const mealColors: Record<string, string> = {
    Breakfast: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Lunch: 'bg-green-500/10 text-green-400 border-green-500/20',
    Dinner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Pre-workout': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Post-workout': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Snacks: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}
const defaultMealColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'

// ─── Diet Plan Card ───────────────────────────────────────
function DietPlanCard({
    plan,
}: {
    plan: DietPlan
}) {

    const [expanded, setExpanded] =
        useState(true)

    const totalCalories =
        plan.meals.reduce(
            (sum, m) =>
                sum + (m.calories || 0),
            0
        )

    return (
        <div className="rounded-3xl border border-border bg-gradient-to-b from-white/[0.04] to-white/[0.02] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">

            {/* HEADER */}

            <button
                onClick={() =>
                    setExpanded(
                        !expanded
                    )
                }
                className="w-full px-6 py-5 flex items-start justify-between text-left hover:bg-white/[0.02] transition-all"
            >

                <div className="flex-1 min-w-0">

                    {/* TITLE */}

                    <div className="flex items-center gap-3 mb-3">

                        <div className="h-11 w-11 rounded-2xl /10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                            <Utensils className="h-5 w-5 text-violet-400" />
                        </div>

                        <div>

                            <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                                {plan.title}
                            </h3>

                            <p className="text-sm text-muted-foreground mt-1">
                                Created by{' '}
                                <span className="text-zinc-300 font-medium">
                                    {plan.createdBy.name}
                                </span>
                            </p>

                        </div>

                    </div>

                    {/* META */}

                    <div className="flex flex-wrap items-center gap-3">

                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-white/[0.05] border border-white/[0.05] rounded-xl px-3 py-1.5">

                            <Calendar className="h-4 w-4" />

                            {format(
                                parseISO(
                                    plan.validFrom
                                ),
                                'd MMM yyyy'
                            )}

                            {plan.validTo &&
                                ` → ${format(
                                    parseISO(
                                        plan.validTo
                                    ),
                                    'd MMM yyyy'
                                )}`}

                        </div>

                        {totalCalories > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5">

                                <Flame className="h-4 w-4" />

                                {totalCalories} kcal/day

                            </div>
                        )}

                        <div className="flex items-center gap-1.5 text-sm text-violet-300 /10 border border-violet-500/20 px-3 py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">

                            {plan.meals.length} meals

                        </div>

                    </div>

                </div>

                {/* DROPDOWN */}

                <div className="ml-4 flex-shrink-0">

                    <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">

                        {expanded ? (
                            <ChevronUp className="h-5 w-5 text-zinc-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-zinc-400" />
                        )}

                    </div>

                </div>

            </button>

            {/* CONTENT */}

            {expanded && (

                <div className="px-6 pb-6 border-t border-white/[0.05]">

                    {/* DESCRIPTION */}

                    {plan.description && (

                        <div className="mt-5 rounded-2xl border border-white/[0.05] bg-background/20 p-5">

                            <p className="text-[15px] leading-7 text-zinc-300">
                                {plan.description}
                            </p>

                        </div>

                    )}

                    {/* MEALS */}

                    <div className="space-y-4 mt-5">

                        {plan.meals.map(
                            (meal) => {

                                const color =
                                    mealColors[
                                        meal.time
                                    ] ||
                                    defaultMealColor

                                return (

                                    <div
                                        key={meal.id}
                                        className="rounded-2xl border border-border bg-background/20 p-5 hover:border-white/[0.1] transition-all"
                                    >

                                        {/* MEAL HEADER */}

                                        <div className="flex items-center justify-between mb-4">

                                            <span
                                                className={cn(
                                                    'text-sm font-semibold px-3 py-1.5 rounded-xl border',
                                                    color
                                                )}
                                            >
                                                {meal.time}
                                            </span>

                                            {meal.calories && (

                                                <div className="flex items-center gap-1.5 text-sm text-orange-400 font-medium">

                                                    <Flame className="h-4 w-4" />

                                                    {meal.calories} kcal

                                                </div>

                                            )}

                                        </div>

                                        {/* ITEMS */}

                                        <ul className="space-y-3">

                                            {meal.items.map(
                                                (
                                                    item,
                                                    i
                                                ) => (

                                                    <li
                                                        key={i}
                                                        className="flex items-start gap-3 text-[15px] leading-7 text-zinc-300"
                                                    >

                                                        <span className="h-2 w-2 rounded-full mt-2 flex-shrink-0 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground" />

                                                        {item}

                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>

                                )
                            }
                        )}

                    </div>

                    {/* NOTES */}

                    {plan.notes && (

                        <div className="mt-5 rounded-2xl border border-violet-500/10 /[0.03] p-5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">

                            <p className="text-sm font-semibold text-violet-300 mb-2">
                                Trainer Notes
                            </p>

                            <p className="text-[15px] leading-7 text-zinc-400">
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
    const [meals, setMeals] = useState([
        { time: 'Breakfast', items: [''], calories: '' },
        { time: 'Lunch', items: [''], calories: '' },
        { time: 'Dinner', items: [''], calories: '' },
    ])
    const [saving, setSaving] = useState(false)

    const mealTimes = ['Breakfast', 'Lunch', 'Dinner', 'Pre-workout', 'Post-workout', 'Snacks']

    const addMeal = () => setMeals([...meals, { time: 'Snacks', items: [''], calories: '' }])
    const removeMeal = (i: number) => setMeals(meals.filter((_, idx) => idx !== i))

    const updateMealItem = (mealIdx: number, itemIdx: number, val: string) => {
        const updated = [...meals]
        updated[mealIdx].items[itemIdx] = val
        setMeals(updated)
    }

    const addItem = (mealIdx: number) => {
        const updated = [...meals]
        updated[mealIdx].items.push('')
        setMeals(updated)
    }

    const removeItem = (mealIdx: number, itemIdx: number) => {
        const updated = [...meals]
        updated[mealIdx].items = updated[mealIdx].items.filter((_, i) => i !== itemIdx)
        setMeals(updated)
    }

    const handleSave = async () => {
        if (!title.trim()) { toast.error('Diet plan title is required'); return }

        const cleanMeals = meals
            .map(m => ({
                time: m.time,
                items: m.items.filter(i => i.trim()),
                calories: m.calories ? parseInt(m.calories) : undefined
            }))
            .filter(m => m.items.length > 0)

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

    const inputCls = 'w-full bg-background/30 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                <div className="sticky top-0 px-6 py-4 flex items-center justify-between" >
                    <h2 className="text-base font-semibold text-foreground">Create Diet Plan</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-sm">✕</button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Basic info */}
                    <div className="space-y-3">
                        <input className={inputCls} placeholder="Plan title (e.g. Weight Loss Plan)" value={title} onChange={e => setTitle(e.target.value)} />
                        <input className={inputCls} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Valid From</label>
                                <input
                                    type="date"
                                    className={`${inputCls} cursor-pointer`}
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Valid To (optional)</label>
                                <input type="date" className={`${inputCls} cursor-pointer`} value={validTo} onChange={e => setValidTo(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Meals */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Meals</p>
                            <button onClick={addMeal} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                                <Plus className="h-3 w-3" /> Add meal
                            </button>
                        </div>

                        <div className="space-y-4">
                            {meals.map((meal, mealIdx) => (
                                <div key={mealIdx} className="rounded-xl border border-border bg-background/20 p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <select
                                            value={meal.time}
                                            onChange={e => { const u = [...meals]; u[mealIdx].time = e.target.value; setMeals(u) }}
                                            className="bg-background/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none flex-1"
                                        >
                                            {mealTimes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="kcal"
                                            value={meal.calories}
                                            onChange={e => { const u = [...meals]; u[mealIdx].calories = e.target.value; setMeals(u) }}
                                            className="bg-background/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground outline-none w-20 placeholder:text-zinc-600"
                                        />
                                        {meals.length > 1 && (
                                            <button onClick={() => removeMeal(mealIdx)} className="text-red-400/60 hover:text-red-400 transition-colors">
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {meal.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex items-center gap-2">
                                                <span className="h-1 w-1 rounded-full bg-zinc-600 flex-shrink-0" />
                                                <input
                                                    className="flex-1 bg-transparent border-b border-border pb-1 text-xs text-foreground placeholder:text-zinc-600 outline-none focus:border-violet-500/40 transition-colors"
                                                    placeholder={`Food item ${itemIdx + 1} (e.g. 2 eggs)`}
                                                    value={item}
                                                    onChange={e => updateMealItem(mealIdx, itemIdx, e.target.value)}
                                                />
                                                {meal.items.length > 1 && (
                                                    <button onClick={() => removeItem(mealIdx, itemIdx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={() => addItem(mealIdx)} className="text-xs text-muted-foreground hover:text-violet-400 flex items-center gap-1 mt-2 transition-colors">
                                            <Plus className="h-3 w-3" /> Add item
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <textarea
                        className={cn(inputCls, 'resize-none h-20')}
                        placeholder="Additional notes (optional)"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-11 rounded-xl text-sm font-medium text-foreground flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 20px #7c3aed35' }}
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
            : change < 0 ? 'text-green-400'
                : change > 0 ? 'text-red-400'
                    : 'text-zinc-400'

    const ChangeIcon =
        change === null ? Minus
            : change < 0 ? TrendingDown
                : change > 0 ? TrendingUp
                    : Minus

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            </div>
        )
    }

    return (
        <div className="space-y-5 pb-10">
            {showDietModal && (
                <AddDietModal
                    memberId={memberId}
                    onClose={() => setShowDietModal(false)}
                    onSuccess={fetchAll}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="h-9 w-9 rounded-xl border border-border bg-white/[0.03] flex items-center justify-center text-zinc-400 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-tight">{memberName}</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Diet & Weight tracking</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowDietModal(true)}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium text-foreground transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 16px #7c3aed30' }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Diet Plan
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* ── LEFT — Weight ── */}
                <div className="space-y-4">

                    {/* Weight summary */}
                    <Panel>
                        <SectionLabel>Weight summary</SectionLabel>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="rounded-xl bg-background/20 border border-border p-3 text-center">
                                <p className="text-lg font-bold text-foreground">{summary?.latest ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Current (kg)</p>
                            </div>
                            <div className="rounded-xl bg-background/20 border border-border p-3 text-center">
                                <p className="text-lg font-bold text-foreground">{summary?.oldest ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Starting (kg)</p>
                            </div>
                            <div className="rounded-xl bg-background/20 border border-border p-3 text-center">
                                <p className={cn('text-lg font-bold flex items-center justify-center gap-1', changeColor)}>
                                    <ChangeIcon className="h-4 w-4" />
                                    {change !== null ? Math.abs(change) : '—'}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {change === null ? 'Change' : change < 0 ? 'Lost (kg)' : change > 0 ? 'Gained (kg)' : 'No change'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Scale className="h-3.5 w-3.5" />
                                {summary?.totalEntries || 0} entries logged
                            </span>
                        </div>
                    </Panel>

                    {/* Weight history */}
                    <Panel>
                        <SectionLabel>Weight history</SectionLabel>
                        {entries.length === 0 ? (
                            <div className="py-8 flex flex-col items-center gap-2 text-zinc-600">
                                <Scale className="h-7 w-7" />
                                <p className="text-sm">No weight logs yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                                {entries.map((entry, idx) => {
                                    const prev = entries[idx + 1]?.weight
                                    const diff = prev !== undefined ? +(entry.weight - prev).toFixed(1) : null
                                    return (
                                        <div key={entry.id} className="rounded-xl border border-border bg-background/20 px-3 py-2.5 flex items-center gap-3">
                                            <div className="h-8 w-8 /10 flex items-center justify-center flex-shrink-0 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-full text-foreground">
                                                <Scale className="h-3.5 w-3.5 text-violet-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{entry.weight} kg</p>
                                                <p className="text-xs text-orange-400">{format(parseISO(entry.loggedAt), 'd MMM yyyy')}</p>
                                            </div>
                                            {diff !== null && (
                                                <span className={cn('text-xl font-extrabold', diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-muted-foreground')}>
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
                    <Panel className="h-full ">
                        <div className="flex items-center justify-between mb-4 ">
                            <SectionLabel>Diet plans</SectionLabel>
                            <span className="text-xs text-zinc-600">{diets.length} plan{diets.length !== 1 ? 's' : ''}</span>
                        </div>

                        {diets.length === 0 ? (
                            <div className="py-16 flex flex-col items-center gap-3 text-zinc-600">
                                <Utensils className="h-8 w-8" />
                                <p className="text-sm">No diet plans yet</p>
                                <button
                                    onClick={() => setShowDietModal(true)}
                                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                                >
                                    <Plus className="h-3 w-3" /> Create first plan
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {diets.map(plan => <DietPlanCard key={plan.id} plan={plan} />)}
                               
                            </div>
                        )}
                    </Panel>
                </div>
            </div>
        </div>
    )
}