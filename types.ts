
export type TransactionType = 'receita' | 'despesa';

export interface Transaction {
  id: string;
  valor: number;
  categoria: string;
  descricao: string;
  tipo: TransactionType;
  timestamp: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Transaction;
}

export interface FinancialStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  topCategory: string;
}
