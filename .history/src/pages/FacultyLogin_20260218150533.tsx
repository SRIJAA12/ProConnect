// Faculty Login Page
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
      await signInWithEmailAndPassword(auth, email, password);
      
      // If successful, navigate to dashboard
      navigate('/faculty/dashboard');
      
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
              Employee ID or Email
            </label>
            <input
              type="text"
              id="employeeId"
              className="form-input"
              placeholder="e.g., FAC001 or name@psgitech.ac.in"
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
      </div>
    </div>
  );
}

export default FacultyLogin;
