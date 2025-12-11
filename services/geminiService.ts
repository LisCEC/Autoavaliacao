import { GoogleGenAI } from "@google/genai";
import { FormData, RATING_SCALE } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePerformanceReport = async (data: FormData): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  // Construct a structured prompt based on the filled form
  const promptData = {
    instituicao: "CEC - Centro de Educação e Cultura",
    auxiliar: data.personalInfo.name,
    data: data.personalInfo.date,
    aluno_transtorno: data.personalInfo.studentDisorder,
    avaliacoes: data.sections.map(section => ({
      secao: section.title,
      itens: section.items.map(item => {
        if ('rating' in item) {
            // Mapping numeric rating to text label
            const ratingInfo = RATING_SCALE.find(r => r.value === item.rating);
            return {
                pergunta: item.question,
                nota: item.rating,
                nivel: ratingInfo?.label,
                comentario_justificativa: item.comment
            };
        } else {
            return {
                pergunta: item.question,
                resposta: (item as any).answer // Casting for TextItem
            };
        }
      })
    }))
  };

  const prompt = `
    Atue como um Especialista em Gestão Escolar e Desenvolvimento Humano do CEC - Centro de Educação e Cultura.
    
    Analise os dados da seguinte autoavaliação preenchida por um Auxiliar de Apoio à Inclusão Escolar.
    Gere um **Relatório de Desempenho e Desenvolvimento Profissional** consistente, empático e construtivo.

    IMPORTANTE - REGRAS DE FORMATAÇÃO:
    1. O relatório deve ser escrito estritamente em **TEXTO CONTÍNUO (prosa)**, organizado em parágrafos coesos.
    2. **NÃO utilize listas com marcadores (bullet points), traços ou tópicos** em nenhuma parte do texto. Conecte as ideias usando conjunções e frases de transição.
    3. Escreva de forma dissertativa, fluida e profissional.

    Estrutura Sugerida para a Narrativa:
    1. **Introdução**: Apresente o profissional, data e contexto do aluno atendido, fazendo uma breve síntese executiva do perfil identificado.
    2. **Análise de Competências e Desempenho**: Discorra sobre os pontos fortes (notas altas) e as áreas que necessitam de atenção (notas baixas) identificadas nas seções de conhecimento, desempenho e colaboração. Integre a análise das justificativas dadas pelo colaborador.
    3. **Perspectivas e Planejamento**: Narre as motivações, desafios e aspirações do colaborador para o próximo ano, incluindo suas necessidades de formação.
    4. **Recomendações Finais**: Conclua com sugestões de ações práticas ou estudos, incorporadas naturalmente ao texto final, sem listá-las.

    Dados da Autoavaliação (JSON):
    ${JSON.stringify(promptData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Não foi possível gerar o relatório.";
  } catch (error) {
    console.error("Erro ao conectar com Gemini:", error);
    throw new Error("Falha ao gerar o relatório. Verifique sua conexão ou tente novamente.");
  }
};