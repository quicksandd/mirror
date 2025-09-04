import React from "react";

function Row({ title, text }) {
  return (
    <div className="privacy-row">
      <div className="privacy-icon">
        <span>✓</span>
      </div>
      <div className="privacy-content">
        <div className="privacy-title" dangerouslySetInnerHTML={{__html:title}} />
        <div className="privacy-text">{text}</div>
      </div>
    </div>
  );
}

export default function Privacy({ t }) {
  return (
    <section id="privacy" className="section" aria-labelledby="privacy-title">
      <div className="container-wide">
        <h2 id="privacy-title" className="h2">{t('privacy.title')}</h2>
        <div style={{display:"grid",gap:20}}>
          <Row title={t('privacy.1.title')} text={t('privacy.1.text')} />
          <Row title={t('privacy.2.title')} text={t('privacy.2.text')} />
          <Row title={t('privacy.3.title')} text={t('privacy.3.text')} />
        </div>
      </div>
    </section>
  );
}
