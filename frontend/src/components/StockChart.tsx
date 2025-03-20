import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StockChartProps {
  symbol: string
  price: number
  change: number
  percentChange: string
}

export function StockChart({ symbol, price, change, percentChange }: StockChartProps) {
  // Create mock data for the chart
  const generateMockData = () => {
    const data = []
    const basePrice = price - (change * 2)
    const steps = 10
    const stepChange = change / steps
    
    for (let i = 0; i <= steps; i++) {
      data.push({
        time: `${i}h`,
        price: basePrice + (stepChange * i),
      })
    }
    
    return data
  }
  
  const data = generateMockData()
  const isPositive = change >= 0
  
  return (
    <div className="stock-chart w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold">{symbol}</h3>
          <p className="text-gray-600">Stock Price</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${price.toFixed(2)}</p>
          <p className={`${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change.toFixed(2)} ({percentChange})
          </p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#16a34a' : '#dc2626'} 
              strokeWidth={2} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
