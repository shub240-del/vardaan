"use client";

import { useEffect, useState } from "react";
import { copy, type Lang } from "@/lib/i18n";
import SignupForm from "./SignupForm";

function Logo() {
  return (
    <a href="#top" className="logo" aria-label="Vardaan home">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill="#E8F3EC" />
        <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#1F7A55" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Vardaan</span>
    </a>
  );
}

const icons = {
  ok: "✓",
  warn: "!",
  money: "₹",
} as const;

export default function Landing() {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vd_lang");
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem("vd_lang", lang); } catch {}
  }, [lang]);

  return (
    <div id="top" className={lang === "hi" ? "hi" : ""}>
      <header className="nav">
        <div className="wrap nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Main">
            <a href="#how">{t.nav.how}</a>
            <a href="#faq">{t.nav.faq}</a>
          </nav>
          <div className="nav-actions">
            <div className="lang" role="group" aria-label="Language">
              <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>EN</button>
              <button className={lang === "hi" ? "on" : ""} onClick={() => setLang("hi")} aria-pressed={lang === "hi"}>हिं</button>
            </div>
            <a href="#join" className="btn small primary">{t.nav.cta}</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <video className="hero-video" autoPlay muted loop playsInline poster="/hero.jpg" aria-hidden="true">
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="wrap hero-center">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.title}</h1>
            <p className="lede">{t.hero.sub}</p>
            <ul className="feed" aria-label={t.liveLabel}>
              {t.live.map((l, i) => (
                <li key={i} className={`live-item s-${l.s}`} style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
                  <span className="dot" aria-hidden="true">{icons[l.s as keyof typeof icons]}</span>
                  <span><strong>{l.t}</strong><small>{l.d}</small></span>
                </li>
              ))}
            </ul>
            <div className="hero-cta">
              <a href="#join" className="btn primary">{t.hero.cta}</a>
              <span className="note">{t.hero.note}</span>
            </div>
          </div>
        </section>

        <section className="features wrap">
          <h2 className="center">{t.features.title}</h2>
          {t.features.items.map((it, i) => (
            <article key={i} className={`feature-row${i % 2 ? " flip" : ""}`}>
              <div className="feature-copy">
                <span className="feature-num">0{i + 1}</span>
                <h3>{it.h}</h3>
                <p>{it.p}</p>
              </div>
              <div className={`feature-media m${i}`} aria-hidden="true">
                <div className="mock">
                  {t.live.slice(i, i + 2).map((l, j) => (
                    <div key={j} className={`mock-line s-${l.s}`}>
                      <span className="dot">{icons[l.s as keyof typeof icons]}</span>
                      <span><strong>{l.t}</strong><small>{l.d}</small></span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="stat wrap">
          <div className="stat-grid">
            <div className="tile tile-sky" aria-hidden="true" />
            <div className="tile tile-card" aria-hidden="true">
              <small>Settlement · Star Health</small><strong>₹1,42,600</strong><span className="pill">Matched to bill</span>
            </div>
            <div className="stat-center">
              <p className="stat-big">{t.stat.big}</p>
              <h2>{t.stat.h}</h2>
              <p>{t.stat.p}</p>
            </div>
            <div className="tile tile-card" aria-hidden="true">
              <small>This week</small><strong>23 files checked</strong><span className="pill warn">4 gaps fixed before sending</span>
            </div>
            <div className="tile tile-sun" aria-hidden="true" />
          </div>
        </section>

        <section id="how" className="how wrap">
          <h2 className="center">{t.how.title}</h2>
          <ol className="steps">
            {t.how.steps.map((s, i) => (
              <li key={i}>
                <span className="step-n">{i + 1}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="join" className="join">
          <div className="wrap join-grid">
            <div className="join-copy">
              <h2>{t.closing.h}</h2>
              <p>{t.closing.p}</p>
            </div>
            <SignupForm lang={lang} />
          </div>
        </section>

        <section id="faq" className="faq wrap">
          <h2 className="center">{t.faq.title}</h2>
          <div className="faq-list">
            {t.faq.items.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing">
          <video className="hero-video" autoPlay muted loop playsInline aria-hidden="true">
            <source src="/closing.mp4" type="video/mp4" />
          </video>
          <div className="wrap closing-inner">
            <h2>{t.closing.h}</h2>
            <a href="#join" className="btn primary">{t.closing.cta}</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-top">
            <div><Logo /><p>{t.hero.title}</p></div>
            <a href="#join" className="btn primary small">{t.nav.cta}</a>
          </div>
          <div className="footer-cols">
            <div><h4>{t.footer.company}</h4><a href="#how">{t.nav.how}</a><a href="#faq">{t.nav.faq}</a></div>
            <div><h4>{t.footer.contact}</h4><a href="#join">{t.closing.cta}</a></div>
            <div><h4>{t.footer.legal}</h4><a href="/privacy">{t.footer.privacy}</a><a href="/terms">{t.footer.terms}</a></div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Vardaan. All rights reserved.</span>
            <span>{t.footer.made}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
