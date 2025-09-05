import React, { Component } from 'react'
import WikiAnalysis from './components/WikiAnalysis.jsx'
import { getApiUrl } from './config.js'
import { unwrapPrivateKey, decryptDataFromServer } from './utils/crypto.js'
import { loadKeypairFromStorage, hasKeypairInStorage, saveKeypairToStorage } from './utils/storage.js'
import './styles/wiki.css'
import './styles/insight.css'

class Insight extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
      loading: true,
      error: null,
      passwordPrompt: true,
      password: '',
      passwordError: '',
      decryptedInsights: null,
      decrypting: false,
      hasStoredKeypair: false,
      retryCount: 0,
      isAutoRetrying: false
    }
    this.passwordRef = React.createRef()
    this.retryInterval = null
  }

  componentDidMount() {
    this.fetchInsights()
  }

  componentWillUnmount() {
    this.clearRetryInterval()
  }

  clearRetryInterval = () => {
    if (this.retryInterval) {
      clearInterval(this.retryInterval)
      this.retryInterval = null
    }
  }

  startAutoRetry = () => {
    this.clearRetryInterval()
    this.setState({ isAutoRetrying: true })
    
    this.retryInterval = setInterval(() => {
      console.log('Auto-retrying data fetch...')
      this.setState(prevState => ({ retryCount: prevState.retryCount + 1 }))
      this.fetchInsights()
    }, 10000) // 10 seconds
  }

  stopAutoRetry = () => {
    this.clearRetryInterval()
    this.setState({ isAutoRetrying: false })
  }

  fetchInsights = async () => {
    try {
      this.setState({ loading: true, error: null })
      
      // Get UUID from URL path
      const pathParts = window.location.pathname.split('/').filter(part => part.length > 0)
      const uuid = pathParts[pathParts.length - 1]
      const apiUrl = getApiUrl(`/mirror/api/insights/${uuid}/`)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Проверяем, есть ли сохраненный keypair для этого uid
      const hasStoredKeypair = hasKeypairInStorage(uuid)
      
      this.setState({ 
        data: result,
        hasStoredKeypair,
        passwordPrompt: !hasStoredKeypair && result.status === 'completed' // Показываем запрос пароля только если нет сохраненного keypair и анализ завершен
      })
      
      console.log('Has stored keypair:', hasStoredKeypair)
      console.log('Fetched data:', result)
      console.log('Status:', result.status)
      
      // Handle auto-retry based on status
      if (result.status === 'processing') {
        // Start auto-retry if not already running
        if (!this.state.isAutoRetrying) {
          this.startAutoRetry()
        }
      } else {
        // Stop auto-retry for completed or error status
        this.stopAutoRetry()
        
        // If analysis is completed and we have stored keypair, auto-decrypt
        if (hasStoredKeypair && result && result.status === 'completed' && result.insights) {
          await this.autoDecryptWithStoredKeypair(uuid, result)
        }
      }
    } catch (err) {
      console.error('Error fetching insights:', err)
      this.setState({ error: err.message })
      
      // If we're auto-retrying and get an error, continue retrying
      if (this.state.isAutoRetrying) {
        console.log('Error during auto-retry, will continue retrying...')
      }
    } finally {
      this.setState({ loading: false })
    }
  }

  autoDecryptWithStoredKeypair = async (uuid, data) => {
    try {
      console.log('Attempting to auto-decrypt with stored keypair')
      this.setState({ decrypting: true })
      
      // Загружаем сохраненный keypair
      const storedKeypair = loadKeypairFromStorage(uuid)

        console.log('Loaded stored keypair:', storedKeypair)
      
      if (!storedKeypair || !storedKeypair.sk) {
        console.error('Stored keypair not found', storedKeypair)
        this.setState({ 
          passwordPrompt: true,
          passwordError: 'Сохраненный ключ не найден. Введите пароль вручную.'
        })
        return
      }
      
      // Проверяем, что sk является Uint8Array
      if (!(storedKeypair.sk instanceof Uint8Array)) {
        console.error('Stored keypair sk is not Uint8Array:', storedKeypair.sk)
        this.setState({ 
          passwordPrompt: true,
          passwordError: 'Сохраненный ключ поврежден. Введите пароль вручную.'
        })
        return
      }
      
      // Используем переданные данные для расшифровки
      if (!data || !data.insights) {
        console.error('No insights data to decrypt')
        this.setState({ 
          passwordPrompt: true,
          passwordError: 'Данные для расшифровки недоступны'
        })
        return
      }
      
      // Расшифровываем данные с помощью сохраненного keypair
      console.log('Attempting to decrypt with stored keypair')
      const decryptedData = await decryptDataFromServer(data.insights, storedKeypair.sk)
      
      // Парсим расшифрованные JSON данные
      const insightsText = new TextDecoder().decode(decryptedData)
      const parsedInsights = JSON.parse(insightsText)
      
      this.setState({ 
        decryptedInsights: parsedInsights,
        passwordPrompt: false,
        decrypting: false
      })
      
      console.log('Successfully decrypted with stored keypair')
    } catch (err) {
      console.error('Auto-decryption error:', err)
      this.setState({ 
        passwordPrompt: true,
        passwordError: 'Ошибка автоматической расшифровки. Введите пароль вручную.',
        decrypting: false
      })
    }
  }

  handlePasswordSubmit = async () => {
    const { password, data } = this.state
    
    if (!password.trim()) {
      this.setState({ passwordError: 'Пожалуйста, введите пароль' })
      return
    }
    
    if (!data || !data.keypair) {
      this.setState({ passwordError: 'Данные для расшифровки недоступны' })
      return
    }
    
    this.setState({ passwordError: '', decrypting: true })
    
    // Force UI update before starting heavy crypto operations
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })
    
    try {
      // Unwrap the private key using the password
      const keypair = await unwrapPrivateKey(data.keypair, password)
      
      // Decrypt the insights data
      const decryptedData = await decryptDataFromServer(data.insights, keypair.sk)
      
      // Parse the decrypted JSON data
      const insightsText = new TextDecoder().decode(decryptedData)
      const parsedInsights = JSON.parse(insightsText)
      
      // Сохраняем keypair в localStorage для будущего использования
      const pathParts = window.location.pathname.split('/').filter(part => part.length > 0)
      const uuid = pathParts[pathParts.length - 1]
      saveKeypairToStorage(uuid, data.keypair)
      
      this.setState({ 
        decryptedInsights: parsedInsights,
        passwordPrompt: false 
      })
    } catch (err) {
      console.error('Decryption error:', err)
      this.setState({ passwordError: 'Неверный пароль или ошибка расшифровки' })
    } finally {
      this.setState({ decrypting: false })
    }
  }

  handlePasswordCancel = () => {
    this.setState({
      password: '',
      passwordError: '',
      passwordPrompt: false
    })
  }

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value })
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter' && !this.state.decrypting) {
      this.handlePasswordSubmit()
    }
  }

  render() {
    const { 
      data, 
      loading, 
      error, 
      passwordPrompt, 
      password, 
      passwordError, 
      decryptedInsights, 
      decrypting,
      hasStoredKeypair,
      retryCount,
      isAutoRetrying
    } = this.state

    // Get UUID from URL path
    const pathParts = window.location.pathname.split('/').filter(part => part.length > 0)
    const uuid = pathParts[pathParts.length - 1]

      if (passwordPrompt) {
      return (
        <div className="insight-password-container">
          <div className="insight-password-card">
            <h2 className="insight-password-title">
              {hasStoredKeypair ? 'Автоматическая расшифровка...' : 'Введите пароль для доступа'}
            </h2>
            <p className="insight-password-description">
              {hasStoredKeypair 
                ? 'Используется сохраненный ключ для автоматической расшифровки'
                : 'Для просмотра анализа необходимо ввести пароль'
              }
            </p>
            {!data && (
              <p style={{color: 'orange', textAlign: 'center', marginBottom: '20px'}}>
                Загрузка данных...
              </p>
            )}
            
            {!hasStoredKeypair && (
              <>
                <div className="insight-password-input-container">
                  <input
                    ref={this.passwordRef}
                    type="password"
                    value={password}
                    onChange={this.handlePasswordChange}
                    placeholder="Введите пароль"
                    className="insight-password-input"
                    disabled={decrypting}
                    onKeyPress={this.handleKeyPress}
                  />
                  {passwordError && (
                    <p className="insight-password-error">
                      {passwordError}
                    </p>
                  )}
                </div>
                <div className="insight-password-buttons">
                  <button
                    onClick={this.handlePasswordCancel}
                    className="insight-password-cancel-btn"
                    disabled={decrypting}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={this.handlePasswordSubmit}
                    className="insight-password-submit-btn"
                    disabled={decrypting || !data}
                  >
                    {decrypting ? (
                      <>
                        <span className="insight-spinner"></span>
                        Расшифровка...
                      </>
                    ) : (
                      'Продолжить'
                    )}
                  </button>
                </div>
              </>
            )}
            
            {decrypting && (
              <div className="insight-decrypting-overlay">
                <div className="insight-decrypting-content">
                  <div className="insight-decrypting-spinner"></div>
                  <div className="insight-decrypting-text">
                    Расшифровка данных...
                  </div>
                </div>
              </div>
            )}
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

    // Обработка статусов анализа
    if (data.status === 'processing') {
      return (
        <div className="insight-loading-container">
          <div className="insight-processing-content">
            <div className="insight-processing-spinner"></div>
            <h2>Анализ в процессе...</h2>
            <p>Пожалуйста, подождите, пока анализ будет завершен. Это может занять несколько минут.</p>
            {isAutoRetrying && (
              <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                background: '#e3f2fd', 
                borderRadius: '5px',
                border: '1px solid #2196f3'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#1976d2', fontWeight: 'bold' }}>
                  🔄 Автоматическое обновление активно
                </p>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Попыток обновления: {retryCount} | Следующее обновление через 10 секунд
                </p>
              </div>
            )}
            <button 
              className="btn"
              onClick={() => window.location.reload()} 
              style={{ marginTop: '10px' }}
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )
    }

    if (data.status === 'error') {
      return (
        <div className="insight-error-container">
          <h2>Ошибка анализа</h2>
          <p className="insight-error-message">
            {data.error_message || 'Произошла ошибка при обработке анализа'}
          </p>
          <button onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      )
    }

    // Если статус не 'completed', показываем загрузку
    if (data.status !== 'completed') {
      return (
        <div className="insight-loading-container">
          <div className="insight-processing-content">
            <div className="insight-processing-spinner"></div>
            <h2>Ожидание завершения анализа...</h2>
            <p>Статус: {data.status}</p>
            {isAutoRetrying && (
              <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                background: '#e3f2fd', 
                borderRadius: '5px',
                border: '1px solid #2196f3'
              }}>
                <p style={{ margin: '0 0 5px 0', color: '#1976d2', fontWeight: 'bold' }}>
                  🔄 Автоматическое обновление активно
                </p>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                  Попыток обновления: {retryCount} | Следующее обновление через 10 секунд
                </p>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Обновить страницу
            </button>
          </div>
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
}

export default Insight

