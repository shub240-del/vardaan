"use client";

import { useEffect, useRef, useState } from "react";
import { copy, type Lang } from "@/lib/i18n";
import SignupForm from "./SignupForm";

function Logo() {
  return (
    <a href="#top" className="logo" aria-label="Vardaan home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
  <g fill="#1F7A55">
    <path d="M6 30 C14 28 26 33 32 46 C20 49 9 42 6 30 Z"/>
    <path d="M58 30 C50 28 38 33 32 46 C44 49 55 42 58 30 Z"/>
    <path d="M14 16 C24 18 32 30 32 46 C20 42 13 31 14 16 Z"/>
    <path d="M50 16 C40 18 32 30 32 46 C44 42 51 31 50 16 Z"/>
    <path d="M32 8 C42 18 44 34 32 46 C20 34 22 18 32 8 Z"/>
    <path d="M14 51 C22 48.500 42 48.500 50 51 C44 55.500 20 55.500 14 51 Z"/>
  </g>
  <g fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round">
    <path d="M32 46 C24 38 23 22 32 8"/>
    <path d="M32 46 C40 38 41 22 32 8"/>
  </g>
  <circle cx="32" cy="24" r="3.4" fill="#F6D77B"/>
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

const FEATURE_POSTERS = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1777269749032-d8d458ae594d?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1764727291644-5dcb0b1a0375?auto=format&fit=crop&w=1200&q=70",
];

const FEATURE_VIDEOS = [
  "https://assets.mixkit.co/videos/17469/17469-720.mp4",
  "https://assets.mixkit.co/videos/4779/4779-720.mp4",
  "https://assets.mixkit.co/videos/46365/46365-720.mp4",
];

function Counter({ text }: { text: string }) {
  const m = text.match(/^(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(m ? parseInt(m[1], 10) : null);
  useEffect(() => {
    if (!m || !ref.current) return;
    const target = parseInt(m[1], 10);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1200);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [text]);
  return <span ref={ref}>{m ? `${n}${m[2]}` : text}</span>;
}

export default function Landing() {
  const heroMedia = useRef<HTMLDivElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [tick, setTick] = useState(0);
  const [heroEmail, setHeroEmail] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((n) => n + 1), 2800);
    return () => clearInterval(id);
  }, []);
  const onHeroEmail = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("vd:prefill", { detail: heroEmail.trim() }));
    document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.querySelector<HTMLInputElement>("#join input")?.focus({ preventScroll: true }), 700);
  };
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

  // Scroll effects: reveal, lazy videos, hero parallax, progress bar
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => (reduce ? el.classList.add("in") : io.observe(el)));

    const vio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          v.querySelectorAll("source[data-src]").forEach((src) => {
            src.setAttribute("src", src.getAttribute("data-src")!); src.removeAttribute("data-src"); v.load();
          });
          if (!reduce) v.play().catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.25 });
    document.querySelectorAll(".lazy-video").forEach((v) => vio.observe(v));

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? y / max : 0);
        setScrolled(y > 12);
        if (reduce) return;
        const h = window.innerHeight;
        const p = Math.min(1, y / h);
        if (heroMedia.current) heroMedia.current.style.transform = `translateY(${y * 0.35}px) scale(${1 + p * 0.08})`;
        if (heroCopy.current) { heroCopy.current.style.transform = `translateY(${y * 0.15}px)`; heroCopy.current.style.opacity = String(1 - p * 1.1); }
        document.querySelectorAll<HTMLElement>(".feature-media .mock").forEach((m) => {
          const r = m.parentElement!.getBoundingClientRect();
          const c = (r.top + r.height / 2 - h / 2) / h;
          m.style.transform = `translateY(${c * -40}px)`;
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); vio.disconnect(); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div id="top" className={lang === "hi" ? "hi" : ""}>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="pill-group"><Logo /><a href="#how" className="pill">{t.nav.how}</a><a href="#faq" className="pill">{t.nav.faq}</a></div>
          <div className="pill-group">
            <button className="pill lang-pill" onClick={() => setLang(lang === "en" ? "hi" : "en")} aria-label="Switch language">{lang === "en" ? "हिं" : "EN"}</button>
            <a href="#join" className="pill pill-cta">{t.nav.cta}</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-media" ref={heroMedia}>
            <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster="/hero.jpg" aria-hidden="true">
              <source src="https://assets.mixkit.co/videos/4766/4766-720.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/4766/4766-360.mp4" type="video/mp4" />
              <source src="/hero.mp4" type="video/mp4" />
            </video>
            <div className="hero-veil" />
          </div>
          <div className="wrap hero-center" ref={heroCopy}>
            <h1>{t.hero.title}<br /><em>{t.hero.title2}</em></h1>
            <p className="lede">{t.hero.sub}</p>
            <p className="ticker" aria-live="polite" aria-label={t.liveLabel}>
              <span key={tick} className="ticker-item">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6l2 2 3-4M3 14l2 2 3-4M11 7h10M11 15h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{t.live[tick % t.live.length].t}<span className="tk-d"> · {t.live[tick % t.live.length].d}</span></span>
              </span>
            </p>
          </div>
          <form className="email-bar" onSubmit={onHeroEmail}>
            <label className="sr-only" htmlFor="hero-email">{t.hero.emailPh}</label>
            <input id="hero-email" type="email" placeholder={t.hero.emailPh} value={heroEmail} onChange={(e) => setHeroEmail(e.target.value)} maxLength={254} autoComplete="email" />
            <button type="submit">{t.hero.cta}</button>
          </form>
        </section>

        <section className="features wrap">
          <h2 className="center reveal">{t.features.title}</h2>
          {t.features.items.map((it, i) => (
            <article key={i} className={`feature-row${i % 2 ? " flip" : ""}`}>
              <div className="feature-copy reveal">
                <span className="feature-num">0{i + 1}</span>
                <h3>{it.h}</h3>
                <p>{it.p}</p>
              </div>
              <div className={`feature-media m${i} reveal`} aria-hidden="true">
                <video className="fm-video lazy-video" muted loop playsInline preload="none" poster={FEATURE_POSTERS[i]}>
                  <source data-src={FEATURE_VIDEOS[i]} type="video/mp4" />
                  <source data-src={FEATURE_VIDEOS[i].replace("-720.mp4", "-360.mp4")} type="video/mp4" />
                </video>
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
            <div className="tile tile-sky tile-media reveal" aria-hidden="true">
              <video className="lazy-video" muted loop playsInline preload="none">
                <source data-src="https://assets.mixkit.co/videos/46366/46366-720.mp4" type="video/mp4" />
                <source data-src="https://assets.mixkit.co/videos/46366/46366-360.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="tile tile-card reveal" aria-hidden="true">
              <small>Settlement · Star Health</small><strong>₹1,42,600</strong><span className="pill">Matched to bill</span>
            </div>
            <div className="stat-center reveal">
              <p className="stat-big"><Counter text={t.stat.big} /></p>
              <h2>{t.stat.h}</h2>
              <p>{t.stat.p}</p>
              <p className="stat-tag">{t.stat.tag}</p>
            </div>
            <div className="tile tile-card reveal" aria-hidden="true">
              <small>This week</small><strong>23 files checked</strong><span className="pill warn">4 gaps fixed before sending</span>
            </div>
            <div className="tile tile-photo reveal" aria-hidden="true" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1491977345698-16775008d007?auto=format&fit=crop&w=700&q=70)" }} />
          </div>
        </section>

        <section id="how" className="how wrap">
          <h2 className="center reveal">{t.how.title}</h2>
          <ol className="steps">
            {t.how.steps.map((s, i) => (
              <li key={i} className="reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
                <span className="step-n">{i + 1}</span>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="join" className="join">
          <div className="wrap join-grid">
            <div className="join-copy reveal">
              <h2>{t.closing.h}</h2>
              <p>{t.closing.p}</p>
            </div>
            <SignupForm lang={lang} />
          </div>
        </section>

        <section id="faq" className="faq wrap">
          <h2 className="center reveal">{t.faq.title}</h2>
          <div className="faq-list reveal">
            {t.faq.items.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="closing">
          <div className="closing-photo" aria-hidden="true" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1626890759542-8fd859125b85?auto=format&fit=crop&w=1800&q=70)" }} />
          <div className="wrap closing-inner reveal">
            <h2>{t.closing.h}</h2>
            <a href="#join" className="btn primary big">{t.closing.cta} <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-card">
          <div className="wrap">
            <div className="footer-cols">
              <div><h4>{t.footer.company}</h4><a href="#how">{t.nav.how}</a><a href="#faq">{t.nav.faq}</a></div>
              <div><h4>{t.footer.contact}</h4><a href="#join">{t.closing.cta}</a></div>
              <div><h4>{t.footer.legal}</h4><a href="/privacy">{t.footer.privacy}</a><a href="/terms">{t.footer.terms}</a></div>
            </div>
            <div className="footer-sign">
              <svg width="44" height="44" viewBox="0 0 64 64" aria-hidden="true">
  <g fill="#1F7A55">
    <path d="M6 30 C14 28 26 33 32 46 C20 49 9 42 6 30 Z"/>
    <path d="M58 30 C50 28 38 33 32 46 C44 49 55 42 58 30 Z"/>
    <path d="M14 16 C24 18 32 30 32 46 C20 42 13 31 14 16 Z"/>
    <path d="M50 16 C40 18 32 30 32 46 C44 42 51 31 50 16 Z"/>
    <path d="M32 8 C42 18 44 34 32 46 C20 34 22 18 32 8 Z"/>
    <path d="M14 51 C22 48.500 42 48.500 50 51 C44 55.500 20 55.500 14 51 Z"/>
  </g>
  <g fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round">
    <path d="M32 46 C24 38 23 22 32 8"/>
    <path d="M32 46 C40 38 41 22 32 8"/>
  </g>
  <circle cx="32" cy="24" r="3.4" fill="#F6D77B"/>
</svg>
              <p>© {new Date().getFullYear()} Vardaan. All rights reserved.<br />{t.footer.made}.</p>
            </div>
          </div>
        </div>
        <div className="footer-giant" aria-hidden="true">Vardaan</div>
      </footer>
    </div>
  );
}
