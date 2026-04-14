import { useState, useEffect } from 'react'
import { Upload, Calendar, Send, CheckCircle2, Lock, ShieldCheck, LogOut, Table as TableIcon, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', color: '#ffffff', fontFamily: 'sans-serif' },
  glassCard: { background: '#1e293b', border: '2px solid #334155', borderRadius: '12px', padding: '25px', marginTop: '20px' },
  btnPrimary: { background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  input: { width: '100%', maxWidth: '300px', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', marginBottom: '10px' }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [allMatches, setAllMatches] = useState(null)
  const [filterTeam, setFilterTeam] = useState('柏飛')

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin888'
  const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_VISION_KEY

  useEffect(() => {
    if (localStorage.getItem('isBallTeamAdmin') === 'true') setIsAuthenticated(true)
  }, [])

  const processImageWithGoogle = async (base64Image) => {
    if (!GOOGLE_KEY) {
      alert("尚未設定 Google Vision API 金鑰，請在 Vercel 環境變數中設定 VITE_GOOGLE_VISION_KEY")
      return
    }

    const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_KEY}`
    const payload = {
      requests: [{
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION" }]
      }]
    }

    const response = await axios.post(url, payload)
    const annotations = response.data.responses[0].textAnnotations
    if (!annotations) return []

    const fullText = annotations[0].description
    console.log("Google Vision 識別原始文字:", fullText)

    // 針對矩陣表格的高及解析邏輯
    const lines = fullText.split('\n').filter(l => l.trim().length > 2)
    const matches = []
    let currentDate = ""

    lines.forEach(line => {
      // 偵測日期 (如 3/15, 4/12)
      const dateMatch = line.match(/^(\d{1,2}\/\d{1,2})$/)
      if (dateMatch) {
        currentDate = dateMatch[1]
      }

      // 偵測對戰格式 (如 隊伍A-隊伍B 或 隊伍A vs 隊伍B)
      if (line.includes('-') || line.toLowerCase().includes('vs')) {
        const parts = line.split(/[vV][sS]|-/).map(p => p.trim())
        if (parts.length >= 2 && currentDate) {
          matches.push({
            date: currentDate,
            time: "見原圖", // 時段辨識通常較分散，建議看圖確認或進一步優化
            teams: [parts[0], parts[1]]
          })
        }
      }
    })

    return matches
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsProcessing(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Content = reader.result.split(',')[1]
      try {
        const results = await processImageWithGoogle(base64Content)
        setAllMatches(results)
      } catch (err) {
        console.error("辨識失敗", err)
        alert("辨識發生錯誤，請檢查 API Key 是否正確。")
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={styles.container}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#60a5fa' }}>春風壘球 AI 管理中心</h1>
        <p style={{ color: '#94a3b8' }}>Powered by Google Cloud Vision API</p>
      </header>

      {!isAuthenticated ? (
        <div style={{...styles.glassCard, maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
          <h3>後台登入</h3>
          <form onSubmit={e => { e.preventDefault(); password === ADMIN_PASSWORD && setIsAuthenticated(true); localStorage.setItem('isBallTeamAdmin', 'true'); }}>
            <input type="password" style={styles.input} value={password} onChange={e => setPassword(e.target.value)} />
            <br />
            <button type="submit" style={styles.btnPrimary}>登入管理</button>
          </form>
        </div>
      ) : (
        <>
          <div style={styles.glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}><ShieldCheck /> 管理者已授權</div>
              <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('isBallTeamAdmin'); }} style={{ ...styles.btnPrimary, background: '#ef4444' }}>登出</button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Upload size={48} color="#3b82f6" />
              <h3>上傳賽程表圖片</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>使用 Google AI 進行深度表格分析</p>
              {!GOOGLE_KEY && <div style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: '10px' }}><AlertCircle size={14} inline /> 偵測到尚未設定 Vercel API Key，目前無法使用。</div>}
              <label style={{ ...styles.btnPrimary, marginTop: '20px', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                {isProcessing ? <Loader2 className="animate-spin" /> : '選擇檔案'}
                <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isProcessing || !GOOGLE_KEY} />
              </label>
            </div>
          </div>

          {allMatches && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TableIcon size={20} /> <h3>AI 辨識清單 ({allMatches.length} 場)</h3></div>
                <input type="text" style={{...styles.input, width: '120px', margin: 0}} value={filterTeam} onChange={e => setFilterTeam(e.target.value)} placeholder="篩選球隊" />
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}><th>日期</th><th>對戰組合</th></tr></thead>
                <tbody>
                  {allMatches.filter(m => m.teams.some(t => t.includes(filterTeam))).map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px' }}>{m.date}</td>
                      <td style={{ padding: '12px' }}>{m.teams[0]} <span style={{ opacity: 0.3 }}>vs</span> {m.teams[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={{ ...styles.btnPrimary, background: '#10b981', marginTop: '20px', width: '100%', justifyContent: 'center' }}>
                <Send size={18} /> 推播至 LINE 群組
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default App
