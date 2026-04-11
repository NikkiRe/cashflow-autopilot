import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TrendingUp, FileText, Calendar, ArrowRight, ChevronDown, Zap } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const REVEAL_TEXT = 'YOUR FINANCES UNDER COMPLETE CONTROL'

const CARDS = [
  {
    backGrad:  'linear-gradient(160deg,#5C1020 0%,#3A0712 100%)',
    accent:    '#E87A90',
    glow:      'rgba(200,80,112,0.3)',
    title:     'FORECAST',
    text:      'Predict your cash position\n30 days ahead',
    Icon:      TrendingUp,
  },
  {
    backGrad:  'linear-gradient(160deg,#6B4500 0%,#422900 100%)',
    accent:    '#E8B020',
    glow:      'rgba(212,160,23,0.3)',
    title:     'INVOICES',
    text:      'Smart invoice tracking\n& payment automation',
    Icon:      FileText,
  },
  {
    backGrad:  'linear-gradient(160deg,#1A2C40 0%,#0D1820 100%)',
    accent:    '#8AABCF',
    glow:      'rgba(138,171,207,0.3)',
    title:     'OBLIGATIONS',
    text:      'Never miss a critical\npayment obligation',
    Icon:      Calendar,
  },
]
const CHART_PTS: [number, number][] = [
  [0,400],[55,372],[82,175],[112,438],[155,328],
  [195,105],[218,396],[258,295],[288,208],[322,425],
  [372,358],[400,336],
  [432,245],[462,65],[492,355],[535,265],
  [568,158],[598,425],[642,290],[678,165],
  [722,370],[792,310],[800,295],
  [852,435],[892,148],[932,320],[968,230],
  [998,420],[1038,188],[1078,310],[1118,128],[1158,300],[1200,278],
]
const PEAK_IDX = [2, 5, 13, 16, 24, 27, 31]
const GRID_Y = [120, 200, 280, 360, 440, 520]

