import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

// ── 1. ZOD VALIDATION SCHEMAS ────────────────────────────────────────────────
export const interviewQuestionsSchema = z.object({
    questions: z.array(z.object({
        id: z.number(),
        text: z.string()
    }))
});

export const interviewEvaluationSchema = z.object({
    overallScore: z.number().min(0).max(100),
    communicationRating: z.string(),
    strengths: z.string(),
    weaknesses: z.string(),
    improvements: z.array(z.string()),
    perQuestionAnalysis: z.array(z.object({
        question: z.string(),
        score: z.number().min(0).max(100),
        feedback: z.string()
    }))
});

// ── 2. GEMINI STRUCTURAL RESPONSE SCHEMAS ────────────────────────────────────
const questionsResponseSchema = {
    type: "object",
    properties: {
        questions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "number" },
                    text: { type: "string" }
                },
                required: ["id", "text"]
            }
        }
    },
    required: ["questions"]
};

const evaluationResponseSchema = {
    type: "object",
    properties: {
        overallScore: { type: "number" },
        communicationRating: { type: "string" },
        strengths: { type: "string" },
        weaknesses: { type: "string" },
        improvements: { type: "array", items: { type: "string" } },
        perQuestionAnalysis: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    score: { type: "number" },
                    feedback: { type: "string" }
                },
                required: ["question", "score", "feedback"]
            }
        }
    },
    required: ["overallScore", "communicationRating", "strengths", "weaknesses", "improvements", "perQuestionAnalysis"]
};

// ── 3. EXPORTED SERVICE CORE FUNCTIONS ───────────────────────────────────────

/**
 * Generates an array of 5 difficulty-targeted interview questions based on a job role.
 */
export async function generateLiveQuestions({ jobRole, difficulty }) {
    const prompt = `
You are an expert technical and behavioral interviewer. 
Generate exactly 5 interview questions tailored for the target job role: "${jobRole}".
The difficulty tier must be strictly adjusted to: ${difficulty.toUpperCase()}.

Structure criteria:
- Include 3 core technical domain questions.
- Include 2 tactical situational or behavioral/managerial questions.

You MUST return a valid JSON object with EXACTLY this structure:
{
  "questions": [
    { "id": 1, "text": "Question text here..." },
    { "id": 2, "text": "Question text here..." },
    { "id": 3, "text": "Question text here..." },
    { "id": 4, "text": "Question text here..." },
    { "id": 5, "text": "Question text here..." }
  ]
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: questionsResponseSchema
        }
    });

    const parsed = JSON.parse(response.text);

    // Structural integrity assertion check
    if (!Array.isArray(parsed.questions) || parsed.questions.length !== 5) {
        console.error("Invalid AI questions structure output:", JSON.stringify(parsed, null, 2));
        throw new Error("AI returned invalid question array parameters, please try again.");
    }

    return parsed;
}

/**
 * Evaluates the speech transcript history array against the job expectations using Gemini.
 */
export async function evaluateLiveInterview({ jobRole, difficulty, transcript }) {
    const prompt = `
You are an elite corporate director and recruiting expert evaluating a candidate's live recorded interview transcript.
Target Applied Role: ${jobRole}
Assigned Difficulty Context: ${difficulty}

Analyze the following transcript dataset containing the custom questions asked and the exact speech-to-text text answers provided by the candidate:
${JSON.stringify(transcript, null, 2)}

Evaluate the performance comprehensively. You MUST return a valid JSON object with EXACTLY this structural schema template layout:
{
  "overallScore": number between 0-100,
  "communicationRating": "string - thorough breakdown regarding verbal clarity, articulation, pacing, and confidence",
  "strengths": "string - summary detailing precision, conceptual mastery, or correct logic blocks demonstrated",
  "weaknesses": "string - summary detailing engineering gaps, missed architectural details, or structural errors",
  "improvements": [
    "string - specific actionable study topic suggestion 1",
    "string - specific actionable study topic suggestion 2"
  ],
  "perQuestionAnalysis": [
    {
      "question": "string - the original question text",
      "score": number between 0-100 individual score,
      "feedback": "string - detailed review pointing out what they handled well or missed entirely for this specific answer"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: evaluationResponseSchema
        }
    });

    const parsed = JSON.parse(response.text);

    // Validation runtime safety verification check
    if (
        typeof parsed.overallScore !== "number" ||
        !Array.isArray(parsed.improvements) ||
        !Array.isArray(parsed.perQuestionAnalysis) ||
        parsed.perQuestionAnalysis.length === 0
    ) {
        console.error("Invalid AI evaluation metrics model format returned:", JSON.stringify(parsed, null, 2));
        throw new Error("AI evaluation processing payload broke integrity rules, please re-submit.");
    }

    return parsed;
}