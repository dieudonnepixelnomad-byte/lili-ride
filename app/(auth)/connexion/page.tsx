'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'otp'

export default function ConnexionPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) throw error
      setStep('otp')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du code.")
    } finally {
      setLoading(false)
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      if (error) throw error

      const userId = data.user?.id
      if (!userId) throw new Error('Session invalide.')

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      router.push(profile ? '/dashboard' : '/profil-complet')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Code incorrect ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  function handleResend() {
    setStep('email')
    setOtp('')
    setError('')
  }

  return (
    <div className="auth-form-card">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28 }}>
          {step === 'email' ? 'Connexion' : 'Vérification'}
        </h2>
        {step === 'email' && (
          <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 15 }}>
            Pas encore de compte ? Il sera créé automatiquement.
          </p>
        )}
        {step === 'otp' && (
          <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 15 }}>
            Code envoyé à <strong>{email}</strong>
          </p>
        )}
      </div>

      {step === 'email' && (
        <>
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="field">
              <label className="field-label">Adresse e-mail</label>
              <input
                className="input"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && <div className="notice warn" style={{ padding: '10px 14px' }}>{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? 'Envoi…' : 'Recevoir un code'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>ou</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={handleGoogle}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24.3v9h13c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.2-10.6 7.2-17.5z" fill="#4285F4"/>
              <path d="M24.3 48c6.5 0 12-2.2 16-5.9l-7.9-6c-2.2 1.5-5 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H3v6.2C7 42.6 15 48 24.3 48z" fill="#34A853"/>
              <path d="M10.9 28.5c-.5-1.5-.8-3-.8-4.5s.3-3 .8-4.5V13.3H3A23.9 23.9 0 0 0 .3 24c0 3.9.9 7.5 2.7 10.7l7.9-6.2z" fill="#FBBC05"/>
              <path d="M24.3 9.6c3.5 0 6.6 1.2 9 3.6l6.8-6.8C36.2 2.4 30.7 0 24.3 0 15 0 7 5.4 3 13.3l7.9 6.2c1.9-5.7 7.2-9.9 13.4-9.9z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
        </>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="field">
            <label className="field-label">Code à 6 chiffres</label>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{8}"
              maxLength={8}
              placeholder="12345678"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              style={{ letterSpacing: '0.3em', fontSize: 22, textAlign: 'center' }}
            />
          </div>

          {error && <div className="notice warn" style={{ padding: '10px 14px' }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Vérification…' : 'Vérifier le code'}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={handleResend}
          >
            Changer d&apos;adresse ou renvoyer
          </button>
        </form>
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link href="/support" style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>
          Problème de connexion ? Contacter le support
        </Link>
      </div>
    </div>
  )
}
