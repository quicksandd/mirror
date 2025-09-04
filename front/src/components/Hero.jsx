import React from "react";
import { config } from "../config.js";

export default function Hero({ t, onOpen }) {
    return (
        <section className="hero container" aria-labelledby="hero-title">
            <div className="hero__grid">
                <div>
                    <div className="privacy-note" role="status" aria-live="polite">
                        {t("hero.privacy")}
                    </div>
                    <h1 id="hero-title" className="h1" dangerouslySetInnerHTML={{ __html: t("hero.title") }} />
                    <p className="lead">{t("hero.lead")}</p>
                    <div className="hero__cta">
                        <button className="btn btn--primary" onClick={onOpen}>
                            {t("hero.cta")}
                        </button>
                        <a className="btn" href={config.githubUrl} target="_blank" rel="noopener noreferrer">
                            {t("hero.github")}
                        </a>
                    </div>

                </div>
                <div className="mock" aria-hidden="true">
                    <div className="chatcard">
                        <img id="hero-chat-img" src="/ui/MessagesExample.png" alt={t("hero.chat.alt")} />
                    </div>
                    <img className="wikishot" id="hero-wiki-img" src="/ui/WikiExample.png" alt={t("hero.wiki.alt")} />
                </div>
            </div>
        </section>
    );
}
