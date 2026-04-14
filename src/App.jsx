import React, { useState, useEffect } from 'react'
import { Upload, Calendar, Send, CheckCircle2, Lock, ShieldCheck, LogOut, Filter, Table as TableIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [allMatches, setAllMatches] = useState(null)
  const [filterTeam, setFilterTeam] = useState('柏飛')

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin888'

  useEffect(() => {
    const authStatus = localStorage.getItem('isBallTeamAdmin')
    if (authStatus === 'true') setIsAuthenticated(true)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('isBallTeamAdmin', 'true')
    } else {
      setLoginError('密碼錯誤')
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
    // 模擬全量 OCR 辨識邏輯 (包含所有日期與場次)
    setTimeout(() => {
      const mockData = [
        // 3/15 日期
        { date: "3/15", time: "08~09", teams: ["崇曜", "柏飛"] },
        { date: "3/15", time: "09~10", teams: ["柏飛", "新夢幻"] },
        { date: "3/15", time: "10~11", teams: ["新夢幻", "崇曜"] },
        { date: "3/15", time: "11~12", teams: ["富強", "永不"] },
        // 4/12 日期
        { date: "4/12", time: "08~09", teams: ["電信", "逢友"] },
        { date: "4/12", time: "09~10", teams: ["逢友", "頭和"] },
        { date: "4/12", time: "10~11", teams: ["頭和", "電信"] },
        { date: "4/12", time: "12~13", teams: ["元菱", "柏飛"] },
        { date: "4/12", time: "13~14", teams: ["柏飛", "鼎勝"] },
        // 5/24 日期
        { date: "5/24", time: "08~09", teams: ["柏飛", "永不"] },
        { date: "5/24", time: "09~10", teams: ["永不", "頭和"] },
        { date: "5/24", time: "10~11", teams: ["頭和", "柏飛"] }
      ]
      setAllMatches(mockData)
      setIsUploading(false)
    }, 2000)
  }

  const filteredData = allMatches?.filter(m => 
    !filterTeam || m.teams.some(t => t.includes(filterTeam))
  )

  return (
    <div className="container">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <Calendar size={32} color="#3b82f6" />
          <h1>春風壘球全量賽程管理</h1>
        </div>
        <p>完整辨識聯盟賽程並自動推播 myTeam 戰報</p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div key="login" className="glass-card login-box" style={{ padding: '40px', textAlign: 'center' }}>
              <Lock size={32} color="#3b82f6" style={{ marginBottom: '20px' }} />
              <h2>管理員登入</h2>
              <form onSubmit={handleLogin} style={{ marginTop: '24px' }}>
                <input
                  type="password"
                  placeholder="請輸入後台密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
                {loginError && <p style={{ color: '#ef4444', marginTop: '10px' }}>{loginError}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>登入系統</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0 }}>
              {/* 功能選單 */}
              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck color="#10b981" />
                  <span style={{ fontWeight: 600 }}>管理者：已授權</span>
                </div>
                <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>登出</button>
              </div>

              {/* 上傳區 */}
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
                <Upload size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
                <h3>上傳聯盟完整賽程圖</h3>
                <p style={{ color: '#94a3b8', marginBottom: '24px' }}>系統將自動解析所有日期、時段與對戰組合</p>
                <label className="btn btn-primary" style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                  {isUploading ? '深度辨識中 (掃描表格路徑)...' : '選擇圖片並全量辨識'}
                  <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                </label>
              </div>

              {/* 辨識結果看板 */}
              {allMatches && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <TableIcon color="#3b82f6" />
                      <h3 style={{ margin: 0 }}>辨識結果清單 (共 {allMatches.length} 場)</h3>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <Filter size={16} color="#94a3b8" />
                      <input 
                        type="text" 
                        placeholder="篩選球隊 (如: 柏飛)" 
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '120px' }}
                      />
                    </div>

                    <button className="btn btn-primary" style={{ background: '#10b981' }}>
                      <Send size={18} /> 推播當週戰報
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 1 }}>
                        <tr style={{ color: '#94a3b8', borderBottom: '2px solid var(--glass-border)' }}>
                          <th style={{ padding: '16px' }}>日期</th>
                          <th style={{ padding: '16px' }}>時段</th>
                          <th style={{ padding: '16px' }}>對戰組合</th>
                          <th style={{ padding: '16px' }}>狀態</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)', background: m.teams.includes('柏飛') ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                            <td style={{ padding: '16px' }}>{m.date}</td>
                            <td style={{ padding: '16px' }}>{m.time}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ color: m.teams[0] === filterTeam ? '#60a5fa' : 'inherit' }}>{m.teams[0]}</span>
                              <span style={{ margin: '0 8px', opacity: 0.3 }}>vs</span>
                              <span style={{ color: m.teams[1] === filterTeam ? '#60a5fa' : 'inherit' }}>{m.teams[1]}</span>
                            </td>
                            <td style={{ padding: '16px' }}><CheckCircle2 size={16} color="#10b981" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
