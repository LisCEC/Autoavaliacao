export interface RatingItem {
  id: string;
  question: string;
  rating: number | null;
  comment: string;
  commentPlaceholder?: string;
}

export interface TextItem {
  id: string;
  question: string;
  description?: string;
  answer: string;
  inputType?: 'text' | 'number';
}

export interface SectionData {
  id: string;
  title: string;
  description: string;
  type: 'rating' | 'text';
  items: (RatingItem | TextItem)[];
}

export interface PersonalInfo {
  name: string;
  date: string;
  studentDisorder: string;
}

export interface FormData {
  personalInfo: PersonalInfo;
  sections: SectionData[];
}

export const RATING_SCALE = [
  { value: 1, label: "Precisa de Melhoria Significativa", desc: "Requer atenção imediata e suporte." },
  { value: 2, label: "Precisa de Melhoria", desc: "Há potencial, mas ajustes são necessários." },
  { value: 3, label: "Adequado", desc: "Desempenho satisfatório, com espaço para refinamento." },
  { value: 4, label: "Bom", desc: "Eficaz e consistente, com bons resultados." },
  { value: 5, label: "Excepcional", desc: "Alta proficiência, com impacto positivo notável." },
];