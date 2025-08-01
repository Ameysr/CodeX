const express = require('express');
const interviewRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const virtualinterview = require("../controllers/interview");
const {getImprovementSuggestions,improveContent,generatePDF,analyzeResume} = require("../controllers/resumeAnalysis");


// Virtual interview route
interviewRouter.post("/virtual", userMiddleware, virtualinterview);

// Resume Analysis Routes
interviewRouter.post("/resume/analyze", userMiddleware, analyzeResume);
interviewRouter.post("/resume/generate-pdf", userMiddleware, generatePDF);

// Content Improvement Routes
interviewRouter.post("/improve-content", userMiddleware, improveContent);
interviewRouter.post("/improvement-suggestions", userMiddleware, getImprovementSuggestions);

module.exports = interviewRouter;