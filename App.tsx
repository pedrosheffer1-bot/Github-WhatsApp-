
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, Plus, Bell, Settings, LogOut, User, Send, Trash2 } from 'lucide-react';
import { FinanceAIService } from './geminiService';
import { Message, Transaction } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatBubble } from './components/ChatBubble';
import { DashboardView } from './components/DashboardView';
import { LandingPage } from './components/LandingPage';

// Custom Pulse Animation Component
const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, x: -10, scale: 0.9 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    className="flex justify-start mb-8 w-full"
  >
    <div className="px-6 py-5 rounded-[2rem] rounded-tl-sm bg-black/40 border border-[#00FF41]/20 flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,65,0.05)] backdrop-blur-md">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-[#00FF41] rounded-full shadow-[0_0_10px_#00FF41]"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.3, 1, 0.3],
            y: [0, -3, 0]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
      <span className="text-[10px] uppercase tracking-widest text-[#00FF41] ml-2 font-bold opacity-80">
        Processando
      </span>
    </div>
  </motion.div>
);

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('month');
  
  // Initialize messages from LocalStorage or default
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('finance_pro_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Map strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [{
      id: 'welcome',
      role: 'assistant',
      content: 'Bem-vindo ao centro de comando Finance Pro. Como posso otimizar seu patrimônio hoje? ✨',
      timestamp: new Date(),
    }];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_pro_txs');
    return saved ? JSON.parse(saved) : [];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiServiceRef = useRef<FinanceAIService | null>(null);

  useEffect(() => {
    aiServiceRef.current = new FinanceAIService();
  }, []);

  // Persist Transactions
  useEffect(() => {
    localStorage.setItem('finance_pro_txs', JSON.stringify(transactions));
  }, [transactions]);

  // Persist Chat History
  useEffect(() => {
    localStorage.setItem('finance_pro_chat_history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    // Small delay to account for layout shifts
    setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(scrollToBottom, [messages, isTyping, activeTab, view]);

  const handleClearHistory = () => {
    if (window.confirm("Deseja apagar todo o histórico de conversas?")) {
      const resetMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Histórico limpo. Pronto para novos registros. 💎',
        timestamp: new Date(),
      };
      setMessages([resetMessage]);
      localStorage.removeItem('finance_pro_chat_history');
    }
  };

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    if (aiServiceRef.current) {
      try {
        const { text, data } = await aiServiceRef.current.processMessage(inputText, transactions);
        
        if (data) {
          setTransactions(prev => [data, ...prev]);
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: text,
          timestamp: new Date(),
          metadata: data,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("AI Error", error);
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: "Desculpe, tive um problema de conexão. Tente novamente.",
            timestamp: new Date()
        }]);
      }
    }

    setIsTyping(false);
  }, [inputText, isTyping, transactions]);

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('app')} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden text-neutral-200 font-sans selection:bg-[#00FF41] selection:text-black">
      
      {/* Ultra Slim Nav Sidebar */}
      <nav className="w-20 bg-black border-r border-white/5 flex flex-col items-center py-8 gap-10 z-20">
        <button 
          onClick={() => setView('landing')}
          className="w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-[0_0_25px_rgba(0,255,65,0.3)] mb-4 hover:scale-110 transition-transform duration-300"
        >
           <div className="w-5 h-5 bg-black rounded-sm rotate-45"></div>
        </button>

        <div className="flex flex-col gap-6 w-full px-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white/10 text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'text-neutral-600 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-2xl transition-all duration-300 ${activeTab === 'chat' ? 'bg-white/10 text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'text-neutral-600 hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className="p-3 rounded-2xl text-neutral-600 hover:text-white hover:bg-white/5 transition-all duration-300">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-6 w-full px-4">
           <button className="p-3 rounded-2xl text-neutral-600 hover:text-white hover:bg-white/5 transition-all duration-300 relative">
             <Bell className="w-6 h-6" />
             <span className="absolute top-3 right-3 w-2 h-2 bg-[#00FF41] rounded-full animate-pulse"></span>
           </button>
           <button 
             onClick={() => setView('landing')}
             className="p-3 rounded-2xl text-neutral-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-300"
           >
             <LogOut className="w-6 h-6" />
           </button>
        </div>
      </nav>
      
      <main className="flex-1 flex flex-col h-full relative bg-[radial-gradient(circle_at_50%_0%,_rgba(0,255,65,0.03)_0%,_transparent_50%)]">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-3xl z-10 bg-black/50">
          <div className="flex items-center gap-4">
            <h2 className="luxury-font text-2xl tracking-tighter">Finance <span className="text-[#00FF41]">Pro</span></h2>
            <div className="h-4 w-px bg-white/10"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold">Black Label Edition</p>
          </div>

          <div className="flex items-center gap-6">
            {activeTab === 'chat' && (
              <button 
                onClick={handleClearHistory}
                className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 text-neutral-500 transition-all duration-300 border border-transparent hover:border-rose-500/20"
                title="Limpar Histórico"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-[pulse_3s_infinite]"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">System Online</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer p-1 rounded-full hover:bg-white/5 transition-colors pr-4">
              <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 bg-gradient-to-tr from-[#00FF41] to-black">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <User className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold group-hover:text-[#00FF41] transition-colors">John Doe</p>
                <p className="text-[9px] text-neutral-600 uppercase tracking-wider">Membro Ultra</p>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <DashboardView 
              key="dashboard"
              transactions={transactions} 
              filter={filter} 
              setFilter={setFilter} 
            />
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              <div className="flex-1 overflow-y-auto px-4 md:px-10 py-10 custom-scrollbar scroll-smooth">
                <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
                  {messages.length === 0 ? (
                    <div className="text-center mb-16 mt-auto">
                        <div className="w-20 h-20 bg-[#00FF41]/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-[#00FF41]/20 shadow-[0_0_40px_rgba(0,255,65,0.1)]">
                            <MessageSquare className="text-[#00FF41] w-8 h-8" />
                        </div>
                        <h2 className="luxury-font text-3xl font-light mb-2">Assistente Executivo</h2>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600">Inteligência Financeira Multimodal</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                        <div className="text-center mb-16 opacity-50 hover:opacity-100 transition-opacity duration-500">
                             <h2 className="luxury-font text-2xl font-light text-neutral-500">Finance Pro AI</h2>
                             <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-700 mt-2">Chat Encriptado Ponta-a-Ponta</p>
                        </div>
                        {messages.map(msg => (
                            <ChatBubble key={msg.id} message={msg} />
                        ))}
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {isTyping && <TypingIndicator />}
                  </AnimatePresence>
                  
                  <div ref={chatEndRef} className="h-4" />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 md:p-10 pb-12">
                <form 
                  onSubmit={handleSendMessage}
                  className="max-w-3xl mx-auto relative group"
                >
                  <div className="absolute inset-0 bg-[#00FF41]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="relative flex items-center">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Comande seu fluxo financeiro..."
                        className="w-full h-16 pl-8 pr-24 rounded-2xl bg-black/60 border border-white/10 focus:outline-none focus:border-[#00FF41]/30 transition-all text-sm placeholder:text-neutral-600 shadow-2xl backdrop-blur-xl text-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isTyping}
                        className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-[#00FF41] text-black flex items-center justify-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:shadow-[0_0_25px_rgba(0,255,65,0.4)] hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </div>
                </form>
                <p className="text-center text-[10px] text-neutral-700 mt-4 uppercase tracking-widest">
                    Pressione Enter para processar
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for quick add */}
      <AnimatePresence>
        {activeTab === 'dashboard' && (
            <motion.button 
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                onClick={() => setActiveTab('chat')}
                className="fixed bottom-10 right-10 w-16 h-16 bg-[#00FF41] rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(0,255,65,0.3)] hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
