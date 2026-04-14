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
      x: anno.boundingPoly.vertices[0].x,
      y: anno.boundingPoly.vertices[0].y,
      w: anno.boundingPoly.vertices[1].x - anno.boundingPoly.vertices[0].x,
      h: anno.boundingPoly.vertices[2].y - anno.boundingPoly.vertices[1].y
    }))

    // 1. 抓取日期表頭 (通常在頂部，y 較小)
    const dateBlocks = blocks.filter(b => b.text.match(/^\d{1,2}\/\d{1,2}$/))
    const sortedDates = dateBlocks.sort((a, b) => a.x - b.x)
    
    // 2. 抓取時間欄位 (通常在左側，x 較小，包含 ~ 或 -)
    const timeBlocks = blocks.filter(b => b.text.match(/^\d{2}[:~-]\d{2}$/))
    
    // 3. 處理剩餘的對戰資訊
    const schedule = []
    
    // 針對每一場對戰 (包含 vs 或 - 的區塊)
    const matchBlocks = blocks.filter(b => b.text.includes('vs') || b.text.includes('-'))
    
    matchBlocks.forEach(mb => {
      // 根據 MB 的 X 座標找出對應的日期
      const closestDate = sortedDates.reduce((prev, curr) => {
        return (Math.abs(curr.x - mb.x) < Math.abs(prev.x - mb.x)) ? curr : prev
      }, sortedDates[0])

      // 根據 MB 的 Y 座標找出對應的時間 (或見圖)
      const closestTime = timeBlocks.reduce((prev, curr) => {
        return (Math.abs(curr.y - mb.y) < Math.abs(prev.y - mb.y)) ? curr : prev
      }, { text: "見原圖" })

      // 清理隊名 (去除奇怪的標點)
      const cleanedText = mb.text.replace(/[「」【】\[\]]/g, '')
      const teams = cleanedText.split(/vs|-/i).map(t => t.trim())

      if (teams.length >= 2 && closestDate) {
        schedule.push({
          date: closestDate.text,
          time: closestTime.text,
          teams: teams
        })
      }
    })

    // 去重與排序
    return schedule.sort((a, b) => {
      const dateA = a.date.split('/').map(Number)
      const dateB = b.date.split('/').map(Number)
      return (dateA[0] - dateB[0]) || (dateA[1] - dateB[1])
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
        console.error("解析失敗", err)
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
        <p style={{ color: '#94a3b8' }}>已優化座標對齊演算法</p>
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
              <div style={{ color: '#10b981' }}><ShieldCheck /> 已授權</div>
              <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('isBallTeamAdmin'); }} style={{ ...styles.btnPrimary, background: '#ef4444' }}>登出</button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <Upload size={48} color="#3b82f6" />
              <h3>上傳賽程表</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>系統現在會根據文字在圖片中的位置自動對齊日期</p>
              <label style={{ ...styles.btnPrimary, marginTop: '20px' }}>
                {isProcessing ? <Loader2 className="animate-spin" /> : '開始矩陣辨識'}
                <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isProcessing} />
              </label>
            </div>
          </div>

          {allMatches && (
            <div style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TableIcon size={20} /> <h3>AI 辨識清單 ({allMatches.length} 場)</h3></div>
                <input type="text" style={{...styles.input, width: '120px', margin: 0}} value={filterTeam} onChange={e => setFilterTeam(e.target.value)} placeholder="篩選球隊" />
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
