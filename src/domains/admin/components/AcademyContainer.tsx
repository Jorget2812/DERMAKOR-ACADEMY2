'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, GraduationCap, Layers, Edit2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { CourseForm } from './CourseForm'

interface AcademyContainerProps {
    initialCourses: any[]
}

export function AcademyContainer({ initialCourses }: AcademyContainerProps) {
    const [courses, setCourses] = useState(initialCourses)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<any>(null)

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
                    <Plus className="w-4 h-4 mr-2" /> Nouveau Cours
                </Button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {courses.map((course) => (
                    <Card key={course.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-64 bg-slate-50/50 flex flex-col items-center justify-center p-8 border-r border-slate-100">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform duration-500">
                                    <GraduationCap size={32} />
                                </div>
                                <Badge variant="outline" className="bg-white border-accent/20 text-accent font-bold text-[9px] px-3">{course.modules?.length || 0} MODULES</Badge>
                            </div>

                            <div className="flex-grow p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">{course.title}</h3>
                                        <Badge variant="outline" className="mt-2 text-[9px] uppercase tracking-tighter opacity-60 font-light">{course.visibility}</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-slate-400 hover:text-accent hover:bg-accent/5 rounded-lg"
                                            onClick={() => { setEditingCourse(course); setIsFormOpen(true); }}
                                        >
                                            <Edit2 size={14} className="mr-2" /> Éditer
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 border-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest px-4 rounded-lg">Gérer Contenu</Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-8 max-w-2xl font-light leading-relaxed">{course.description}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {course.modules?.slice(0, 2).map((module: any) => (
                                        <div key={module.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 group/item hover:bg-white hover:border-accent/10 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/item:text-accent transition-colors">
                                                <Layers size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-primary/80 line-clamp-1">{module.title}</span>
                                                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{module.lessons?.length || 0} Leçons</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="p-4 rounded-xl border border-dashed border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent/5 hover:border-accent/20 hover:text-accent transition-all">
                                        <Plus size={14} /> Ajouter un module
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
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
