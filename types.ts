import React from 'react';

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
  icon?: React.ReactNode;
}

// Quiz Types
export type QuizType = 'multiple-choice' | 'true-false';

export interface QuizConfig {
  topic: string;
  questionCount: number;
  type: QuizType;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
  explanation: string;
}