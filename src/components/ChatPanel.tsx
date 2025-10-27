"use client";
import React, { useEffect, useRef, useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'

interface ChatPanelProps {
  eventId: number
}

interface ChatMessageView {
  id: string
  user_id: string
  content: string
  created_at: string
}

export default function ChatPanel({ eventId }: ChatPanelProps) {
  const { account, connectWallet, formatAddress } = useWallet()
  const [messages, setMessages] = useState<ChatMessageView[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const es = new EventSource(`/api/chat/stream?eventId=${eventId}`)
    const onMessages = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data)
        if (Array.isArray(data)) {
          setMessages(prev => {
            const merged = [...prev]
            for (const m of data) {
              if (!merged.find(x => x.id === m.id)) merged.push(m)
            }
            merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            return merged
          })
        }
      } catch (e) {}
    }
    es.addEventListener('messages', onMessages)
    es.onerror = () => {}
    return () => es.close()
  }, [eventId])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages.length])

  const sendMessage = async () => {
    if (!input.trim()) return
    if (!account) {
      setError('请先连接钱包后再发送消息')
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, content: input, walletAddress: account })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      }
      setInput('')
    } catch (e: any) {
      setError(e?.message || '发送失败')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-0 overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-between">
        <div className="font-semibold">即时交流</div>
        <div className="text-xs opacity-90">类似 Discord 的频道</div>
      </div>

      <div ref={listRef} className="h-64 overflow-y-auto p-4 space-y-3 bg-white/60">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">暂无消息，快来开启讨论吧！</div>
        )}
        {messages.map(m => (
          <div key={m.id} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold">
              {formatAddress(m.user_id).slice(0,2)}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-800">
                <span className="font-medium mr-2">{formatAddress(m.user_id)}</span>
                <span className="text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div className="mt-1 text-gray-700 leading-relaxed break-words">{m.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 bg-white">
        {!account ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">发送消息需连接钱包</div>
            <button onClick={() => connectWallet()} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm">连接钱包</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
              placeholder="输入消息，按回车发送"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80"
            />
            <button onClick={sendMessage} disabled={sending} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {sending ? '发送中…' : '发送'}
            </button>
          </div>
        )}
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      </div>
    </div>
  )
}