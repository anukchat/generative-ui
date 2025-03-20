'use client'

import { useEffect } from 'react'
import { type Message } from 'ai/react'
import { useChatContext } from './providers'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Generative UI Demo</h1>
        
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <AIChat />
        </div>
      </div>
    </main>
  )
}

function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChatContext()
  
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-semibold">Welcome to the Generative UI Demo</h2>
            <p className="text-gray-500 mt-2">Try asking about stocks or weather. For example:</p>
            <div className="mt-4 space-y-2">
              <button
                className="block w-full p-2 bg-gray-100 hover:bg-gray-200 rounded text-left"
                onClick={() => handleSubmit({ preventDefault: () => {}, currentTarget: { value: 'What\'s the current price of AAPL?' } } as any)}
              >
                What's the current price of AAPL?
              </button>
              <button
                className="block w-full p-2 bg-gray-100 hover:bg-gray-200 rounded text-left"
                onClick={() => handleSubmit({ preventDefault: () => {}, currentTarget: { value: 'Show me the stock information for MSFT' } } as any)}
              >
                Show me the stock information for MSFT
              </button>
              <button
                className="block w-full p-2 bg-gray-100 hover:bg-gray-200 rounded text-left"
                onClick={() => handleSubmit({ preventDefault: () => {}, currentTarget: { value: 'What\'s the weather forecast for London?' } } as any)}
              >
                What's the weather forecast for London?
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: Message, i: number) => (
              <div
                key={i}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex">
          <input
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            placeholder="Ask about stocks or weather..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}