'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { prepareResearch, startResearch } from '@/lib/api';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Question {
  id: string;
  content: string;
  answer?: string;
}

export function DeepResearchChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mainQuery, setMainQuery] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialQuestion, setIsInitialQuestion] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: currentInput,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    if (isInitialQuestion) {
      setMainQuery(currentInput);
      setIsInitialQuestion(false);
      await handlePrepareQuestions(currentInput);
    } else {
      // Update current question's answer
      const updatedQuestions = questions.map((q, idx) =>
        idx === currentQuestionIndex ? { ...q, answer: currentInput } : q
      );
      setQuestions(updatedQuestions);

      // Move to next question or process all answers
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        // Add next question to chat history
        const nextQuestion: Message = {
          id: Date.now().toString(),
          content: questions[currentQuestionIndex + 1].content,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, nextQuestion]);
      } else {
        // All questions answered, process Deep Research
        await processDeepResearch(updatedQuestions);
      }
    }

    setCurrentInput('');
  };

  const handlePrepareQuestions = async (query: string) => {
    try {
      setIsProcessing(true);
      const generatedQuestions = await prepareResearch(query, 3);
      
      const formattedQuestions = generatedQuestions.map((q, index) => ({
        id: (index + 1).toString(),
        content: q,
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: 'Przygotowałem pytania uzupełniające. Odpowiedz na każde z nich po kolei.',
        role: 'assistant',
        timestamp: new Date(),
      };

      const firstQuestion: Message = {
        id: Date.now().toString() + '-q1',
        content: formattedQuestions[0].content,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage, firstQuestion]);
    } catch (error) {
      console.error('Błąd podczas przygotowywania pytań:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Wystąpił błąd podczas przygotowywania pytań. Spróbuj ponownie.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDeepResearch = async (updatedQuestions: Question[]) => {
    try {
      setIsProcessing(true);

      const questionsWithAnswers = updatedQuestions
        .map((q) => `${q.content}\nOdp: ${q.answer || ''}`)
        .join('\n\n');

      const response = await startResearch({
        depth: 3,
        breadth: 5,
        query: mainQuery,
        questionsWithAnswers,
      });

      // Formatowanie raportu
      const formattedResponse = `# Raport z badania głębokiego

## Główne pytanie
${mainQuery}

## Pytania uzupełniające i odpowiedzi
${updatedQuestions.map((q, index) => `
### Pytanie ${index + 1}
${q.content}

**Odpowiedź:**
${q.answer || ''}`).join('\n\n')}

## Wyniki badania
${response}`;

      const aiResponse: Message = {
        id: Date.now().toString(),
        content: formattedResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Błąd podczas przetwarzania Deep Research:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Wystąpił błąd podczas przetwarzania Deep Research. Spróbuj ponownie.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsGeneratingPDF(true);
      
      // Create a copy of element for PDF
      const element = reportRef.current;
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Create temporary container
      const container = document.createElement('div');
      container.appendChild(clonedElement);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);
      
      // Remove all classes
      const allElements = clonedElement.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i] as HTMLElement;
        el.removeAttribute('class');
      }
      
      // Remove PDF button from cloned element
      const pdfButton = clonedElement.querySelector('button');
      if (pdfButton) {
        pdfButton.remove();
      }
      
      // Set styles for elements
      clonedElement.style.cssText = 'background: white; color: black; font-family: Arial; padding: 40px; width: 800px;';
      
      const h1Elements = clonedElement.querySelectorAll('h1');
      h1Elements.forEach(h1 => {
        (h1 as HTMLElement).style.cssText = 'font-size: 24px; font-weight: bold; color: #1a365d; margin: 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0;';
      });
      
      const h2Elements = clonedElement.querySelectorAll('h2');
      h2Elements.forEach(h2 => {
        (h2 as HTMLElement).style.cssText = 'font-size: 20px; font-weight: bold; color: #2c5282; margin: 16px 0;';
      });
      
      const h3Elements = clonedElement.querySelectorAll('h3');
      h3Elements.forEach(h3 => {
        (h3 as HTMLElement).style.cssText = 'font-size: 18px; font-weight: bold; color: #2b6cb0; margin: 12px 0;';
      });
      
      const pElements = clonedElement.querySelectorAll('p');
      pElements.forEach(p => {
        (p as HTMLElement).style.cssText = 'margin: 12px 0; line-height: 1.6;';
      });
      
      const liElements = clonedElement.querySelectorAll('li');
      liElements.forEach(li => {
        (li as HTMLElement).style.cssText = 'margin: 8px 0; line-height: 1.6; margin-left: 20px; list-style-type: disc;';
      });
      
      const strongElements = clonedElement.querySelectorAll('strong');
      strongElements.forEach(strong => {
        (strong as HTMLElement).style.cssText = 'font-weight: bold; color: #2b6cb0;';
      });
      
      const hrElements = clonedElement.querySelectorAll('hr');
      hrElements.forEach(hr => {
        (hr as HTMLElement).style.cssText = 'border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;';
      });
      
      // Generate PDF
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Cleanup
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const margin = 10; // 10mm margins
      const contentWidth = imgWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      const imgHeight = canvas.height * contentWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // First page
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
      heightLeft -= contentHeight;
      
      // Additional pages
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, imgHeight);
        heightLeft -= contentHeight;
      }
      
      pdf.save('raport-badania.pdf');
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Card className="w-full h-[80vh] bg-zinc-900 text-white">
      <CardContent className="flex flex-col h-full p-4">
        <ScrollArea className="flex-grow mb-4">
          <div className="space-y-6 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                ref={message.content.startsWith('# Raport') ? reportRef : undefined}
              >
                <div
                  className={`rounded-lg px-6 py-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.content.startsWith('# Raport')
                      ? 'bg-zinc-800 text-white w-full max-w-full'
                      : 'bg-zinc-800 text-white'
                  }`}
                >
                  {message.content.split('\n').map((paragraph, index) => {
                    // Separator
                    if (paragraph === '---') {
                      return <hr key={index} className="my-6 border-zinc-700" />;
                    }
                    // Main title
                    if (paragraph.startsWith('# ')) {
                      return (
                        <h1 key={index} className="text-2xl font-bold mb-6 text-blue-300 border-b border-blue-500/20 pb-4">
                          {paragraph.replace('# ', '')}
                        </h1>
                      );
                    }
                    // Section
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-xl font-semibold mb-4 mt-8 text-blue-200">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }
                    // Subsection
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-lg font-medium mb-3 mt-6 text-blue-100">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    // Bullet list
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="ml-4 mb-2 text-zinc-100 list-disc">
                          {paragraph.replace('- ', '').split(/(\*\*.*?\*\*)/).map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={i} className="text-blue-100">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                        </li>
                      );
                    }
                    // Regular text with bold support
                    return (
                      <p key={index} className={`${index > 0 ? 'mt-4' : ''} leading-relaxed whitespace-pre-wrap`}>
                        {paragraph.split(/(\*\*.*?\*\*)/).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="text-blue-100">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>
                {message.content.startsWith('# Raport') && (
                  <Button
                    onClick={generatePDF}
                    disabled={isGeneratingPDF}
                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 p-0"
                    title="Pobierz raport PDF"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-zinc-800 pt-4">
          <div className="mb-2 text-sm text-zinc-400">
            {isInitialQuestion
              ? 'Jakie jest Twoje główne pytanie badawcze?'
              : !isProcessing && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
              ? questions[currentQuestionIndex].content
              : isProcessing
              ? 'Przetwarzanie...'
              : 'Badanie zakończone'}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Wpisz swoją odpowiedź..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-grow bg-zinc-800 border-zinc-700 text-white"
              disabled={isProcessing || (!isInitialQuestion && currentQuestionIndex >= questions.length)}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || (!isInitialQuestion && currentQuestionIndex >= questions.length)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Wyślij
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 