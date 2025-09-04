import React from "react";
import { config, getUiAssetUrl } from "../config.js";

export default function Trust({ t }) {
  return (
    <section id="trust" className="section section--soft" aria-labelledby="trust-title">
      <div className="container-wide">
        <div style={{textAlign:"center",marginBottom:48}}>
          <h2 id="trust-title" className="h2">{t('trust.title')}</h2>
          <p className="sub" style={{maxWidth:600,margin:"0 auto"}}>{t('trust.sub')}</p>
        </div>

        <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",marginBottom:56}}>
          <a className="btn btn--primary" href={config.githubUrl} target="_blank" rel="noopener noreferrer" style={{padding:"16px 24px",fontSize:16}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:8}}>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            {t('trust.github')}
          </a>
        </div>

        <div style={{display:"grid",gap:32,gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",maxWidth:800,margin:"0 auto"}}>
          {[
            {name:"Alexander Chisler", img:getUiAssetUrl("founder-alexander.jpg"), cap:t('founder1.caption'), link:"https://www.linkedin.com/in/alexander-chisler/"},
            {name:"Sergey Ibragimov", img:getUiAssetUrl("founder-sergey.jpg"), cap:t('founder2.caption'), link:"https://www.linkedin.com/in/sergei-ibragimov-724227aa/?originalSubdomain=ru"},
          ].map((p)=>(
            <div key={p.name}
              style={{
                background:"linear-gradient(135deg,#fff 0%,#f8fafc 100%)",
                borderRadius:"var(--radius-xl)",padding:32,textAlign:"center",
                boxShadow:"var(--shadow-2)",border:"1px solid rgba(0,0,0,0.05)",
                transition:"transform .2s ease,box-shadow .2s ease"
              }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-3)';}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-2)';}}
            >
              <div style={{width:100,height:100,borderRadius:"50%",background:"linear-gradient(135deg,var(--brand),var(--brand-2))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:"var(--shadow-2)"}}>
                <img src={p.img} alt={p.name} onError={(e)=>{e.currentTarget.style.display='none'}} style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",border:"3px solid #fff"}}/>
              </div>
              <div style={{fontWeight:800,fontSize:20,marginBottom:8,color:"var(--ink)"}}>{p.name}</div>
              <div className="caption" style={{marginBottom:20}}>{p.cap}</div>
              <a className="btn" href={p.link} target="_blank" rel="noopener noreferrer" style={{background:"var(--bg-soft)",border:"1px solid var(--line)",color:"var(--ink)",fontWeight:700,padding:"12px 20px"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:6}}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
