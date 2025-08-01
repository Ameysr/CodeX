import React, { useState, useRef, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import * as nsfwjs from 'nsfwjs';

const RAZORPAY_KEY = 'rzp_test_nh2y4OogGF5UHN';

const PromotePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [nsfwModel, setNsfwModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const navigate = useNavigate();
  
  const [slotAvailability, setSlotAvailability] = useState({
    slots: [],
    availableCount: 0,
    isFullyOccupied: false,
    waitInfo: null,
    message: ''
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotLoading, setSlotLoading] = useState(true);

  const getSlotInfo = (slotNumber) => {
    switch(slotNumber) {
      case 1: return { 
        color: 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/30',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20',
        hoverColor: 'hover:bg-yellow-500/20',
        buttonGradient: 'from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600',
        price: '₹10,000',
        priority: '🏆 Premium - Top Position',
        description: 'Maximum visibility and clicks',
        duration: '1 Month Active'
      };
      case 2: return { 
        color: 'from-blue-500/10 to-blue-600/10 border-blue-500/30',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-900/20',
        hoverColor: 'hover:bg-blue-500/20',
        buttonGradient: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
        price: '₹3,000',
        priority: '🥈 Standard - Middle Position',
        description: 'Good visibility and engagement',
        duration: '1 Week Active'
      };
      case 3: return { 
        color: 'from-purple-500/10 to-purple-600/10 border-purple-500/30',
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-900/20',
        hoverColor: 'hover:bg-purple-500/20',
        buttonGradient: 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
        price: '₹1,500',
        priority: '🥉 Economy - Bottom Position',
        description: 'Standard visibility option',
        duration: '1 Day Active'
      };
      default: return { 
        color: 'from-gray-500/10 to-gray-600/10 border-gray-500/30',
        textColor: 'text-gray-400',
        bgColor: 'bg-gray-900/20',
        hoverColor: 'hover:bg-gray-500/20',
        buttonGradient: 'from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600',
        price: '₹0',
        priority: 'Available Slot',
        description: 'Promote your course here',
        duration: 'N/A'
      };
    }
  };

  useEffect(() => {
    const loadModel = async () => {
      setModelLoading(true);
      try {
        const model = await nsfwjs.load();
        setNsfwModel(model);
      } catch (err) {
        console.error('Failed to load NSFW model:', err);
        setError('Failed to load content moderation system');
      } finally {
        setModelLoading(false);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const fetchSlotAvailability = async () => {
      setSlotLoading(true);
      try {
        const response = await axiosClient.get('/userPromo/slots/availability');
        setSlotAvailability(response.data);
        
        // Automatically select the recommended slot
        const recommendedSlot = response.data.slots.find(s => s.isRecommended);
        if (recommendedSlot) {
          setSelectedSlot(recommendedSlot);
        }
      } catch (err) {
        console.error('Failed to fetch slot availability:', err);
        setError('Failed to load slot availability');
      } finally {
        setSlotLoading(false);
      }
    };
    
    fetchSlotAvailability();
  }, []);

  const checkImage = async (image) => {
    if (!nsfwModel) throw new Error('Model not loaded');

    if (image instanceof File) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const predictions = await nsfwModel.classify(img);
            resolve(predictions);
          } catch (err) {
            reject(err);
          } finally {
            URL.revokeObjectURL(img.src);
          }
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(image);
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    if (!nsfwModel) {
      setError('Content safety system not loaded yet');
      return;
    }

    try {
      const predictions = await checkImage(file);
      setModerationResult(predictions);
      
      const explicitClasses = ['Porn', 'Hentai', 'Sexy'];
      const isExplicit = predictions.some(pred =>
        explicitClasses.includes(pred.className) && pred.probability > 0.85
      );

      if (isExplicit) {
        setError('Selected image contains explicit content. Please choose another.');
        setImageFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Image classification failed:', err);
      setError('Failed to analyze image content');
      setModerationResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (slotAvailability.isFullyOccupied) {
      setError(`All slots are occupied. ${slotAvailability.waitInfo?.message || 'Please try again later.'}`);
      return;
    }
    
    if (!selectedSlot) {
      setError('Please select a promotion slot');
      return;
    }
    
    if (!imageFile) {
      setError('Please provide an image file');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('targetUrl', formData.targetUrl);
      formPayload.append('imageFile', imageFile);

      const response = await axiosClient.post('/userPromo/promo', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success && response.data.order) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const options = {
            key: RAZORPAY_KEY,
            amount: response.data.order.amount,
            currency: 'INR',
            name: 'Codex Promotion',
            description: `Promoting: ${formData.title} (Slot ${response.data.promo.slot})`,
            order_id: response.data.order.id,
            handler: async function(paymentResponse) {
              try {
                await axiosClient.post(`/userPromo/${response.data.promo._id}/verify`, {
                  order_id: paymentResponse.razorpay_order_id,
                  payment_id: paymentResponse.razorpay_payment_id,
                  signature: paymentResponse.razorpay_signature
                }, {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
                });
                
                const slotType = response.data.promo.slot === 1 ? 'Premium' : 
                                response.data.promo.slot === 2 ? 'Standard' : 'Economy';
                alert(`Payment successful! Your course is now promoted in Slot ${response.data.promo.slot} (${slotType}).`);
                navigate('/', { state: { promoSuccess: true, slot: response.data.promo.slot } });
              } catch (err) {
                console.error('Payment verification failed:', err);
                alert('Payment verification failed. Please contact support.');
              }
            },
            theme: { color: '#2563eb' },
            modal: {
              ondismiss: function() {
                alert('Payment was cancelled. You can try again later.');
              }
            },
            method: {
              netbanking: true,
              card: true,
              upi: true,
              wallet: true
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        };
        script.onerror = () => {
          setError('Failed to load payment processor');
          setLoading(false);
        };
        document.body.appendChild(script);
      }
    } catch (err) {
      if (err.response?.data?.waitInfo) {
        const waitInfo = err.response.data.waitInfo;
        setError(`${err.response.data.error}. ${waitInfo.message}`);
      } else {
        const errorMsg = err.response?.data?.error || err.message || 'Failed to create promotion';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (modelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading content safety system...</p>
        </div>
      </div>
    );
  }

  const SlotDisplay = () => {
    return (
      <div className="rounded-xl p-4 shadow-lg mb-4"
        style={{
          backgroundColor: "#131516",
          border: "0.1px solid oklch(1 0 0 / 0.3)",
        }}>
        <h3 className="text-sm font-semibold mb-3 text-gray-300">🎯 Slot Assignment</h3>
        
        {slotLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Checking slot availability...</p>
          </div>
        ) : slotAvailability.isFullyOccupied ? (
          <div className="text-center py-4">
            <div className="bg-red-900/30 rounded-full p-3 mx-auto w-12 h-12 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 font-medium mb-2">All Slots Occupied</p>
            {slotAvailability.waitInfo && (
              <div className="bg-red-900/20 rounded-lg p-3 mb-3 min-h-fit">
                <p className="text-sm text-red-300 mb-2">{slotAvailability.waitInfo.message}</p>
                <p className="text-xs text-red-400">
                  Next slot opens: {slotAvailability.waitInfo.formattedWaitTime}
                </p>
              </div>
            )}
            
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-400 mb-2">Current Occupancy:</p>
              {slotAvailability.slots.map(slot => {
                const slotInfo = getSlotInfo(slot.slot);
                return (
                  <div key={slot.slot} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center min-h-fit">
                    <div className="flex-1">
                      <span className="text-xs text-gray-300 block">
                        Slot {slot.slot} ({slot.slot === 1 ? 'Premium' : slot.slot === 2 ? 'Standard' : 'Economy'})
                      </span>
                      <span className="text-xs text-gray-500 block">{slotInfo.duration}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">₹{slot.price}</p>
                      {slot.daysRemaining && (
                        <p className="text-xs text-red-400">{slot.daysRemaining} days left</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {slotAvailability.slots.map(slot => {
                const slotInfo = getSlotInfo(slot.slot);
                const isAvailable = slot.status === 'available';
                const isRecommended = slot.isRecommended;
                const isSelected = selectedSlot?.slot === slot.slot;
                
                return (
                  <div 
                    key={slot.slot}
                    className={`rounded-lg p-4 transition-all duration-300 border-2 min-h-fit ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                        : isRecommended && isAvailable
                          ? 'border-green-500 cursor-pointer hover:border-green-400' 
                          : !isAvailable
                            ? 'border-red-600 opacity-50 cursor-not-allowed'
                            : 'border-gray-600 opacity-70 cursor-not-allowed'
                    } ${slotInfo.bgColor}`}
                    onClick={() => isRecommended && isAvailable && setSelectedSlot(slot)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${
                            isSelected ? 'text-blue-300' : 
                            isRecommended ? 'text-green-400' : slotInfo.textColor
                          }`}>
                            Slot {slot.slot}
                          </p>
                          <p className="text-lg font-bold my-1">{slotInfo.price}</p>
                        </div>
                        
                        {isRecommended && isAvailable && (
                          <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded shrink-0">
                            System Assigned
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <p className="text-xs text-gray-400">
                          {slot.slot === 1 && '🏆 Top position'}
                          {slot.slot === 2 && '🥈 Middle position'}
                          {slot.slot === 3 && '🥉 Bottom position'}
                        </p>
                        
                        <p className="text-xs text-gray-500 font-medium">
                          {slotInfo.duration}
                        </p>
                        
                        <p className={`text-xs ${
                          isAvailable ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isAvailable ? 'Available' : 'Occupied'}
                        </p>
                        
                        {isSelected && (
                          <div className="text-blue-400 text-xs font-bold">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-800/30 rounded-lg p-3 min-h-fit">
              <p className="mb-1">ℹ️ <strong>Priority Assignment:</strong></p>
              <p className="mb-1">• System automatically assigns the highest available slot</p>
              <p className="mb-1">• Priority: Slot 1 (1 Month) → Slot 2 (1 Week) → Slot 3 (1 Day)</p>
              <p className="text-green-400">
                {slotAvailability.availableCount > 0 
                  ? `✅ ${slotAvailability.availableCount} slot(s) available!` 
                  : '❌ No slots currently available'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.145 0 0)", color: "oklch(0.8 0 0)" }}>
      <style>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: #374151 transparent;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>

      <div style={{
        backgroundColor: "#131516",
        borderBottom: "0.1px solid oklch(1 0 0 / 0.3)",
      }} className="px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="text-3xl font-bold text-white hover:text-gray-300 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            CodeX
          </button>
          <div className="text-sm text-gray-400">
            Course Promotion Platform
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-60px)]">
        <div className="w-72 p-4 overflow-y-auto" style={{ 
          borderRight: "0.1px solid oklch(1 0 0 / 0.3)"
        }}>
          <div className="rounded-xl p-6 shadow-lg mb-4 min-h-fit"
            style={{
              backgroundColor: "#131516",
              border: "0.1px solid oklch(1 0 0 / 0.3)",
            }}>
            <h3 className="text-base font-semibold text-white mb-3">📋 Instructions</h3>
            <div className="text-sm text-gray-300 space-y-2">
              {/* Added new instruction at the top */}
              <p>• See your all engagement analysis in dashboard</p>
              <p>• Upload high-quality course images</p>
              <p>• Keep descriptions concise and engaging</p>
              <p>• Ensure all links are HTTPS secured</p>
              <p>• Images are automatically scanned for safety</p>
              <p>• Only 3 promotion slots available at a time</p>
              <p>• System assigns highest priority available slot</p>
              <p>• Slot 1: 1 Month Active (₹10,000)</p>
              <p>• Slot 2: 1 Week Active (₹3,000)</p>
              <p>• Slot 3: 1 Day Active (₹1,500)</p>
            </div>
          </div>

          {moderationResult && (
            <div className="rounded-xl p-6 shadow-lg min-h-fit"
              style={{
                backgroundColor: "#131516",
                border: "0.1px solid oklch(1 0 0 / 0.3)",
              }}>
              <h4 className="text-base font-semibold text-white mb-3">🛡️ Content Analysis</h4>
              <div className="space-y-3">
                {moderationResult.map((pred, index) => (
                  <div key={index} className="flex justify-between items-center hover:bg-gray-800/50 p-2 rounded transition-colors min-h-fit">
                    <span className="text-sm text-gray-400">{pred.className}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            pred.probability > 0.7 ? 'bg-red-500' :
                            pred.probability > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${pred.probability * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        pred.probability > 0.7 ? 'text-red-400' :
                        pred.probability > 0.4 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {(pred.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl p-6 shadow-lg min-h-fit" style={{
              backgroundColor: "#131516",
              border: "0.1px solid oklch(1 0 0 / 0.3)",
            }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Promote Your Course</h1>
                <p className="text-gray-400 text-base">Reach thousands of developers on our platform</p>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4 text-sm min-h-fit">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <SlotDisplay />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Course Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-700 rounded-lg text-white text-sm bg-gray-900 hover:border-gray-500 focus:border-white transition-all duration-300 min-h-fit"
                        placeholder="Advanced Algorithm Course"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-700 rounded-lg text-white text-sm bg-gray-900 hover:border-gray-500 focus:border-white transition-all duration-300 resize-none min-h-fit"
                        rows={4}
                        placeholder="Describe your course full stack / DSA ?? "
                        required
                        maxLength={500}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Course Link</label>
                      <input
                        type="url"
                        name="targetUrl"
                        value={formData.targetUrl}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-700 rounded-lg text-white text-sm bg-gray-900 hover:border-gray-500 focus:border-white transition-all duration-300 min-h-fit"
                        placeholder="https://yourcourse.com"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be a secure HTTPS link</p>
                    </div>
                    
                    <div className="rounded-xl p-4 shadow-lg min-h-fit" style={{
                      backgroundColor: "#131516",
                      border: "0.1px solid oklch(1 0 0 / 0.3)",
                    }}>
                      <h3 className="text-sm font-semibold mb-3 text-gray-300">Promotion Image</h3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="w-full text-xs text-gray-400
                          file:mr-2 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-xs file:font-semibold
                          file:bg-gray-700 file:text-white
                          hover:file:bg-gray-600 file:transition-all file:duration-300 cursor-pointer"
                        required={!previewUrl}
                      />
                      {previewUrl && (
                        <div className="mt-3">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => window.open(previewUrl, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || slotAvailability.isFullyOccupied || !selectedSlot}
                    className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg min-h-fit ${
                      slotAvailability.isFullyOccupied || !selectedSlot
                        ? 'bg-gray-800 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : slotAvailability.isFullyOccupied ? (
                      `All Slots Occupied ${slotAvailability.waitInfo ? `- Wait ${slotAvailability.waitInfo.formattedWaitTime}` : ''}`
                    ) : selectedSlot ? (
                      `Promote in Slot ${selectedSlot.slot} (₹${selectedSlot.price})`
                    ) : (
                      'Select a Slot'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotePage;