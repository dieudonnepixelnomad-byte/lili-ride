import Link from 'next/link'
import Image from 'next/image'
import SearchPanel from '@/components/shared/SearchPanel'

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section style={{
        padding: '64px 0 88px',
        background: `
          radial-gradient(ellipse 60% 80% at 90% 0%, rgba(15, 138, 107, 0.08), transparent 60%),
          radial-gradient(ellipse 80% 70% at -10% 30%, rgba(26, 78, 138, 0.06), transparent 60%),
          var(--bg)
        `,
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '6px 12px 6px 6px',
                background: 'var(--surface)', border: '1px solid var(--line)',
                borderRadius: 'var(--r-pill)',
                fontSize: 13, color: 'var(--ink-2)',
                marginBottom: 24,
              }}>
                <span className="badge badge-ink" style={{ fontSize: 11, letterSpacing: '0.04em' }}>MVP</span>
                <span>Disponible à Douala, Yaoundé et Bafoussam</span>
              </div>

              <h1>
                Bouger au Cameroun,<br />
                tout <em style={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: 400 }}>simplement</em>.
              </h1>

              <p style={{ marginTop: 22, fontSize: 18, lineHeight: 1.55, maxWidth: 520, color: 'var(--ink-2)' }}>
                Covoiturage entre particuliers, transport de vos colis et location de véhicules. Trois services, une seule plateforme, des prix en FCFA, un support humain joignable au téléphone et sur WhatsApp.
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <Link href="/covoiturage" className="btn btn-primary btn-lg">Trouver un trajet</Link>
                <Link href="/connexion" className="btn btn-outline btn-lg">Publier mon trajet</Link>
              </div>

              <div style={{ display: 'flex', gap: 32, marginTop: 56 }}>
                {[
                  { v: '3', l: 'villes pilotes' },
                  { v: '100%', l: 'francophone' },
                  { v: '0 FCFA', l: "d'inscription" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--ink)' }}>{v}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', letterSpacing: '0.02em' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div style={{
              position: 'relative',
              aspectRatio: '4/5',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}>
              <Image
                src="/images/voiture_accueil.png"
                alt="Voiture sur route camerounaise"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* Overlay card */}
              <div style={{
                position: 'absolute',
                left: 20, right: 20, bottom: 20,
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(8px)',
                borderRadius: 16,
                padding: 18,
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div className="avatar avatar-amber">EM</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)' }}>Douala → Yaoundé</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>Vendredi 14 juin · 06h30 · 3 places restantes</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--primary-deep)' }}>5 000</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>FCFA / place</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search panel */}
          <div style={{ marginTop: 8 }}>
            <SearchPanel />
          </div>
        </div>
      </section>

      {/* PÔLES */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 700, marginBottom: 56 }}>
            <span className="kicker">Trois services, un seul compte</span>
            <h2>La même plateforme<br />pour tous vos déplacements.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                href: '/covoiturage',
                num: 'PÔLE 01',
                title: 'Covoiturage',
                desc: 'Partagez la route avec d\'autres voyageurs. Les conducteurs proposent leurs trajets, vous réservez votre place et économisez sur le carburant.',
                illu: 'route',
              },
              {
                href: '/colis',
                num: 'PÔLE 02',
                title: 'Transport de colis',
                desc: 'Envoyez vos documents, marchandises et objets fragiles via des transporteurs vérifiés qui empruntent déjà votre itinéraire.',
                illu: 'box',
              },
              {
                href: '/location',
                num: 'PÔLE 03',
                title: 'Location de véhicules',
                desc: 'Louez une voiture à la journée auprès de propriétaires particuliers ou de notre flotte. Berlines, SUV, minibus — au choix.',
                illu: 'car',
              },
            ].map(({ href, num, title, desc, illu }) => (
              <Link key={href} href={href} className="card-hover" style={{
                position: 'relative',
                padding: 28,
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 18,
                textDecoration: 'none',
                color: 'var(--ink)',
                overflow: 'hidden',
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
              }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>{num}</span>
                <h3 style={{ fontSize: 30, marginTop: 10 }}>{title}</h3>
                <div style={{
                  position: 'absolute', top: 28, right: 28,
                  width: 38, height: 38,
                  borderRadius: '50%',
                  background: 'var(--ink)',
                  color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10h10M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ marginTop: 12, fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{desc}</p>
                <div style={{
                  marginTop: 'auto',
                  height: 140,
                  borderRadius: 12,
                  position: 'relative',
                  overflow: 'hidden',
                  background: illu === 'route'
                    ? 'linear-gradient(180deg, #F4F7FB 0%, #E9EFF6 100%)'
                    : illu === 'box'
                    ? 'radial-gradient(circle at 50% 60%, rgba(15, 138, 107, 0.15), transparent 60%), linear-gradient(180deg, #F4F7FB 0%, #E9EFF6 100%)'
                    : 'linear-gradient(180deg, #F4F7FB 0%, #E9EFF6 100%)',
                  border: '1px solid var(--line-2)',
                }}>
                  {illu === 'box' && (
                    <>
                      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 90, height: 64, background: '#C8985A', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} />
                      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 6, height: 64, background: 'rgba(255,255,255,0.5)' }} />
                    </>
                  )}
                  {illu === 'car' && (
                    <>
                      <div style={{ position: 'absolute', left: '50%', top: '56%', transform: 'translate(-50%, -50%)', width: 130, height: 50, background: 'var(--primary)', borderRadius: '14px 14px 8px 8px', boxShadow: '0 6px 16px rgba(26, 78, 138, 0.25)' }} />
                      <div style={{ position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%, -50%)', width: 80, height: 36, background: 'linear-gradient(180deg, #E8F0FA 0%, #BFD2E8 100%)', borderRadius: '10px 10px 4px 4px' }} />
                      <div style={{ position: 'absolute', bottom: 22, left: 'calc(50% - 50px)', width: 16, height: 16, borderRadius: '50%', background: 'var(--ink)', border: '3px solid #fff' }} />
                      <div style={{ position: 'absolute', bottom: 22, right: 'calc(50% - 50px)', width: 16, height: 16, borderRadius: '50%', background: 'var(--ink)', border: '3px solid #fff' }} />
                    </>
                  )}
                  {illu === 'route' && (
                    <>
                      <div style={{ position: 'absolute', left: '16%', right: '16%', top: '50%', height: 4, background: 'var(--primary)', borderRadius: 999 }} />
                      <div style={{ position: 'absolute', left: '14%', top: 'calc(50% - 8px)', width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '4px solid var(--primary)' }} />
                      <div style={{ position: 'absolute', right: '14%', top: 'calc(50% - 6px)', width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(15, 138, 107, 0.4)' }} />
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ maxWidth: 600 }}>
            <span className="kicker">Comment ça marche</span>
            <h2>Quatre étapes, zéro friction.</h2>
            <p style={{ marginTop: 16, fontSize: 16 }}>
              Pas de paiement en ligne, pas d&rsquo;application à installer. Tout se passe sur le web, avec notre équipe support disponible par téléphone et WhatsApp pour finaliser chaque mise en relation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 48 }}>
            {[
              { num: '01 — RECHERCHE', title: 'Choisissez votre service', desc: 'Covoiturage, transport de colis ou location. Indiquez votre départ, arrivée et date, parcourez les annonces disponibles.' },
              { num: '02 — DEMANDE', title: 'Envoyez une demande', desc: 'Sur la fiche qui vous intéresse, remplissez le formulaire en quelques secondes. Vos coordonnées sont pré-remplies.' },
              { num: '03 — CONTACT', title: 'Le support vous appelle', desc: 'Notre équipe vous joint au téléphone ou WhatsApp pour confirmer les détails et organiser la mise en relation.' },
              { num: '04 — VOYAGE', title: 'Vous voyagez sereinement', desc: 'Vous êtes mis en contact direct avec le conducteur, le transporteur ou le propriétaire. Bonne route avec Lili-Ride.' },
            ].map(({ num, title, desc }, i) => (
              <div key={num} style={{ paddingTop: 24, borderTop: '1px solid var(--line)', ...(i === 3 ? { gridColumn: '1' } : {}) }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)', letterSpacing: '0.1em' }}>{num}</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 8 }}>{title}</h4>
                <p style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI LILI-RIDE */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <span className="kicker">Pourquoi Lili-Ride</span>
              <h2>Conçu pour la réalité du terrain camerounais.</h2>
              <p style={{ marginTop: 20, fontSize: 16 }}>
                Pas besoin de carte bancaire, pas d&rsquo;application à télécharger. Les profils transporteurs sont systématiquement vérifiés par notre équipe avant toute publication. Les prix s&rsquo;affichent en francs CFA.
              </p>
              <div style={{ marginTop: 32 }}>
                <Link href="/connexion" className="btn btn-primary btn-lg">Créer mon compte gratuitement</Link>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                {
                  title: 'Transporteurs vérifiés',
                  desc: 'Permis, carte grise et photo du véhicule contrôlés manuellement par notre équipe avant chaque première publication.',
                  icon: <path d="M10 2L3 5v5c0 4 3 7 7 8 4-1 7-4 7-8V5l-7-3z" stroke="currentColor" strokeWidth="1.5" />,
                },
                {
                  title: 'Prix en FCFA, sans surprise',
                  desc: 'Le tarif s\'affiche clairement sur chaque annonce, fixé par le conducteur ou le propriétaire. Pas de frais cachés.',
                  icon: <><path d="M5 4h10v12H5z" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8h4M8 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
                },
                {
                  title: 'Un humain au bout du fil',
                  desc: 'Une équipe support joignable par téléphone et WhatsApp, qui parle français et connaît les routes camerounaises.',
                  icon: <path d="M16 12.5v2a2 2 0 01-2.2 2 14 14 0 01-12-12A2 2 0 014 2.5h2.5l1 4-2 1a10 10 0 005 5l1-2 4 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />,
                },
                {
                  title: 'Un compte, trois rôles',
                  desc: 'Le même profil vous permet de chercher, de publier un trajet ou de louer votre véhicule selon le moment.',
                  icon: <><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
                },
              ].map(({ title, desc, icon }) => (
                <div key={title} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary-deep)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">{icon}</svg>
                  </span>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, marginBottom: 4 }}>{title}</h4>
                    <p style={{ fontSize: 14, lineHeight: 1.55 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="section-sm">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <span className="kicker">Couverture</span>
              <h3 style={{ fontSize: 28 }}>Lancement dans trois villes pilotes.</h3>
            </div>
            <p style={{ maxWidth: 360, color: 'var(--ink-3)' }}>Extension vers Garoua-Ngaoundéré prévue en V3.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }}>
            {[
              { label: 'Douala', soon: false },
              { label: 'Yaoundé', soon: false },
              { label: 'Bafoussam', soon: false },
              { label: 'Garoua · bientôt', soon: true },
              { label: 'Ngaoundéré · bientôt', soon: true },
              { label: 'Bertoua · bientôt', soon: true },
            ].map(({ label, soon }) => (
              <span key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '12px 18px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-pill)',
                fontSize: 14,
                color: soon ? 'var(--muted)' : 'var(--ink)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: soon ? 'var(--muted)' : 'var(--accent)', flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section-sm">
        <div className="container">
          <div style={{
            background: `
              radial-gradient(ellipse at top right, rgba(15, 138, 107, 0.15), transparent 50%),
              linear-gradient(135deg, #143E6E 0%, #1A4E8A 60%, #2563A8 100%)
            `,
            color: '#fff',
            borderRadius: 24,
            padding: 64,
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 48,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Grid overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#fff' }}>Vous conduisez déjà ?<br />Rentabilisez vos trajets.</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 16, fontSize: 16 }}>
                Publiez vos trajets covoiturage, vos disponibilités pour le transport de colis ou mettez votre véhicule à la location. La vérification est gratuite et prend 24h en moyenne.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <Link href="/connexion" className="btn btn-accent btn-lg">Devenir transporteur</Link>
                <Link href="/support" className="btn btn-outline btn-lg" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Parler à l&rsquo;équipe</Link>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 24,
              position: 'relative', zIndex: 1,
            }}>
              {[
                { lbl: 'Commission Lili-Ride', val: 'Au cas par cas' },
                { lbl: "Frais d'inscription", val: '0 FCFA' },
                { lbl: 'Vérification documents', val: '≈ 24 h' },
                { lbl: 'Paiement en ligne', val: 'V1 (à venir)' },
              ].map(({ lbl, val }) => (
                <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5 }}>{lbl}</span>
                  <span style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 17 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
