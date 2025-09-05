import React, { useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createI18n } from "./i18n.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import ExportSection from "./components/ExportSection.jsx";
import Step2Preview from "./components/Step2Preview.jsx";
import Privacy from "./components/Privacy.jsx";
import Trust from "./components/Trust.jsx";
import Footer from "./components/Footer.jsx";
import UploadModal from "./components/UploadModal.jsx";
import Insight from "./Insight.jsx";

export default function App(){
  const i18n = useMemo(()=>createI18n(), []);
  const [, force] = useState(0);
  const setLang = (l)=>{ i18n.setLang(l); force(x=>x+1); };

  const [open, setOpen] = useState(false);
  const onOpen = ()=> setOpen(true);
  const onClose = ()=> setOpen(false);

  const t = (k, arg) => i18n.t(k, arg);

  console.log("open", open)

  return (
    <Router>
      <Routes>
        <Route path="/mirror/insights/:uuid" element={<Insight />} />
        <Route path="/mirror" element={<Navigate to="/" replace />} />
        <Route path="/" element={
          <>
            <Nav t={t} lang={i18n.lang} setLang={setLang} onOpen={onOpen} />
            <Hero t={t} onOpen={onOpen} />
            <ExportSection t={t} />
            <Step2Preview t={t} onOpen={onOpen} />
            <Privacy t={t} />
            <Trust t={t} />
            <Footer t={t} />
            <UploadModal t={t} open={open} onClose={onClose} i18n={i18n} />
          </>
        } />
      </Routes>
    </Router>
  );
}