const NeonChart = ({ idx }: { idx: number }) => {
  const off = idx * 400
  const pts  = CHART_PTS.map(([x, y]) => `${x - off},${y}`).join(' ')
  const last = CHART_PTS[CHART_PTS.length - 1]
  const first = CHART_PTS[0]
  const fill = `${pts} ${last[0] - off},600 ${first[0] - off},600`

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <filter id={`gw${idx}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" result="b" />
        </filter>
        <filter id={`gl${idx}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b" />
        </filter>
        <linearGradient id={`fg${idx}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0.22" />
          <stop offset="60%"  stopColor="#06b6d4" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gg${idx}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="20%"  stopColor="#06b6d4" stopOpacity="0.12" />
          <stop offset="80%"  stopColor="#06b6d4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`vg${idx}`} cx="50%" cy="50%" r="65%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(2,6,16,0.6)" />
        </radialGradient>
        <clipPath id={`cp${idx}`}>
          <rect x="0" y="0" width="400" height="600" />
        </clipPath>
      </defs>

      <g clipPath={`url(#cp${idx})`}>
        {GRID_Y.map((y, j) => (
          <line key={j}
            x1={0 - off} y1={y} x2={1200 - off} y2={y}
            stroke={`url(#gg${idx})`} strokeWidth="1"
          />
        ))}
        <polygon points={fill} fill={`url(#fg${idx})`} />
        <polyline points={pts} fill="none"
          stroke="#00e5ff" strokeWidth="20"
          filter={`url(#gw${idx})`} opacity="0.22" />
        <polyline points={pts} fill="none"
          stroke="#06b6d4" strokeWidth="7"
          filter={`url(#gl${idx})`} opacity="0.55" />
        <polyline points={pts} fill="none"
          stroke="#06b6d4" strokeWidth="2" opacity="1" />
        <polyline points={pts} fill="none"
          stroke="white" strokeWidth="0.7" opacity="0.75" />
        {PEAK_IDX.map(pi => {
          const [gx, gy] = CHART_PTS[pi]
          const cx = gx - off
          if (cx < -8 || cx > 408) return null
          return (
            <g key={pi}>
              <circle cx={cx} cy={gy} r="8"  fill="#00e5ff" opacity="0.18" filter={`url(#gl${idx})`} />
              <circle cx={cx} cy={gy} r="3"  fill="#06b6d4" opacity="0.95" />
              <circle cx={cx} cy={gy} r="1.2" fill="white"   opacity="1"    />
            </g>
          )
        })}
        <rect width="400" height="600" fill={`url(#vg${idx})`} />
      </g>
    </svg>
  )
}

export function LandingPage() {
  const wrapperRef      = useRef<HTMLDivElement>(null)
  const cardOverlayRef  = useRef<HTMLDivElement>(null)
  const textSectionRef  = useRef<HTMLDivElement>(null)
  const photoSectionRef = useRef<HTMLDivElement>(null)
  const navigate        = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.2 })
        .from('.lp-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' })
        .from('.lp-h1-1',  { opacity: 0, y: 60, duration: 1.0, ease: 'power3.out' }, '-=0.25')
        .from('.lp-h1-2',  { opacity: 0, y: 60, duration: 1.0, ease: 'power3.out' }, '-=0.75')
        .from('.lp-sub',   { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.55')
        .from('.lp-hint',  { opacity: 0, duration: 0.7 }, '-=0.2')
      gsap.to('.lp-hero-bg', {
        backgroundPosition: '200% 80%',
        duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
      gsap.to('.lp-orb-1', { x:  32, y: -22, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.lp-orb-2', { x: -26, y:  18, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.2 })
      gsap.to('.lp-orb-3', { x:  18, y:  28, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.5 })
      gsap.to('.lp-hint',  { y: 9, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.fromTo(
        cardOverlayRef.current,
        { y: '10vh', borderRadius: '32px 32px 0 0' },
        {
          y: 0, borderRadius: '0px', ease: 'none',
          scrollTrigger: {
            trigger: cardOverlayRef.current,
            start: 'top bottom', end: 'top top', scrub: 1.5,
          },
        }
      )
      const chars = gsap.utils.toArray<HTMLElement>('.lp-char')
      if (chars.length) {
        const trigger = {
          trigger: textSectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none reverse',
        }
        gsap.to(chars, {
          color: '#f1f5f9',
          stagger: 0.022,
          duration: 0.07,
          ease: 'none',
          scrollTrigger: trigger,
        })
        gsap.to('.lp-reveal-sub', {
          opacity: 1, duration: 0.6, ease: 'power2.out',
          delay: 0.95,
          scrollTrigger: trigger,
        })
        gsap.to('.lp-reveal-tag', {
          borderColor: 'rgba(6,182,212,0.35)',
          background:  'rgba(6,182,212,0.07)',
          color:        '#06b6d4',
          stagger: 0.12, duration: 0.4, ease: 'power2.out',
          delay: 1.15,
          scrollTrigger: trigger,
        })
      }
      const photoTl = gsap.timeline({
        scrollTrigger: {
          trigger:       photoSectionRef.current,
          start:         'top top',
          end:           '+=300%',
          scrub:         0.9,
          pin:           true,
          pinSpacing:    true,
          anticipatePin: 1,
        },
      })

      // 4a. All 3 panels enter as ONE assembled image (0 → 1.5)
      photoTl.from('.lp-panels-row', {
        opacity: 0, y: 70, scale: 0.97,
        duration: 1.5, ease: 'power3.out',
      }, 0)

      // 4b. Split apart + rounded corners (1.5 → 3)
      photoTl
        .to('.lp-pp-1', { x: '-6%', duration: 1.5, ease: 'power2.inOut' }, 1.5)
        .to('.lp-pp-3', { x:  '6%', duration: 1.5, ease: 'power2.inOut' }, 1.5)
        .to('.lp-face', { borderRadius: '22px', duration: 1.5, ease: 'power2.inOut' }, 1.5)

      // 5. Flip, staggered (3.2 → ~5.8)
      photoTl
        .fromTo('.lp-fi-1', { rotateY: 0 }, { rotateY: 180, duration: 1.8, ease: 'power2.inOut' }, 3.2)
        .fromTo('.lp-fi-2', { rotateY: 0 }, { rotateY: 180, duration: 1.8, ease: 'power2.inOut' }, 3.8)
        .fromTo('.lp-fi-3', { rotateY: 0 }, { rotateY: 180, duration: 1.8, ease: 'power2.inOut' }, 4.4)

    }, wrapperRef)

    return () => ctx.revert()
  }, [])

  /* ─── JSX ─────────────────────────────────────────────── */

  return (
    <div
      ref={wrapperRef}
      style={{
        background: '#07070f', color: '#e2e8f0', overflowX: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      <section style={{
        position: 'sticky', top: 0, zIndex: 1,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div className="lp-hero-bg" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(-45deg, #020814 0%, #071428 18%, #0b1f3a 36%, #061528 54%, #020c1e 72%, #030c20 90%, #020814 100%)',
          backgroundSize: '400% 400%',
          backgroundPosition: '0% 50%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 38%, rgba(6,182,212,0.13) 0%, rgba(99,102,241,0.07) 45%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(6,182,212,0.22) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse 88% 78% at 50% 42%, black 20%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 88% 78% at 50% 42%, black 20%, transparent 90%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(6,182,212,0.04) 80px)',
        }} />
        <div style={{
          position: 'absolute', top: '41%', left: '5%', right: '5%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.18) 30%, rgba(6,182,212,0.18) 70%, transparent)',
        }} />
        <div className="lp-orb-1" style={{
          position: 'absolute', top: '16%', left: '10%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.11) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="lp-orb-2" style={{
          position: 'absolute', bottom: '18%', right: '8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="lp-orb-3" style={{
          position: 'absolute', top: '50%', left: '60%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem', maxWidth: '54rem' }}>
          <div className="lp-badge" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.38rem 1.1rem', marginBottom: '2.2rem',
            borderRadius: '99px',
            border: '1px solid rgba(6,182,212,0.3)',
            background: 'rgba(6,182,212,0.06)',
            fontSize: '0.7rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#06b6d4',
          }}>
            <Zap size={11} />
            Liquidity Intelligence Platform
          </div>

          <h1 style={{
            margin: 0, padding: 0, fontWeight: 800,
            fontSize: 'clamp(3.2rem, 8vw, 7rem)',
            lineHeight: 1.04, letterSpacing: '-0.03em',
          }}>
            <span className="lp-h1-1" style={{ display: 'block', color: '#f1f5f9' }}>
              CashFlow
            </span>
            <span className="lp-h1-2" style={{
              display: 'block',
              background: 'linear-gradient(95deg, #06b6d4 0%, #818cf8 55%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Autopilot
            </span>
          </h1>

          <p className="lp-sub" style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            color: 'rgba(226,232,240,0.5)',
            marginTop: '1.6rem', lineHeight: 1.7,
          }}>
            Predict, optimise, and automate your business liquidity<br />
            with AI-powered cash-flow management
          </p>
        </div>

        <div className="lp-hint" style={{
          position: 'absolute', bottom: '2.2rem', zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(226,232,240,0.22)', fontSize: '0.68rem', letterSpacing: '0.12em',
        }}>
          <span style={{ textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={14} />
        </div>
      </section>
      <div
        ref={cardOverlayRef}
        style={{
          position: 'relative', zIndex: 10,
          background: 'linear-gradient(180deg, #0b1221 0%, #090d1a 100%)',
          minHeight: '90vh',
          padding: '5rem 2rem 6rem',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '60%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)',
        }} />

        <div style={{ maxWidth: '68rem', width: '100%', textAlign: 'center' }}>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: '#06b6d4', marginBottom: '1.4rem',
          }}>
            Trusted by finance teams
          </p>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 4.5vw, 3.4rem)',
            fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em',
            marginBottom: '4rem',
          }}>
            Stop reacting to cash crises.
            <br />
            <span style={{ color: 'rgba(226,232,240,0.32)' }}>Start preventing them.</span>
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                value: '360°',
                label: 'Cash visibility',
                desc:  'Consolidated view across all accounts, invoices and obligations in one place',
              },
              {
                value: '30 days',
                label: 'Forward horizon',
                desc:  "AI-generated cash flow projections updated daily so you always see what\u2019s coming",
              },
              {
                value: '0 missed',
                label: 'Payment alerts',
                desc:  'Automated reminders before every critical due date — no more surprises',
              },
            ].map(({ value, label, desc }) => (
              <div key={label} style={{
                padding: '2rem 1.8rem', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.025)',
              }}>
                <div style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                  fontWeight: 800, color: '#06b6d4', lineHeight: 1,
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: '0.7rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(226,232,240,0.38)',
                  margin: '0.7rem 0 0.45rem',
                }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(226,232,240,0.32)', lineHeight: 1.55 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <section
        ref={textSectionRef}
        style={{ minHeight: '100vh', background: '#07070f' }}
      >
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 2rem',
        }}>
          <p style={{
            fontSize: '0.7rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(226,232,240,0.16)',
            marginBottom: '2rem',
          }}>
            The difference
          </p>

          <div style={{
            maxWidth: '90rem', textAlign: 'center',
            fontSize: 'clamp(2.5rem, 5.8vw, 5rem)',
            fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.025em',
            userSelect: 'none',
          }}>
            {REVEAL_TEXT.split('').map((char, i) => (
              <span
                key={i}
                className="lp-char"
                style={{ display: 'inline-block', color: 'rgba(226,232,240,0.07)' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>

          {/* Subtitle — fades in after chars fill */}
          <p className="lp-reveal-sub" style={{
            marginTop: '1.8rem',
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            color: 'rgba(226,232,240,0)',
            fontWeight: 400, letterSpacing: '0.04em',
            lineHeight: 1.6, opacity: 0,
          }}>
            Built for finance teams that refuse to be surprised.
          </p>

          {/* Keyword tags — stagger in after subtitle */}
          <div style={{
            marginTop: '2rem',
            display: 'flex', gap: '0.75rem',
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {['PREDICT', 'OPTIMISE', 'AUTOMATE'].map((w, i) => (
              <span key={i} className="lp-reveal-tag" style={{
                padding: '0.38rem 1.1rem', borderRadius: '99px',
                border: '1px solid rgba(6,182,212,0)',
                background: 'rgba(6,182,212,0)',
                fontSize: '0.68rem', letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(6,182,212,0)',
                transition: 'none',
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section
        ref={photoSectionRef}
        style={{
          height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#07070f',
          padding: '0 2.5rem',
          gap: '1.8rem',
          overflow: 'hidden',
        }}
      >
        <p style={{
          fontSize: '0.7rem', letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(226,232,240,0.22)',
          flexShrink: 0,
        }}>
          Features
        </p>

        {/*
          Panels container — gets animated as ONE unit on entrance,
          then panels inside split apart.
          gap: 0 → touching = truly one image initially.
        */}
        <div
          className="lp-panels-row"
          style={{
            display: 'flex',
            gap: 0,
            width: '100%', maxWidth: '82rem',
            height: 'clamp(360px, 58vh, 580px)',
            flexShrink: 0,
          }}
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              className={`lp-pp lp-pp-${i + 1}`}
              style={{ flex: 1, perspective: '1100px' }}
            >
              <div
                className={`lp-fi-${i + 1}`}
                style={{
                  width: '100%', height: '100%',
                  transformStyle: 'preserve-3d',
                  position: 'relative',
                  willChange: 'transform',
                }}
              >
                <div
                  className="lp-face"
                  style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    background: 'linear-gradient(180deg, #040c1e 0%, #02060f 100%)',
                    borderRadius: 0,
                    overflow: 'hidden',
                  }}
                >
                  <NeonChart idx={i} />
                  <div style={{
                    position: 'absolute', bottom: '1.5rem', left: 0, right: 0,
                    textAlign: 'center', zIndex: 2,
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.28rem 0.85rem', borderRadius: '99px',
                      border: `1px solid ${card.accent}40`,
                      background: `${card.accent}0e`,
                      fontSize: '0.62rem', letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: card.accent,
                    }}>
                      {String(i + 1).padStart(2, '0')} · {card.title}
                    </div>
                  </div>
                </div>
                <div
                  className="lp-face"
                  style={{
                    position: 'absolute', inset: 0,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.backGrad,
                    borderRadius: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '3rem 2.5rem', gap: '1.4rem',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top accent line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
                    opacity: 0.65,
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse at 50% 110%, ${card.glow} 0%, transparent 55%)`,
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none',
                  }} />

                  <div style={{
                    width: 62, height: 62, borderRadius: '14px',
                    border: `1px solid ${card.accent}44`,
                    background: `${card.accent}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: card.accent, flexShrink: 0, position: 'relative', zIndex: 1,
                  }}>
                    <card.Icon size={26} />
                  </div>

                  <div style={{
                    fontSize: '0.66rem', letterSpacing: '0.26em',
                    textTransform: 'uppercase', color: card.accent,
                    position: 'relative', zIndex: 1,
                  }}>
                    {card.title}
                  </div>

                  <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                    fontWeight: 600, textAlign: 'center',
                    color: 'rgba(255,255,255,0.9)', lineHeight: 1.55,
                    whiteSpace: 'pre-line',
                    position: 'relative', zIndex: 1, margin: 0,
                  }}>
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '6rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #07070f 0%, #0a1120 50%, #07070f 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '22%', left: '50%', transform: 'translateX(-50%)',
          width: '55%', height: 520,
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: '0.7rem', letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#06b6d4',
          marginBottom: '1.4rem', position: 'relative',
        }}>
          Ready to start?
        </p>

        <h2 style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em',
          marginBottom: '1.4rem', maxWidth: '38rem',
          position: 'relative',
        }}>
          Stop flying blind on cash flow
        </h2>

        <p style={{
          fontSize: '1.1rem', color: 'rgba(226,232,240,0.42)',
          marginBottom: '3rem', maxWidth: '30rem', lineHeight: 1.65,
          position: 'relative',
        }}>
          Join finance teams using CashFlow Autopilot to predict, optimise,
          and automate their liquidity management.
        </p>

        <button
          onClick={() => navigate('/')}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 0 60px rgba(6,182,212,0.45), 0 20px 40px rgba(0,0,0,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 0 40px rgba(6,182,212,0.25), 0 8px 24px rgba(0,0,0,0.3)'
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.7rem',
            padding: '1rem 2.6rem', borderRadius: '12px',
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #06b6d4 0%, #818cf8 100%)',
            color: '#fff', fontSize: '1rem', fontWeight: 700,
            letterSpacing: '0.015em', position: 'relative',
            boxShadow: '0 0 40px rgba(6,182,212,0.25), 0 8px 24px rgba(0,0,0,0.3)',
            transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1)',
            fontFamily: 'inherit',
          }}
        >
          Enter the App
          <ArrowRight size={18} />
        </button>

        <p style={{
          marginTop: '5rem', fontSize: '0.78rem',
          color: 'rgba(226,232,240,0.18)', letterSpacing: '0.04em',
        }}>
          CashFlow Autopilot · Liquidity Intelligence Platform
        </p>
      </section>
    </div>
  )
}
