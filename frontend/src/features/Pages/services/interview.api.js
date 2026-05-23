import axios from "axios";
const VITE_API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: VITE_API_URL,
    withCredentials: true, // ✅ Correct: Essential for sending cookies across origins
});

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resumeFile", resumeFile);

    // ✅ FIXED: Removed trailing slash to prevent cookie-stripping internal redirects
    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    // ✅ FIXED: Removed trailing slash inside URL interpolation matching backend definition
    const response = await api.get(`/api/interview/report/${interviewId}`);
    console.log("Fetched Interview Report:", response);
    return response.data;
};

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    // ✅ FIXED: Removed trailing slash to preserve authentication context headers
    const response = await api.get("/api/interview");
    return response.data;
};

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    });

    return response.data;
};