import React, { useState, useEffect } from 'react'
import { Upload, Calendar, Send, CheckCircle2, Lock, ShieldCheck, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [ocrResults, setOcrResults] = useState(null)

  // 從環境變數讀取正確的密碼(部署時設定)，預設為 admin888
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin888'

  useEffect(() => {
    const authStatus = localStorage.getItem('isBallTeamAdmin')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('isBallTeamAdmin', 'true')
      setLoginError('')
    } else {
      setLoginError('密碼錯誤，請重新輸入')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isBallTeamAdmin')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    // 模擬 OCR 辨識邏輯
    setTimeout(() => {
      setOcrResults([
        { date: "3/15", time: "08~09", teams: ["崇曜", "柏飛"] },
        { date: "3/15", time: "09~10", teams: ["柏飛", "新夢幻"] },
        { date: "4/12", time: "12~13", teams: ["元菱", "柏飛"] },
        { date: "5/24", time: "10~11", teams: ["頭和", "柏飛"] }
      ])
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div className="container">
      <header className="header" style={{ marginBottom: '60px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Calendar size={32} color="#3b82f6" />
            <h1 style={{ margin: 0 }}>春風壘球管理系統</h1>
          </div>
          <p>專業賽程辨識與 LINE 自動化推播平台</p>
        </motion.div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card login-box"
              style={{ padding: '40px', textAlign: 'center' }}
            >
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Lock color="#3b82f6" size={32} />
              </div>
              <h2 style={{ marginBottom: '12px' }}>管理員登入</h2>
              <p style={{ color: '#94a3b8', marginBottom: '32px' }}>請輸入後台存取密碼</p>
              
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                  <input
                    type="password"
                    placeholder="請輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {loginError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '8px', textAlign: 'left' }}>{loginError}</p>}
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                  立即進入
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="admin-layout"
            >
              {/* 控制列 */}
              <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontWeight: 600 }}>管理者已認證</span>
                </div>
                <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
                  <LogOut size={16} /> 登出
                </button>
              </div>

              {/* 上傳區 */}
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <Upload size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '8px' }}>更新賽程圖片</h3>
                  <p style={{ color: '#94a3b8' }}>目前支援「春風聯盟」最新賽程表</p>
                </div>
                
                <label className="btn btn-primary" style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                  {isUploading ? '正在深度辨識中...' : '上傳最新賽程圖'}
                  <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                </label>
              </div>

              {/* 辨識結果 */}
              {ocrResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card"
                  style={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 color="#10b981" />
                      <h3 style={{ margin: 0 }}>自動辨識結果 (柏飛)</h3>
                    </div>
                    <button className="btn btn-primary" style={{ background: '#10b981', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
                      <Send size={18} /> 推播至 LINE 群組
                    </button>
                  </div>

                  <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#94a3b8' }}>
                          <th style={{ padding: '16px 8px' }}>日期</th>
                          <th style={{ padding: '16px 8px' }}>時間</th>
                          <th style={{ padding: '16px 8px' }}>對戰</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocrResults.map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <td style={{ padding: '16px 8px', fontWeight: 600 }}>{m.date}</td>
                            <td style={{ padding: '16px 8px' }}>{m.time}</td>
                            <td style={{ padding: '16px 8px' }}>
                              <span style={{ color: '#3b82f6' }}>{m.teams[0]}</span>
                              <span style={{ margin: '0 8px', opacity: 0.5 }}>vs</span>
                              <span style={{ color: m.teams[1] === '柏飛' ? '#3b82f6' : 'inherit' }}>{m.teams[1]}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                    * 以上為系統自動篩選包含「柏飛」的賽程對戰
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: '60px', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        &copy; 2026 壘球聯盟自動化管理平台
      </footer>
    </div>
  )
}

export default App
