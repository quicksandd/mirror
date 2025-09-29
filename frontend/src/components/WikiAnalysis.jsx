
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { cleanListItems } from '../utils/cleanListItems.js'
import { useTOCHighlight } from '../hooks/useTOCHighlight.js'
import { createI18n } from '../i18n.js'

/**
 * Props:
 *  - status: 'processing' | 'error' | 'completed'
 *  - errorMessage?: string
 *  - analysis: { person_name?: string, created_at?: string|Date }
 *  - uuid: string
 *  - insights?: object (see code for fields)
 *  - decryptAnalysis?: (password: string) => Promise<any>
 */
export default function WikiAnalysis({
  status='completed',
  errorMessage='',
  analysis={},
  uuid='',
  insights=null,
  decryptAnalysis
}){
  const i18n = createI18n()
  const [decryptOpen, setDecryptOpen] = useState(false)
  const decryptRef = useRef(null)

  const personName = analysis?.person_name || i18n.t('wiki.subject.default')
  const createdAt = useMemo(()=>{
    const d = analysis?.created_at ? new Date(analysis.created_at) : null
    return d && !isNaN(d) ? d : null
  }, [analysis?.created_at])

  useEffect(()=>{
    // Smooth scrolling for internal links
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'))
    const onClick = (e)=>{
      const href = e.currentTarget.getAttribute('href')
      if (!href) return
      const el = document.querySelector(href)
      if (el){
        e.preventDefault()
        el.scrollIntoView({behavior:'smooth', block:'start'})
      }
    }
    anchors.forEach(a=>a.addEventListener('click', onClick))
    return ()=>anchors.forEach(a=>a.removeEventListener('click', onClick))
  }, [])

  // Highlight the current section in the left TOC
  useTOCHighlight('.wiki-tools')

  // Clean up list items on mount and after short delays (to match original logic)
  useEffect(()=>{
    cleanListItems()
    const t1 = setTimeout(cleanListItems, 100)
    const t2 = setTimeout(cleanListItems, 500)
    const t3 = setTimeout(cleanListItems, 1000)
    return ()=>{ clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  function openDecryptModal(){
    setDecryptOpen(true)
    const dialog = decryptRef.current
    if (dialog){
      if (dialog.showModal) dialog.showModal()
      else dialog.setAttribute('open', '')
    }
  }

  function closeDecryptModal(){
    setDecryptOpen(false)
    const dialog = decryptRef.current
    if (dialog){
      if (dialog.close) dialog.close()
      else dialog.removeAttribute('open')
    }
  }

  async function decryptData(){
    const input = document.getElementById('decryptPassword')
    const password = input?.value || ''
    if (!decryptAnalysis){
      alert('Функция расшифровки не настроена. Передайте проп decryptAnalysis.')
      return
    }
    try{
      const data = await decryptAnalysis(password)
      displayDecryptedData(data)
      closeDecryptModal()
    } catch(err){
      console.error(err)
      alert('Ошибка расшифровки')
    }
  }

  function displayDecryptedData(analysisData) {
    console.log('Расшифрованные данные анализа:', analysisData)
    let message = 'Данные успешно расшифрованы!\\n\\n'
    message += 'Имя: ' + (analysisData?.person_name || 'Не указано') + '\\n'
    message += 'Количество сообщений: ' + (analysisData?.chat ? analysisData.chat.length : 0) + '\\n'
    message += 'Сохранять данные: ' + (analysisData?.retain ? 'Да' : 'Нет') + '\\n\\n'
    message += 'Подробности в консоли браузера (F12)'
    alert(message)
  }

  function downloadInsights(){
    try{
      cleanListItems()
      const name = personName || 'anonymous'
      let content = `${personName} — ${i18n.lang === 'ru' ? 'Википедия' : 'Wikipedia'}\\n`
      content += '='.repeat(80) + '\\n\\n'
      content += i18n.t('wiki.export.title') + '\\n'
      content += i18n.t('wiki.export.date') + ' ' + new Date().toLocaleDateString(i18n.lang === 'ru' ? 'ru-RU' : 'en-US') + '\\n'
      content += 'UUID: ' + (uuid||'') + '\\n\\n'

      if (insights){
        if (insights.processing_type === 'timeline'){
          content += i18n.t('wiki.export.timeline.title') + '\\n'
          content += i18n.t('wiki.export.totalMessages') + ' ' + (insights.total_messages ?? '') + '\\n'
          content += i18n.t('wiki.export.periodsCount') + ' ' + (insights.number_of_periods ?? '') + '\\n\\n'

          content += i18n.t('wiki.export.portrait.title') + '\\n'
          content += '='.repeat(50) + '\\n\\n'

          content += i18n.t('wiki.export.characteristics.title') + '\\n'
          content += (insights.main_characteristics || '') + '\\n\\n'

          content += i18n.t('wiki.export.communication.title') + '\\n'
          content += (insights.communication_style || '') + '\\n\\n'

          content += i18n.t('wiki.export.relationships.title') + '\\n'
          content += (insights.relationship_patterns || '') + '\\n\\n'

          content += i18n.t('wiki.export.traits.title') + '\\n'
          ;(insights.personality_traits || []).forEach(t=>{ content += `• ${t}\\n` })
          content += '\\n'

          content += i18n.t('wiki.export.growth.title') + '\\n'
          ;(insights.growth_areas || []).forEach(a=>{ content += `• ${a}\\n` })
          content += '\\n'

          content += i18n.t('wiki.export.recommendations.title') + '\\n'
          ;(insights.recommendations || []).forEach(r=>{ content += `• ${r}\\n` })
          content += '\\n'

          content += '\\n' + i18n.t('wiki.export.evolution.title') + '\\n'
          content += '='.repeat(50) + '\\n\\n'

          content += i18n.t('wiki.export.evolution.general.title') + '\\n'
          content += (insights.overall_personality_evolution || '') + '\\n\\n'

          content += i18n.t('wiki.export.evolution.key.title') + '\\n'
          ;(insights.key_transformation_points || []).forEach(t=>{ content += `• ${t}\\n` })
          content += '\\n'

          content += 'АНАЛИЗ ПО ВРЕМЕННЫМ ПЕРИОДАМ\\n'
          ;(insights.timeline_periods || []).forEach(period=>{
            content += `\\n${period.period_name} (${period.start_date} - ${period.end_date})\\n`
            content += `Личность в этот период: ${period.personality_during_period}\\n`
            content += `Эмоциональное состояние: ${period.emotional_state}\\n`
            content += 'Ключевые события:\\n'
            ;(period.key_events || []).forEach(e=>{ content += `  • ${e}\\n` })
            content += 'Паттерны общения:\\n'
            ;(period.communication_patterns || []).forEach(p=>{ content += `  • ${p}\\n` })
            content += `Развитие или регресс: ${period.growth_or_regression}\\n`
          })
          content += '\\n'

          content += 'ПРОГНОЗЫ НА БУДУЩЕЕ\\n'
          ;(insights.future_predictions || []).forEach(p=>{ content += `• ${p}\\n` })
          content += '\\n'
        } else {
          content += i18n.t('wiki.export.standard.title') + '\\n'
          content += '='.repeat(50) + '\\n\\n'
          content += i18n.t('wiki.export.standard.characteristics') + '\\n'
          content += (insights.personality || '') + '\\n\\n'
          content += i18n.t('wiki.export.standard.traits') + '\\n'
          ;(insights.personality_traits || []).forEach(t=>{ content += `• ${t}\\n` })
          content += '\\n'
          content += i18n.t('wiki.export.standard.communication') + '\\n'
          content += (insights.communication_style || '') + '\\n\\n'
          content += i18n.t('wiki.export.standard.relationships') + '\\n'
          content += (insights.relationship_patterns || '') + '\\n\\n'
          content += i18n.t('wiki.export.standard.patterns') + '\\n'
          ;(insights.main_patterns || []).forEach(p=>{ content += `• ${p}\\n` })
          content += '\\n'
          content += i18n.t('wiki.export.standard.growth') + '\\n'
          ;(insights.growth_areas || []).forEach(a=>{ content += `• ${a}\\n` })
          content += '\\n'
          content += i18n.t('wiki.export.standard.recommendations') + '\\n'
          ;(insights.recommendations || []).forEach(r=>{ content += `• ${r}\\n` })
          content += '\\n'
        }
      }

      content += '='.repeat(80) + '\\n'
      content += i18n.t('wiki.export.footer') + '\\n'

      const blob = new Blob([content], {type: 'text/plain;charset=utf-8'})
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name.replace(/\\s+/g, '_').toLowerCase() + '_wiki_analysis.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch(err){
      console.error('Error downloading insights:', err)
      alert(i18n.lang === 'ru' ? 'Ошибка при скачивании файла' : 'Error downloading file')
    }
  }

  // Auto-refresh if still processing (kept as no-op hint; app-level can handle)
  useEffect(()=>{
    if (status === 'processing'){
      const t = setTimeout(()=>{ /* hook up to your data fetching */ }, 10000)
      return ()=>clearTimeout(t)
    }
  }, [status])

  return (
    <div>
      {/* Header */}
      <div className="wiki-header">
        <div className="wiki-nav">
          <a href="/">{i18n.t('wiki.nav.back')}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); window.print()}}>{i18n.t('wiki.nav.print')}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); downloadInsights()}}>{i18n.t('wiki.nav.download')}</a>
        </div>
      </div>

      <div className="wiki-container">
        {/* Sidebar */}
        <div className="wiki-sidebar">
          <div className="wiki-tools">
            <h3>{i18n.t('wiki.toc.title')}</h3>
            <ul>
              {insights?.processing_type === 'timeline' ? (
                <>
                  <li><a href="#psychological-profile">{i18n.t('wiki.toc.psychological')}</a></li>
                  <ul>
                    <li><a href="#traits">{i18n.t('wiki.toc.traits')}</a></li>
                    <li><a href="#communication">{i18n.t('wiki.toc.communication')}</a></li>
                    <li><a href="#relationships">{i18n.t('wiki.toc.relationships')}</a></li>
                    <li><a href="#patterns">{i18n.t('wiki.toc.patterns')}</a></li>
                  </ul>
                  <li><a href="#evolution-timeline">{i18n.t('wiki.toc.evolution')}</a></li>
                  <ul>
                    <li><a href="#personality-evolution">Общие изменения</a></li>
                    <li><a href="#key-transformations">Важные перемены</a></li>
                    <li><a href="#timeline-periods">По периодам</a></li>
                    <ul>
                      {(insights?.timeline_periods||[]).map((p, i)=>(
                        <li key={i}><a href={`#period-${i+1}`}>{p.period_name}</a></li>
                      ))}
                    </ul>
                    <li><a href="#future-predictions">Что ждет в будущем</a></li>
                  </ul>
                  <li><a href="#practical-implications">{i18n.t('wiki.toc.practical')}</a></li>
                  <ul>
                    <li><a href="#growth">{i18n.t('wiki.toc.growth')}</a></li>
                    <li><a href="#recommendations">{i18n.t('wiki.toc.advice')}</a></li>
                  </ul>
                </>
              ) : (
                <>
                  <li><a href="#psychological-profile">{i18n.t('wiki.toc.psychological')}</a></li>
                  <ul>
                    <li><a href="#traits">{i18n.t('wiki.toc.traits')}</a></li>
                    <li><a href="#communication">{i18n.t('wiki.toc.communication')}</a></li>
                    <li><a href="#relationships">{i18n.t('wiki.toc.relationships')}</a></li>
                    <li><a href="#patterns">{i18n.t('wiki.toc.patterns')}</a></li>
                  </ul>
                  <li><a href="#practical-implications">{i18n.t('wiki.toc.practical')}</a></li>
                  <ul>
                    <li><a href="#growth">{i18n.t('wiki.toc.growth')}</a></li>
                    <li><a href="#recommendations">{i18n.t('wiki.toc.advice')}</a></li>
                  </ul>
                </>
              )}
            </ul>
          </div>

          <div className="wiki-tools">
            <h3>{i18n.t('wiki.toc.tools')}</h3>
            <ul>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); downloadInsights()}}>{i18n.t('wiki.toc.export')}</a></li>
              <li><a href="/">{i18n.t('wiki.nav.new')}</a></li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="wiki-content">
          {status === 'processing' && (
            <div className="wiki-processing">
              <div className="processing-header">
                <h1 className="wiki-title">{i18n.t('wiki.processing.title')}</h1>
                <div className="wiki-subtitle">{i18n.t('wiki.processing.subtitle')}</div>
              </div>
              
              <div className="processing-content">
                <div className="processing-info">
                  <div className="processing-icon"></div>
                  <div className="processing-text">
                    <h2>{i18n.t('wiki.processing.status')}</h2>
                    <p>{i18n.t('wiki.processing.description')}</p>
                    
                    <div className="processing-steps">
                      <h3>{i18n.t('wiki.processing.steps.title')}</h3>
                      <ol>
                        <li><strong>{i18n.t('wiki.processing.step1')}</strong></li>
                        <li><strong>{i18n.t('wiki.processing.step2')}</strong></li>
                        <li><strong>{i18n.t('wiki.processing.step3')}</strong></li>
                        <li><strong>{i18n.t('wiki.processing.step4')}</strong></li>
                        <li><strong>{i18n.t('wiki.processing.step5')}</strong></li>
                      </ol>
                    </div>
                    
                    <div className="processing-note">
                      <p><strong>{i18n.t('wiki.processing.note')}</strong></p>
                    </div>
                  </div>
                </div>
                
                <div className="processing-status">
                  <div className="status-indicator">
                    <div className="status-dot"></div>
                    <span>{i18n.t('wiki.processing.active')}</span>
                  </div>
                  <div className="refresh-hint">
                    <p>{i18n.t('wiki.processing.refresh')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mw-message-box mw-message-box-error">
              <strong>{i18n.t('wiki.error.title')}</strong><br/>
              {errorMessage}
            </div>
          )}

          {status === 'completed' && insights && (
            <>
              <h1 className="wiki-title">{personName}</h1>
              <div className="wiki-subtitle">{i18n.t('wiki.completed.subtitle')}</div>

              {/* Infobox */}
              <div className="infobox">
                <div className="infobox-title">{i18n.t('wiki.infobox.title')}</div>
                <div className="infobox-content">
                  <div className="infobox-row">
                    <div className="infobox-label">{i18n.t('wiki.infobox.subject')}</div>
                    <div className="infobox-value">{personName || i18n.t('wiki.infobox.notSpecified')}</div>
                  </div>
                  <div className="infobox-row">
                    <div className="infobox-label">{i18n.t('wiki.infobox.date')}</div>
                    <div className="infobox-value">
                      {createdAt ? createdAt.toLocaleDateString(i18n.lang === 'ru' ? 'ru-RU' : 'en-US') : i18n.t('wiki.infobox.notSpecifiedDate')}
                    </div>
                  </div>
                  <div className="infobox-row">
                    <div className="infobox-label">{i18n.t('wiki.infobox.id')}</div>
                    <div className="infobox-value" style={{fontFamily:'monospace', fontSize:'0.8em'}}>{uuid}</div>
                  </div>
                  <div className="infobox-row">
                    <div className="infobox-label">{i18n.t('wiki.infobox.status')}</div>
                    <div className="infobox-value">{i18n.t('wiki.infobox.status.completed')}</div>
                  </div>

                  {insights?.processing_type === 'timeline' && (
                    <>
                      <div className="infobox-row">
                        <div className="infobox-label">{i18n.t('wiki.infobox.methodology')}</div>
                        <div className="infobox-value">{i18n.t('wiki.infobox.methodology.timeline')}</div>
                      </div>
                      <div className="infobox-row">
                        <div className="infobox-label">{i18n.t('wiki.infobox.dataVolume')}</div>
                        <div className="infobox-value">{insights.total_messages} {i18n.t('wiki.infobox.messages')}</div>
                      </div>
                      <div className="infobox-row">
                        <div className="infobox-label">{i18n.t('wiki.infobox.periods')}</div>
                        <div className="infobox-value">{insights.number_of_periods}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {insights?.processing_type === 'timeline' && (
                <div className="wiki-notice" style={{margin: '1em 0'}}>
                  <strong>{i18n.t('wiki.notice.timeline.title')}</strong> {i18n.t('wiki.notice.timeline.desc').replace('{total}', insights.total_messages).replace('{periods}', insights.number_of_periods)}
                </div>
              )}

              {/* Article content */}
              <div className="wiki-section">
                {insights?.processing_type === 'timeline' ? (
                  <>
                    <p><strong>{personName || i18n.t('wiki.subject.default')}</strong> — {insights.main_characteristics}</p>

                    <h1 id="psychological-profile">{i18n.t('wiki.section.psychological.title')}</h1>
                    <p>{i18n.t('wiki.section.psychological.desc')}</p>

                    <h2 id="traits">{i18n.t('wiki.section.traits.title')}</h2>
                    <p>{i18n.t('wiki.section.traits.desc')}</p>
                    <ul>
                      {(insights.personality_traits || []).map((t, i)=>(<li key={i}>{t}</li>))}
                    </ul>

                    <h2 id="communication">{i18n.t('wiki.section.communication.title')}</h2>
                    <p>{insights.communication_style}</p>

                    <h2 id="relationships">{i18n.t('wiki.section.relationships.title')}</h2>
                    <p>{insights.relationship_patterns}</p>

                    <h2 id="patterns">{i18n.t('wiki.section.patterns.alt')}</h2>
                    <p>{i18n.t('wiki.section.patterns.desc')}</p>
                    <ul>
                      {(insights.main_patterns || []).map((pattern, i)=>(
                        <li key={i}>{pattern}</li>
                      ))}
                    </ul>

                    <hr className="section-divider" />
                    <h1 id="evolution-timeline">Как меняется со временем</h1>
                    <p>Анализ показывает, как личность развивалась и менялась на протяжении всего периода наблюдения.</p>

                    <h2 id="personality-evolution">Общие изменения</h2>
                    <p>{insights.overall_personality_evolution}</p>

                    <hr className="subsection-divider" />

                    <h2 id="key-transformations">Важные перемены</h2>
                    <p>Ключевые моменты, когда происходили значительные изменения в личности:</p>
                    <ul>
                      {(insights.key_transformation_points || []).map((t, i)=>(
                        <li key={i}>{t}</li>
                      ))}
                    </ul>

                    <hr className="subsection-divider" />

                    <h2 id="timeline-periods">Хронологический анализ по временным периодам</h2>
                    <p>Детальное исследование развития личности, демонстрирующее эволюцию личностных характеристик и поведенческих паттернов во времени:</p>
                    
                    <div className="timeline-container">
                      {(insights.timeline_periods || []).map((period, idx)=>(
                        <div key={idx} className="timeline-period" id={`period-${idx+1}`}>
                          <div className="period-header">
                            <div className="period-number">{idx + 1}</div>
                            <div className="period-title">
                              <h3>{period.period_name}</h3>
                              <div className="period-dates">{period.start_date} — {period.end_date}</div>
                            </div>
                          </div>
                          
                          <div className="period-content">
                            <div className="period-section">
                              <h4>Личностные характеристики периода</h4>
                              <p>{period.personality_during_period}</p>
                            </div>
                            
                            <div className="period-section">
                              <h4>Эмоциональное состояние</h4>
                              <p>{period.emotional_state}</p>
                            </div>
                            
                            <div className="period-section">
                              <h4>Ключевые события</h4>
                              {(period.key_events && period.key_events.length > 0) ? (
                                <ul className="event-list">
                                  {period.key_events.map((e, i)=>(<li key={i}>{e}</li>))}
                                </ul>
                              ) : (
                                <p className="no-data">События не зафиксированы</p>
                              )}
                            </div>
                            
                            <div className="period-section">
                              <h4>Коммуникативные паттерны</h4>
                              {(period.communication_patterns && period.communication_patterns.length > 0) ? (
                                <ul className="pattern-list">
                                  {period.communication_patterns.map((p, i)=>(<li key={i}>{p}</li>))}
                                </ul>
                              ) : (
                                <p className="no-data">Паттерны не выявлены</p>
                              )}
                            </div>
                            
                            <div className="period-section">
                              <h4>Динамика развития</h4>
                              <p>{period.growth_or_regression}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="subsection-divider" />

                    <h2 id="future-predictions">Прогностические выводы</h2>
                    <p>Научно обоснованные предположения о будущем развитии личности, основанные на выявленных поведенческих паттернах и тенденциях:</p>
                    <ul>
                      {(insights.future_predictions || []).map((p, i)=>(
                        <li key={i}>{p}</li>
                      ))}
                    </ul>

                    <hr className="section-divider" />
                    <h1 id="practical-implications">Что с этим делать</h1>
                    <p>Конкретные рекомендации и области для личностного развития, основанные на проведенном психологическом анализе.</p>

                    <h2 id="growth">Зоны роста</h2>
                    <p>Сферы личностного роста, требующие целенаправленного внимания и развития:</p>
                    <ul>
                      {(insights.growth_areas || []).map((a, i)=>(
                        <li key={i}>{a}</li>
                      ))}
                    </ul>

                    <h2 id="recommendations">Рекомендации</h2>
                    <p>Конкретные предложения по личностному развитию, основанные на выявленных психологических особенностях:</p>
                    <ul>
                      {(insights.recommendations || []).map((r, i)=>(
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p><strong>{personName || i18n.t('wiki.subject.default')}</strong> — {insights.personality}</p>

                    <h1 id="psychological-profile">{i18n.t('wiki.section.psychological.title')}</h1>
                    <p>{i18n.t('wiki.section.psychological.desc')}</p>

                    <h2 id="traits">{i18n.t('wiki.section.traits.title')}</h2>
                    <p>{i18n.t('wiki.section.traits.desc')}</p>
                    <ul>{(insights.personality_traits || []).map((t, i)=>(<li key={i}>{t}</li>))}</ul>

                    <h2 id="communication">{i18n.t('wiki.section.communication.alt')}</h2>
                    <p>{insights.communication_style}</p>

                    <h2 id="relationships">{i18n.t('wiki.section.relationships.title')}</h2>
                    <p>{insights.relationship_patterns}</p>

                    <h2 id="patterns">{i18n.t('wiki.section.patterns.title')}</h2>
                    <p>{i18n.t('wiki.section.patterns.desc2')}</p>
                    <ul>
                      {(insights.main_patterns || []).map((pattern, i)=>(
                        <li key={i}>{pattern}</li>
                      ))}
                    </ul>

                    <hr className="section-divider" />
                    <h1 id="practical-implications">{i18n.t('wiki.section.practical.title')}</h1>
                    <p>{i18n.t('wiki.section.practical.desc')}</p>

                    <h2 id="growth">{i18n.t('wiki.section.growth.title')}</h2>
                    <p>{i18n.t('wiki.growth.desc')}</p>
                    <ul>
                      {(insights.growth_areas || []).map((a, i)=>(
                        <li key={i}>{a}</li>
                      ))}
                    </ul>

                    <h2 id="recommendations">{i18n.t('wiki.section.advice.title')}</h2>
                    <p>{i18n.t('wiki.recommendations.desc')}</p>
                    <ul>
                      {(insights.recommendations || []).map((r, i)=>(
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </>
                )}

                <h2>{i18n.t('wiki.methodology.title')}</h2>
                <div className="references">
                  <ol>
                    <li>{i18n.t('wiki.export.methodology.desc1')}</li>
                    <li>{i18n.t('wiki.export.methodology.desc2')}</li>
                    <li>{i18n.t('wiki.export.methodology.desc3')}</li>
                    <li>{i18n.t('wiki.export.methodology.desc4')}</li>
                  </ol>
                </div>

                <h2>{i18n.t('wiki.related.title')}</h2>
                <ul>
                  <li><a href="/">{i18n.t('wiki.export.related.topic1')}</a></li>
                  <li><a href="/mirror/export-guide/">{i18n.t('wiki.export.related.topic2')}</a></li>
                  <li><a href="#">{i18n.t('wiki.export.related.topic3')}</a></li>
                  <li><a href="#">{i18n.t('wiki.export.related.topic4')}</a></li>
                </ul>
              </div>

              <div className="categories">
                <strong>{i18n.t('wiki.categories.title')}</strong>
                <a href="#">{i18n.t('wiki.categories.analysis')}</a>
                <a href="#">{i18n.t('wiki.categories.personality')}</a>
                <a href="#">{i18n.t('wiki.categories.psycholinguistics')}</a>
                <a href="#">{i18n.t('wiki.categories.mirror')}</a>
                <a href="#">{createdAt ? createdAt.getFullYear() : ''}</a>
              </div>
            </>
          )}

          {status !== 'processing' && status !== 'error' && !(status==='completed' && insights) && (
            <div className="mw-message-box mw-message-box-error">
              <strong>{i18n.t('wiki.error.unavailable.title')}</strong><br/>
              {i18n.t('wiki.error.unavailable.desc')}
            </div>
          )}
        </div>
      </div>

      {/* Decrypt Modal */}
      <dialog id="decryptModal" className="modal" ref={decryptRef}>
        <div className="modal-content">
          <div className="modal-body">
            <div style={{marginBottom:20}}>
              <p style={{color:'var(--sub)', marginBottom:16}}>
                Введите пароль для расшифровки и просмотра исходных данных анализа.
              </p>
            </div>
            <div style={{marginBottom:20}}>
              <label htmlFor="decryptPassword" style={{display:'block', fontWeight:800, marginBottom:8}}>Пароль:</label>
              <input type="password" id="decryptPassword" placeholder="Введите ваш пароль" style={{width:'100%', padding:12, border:'1px solid var(--line)', borderRadius:'12px', fontSize:16}} />
            </div>
            <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
              <button className="btn" onClick={closeDecryptModal}>Отмена</button>
              <button className="btn btn--primary" onClick={decryptData}>Расшифровать</button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  )
}

