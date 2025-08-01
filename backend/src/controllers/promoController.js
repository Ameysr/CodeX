const CoursePromo = require('../models/coursePromo');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper to upload image to Cloudinary
const uploadToCloudinary = async (source) => {
  try {
    if (source.buffer) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'promotions' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              resolve(result);
            }
          }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(source.buffer);
        bufferStream.pipe(uploadStream);
      });
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Updated Slot Pricing Configuration with new durations
const SLOT_PRICES = {
  1: 10000, // Top slot (most prominent) - Premium price - 1 Month
  2: 3000,  // Middle slot - Standard price - 1 Week
  3: 1500   // Bottom slot - Economy price - 1 Day
};

// Slot duration configuration
const SLOT_DURATIONS = {
  1: 30, // 30 days (1 month)
  2: 7,  // 7 days (1 week)
  3: 1   // 1 day
};

// Helper to get next available slot
const getNextAvailableSlot = (occupiedSlots) => {
  for (let slot = 1; slot <= 3; slot++) {
    if (!occupiedSlots.includes(slot)) {
      return slot;
    }
  }
  return null;
};

// Enhanced helper to check slot availability with detailed wait times
const getSlotAvailabilityDetails = async () => {
  const now = new Date();
  
  // Get only approved and active promos
  const activePromos = await CoursePromo.find({
    isApproved: true,
    isActive: true,
    expiresAt: { $gt: now }
  }).sort({ expiresAt: 1 }); // Sort by expiration date (earliest first)

  // Get occupied slots
  const occupiedSlots = activePromos.map(promo => promo.slot);
  
  // Get next available slot in priority order (1 > 2 > 3)
  const nextAvailableSlot = getNextAvailableSlot(occupiedSlots);

  // Check available slots
  const availableSlots = [];
  for (let slot = 1; slot <= 3; slot++) {
    if (!occupiedSlots.includes(slot)) {
      availableSlots.push(slot);
    }
  }

  // Calculate wait times
  let nextAvailableDate = null;
  let soonestExpiringSlot = null;
  let waitDays = null;

  if (availableSlots.length === 0 && activePromos.length > 0) {
    // Find the promotion that expires soonest
    const soonestExpiring = activePromos[0]; // Already sorted by expiration
    nextAvailableDate = soonestExpiring.expiresAt;
    soonestExpiringSlot = soonestExpiring.slot;
    waitDays = Math.ceil((nextAvailableDate - now) / (1000 * 60 * 60 * 24));
  }

  return {
    occupiedSlots,
    availableSlots,
    nextAvailableSlot,
    nextAvailableDate,
    soonestExpiringSlot,
    waitDays,
    totalActivePromos: activePromos.length
  };
};

