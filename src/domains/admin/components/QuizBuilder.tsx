'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, CheckCircle2, HelpCircle, Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { saveQuizQuestions, type QuizQuestion } from '../academy-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface QuizBuilderProps {
    lessonId: string
    initialQuestions?: QuizQuestion[]
}

type Option = { text: string; correct: boolean }

interface LocalQuestion {
    id?: string
    question: string
    options: Option[]
    explanation: string
    order_index: number
    expanded: boolean
}

const emptyQuestion = (index: number): LocalQuestion => ({
    question: '',
    options: [
        { text: '', correct: true },
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false },
    ],
    explanation: '',
    order_index: index,
    expanded: true,
})

export function QuizBuilder({ lessonId, initialQuestions = [] }: QuizBuilderProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<LocalQuestion[]>(
        initialQuestions.length > 0
            ? initialQuestions.map((q, i) => ({
                id: q.id,
                question: q.question,
                options: (q.options as Option[]).length >= 2 ? q.options as Option[] : [
                    { text: '', correct: true },
                    { text: '', correct: false },
                    { text: '', correct: false },
                    { text: '', correct: false },
                ],
                explanation: q.explanation || '',
                order_index: i,
                expanded: false,
            }))
            : []
    )

    function addQuestion() {
        setQuestions(prev => [...prev, emptyQuestion(prev.length)])
    }

    function removeQuestion(index: number) {
        setQuestions(prev => prev.filter((_, i) => i !== index))
    }

    function updateQuestion(index: number, field: string, value: string) {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
    }

    function updateOption(qIndex: number, oIndex: number, field: 'text' | 'correct', value: string | boolean): void {
        setQuestions(prev => prev.map((q, i): LocalQuestion => {
            if (i !== qIndex) return q
            const newOptions = q.options.map((o, j) => {
                if (field === 'correct') {
                    // Radio behavior: only one correct
                    return { ...o, correct: j === oIndex ? true : false }
                }
                return j === oIndex ? { ...o, text: String(value) } : o
            })
            return { ...q, options: newOptions }
        }))
    }

    function toggleExpand(index: number) {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, expanded: !q.expanded } : q))
    }

    async function handleSave() {
        setLoading(true)
        try {
            const toSave = questions.map((q, i) => ({
                lesson_id: lessonId,
                question: q.question,
                options: q.options,
                explanation: q.explanation,
                order_index: i
            }))
            await saveQuizQuestions(lessonId, toSave)
            toast.success(`${questions.length} question(s) enregistrée(s) ✓`)
            router.refresh()
        } catch (err: any) {
            toast.error(`Erreur: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-accent" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                        Quiz — {questions.length} question{questions.length !== 1 ? 's' : ''}
                    </h3>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQuestion}
                        className="rounded-xl text-[10px] font-bold uppercase tracking-widest border-accent/20 text-accent hover:bg-accent/5"
                    >
                        <Plus size={12} className="mr-1" /> Question
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                        className="rounded-xl text-[10px] font-bold uppercase tracking-widest bg-accent text-white hover:bg-accent/90"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : <Save size={12} className="mr-1" />}
                        Sauvegarder
                    </Button>
                </div>
            </div>

            {questions.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <HelpCircle size={32} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm text-muted-foreground font-light">Aucune question. Cliquez sur <strong>+ Question</strong> pour commencer.</p>
                </div>
            )}

            {/* Questions List */}
            <div className="space-y-3">
                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                        {/* Question header */}
                        <div
                            className="flex items-center justify-between px-5 py-4 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleExpand(qIndex)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-full bg-accent/10 text-accent text-[11px] font-bold flex items-center justify-center">
                                    {qIndex + 1}
                                </span>
                                <span className="text-sm font-medium text-primary line-clamp-1">
                                    {q.question || <span className="text-muted-foreground italic">Question sans titre</span>}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeQuestion(qIndex) }}
                                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                                {q.expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                            </div>
                        </div>

                        {/* Question body */}
                        {q.expanded && (
                            <div className="p-5 space-y-5">
                                {/* Question text */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Question</Label>
                                    <Input
                                        value={q.question}
                                        onChange={e => updateQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="ex: Quel pH est optimal pour les exfoliants chimiques ?"
                                        className="h-10 rounded-xl border-slate-200"
                                    />
                                </div>

                                {/* Options */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Réponses (sélectionner la correcte)</Label>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${opt.correct ? 'border-green-200 bg-green-50/50' : 'border-slate-100'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => updateOption(qIndex, oIndex, 'correct', true)}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${opt.correct ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-green-400'}`}
                                                >
                                                    {opt.correct && <CheckCircle2 size={12} className="text-white" />}
                                                </button>
                                                <span className="text-[10px] font-bold text-muted-foreground w-5 flex-shrink-0">
                                                    {String.fromCharCode(65 + oIndex)}.
                                                </span>
                                                <Input
                                                    value={opt.text}
                                                    onChange={e => updateOption(qIndex, oIndex, 'text', e.target.value)}
                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                    className={`h-8 rounded-lg border-0 bg-transparent focus:ring-0 text-sm ${opt.correct ? 'font-medium text-green-700' : ''}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Explication (optionnel)</Label>
                                    <textarea
                                        value={q.explanation}
                                        onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                                        placeholder="Pourquoi c'est la bonne réponse..."
                                        className="flex min-h-[70px] w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/30"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
