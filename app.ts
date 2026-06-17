import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Helper function to lazy-initialize GoogleGenAI to prevent startup crash if missing API Key
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Endpoints
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const { topic, context } = req.body;
    if (!topic && !context) {
      return res.status(400).json({ error: "Topic or context is required to generate a quiz." });
    }

    let aiClient;
    try {
      aiClient = getGeminiClient();
    } catch (err) {
      return res.status(500).json({
        error: "Gemini API Key is missing. Please configure your GEMINI_API_KEY inside Settings > Secrets in the AI Studio platform to enable AI features."
      });
    }

    const promptUser = `Generate a set of 5 multiple-choice questions (quiz) about the following student topic or class lecture materials to test subject comprehension.
Topic: ${topic || 'Classwork subject'}
Material/Notes content: ${context || 'None provided'}

Provide 4 unique option strings, correct index (0-3), and a helpful explanation of why the correct option is true and others are false.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptUser,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The multiple choice question text",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options for the multiple choice",
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The correct 0-based index of the answer options Array (0, 1, 2, or 3)",
              },
              explanation: {
                type: Type.STRING,
                description: "Clear explanation explaining why this answer option is correct.",
              }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response text output from Gemini model.");
    }
    const quizData = JSON.parse(responseText.trim());
    res.json({ quiz: quizData });
  } catch (error: any) {
    console.error("Quiz Generation Error on Server:", error);
    res.status(500).json({ error: error.message || "Failed to generate study quiz via Gemini" });
  }
});

app.post("/api/gemini/flashcards", async (req, res) => {
  try {
    const { topic, context } = req.body;
    if (!topic && !context) {
      return res.status(400).json({ error: "Topic or context is required to compile flashcards." });
    }

    let aiClient;
    try {
      aiClient = getGeminiClient();
    } catch (err) {
      return res.status(500).json({
        error: "Gemini API Key is missing. Please configure your GEMINI_API_KEY inside Settings > Secrets in the AI Studio platform to enable AI features."
      });
    }

    const promptUser = `Generate exactly 6 high-value study flashcards containing key concepts, formulas, rules, timelines, or vocabulary relating to this topic or school materials.
Topic: ${topic || 'Classwork subject'}
Context details: ${context || 'None provided'}

Front should display a clear question, term, or prompt. Back should contain a concise, clear definition, answer, or memory aid. Keep them succinct and memorable.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptUser,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: {
                type: Type.STRING,
                description: "Concept term or question for the front side of the card",
              },
              back: {
                type: Type.STRING,
                description: "Accurate definition or standard study card answer for the back side",
              }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty response text from Gemini.");
    }
    const flashcardsData = JSON.parse(responseText.trim());
    res.json({ flashcards: flashcardsData });
  } catch (error: any) {
    console.error("Flashcards Generation Error on Server:", error);
    res.status(500).json({ error: error.message || "Failed to generate study flashcards" });
  }
});

app.post("/api/gemini/notes", async (req, res) => {
  try {
    const { rawNotes, subject } = req.body;
    if (!rawNotes) {
      return res.status(400).json({ error: "Lecture raw note text is required to format." });
    }

    let aiClient;
    try {
      aiClient = getGeminiClient();
    } catch (err) {
      return res.status(500).json({
        error: "Gemini API Key is missing. Please configure your GEMINI_API_KEY inside Settings > Secrets in the AI Studio platform to enable AI features."
      });
    }

    const promptUser = `Format, correct, outline, and structure the following raw, messy class notes into a modern elegant academic study guide. Feel free to explain concepts briefly if they are vague or write mathematical formulas clearly.
Subject: ${subject || "General Class"}
Messy lecture draft:
---
${rawNotes}
---

Your response MUST be in structured Markdown. Start directly with a '# Study Guide: [Notes Title]' header.
Include sections targeting:
1. **Academic Overview** (2-3 sentences framing the core concepts of the class lecture)
2. **Key Terms & Vocabulary Definitions** (Bullet point definitions with bold terms)
3. **Structured Breakdown** (Use subheadings, bullet points, and neat spacing to organize details logically)
4. **Key Formula / Rules Cheat Sheet** (A summarized cheat block)
5. **Practice Recall Questions** (3 questions a student can use to test themselves)

Provide the formatted Markdown. Keep it educational, accurate, and completely clear of introductory remarks.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptUser,
      config: {
        systemInstruction: "You are an elite academic editor and private tutor specializing in summarizing and streamlining engineering, humanities, and science notes into perfect markdown revision materials.",
      }
    });

    res.json({ markdown: response.text });
  } catch (error: any) {
    console.error("Notes Formatting Error on Server:", error);
    res.status(500).json({ error: error.message || "Failed to organize course notes" });
  }
});

export default app;
