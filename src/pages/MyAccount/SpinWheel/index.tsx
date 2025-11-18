import { useState, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Doughnut } from 'react-chartjs-2'
import './SpinWheel.css'

// 註冊 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

interface Coupon {
  id: string
  name: string
  discount: string
  color: string
  value: number
}

const coupons: Coupon[] = [
  { id: '1', name: '9折優惠', discount: '10% OFF', color: '#8f7f8f', value: 50 },
  { id: '2', name: '8折優惠', discount: '20% OFF', color: '"#f97066"', value: 50 },
  { id: '3', name: '免運券', discount: 'FREE SHIP', color: '#2e90fa', value: 50 },
  { id: '4', name: '7折優惠', discount: '30% OFF', color: '#fdb022', value: 50 },
  { id: '5', name: '滿千折百', discount: '$100 OFF', color: '#ee46bc', value: 50 },
  { id: '6', name: '買一送一', discount: 'BUY 1 GET 1', color: '#854CFF', value: 50 },
  { id: '7', name: '5折優惠', discount: '50% OFF', color: '#BB8FCE', value: 50 },
  { id: '8', name: '銘謝惠顧', discount: 'NEXT TIME', color: '#95A5A6', value: 50 },
]

interface SpinWheelProps {
  onWin?: (coupon: Coupon) => void
}

function SpinWheel({ onWin }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [randomRotation, setRandomRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  
  const chartRef = useRef<ChartJS<'doughnut', number[], unknown> | null>(null)

  // Chart 資料
  const data = {
    datasets: [
      {
        data: coupons.map((item) => item.value),
        backgroundColor: coupons.map((item) => item.color),
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: 5,
        cutout: '67%',
        rotation: randomRotation,
      },
    ],
    labels: coupons.map((item) => item.name),
  }

  // 旋轉函數
  function handleRotation() {
    if (spinning) return
    
    const chart = chartRef.current
    if (chart) {
      setSpinning(true)
      setShowResult(false)
      setWinnerIndex(null)
      
      // 先隨機選擇一個優惠券
      const randomIndex = Math.floor(Math.random() * coupons.length)
      
      // 計算每個扇形的角度
      const segmentAngle = 360 / coupons.length // 45度
      
      // 指針在頂部，扇形索引 0 的起始位置在頂部（由於 options.rotation = -90）
      // 扇形索引 i 的中心位置 = i * segmentAngle + segmentAngle/2
      // 要讓扇形 i 的中心對準頂部（0度位置，因為 options.rotation 已經處理了 -90）
      // 需要將扇形逆時針旋轉：-（i * segmentAngle + segmentAngle/2）
      // 為了保持累加和順時針旋轉，轉換為正數：360 - (i * segmentAngle + segmentAngle/2)
      
      const targetOffset = randomIndex * segmentAngle + segmentAngle / 2
      
      // 計算當前位置模 360
      const currentAngle = randomRotation % 360
      
      // 計算需要旋轉的角度（讓目標扇形對準指針）
      // 從 currentAngle 順時針旋轉到 (360 - targetOffset) 的距離
      let rotationNeeded = (360 - targetOffset - currentAngle) % 360
      if (rotationNeeded < 0) rotationNeeded += 360
      
      // 多轉幾圈（5-10圈）+ 精確對準角度
      const spins = Math.floor(Math.random() * 5) + 5 // 5-10圈
      const newRotation = randomRotation + (360 * spins) + rotationNeeded
      
      setRandomRotation(newRotation)
      chart.update()

      // 4秒後顯示結果
      setTimeout(() => {
        setWinnerIndex(randomIndex)
        setShowResult(true)
        setSpinning(false)
        
        // 只有不是「銘謝惠顧」才發放優惠券
        const wonCoupon = coupons[randomIndex]
        if (wonCoupon.id !== '8') {
          onWin?.(wonCoupon)
        }
      }, 4000)
    }
  }

  return (
    <div className="spin-wheel-wrapper">
      <div className="spin-wheel-content">
        {/* 中心顯示區域 */}
        <div className="spin-wheel-center">
          {spinning ? (
            <div className="center-text spinning-text">
              旋轉中
            </div>
          ) : showResult && winnerIndex !== null ? (
            <div className="center-text result-text">
              <div className="winner-name">{coupons[winnerIndex].name}</div>
              <div>{coupons[winnerIndex].discount}</div>
            </div>
          ) : (
            <div className="center-text ready-text">
              點擊開始
            </div>
          )}
        </div>

        {/* Chart.js 轉盤 */}
        <div className="chart-container">
          <Doughnut
            data={data}
            options={{
              plugins: { 
                legend: { display: false },
                tooltip: { enabled: false },
                datalabels: {
                  color: '#ffffff',
                  font: {
                    weight: 'bold' as const,
                    size: 13
                  },
                  formatter: (_value: any, context: any) => {
                    const coupon = coupons[context.dataIndex]
                    return `${coupon.name}\n${coupon.discount}`
                  },
                  textAlign: 'center' as const,
                  anchor: 'center' as const,
                  align: 'center' as const,
                  offset: 0,
                  textShadowColor: 'rgba(0, 0, 0, 0.8)',
                  textShadowBlur: 4
                } as any
              },
              rotation: -90,
              animation: {
                duration: 4000,
                easing: 'easeInOutQuart'
              }
            }}
            ref={chartRef}
          />
          
          {/* 指針 */}
          <div className="arrow-pointer">
            <svg
              className="arrow-svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 22 22 2 22"></polygon>
            </svg>
          </div>
        </div>
      </div>

      {/* 開始按鈕 */}
      <div className="spin-button-container">
        <button
          onClick={handleRotation}
          disabled={spinning}
          className="spin-button"
        >
          {spinning ? '旋轉中' : '開始抽獎'}
        </button>
      </div>
    </div>
  )
}

export default SpinWheel

