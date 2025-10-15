import LiquidEther from './components/backgrounds/LiquidEther/LiquidEther'
import './components/backgrounds/LiquidEther/LiquidEther.css'
import Login from './pages/Login'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'black' }}>
      {/* 背景特效元件 */}
      <LiquidEther
        colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />
      {/* 標題 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '40px 0 0 0',
        textAlign: 'center',
        zIndex: 10,
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        海大拍賣系統
      </div>
      {/* 登入表單 (置中顯示) */}
      <div
        style={{
          position: 'absolute',
          zIndex: 11, // 蓋過標題
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          
          width: '50vw',
          height: '50vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div>
          <Login />
        </div>
      </div>
    </div>
  )
}

export default App
