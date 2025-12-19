import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, Wallet, Utensils, Car, ShoppingBag, 
  Gamepad2, Coffee, ArrowUpRight, ShieldCheck,
  CreditCard, Briefcase, Heart, Plane, MoreHorizontal
} from 'lucide-react';
import { Transaction } from '../types';

interface DashboardViewProps {
  transactions: Transaction[];
  filter: 'today' | 'week' | 'month';
  setFilter: (f: 'today' | 'week' | 'month') => void;
}

const COLORS = ['#00FF41', '#d4af37', '#e5e5e5', '#404040', '#737373'];

const CategoryIcon = ({ category }: { category: string | null | undefined }) => {
  const cat = (category || 'outros').toLowerCase();
  
  if (cat.includes('comida') || cat.includes('restaurante') || cat.includes('gastronomia')) 
    return <Utensils className="w-4 h-4" />;
  if (cat.includes('transporte') || cat.includes('carro') || cat.includes('uber')) 
    return <Car className="w-4 h-4" />;
  if (cat.includes('compras') || cat.includes('shopping') || cat.includes('varejo')) 
    return <ShoppingBag className="w-4 h-4" />;
  if (cat.includes('lazer') || cat.includes('entretenimento') || cat.includes('game')) 
    return <Gamepad2 className="w-4 h-4" />;
  if (cat.includes('café') || cat.includes('starbucks') || cat.includes('lanche')) 
    return <Coffee className="w-4 h-4" />;
  if (cat.includes('saúde') || cat.includes('farmácia') || cat.includes('médico')) 
    return <Heart className="w-4 h-4" />;
  if (cat.includes('viagem') || cat.includes('hotel') || cat.includes('vôo')) 
    return <Plane className="w-4 h-4" />;
  if (cat.includes('trabalho') || cat.includes('investimento') || cat.includes('salário')) 
    return <Briefcase className="w-4 h-4" />;
  
  return <MoreHorizontal className="w-4 h-4" />;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ transactions, filter, setFilter }) => {
  
  const chartData = useMemo(() => {
    // Agrupa transações por dia para o gráfico de área
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTxs = transactions.filter(t => t.timestamp.startsWith(date));
      const gastos = dayTxs.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
      const ganhos = dayTxs.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
      return {
        name: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        gastos,
        ganhos
      };
    });
  }, [transactions]);

  const topTransactions = useMemo(() => {
    return [...transactions].slice(0, 5);
  }, [transactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-10 custom-scrollbar"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="luxury-font text-4xl font-light">Visão Executiva</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-600 mt-2 font-bold">Relatório de Performance Patrimonial</p>
          </div>
          
          <div className="flex glass p-1 rounded-xl border-white/5">
            {(['today', 'week', 'month'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${
                  filter === f ? 'bg-white/10 text-[#00FF41]' : 'text-neutral-500 hover:text-white'
                }`}
              >
                {f === 'today' ? 'Hoje' : f === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area Chart */}
          <div className="lg:col-span-2 glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp className="w-24 h-24 text-[#00FF41]" />
            </div>
            <div className="mb-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Fluxo de Caixa</h3>
               <p className="text-xs text-neutral-600">Performance dos últimos 7 períodos ativos</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF41" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00FF41" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#444', fontSize: 10}} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="#00FF41" 
                    fillOpacity={1} 
                    fill="url(#colorGastos)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-6">
             <div className="glass rounded-[2rem] p-8 border-white/5 group hover:border-[#00FF41]/30 transition-all cursor-default">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 rounded-xl bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41]">
                      <ShieldCheck className="w-6 h-6" />
                   </div>
                   <ArrowUpRight className="w-5 h-5 text-neutral-700 group-hover:text-[#00FF41] transition-colors" />
                </div>
                <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Score de Eficiência</h4>
                <p className="text-3xl luxury-font mt-1">94.2</p>
                <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
                   <div className="bg-[#00FF41] h-full w-[94%]" />
                </div>
             </div>

             <div className="glass rounded-[2rem] p-8 border-white/5 group hover:border-[#d4af37]/30 transition-all cursor-default">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                      <Wallet className="w-6 h-6" />
                   </div>
                   <CreditCard className="w-5 h-5 text-neutral-700 group-hover:text-[#d4af37] transition-colors" />
                </div>
                <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Reserva Estratégica</h4>
                <p className="text-3xl luxury-font mt-1">82%</p>
                <p className="text-[9px] text-neutral-600 mt-2 uppercase tracking-tighter">Meta de Liquidez Atingida</p>
             </div>
          </div>
        </div>

        {/* Bottom Section: Transactions & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass rounded-[2rem] p-10 border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-sm font-bold uppercase tracking-widest">Registros Recentes</h3>
                 <button className="text-[10px] uppercase tracking-widest text-[#00FF41] font-bold hover:underline">Ver Todos</button>
              </div>

              <div className="space-y-6">
                 {topTransactions.length > 0 ? topTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            tx.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-neutral-400 group-hover:text-[#00FF41]'
                          }`}>
                             <CategoryIcon category={tx.categoria} />
                          </div>
                          <div>
                             <p className="text-sm font-bold tracking-tight">{tx.descricao || tx.categoria}</p>
                             <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
                               {new Date(tx.timestamp).toLocaleDateString('pt-BR')} • {tx.categoria}
                             </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-sm font-bold ${tx.tipo === 'receita' ? 'text-emerald-500' : 'text-white'}`}>
                             {tx.tipo === 'receita' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.valor)}
                          </p>
                          <p className="text-[8px] text-neutral-700 uppercase font-bold">Consolidado</p>
                       </div>
                    </div>
                 )) : (
                    <div className="py-20 text-center text-neutral-600 italic text-sm">
                       Nenhuma transação identificada no período.
                    </div>
                 )}
              </div>
           </div>

           <div className="glass rounded-[2rem] p-10 border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Insight Executivo</h3>
              <div className="space-y-6">
                 <div className="p-6 rounded-2xl bg-[#00FF41]/5 border border-[#00FF41]/10">
                    <p className="text-xs leading-relaxed text-neutral-300">
                      "Seu padrão de consumo em <span className="text-[#00FF41] font-bold">Gastronomia</span> está 15% abaixo da média histórica. Este excedente de capital pode ser direcionado para sua carteira de investimentos de longo prazo."
                    </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <p className="text-[9px] uppercase text-neutral-500 mb-1 font-bold">Projeção Mensal</p>
                       <p className="text-xl luxury-font">R$ 12.4k</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                       <p className="text-[9px] uppercase text-neutral-500 mb-1 font-bold">Taxa de Poupança</p>
                       <p className="text-xl luxury-font">22.4%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
};