import { useState, useEffect } from 'react'
import { Upload, Calendar, Send, CheckCircle2, Lock, ShieldCheck, LogOut, Filter, Table as TableIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Tesseract from 'tesseract.js'

// 內聯樣式
const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', color: '#ffffff', fontFamily: 'sans-serif' },
  glassCard: { background: '#1e293b', border: '2px solid #334155', borderRadius: '12px', padding: '25px', marginTop: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  btnPrimary: { background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  input: { width: '100%', maxWidth: '300px', padding: '10px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', marginBottom: '10px' }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [allMatches, setAllMatches] = useState(null)
  const [filterTeam, setFilterTeam] = useState('柏飛')

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin888'

  useEffect(() => {
    if (localStorage.getItem('isBallTeamAdmin') === 'true') setIsAuthenticated(true)
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsProcessing(true)
    setOcrProgress(0)

    try {
      // 使用 Tesseract.js 辨識繁體中文與英文 (適用於隊名與時間)
      const result = await Tesseract.recognize(file, 'chi_tra+eng', {
        logger: m => {
          if (m.status === 'recognizing text') setOcrProgress(Math.floor(m.progress * 100))
        }
      })

      const text = result.data.text
      console.log("辨識原始文字:", text)

      // 簡易的表格解析邏輯 (針對日期/時間/對戰 進行正規表達式抓取)
      const lines = text.split('\n').filter(l => l.trim().length > 5)
      const parsedMatches = []

      // 嘗試找尋日期 (MM/DD) 與 對戰 (Team1-Team2 或 Team1 vs Team2)
      let currentDate = "未辨識"
      lines.forEach(line => {
        // 匹配日期格式 如 3/15, 03/15, 10/20
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2})/)
        if (dateMatch) currentDate = dateMatch[1]

        // 匹配對戰格式 如 A-B, A vs B, A對B
        const teamMatch = line.match(/(.+)([vV][sS]|-|對)(.+)/)
        const timeMatch = line.match(/(\d{2}[:~]\d{2})/)

        if (teamMatch) {
          parsedMatches.push({
            date: currentDate,
            time: timeMatch ? timeMatch[0] : "待確認",
            teams: [teamMatch[1].trim().substring(0, 10), teamMatch[3].trim().substring(0, 10)]
          })
        }
      })

      setAllMatches(parsedMatches.length > 0 ? parsedMatches : [
        { date: "辨識失敗", time: "請重試", teams: ["無法解析文字", "請確認圖片範例"] }
      ])
    } catch (err) {
      console.error("OCR 錯誤:", err)
      alert("辨識過程發生錯誤")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={styles.container}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#60a5fa' }}>春風壘球 AI 辨識管理</h1>
        <p style={{ color: '#94a3b8' }}>使用 Tesseract 局部 OCR 技術</p>
      </header>

      {!isAuthenticated ? (
        <div style={{...styles.glassCard, maxWidth: '400px', margin: '0 auto', textAlign: 'center'}}>
          <h3>管理者登入</h3>
          <input type="password" style={styles.input} value={password} onChange={e => setPassword(e.target.value)} />
          <button style={styles.btnPrimary} onClick={() => password === ADMIN_PASSWORD && setIsAuthenticated(true)}>登入</button>
        </div>
      ) : (
        <>
          <div style={styles.glassCard}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <Upload size={40} color="#3b82f6" />
              <h3>上傳賽程圖片進行真實辨識</h3>
              <div style={{ width: '100%', background: '#0f172a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${ocrProgress}%`, background: '#3b82f6', height: '100%', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ fontSize: '0.8rem' }}>{isProcessing ? `正在辨識中... ${ocrProgress}%` : '請上傳清晰的表格圖片'}</p>
              <label style={{ ...styles.btnPrimary, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                {isProcessing ? <Loader2 className="animate-spin" /> : '選擇檔案'}
                <input type="file" hidden onChange={handleFileUpload} accept="image/*" disabled={isProcessing} />
              </label>
            </div>
          </div>

          {allMatches && (
            <div style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TableIcon size={20} /> <h3>辨識清單</h3></div>
                <input type="text" style={{...styles.input, width: '120px', margin: 0}} value={filterTeam} onChange={e => setFilterTeam(e.target.value)} placeholder="篩選球隊" />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead><tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}><th>日期</th><th>時間</th><th>對戰組合</th></tr></thead>
                  <tbody>
                    {allMatches.filter(m => m.teams.some(t => t.includes(filterTeam))).map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '12px' }}>{m.date}</td>
                        <td style={{ padding: '12px' }}>{m.time}</td>
                        <td style={{ padding: '12px' }}>{m.teams[0]} vs {m.teams[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button style={{ ...styles.btnPrimary, background: '#10b981', marginTop: '20px', width: '100%' }}>
                <Send size={18} /> 發送 LINE 推播通知
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
