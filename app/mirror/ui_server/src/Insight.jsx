import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import WikiAnalysis from './components/WikiAnalysis.jsx'
import { getApiUrl } from './config.js'
import { unwrapPrivateKey, decryptDataFromServer } from './utils/crypto.js'
import './styles/wiki.css'
import './styles/insight.css'

export default function Insight(){
  const { uuid } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [passwordPrompt, setPasswordPrompt] = useState(true)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [decryptedInsights, setDecryptedInsights] = useState(null)
  const [decrypting, setDecrypting] = useState(false)
  const passwordRef = useRef(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiUrl = getApiUrl(`/mirror/api/insights/${uuid}/`)
        console.log('Fetching insights from:', apiUrl)
        
        const response = await fetch(apiUrl)
        
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Received data:', result)
        setData(result)
      } catch (err) {
        console.error('Error fetching insights:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (uuid) {
      console.log('Fetching insights for UUID:', uuid)
      fetchInsights()
    }
  }, [uuid])

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError('Пожалуйста, введите пароль')
      return
    }
    
    if (!data || !data.keypair) {
      setPasswordError('Данные для расшифровки недоступны')
      return
    }
    
    setPasswordError('')
    setDecrypting(true)
    
    try {
      // Unwrap the private key using the password
      const keypair = await unwrapPrivateKey(data.keypair, password)
      console.log('Keypair unwrapped successfully:', keypair)
      
      // Decrypt the insights data
      const decryptedData = await decryptDataFromServer(data.insights, keypair.sk)
      console.log('Data decrypted successfully')
      
      // Parse the decrypted JSON data
      const insightsText = new TextDecoder().decode(decryptedData)
      const parsedInsights = JSON.parse(insightsText)
      console.log('Parsed insights:', parsedInsights)
      
      setDecryptedInsights(parsedInsights)
      setPasswordPrompt(false)
    } catch (err) {
      console.error('Decryption error:', err)
      setPasswordError('Неверный пароль или ошибка расшифровки')
    } finally {
      setDecrypting(false)
    }
  }

  const handlePasswordCancel = () => {
    setPassword('')
    setPasswordError('')
    setPasswordPrompt(false)
  }

  if (passwordPrompt) {
    return (
      <div className="insight-password-container">
        <div className="insight-password-card">
          <h2 className="insight-password-title">
            Введите пароль для доступа
          </h2>
          <p className="insight-password-description">
            Для просмотра анализа необходимо ввести пароль
          </p>
          <div className="insight-password-input-container">
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="insight-password-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit()
                }
              }}
            />
            {passwordError && (
              <p className="insight-password-error">
                {passwordError}
              </p>
            )}
          </div>
          <div className="insight-password-buttons">
            <button
              onClick={handlePasswordCancel}
              className="insight-password-cancel-btn"
            >
              Отмена
            </button>
            <button
              onClick={handlePasswordSubmit}
              className="insight-password-submit-btn"
              disabled={decrypting}
            >
              {decrypting ? 'Расшифровка...' : 'Продолжить'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="insight-loading-container">
        Загрузка анализа...
      </div>
    )
  }

  if (error) {
    return (
      <div className="insight-error-container">
        <h2>Ошибка загрузки</h2>
        <p className="insight-error-message">{error}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="insight-no-data-container">
        Данные не найдены
      </div>
    )
  }

  return (
    <WikiAnalysis
      status={data.status}
      analysis={{ 
        person_name: data.person_name || 'Ваше Зеркало',
        created_at: data.created_at 
      }}
      insights={decryptedInsights}
      uuid={uuid}
      errorMessage={data.error_message || ''}
      decryptAnalysis={async (decryptPassword) => {
        // Use the password entered during initial access
        const actualPassword = decryptPassword || password
        await new Promise(r => setTimeout(r, 300))
        return {
          person_name: data.person_name || 'Ваше Зеркало',
          chat: [],
          retain: true,
          password: actualPassword
        }
      }}
    />
  )
}
