import express from "express"
import multer from "multer"

import {
    generateInterViewReportController,
    getAllInterviewReportsController,
    getInterviewReportByIdController,
    generateResumePdfController
} from "../controllers/interviewController.js"

import { startInterviewSession, processInterviewEvaluation } from "../controllers/interviewController.js";

import { isAuthenticated } from "../middlewares/authMiddleware.js"

const interviewRouter = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only PDF and DOCX allowed"))
    }
})

interviewRouter.post("/debug", multer().any(), (req, res) => {
    res.json({
        fields: Object.keys(req.body),
        files: req.files?.map(f => f.fieldname)
    })
})

interviewRouter.post(
    "/",
    isAuthenticated,
    upload.fields([
        { name: "resumeFile", maxCount: 1 }
    ]),
    generateInterViewReportController
)
interviewRouter.get("/", isAuthenticated, getAllInterviewReportsController)
interviewRouter.get("/report/:interviewId", isAuthenticated, getInterviewReportByIdController)
interviewRouter.post("/resume/pdf/:interviewReportId", isAuthenticated, generateResumePdfController)
interviewRouter.post("/evaluate", isAuthenticated, processInterviewEvaluation)
interviewRouter.post("/start", isAuthenticated, startInterviewSession)

export default interviewRouter;