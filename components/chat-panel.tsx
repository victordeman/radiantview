"use client"

import { useState } from "react"
import { MessageSquare, Send, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: string
}

const placeholderMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "Dr. Sarah Chen",
    content: "Can you review the CT findings on the Johnson case?",
    timestamp: "10:32 AM",
  },
  {
    id: "2",
    sender: "Dr. Mike Ross",
    content: "I\u2019ll take a look in 5 minutes.",
    timestamp: "10:34 AM",
  },
  {
    id: "3",
    sender: "Dr. Sarah Chen",
    content: "Thanks! The lung nodule on slice 42 needs a second opinion.",
    timestamp: "10:35 AM",
  },
]

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(placeholderMessages)

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "You",
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([...messages, newMsg])
    setMessage("")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        size="icon"
      >
        <MessageSquare className="size-5" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-20 right-6 z-50 w-80 rounded-xl border border-border bg-card shadow-2xl flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <span className="font-semibold text-sm">Team Chat</span>
          <span className="text-xs text-muted-foreground">(Preview)</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[350px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.sender === "You" ? "flex-row-reverse" : ""}`}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                {getInitials(msg.sender)}
              </AvatarFallback>
            </Avatar>
            <div className={`max-w-[75%] ${msg.sender === "You" ? "text-right" : ""}`}>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs font-medium">{msg.sender}</span>
                <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
              </div>
              <div
                className={`text-sm p-2 rounded-lg ${
                  msg.sender === "You"
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Input */}
      <div className="p-2 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="text-sm bg-background border-border h-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend()
          }}
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <Send className="size-3.5" />
        </Button>
      </div>

      {/* WebSocket notice */}
      <div className="px-3 pb-2">
        <p className="text-[10px] text-muted-foreground text-center">
          Real-time messaging via WebSocket coming in Phase 5
        </p>
      </div>
    </div>
  )
}
