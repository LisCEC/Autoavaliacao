import { FormData } from './types';

export const INITIAL_DATA: FormData = {
  personalInfo: {
    name: '',
    date: new Date().toISOString().split('T')[0],
    studentDisorder: ''
  },
  sections: [
    {
      id: 's1',
      title: 'Seção 1: Conhecimento e Habilidade',
      description: 'Esta seção avalia seu repertório técnico e prático, essencial para oferecer suporte personalizado e eficaz. Reflita sobre como seu conhecimento impacta o dia a dia dos alunos.',
      type: 'rating',
      items: [
        { 
          id: '1.1', 
          question: '1.1 Entendimento sobre as necessidades específicas dos alunos que você apoia (ex: TEA, deficiência intelectual, deficiência física, etc.).', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Descreva como você aplica esse conhecimento em situações reais, como adaptar atividades para o aluno que auxiliou.'
        },
        { 
          id: '1.2', 
          question: '1.2 Habilidades em implementar estratégias de apoio personalizadas.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Forneça um exemplo de uma estratégia que você criou ou adaptou, e o resultado observado no aluno.'
        },
        { 
          id: '1.3', 
          question: '1.3 Proficiência no uso de tecnologias assistivas e materiais pedagógicos adaptados.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Mencione uma ferramenta específica (ex: tablet com apps acessíveis) e como ela melhorou o aprendizado do aluno.'
        },
        { 
          id: '1.5', 
          question: '1.5 Conhecimento sobre planos de desenvolvimento individualizado (PDIs)', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Explique como você contribui para a elaboração ou implementação de um PDI, com um exemplo prático.'
        },
      ]
    },
    {
      id: 's2',
      title: 'Seção 2: Desempenho e Aplicação',
      description: 'Foque em como você aplica seu conhecimento no cotidiano escolar, promovendo o progresso dos alunos. Celebre sucessos e identifique o que pode ser otimizado.',
      type: 'rating',
      items: [
        { 
          id: '2.1', 
          question: '2.1 Medição do sucesso em promover a autonomia do aluno.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Descreva métricas ou observações (ex: aluno passou a realizar tarefas sozinho) que indicam avanço na autonomia.'
        },
        { 
          id: '2.2', 
          question: '2.2 Aplicação de estratégias de apoio para superar desafios específicos do aluno.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Relate uma situação recente onde uma estratégia sua resolveu um desafio, como mobilidade ou foco em aula.'
        },
        { 
          id: '2.3', 
          question: '2.3 Capacidade de gerenciar e mediar interações sociais do aluno com colegas e professores.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Forneça um exemplo de mediação que facilitou a inclusão social, e o impacto percebido.'
        },
        { 
          id: '2.4', 
          question: '2.4 Lidando com comportamentos desafiadores e estratégias utilizadas.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Descreva uma estratégia (ex: reforço positivo) aplicada em um comportamento desafiador e seu resultado.'
        },
        { 
          id: '2.5', 
          question: '2.5 Proatividade em antecipar e atender às necessidades dos alunos.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Cite uma ação proativa que você realizou e como ela beneficiou o aluno.'
        },
      ]
    },
    {
      id: 's3',
      title: 'Seção 3: Colaboração e Comunicação',
      description: 'Esta área destaca sua integração com a equipe e famílias, chave para um suporte holístico.',
      type: 'rating',
      items: [
        { 
          id: '3.1', 
          question: '3.1 Eficácia na comunicação e colaboração com a equipe pedagógica (professores, coordenadores, psicólogos, etc.).', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Descreva uma colaboração recente e como ela contribuiu para o aluno.'
        },
        { 
          id: '3.2', 
          question: '3.2 Integração e trabalho com o(s) professor(es) da turma.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Relate como é a integração do trabalho.'
        },
        { 
          id: '3.3', 
          question: '3.3 Receptividade a feedback e sugestões da equipe e dos pais.', 
          rating: null, 
          comment: '',
          commentPlaceholder: 'Descreva como você incorporou um feedback recente e o impacto positivo resultante.'
        },
      ]
    },
    {
      id: 's4',
      title: 'Seção 4: Desenvolvimento Profissional e Auto-Reflexão',
      description: 'Reflita sobre seu crescimento pessoal e motivações. Use essa seção para planejar seu futuro profissional.',
      type: 'text',
      items: [
        { id: '4.1', question: '4.1 Principal motivação para trabalhar como auxiliar de apoio a alunos com necessidades especiais.', description: 'Compartilhe sua motivação principal e como ela influencia seu dia a dia.', answer: '' },
        { id: '4.2', question: '4.2 Maior dificuldade enfrentada em 2025:', description: 'Descreva o maior desafio que você enfrentou e como tentou superá-lo.', answer: '' },
        { id: '4.3', question: '4.3 Maior conquista/momento de êxito:', description: 'Compartilhe um momento de grande sucesso ou uma conquista significativa que você teve em sua prática.', answer: '' },
        { id: '4.4', question: '4.4 Aprendizado pessoal mais significativo:', description: 'Qual foi o aprendizado mais importante que você teve sobre si mesmo(a) em 2025?', answer: '' },
        { id: '4.5', question: '4.5 O que precisa mudar em 2026?', description: 'Com base em sua autoavaliação, o que você priorizaria para melhorar em sua prática em 2026?', answer: '' },
        { id: '4.6', question: '4.6 Formação recebida em 2025:', description: 'Liste as formações e capacitações que você participou em 2025.', answer: '' },
        { id: '4.7', question: '4.7 Formação desejada para 2026:', description: 'Quais temas de formação seriam mais relevantes para você em 2026?', answer: '' },
        { id: '4.8', question: '4.8 Tempo disponível para formação (Horas/mês):', description: 'Quantas horas mensais você estaria disposto(a) a dedicar à formação continuada em 2026?', answer: '', inputType: 'number' },
      ]
    }
  ]
};