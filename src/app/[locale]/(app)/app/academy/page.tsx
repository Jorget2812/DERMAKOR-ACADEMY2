import { getStudentCourses } from '@/domains/admin/academy-actions'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/navigation'
import { GraduationCap } from 'lucide-react'
import { CourseCard } from './CourseCard'

async function getUserLevel() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'NONE' as const
    const { data } = await supabase.from('profiles').select('level').eq('id', user.id).single()
    return (data?.level || 'NONE') as 'NONE' | 'STANDARD' | 'PREMIUM'
}

export default async function AcademyPage() {
    const userLevel = await getUserLevel()
    const courses = await getStudentCourses(userLevel)

    const accessible = courses.filter((c: any) => !c.is_locked)
    const locked = courses.filter((c: any) => c.is_locked)
    const premiumLocked = locked.filter((c: any) => c.access_level === 'PREMIUM')

    return (
        <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }} className="space-y-14 pb-12">

            {/* Header */}
            <header>
                <div className="flex items-end justify-between flex-wrap gap-4">
                    <div>
                        <p style={{ color: '#C0A76A', letterSpacing: '0.35em', fontSize: '10px' }} className="font-black uppercase mb-2">
                            Dermakor Academy
                        </p>
                        <h1 className="font-serif text-4xl" style={{ color: '#1C1C1C', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            Votre Académie
                        </h1>
                    </div>
                    {premiumLocked.length > 0 && userLevel === 'STANDARD' && (
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border"
                            style={{ borderColor: 'rgba(139,92,246,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <span style={{ color: '#8b5cf6', fontSize: '1rem' }}>♛</span>
                            <div>
                                <p className="text-[11px] font-bold" style={{ color: '#1C1C1C' }}>
                                    {premiumLocked.length} formation{premiumLocked.length > 1 ? 's' : ''} Premium
                                </p>
                                <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.4)' }}>
                                    Passez Premium pour tout débloquer
                                </p>
                            </div>
                            <Link href="/app/profile">
                                <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-white"
                                    style={{ background: '#7c3aed', letterSpacing: '0.1em' }}>
                                    Upgrade
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
                <div className="mt-5 h-px" style={{ background: 'linear-gradient(90deg, rgba(192,167,106,0.4), transparent)' }} />
            </header>

            {/* Accessible */}
            {accessible.length > 0 && (
                <section className="space-y-6">
                    <p className="text-[10px] font-black uppercase" style={{ letterSpacing: '0.3em', color: 'rgba(0,0,0,0.3)' }}>
                        Vos Formations ({accessible.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {accessible.map((course: any) => (
                            <Link key={course.id} href={`/app/academy/${course.slug}`}>
                                <CourseCard course={course} userLevel={userLevel} />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Locked */}
            {locked.length > 0 && (
                <section className="space-y-6">
                    <p className="text-[10px] font-black uppercase flex items-center gap-2" style={{ letterSpacing: '0.3em', color: 'rgba(0,0,0,0.3)' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Formations Verrouillées ({locked.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {locked.map((course: any) => (
                            <CourseCard key={course.id} course={course} userLevel={userLevel} />
                        ))}
                    </div>
                </section>
            )}

            {courses.length === 0 && (
                <div className="py-32 text-center">
                    <GraduationCap size={48} className="mx-auto mb-4" style={{ color: 'rgba(0,0,0,0.1)' }} strokeWidth={1} />
                    <p style={{ color: 'rgba(0,0,0,0.35)' }}>Aucune formation disponible pour le moment.</p>
                </div>
            )}
        </div>
    )
}