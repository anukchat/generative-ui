'use client'

import { ReactNode, createContext, useContext } from 'react'
import { useChat, type UseChatHelpers, type Message } from 'ai/react'
import { StockChart } from '@/components/StockChart'
import { WeatherCard } from '@/components/WeatherCard'

// Use the UseChatHelpers type from our declaration file
type ChatContextType = UseChatHelpers

// Create a context to share chat state across components
const ChatContext = createContext<ChatContextType | null>(null)

// Hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

export function MyRuntimeProvider({ children }: { children: ReactNode }) {
  // Use the useChat hook to get all the chat functionality
  const chatHelpers = useChat({
    api: '/api/chat',
    onResponse: (response: any) => {
      // This is called when a response is received from the API
      console.log('Response received:', response)
    },
  })
  
  // The chatHelpers already has the correct type

  // Function to parse and render JSON components from messages
  const parseMessageContent = (content: string) => {
    try {
      // Try to find JSON objects in the message content
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g
      let processedContent = content
      let match
      
      while ((match = jsonRegex.exec(content)) !== null) {
        try {
          // Parse the JSON
          const jsonData = JSON.parse(match[1])
          
          // Replace JSON blocks with a more readable format
          if (jsonData.type === 'stock_chart' || jsonData.type === 'weather_card') {
            // Create a placeholder for the component
            const placeholder = `[${jsonData.type.toUpperCase()} COMPONENT]`
            processedContent = processedContent.replace(match[0], placeholder)
          }
        } catch (e) {
          console.error('Error parsing JSON:', e)
        }
      }
      
      return processedContent
    } catch (e) {
      console.error('Error processing message content:', e)
      return content
    }
  }
  
  // Function to render actual components based on message content
  const renderMessageComponents = (content: string) => {
    const components: JSX.Element[] = []
    
    try {
      // Find JSON objects in the message content
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/g
      let match
      
      while ((match = jsonRegex.exec(content)) !== null) {
        try {
          // Parse the JSON
          const jsonData = JSON.parse(match[1])
          
          if (jsonData.type === 'stock_chart') {
            components.push(
              <div key={`stock-${jsonData.data.symbol}`} className="my-4">
                <StockChart 
                  symbol={jsonData.data.symbol}
                  price={jsonData.data.price}
                  change={jsonData.data.change}
                  percentChange={jsonData.data.percent_change}
                />
              </div>
            )
          } else if (jsonData.type === 'weather_card') {
            components.push(
              <div key={`weather-${jsonData.data.location}`} className="my-4">
                <WeatherCard 
                  location={jsonData.data.location}
                  temperature={jsonData.data.temperature}
                  condition={jsonData.data.condition}
                  humidity={jsonData.data.humidity}
                />
              </div>
            )
          }
        } catch (e) {
          console.error('Error rendering component:', e)
        }
      }
    } catch (e) {
      console.error('Error processing components:', e)
    }
    
    return components
  }

  // Provide the chat context to children
  return (
    <ChatContext.Provider value={chatHelpers}>
      {children}
    </ChatContext.Provider>
  )
}