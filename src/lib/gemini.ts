import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set.');
  throw new Error(
    'Missing Gemini API key. Please add GEMINI_API_KEY to your environment variables.'
  );
}

const globalForGemini = global as unknown as {
  geminiModel: GenerativeModel | undefined;
};

export const getGeminiModel = (): GenerativeModel => {
  if (globalForGemini.geminiModel) {
    return globalForGemini.geminiModel;
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  if (process.env.NODE_ENV !== 'production') {
    globalForGemini.geminiModel = model;
  }

  return model;
};
