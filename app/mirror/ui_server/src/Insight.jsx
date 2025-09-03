import React, { Component } from 'react'
import WikiAnalysis from './components/WikiAnalysis.jsx'
import { getApiUrl } from './config.js'
import { unwrapPrivateKey, decryptDataFromServer } from './utils/crypto.js'
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
      decrypting: false
    }
    this.passwordRef = React.createRef()
  }

  componentDidMount() {
    this.fetchInsights()
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
      this.setState({ data: result })
    } catch (err) {
      console.error('Error fetching insights:', err)
      this.setState({ error: err.message })
    } finally {
      this.setState({ loading: false })
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
      decrypting 
    } = this.state

    // Get UUID from URL path
    const pathParts = window.location.pathname.split('/').filter(part => part.length > 0)
    const uuid = pathParts[pathParts.length - 1]

      console.log('decr', decrypting, decrypting.toString())

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
            <div style={{textAlign: 'center', marginBottom: '10px', fontSize: '12px', color: '#666'}}>
              DEBUG: decrypting = {decrypting.toString()} {decrypting ? '1': '2'}
            </div>
            {!data && (
              <p style={{color: 'orange', textAlign: 'center', marginBottom: '20px'}}>
                Загрузка данных...
              </p>
            )}
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

