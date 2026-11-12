"use client";

import { useEffect, useRef, useState } from "react";
import { formCopy, type Lang } from "@/lib/i18n";

const BEDS = ["<10", "10-29", "30-49", "50-100", "100+"];
const CLAIMS = ["<15", "15-40", "40-100", "100+", "not_sure"];
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

type Fields = {
  fullName: string; hospitalName: string; role: string; email: string; phone: string;
  city: string; state: string; bedCapacity: string; monthlyClaims: string; consent: boolean; website: string;
};
const EMPTY: Fields = {
  fullName: "", hospitalName: "", role: "", email: "", phone: "", city: "", state: "",
  bedCapacity: "", monthlyClaims: "", consent: false, website: "",
};

type Status = "idle" | "submitting" | "created" | "duplicate";

export default function SignupForm({ lang }: { lang: Lang }) {
  const t = formCopy[lang];
  const [f, setF] = useState<Fields>(EMPTY);
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const email = (e as CustomEvent<string>).detail;
      if (typeof email === "string") setF((prev) => ({ ...prev, email: email.slice(0, 254) }));
    };
    window.addEventListener("vd:prefill", onPrefill);
    return () => window.removeEventListener("vd:prefill", onPrefill);
  }, []);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const startedAt = useRef<number>(0);
  const inFlight = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function set<K extends keyof Fields>(k: K, v: Fields[K]) {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof Fields, string>> = {};
    const req: (keyof Fields)[] = ["fullName", "hospitalName", "role", "email", "phone", "city", "state", "bedCapacity", "monthlyClaims"];
    for (const k of req) if (!String(f[k]).trim()) e[k] = t.errors.required;
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t.errors.email;
    const digits = f.phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    if (f.phone && !/^[6-9]\d{9}$/.test(digits)) e.phone = t.errors.phone;
    if (!f.consent) e.consent = t.errors.consent;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (inFlight.current || status === "submitting") return; // duplicate-submission guard
    setServerError("");
    if (!validate()) return;
    inFlight.current = true;
    setStatus("submitting");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, language: lang, startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus(data.status === "duplicate" ? "duplicate" : "created");
        return;
      }
      if (data.fields) {
        const map: Partial<Record<keyof Fields, string>> = {};
        for (const k of Object.keys(data.fields) as (keyof Fields)[]) map[k] = t.errors.required;
        if (data.fields.email) map.email = t.errors.email;
        if (data.fields.phone) map.phone = t.errors.phone;
        setErrors(map);
      }
      setServerError(data.message || t.errors.generic);
      setStatus("idle");
    } catch {
      setServerError(t.errors.generic);
      setStatus("idle");
    } finally {
      inFlight.current = false;
    }
  }

  if (status === "created" || status === "duplicate") {
    return (
      <div className="form-card success" role="status" aria-live="polite">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h3>{status === "created" ? t.successH : t.dupH}</h3>
        <p>{status === "created" ? t.successP : t.dupP}</p>
      </div>
    );
  }

  const err = (k: keyof Fields) =>
    errors[k] ? <span className="field-error" id={`${k}-err`}>{errors[k]}</span> : null;
  const aria = (k: keyof Fields) => ({ "aria-invalid": Boolean(errors[k]), "aria-describedby": errors[k] ? `${k}-err` : undefined });
  const busy = status === "submitting";

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <h3>{t.title}</h3>
      <p className="form-sub">{t.sub}</p>

      <div className="grid2">
        <label>{t.fullName}<input autoComplete="name" value={f.fullName} onChange={(e) => set("fullName", e.target.value)} maxLength={120} {...aria("fullName")} />{err("fullName")}</label>
        <label>{t.role}<input placeholder={t.rolePh} value={f.role} onChange={(e) => set("role", e.target.value)} maxLength={80} {...aria("role")} />{err("role")}</label>
      </div>
      <label>{t.hospitalName}<input autoComplete="organization" value={f.hospitalName} onChange={(e) => set("hospitalName", e.target.value)} maxLength={160} {...aria("hospitalName")} />{err("hospitalName")}</label>
      <div className="grid2">
        <label>{t.email}<input type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => set("email", e.target.value)} maxLength={254} {...aria("email")} />{err("email")}</label>
        <label>{t.phone}
          <span className="phone-wrap"><span className="prefix">+91</span>
            <input type="tel" autoComplete="tel-national" inputMode="numeric" value={f.phone} onChange={(e) => set("phone", e.target.value)} maxLength={14} {...aria("phone")} />
          </span>{err("phone")}
        </label>
      </div>
      <div className="grid2">
        <label>{t.city}<input autoComplete="address-level2" value={f.city} onChange={(e) => set("city", e.target.value)} maxLength={80} {...aria("city")} />{err("city")}</label>
        <label>{t.state}
          <select value={f.state} onChange={(e) => set("state", e.target.value)} {...aria("state")}>
            <option value="">{t.select}</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>{err("state")}
        </label>
      </div>
      <div className="grid2">
        <label>{t.beds}
          <select value={f.bedCapacity} onChange={(e) => set("bedCapacity", e.target.value)} {...aria("bedCapacity")}>
            <option value="">{t.select}</option>
            {BEDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>{err("bedCapacity")}
        </label>
        <label>{t.claims}
          <select value={f.monthlyClaims} onChange={(e) => set("monthlyClaims", e.target.value)} {...aria("monthlyClaims")}>
            <option value="">{t.select}</option>
            {CLAIMS.map((c) => <option key={c} value={c}>{c === "not_sure" ? t.notSure : c}</option>)}
          </select>{err("monthlyClaims")}
        </label>
      </div>

      {/* Honeypot: hidden from people, filled by bots */}
      <div className="hp" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} /></label>
      </div>

      <label className="consent">
        <input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} {...aria("consent")} />
        <span>{t.consent} <a href="/privacy" target="_blank" rel="noopener">{t.privacy}</a>.</span>
      </label>
      {err("consent")}

      {serverError && <p className="server-error" role="alert">{serverError}</p>}

      <button type="submit" className="btn primary full" disabled={busy} aria-busy={busy}>
        {busy ? <><span className="spinner" aria-hidden="true" /> {t.submitting}</> : t.submit}
      </button>
    </form>
  );
}
