import React from 'react';
import { Bike, TriangleAlert, BookOpen, CloudRain, Car, Wine } from 'lucide-react';
import { QuickPrompt } from '../types';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const PROMPTS: QuickPrompt[] = [
  {
    id: '1',
    label: 'Mức phạt cồn',
    prompt: 'Mức phạt nồng độ cồn đối với xe máy hiện nay là bao nhiêu?',
    icon: <Wine size={16} />,
  },
  {
    id: '2',
    label: 'Biển báo',
    prompt: 'Làm sao để phân biệt biển báo cấm và biển báo nguy hiểm?',
    icon: <TriangleAlert size={16} />,
  },
  {
    id: '3',
    label: 'Đi xe trời mưa',
    prompt: 'Cho tớ xin vài kinh nghiệm lái xe máy an toàn khi trời mưa lớn.',
    icon: <CloudRain size={16} />,
  },
  {
    id: '4',
    label: 'Quy tắc vòng xuyến',
    prompt: 'Khi đi vào vòng xuyến thì phải nhường đường như thế nào cho đúng luật?',
    icon: <BookOpen size={16} />,
  },
];

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelect, disabled }) => {
  return (
    <div className="px-4 py-2 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 max-w-3xl mx-auto">
        {PROMPTS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
            className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-700 text-amber-700 dark:text-amber-400 text-sm rounded-full shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;