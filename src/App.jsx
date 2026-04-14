import { useState, useEffect } from 'react'
import { Upload, Calendar, Send, CheckCircle2, Lock, ShieldCheck, LogOut, Table as TableIcon, Loader2 } from 'lucide-react'
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
    if (!GOOGLE_KEY) return []
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_KEY}`
    const payload = {
      requests: [{
        image: { content: base64Image },
        features: [{ type: "TEXT_DETECTION" }]
      }]
    }

    const response = await axios.post(url, payload)
    const annotations = response.data.responses[0].textAnnotations
    if (!annotations || annotations.length < 2) return []

    // 取得所有文字的座標塊
    const blocks = annotations.slice(1).map(anno => ({
      text: anno.description,
      x: (anno.boundingPoly.vertices[0].x + anno.boundingPoly.vertices[1].x) / 2, // 使用中心點 X
      y: (anno.boundingPoly.vertices[1].y + anno.boundingPoly.vertices[2].y) / 2, // 使用中心點 Y
      bounds: anno.boundingPoly.vertices
    }))

    // 1. 抓取所有合法的日期 (MM/DD 格式)
    const dateHeaders = blocks
      .filter(b => b.text.match(/^\d{1,2}\/\d{1,2}$/))
      .sort((a, b) => a.x - b.x) // 從左到右排序

    // 2. 抓取所有合法的時間 (如 08~09, 12~13)
    const timeLabels = blocks
      .filter(b => b.text.match(/^\d{2}[-~]\d{2}$/))
      .sort((a, b) => a.y - b.y) // 從上到下排序

    const schedule = []

    // 3. 遍歷所有包含 - 或 vs 的文字塊，並嘗試定位
    blocks.forEach(b => {
      // 判斷是否為「隊伍對戰」型文字：長度大於 3 且包含連字號或是 vs
      if (b.text.length >= 3 && (b.text.includes('-') || b.text.toLowerCase().includes('vs'))) {
        
        // 排除掉單純的時間數字 (如 12-13)
        if (b.text.match(/^\d{2}[-~]\d{2}$/)) return;

        // 尋找橫向最接近的日期 (容許較大的誤差值)
        const date = dateHeaders.reduce((prev, curr) => {
          return (Math.abs(curr.x - b.x) < Math.abs(prev.x - b.x)) ? curr : prev
        }, dateHeaders[0])

        // 尋找縱向最接近的時間
        const time = timeLabels.reduce((prev, curr) => {
          return (Math.abs(curr.y - b.y) < Math.abs(prev.y - b.y)) ? curr : prev
        }, { text: "待確認" })

        // 清理隊名
        let teams = b.text.split(/-|[vV][sS]/).map(t => t.trim().replace(/[「」【】\[\]]/g, ''))
        
        if (teams.length >= 2 && teams[0] && teams[1] && date) {
          schedule.push({
            date: date.text,
            time: time.text,
            teams: teams
          })
        }
      }
    })

    // 去重處理
    const unique = []
    const seen = new Set()
    schedule.forEach(s => {
      const key = `${s.date}-${s.time}-${s.teams.join('-')}`
      if (!seen.has(key)) {
        unique.push(s)
        seen.add(key)
      }
    })

    return unique.sort((a, b) => {
      const dayA = parseInt(a.date.split('/')[1])
      const dayB = parseInt(b.date.split('/')[1])
      return dayA - dayB
    })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsProcessing(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const results = await processImageWithGoogle(reader.result.split(',')[1])
        setAllMatches(results)
      } catch (err) {
        console.error(err)
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={styles.container}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#60a5fa' }}>春風壘球 AI 矩陣解析器</h1>
        <p style={{ color: '#94a3b8' }}>當前版本：v2.1 (穩定分組版)</p>
      </header>

      {!isAuthenticated ? (
        <div style={{...styles.glassCard, maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
          <h3>管理者登入</h3>
          <form onSubmit={e => { e.preventDefault(); password === ADMIN_PASSWORD && setIsAuthenticated(true); localStorage.setItem('isBallTeamAdmin', 'true'); }}>
            <input type="password" style={styles.input} value={password} onChange={e => setPassword(e.target.value)} />
            <br /><button type="submit" style={styles.btnPrimary}>進入後台</button>
          </form>
        </div>
      ) : (
        <>
          <div style={styles.glassCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#10b981' }}><ShieldCheck />已認證</div>
              <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('isBallTeamAdmin'); }} style={{ ...styles.btnPrimary, background: '#ef4444' }}>登出</button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <Upload size={48} color="#3b82f6" />
              <h3>上傳賽程表圖檔</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>系統會自動將文字塊對齊到最近的日期列</p>
              <label style={{ ...styles.btnPrimary, marginTop: '20px', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                {isProcessing ? <Loader2 className="animate-spin" /> : '開始 AI 辨識'}
                <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isProcessing} />
              </label>
            </div>
          </div>

          {allMatches && (
            <div style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>AI 辨識清單 ({allMatches.length} 場)</h3>
                <input type="text" style={{...styles.input, width: '120px', margin: 0}} value={filterTeam} onChange={e => setFilterTeam(e.target.value)} placeholder="搜尋球隊" />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead><tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}><th>日期</th><th>時段</th><th>對戰組合</th></tr></thead>
                  <tbody>
                    {allMatches.filter(m => !filterTeam || m.teams.some(t => t.includes(filterTeam))).map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155', background: m.teams.includes('柏飛') ? 'rgba(59, 130, 246, 0.1)' : 'inherit' }}>
                        <td style={{ padding: '12px' }}>{m.date}</td>
                        <td style={{ padding: '12px' }}>{m.time}</td>
                        <td style={{ padding: '12px' }}>{m.teams[0]} vs {m.teams[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
