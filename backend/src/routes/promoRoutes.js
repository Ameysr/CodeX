const express = require('express');
const promoRouter = express.Router();
const { getActivePromos, recordClick, verifyPayment, createPromo, getSlotAvailability,getMyPromoAnalytics,getQueueStatus,getAllPromos,deletePromo} = require('../controllers/promoController');

const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User routes
promoRouter.post('/promo', userMiddleware, upload.single('imageFile'), createPromo);
promoRouter.post('/:id/verify', userMiddleware, verifyPayment);
promoRouter.get('/my-analytics', userMiddleware, getMyPromoAnalytics);

// Public routes
promoRouter.get('/click/:id', recordClick);
promoRouter.get('/active', getActivePromos);
promoRouter.get('/slots/availability', getSlotAvailability);
promoRouter.get('/queue/status', getQueueStatus);

// Admin routes

promoRouter.get('/admin/promos', adminMiddleware, getAllPromos);
promoRouter.delete('/admin/promos/:id', adminMiddleware, deletePromo);

module.exports = promoRouter;