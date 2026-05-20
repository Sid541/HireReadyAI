import { createRequire } from "module"
const require = createRequire(import.meta.url)
const PDFParser = require("pdf2json")
import { generateLiveQuestions, evaluateLiveInterview } from "../services/interviewService.js";
import { generateInterviewReport,generateResumePdf } from "../services/ai.service.js"
import interviewReportModel from "../models/interviewReport.model.js"

async function extractTextFromPDF(buffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser()

        pdfParser.on("pdfParser_dataError", (err) => {
            console.log("PDF2JSON ERROR:", err)
            reject(new Error("Invalid or corrupted PDF file"))
        })

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const text = pdfData.Pages
                .map(page =>
                    page.Texts
                        .map(t => decodeURIComponent(t.R.map(r => r.T).join("")))
                        .join(" ")
                )
                .join("\n")

            if (!text.trim()) {
                reject(new Error("PDF appears to be empty or contains no extractable text"))
            }

            resolve(text.trim())
        })

        pdfParser.parseBuffer(buffer)
    })
}

export async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        let resumeText = ""

        if (req.files?.resumeFile?.[0]?.buffer) {
            resumeText = await extractTextFromPDF(req.files.resumeFile[0].buffer)
        }

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if (!resumeText && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Resume or self description is required"
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription,
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi,
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            ...interviewReport._doc
        })

    } catch (error) {
        console.error("[generateInterViewReportController]", error)
        res.status(500).json({
            message: error.message || "Failed to generate report",
        })
    }
}

export async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select(
                "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
            )

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}



export async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const pdfBuffer = await generateResumePdf({
            resume: interviewReport.resume,
            selfDescription: interviewReport.selfDescription,
            jobDescription: interviewReport.jobDescription
        })

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename=resume_${interviewReportId}.pdf`)
        res.send(pdfBuffer)

    } catch (error) {
        console.error("[generateResumePdfController]", error)
        res.status(500).json({ message: error.message })
    }
}

/**
 * Handles the HTTP setup route context task
 */
export const startInterviewSession = async (req, res) => {
    try {
        const { jobRole, difficulty } = req.body;

        if (!jobRole || !difficulty) {
            return res.status(400).json({ message: "Missing required parameters: jobRole or difficulty." });
        }

        const questionsData = await generateLiveQuestions({ jobRole, difficulty });
        return res.status(200).json(questionsData);
    } catch (error) {
        console.error("Controller Error inside startInterviewSession:", error.message);
        return res.status(500).json({ error: error.message || "Failed to spin up interview runtime variables." });
    }
};

/**
 * Handles processing completed transcript logs to respond with deep report arrays
 */
export const processInterviewEvaluation = async (req, res) => {
    try {
        const { jobRole, difficulty, transcript } = req.body;

        if (!jobRole || !difficulty || !transcript) {
            return res.status(400).json({ message: "Missing required payload arrays for computation." });
        }

        const evaluationReport = await evaluateLiveInterview({ jobRole, difficulty, transcript });
        return res.status(200).json(evaluationReport);
    } catch (error) {
        console.error("Controller Error inside processInterviewEvaluation:", error.message);
        return res.status(500).json({ error: error.message || "Failed to process interview diagnostic evaluation." });
    }
};