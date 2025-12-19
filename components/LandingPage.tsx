
import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, ShieldCheck, Zap, ArrowRight, 
  Smartphone, BarChart3, Lock, CheckCircle2 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const steps = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Mande uma mensagem",
    desc: "Apenas diga 'Gastei 50 reais com sushi' ou mande um áudio rápido."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "IA Categoriza",
    desc: "Nossa IA processa o valor, categoria e gera o registro instantaneamente."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Veja seu gráfico",
    desc: "Acompanhe seu patrimônio crescer com relatórios executivos automáticos."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-black text-white selection:bg-[#00FF41] selection:text-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#00FF41]/5 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Invite Only • Beta v2.5</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-light luxury-font tracking-tighter leading-tight mb-8">
            Controle seus gastos <br />
            <span className="text-[#00FF41]">sem abrir nenhum app.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            O Finance Pro AI transforma seu WhatsApp em um centro de comando financeiro. 
            Mande uma mensagem, nós cuidamos do resto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="group relative px-10 py-5 bg-[#00FF41] text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,255,65,0.2)]"
            >
              <div className="flex items-center gap-2 relative z-10">
                Conectar meu WhatsApp <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <button className="px-10 py-5 glass border-white/10 rounded-2xl font-medium hover:bg-white/5 transition-all">
              Ver Demo
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mt-24 relative w-full max-w-5xl px-4"
        >
          <div className="glass rounded-t-[3rem] p-4 border-b-0">
             <div className="bg-black/50 rounded-t-[2.5rem] p-6 md:p-12 overflow-hidden border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto rounded-3xl opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
             </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works & Mockup Section */}
      <section className="py-32 px-6 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-16">
            <div>
              <h2 className="text-4xl md:text-5xl luxury-font tracking-tight mb-6">Simplicidade <br />levada ao extremo.</h2>
              <p className="text-neutral-500 max-w-md">Esqueça planilhas complexas e apps lentos. A conversa é a interface definitiva.</p>
            </div>

            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF41]">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">{step.title}</h4>
                    <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#00FF41]/10 blur-[100px] rounded-full" />
            <motion.div 
              initial={{ rotateY: 15, rotateX: 5 }}
              whileHover={{ rotateY: 0, rotateX: 0 }}
              className="relative mx-auto w-full max-w-[320px] aspect-[9/19] bg-black border-[8px] border-neutral-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col transition-transform duration-700 ease-out"
            >
              {/* iPhone Style Top Bar */}
              <div className="h-10 bg-neutral-900 flex items-center justify-center">
                 <div className="w-20 h-5 bg-black rounded-full" />
              </div>
              
              {/* WhatsApp UI Simulation */}
              <div className="flex-1 bg-neutral-950 flex flex-col p-4 gap-4 overflow-hidden">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                   <div className="w-8 h-8 rounded-full bg-[#00FF41] flex items-center justify-center text-black font-bold text-[10px]">FP</div>
                   <div>
                     <p className="text-[10px] font-bold">Finance Pro AI</p>
                     <p className="text-[8px] text-[#00FF41]">online</p>
                   </div>
                </div>

                {/* Message User */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="self-end bg-[#00FF41] text-black text-[11px] p-3 rounded-2xl rounded-tr-none max-w-[80%] font-medium"
                >
                  Gastei 150 reais no Jantar hoje no Fasano
                </motion.div>

                {/* Message Bot */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 }}
                  className="self-start glass text-white text-[11px] p-3 rounded-2xl rounded-tl-none max-w-[80%] border-white/5"
                >
                  <p className="font-mono text-[9px] text-[#00FF41] mb-2">{"{"}"valor": 150.0, "categoria": "Gastronomia"{"}"}</p>
                  ✅ Registrado! Seu estilo de vida é um investimento. R$ 150,00 em Gastronomia. 🥂
                </motion.div>

                <div className="mt-auto h-10 glass rounded-full flex items-center px-4">
                   <p className="text-[10px] text-neutral-600">Escreva uma mensagem...</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 text-[#00FF41]">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-4xl md:text-6xl luxury-font tracking-tight">Privacidade é o <br />nosso maior ativo.</h2>
          <p className="text-neutral-500 text-lg">Seus dados financeiros são criptografados de ponta-a-ponta e nunca são vendidos. Somente você e sua IA têm acesso.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Criptografia Militar", desc: "AES-256 bits em repouso." },
              { title: "Zero Data-Mining", desc: "Seus dados são privados." },
              { title: "GDPR Compliant", desc: "Total controle dos seus dados." }
            ].map((item, i) => (
              <div key={i} className="glass p-8 rounded-3xl text-left border-white/5">
                <ShieldCheck className="w-6 h-6 text-[#00FF41] mb-4" />
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="luxury-font text-3xl tracking-tighter mb-4">Finance <span className="text-[#00FF41]">Pro</span></h2>
            <p className="text-neutral-600 text-xs uppercase tracking-[0.3em]">The Private Banking AI Core</p>
          </div>

          <div className="flex gap-10 text-neutral-500 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Segurança</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>

          <button 
            onClick={onGetStarted}
            className="flex items-center gap-3 px-8 py-4 glass border-white/10 rounded-2xl hover:bg-white/5 transition-all text-[#00FF41]"
          >
            <Smartphone className="w-5 h-5" />
            Acessar Alpha
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-[10px] text-neutral-700 uppercase tracking-widest">
          © 2024 Finance Pro AI. Developed for the High-Net-Worth Individual.
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-10 right-10 z-[60]">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onGetStarted}
          className="w-16 h-16 bg-[#00FF41] rounded-full flex items-center justify-center text-black shadow-[0_0_50px_rgba(0,255,65,0.4)]"
        >
          <MessageCircle className="w-8 h-8" />
        </motion.button>
      </div>
    </div>
  );
};