// Helper function to format wait time in a user-friendly way
const formatWaitTime = (days) => {
  if (days === 0) return 'Less than a day';
  if (days === 1) return '1 day';
  if (days <= 7) return `${days} days`;
  if (days <= 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${weeks} week${weeks !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  }
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (remainingDays === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  return `about ${months} month${months !== 1 ? 's' : ''}`;
};

// Helper function to get slot duration text
const getSlotDurationText = (slotNumber) => {
  switch(slotNumber) {
    case 1: return '1 Month Active';
    case 2: return '1 Week Active';
    case 3: return '1 Day Active';
    default: return 'N/A';
  }
};

// Enhanced slot availability endpoint with detailed wait information
const getSlotAvailability = async (req, res) => {
  try {
    const slotDetails = await getSlotAvailabilityDetails();
    
    // Create detailed slot status
    const slotStatus = [];
    for (let slotNum = 1; slotNum <= 3; slotNum++) {
      const isOccupied = slotDetails.occupiedSlots.includes(slotNum);
      const isNextAvailable = slotDetails.nextAvailableSlot === slotNum;
      
      slotStatus.push({
        slot: slotNum,
        price: SLOT_PRICES[slotNum],
        duration: getSlotDurationText(slotNum),
        durationDays: SLOT_DURATIONS[slotNum],
        status: isOccupied ? 'occupied' : 'available',
        isNextAvailable,
        isRecommended: isNextAvailable && !isOccupied
      });
    }

    const response = {
      success: true,
      slots: slotStatus,
      availableCount: slotDetails.availableSlots.length,
      totalSlots: 3,
      isFullyOccupied: slotDetails.availableSlots.length === 0,
      nextAvailableSlot: slotDetails.nextAvailableSlot
    };

    // Add wait time information if all slots are occupied
    if (slotDetails.availableSlots.length === 0) {
      response.waitInfo = {
        message: `All promotion slots are currently occupied. Next slot will be available in ${slotDetails.waitDays} day${slotDetails.waitDays !== 1 ? 's' : ''}.`,
        nextAvailableDate: slotDetails.nextAvailableDate,
        waitDays: slotDetails.waitDays,
        soonestExpiringSlot: slotDetails.soonestExpiringSlot,
        formattedWaitTime: formatWaitTime(slotDetails.waitDays)
      };
    }

    res.json(response);
  } catch (err) {
    console.error('Slot availability error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get slot availability'
    });
  }
};

// Enhanced create promo with better error messages and updated durations
const createPromo = async (req, res) => {
  try {
    const { title, description, targetUrl } = req.body;
    const userId = req.result._id;
    const imageFile = req.file;

    // Validate inputs
    if (!title || !description || !targetUrl) {
      return res.status(400).json({ 
        error: 'All fields are required',
        missingFields: {
          title: !title,
          description: !description,
          targetUrl: !targetUrl
        }
      });
    }

    if (!targetUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Target URL must be HTTPS' });
    }

    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Get detailed slot availability
    const slotDetails = await getSlotAvailabilityDetails();
    
    if (slotDetails.availableSlots.length === 0) {
      return res.status(400).json({ 
        error: 'No promotion slots available',
        waitInfo: {
          message: `All 3 promotion slots are currently occupied. The next available slot will open in ${slotDetails.waitDays} day${slotDetails.waitDays !== 1 ? 's' : ''}.`,
          waitDays: slotDetails.waitDays,
          nextAvailableDate: slotDetails.nextAvailableDate,
          soonestExpiringSlot: slotDetails.soonestExpiringSlot,
          formattedWaitTime: formatWaitTime(slotDetails.waitDays),
          nextAvailableSlot: slotDetails.nextAvailableSlot
        }
      });
    }

    // Assign next available slot
    const slotToAssign = slotDetails.nextAvailableSlot;
    const price = SLOT_PRICES[slotToAssign];
    const durationDays = SLOT_DURATIONS[slotToAssign];

    // Upload image
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary({
        buffer: imageFile.buffer,
        originalname: imageFile.originalname
      });
    } catch (uploadErr) {
      return res.status(500).json({
        error: 'Failed to process image',
        details: uploadErr.message
      });
    }

    // Create promo with assigned slot and updated duration
    const promo = new CoursePromo({
      userId,
      title,
      description,
      imagePublicId: cloudinaryResult.public_id,
      imageUrl: cloudinaryResult.secure_url,
      targetUrl,
      slot: slotToAssign,
      price,
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) // Updated duration
    });

    await promo.save();

    // Create Razorpay order with updated name
    const order = await razorpay.orders.create({
      amount: price * 100,
      currency: 'INR',
      receipt: `codex_promo_${promo._id}`,
      notes: {
        promoId: promo._id.toString(),
        userId: userId.toString(),
        slot: slotToAssign.toString(),
        duration: getSlotDurationText(slotToAssign)
      }
    });

    res.json({
      success: true,
      message: `Promotion created successfully! Assigned to slot ${slotToAssign} (${slotToAssign === 1 ? 'Premium - 1 Month' : slotToAssign === 2 ? 'Standard - 1 Week' : 'Economy - 1 Day'}).`,
      promo: {
        ...promo.toObject(),
        slot: slotToAssign,
        slotType: slotToAssign === 1 ? 'Premium' : slotToAssign === 2 ? 'Standard' : 'Economy',
        duration: getSlotDurationText(slotToAssign),
        durationDays: durationDays
      },
      order,
      slotInfo: {
        assignedSlot: slotToAssign,
        price: price,
        duration: getSlotDurationText(slotToAssign),
        durationDays: durationDays,
        remainingSlots: slotDetails.availableSlots.length - 1
      }
    });
  } catch (err) {
    console.error('Promo creation error:', err);
    res.status(500).json({
      error: 'Failed to create promotion',
      details: err.message
    });
  }
};

// Verify payment and activate promo
const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    const promoId = req.params.id;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update promo status
    const promo = await CoursePromo.findByIdAndUpdate(
      promoId,
      {
        isApproved: true,
        paymentId: payment_id,
        moderationStatus: 'approved',
        isActive: true
      },
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    // Get updated slot information
    const slotDetails = await getSlotAvailabilityDetails();

    res.json({
      success: true,
      message: `Payment verified! Your promotion is now live in slot ${promo.slot} (${getSlotDurationText(promo.slot)}).`,
      promo: {
        ...promo.toObject(),
        duration: getSlotDurationText(promo.slot),
        slotType: promo.slot === 1 ? 'Premium' : promo.slot === 2 ? 'Standard' : 'Economy'
      },
      slot: promo.slot,
      remainingSlots: slotDetails.availableSlots.length
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      error: 'Payment verification failed',
      details: err.message
    });
  }
};

// Record click and redirect
const recordClick = async (req, res) => {
  try {
    const promo = await CoursePromo.findById(req.params.id);
    
    if (!promo || !promo.isApproved || !promo.isActive) {
      return res.status(404).json({ error: 'Promotion not available' });
    }

    await CoursePromo.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } }
    );

    res.status(200).json({ 
      targetUrl: promo.targetUrl,
      slot: promo.slot,
      duration: getSlotDurationText(promo.slot)
    });
  } catch (err) {
    console.error('Click recording error:', err);
    res.status(500).json({
      error: 'Failed to record click',
      details: err.message
    });
  }
};

