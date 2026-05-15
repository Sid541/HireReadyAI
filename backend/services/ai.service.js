import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import puppeteer from "puppeteer";

if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

export const interviewReportSchema = z.object({
    matchScore: z.number(),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string()
});

const geminiResponseSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        matchScore: { type: "number" },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "number" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } }
                },
                required: ["day", "focus", "tasks"]
            }
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};

export async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `
You are an expert interview coach. Analyze the candidate's resume, self description, and job description, then generate a comprehensive interview preparation report.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

You MUST return a valid JSON object with EXACTLY this structure:
{
  "title": "string - job title from job description",
  "matchScore": number between 0-100,
  "technicalQuestions": [
    {
      "question": "string - the technical question",
      "intention": "string - why interviewer asks this",
      "answer": "string - how to answer it"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string - the behavioral question",
      "intention": "string - why interviewer asks this",
      "answer": "string - how to answer it using STAR method"
    }
  ],
  "skillGaps": [
    {
      "skill": "string - missing skill name",
      "severity": "low" or "medium" or "high"
    }
  ],
  "preparationPlan": [
    {
      "day": number,
      "focus": "string - main topic for the day",
      "tasks": ["string - task 1", "string - task 2"]
    }
  ]
}

Rules:
- technicalQuestions: minimum 5 items, each must have question, intention, and answer as strings
- behavioralQuestions: minimum 5 items, each must have question, intention, and answer as strings
- skillGaps: each must have skill (string) and severity ("low"/"medium"/"high")
- preparationPlan: exactly 7 items (Day 1 to Day 7), each must have day (number), focus (string), tasks (array of strings)
- Every array item must be a proper JSON object with named fields, NOT a plain string
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: geminiResponseSchema
        }
    });

    const parsed = JSON.parse(response.text);

    const isValidArray = (arr, requiredKeys) =>
        Array.isArray(arr) &&
        arr.length > 0 &&
        typeof arr[0] === "object" &&
        requiredKeys.every(k => k in arr[0]);

    if (
        !isValidArray(parsed.technicalQuestions, ["question", "intention", "answer"]) ||
        !isValidArray(parsed.behavioralQuestions, ["question", "intention", "answer"]) ||
        !isValidArray(parsed.skillGaps, ["skill", "severity"]) ||
        !isValidArray(parsed.preparationPlan, ["day", "focus", "tasks"])
    ) {
        console.error("Invalid AI response structure:", JSON.stringify(parsed, null, 2));
        throw new Error("AI returned invalid data structure, please try again");
    }

    return parsed;
}

export async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    });

    await browser.close();

    return pdfBuffer;
}

export async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumeGeminiSchema = {
        type: "object",
        properties: {
            html: { type: "string" }
        },
        required: ["html"]
    };

    const prompt = `Generate a resume for a candidate with the following details:
        Resume: ${resume}
        Self Description: ${selfDescription}
        Job Description: ${jobDescription}

        Return a JSON object with a single field "html" containing the full HTML resume.
        The resume should be tailored for the given job description and highlight the candidate's strengths.
        It should be ATS friendly, professional, simple, and ideally 1-2 pages when converted to PDF.
        Do not make it sound AI-generated.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeGeminiSchema
        }
    });

    const jsonContent = JSON.parse(response.text);
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}