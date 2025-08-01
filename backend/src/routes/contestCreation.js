const express = require('express');
const contestRouter =  express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const adminmiddleware = require("../middleware/adminMiddleware")
const {contestpost,contestGetall,contestGetbyId,submissionContest,getContestResults,startContest,endContest,deleteContest} = require('../controllers/contestpost');


contestRouter.post('/create', adminmiddleware, contestpost);
contestRouter.get('/fetchAll', userMiddleware, contestGetall);
contestRouter.get('/fetchById/:id', userMiddleware, contestGetbyId);
contestRouter.post("/submit/:id", userMiddleware, submissionContest);
contestRouter.get('/:id/results', userMiddleware, getContestResults);
contestRouter.post('/:id/start', userMiddleware, startContest);
contestRouter.post('/:id/end', userMiddleware, endContest);
contestRouter.delete('/delete/:id', adminmiddleware, deleteContest);



module.exports = contestRouter;