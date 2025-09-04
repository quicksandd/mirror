import React, { useState } from "react";
import { getUiAssetUrl } from "../config.js";

function WhatsAppPanel({ t }) {
  return (
    <section id="panel-wa" className="panel" role="tabpanel" aria-labelledby="tab-wa">
      <div className="phones-grid">
        {[1,2,3].map((n)=>(
          <div className="step" key={n}>
            <div className="phone">
              <img src={getUiAssetUrl(`Instruction${n}.png`)} alt={t(`wa.s${n}.alt`)} loading="lazy" />
            </div>
            <div className="step-content">
              <div className="badge">{n}</div>
              <div>
                <div className="step-title" dangerouslySetInnerHTML={{__html: t(`wa.s${n}.title`)}} />
                <div className="step-note">{t(`wa.s${n}.note`)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TelegramPanel({ t }) {
  return (
    <section id="panel-tg" className="panel" role="tabpanel" aria-labelledby="tab-tg">
      <div className="tg-grid">
        <div className="steps-list">
          {[1,2,3,4].map((n)=>(
            <div className="step" key={n}>
              <div className="step-content">
                <div className="badge">{n}</div>
                <div>
                  <div className="step-title" dangerouslySetInnerHTML={{__html: t(`tg.s${n}.title`)}} />
                  <div className="step-note" dangerouslySetInnerHTML={{__html: t(`tg.s${n}.note`)}} />
                </div>
              </div>
            </div>
          ))}
          <div className="card" style={{background:"#fff", border:"1px solid var(--line)", textAlign:"left"}}>
            <div className="step-title" style={{marginBottom:6}}>{t('tg.official.title')}</div>
            <div className="step-note" dangerouslySetInnerHTML={{__html: t('tg.official.note')}} />
          </div>
        </div>
        <div className="tg-video">
          <video src="https://telegram.org/resources/video/ExDataBlog.mp4" controls playsInline />
          <div className="tg-video__caption">{t('tg.video.caption')}</div>
        </div>
      </div>
    </section>
  );
}

export default function ExportSection({ t }) {
  const [active, setActive] = useState(localStorage.getItem("mirror-platform") || "wa");
  const setTab = (id) => {
    setActive(id);
    try { localStorage.setItem("mirror-platform", id); } catch {}
  };

  return (
    <section id="export" className="export-pro section section--soft" aria-labelledby="export-title">
      <div className="container-wide">
        <header className="export-head">
          <div>
            <h2 id="export-title" className="h2">{t("export.title")}</h2>
            <p className="sub">{t("export.sub")}</p>
          </div>
        </header>

        <div className="tabs" role="tablist" aria-label={t("tabs.aria")}>
          <button
            id="tab-wa"
            className={`tab ${active==='wa'?'is-active':''}`}
            role="tab" aria-selected={active==='wa'}
            aria-controls="panel-wa"
            onClick={()=>setTab("wa")}
          >
            {t("tabs.wa")}
          </button>
          <button
            id="tab-tg"
            className={`tab ${active==='tg'?'is-active':''}`}
            role="tab" aria-selected={active==='tg'}
            aria-controls="panel-tg"
            onClick={()=>setTab("tg")}
          >
            {t("tabs.tg")}
          </button>
        </div>

        {active==='wa' ? <WhatsAppPanel t={t}/> : <TelegramPanel t={t}/>}
      </div>
    </section>
  );
}
