import React from 'react';
import { RATING_SCALE } from '../types';

// Icons
export const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

export const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

interface RatingInputProps {
  value: number | null;
  onChange: (val: number) => void;
  hasError?: boolean;
}

export const RatingInput: React.FC<RatingInputProps> = ({ value, onChange, hasError }) => {
  return (
    <div className={`flex flex-col space-y-3 mt-2 transition-colors rounded-xl ${hasError ? 'bg-red-50 border border-red-200 p-3' : ''}`}>
      <div className="flex flex-wrap gap-2 md:gap-4 justify-start">
        {RATING_SCALE.map((scale) => {
          const isSelected = value === scale.value;
          return (
            <button
              key={scale.value}
              type="button"
              onClick={() => onChange(scale.value)}
              className={`
                group relative flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg scale-105' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'}
              `}
              title={`${scale.value}: ${scale.label}`}
            >
              <span className="text-lg md:text-2xl font-bold">{scale.value}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-0.5">
                   <CheckIcon />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center h-6">
        <div className="text-sm font-medium text-indigo-700">
            {value ? RATING_SCALE.find(r => r.value === value)?.label : <span className="text-slate-400">Selecione uma nota</span>}
        </div>
        {hasError && (
            <div className="flex items-center gap-1 text-xs font-semibold text-red-600 animate-pulse">
                <AlertIcon />
                <span>Obrigatório</span>
            </div>
        )}
      </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hasError?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, hasError, ...props }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-1">
        <label className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-slate-700'}`}>{label}</label>
        {hasError && <span className="text-xs font-semibold text-red-500">Preenchimento obrigatório</span>}
    </div>
    <textarea
      {...props}
      className={`w-full p-3 border rounded-lg outline-none transition-all min-h-[100px] resize-y
        ${hasError 
            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
            : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        }
      `}
    />
  </div>
);

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hasError?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, hasError, ...props }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-1">
        <label className={`block text-sm font-medium ${hasError ? 'text-red-600' : 'text-slate-700'}`}>{label}</label>
        {hasError && <span className="text-xs font-semibold text-red-500">Obrigatório</span>}
    </div>
    <input
      type="number"
      {...props}
      className={`w-full p-3 border rounded-lg outline-none transition-all
        ${hasError 
            ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 focus:border-red-400' 
            : 'border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        }
      `}
    />
  </div>
);

export const SectionHeader: React.FC<{ 
  title: string; 
  description: string; 
  step: number;
  completed: number;
  total: number;
}> = ({ title, description, step, completed, total }) => {
  const percentage = Math.round((completed / total) * 100);
  const isComplete = percentage === 100;

  return (
    <div className="mb-6 border-b border-slate-100 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 transition-colors ${isComplete ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {isComplete ? <CheckIcon /> : step}
          </span>
          <h2 className="text-lg md:text-xl font-bold text-slate-800">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3 pl-11 sm:pl-0">
          <div className="flex-1 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[100px]">
            <div 
              className={`h-full transition-all duration-500 ease-out ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap min-w-[60px] text-right">
            {completed} de {total}
          </span>
        </div>
      </div>
      <p className="text-slate-600 ml-0 sm:ml-11 text-sm">{description}</p>
    </div>
  );
};