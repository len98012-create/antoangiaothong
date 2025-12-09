import { GoogleGenAI, GenerateContentResponse, Chat, Schema, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, GEMINI_MODEL } from '../constants';
import { QuizConfig, QuizQuestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const resetChatSession = () => {
  chatSession = null;
};

export async function* sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
  const session = getChatSession();
  
  try {
    const result = await session.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const responseChunk = chunk as GenerateContentResponse;
      const text = responseChunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export const generateQuiz = async (config: QuizConfig): Promise<QuizQuestion[]> => {
  // Define Schema for structured JSON output
  const quizSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "Nội dung câu hỏi về luật giao thông" },
        options: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Danh sách các phương án trả lời"
        },
        correctAnswerIndex: { type: Type.INTEGER, description: "Chỉ số của đáp án đúng (bắt đầu từ 0)" },
        explanation: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao đáp án đó đúng dựa trên luật" }
      },
      required: ["question", "options", "correctAnswerIndex", "explanation"],
    },
  };

  const prompt = `
    Hãy tạo ${config.questionCount} câu hỏi trắc nghiệm về Luật Giao thông Đường bộ Việt Nam.
    Chủ đề cụ thể: "${config.topic}".
    Loại câu hỏi: ${config.type === 'true-false' ? 'Đúng/Sai (Chỉ có 2 lựa chọn là Đúng và Sai)' : 'Trắc nghiệm 4 lựa chọn'}.
    Yêu cầu:
    - Câu hỏi thực tế, chính xác theo luật hiện hành (Nghị định 100, Quy chuẩn 41).
    - Giải thích rõ ràng, trích dẫn điều luật nếu có thể.
    - Đảm bảo JSON hợp lệ.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.7, // Creativity balance
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};