import React from "react";
export default function Footer({ t }) {
  return (
    <footer className="container">
      <div>{t('footer')}</div>
    </footer>
  );
}
