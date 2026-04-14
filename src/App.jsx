import { useState, useEffect } from 'react'
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setTimeout(() => {
      const mockData = [
        { date: "3/15", time: "08~09", teams: ["崇曜", "柏飛"] },
        { date: "3/15", time: "09~10", teams: ["柏飛", "新夢幻"] },
        { date: "3/15", time: "10~11", teams: ["新夢幻", "崇曜"] },
        { date: "4/12", time: "12~13", teams: ["元菱", "柏飛"] },
        { date: "4/12", time: "13~14", teams: ["柏飛", "鼎勝"] },
        { date: "5/24", time: "08~09", teams: ["柏飛", "永不"] },
        { date: "5/24", time: "10~11", teams: ["頭和", "柏飛"] }
      ]
      setAllMatches(mockData)
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header" style={{ padding: '20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <Calendar size={32} color="#3b82f6" />
          <h1 style={{ fontSize: '1.8rem' }}>春風壘球管理系統</h1>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>自動辨識賽程並推播分組戰報</p>
      </header>

      <main style={{ flex: 1, padding: '10px' }}>
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div 
              key="login" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="glass-card" 
              style={{ maxWidth: '400px', margin: '20px auto', padding: '30px', textAlign: 'center' }}
            >
              <Lock size={32} color="#3b82f6" style={{ marginBottom: '15px' }} />
              <h2 style={{ fontSize: '1.4rem' }}>管理者登入</h2>
              <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
                <input
                  type="password"
                  placeholder="請輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white', marginBottom: '10px' }}
                />
                {loginError && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{loginError}</p>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>登入</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0 }}>
              <div className="glass-card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#10b981' }}>● 管理員模式</span>
                <button onClick={handleLogout} className="btn" style={{ fontSize: '0.8rem', padding: '5px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>登出</button>
              </div>

              <div className="glass-card" style={{ padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
                <Upload size={40} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1.2rem' }}>上傳聯盟賽程圖</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '20px' }}>系統將解析完整列表並篩選特定隊伍</p>
                <label className="btn btn-primary">
                  {isUploading ? '辨識中...' : '選擇圖片'}
                  <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                </label>
              </div>

              {allMatches && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TableIcon size={20} color="#3b82f6" />
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>辨識清單</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '5px 10px', borderRadius: '5px', width: '100px', fontSize: '0.8rem' }}
                      />
                      <button className="btn btn-primary" style={{ background: '#10b981', fontSize: '0.8rem' }}>發送通知</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.9rem' }}>
                      <tbody style={{ textAlign: 'left' }}>
                        {allMatches.filter(m => !filterTeam || m.teams.some(t => t.includes(filterTeam))).map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '10px 5px' }}>{m.date}</td>
                            <td style={{ padding: '10px 5px' }}>{m.time}</td>
                            <td style={{ padding: '10px 5px' }}>{m.teams[0]} vs {m.teams[1]}</td>
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
