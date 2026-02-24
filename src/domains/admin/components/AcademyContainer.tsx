'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GraduationCap, Layers, Edit2, ExternalLink, Lock, Trash2, Video, FileText, HelpCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { CourseForm } from './CourseForm'
import { deleteCourse } from '../academy-actions'
import { Link } from '@/navigation'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AcademyContainerProps {
    initialCourses: any[]
}

const ACCESS_CONFIG: Record<string, { label: string; cls: string }> = {
    PUBLIC: { label: 'Public', cls: 'bg-green-100 text-green-700 border-green-200' },
    STANDARD: { label: 'Standard', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    PREMIUM: { label: 'Premium', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    PAID: { label: 'Payant', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    // Legacy visibility values
    ALL: { label: 'Public', cls: 'bg-green-100 text-green-700 border-green-200' },
    STANDARD_ONLY: { label: 'Standard', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    PREMIUM_ONLY: { label: 'Premium', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
}

export function AcademyContainer({ initialCourses }: AcademyContainerProps) {
    const router = useRouter()
    const [courses] = useState(initialCourses)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<any>(null)

    async function handleDelete(courseId: string) {
        if (!confirm('Supprimer cette formation et tout son contenu ?')) return
        await deleteCourse(courseId)
        toast.success('Formation supprimée')
        router.refresh()
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-primary">Gestion de l'Académie</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-light uppercase tracking-widest">Créez et gérez vos formations professionnelles.</p>
                </div>
                <Button
                    onClick={() => { setEditingCourse(null); setIsFormOpen(true); }}
                    className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20 px-8 font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl"
                >
                    <Plus className="w-4 h-4 mr-2" /> Nouvelle Formation
                </Button>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Formations', value: courses.length, color: 'text-primary' },
                    { label: 'Modules', value: courses.reduce((a: number, c: any) => a + (c.modules?.length || 0), 0), color: 'text-blue-600' },
                    { label: 'Leçons', value: courses.reduce((a: number, c: any) => a + (c.modules || []).reduce((b: number, m: any) => b + (m.lessons?.length || 0), 0), 0), color: 'text-purple-600' },
                    { label: 'Premium/Payantes', value: courses.filter((c: any) => ['PREMIUM', 'PAID', 'PREMIUM_ONLY'].includes(c.visibility || c.access_level)).length, color: 'text-accent' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-50">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5">
                {courses.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <GraduationCap size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
                        <p className="text-muted-foreground font-light">Aucune formation. Cliquez sur <strong>+ Nouvelle Formation</strong> pour commencer.</p>
                    </div>
                )}
                {courses.map((course: any) => {
                    const access = ACCESS_CONFIG[course.access_level || course.visibility] || ACCESS_CONFIG.STANDARD
                    const totalLessons = (course.modules || []).reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0)
                    const videoCount = (course.modules || []).reduce((a: number, m: any) => a + (m.lessons || []).filter((l: any) => l.video_url).length, 0)
                    const pdfCount = (course.modules || []).reduce((a: number, m: any) => a + (m.lessons || []).filter((l: any) => l.pdf_url).length, 0)

                    return (
                        <Card key={course.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col md:flex-row">
                                {/* Left panel */}
                                <div className="md:w-56 bg-slate-50/50 flex flex-col items-center justify-center p-6 border-r border-slate-100 gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent mb-1 group-hover:scale-110 transition-transform duration-500">
                                        <GraduationCap size={28} />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${access.cls}`}>
                                        <Lock size={8} className="inline mr-1" />{access.label}
                                        {course.access_level === 'PAID' && course.price ? ` — ${course.price} CHF` : ''}
                                    </span>
                                    <div className="flex gap-3 text-muted-foreground">
                                        {videoCount > 0 && <span className="flex items-center gap-1 text-[10px] text-blue-400 font-bold"><Video size={10} /> {videoCount}</span>}
                                        {pdfCount > 0 && <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold"><FileText size={10} /> {pdfCount}</span>}
                                    </div>
                                </div>

                                <div className="flex-grow p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary">{course.title}</h3>
                                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">/{course.slug}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-slate-400 hover:text-accent hover:bg-accent/5 rounded-lg"
                                                onClick={() => { setEditingCourse(course); setIsFormOpen(true); }}
                                            >
                                                <Edit2 size={13} className="mr-1" /> Éditer
                                            </Button>
                                            <Link href={`/admin/academy/${course.id}`}>
                                                <Button size="sm" className="h-8 bg-accent text-white hover:bg-accent/90 text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">
                                                    Gérer Contenu <ExternalLink size={10} className="ml-1" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                onClick={() => handleDelete(course.id)}
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-2xl font-light leading-relaxed">{course.description}</p>

                                    <div className="flex flex-wrap gap-3">
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{course.modules?.length || 0} Modules</Badge>
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{totalLessons} Leçons</Badge>
                                        {course.active ? (
                                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] font-bold uppercase tracking-widest border hover:bg-green-100">Actif</Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-100">Inactif</Badge>
                                        )}
                                    </div>

                                    {/* Module preview */}
                                    {course.modules && course.modules.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {course.modules.slice(0, 3).map((mod: any) => (
                                                <div key={mod.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px]">
                                                    <Layers size={10} className="text-accent" />
                                                    <span className="font-medium text-primary/70">{mod.title}</span>
                                                    <span className="text-muted-foreground/50">{mod.lessons?.length || 0} leçons</span>
                                                </div>
                                            ))}
                                            {course.modules.length > 3 && (
                                                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-muted-foreground">
                                                    +{course.modules.length - 3} modules
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {isFormOpen && (
                <CourseForm
                    course={editingCourse}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}
