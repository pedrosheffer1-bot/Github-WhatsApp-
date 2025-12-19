
import React, { useMemo } from 'react';
import { Transaction, FinancialStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SidebarProps {
  transactions: Transaction[];
}

const COLORS = ['#d4af37', '#e5e5e5', '#404040', '#737373', '#262626'];

export const Sidebar: React.FC<SidebarProps> = ({ transactions }) => {
  const stats = useMemo<FinancialStats>(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.tipo === 'receita') acc.totalIncome += curr.valor;
      else acc.totalExpenses += curr.valor;
      acc.balance = acc.totalIncome - acc.totalExpenses;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, balance: 0, topCategory: 'N/A' });
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.tipo === 'despesa') {
        map[t.categoria] = (map[t.categoria] || 0) + t.valor;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="w-full lg:w-96 glass h-full p-8 flex flex-col gap-10 overflow-y-auto hidden lg:flex">
      <div className="flex flex-col items-center">
        <h1 className="luxury-font text-3xl font-bold tracking-tighter text-[#d4af37]">Finance Pro</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mt-1">AI Executive Suite</p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Liquidez Total</p>
          <p className="text-4xl font-light luxury-font">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase text-emerald-500 mb-1">Entradas</p>
            <p className="text-lg font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalIncome)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase text-rose-500 mb-1">Saídas</p>
            <p className="text-lg font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalExpenses)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">Alocação de Capital</p>
        {categoryData.length > 0 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#d4af37' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-neutral-600 italic text-sm">
            Aguardando fluxos...
          </div>
        )}
        <div className="mt-4 space-y-2">
           {categoryData.map((c, i) => (
             <div key={c.name} className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-neutral-400">{c.name}</span>
               </div>
               <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value)}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
            <span className="text-[#d4af37] font-bold">JD</span>
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-neutral-500">Membro Prime 💎</p>
          </div>
        </div>
      </div>
    </div>
  );
};
