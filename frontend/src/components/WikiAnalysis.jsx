
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { cleanListItems } from '../utils/cleanListItems.js'
import { useTOCHighlight } from '../hooks/useTOCHighlight.js'

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
  const [decryptOpen, setDecryptOpen] = useState(false)
  const decryptRef = useRef(null)

  const personName = analysis?.person_name || 'Ваше Зеркало'
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
      let content = `${personName} — Википедия\\n`
      content += '='.repeat(80) + '\\n\\n'
      content += 'ПСИХОЛОГИЧЕСКИЙ АНАЛИЗ\\n'
      content += 'Дата: ' + new Date().toLocaleDateString('ru-RU') + '\\n'
      content += 'UUID: ' + (uuid||'') + '\\n\\n'

      if (insights){
        if (insights.processing_type === 'timeline'){
          content += 'АНАЛИЗ ПО ВРЕМЕННЫМ ПЕРИОДАМ\\n'
          content += 'Всего сообщений: ' + (insights.total_messages ?? '') + '\\n'
          content += 'Количество периодов: ' + (insights.number_of_periods ?? '') + '\\n\\n'

          content += 'ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ\\n'
          content += '='.repeat(50) + '\\n\\n'

          content += 'ОСНОВНЫЕ ХАРАКТЕРИСТИКИ\\n'
          content += (insights.main_characteristics || '') + '\\n\\n'

          content += 'СТИЛЬ ОБЩЕНИЯ\\n'
          content += (insights.communication_style || '') + '\\n\\n'

          content += 'ОТНОШЕНИЯ С ОКРУЖАЮЩИМИ\\n'
          content += (insights.relationship_patterns || '') + '\\n\\n'

          content += 'ЧЕРТЫ ЛИЧНОСТИ\\n'
          ;(insights.personality_traits || []).forEach(t=>{ content += `• ${t}\\n` })
          content += '\\n'

          content += 'ОБЛАСТИ ДЛЯ РОСТА\\n'
          ;(insights.growth_areas || []).forEach(a=>{ content += `• ${a}\\n` })
          content += '\\n'

          content += 'РЕКОМЕНДАЦИИ\\n'
          ;(insights.recommendations || []).forEach(r=>{ content += `• ${r}\\n` })
          content += '\\n'

          content += '\\nЭВОЛЮЦИЯ ЛИЧНОСТИ ВО ВРЕМЕНИ\\n'
          content += '='.repeat(50) + '\\n\\n'

          content += 'ОБЩАЯ ЭВОЛЮЦИЯ ЛИЧНОСТИ\\n'
          content += (insights.overall_personality_evolution || '') + '\\n\\n'

          content += 'КЛЮЧЕВЫЕ МОМЕНТЫ ТРАНСФОРМАЦИИ\\n'
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
          content += 'ПСИХОЛОГИЧЕСКИЙ ПОРТРЕТ\\n'
          content += '='.repeat(50) + '\\n\\n'
          content += 'ОСНОВНЫЕ ХАРАКТЕРИСТИКИ\\n'
          content += (insights.personality || '') + '\\n\\n'
          content += 'ЧЕРТЫ ЛИЧНОСТИ\\n'
          ;(insights.personality_traits || []).forEach(t=>{ content += `• ${t}\\n` })
          content += '\\n'
          content += 'СТИЛЬ ОБЩЕНИЯ\\n'
          content += (insights.communication_style || '') + '\\n\\n'
          content += 'ОТНОШЕНИЯ С ОКРУЖАЮЩИМИ\\n'
          content += (insights.relationship_patterns || '') + '\\n\\n'
          content += 'ПАТТЕРНЫ ПОВЕДЕНИЯ\\n'
          ;(insights.main_patterns || []).forEach(p=>{ content += `• ${p}\\n` })
          content += '\\n'
          content += 'ОБЛАСТИ ДЛЯ РОСТА\\n'
          ;(insights.growth_areas || []).forEach(a=>{ content += `• ${a}\\n` })
          content += '\\n'
          content += 'РЕКОМЕНДАЦИИ\\n'
          ;(insights.recommendations || []).forEach(r=>{ content += `• ${r}\\n` })
          content += '\\n'
        }
      }

      content += '='.repeat(80) + '\\n'
      content += 'Анализ создан системой ЗЕРКАЛО\\n'

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
      alert('Ошибка при скачивании файла')
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
          <a href="/">← Вернуться к ЗЕРКАЛУ</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); window.print()}}>Версия для печати</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); downloadInsights()}}>Скачать</a>
        </div>
      </div>

      <div className="wiki-container">
        {/* Sidebar */}
        <div className="wiki-sidebar">
          <div className="wiki-tools">
            <h3>Навигация</h3>
            <ul>
              {insights?.processing_type === 'timeline' ? (
                <>
                  <li><a href="#psychological-profile">Психологический портрет</a></li>
                  <ul>
                    <li><a href="#traits">Черты личности</a></li>
                    <li><a href="#communication">Стиль общения</a></li>
                    <li><a href="#relationships">Отношения</a></li>
                    <li><a href="#patterns">Паттерны поведения</a></li>
                  </ul>
                  <li><a href="#evolution-timeline">Эволюция личности</a></li>
                  <ul>
                    <li><a href="#personality-evolution">Общая эволюция</a></li>
                    <li><a href="#key-transformations">Ключевые трансформации</a></li>
                    <li><a href="#timeline-periods">Временные периоды</a></li>
                    <ul>
                      {(insights?.timeline_periods||[]).map((p, i)=>(
                        <li key={i}><a href={`#period-${i+1}`}>{p.period_name}</a></li>
                      ))}
                    </ul>
                    <li><a href="#future-predictions">Прогнозы</a></li>
                  </ul>
                  <li><a href="#what-to-do">Что с этим всем делать</a></li>
                  <ul>
                    <li><a href="#growth">Области для роста</a></li>
                    <li><a href="#recommendations">Рекомендации</a></li>
                  </ul>
                </>
              ) : (
                <>
                  <li><a href="#psychological-profile">Психологический портрет</a></li>
                  <ul>
                    <li><a href="#traits">Черты личности</a></li>
                    <li><a href="#communication">Стиль общения</a></li>
                    <li><a href="#relationships">Отношения</a></li>
                  </ul>
                  <li><a href="#patterns">Паттерны поведения</a></li>
                  <li><a href="#what-to-do">Что с этим всем делать</a></li>
                  <ul>
                    <li><a href="#growth">Области для роста</a></li>
                    <li><a href="#recommendations">Рекомендации</a></li>
                  </ul>
                </>
              )}
            </ul>
          </div>

          <div className="wiki-tools">
            <h3>Инструменты</h3>
            <ul>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); downloadInsights()}}>Скачать анализ</a></li>
              <li><a href="#" onClick={(e)=>{e.preventDefault(); openDecryptModal()}}>Расшифровать данные</a></li>
              <li><a href="/">Новый анализ</a></li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="wiki-content">
          {status === 'processing' && (
            <div className="mw-message-box mw-message-box-warning">
              <strong>Обработка данных...</strong><br/>
              Анализ личности в процессе. Это может занять несколько минут. Обновите страницу для проверки статуса.
            </div>
          )}

          {status === 'error' && (
            <div className="mw-message-box mw-message-box-error">
              <strong>Ошибка обработки:</strong><br/>
              {errorMessage}
            </div>
          )}

          {status === 'completed' && insights && (
            <>
              <h1 className="wiki-title">{personName}</h1>
              <div className="wiki-subtitle">Материал из ЗЕРКАЛА, системы психологического анализа</div>

              {/* Infobox */}
              <div className="infobox">
                <div className="infobox-title">Психологический профиль</div>
                <div className="infobox-content">
                  <div className="infobox-row">
                    <div className="infobox-label">Имя:</div>
                    <div className="infobox-value">{personName || 'Неизвестно'}</div>
                  </div>
                  <div className="infobox-row">
                    <div className="infobox-label">Дата анализа:</div>
                    <div className="infobox-value">
                      {createdAt ? createdAt.toLocaleDateString('ru-RU') : '—'}
                    </div>
                  </div>
                  <div className="infobox-row">
                    <div className="infobox-label">UUID:</div>
                    <div className="infobox-value" style={{fontFamily:'monospace', fontSize:'0.8em'}}>{uuid}</div>
                  </div>
                  <div className="infobox-row">
                    <div className="infobox-label">Статус:</div>
                    <div className="infobox-value">Анализ завершён</div>
                  </div>

                  {insights?.processing_type === 'timeline' && (
                    <>
                      <div className="infobox-row">
                        <div className="infobox-label">Тип анализа:</div>
                        <div className="infobox-value">По временным периодам</div>
                      </div>
                      <div className="infobox-row">
                        <div className="infobox-label">Сообщений:</div>
                        <div className="infobox-value">{insights.total_messages}</div>
                      </div>
                      <div className="infobox-row">
                        <div className="infobox-label">Периодов:</div>
                        <div className="infobox-value">{insights.number_of_periods}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {insights?.processing_type === 'timeline' && (
                <div className="wiki-notice" style={{margin: '1em 0'}}>
                  <strong>Анализ по временным периодам:</strong> Данный анализ был создан для большого файла ({insights.total_messages} сообщений) и показывает эволюцию личности по {insights.number_of_periods} временным периодам.
                </div>
              )}

              {/* Article content */}
              <div className="wiki-section">
                {insights?.processing_type === 'timeline' ? (
                  <>
                    <p><strong>{personName || 'Данный субъект'}</strong> — {insights.main_characteristics}</p>

                    <h1 id="psychological-profile">Психологический портрет</h1>

                    <h2 id="traits">Черты личности</h2>
                    <p>Доминирующие характеристики личности включают в себя:</p>
                    <ul>
                      {(insights.personality_traits || []).map((t, i)=>(<li key={i}>{t}</li>))}
                    </ul>

                    <h2 id="communication">Стиль общения</h2>
                    <p>{insights.communication_style}</p>

                    <h2 id="relationships">Отношения с окружающими</h2>
                    <p>{insights.relationship_patterns}</p>

                    <h2 id="patterns">Основные паттерны поведения</h2>
                    <p>В ходе анализа были выявлены следующие устойчивые модели поведения:</p>
                    <div className="patterns-container">
                      {(insights.main_patterns || []).map((pattern, i)=>(
                        <div key={i} className="pattern-item">
                          <div className="pattern-icon">🔄</div>
                          <div className="pattern-content">
                            <p>{pattern}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="section-divider" />
                    <h1 id="evolution-timeline">Эволюция личности во времени</h1>
                    <p>Анализ изменений и развития личности на протяжении всего периода наблюдения.</p>

                    <h2 id="personality-evolution">Общая эволюция личности</h2>
                    <p>{insights.overall_personality_evolution}</p>

                    <hr className="subsection-divider" />

                    <h2 id="key-transformations">Ключевые моменты трансформации</h2>
                    <p>Критические периоды, когда происходили значительные изменения в личности:</p>
                    <div className="transformations-container">
                      {(insights.key_transformation_points || []).map((t, i)=>(
                        <div key={i} className="transformation-item">
                          <div className="transformation-icon">🔄</div>
                          <div className="transformation-content">
                            <p>{t}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="subsection-divider" />

                    <h2 id="timeline-periods">Детальный анализ по временным периодам</h2>
                    <p>Хронологический анализ развития личности, показывающий изменения и эволюцию во времени:</p>
                    
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
                              <h4>👤 Личность в этот период</h4>
                              <p>{period.personality_during_period}</p>
                            </div>
                            
                            <div className="period-section">
                              <h4>💭 Эмоциональное состояние</h4>
                              <p>{period.emotional_state}</p>
                            </div>
                            
                            <div className="period-section">
                              <h4>🎯 Ключевые события</h4>
                              {(period.key_events && period.key_events.length > 0) ? (
                                <ul className="event-list">
                                  {period.key_events.map((e, i)=>(<li key={i}>{e}</li>))}
                                </ul>
                              ) : (
                                <p className="no-data">События не зафиксированы</p>
                              )}
                            </div>
                            
                            <div className="period-section">
                              <h4>💬 Паттерны общения</h4>
                              {(period.communication_patterns && period.communication_patterns.length > 0) ? (
                                <ul className="pattern-list">
                                  {period.communication_patterns.map((p, i)=>(<li key={i}>{p}</li>))}
                                </ul>
                              ) : (
                                <p className="no-data">Паттерны не выявлены</p>
                              )}
                            </div>
                            
                            <div className="period-section">
                              <h4>📈 Развитие или регресс</h4>
                              <p>{period.growth_or_regression}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="subsection-divider" />

                    <h2 id="future-predictions">Прогнозы на будущее</h2>
                    <p>Предсказания о будущем развитии на основе выявленных паттернов:</p>
                    <div className="predictions-container">
                      {(insights.future_predictions || []).map((p, i)=>(
                        <div key={i} className="prediction-item">
                          <div className="prediction-icon">🔮</div>
                          <div className="prediction-content">
                            <p>{p}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="section-divider" />
                    <h1 id="what-to-do">Что с этим всем делать</h1>
                    <p>Практические рекомендации и области для развития на основе проведённого анализа.</p>

                    <h2 id="growth">Области для роста</h2>
                    <p>Сферы личностного развития, требующие особого внимания:</p>
                    <div className="growth-container">
                      {(insights.growth_areas || []).map((a, i)=>(
                        <div key={i} className="growth-item">
                          <div className="growth-icon">🌱</div>
                          <div className="growth-content">
                            <p>{a}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h2 id="recommendations">Рекомендации</h2>
                    <p>На основе проведённого анализа предлагаются следующие рекомендации:</p>
                    <div className="recommendations-container">
                      {(insights.recommendations || []).map((r, i)=>(
                        <div key={i} className="recommendation-item">
                          <div className="recommendation-icon">💡</div>
                          <div className="recommendation-content">
                            <p>{r}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>{personName || 'Данный субъект'}</strong> — {insights.personality}</p>

                    <h1 id="psychological-profile">Психологический портрет</h1>

                    <h2 id="traits">Черты личности</h2>
                    <p>Доминирующие характеристики личности включают в себя:</p>
                    <ul>{(insights.personality_traits || []).map((t, i)=>(<li key={i}>{t}</li>))}</ul>

                    <h2 id="communication">Стиль общения</h2>
                    <p>{insights.communication_style}</p>

                    <h2 id="relationships">Отношения с окружающими</h2>
                    <p>{insights.relationship_patterns}</p>

                    <h2 id="patterns">Основные паттерны поведения</h2>
                    <p>В ходе анализа были выявлены следующие устойчивые модели поведения:</p>
                    <div className="patterns-container">
                      {(insights.main_patterns || []).map((pattern, i)=>(
                        <div key={i} className="pattern-item">
                          <div className="pattern-icon">🔄</div>
                          <div className="pattern-content">
                            <p>{pattern}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="section-divider" />
                    <h1 id="what-to-do">Что с этим всем делать</h1>
                    <p>Практические рекомендации и области для развития на основе проведённого анализа.</p>

                    <h2 id="growth">Области для роста</h2>
                    <p>Сферы личностного развития, требующие особого внимания:</p>
                    <div className="growth-container">
                      {(insights.growth_areas || []).map((a, i)=>(
                        <div key={i} className="growth-item">
                          <div className="growth-icon">🌱</div>
                          <div className="growth-content">
                            <p>{a}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h2 id="recommendations">Рекомендации</h2>
                    <p>На основе проведённого анализа предлагаются следующие рекомендации:</p>
                    <div className="recommendations-container">
                      {(insights.recommendations || []).map((r, i)=>(
                        <div key={i} className="recommendation-item">
                          <div className="recommendation-icon">💡</div>
                          <div className="recommendation-content">
                            <p>{r}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <h2>Примечания</h2>
                <div className="references">
                  <ol>
                    <li>Анализ проведён системой ЗЕРКАЛО на основе текстовых данных</li>
                    <li>Результаты носят исследовательский характер</li>
                    <li>Для получения профессиональной психологической помощи рекомендуется обращение к специалистам</li>
                  </ol>
                </div>

                <h2>См. также</h2>
                <ul>
                  <li><a href="/">ЗЕРКАЛО — главная страница</a></li>
                  <li><a href="/mirror/export-guide/">Инструкция по экспорту данных</a></li>
                </ul>
              </div>

              <div className="categories">
                <strong>Категории:</strong>
                <a href="#">Психологический анализ</a>
                <a href="#">Анализ личности</a>
                <a href="#">ЗЕРКАЛО</a>
                <a href="#">{createdAt ? createdAt.getFullYear() : ''}</a>
              </div>
            </>
          )}

          {status !== 'processing' && status !== 'error' && !(status==='completed' && insights) && (
            <div className="mw-message-box mw-message-box-error">
              <strong>Данные не найдены</strong><br/>
              Анализ не был завершён или данные недоступны.
            </div>
          )}
        </div>
      </div>

      {/* Decrypt Modal */}
      <dialog id="decryptModal" className="modal" ref={decryptRef}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Введите пароль для расшифровки</h3>
            <button onClick={closeDecryptModal} className="close-btn">&times;</button>
          </div>
          <div className="modal-body">
            <div style={{marginBottom:20}}>
              <p style={{color:'var(--sub)', marginBottom:16}}>
                Введите пароль для расшифровки и просмотра ваших данных анализа.
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

