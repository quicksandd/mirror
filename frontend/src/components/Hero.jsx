import React from "react";
import { config, getUiAssetUrl } from "../config.js";

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
                        <img id="hero-chat-img" src={getUiAssetUrl("MessagesExample.png")} alt={t("hero.chat.alt")} />
                    </div>
                    
                    {/* Arrow 1: From chat to middle */}
                    <div className="arrow-container arrow-1">
                        <div className="arrow-line"></div>
                        <div className="arrow-text">{t("hero.arrow1")}</div>
                        <div className="arrow-head"></div>
                    </div>
                    
                    {/* Arrow 2: From middle to wiki */}
                    <div className="arrow-container arrow-2">
                        <div className="arrow-line"></div>
                        <div className="arrow-text">{t("hero.arrow2")}</div>
                        <div className="arrow-head"></div>
                    </div>
                    
                    <img className="wikishot" id="hero-wiki-img" src={getUiAssetUrl("WikiExampleEng.png")} alt={t("hero.wiki.alt")} />
                </div>
            </div>
        </section>
    );
}
