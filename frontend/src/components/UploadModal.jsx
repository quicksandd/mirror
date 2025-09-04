import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { WhatsAppParser } from "../utils/WhatsAppParser.js";
import { getApiUrl } from "../config.js";
import {createAndWrapKeypair} from "../utils/crypto.js";
import { saveKeypairToStorage } from "../utils/storage.js";

export default function UploadModal({ t, open, onClose, i18n }) {
  const fileRef = useRef(null);
  const [authors, setAuthors] = useState([]);           // [{ name, count }]
  const [stats, setStats] = useState({});               // name -> {count}
  const [selected, setSelected] = useState(new Set());
  const [data, setData] = useState(null);               // { messages: [...] }
  const [progress, setProgress] = useState({show:false,pct:0,msg:""});
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [password, setPassword] = useState("");         // Password input
  const [passwordConfirm, setPasswordConfirm] = useState(""); // Password confirmation
  const [passwordError, setPasswordError] = useState(""); // Password error message

  useEffect(()=>{ if(!open){ reset(); } }, [open]);

  function reset(){
    setAuthors([]); setStats({}); setSelected(new Set());
    setData(null);
    setProgress({show:false,pct:0,msg:""}); setOk(""); setErr("");
    setPassword(""); setPasswordConfirm(""); setPasswordError("");
  }

  function onPick(){
    fileRef.current?.click();
  }

  function onDrop(e){
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) ingestFile(f);
  }

  async function ingestFile(file){
    setErr(""); setOk("");
    setProgress({show:true,pct:6,msg:t('progress.reading')});
    let txt;
    try{
      if(file.name.toLowerCase().endsWith('.zip')) {
        const buf = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buf);
        const entries = [];
        zip.forEach((p, e)=>{ if(p.toLowerCase().endsWith('.txt')) entries.push(e); });
        if(!entries.length) throw new Error('No .txt found inside .zip');
        txt = await entries[0].async('text');
      } else {
        txt = await file.text();
      }
    }catch(e){
      setErr(t('error.readFile', e.message)); setProgress({show:false}); return;
    }

    const parser = new WhatsAppParser();
    let parsed;
    try{
      if(parser.isWA(txt)) parsed = parser.parse(txt);
      else parsed = JSON.parse(txt);

      // Telegram normalization
      if(parsed && Array.isArray(parsed.messages)){
        for(const m of parsed.messages){
          if(Array.isArray(m.text)) m.text = m.text.map(p => typeof p==='string' ? p : (p.text||'')).join('');
        }
      }
    }catch(e){
      setErr(t('error.parse')); setProgress({show:false}); return;
    }

    setProgress({show:true,pct:40,msg:t('progress.analyzing')});
    const s = {};
    for(const m of (parsed.messages||[])){
      if(!m.from || !m.text) continue;
      const k = m.from;
      s[k] = s[k] || { count:0, id:m.from_id };
      s[k].count++;
    }
    const list = Object.entries(s).sort((a,b)=>b[1].count-a[1].count).map(([name,st])=>({name, count:st.count}));
    setStats(s); setAuthors(list);
    setSelected(new Set(list.map(x=>x.name)));
    setData(parsed);
    setProgress({show:false});
  }

  function toggle(name){
    const next = new Set(selected);
    if(next.has(name)) next.delete(name); else next.add(name);
    setSelected(next);
  }

  const totalSelected = Array.from(selected).reduce((acc,name)=> acc + (stats[name]?.count||0), 0);

  function validatePassword() {
    if (password.length < 6) {
      setPasswordError(i18n.lang === 'ru' ? 'Пароль должен содержать минимум 6 символов' : 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== passwordConfirm) {
      setPasswordError(i18n.lang === 'ru' ? 'Пароли не совпадают' : 'Passwords do not match');
      return false;
    }

    setPasswordError("");
    return true;
  }

  async function analyze(){
    if(!selected.size){ setErr(t('error.selectOne')); return; }
    
    // Validate password before proceeding
    if (!validatePassword()) {
      return;
    }

    const picked = Array.from(selected);
    const filtered = (data.messages||[])
      .filter(m => picked.includes(m.from))
      .map(m => ({ sender:m.from, text:m.text, date:m.date }));

    setProgress({show:true,pct:10,msg:t('progress.preparing')});
    setErr(""); setOk("");

    try{
      console.log('Generating keypair...');
      const keypair = await createAndWrapKeypair(password);
      console.log('Keypair generated:', keypair);

      const res = await fetch(getApiUrl('process'), {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ 
          person_name: picked.join(', '), 
          interview:'', 
          chat: filtered, 
          keypair: keypair // Send the generated keypair instead of password
        })
      });
      const json = await res.json();
      if(json.status === "success"){
        // Сохраняем keypair и uid в localStorage
        saveKeypairToStorage(json.uuid, keypair);
        
        setProgress({show:true,pct:100,msg:t('progress.ready')});
        setOk(`${t('uuid')} ${json.uuid}`);
        setTimeout(()=>{ location.href = json.url; }, 900);
      } else {
        throw new Error(json.message || "Server error");
      }
    }catch(e){
      console.error('Analysis error:', e);
      setErr(t('error.generic', e.message));
    }finally{
      setProgress({show:false,pct:0,msg:""});
    }
  }

  if(!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <dialog open style={{
        padding: 0,
        border: "none", 
        borderRadius: 20,
        maxWidth: 720,
        width: "92vw",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        backgroundColor: "white",
        boxShadow: "0 18px 60px rgba(0,0,0,0.12)"
      }}>
      <div style={{padding:"18px 18px 24px"}}>
        <div style={{textAlign:"center"}}>
          <h3 style={{margin:"10px 0 0",fontSize:24}}>{t('upload.title')}</h3>
          <p className="sub" style={{margin:"0 auto",maxWidth:"46ch"}} dangerouslySetInnerHTML={{__html:t('upload.sub')}} />
        </div>

        <div
          className="drop" tabIndex={0} aria-label={t('drop.aria')}
          style={{marginTop:16}} onClick={onPick}
          onDragEnter={(e)=>{e.preventDefault()}} onDragOver={(e)=>{e.preventDefault()}}
          onDrop={onDrop}
        >
          <div style={{fontSize:40}}>📁</div>
          <h3>{t('drop.title')}</h3>
          <p>{t('drop.sub')}</p>
        </div>

        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginTop:10}}>
          <button className="btn btn--primary" onClick={onPick}>{t('btn.choose')}</button>
          <button className="btn" onClick={onClose}>{t('btn.close')}</button>
        </div>

        <input ref={fileRef} type="file" accept=".json,.txt,.zip" style={{display:"none"}} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) ingestFile(f); }} />

        {!!authors.length && (
          <div style={{marginTop:12}}>
            <div style={{fontWeight:800,marginBottom:6}}>{t('authors.select')}</div>
            <div className="authors">
              {authors.map(a=>(
                <label className="a" key={a.name}>
                  <input type="checkbox" checked={selected.has(a.name)} onChange={()=>toggle(a.name)} />
                  {a.name}
                  <span>{i18n.formatNumber(a.count)} {i18n.lang==='ru'?'сообщений':'messages'}</span>
                </label>
              ))}
            </div>

            {/* Password input section */}
            <div style={{marginTop:10,padding:8,background:"var(--bg-soft, #f8f9fa)",borderRadius:8}}>
              <label style={{display:"flex",flexDirection:"column",gap:6,fontWeight:600,fontSize:14}}>
                <span>{i18n.lang === 'ru' ? 'Введите пароль для защиты ваших данных:' : 'Enter password to protect your data:'}</span>
                <input 
                  type="password" 
                  placeholder={i18n.lang === 'ru' ? 'Введите пароль' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{padding:8,border:"1px solid var(--line, #e5e7eb)",borderRadius:6,fontSize:14}}
                />
                <input 
                  type="password" 
                  placeholder={i18n.lang === 'ru' ? 'Подтвердите пароль' : 'Confirm password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  style={{padding:8,border:"1px solid var(--line, #e5e7eb)",borderRadius:6,fontSize:14}}
                />
                {passwordError && (
                  <div style={{color:"#dc2626",fontSize:12}}>{passwordError}</div>
                )}
              </label>
            </div>

            <button
              className="btn btn--primary"
              style={{width:"100%",marginTop:10}}
              onClick={analyze}
              disabled={!selected.size || !password || !passwordConfirm}
            >
              {selected.size ? (i18n.lang==='ru' ? `Анализировать ${i18n.formatNumber(totalSelected)} сообщений` : `Analyze ${i18n.formatNumber(totalSelected)} messages`)
                             : t('analyze.selected')}
            </button>
          </div>
        )}

        {progress.show && (
          <div style={{display:"grid",gap:8,marginTop:10}} aria-live="polite">
            <div style={{height:8,background:"#eef2f4",borderRadius:999,overflow:"hidden"}}>
              <div style={{width:`${progress.pct}%`,height:"100%",background:"var(--ok-2)",transition:"width .3s ease"}}></div>
            </div>
            <div style={{color:"var(--muted)",textAlign:"center",fontWeight:700}}>{progress.msg}</div>
          </div>
        )}

        {!!ok && (
          <div style={{background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",padding:"10px 12px",borderRadius:12,fontWeight:700,marginTop:10}}>
            {ok}
          </div>
        )}
        {!!err && (
          <div style={{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",padding:"10px 12px",borderRadius:12,fontWeight:700,marginTop:10}}>
            {err}
          </div>
        )}
      </div>
      </dialog>
    </>
  );
}
