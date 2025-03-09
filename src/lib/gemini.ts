import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY as string;

if (!API_KEY) {
  throw new Error(
    'Missing Gemini API key. Please add GEMINI_API_KEY to your environment variables.'
  );
}

class GeminiService {
  private static instance: GeminiService;
  public genAI: GoogleGenerativeAI;

  private constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }
}

export default GeminiService.getInstance();
