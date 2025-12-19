
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const ref = useRef<HTMLDivElement>(null);

  // Parallax effect: tracks the element's position in the viewport
  // As the user scrolls, the bubble moves slightly opposite to the scroll direction
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ y }} // Apply parallax shift
      className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] lg:max-w-[75%] px-8 py-6 rounded-[2rem] relative backdrop-blur-xl border ${
        isUser 
          ? 'bg-[#00FF41] border-[#00FF41]/50 text-black font-semibold shadow-[0_10px_40px_-10px_rgba(0,255,65,0.3)]' 
          : 'bg-black/40 border-white/10 text-neutral-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]'
      }`}>
        {!isUser && (
          <div className="absolute -left-3 -top-3 w-8 h-8 rounded-xl bg-black border border-[#00FF41]/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.2)] z-10">
             <div className="w-2.5 h-2.5 rounded-full bg-[#00FF41] animate-pulse shadow-[0_0_10px_#00FF41]"></div>
          </div>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap tracking-wide font-light">
          {message.content}
        </p>

        <div className={`text-[9px] mt-4 flex items-center uppercase tracking-[0.2em] font-bold ${isUser ? 'text-black/60' : 'text-neutral-500'}`}>
          {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))}
          {!isUser && (
            <span className="ml-3 flex items-center gap-1.5 border-l border-white/10 pl-3">
              <span className="w-1 h-1 rounded-full bg-[#00FF41]"></span>
              AI Executive
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
