"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { ChatBubble } from "@/components/ChatBubble";
import { SuggestionChip } from "@/components/SuggestionChip";
import { VoiceInputButton } from "@/components/VoiceInputButton";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
  isVoice?: boolean;
  followUps?: string[];
}

const SUGGESTIONS = [
  { label: "Find Restrooms", icon: "wc" },
  { label: "Next Match Info", icon: "sports_soccer" },
  { label: "Order Concessions", icon: "fastfood" },
  { label: "Least Crowded Exit", icon: "exit_to_app" },
];

export default function AssistantPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en!;
  
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceInputError, setVoiceInputError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize session and welcome message
  useEffect(() => {
    setSessionId(`sess_${Math.floor(100000 + Math.random() * 900000)}`);
    setMessages([
      {
        role: "model",
        content: "Welcome to StadiumMind. I am connected to live stadium telemetry. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        followUps: ["Find Restrooms", "Next Match Info", "Order Concessions"],
      },
    ]);
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string, isVoiceMessage = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      role: "user",
      content: trimmed,
      timestamp: userTime,
      isVoice: isVoiceMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setVoiceInputError(null);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          language,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from assistant");
      }

      const data = await response.json();
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      const botMsg: Message = {
        role: "model",
        content: data.reply,
        timestamp: botTime,
        followUps: data.followUps || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const errorMsg: Message = {
        role: "model",
        content: "I'm sorry, I encountered a communication error with the venue interface. Please try again.",
        timestamp: botTime,
        followUps: ["Find Restrooms", "Next Match Info"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleSpeechResult = (transcript: string) => {
    setInput(transcript);
    handleSendMessage(transcript, true);
  };

  const handleSpeechError = (error: string) => {
    setVoiceInputError(error);
  };

  return (
    <div className="flex-1 flex flex-col pt-4 max-w-3xl mx-auto w-full relative h-[calc(100vh-72px)] overflow-hidden">
      {/* Accessible h1 for screen readers */}
      <h1 className="sr-only">AI Concierge Assistant</h1>
      {/* Ambient background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" style={{ backgroundImage: "radial-gradient(#e9c349 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Suggestion Chips Header */}
      <div className="w-full overflow-x-auto no-scrollbar py-3 px-container-padding flex gap-3 shrink-0 border-b border-outline-variant/20 bg-background/90 backdrop-blur-sm sticky top-0 z-20">
        {SUGGESTIONS.map((s, idx) => (
          <SuggestionChip
            key={idx}
            label={s.label}
            iconName={s.icon}
            onClick={() => handleSendMessage(s.label)}
          />
        ))}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-container-padding py-6 flex flex-col gap-6 no-scrollbar">
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
            isVoice={msg.isVoice}
            followUps={msg.followUps}
            onFollowUpClick={(text) => handleSendMessage(text)}
          />
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs font-data-mono text-tertiary animate-pulse mr-auto pl-12">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
            <span>AI Concierge thinking...</span>
          </div>
        )}
        {voiceInputError && (
          <div className="text-xs font-data-mono text-error mr-auto pl-12">
            Voice Error: {voiceInputError}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="px-container-padding py-4 bg-background border-t border-outline-variant/30 flex items-end gap-3 shrink-0 z-20"
      >
        <div className="flex-1 bg-surface-container-low rounded-[24px] border border-outline-variant/50 focus-within:border-tertiary focus-within:bg-surface-container-highest transition-colors flex items-center px-4 min-h-[56px]">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 select-none">
            support_agent
          </span>
          <input
            type="text"
            id="assistant-chat-input"
            name="assistant-chat-input"
            aria-label="Type your message to the AI concierge"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.askAssistantPlaceholder}
            className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant font-body-md focus:ring-0 focus:outline-none py-3"
            disabled={sending}
          />
        </div>
        
        {/* Voice Input Button */}
        <VoiceInputButton
          languageCode={language}
          onSpeechResult={handleSpeechResult}
          onError={handleSpeechError}
        />
      </form>
    </div>
  );
}
