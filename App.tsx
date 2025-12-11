import React, { useState } from 'react';
import { INITIAL_DATA } from './constants';
import { FormData, SectionData, RatingItem, TextItem } from './types';
import { RatingInput, TextArea, NumberInput, SectionHeader, InfoIcon } from './components/FormComponents';
import { generatePerformanceReport } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

// Need to install react-markdown: npm install react-markdown
// Since we can't install packages in this environment, I will render basic markdown or text. 
// For this output, I will create a simple Markdown renderer component internally or just display formatted text.

const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-justify">
            {content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-indigo-800 border-b border-indigo-100 pb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-indigo-700">{line.replace('### ', '')}</h3>;
                if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block mt-3 text-slate-900">{line.replace(/\*\*/g, '')}</strong>;
                // Treat lists as paragraphs if the model mistakenly generates them, stripping the bullet
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) return <p key={i} className="mb-3">{line.replace(/^[\-\*]\s+/, '')}</p>;
                return <p key={i} className="mb-4">{line}</p>;
            })}
        </div>
    )
}

function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reportContent, setReportContent] = useState<string>('');
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showValidationErrors, setShowValidationErrors] = useState<boolean>(false);

  const totalSteps = 1 + formData.sections.length; // Personal Info + Sections

  const handlePersonalInfoChange = (field: keyof typeof formData.personalInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleRatingItemChange = (sectionIndex: number, itemIndex: number, field: 'rating' | 'comment', value: any) => {
    const newSections = [...formData.sections];
    const section = newSections[sectionIndex];
    const item = section.items[itemIndex] as RatingItem;
    
    if (field === 'rating') item.rating = value;
    else item.comment = value;
    
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const handleTextItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...formData.sections];
    const section = newSections[sectionIndex];
    (section.items[itemIndex] as TextItem).answer = value;
    
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const calculateProgress = () => {
    let totalItems = 0;
    let answeredItems = 0;

    // Personal Info
    totalItems += 3;
    if (formData.personalInfo.name) answeredItems++;
    if (formData.personalInfo.date) answeredItems++;
    if (formData.personalInfo.studentDisorder) answeredItems++;

    // Sections
    formData.sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        if (section.type === 'rating') {
          if ((item as RatingItem).rating) answeredItems++;
        } else {
          const textItem = item as TextItem;
          // Different validation for number vs text
          if (textItem.inputType === 'number') {
             if(textItem.answer !== '') answeredItems++;
          } else {
             if (textItem.answer.length > 5) answeredItems++;
          }
        }
      });
    });

    return Math.round((answeredItems / totalItems) * 100);
  };

  const getSectionStats = (section: SectionData) => {
    let completed = 0;
    section.items.forEach(item => {
      if (section.type === 'rating') {
        if ((item as RatingItem).rating !== null) completed++;
      } else {
        const textItem = item as TextItem;
         if (textItem.inputType === 'number') {
            if(textItem.answer !== '') completed++;
         } else {
            if (textItem.answer.length > 5) completed++;
         }
      }
    });
    return { completed, total: section.items.length };
  };

  // Helper validation functions
  const isRatingValid = (rating: number | null) => rating !== null;
  const isTextValid = (text: string, isNumber?: boolean) => {
      if (isNumber) return text !== '';
      return text && text.trim().length > 5;
  };
  const isInfoValid = (text: string) => text && text.trim().length > 0;

  const validateCurrentStep = () => {
      if (activeSection === 0) {
          return isInfoValid(formData.personalInfo.name) && 
                 isInfoValid(formData.personalInfo.date) && 
                 isInfoValid(formData.personalInfo.studentDisorder);
      } else {
          const section = formData.sections[activeSection - 1];
          return section.items.every(item => {
              if (section.type === 'rating') {
                  return isRatingValid((item as RatingItem).rating);
              } else {
                  return isTextValid((item as TextItem).answer, (item as TextItem).inputType === 'number');
              }
          });
      }
  };

  const handleNext = () => {
      if (!validateCurrentStep()) {
          setShowValidationErrors(true);
          // Small delay to allow React to render the error states before confirming
          setTimeout(() => {
            if (confirm("Existem campos obrigatórios não preenchidos nesta etapa. Deseja avançar mesmo assim?")) {
                setShowValidationErrors(false);
                setActiveSection(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 100);
          return;
      }
      setShowValidationErrors(false);
      setActiveSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
      setShowValidationErrors(false);
      setActiveSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (calculateProgress() < 100) {
      setShowValidationErrors(true);
      
      // Allow UI to update with error styles
      setTimeout(() => {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 10);

      if(!confirm("Existem campos obrigatórios não preenchidos (destacados em vermelho). Deseja gerar o relatório incompleto mesmo assim?")) {
        return;
      }
    }

    setReportStatus('loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      const report = await generatePerformanceReport(formData);
      setReportContent(report);
      setReportStatus('success');
    } catch (error) {
      console.error(error);
      setReportStatus('error');
    }
  };

  if (reportStatus === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-white">
             <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-1">CEC - Centro de Educação e Cultura</h2>
             <h1 className="text-3xl font-bold mb-2">Relatório de Desempenho</h1>
             <p className="opacity-90">Gerado via Gemini AI baseado em sua autoavaliação.</p>
          </div>
          <div className="p-8 md:p-12">
            <SimpleMarkdownRenderer content={reportContent} />
            
            <div className="mt-10 pt-6 border-t border-slate-200 flex gap-4 no-print">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
              >
                Imprimir / Salvar PDF
              </button>
              <button 
                onClick={() => setReportStatus('idle')}
                className="px-6 py-3 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Voltar ao Formulário
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">C</div>
            <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm md:text-lg leading-tight">CEC - Centro de Educação e Cultura</span>
                <span className="text-[10px] md:text-xs text-slate-500 font-medium tracking-wide">EduAvalia</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:block">Progresso Global</div>
            <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${calculateProgress() < 100 && showValidationErrors ? 'bg-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${calculateProgress() < 100 && showValidationErrors ? 'text-orange-600' : 'text-indigo-600'}`}>{calculateProgress()}%</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 flex-grow w-full">
        
        {/* Step Indicator */}
        <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-white border border-indigo-100 rounded-full text-xs font-bold text-indigo-500 uppercase tracking-wide">
                Etapa {activeSection + 1} de {totalSteps}
            </span>
        </div>

        {/* Intro Card / Personal Info (Step 0) */}
        {activeSection === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 p-6 md:p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
            <div className="mb-6">
                <h2 className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-1">CEC - Centro de Educação e Cultura</h2>
                <h1 className="text-3xl font-bold text-slate-900">Autoavaliação para Auxiliares de Apoio</h1>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
                Prezado(a) Auxiliar, este formulário foi desenvolvido para refletir sobre seu desempenho e identificar oportunidades de crescimento. 
                Seja honesto(a) e reflexivo(a) — esta é uma ferramenta para celebrar conquistas e planejar avanços.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${showValidationErrors && !isInfoValid(formData.personalInfo.name) ? 'text-red-600' : 'text-slate-500'}`}>Nome do Auxiliar</label>
                <input 
                    type="text" 
                    value={formData.personalInfo.name}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all
                        ${showValidationErrors && !isInfoValid(formData.personalInfo.name)
                            ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
                            : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                        }
                    `}
                />
                </div>
                <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${showValidationErrors && !isInfoValid(formData.personalInfo.date) ? 'text-red-600' : 'text-slate-500'}`}>Data</label>
                <input 
                    type="date" 
                    value={formData.personalInfo.date}
                    onChange={(e) => handlePersonalInfoChange('date', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all
                        ${showValidationErrors && !isInfoValid(formData.personalInfo.date)
                            ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
                            : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                        }
                    `}
                />
                </div>
                <div>
                <label className={`block text-xs font-semibold uppercase mb-1 ${showValidationErrors && !isInfoValid(formData.personalInfo.studentDisorder) ? 'text-red-600' : 'text-slate-500'}`}>Transtorno do Aluno</label>
                <input 
                    type="text" 
                    value={formData.personalInfo.studentDisorder}
                    onChange={(e) => handlePersonalInfoChange('studentDisorder', e.target.value)}
                    placeholder="Ex: TEA, TDAH, etc."
                    className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all
                        ${showValidationErrors && !isInfoValid(formData.personalInfo.studentDisorder)
                            ? 'border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400' 
                            : 'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                        }
                    `}
                />
                </div>
            </div>
            </div>
        )}

        {/* Sections (Steps 1+) */}
        {activeSection > 0 && (() => {
            const sectionIndex = activeSection - 1;
            const section = formData.sections[sectionIndex];
            const stats = getSectionStats(section);
            
            return (
                <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <SectionHeader 
                    title={section.title} 
                    description={section.description} 
                    step={sectionIndex + 1}
                    completed={stats.completed}
                    total={stats.total}
                />
                
                <div className="space-y-8">
                    {section.items.map((item, iIndex) => {
                        const isNumberInput = (item as TextItem).inputType === 'number';
                        const hasError = showValidationErrors && (
                            section.type === 'rating' 
                                ? !isRatingValid((item as RatingItem).rating)
                                : !isTextValid((item as TextItem).answer, isNumberInput)
                        );

                        return (
                            <div key={item.id} className={`p-4 rounded-xl border transition-colors ${hasError ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/50 border-slate-100 hover:border-indigo-100'}`}>
                            <h3 className={`text-base md:text-lg font-semibold mb-2 ${hasError ? 'text-red-800' : 'text-slate-800'}`}>
                                {item.question}
                            </h3>
                            
                            {section.type === 'rating' ? (
                                <>
                                <div className="mb-4">
                                    <RatingInput 
                                        value={(item as RatingItem).rating} 
                                        onChange={(val) => handleRatingItemChange(sectionIndex, iIndex, 'rating', val)} 
                                        hasError={hasError}
                                    />
                                </div>
                                <TextArea 
                                    label="Comentários / Exemplos:" 
                                    placeholder={(item as RatingItem).commentPlaceholder || "Descreva situações reais que justifiquem sua avaliação..."}
                                    value={(item as RatingItem).comment}
                                    onChange={(e) => handleRatingItemChange(sectionIndex, iIndex, 'comment', e.target.value)}
                                />
                                </>
                            ) : (
                                <div className="mt-3">
                                <p className="text-sm text-slate-500 mb-2 italic">{(item as TextItem).description}</p>
                                {isNumberInput ? (
                                    <NumberInput
                                        label="Sua resposta (apenas números):"
                                        placeholder="Ex: 4"
                                        value={(item as TextItem).answer}
                                        onChange={(e) => handleTextItemChange(sectionIndex, iIndex, e.target.value)}
                                        hasError={hasError}
                                    />
                                ) : (
                                    <TextArea 
                                        label="Sua resposta:" 
                                        placeholder="Escreva aqui..."
                                        value={(item as TextItem).answer}
                                        onChange={(e) => handleTextItemChange(sectionIndex, iIndex, e.target.value)}
                                        hasError={hasError}
                                    />
                                )}
                                </div>
                            )}
                            </div>
                        );
                    })}
                </div>
                </div>
            );
        })()}

      </main>

      {/* Sticky Navigation Footer */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
            {/* Previous Button */}
            <button
                onClick={handlePrev}
                disabled={activeSection === 0}
                className={`
                    px-6 py-3 rounded-xl font-bold text-sm md:text-base flex items-center gap-2 transition-all
                    ${activeSection === 0 
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
                    }
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Anterior
            </button>

            {/* Next / Submit Button */}
            {activeSection < totalSteps - 1 ? (
                <button
                    onClick={handleNext}
                    className="flex-1 md:flex-none md:w-48 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                    Próximo
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            ) : (
                <button
                    onClick={handleSubmit}
                    disabled={reportStatus === 'loading'}
                    className={`
                        flex-1 md:flex-none md:w-64 px-6 py-3 rounded-xl text-white font-bold text-sm md:text-base flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-lg
                        ${reportStatus === 'loading' 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : (showValidationErrors && calculateProgress() < 100 
                                ? 'bg-orange-600 hover:bg-orange-700' 
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                              )
                        }
                    `}
                >
                    {reportStatus === 'loading' ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Processando...</span>
                        </>
                    ) : (
                        <>
                            <span>Gerar Relatório</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;