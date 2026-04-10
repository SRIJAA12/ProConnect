// Faculty Login Page
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import './FacultyLogin.css';

function FacultyLogin() {
  // useNavigate: Hook to programmatically navigate to other pages
  const navigate = useNavigate();
  
  // useState: Hook to store and update data in the component
  // Syntax: const [variableName, functionToUpdateIt] = useState(initialValue);
  
  const [employeeId, setEmployeeId] = useState('');  // Stores employee ID input
  const [password, setPassword] = useState('');      // Stores password input
  const [error, setError] = useState('');            // Stores error messages
  const [loading, setLoading] = useState(false);     // Shows loading state during login
  const [showForgotPassword, setShowForgotPassword] = useState(false);  // Toggle forgot password modal
  const [resetEmail, setResetEmail] = useState('');  // Stores email for password reset
  const [resetMessage, setResetMessage] = useState('');  // Success message
  const [resetError, setResetError] = useState('');  // Reset error message

  // Function that runs when user clicks "Login" button
  const handleLogin = async (e: React.FormEvent) => {
    // Prevent the form from refreshing the page (default browser behavior)
    e.preventDefault();
    
    // Clear any previous errors
    setError('');
    
    // Validation: Check if fields are filled
    if (!employeeId || !password) {
      setError('Please fill in all fields');
      return;  // Stop here if validation fails
    }
    
    // Validation: Check if email ends with @psgitech.ac.in
    const email = employeeId.includes('@') ? employeeId : `${employeeId}@psgitech.ac.in`;
    
    if (!email.endsWith('@psgitech.ac.in')) {
      setError('Please use your PSGiTech email address');
      return;
    }
    
    // Start loading state
    setLoading(true);
    
    try {
      // Try to sign in with Firebase
      // This is an asynchronous operation (takes time), so we use 'await'
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('Login successful:', userCredential.user.uid);
      
      // Wait a moment to ensure Firestore has the data
      setTimeout(() => {
        console.log('Navigating to faculty dashboard');
        navigate('/faculty/dashboard');
      }, 500);
      
    } catch (err: any) {
      // If login fails, show error message
      console.error('Login error:', err);
      
      // Show user-friendly error messages based on error code
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      // Stop loading state (runs whether success or failure)
      setLoading(false);
    }
  };

  // Function to handle password reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    
    // Validation: Check if email is filled
    if (!resetEmail) {
      setResetError('Please enter your email');
      return;
    }
    
    // Format email with domain if not already present
    const email = resetEmail.includes('@') ? resetEmail : `${resetEmail}@psgitech.ac.in`;
    
    try {
      // Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox and spam folder.');
      setResetEmail('');
      
      // Close modal after 2 seconds
      setTimeout(() => setShowForgotPassword(false), 2000);
    } catch (err: any) {
      console.error('Reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setResetError('No account found with this email.');
      } else {
        setResetError('Error sending reset email. Please try again.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Faculty Login</h1>
          <p>PSGiTech Student Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          
          {/* Employee ID / Email Input */}
          <div className="form-group">
            <label htmlFor="employeeId" className="form-label">
              Email
            </label>
            <input
              type="text"
              id="employeeId"
              className="form-input"
              placeholder="e.g name@psgitech.ac.in"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Error Message (only shows if there's an error) */}
          {error && <div className="error-message">{error}</div>}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Forgot Password Link */}
          <button
            type="button"
            className="forgot-password-link"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>

          {/* Link to signup page */}
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/faculty/signup" className="link">
                Sign Up
              </Link>
            </p>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reset Password</h2>
              <p className="modal-subtitle">Enter your email to receive a password reset link</p>
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter your email or employee ID"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
                {resetError && <p className="reset-error-message">{resetError}</p>}
                {resetMessage && <p className="reset-success-message">{resetMessage}</p>}
                <button type="submit" className="btn-reset">
                  Send Reset Email
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyLogin;
