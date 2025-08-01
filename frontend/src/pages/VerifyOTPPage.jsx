import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

function VerifyOTPPage() {
  const { state } = useLocation();
  const [email] = useState(state?.email || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const response = await axiosClient.post('/user/verify-otp', {
        emailId: email,
        otp
        });
        
        if (response.status === 200) {
        navigate('/reset-password', { state: { email } });
        }
    } catch (error) {
        // Handle error response properly
        if (error.response) {
        setMessage(error.response.data);
        } else {
        setMessage('OTP verification failed');
        }
    } finally {
        setIsLoading(false);
    }
    };

return (
  <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0A0A0A" }}>
    <div
      className="card w-full max-w-md shadow-xl"
      style={{ backgroundColor: "#0A0A0A", border: "0.1px solid oklch(1 0 0 / 0.3)" }}
    >
      <div className="card-body">
        <h2 className="card-title justify-center text-3xl mb-6 text-white">Verify OTP</h2>

        {message && (
          <div
            className="alert alert-error mb-4"
            style={{ backgroundColor: "#0A0A0A", border: "0.1px solid oklch(1 0 0 / 0.3)" }}
          >
            <span className="text-white">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text text-white">Email</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              readOnly
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text text-white">OTP</span>
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="input input-bordered w-full"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <div className="form-control mt-8">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

}

export default VerifyOTPPage;