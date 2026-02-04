import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser, clearError } from '../authSlice';
import { toast } from 'react-hot-toast';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(password => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter"
    })
    .refine(password => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter"
    })
    .refine(password => /[0-9]/.test(password), {
      message: "Password must contain at least one number"
    })
    .refine(password => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
      message: "Password must contain at least one special character"
    })
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setError: setFormError
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onSubmit' // Changed from 'onChange' to prevent excessive re-renders
  });

  const password = watch('password', '');

  // Track password requirements in real-time
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  // Validate password as user types
  useEffect(() => {
    if (password.length > 0) {
      trigger('password');
    }
  }, [password, trigger]);

  // Clear errors on mount and redirect if authenticated  
  useEffect(() => {
    // Only clear errors on initial mount, and only if user is not already authenticated
    if (!isAuthenticated && !emailError && !errorMessage) {
      dispatch(clearError());
    }
  }, []); // Only run on mount

  // Handle authentication redirect separately
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Form submission handler - simplified to prevent page refresh
  const handleFormSubmit = async (data) => {
    console.log('🚀 handleFormSubmit called with data:', data);

    try {
      // Clear any existing errors
      setErrorMessage('');
      setEmailError('');

      console.log('Submitting registration data:', data);

      const result = await dispatch(registerUser(data)).unwrap();

      console.log('Registration successful:', result);
      toast.success("Account created successfully! Please check your email to verify your account.");

      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('❌ Signup error details:', error);

      // Handle specific error types
      if (error.message?.includes('email already exists') ||
        error.field === 'emailId' ||
        (error.message?.includes('duplicate') && error.message?.includes('email'))) {

        console.log('📧 Setting email field error');
        setEmailError('An account with this email already exists');

        // Also log to verify state update
        setTimeout(() => {
          console.log('Email error state after setting:', emailError);
        }, 100);

      } else if (error.type === 'validation') {
        console.log('✏️ Setting validation error');
        setErrorMessage(error.message);

      } else {
        console.log('⚠️ Setting general error');
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      }

      // Make sure we don't throw or cause navigation
      console.log('🛑 Error handled, staying on page');
    }
  };

  // Format error message for display
  const getDisplayError = () => {
    // Prioritize local error message first
    if (errorMessage) return errorMessage;

    if (!error) return null;

    if (error.includes('Network Error') || error.includes('ERR_CONNECTION_REFUSED')) {
      return 'Unable to connect to server. Please try again later.';
    }

    // Don't show duplicate email errors in general alert since they appear as field errors
    if (error.includes('email already exists') ||
      error.includes('duplicate') ||
      error.includes('emailId')) {
      return null;
    }

    return error;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="card w-full max-w-md shadow-xl" style={{ backgroundColor: "#0A0A0A", border: "0.1px solid oklch(1 0 0 / 0.3)" }}>
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl mb-6 text-white">CodeX</h2>

          {/* Unified error display */}
          {getDisplayError() && (
            <div
              className="alert alert-error mb-4"
              style={{ backgroundColor: "#1f2937", border: "1px solid #ef4444" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-200">{getDisplayError()}</span>
            </div>
          )}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
          >

            {/* First Name Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">First Name</span>
              </label>
              <input
                type="text"
                placeholder="John"
                className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <span className="text-error text-sm mt-1">{errors.firstName.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-white">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full ${(errors.emailId || emailError) ? 'input-error' : ''}`}
                {...register('emailId')}
              />
              {(errors.emailId || emailError) && (
                <span className="text-error text-sm mt-1">
                  {emailError || errors.emailId?.message}
                </span>
              )}

              {/* Debug: Show current error states */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1">
                  Debug - emailError: {emailError} | formError: {errors.emailId?.message}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-white">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', {
                    onFocus: () => setPasswordFocused(true),
                    onBlur: () => setPasswordFocused(password.length > 0)
                  })}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 btn btn-ghost btn-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password Requirements - Dropdown Panel */}
              {(passwordFocused || password.length > 0) && (
                <div
                  className={`
                  mt-3 p-3 rounded-lg transition-all duration-300 ease-in-out overflow-hidden
                  ${passwordFocused ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
                `}
                  style={{ backgroundColor: "#0A0A0A", border: "0.1px solid oklch(1 0 0 / 0.3)" }}
                >
                  <div className="flex">
                    {/* Reddit-style vertical line */}
                    <div className="w-1 bg-gray-300 rounded-full mr-3"></div>

                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2 text-white">Password must contain:</p>
                      <ul className="text-xs space-y-1">
                        <li className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-2">
                            <div className={`w-2 h-2 rounded-full ${passwordChecks.length ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <span className={passwordChecks.length ? 'text-green-500' : 'text-gray-500'}>
                            At least 8 characters
                          </span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-2">
                            <div className={`w-2 h-2 rounded-full ${passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <span className={passwordChecks.uppercase ? 'text-green-500' : 'text-gray-500'}>
                            At least one uppercase letter (A-Z)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-2">
                            <div className={`w-2 h-2 rounded-full ${passwordChecks.lowercase ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <span className={passwordChecks.lowercase ? 'text-green-500' : 'text-gray-500'}>
                            At least one lowercase letter (a-z)
                          </span>
                        </li>
                        <li className="flex items-center">
                          <div className="w-4 h-4 flex items-center justify-center mr-2">
                            <div className={`w-2 h-2 rounded-full ${passwordChecks.number ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <span className={passwordChecks.number ? 'text-green-500' : 'text-gray-500'}>
                            At least one number (0-9)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <span className="text-error text-sm mt-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn w-full"
                disabled={loading}
                style={{ backgroundColor: '#4C99EF', border: 'none', color: 'white' }}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Signing Up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="text-center mt-6">
            <span className="text-sm text-white">
              Already have an account?{' '}
              <NavLink to="/login" className="link link-primary">
                Login
              </NavLink>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Signup;