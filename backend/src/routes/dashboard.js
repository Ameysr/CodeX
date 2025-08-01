const express = require('express');
const dashboardRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const { getDashboardData} = require('../controllers/userDashboard');
const {getMyPromoAnalytics} = require('../controllers/promoController')

dashboardRouter.get('/info', userMiddleware, getDashboardData);
dashboardRouter.get('/mypromo', userMiddleware,getMyPromoAnalytics);
module.exports = dashboardRouter;