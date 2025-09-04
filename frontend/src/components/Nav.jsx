import React from "react";

export default function Nav({ t, lang, setLang, onOpen, onKeypairManagerOpen }) {
  return (
    <header className="nav" role="navigation" aria-label="Main">
      <div className="nav__in">
        <div className="brand">MIRROR</div>
        <nav className="nav__links">
          <a href="#export">{t("nav.export")}</a>
          <a href="#privacy">{t("nav.privacy")}</a>
          <a href="#trust">{t("nav.trust")}</a>
          <a href={import.meta.env.VITE_GITHUB_URL || "https://github.com"} target="_blank" rel="noopener noreferrer">
            {t("nav.github")}
          </a>
          <div className="lang-switch" role="group" aria-label="Смена языка">
            <button className={`btn ${lang==='ru'?'btn--primary':'btn--secondary'}`} onClick={()=>setLang('ru')}>RU</button>
            <button className={`btn ${lang==='en'?'btn--primary':'btn--secondary'}`} onClick={()=>setLang('en')}>EN</button>
          </div>
          <button className="btn btn--secondary" onClick={onKeypairManagerOpen}>
            🔑 Ключи
          </button>
          <button className="btn btn--primary" onClick={onOpen}>
            {t("nav.cta")}
          </button>
        </nav>
      </div>
    </header>
  );
}