// Get active promos sorted by slot priority
const getActivePromos = async (req, res) => {
  try {
    const now = new Date();
    const promos = await CoursePromo.find({
      isApproved: true,
      isActive: true,
      expiresAt: { $gt: now }
    })
    .sort('slot') // Sort by slot priority (1, 2, 3)
    .populate('userId', 'firstName lastName');

    const slotDetails = await getSlotAvailabilityDetails();

    // Return promos with enhanced slot information
    const enhancedPromos = promos.map(p => ({
      ...p.toObject(),
      slot: p.slot,
      slotType: p.slot === 1 ? 'Premium' : p.slot === 2 ? 'Standard' : 'Economy',
      duration: getSlotDurationText(p.slot),
      durationDays: SLOT_DURATIONS[p.slot],
      daysRemaining: Math.ceil((p.expiresAt - now) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      promos: enhancedPromos,
      totalActivePromos: promos.length,
      availableSlots: slotDetails.availableSlots.length,
      maxSlots: 3,
      slotPricing: SLOT_PRICES,
      slotDurations: Object.keys(SLOT_DURATIONS).reduce((acc, key) => {
        acc[key] = getSlotDurationText(parseInt(key));
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to get promotions',
      details: err.message 
    });
  }
};

// User promo analytics with slot information
const getMyPromoAnalytics = async (req, res) => {
  try {
    const userId = req.result._id;
    const promos = await CoursePromo.find({ userId }).sort({ createdAt: -1 });
    const now = new Date();

    const analytics = promos.map(promo => {
      const expiresInMs = promo.expiresAt - now;
      const daysRemaining = Math.max(Math.ceil(expiresInMs / (1000 * 60 * 60 * 24)), 0);

      let status = 'pending';
      if (promo.moderationStatus === 'rejected') status = 'rejected';
      else if (promo.expiresAt < now) status = 'expired';
      else if (promo.isApproved && promo.isActive) status = 'active';

      return {
        ...promo.toObject(),
        daysRemaining,
        status,
        slotType: promo.slot === 1 ? 'Premium' : promo.slot === 2 ? 'Standard' : 'Economy',
        duration: getSlotDurationText(promo.slot),
        durationDays: SLOT_DURATIONS[promo.slot]
      };
    });

    // Get current slot availability for reference
    const slotDetails = await getSlotAvailabilityDetails();

    res.json({ 
      success: true, 
      analytics,
      currentSlotAvailability: {
        available: slotDetails.availableSlots.length,
        total: 3,
        waitDays: slotDetails.waitDays
      },
      slotPricing: SLOT_PRICES,
      slotDurations: Object.keys(SLOT_DURATIONS).reduce((acc, key) => {
        acc[key] = getSlotDurationText(parseInt(key));
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

// Get queue status - shows waiting time and position
const getQueueStatus = async (req, res) => {
  try {
    const slotDetails = await getSlotAvailabilityDetails();
    
    const queueInfo = {
      availableSlots: slotDetails.availableSlots.length,
      totalSlots: 3,
      isFullyOccupied: slotDetails.availableSlots.length === 0
    };

    if (slotDetails.availableSlots.length === 0) {
      queueInfo.waitInfo = {
        waitDays: slotDetails.waitDays,
        nextAvailableDate: slotDetails.nextAvailableDate,
        soonestExpiringSlot: slotDetails.soonestExpiringSlot,
        formattedWaitTime: formatWaitTime(slotDetails.waitDays),
        message: `All slots occupied. Next opening in ${formatWaitTime(slotDetails.waitDays)}.`
      };
    }

    res.json({
      success: true,
      queue: queueInfo,
      occupiedSlots: slotDetails.occupiedSlotsDetails,
      slotPricing: SLOT_PRICES,
      slotDurations: Object.keys(SLOT_DURATIONS).reduce((acc, key) => {
        acc[key] = getSlotDurationText(parseInt(key));
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Queue status error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    });
  }
};

const getAllPromos = async (req, res) => {
  try {
    const promos = await CoursePromo.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      promos: promos.map(p => ({
        ...p.toObject(),
        slotType: p.slot === 1 ? 'Premium' : p.slot === 2 ? 'Standard' : 'Economy',
        duration: getSlotDurationText(p.slot),
        durationDays: SLOT_DURATIONS[p.slot]
      })),
      slotPricing: SLOT_PRICES,
      slotDurations: Object.keys(SLOT_DURATIONS).reduce((acc, key) => {
        acc[key] = getSlotDurationText(parseInt(key));
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to get promotions',
      details: err.message 
    });
  }
};

// Delete promo by ID (admin)
const deletePromo = async (req, res) => {
  try {
    const promo = await CoursePromo.findByIdAndDelete(req.params.id);
    
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        error: 'Promotion not found' 
      });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(promo.imagePublicId);

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete promotion',
      details: err.message 
    });
  }
};

module.exports = {
  uploadToCloudinary,
  createPromo,
  verifyPayment,
  recordClick,
  getActivePromos,
  getMyPromoAnalytics,
  getSlotAvailability,
  getQueueStatus,
  deletePromo,
  getAllPromos,
  SLOT_PRICES,
  SLOT_DURATIONS,
  getSlotDurationText
};