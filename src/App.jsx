import { useState, useEffect } from 'react'
import { Upload, Calendar, Send, CheckCircle2, Lock, ShieldCheck, LogOut, Filter, Table as TableIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 將 CSS 直接寫在 JS 中確保萬無一失
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: 'sans-serif'
  },
  glassCard: {
    background: '#1e293b',
    border: '2px solid #334155',
    borderRadius: '12px',
    padding: '30px',
    marginTop: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  btnPrimary: {
    background: '#3b82f6',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: 'bold',
    display: 'inline-block',
    cursor: 'pointer',
    border: 'none',
    marginTop: '15px',
    fontSize: '1rem'
  },
  input: {
    width: '100%',
    maxWidth: '300px',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: '#0f172a',
    color: 'white',
    marginBottom: '10px'
  }
}

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
      setAllMatches([
        { date: "3/15", time: "08~09", teams: ["崇曜", "柏飛"] },
        { date: "3/15", time: "09~10", teams: ["柏飛", "新夢幻"] },
        { date: "3/15", time: "10~11", teams: ["新夢幻", "崇曜"] },
        { date: "4/12", time: "12~13", teams: ["元菱", "柏飛"] },
        { date: "4/12", time: "13~14", teams: ["柏飛", "鼎勝"] },
        { date: "5/24", time: "08~09", teams: ["柏飛", "永不"] },
        { date: "5/24", time: "10~11", teams: ["頭和", "柏飛"] }
      ])
      setIsUploading(false)
    }, 2000)
  }

  return (
    <div style={styles.container}>
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <Calendar size={32} color="#3b82f6" />
          <h1 style={{ color: '#60a5fa', margin: 0 }}>春風壘球管理系統</h1>
        </div>
        <p style={{ color: '#94a3b8' }}>專業賽程辨識與 LINE 自動化推播平台</p>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.glassCard}>
              <Lock size={32} color="#3b82f6" style={{ marginBottom: '15px' }} />
              <h3>管理者登入</h3>
              <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
                <input
                  type="password"
                  placeholder="請輸入後台密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
                {loginError && <p style={{ color: '#ef4444' }}>{loginError}</p>}
                <br />
                <button type="submit" style={styles.btnPrimary}>進入系統</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ ...styles.glassCard, padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <ShieldCheck size={20} />
                  <span>管理員認證成功</span>
                </div>
                <button onClick={handleLogout} style={{ ...styles.btnPrimary, marginTop: 0, padding: '5px 15px', background: '#ef4444' }}>登出</button>
              </div>

              <div style={styles.glassCard}>
                <Upload size={40} color="#3b82f6" style={{ marginBottom: '10px' }} />
                <h3>更新賽程圖</h3>
                <p>請上傳目前的聯盟完整賽程表</p>
                <label style={styles.btnPrimary}>
                  {isUploading ? '辨識中...' : '選擇圖片並全量辨識'}
                  <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isUploading} />
                </label>
              </div>

              {allMatches && (
                <div style={{ ...styles.glassCard, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>辨識結果</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        placeholder="球隊篩選"
                        style={{ ...styles.input, maxWidth: '100px', margin: 0, padding: '5px' }}
                      />
                      <button style={{ ...styles.btnPrimary, marginTop: 0, padding: '5px 10px', background: '#10b981' }}>發送通知</button>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                        <th style={{ padding: '10px' }}>日期</th>
                        <th style={{ padding: '10px' }}>時段</th>
                        <th style={{ padding: '10px' }}>對戰</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMatches.filter(m => !filterTeam || m.teams.some(t => t.includes(filterTeam))).map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '10px' }}>{m.date}</td>
                          <td style={{ padding: '10px' }}>{m.time}</td>
                          <td style={{ padding: '10px' }}>{m.teams[0]} vs {m.teams[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
