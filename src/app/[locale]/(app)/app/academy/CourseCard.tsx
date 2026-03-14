'use client'

import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { Link } from '@/navigation'

const LEVEL_STYLES: Record<string, { label: string; bg: string; color: string; border: string }> = {
    STANDARD: { label: 'Standard',          bg: 'rgba(2,132,199,0.1)',   color: '#0284c7', border: 'rgba(2,132,199,0.2)' },
    PREMIUM:  { label: 'Premium',           bg: 'rgba(124,58,237,0.1)',  color: '#7c3aed', border: 'rgba(124,58,237,0.2)' },
    PAID:     { label: 'Payante',           bg: 'rgba(180,83,9,0.1)',    color: '#b45309', border: 'rgba(180,83,9,0.2)'  },
    PUBLIC:   { label: 'Gratuit',           bg: 'rgba(5,150,105,0.1)',   color: '#059669', border: 'rgba(5,150,105,0.2)' },
}

export function CourseCard({ course, userLevel }: { course: any; userLevel: string }) {
    const [hovered, setHovered] = useState(false)
    const level = LEVEL_STYLES[course.access_level] || LEVEL_STYLES.STANDARD
    const totalLessons = (course.modules || []).reduce((a: number, m: any) => a + (m.lessons?.length || 0), 0)
    const isLocked = course.is_locked

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: isLocked ? 'default' : 'pointer',
                border: hovered && !isLocked
                    ? '1px solid rgba(192,167,106,0.3)'
                    : '1px solid rgba(0,0,0,0.06)',
                boxShadow: hovered && !isLocked
                    ? '0 28px 70px rgba(192,167,106,0.15), 0 8px 20px rgba(0,0,0,0.07)'
                    : '0 2px 16px rgba(0,0,0,0.05)',
                transform: hovered && !isLocked ? 'translateY(-10px)' : 'translateY(0)',
                transition: 'all 0.45s cubic-bezier(0.23,1,0.32,1)',
            }}
        >
            {/* Thumbnail */}
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#f0ede8' }}>
                {course.thumbnail_url ? (
                    <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: hovered && !isLocked ? 'scale(1.06)' : 'scale(1)',
                            filter: isLocked ? 'brightness(0.55) saturate(0.5)' : 'brightness(0.92)',
                            transition: 'transform 0.6s cubic-bezier(0.23,1,0.32,1), filter 0.3s',
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={48} strokeWidth={1} style={{ color: 'rgba(0,0,0,0.1)' }} />
                    </div>
                )}

                {/* Subtle gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(255,255,255,0.12) 0%, transparent 60%)',
                }} />

                {/* Badge custom */}
                {course.badge && (
                    <div style={{
                        position: 'absolute', top: 14, left: 14,
                        background: '#C0A76A', color: 'white',
                        fontSize: '8px', fontWeight: 900, letterSpacing: '0.2em',
                        textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(192,167,106,0.4)',
                    }}>
                        {course.badge}
                    </div>
                )}

                {/* Level badge */}
                <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'rgba(255,255,255,0.9)',
                    color: level.color,
                    border: `1px solid ${level.border}`,
                    fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '4px 10px', borderRadius: '99px',
                    backdropFilter: 'blur(12px)',
                }}>
                    {level.label}
                </div>

                {/* Lock overlay */}
                {isLocked && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 10,
                        background: 'rgba(245,243,239,0.15)',
                        backdropFilter: 'blur(1px)',
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.92)',
                            border: '1px solid rgba(192,167,106,0.5)',
                            boxShadow: hovered ? '0 8px 32px rgba(192,167,106,0.35)' : '0 4px 20px rgba(192,167,106,0.2)',
                            transform: hovered ? 'scale(1.08)' : 'scale(1)',
                            transition: 'all 0.4s ease',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C0A76A" strokeWidth="1.8" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        {course.access_level === 'PAID' && course.price && (
                            <span style={{
                                fontSize: '12px', fontWeight: 800, color: 'white',
                                background: '#C0A76A', padding: '3px 12px', borderRadius: '99px',
                                boxShadow: '0 2px 10px rgba(192,167,106,0.4)',
                            }}>
                                {course.price} CHF
                            </span>
                        )}
                    </div>
                )}

                {/* Golden line */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, height: '2.5px',
                    background: 'linear-gradient(90deg, #C0A76A, #E8D5A3, #C0A76A)',
                    width: hovered && !isLocked ? '100%' : '0%',
                    transition: 'width 0.5s cubic-bezier(0.23,1,0.32,1)',
                }} />
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px 22px' }}>
                <h3 style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '1.05rem',
                    color: isLocked ? 'rgba(28,28,28,0.45)' : hovered ? '#9a7d45' : '#1C1C1C',
                    lineHeight: 1.35, marginBottom: 8,
                    transition: 'color 0.3s',
                }}>
                    {course.title}
                </h3>

                <p style={{
                    fontSize: '12.5px', lineHeight: 1.6,
                    color: isLocked ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.45)',
                    marginBottom: 14,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {course.description}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {[
                        { icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', label: `${course.modules?.length || 0} modules` },
                        { icon: 'M5 3l14 9-14 9V3z', label: `${totalLessons} leçons` },
                    ].map((s, i) => (
                        <span key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', color: 'rgba(0,0,0,0.28)',
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d={s.icon}/>
                            </svg>
                            {s.label}
                        </span>
                    ))}
                    {course.duration_minutes > 0 && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', color: 'rgba(0,0,0,0.28)',
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}min
                        </span>
                    )}
                </div>

                {/* CTA */}
                {!isLocked ? (
                    <div style={{
                        width: '100%', padding: '11px', borderRadius: '12px',
                        fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em',
                        textTransform: 'uppercase', textAlign: 'center',
                        background: hovered ? 'linear-gradient(135deg, #C0A76A, #D4B87A)' : 'rgba(192,167,106,0.1)',
                        color: hovered ? 'white' : '#9a7d45',
                        border: '1px solid rgba(192,167,106,0.35)',
                        boxShadow: hovered ? '0 6px 20px rgba(192,167,106,0.3)' : 'none',
                        transition: 'all 0.3s',
                    }}>
                        Commencer la Formation →
                    </div>
                ) : course.access_level === 'PREMIUM' ? (
                    <Link href="/app/profile">
                        <div style={{
                            width: '100%', padding: '11px', borderRadius: '12px',
                            fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em',
                            textTransform: 'uppercase', textAlign: 'center',
                            background: hovered ? '#7c3aed' : 'rgba(124,58,237,0.07)',
                            color: hovered ? 'white' : '#7c3aed',
                            border: '1px solid rgba(124,58,237,0.2)',
                            boxShadow: hovered ? '0 6px 20px rgba(124,58,237,0.25)' : 'none',
                            transition: 'all 0.3s',
                        }}>
                            ♛ Passer Premium pour débloquer
                        </div>
                    </Link>
                ) : (
                    <div style={{
                        width: '100%', padding: '11px', borderRadius: '12px',
                        fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em',
                        textTransform: 'uppercase', textAlign: 'center',
                        background: 'rgba(192,167,106,0.06)',
                        color: '#9a7d45',
                        border: '1px dashed rgba(192,167,106,0.4)',
                        transition: 'all 0.3s',
                    }}>
                        Contacter pour activer{course.price ? ` — ${course.price} CHF` : ''}
                    </div>
                )}
            </div>
        </div>
    )
}