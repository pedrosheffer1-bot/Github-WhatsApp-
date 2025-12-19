
import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] lg:max-w-[75%] px-7 py-5 rounded-3xl relative ${
        isUser 
          ? 'bg-[#00FF41] text-black font-semibold shadow-[0_10px_30px_rgba(0,255,65,0.15)]' 
          : 'glass text-white border border-white/5'
      }`}>
        {!isUser && (
          <div className="absolute -left-2 -top-2 w-6 h-6 rounded-lg bg-black border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#00FF41]"></div>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap tracking-tight">
          {message.content}
        </p>
        <div className={`text-[8px] mt-3 flex items-center uppercase tracking-widest font-bold ${isUser ? 'text-black/50' : 'text-neutral-600'}`}>
          {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(message.timestamp)}
          {!isUser && (
            <span className="ml-3 px-1.5 py-0.5 rounded-sm border border-neutral-800">Verified System</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
