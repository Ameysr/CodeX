const User = require('../models/user');
const Submission = require('../models/submission');
const Contest = require('../models/contestModule');
const Problem = require('../models/problem');
const mongoose = require('mongoose');

const getDashboardData = async (req, res) => {
  try {
    const userId = req.result._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Execute all queries in parallel for better performance
    const [
      user,
      submissionStats,
      totalContests,
      recentSubmissions
    ] = await Promise.all([
      // Get user data
      User.findById(userId).select(
        'firstName lastName email problemSolved createdAt role profilePicture'
      ).lean(), // Use lean() for better performance

      // Get comprehensive submission statistics in a single aggregation
      Submission.aggregate([
        { $match: { userId: userObjectId } },
        {
          $facet: {
            // Get distinct active days
            distinctDays: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" }
                  }
                }
              },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, day: "$_id" } }
            ],
            // Get total submission count (if needed for other metrics)
            totalSubmissions: [
              { $count: "count" }
            ]
          }
        }
      ]),

      // Get contest count
      Contest.countDocuments({
        "participants.user": userObjectId,
        "participants.startTime": { $exists: true }
      }),

      // Get recent submissions with problem details
      Submission.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'problemId',
          select: 'title difficulty'
        })
        .lean()
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total problems solved
    const totalSolved = user.problemSolved?.length || 0;

    // Extract distinct days from aggregation result
    const distinctDays = submissionStats[0]?.distinctDays?.map(d => d.day) || [];
    const totalActiveDays = distinctDays.length;

    // Get solved problems by difficulty in a single query with aggregation
    let solvedByDifficulty = { easy: 0, medium: 0, hard: 0 };
    
    if (totalSolved > 0) {
      const difficultyStats = await Problem.aggregate([
        { $match: { _id: { $in: user.problemSolved } } },
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 }
          }
        }
      ]);

      // Convert aggregation result to the expected format
      difficultyStats.forEach(stat => {
        if (stat._id && solvedByDifficulty.hasOwnProperty(stat._id)) {
          solvedByDifficulty[stat._id] = stat.count;
        }
      });
    }

    // Format recent submissions
    const formattedSubmissions = recentSubmissions.map(sub => ({
      _id: sub._id,
      problem: {
        title: sub.problemId?.title || 'Unknown',
        difficulty: sub.problemId?.difficulty || 'unknown'
      },
      status: sub.status,
      createdAt: sub.createdAt
    }));

    // Optimized streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let lastActive = null;

    if (distinctDays.length > 0) {
      // Convert to timestamps for faster operations
      const activeTimes = distinctDays.map(day => new Date(day + 'T00:00:00Z').getTime());
      activeTimes.sort((a, b) => a - b);
      
      lastActive = new Date(activeTimes[activeTimes.length - 1]);
      
      // Calculate current streak (from most recent date backwards)
      const oneDayMs = 24 * 60 * 60 * 1000;
      let streakCount = 1;
      let currentTime = activeTimes[activeTimes.length - 1];
      
      for (let i = activeTimes.length - 2; i >= 0; i--) {
        const prevTime = activeTimes[i];
        const diffDays = Math.round((currentTime - prevTime) / oneDayMs);
        
        if (diffDays === 1) {
          streakCount++;
          currentTime = prevTime;
        } else if (diffDays > 1) {
          break;
        }
      }
      currentStreak = streakCount;
      
      // Calculate longest streak
      let maxStreak = 1;
      let currentStreakLength = 1;
      
      for (let i = 1; i < activeTimes.length; i++) {
        const diffDays = Math.round((activeTimes[i] - activeTimes[i - 1]) / oneDayMs);
        
        if (diffDays === 1) {
          currentStreakLength++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreakLength);
          currentStreakLength = 1;
        }
      }
      longestStreak = Math.max(maxStreak, currentStreakLength);
    }

    // Send optimized response
    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailId, // Note: using emailId from schema
        createdAt: user.createdAt,
        role: user.role,
        profilePicture: user.profilePicture?.url
      },
      totalSolved,
      totalActiveDays,
      totalContests,
      solvedByDifficulty,
      recentSubmissions: formattedSubmissions,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        lastActive
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDashboardData };