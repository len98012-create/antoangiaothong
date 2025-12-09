import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : message.isError 
              ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed overflow-hidden ${
              isUser
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : message.isError
                  ? 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 rounded-tl-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;