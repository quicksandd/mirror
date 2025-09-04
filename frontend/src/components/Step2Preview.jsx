import React from "react";

export default function Step2Preview({ t, onOpen }) {
  return (
    <section className="section container-wide" aria-labelledby="upload-title">
      <h2 id="upload-title" className="h2">{t('step2.title')}</h2>
      <div className="preview" role="region" aria-label="Preview example">
        <div className="preview__title">{t('preview.title')}</div>
        <div className="authors">
          <label className="a"><input type="checkbox" defaultChecked disabled /> Alex <span>2 413 сообщений</span></label>
          <label className="a"><input type="checkbox" defaultChecked disabled /> Marina <span>1 102 сообщений</span></label>
          <label className="a"><input type="checkbox" disabled /> Work Chat <span>684 сообщений</span></label>
          <label className="a"><input type="checkbox" disabled /> Notes to self <span>219 сообщений</span></label>
        </div>
        <div className="sub">{t('preview.sub')}</div>
        <div className="preview-actions">
          <button className="btn btn--primary" onClick={onOpen}>{t('preview.upload')}</button>
          <a className="btn btn--secondary" href="#privacy">{t('preview.privacy')}</a>
        </div>
      </div>
    </section>
  );
}
