import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Trophy, BrainCircuit, Play, Loader2 } from 'lucide-react';
import { QuizConfig, QuizQuestion, QuizType } from '../types';
import { generateQuiz } from '../services/geminiService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPIC_SUGGESTIONS = [
  "Biển báo cấm", "Mức phạt nồng độ cồn", "Quy tắc nhường đường", 
  "Sa hình", "Tốc độ tối đa", "Vạch kẻ đường"
];

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'setup' | 'loading' | 'playing' | 'result'>('setup');
  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    questionCount: 5,
    type: 'multiple-choice',
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  if (!isOpen) return null;

  const handleStartQuiz = async () => {
    if (!config.topic.trim()) return;
    setStep('loading');
    try {
      const data = await generateQuiz(config);
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setStep('playing');
    } catch (error) {
      alert("Không thể tạo câu hỏi lúc này. Vui lòng thử lại!");
      setStep('setup');
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setStep('result');
    }
  };

  const resetGame = () => {
    setStep('setup');
    setSelectedAnswer(null);
    setIsAnswered(false);
    setConfig(prev => ({ ...prev, topic: '' }));
  };

  // --- RENDER HELPERS ---

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Thử thách Giao thông</h2>
        <p className="text-slate-500 dark:text-slate-400">Kiểm tra kiến thức luật của bạn</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chủ đề</label>
          <input
            type="text"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
            placeholder="VD: Biển báo, Sa hình..."
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {TOPIC_SUGGESTIONS.map(t => (
              <button
                key={t}
                onClick={() => setConfig({ ...config, topic: t })}
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thanh trượt số lượng câu hỏi */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số câu hỏi</label>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded text-xs font-bold">
                {config.questionCount}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 câu</span>
              <span>20 câu</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Loại câu hỏi</label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value as QuizType })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="multiple-choice">Trắc nghiệm</option>
              <option value="true-false">Đúng / Sai</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleStartQuiz}
        disabled={!config.topic}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
      >
        <Play size={20} fill="currentColor" /> Bắt đầu
      </button>
    </div>
  );

  const renderPlaying = () => {
    const currentQ = questions[currentIndex];
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Câu {currentIndex + 1}/{questions.length}
          </span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            Điểm: {score}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "w-full p-4 text-left rounded-xl border transition-all duration-200 ";
            
            if (isAnswered) {
              if (idx === currentQ.correctAnswerIndex) {
                btnClass += "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 ";
              } else if (idx === selectedAnswer) {
                btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:text-red-300 ";
              } else {
                btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 ";
              }
            } else {
              btnClass += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 text-slate-700 dark:text-slate-200 shadow-sm ";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={btnClass}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                    isAnswered && idx === currentQ.correctAnswerIndex ? 'border-emerald-600 bg-emerald-600 text-white' : 
                    isAnswered && idx === selectedAnswer ? 'border-red-500 bg-red-500 text-white' :
                    'border-slate-400'
                  }`}>
                    {isAnswered && idx === currentQ.correctAnswerIndex && <CheckCircle size={14} />}
                    {isAnswered && idx === selectedAnswer && idx !== currentQ.correctAnswerIndex && <XCircle size={14} />}
                  </div>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button */}
        {isAnswered && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4 text-sm text-slate-700 dark:text-slate-300">
              <strong className="block text-blue-700 dark:text-blue-400 mb-1">Giải thích:</strong>
              {currentQ.explanation}
            </div>
            <button
              onClick={nextQuestion}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
            >
              {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    if (percentage === 100) message = "Xuất sắc! Bạn là bậc thầy luật giao thông!";
    else if (percentage >= 80) message = "Làm tốt lắm! Kiến thức rất vững.";
    else if (percentage >= 50) message = "Khá tốt, nhưng cần ôn thêm chút nhé.";
    else message = "Hãy ôn tập thêm luật giao thông nhé!";

    return (
      <div className="text-center py-8">
        <div className="mb-6 relative inline-block">
          <Trophy className={`w-24 h-24 ${percentage >= 80 ? 'text-amber-400' : 'text-slate-300'} mx-auto`} />
          {percentage >= 80 && (
            <div className="absolute top-0 right-0 animate-bounce">
              <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Top 1</div>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {score} / {questions.length}
        </h2>
        <p className="text-lg font-medium text-amber-600 dark:text-amber-400 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Đóng
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md"
          >
            Chơi lại
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold">
            <BrainCircuit className="text-amber-500" />
            <span>Mini Game</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {step === 'setup' && renderSetup()}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
              <p>Đang chuẩn bị câu hỏi...</p>
              <p className="text-xs mt-2 text-slate-400">AI đang tra cứu luật mới nhất</p>
            </div>
          )}
          {step === 'playing' && renderPlaying()}
          {step === 'result' && renderResult()}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;