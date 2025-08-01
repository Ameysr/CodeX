import { useState } from 'react';
import { Link, useNavigate } from 'react-router'; // Fixed import
import axiosClient from '../utils/axiosClient';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Added useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axiosClient.post('/user/forgot-password', {
        emailId: email
      });
      
      // Navigate to OTP verification with email state
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      // Handle error response properly
      if (error.response) {
        setMessage(error.response.data);
      } else {
        setMessage('Failed to send OTP');
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
        <h2 className="card-title justify-center text-3xl mb-6 text-white">Reset Password</h2>

        {message && (
          <div
            className="alert alert-info mb-4"
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
              placeholder="john@example.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="link link-primary">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  </div>
);

}

export default ForgotPasswordPage;