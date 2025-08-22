import React from "react";

function Row({ title, text }) {
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
      <div style={{
        width:24,height:24,borderRadius:"50%",
        background:"linear-gradient(135deg,var(--ok),var(--ok-2))",
        display:"grid",placeItems:"center",flexShrink:0,marginTop:2
      }}>
        <span style={{color:"#fff",fontSize:12,fontWeight:800}}>✓</span>
      </div>
      <div>
        <div style={{fontWeight:800,color:"var(--ink)",marginBottom:4}} dangerouslySetInnerHTML={{__html:title}} />
        <div style={{color:"var(--sub)",lineHeight:1.5}}>{text}</div>
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
