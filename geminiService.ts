
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "./types";

const SYSTEM_INSTRUCTION = `
Atue como o motor de inteligência do "Finance Pro AI", um controlador de custos via WhatsApp. Sua principal função é converter mensagens informais em dados estruturados.

DIRETRIZES DE PERSONALIDADE:
- Tom de voz: Luxuoso, minimalista, direto e motivador.
- Idioma: Português Brasil.

REGRAS DE RESPOSTA:
1. Extração de Dados: Sempre identifique [Valor], [Categoria], [Descrição] e [Tipo: receita ou despesa].
2. Formato de Saída Obrigatório: Toda resposta deve iniciar com um bloco JSON invisível para o usuário (delimitado por \`\`\`json) com os campos: {"valor": number, "categoria": string, "descricao": string, "tipo": "receita"|"despesa", "timestamp": "ISO Date"}.
3. Feedback Humano: Após o JSON, envie uma confirmação curta, elegante e motivadora usando emojis premium. Ex: "✅ Registrado! R$ 50,00 em Lazer. Seu limite mensal ainda está saudável. 🥂"
4. Inteligência Financeira: Se o usuário perguntar "Como estou hoje?", ou variações, analise o histórico fornecido e gere um resumo executivo com insights acionáveis (sem o bloco JSON).
5. Erros: Se o usuário enviar algo vago, peça o valor ou a categoria educadamente.

EXEMPLO DE RESPOSTA:
\`\`\`json
{
  "valor": 150.00,
  "categoria": "Gastronomia",
  "descricao": "Jantar no Fasano",
  "tipo": "despesa",
  "timestamp": "2023-10-27T20:00:00Z"
}
\`\`\`
✅ Registrado! R$ 150,00 em Gastronomia. Sua curadoria financeira reflete seu bom gosto. 🥂
`;

export class FinanceAIService {
  private ai: GoogleGenAI;
  private model = 'gemini-3-pro-preview';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async processMessage(userMessage: string, history: Transaction[]): Promise<{ text: string, data?: Transaction }> {
    const historyContext = history.length > 0 
      ? `Histórico Recente (contexto para análise):\n${JSON.stringify(history.slice(-15))}`
      : "Nenhum histórico disponível ainda.";

    const prompt = `
Contexto do Usuário:
${historyContext}

Mensagem do Usuário: "${userMessage}"
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2, // Baixa temperatura para extração precisa de JSON
        },
      });

      const fullText = response.text || "";
      
      const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
      let data: Transaction | undefined;
      let cleanText = fullText;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          data = {
            ...parsed,
            id: crypto.randomUUID(),
          };
          // Remove o JSON da exibição para o usuário
          cleanText = fullText.replace(jsonMatch[0], "").trim();
        } catch (e) {
          console.error("Erro ao parsear JSON da IA", e);
        }
      }

      return { text: cleanText, data };
    } catch (error) {
      console.error("Erro na AI:", error);
      return { text: "💎 Tivemos um breve contratempo em nossos servidores de alta performance. Poderia repetir os detalhes?" };
    }
  }
}
