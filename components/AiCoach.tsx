
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage, MessageSender } from '../types';
import { createCoachChat } from '../services/geminiService';
import { BrainIcon, SparklesIcon } from './Icons';
import { useI18n } from '../i18n/context';

interface AiCoachProps {
  skillTitle: string;
}

const AiCoach: React.FC<AiCoachProps> = ({ skillTitle }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useI18n();

  useEffect(() => {
    const newChat = createCoachChat(skillTitle, language);
    setChat(newChat);
    setMessages([
      {
        sender: MessageSender.AI,
        text: t('aiCoach.initialMessage', { skillTitle }),
      },
    ]);
  }, [skillTitle, language, t]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { sender: MessageSender.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const stream = await chat.sendMessageStream({ message: input });
        
        let aiResponseText = '';
        setMessages(prev => [...prev, { sender: MessageSender.AI, text: '' }]);

        for await (const chunk of stream) {
            aiResponseText += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = aiResponseText;
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = { sender: MessageSender.AI, text: "Sorry, I'm having trouble connecting right now. Please try again later." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-base-200 rounded-lg shadow-lg flex flex-col h-[600px]">
      <div className="p-4 border-b border-base-300 flex items-center gap-3">
        <BrainIcon className="w-6 h-6 text-brand-primary" />
        <h3 className="text-xl font-bold text-white">{t('aiCoach.title')}</h3>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === MessageSender.AI && <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0 text-white font-bold">AI</div>}
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === MessageSender.USER ? 'bg-brand-primary text-white rounded-br-none' : 'bg-base-300 text-base-content rounded-bl-none'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              {isLoading && msg.sender === MessageSender.AI && index === messages.length - 1 && <SparklesIcon className="w-5 h-5 inline-block ms-2 animate-pulse-fast"/>}
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-base-100 border border-base-300 rounded-md p-3 text-base-content focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            placeholder={t('aiCoach.inputPlaceholder')}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-primary text-white font-semibold px-4 rounded-md hover:bg-brand-secondary transition disabled:bg-base-300 disabled:cursor-not-allowed">
            {t('aiCoach.send')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiCoach;
