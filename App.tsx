
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, Plus, Bell, Settings, LogOut, User } from 'lucide-react';
import { FinanceAIService } from './geminiService';
import { Message, Transaction } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatBubble } from './components/ChatBubble';
import { DashboardView } from './components/DashboardView';
import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('month');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bem-vindo ao centro de comando Finance Pro. Como posso otimizar seu patrimônio hoje? ✨',
      timestamp: new Date(),
    }
  ]);
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

  useEffect(() => {
    localStorage.setItem('finance_pro_txs', JSON.stringify(transactions));
  }, [transactions]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping, activeTab, view]);

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
    }

    setIsTyping(false);
  }, [inputText, isTyping, transactions]);

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('app')} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#000000] overflow-hidden text-neutral-200">
      
      {/* Ultra Slim Nav Sidebar */}
      <nav className="w-20 bg-black border-r border-white/5 flex flex-col items-center py-8 gap-10">
        <button 
          onClick={() => setView('landing')}
          className="w-10 h-10 rounded-xl bg-[#00FF41] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.4)] mb-4 hover:scale-110 transition-transform"
        >
           <div className="w-5 h-5 bg-black rounded-sm rotate-45"></div>
        </button>

        <div className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-[#00FF41]' : 'text-neutral-600 hover:text-white'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-white/10 text-[#00FF41]' : 'text-neutral-600 hover:text-white'}`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button className="p-3 rounded-2xl text-neutral-600 hover:text-white transition-all">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-6">
           <button className="p-3 rounded-2xl text-neutral-600 hover:text-white transition-all">
             <Bell className="w-6 h-6" />
           </button>
           <button 
             onClick={() => setView('landing')}
             className="p-3 rounded-2xl text-neutral-600 hover:text-rose-500 transition-all"
           >
             <LogOut className="w-6 h-6" />
           </button>
        </div>
      </nav>
      
      <main className="flex-1 flex flex-col h-full relative bg-[radial-gradient(circle_at_50%_0%,_rgba(0,255,65,0.05)_0%,_transparent_50%)]">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-3xl z-10">
          <div className="flex items-center gap-4">
            <h2 className="luxury-font text-xl tracking-tighter">Finance <span className="text-[#00FF41]">Pro</span></h2>
            <div className="h-4 w-px bg-white/10"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-bold">Black Label Edition</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/5">
              <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold">AI Core Online</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-bold group-hover:text-[#00FF41] transition-colors">John Doe</p>
                <p className="text-[9px] text-neutral-600 uppercase">Membro Ultra</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 bg-gradient-to-tr from-[#00FF41] to-black">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <User className="w-5 h-5 text-neutral-400" />
                </div>
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
              className="flex-1 flex flex-col overflow-hidden relative"
            >
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-16">
                     <div className="w-16 h-16 bg-[#00FF41]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00FF41]/20">
                        <MessageSquare className="text-[#00FF41] w-8 h-8" />
                     </div>
                     <h2 className="luxury-font text-2xl font-light">Assistente Executivo</h2>
                     <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 mt-2">Inteligência Financeira Multimodal</p>
                  </div>
                  {messages.map(msg => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {isTyping && (
                    <div className="flex justify-start mb-6">
                      <div className="glass px-6 py-4 rounded-2xl flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#00FF41] rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-[#00FF41] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1 h-1 bg-[#00FF41] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-10">
                <form 
                  onSubmit={handleSendMessage}
                  className="max-w-3xl mx-auto relative"
                >
                  <div className="absolute inset-0 bg-[#00FF41]/5 blur-3xl rounded-full"></div>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Comande seu fluxo financeiro..."
                    className="w-full h-16 pl-8 pr-20 rounded-2xl glass border-white/10 focus:outline-none focus:border-[#00FF41]/30 transition-all text-sm placeholder:text-neutral-700 shadow-2xl relative z-10"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="absolute right-3 top-3 h-10 px-6 rounded-xl bg-[#00FF41] text-black font-bold text-[10px] uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all z-20 shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                  >
                    Processar
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for quick add */}
      <button 
        onClick={() => setActiveTab('chat')}
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#00FF41] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(0,255,65,0.4)] hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default App;
