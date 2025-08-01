import { useEffect, useState } from "react";
import { NavLink, useNavigate } from 'react-router';
import axiosClient from "../utils/axiosClient";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip
} from 'recharts';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streakHistory, setStreakHistory] = useState([]);
  const [promoData, setPromoData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosClient.get('/dashboard/info');
        setDashboardData(response.data);
        generateStreakHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setLoading(false);
      }
    };

    const fetchPromoData = async () => {
      try {
        const response = await axiosClient.get('/dashboard/mypromo');
        setPromoData(response.data.analytics || []);
      } catch (err) {
        console.error('Error fetching promo data:', err);
        setPromoData([]);
      }
    };

    fetchDashboardData();
    fetchPromoData();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload profile picture
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      
      const response = await axiosClient.put('/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update dashboard data with new profile picture
      setDashboardData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          profilePicture: response.data.profilePicture
        }
      }));
      
      // Reset states
      setSelectedFile(null);
      setPreviewUrl("");
      alert('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Fixed streak history generation with empty submission handling
  const generateStreakHistory = (data) => {
    const history = [];
    const today = new Date();
    
    // Handle case where recentSubmissions might be undefined
    const submissions = data.recentSubmissions || [];
    
    // Create a set of submission dates (YYYY-MM-DD format)
    const submissionDates = new Set();
    submissions.forEach(sub => {
      const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
      submissionDates.add(dateStr);
    });

    // Create 14-day history from today to 13 days ago
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format date to match submission format
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date has a submission
      const hasSubmission = submissionDates.has(dateStr);
      
      history.unshift({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate(),
        active: hasSubmission ? 1 : 0
      });
    }

    setStreakHistory(history);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "oklch(0.145 0 0)", color: "oklch(0.8 0 0)" }}>
        {/* Header Skeleton */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="text-center mb-10 animate-pulse">
            <div className="h-10 w-1/3 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="h-4 w-1/4 bg-gray-700 rounded mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* User Profile Card Skeleton */}
            <div className="lg:col-span-1">
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{
                  backgroundColor: "#131516",
                  border: "0.1px solid oklch(1 0 0 / 0.3)",
                }}
              >
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-20 h-20 rounded-xl mb-4 bg-gray-700"></div>
                  
                  <div className="h-6 w-3/4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-700 rounded mb-6"></div>
                  
                  <div className="w-full space-y-4">
                    <div className="p-4 rounded-lg bg-gray-700 h-32"></div>
                    <div className="p-4 rounded-lg bg-gray-700 h-32"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Dashboard Skeleton */}
            <div className="lg:col-span-3">
              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl p-6 shadow-lg"
                    style={{
                      backgroundColor: "#131516",
                      border: "0.1px solid oklch(1 0 0 / 0.3)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-8 w-16 bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-24 bg-gray-700 rounded"></div>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-700">
                        <div className="w-8 h-8"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Streak and Promo Section Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-pulse">
                {/* Streak Visualization Skeleton */}
                <div
                  className="rounded-xl p-6 shadow-lg"
                  style={{
                    backgroundColor: "#131516",
                    border: "0.1px solid oklch(1 0 0 / 0.3)",
                  }}
                >
                  <div className="h-6 w-1/3 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                          <div className="h-3 w-8 bg-gray-700 rounded mt-1"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                          <div className="h-3 w-8 bg-gray-700 rounded mt-1"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Promo Section Skeleton */}
                <div
                  className="rounded-xl p-6 shadow-lg"
                  style={{
                    backgroundColor: "#131516",
                    border: "0.1px solid oklch(1 0 0 / 0.3)",
                  }}
                >
                  <div className="h-6 w-1/4 bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-gray-700 h-32"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pie Chart Section Skeleton */}
              <div
                className="rounded-xl p-6 shadow-lg mb-6"
                style={{
                  backgroundColor: "#131516",
                  border: "0.1px solid oklch(1 0 0 / 0.3)",
                }}
              >
                <div className="h-6 w-1/3 bg-gray-700 rounded mb-6 animate-pulse"></div>
                <div className="flex flex-col lg:flex-row items-center gap-8 animate-pulse">
                  <div className="w-full lg:w-1/2 h-64 bg-gray-700 rounded-lg"></div>
                  <div className="w-full lg:w-1/2">
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 rounded-lg bg-gray-700 h-16"></div>
                      ))}
                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <div className="h-4 w-32 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-10 bg-gray-900 text-gray-300 h-screen">
        No dashboard data available
      </div>
    );
  }

  // Safely destructure with default values and additional safety checks
  const { 
    user = { firstName: '', lastName: '', createdAt: new Date().toISOString(), role: 'user', email: '' },
    streak = { current: 0, longest: 0, lastActive: null },
    solvedByDifficulty = { easy: 0, medium: 0, hard: 0 },
    totalSolved = 0,
    totalActiveDays = 0,
    totalContests = 0
  } = dashboardData;

  // Additional safety for user fields
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const email = user.email || '';
  const userRole = user.role || 'user';
  const createdAt = user.createdAt || new Date().toISOString();

  // Safe initials generation
  const getInitials = () => {
    const firstInitial = firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || 'U'; // Default to 'U' if no initials available
  };

  const difficultyData = [
    { name: 'Easy', value: solvedByDifficulty.easy },
    { name: 'Medium', value: solvedByDifficulty.medium },
    { name: 'Hard', value: solvedByDifficulty.hard }
  ];

  const COLORS = ['#10B981', '#FBBF24', '#EF4444'];

  // Custom tooltip for dark theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-md shadow-lg">
          <p className="text-gray-200">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Compact Streak visualization component (2 rows of 7 days each)
  const StreakVisualization = () => {
    const firstRow = streakHistory.slice(0, 7);
    const secondRow = streakHistory.slice(7, 14);

    return (
      <div className="space-y-3">
        <div className="flex justify-between">
          {firstRow.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                day.active ? 'bg-orange-500' : 'bg-gray-700'
              }`}>
                <span className={`text-xs ${day.active ? 'text-white' : 'text-gray-500'}`}>
                  {day.day}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {secondRow.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                day.active ? 'bg-orange-500' : 'bg-gray-700'
              }`}>
                <span className={`text-xs ${day.active ? 'text-white' : 'text-gray-500'}`}>
                  {day.day}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{day.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

return (
  <div className="min-h-screen" style={{ backgroundColor: "oklch(0.145 0 0)", color: "oklch(0.8 0 0)" }}>
    {/* Navigation Bar */}
            <style>{`
        /* Global scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 transparent;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    <nav
      className="border-b py-4 px-6 flex justify-between items-center shadow-lg"
      style={{
        backgroundColor: "#131516",
        borderBottom: "0.1px solid oklch(1 0 0 / 0.3)",
        color: "oklch(0.8 0 0)",
      }}
    >
      <NavLink
        to="/"
        className="text-3xl font-bold text-gray-300 hover:text-white transition-colors duration-200"
      >
        CodeX
      </NavLink>
      
      <div className="flex items-center gap-4">
        {/* Navigation Links */}
        <NavLink 
          to="/home" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Problems
        </NavLink>

        <NavLink 
          to="/interview" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Virtual Interview
        </NavLink>

        <NavLink 
          to="/resume" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Resume Building
        </NavLink>

        <NavLink 
          to="/dashboard" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Dashboard
        </NavLink>

        <NavLink 
          to="/promote" 
          className="px-4 py-2 rounded-lg font-medium text-white text-x transition-all duration-200 hover:scale-105"
        >
          Promote
        </NavLink>
      </div>
    </nav>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl"
            style={{
              backgroundColor: "#131516",
              border: "0.1px solid oklch(1 0 0 / 0.3)",
              color: "oklch(0.8 0 0)",
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                {user.profilePicture || previewUrl ? (
                  <img 
                    src={previewUrl || user.profilePicture} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-xl mb-4 object-cover shadow-lg"
                    style={{ border: "0.1px solid oklch(1 0 0 / 0.2)" }}
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-xl mb-4 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: "oklch(0.145 0 0)", border: "0.1px solid oklch(1 0 0 / 0.2)" }}
                  >
                    <span className="text-2xl font-bold text-blue-400">
                      {getInitials()}
                    </span>
                  </div>
                )}
                
                <label 
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <h2 className="text-xl font-bold text-white mb-1">
                {firstName} {lastName}
              </h2>
              <p className="text-gray-400 mb-6">{email}</p>

              {/* Upload Section */}
              {selectedFile && (
                <div className="w-full mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm truncate">
                      {selectedFile.name}
                    </span>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:bg-gray-600"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                      }}
                      className="px-2 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "oklch(0.145 0 0)" }}>
                  <h3 className="text-gray-300 text-sm font-semibold mb-3">ACCOUNT DETAILS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Joined:</span>
                      <span className="text-gray-300 font-mono text-sm">
                        {new Date(createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Role:</span>
                      <span className="text-blue-400 font-medium text-sm capitalize">{userRole}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Problems Solved:</span>
                      <span className="font-bold text-green-400 text-lg">
                        {totalSolved}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: "oklch(0.145 0 0)" }}>
                  <h3 className="text-gray-300 text-sm font-semibold mb-3">STREAK INFO</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Current Streak:</span>
                      <span className="font-bold text-orange-400 text-lg">
                        {streak.current} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Longest Streak:</span>
                      <span className="font-bold text-purple-400 text-lg">
                        {streak.longest} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{
                backgroundColor: "#131516",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {totalSolved}
                  </div>
                  <h3 className="text-gray-300 font-medium">Problems Solved</h3>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{
                backgroundColor: "#131516",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {totalActiveDays}
                  </div>
                  <h3 className="text-gray-300 font-medium">Active Days</h3>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{
                backgroundColor: "#131516",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {totalContests}
                  </div>
                  <h3 className="text-gray-300 font-medium">Contests Given</h3>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Streak and Promo Section - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Streak Visualization - Only show if streak exists */}
            {streak.current > 0 && (
              <div
                className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl"
                style={{
                  backgroundColor: "#131516",
                  border: "0.1px solid oklch(1 0 0 / 0.3)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-orange-400">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="inline-block mr-2 text-orange-500" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12.23 15.5c-.93 0-1.69-.76-1.69-1.69 0-.93.76-1.69 1.69-1.69s1.69.76 1.69 1.69c0 .93-.76 1.69-1.69 1.69zm6.77-6.68c-.74-.33-1.59.22-1.59 1.03 0 .37.19.7.5.88v.06c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25v-.09c-.76-.08-1.5-.28-2.18-.6-1.01-.48-1.85-1.24-2.43-2.18-.52-.86-.79-1.83-.77-2.83h-1.51c-.05 1.02.21 2.02.75 2.89.5.82 1.2 1.48 2.02 1.92.45.25.94.42 1.45.5.23.04.45.07.67.09.18.02.34.03.51.03.69 0 1.34-.17 1.92-.5.58-.33 1.02-.8 1.34-1.37.32-.57.48-1.21.48-1.88 0-1.31-.68-2.47-1.7-3.13-.74-.47-1.63-.6-2.48-.46-.68.12-1.31.43-1.82.9-.51.47-.88 1.07-1.07 1.73h-1.52c.23-1.05.74-2 1.47-2.73s1.68-1.24 2.73-1.47c1.05-.23 2.13-.14 3.11.25 1.11.45 2.03 1.27 2.62 2.33.59 1.06.82 2.29.65 3.5-.17 1.21-.73 2.33-1.58 3.2z"/>
                    </svg>
                    Coding Streak
                  </h2>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-400">{streak.current}</div>
                      <div className="text-gray-400 text-xs">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-400">{streak.longest}</div>
                      <div className="text-gray-400 text-xs">Longest</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-gray-300 mb-3 text-sm">Last 14 Days</h3>
                  <StreakVisualization />
                </div>
                
                {streak.lastActive && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last active:</span>
                      <span className="text-gray-300">
                        {new Date(streak.lastActive).toLocaleDateString()} at{' '}
                        {new Date(streak.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Promo Section */}
            <div
              className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-xl"
              style={{
                backgroundColor: "#131516",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
              }}
            >
              <h2 className="text-xl font-bold text-blue-400 mb-4">
                Promotions
              </h2>
              {!promoData || promoData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No Promo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {promoData.map((promo, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: "oklch(0.145 0 0)" }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">${promo.price}</div>
                          <div className="text-gray-400 text-sm">Price</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{promo.clicks}</div>
                          <div className="text-gray-400 text-sm">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-400">{promo.daysRemaining}</div>
                          <div className="text-gray-400 text-sm">Days Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              promo.status === 'active'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {promo.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm mt-2">
                            {new Date(promo.createdAt).toLocaleDateString('en-US', { 
                              year: '2-digit', 
                              month: '2-digit', 
                              day: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div
            className="rounded-xl p-6 shadow-lg mb-6 transition-all duration-200 hover:shadow-xl"
            style={{
              backgroundColor: "#131516",
              border: "0.1px solid oklch(1 0 0 / 0.3)",
            }}
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-6">
              Problems Solved by Difficulty
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => (
                        <text 
                          fill="white"
                          x={0}
                          y={0}
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {`${name}: ${(percent * 100).toFixed(0)}%`}
                        </text>
                      )}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ color: '#fff' }}
                      formatter={(value) => <span className="text-gray-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="space-y-4">
                  {difficultyData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "oklch(0.145 0 0)" }}>
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index] }}
                        ></div>
                        <span className="font-medium text-gray-300 capitalize">{item.name}</span>
                      </div>
                      <span className="text-gray-400 font-mono text-lg">{item.value}</span>
                    </div>
                  ))}
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-300">Total Problems:</span>
                      <span className="text-blue-400 font-bold text-xl">{totalSolved}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default DashboardPage;