const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo,getVideoByProblem,getUserVideos,getAllVideos} = require('../controllers/videoSection')

// Admin routes
videoRouter.get("/create/:problemId",adminMiddleware,generateUploadSignature);
videoRouter.post("/save",adminMiddleware,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",adminMiddleware,deleteVideo);
videoRouter.get("/all",adminMiddleware,getAllVideos);

// User routes
videoRouter.get("/problem/:problemId",userMiddleware,getVideoByProblem);
videoRouter.get("/my-videos",userMiddleware,getUserVideos);


module.exports = videoRouter;