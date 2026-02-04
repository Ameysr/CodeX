import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser, clearError } from "../authSlice";

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(1, "Password is required")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    setValue
  } = useForm({ resolver: zodResolver(loginSchema) });

  // Demo login handler
  const handleDemoLogin = () => {
    setValue('emailId', 'amey@gmail.com');
    setValue('password', 'Amey@1234');
    // Trigger form submission after setting values
    setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 100);
  };

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data));
      if (loginUser.fulfilled.match(result)) {
        // Success - navigation will happen via useEffect
      } else if (loginUser.rejected.match(result)) {
        // Handle specific error types
        const errorMessage = result.payload?.message || 'Login failed';

        if (result.payload?.status === 401) {
          setFormError('password', {
            type: 'manual',
            message: 'Invalid email or password'
          });
        } else if (result.payload?.status === 404) {
          setFormError('emailId', {
            type: 'manual',
            message: 'No account found with this email'
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Format error message for display
  const getDisplayError = () => {
    if (!error) return null;

    if (error.includes('Network Error') || error.includes('ERR_CONNECTION_REFUSED')) {
      return 'Unable to connect to server. Please try again later.';
    }

    if (error.includes('401') || error.includes('Invalid credentials')) {
      return 'Invalid email or password';
    }

    return error;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0A0A0A" }}>
      <div
        className="card w-full max-w-md shadow-xl"
        style={{ backgroundColor: "#0A0A0A", border: "0.1px solid oklch(1 0 0 / 0.3)" }}
      >
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl mb-6 text-white">CodeX</h2>

          {(error || getDisplayError()) && (
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
              <span className="text-red-200">
                {getDisplayError() || error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Email</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input input-bordered w-full bg-gray-800 text-white border-gray-600 focus:border-blue-500 ${errors.emailId ? "border-red-500" : ""
                  }`}
                {...register("emailId")}
              />
              {errors.emailId && (
                <span className="text-red-400 text-sm mt-1">{errors.emailId.message}</span>
              )}
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text text-white">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 bg-gray-800 text-white border-gray-600 focus:border-blue-500 ${errors.password ? "border-red-500" : ""
                    }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-400 text-sm mt-1">{errors.password.message}</span>
              )}
            </div>

            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn w-full"
                disabled={loading}
                style={{ backgroundColor: '#4C99EF', border: 'none', color: 'white' }}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <div className="form-control mt-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="btn w-full"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                Demo Login
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm text-white">
              Don't have an account?{" "}
              <NavLink to="/signup" className="link link-primary">
                Sign Up
              </NavLink>
            </span>
            <div className="text-center mt-4">
              <NavLink to="/forgot-password" className="link link-primary">
                Forgot Password?
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export default Login;