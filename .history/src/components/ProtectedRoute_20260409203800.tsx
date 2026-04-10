import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: 'faculty' | 'student';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userFound, setUserFound] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        console.log('No user logged in');
        setIsAuthorized(false);
        setUserFound(true);
        navigate('/faculty/login');
        return;
      }

      console.log('User logged in:', user.uid);
      setUserFound(true);

      try {
        // First, check 'users' collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;
          console.log('User found in users collection with role:', userRole);

          if (userRole === requiredRole) {
            console.log('Authorized - role matches');
            setIsAuthorized(true);
          } else {
            console.log('Not authorized - role does not match');
            setIsAuthorized(false);
            navigate('/faculty/login');
          }
        } else {
          // User not in 'users' collection - check 'faculties' collection
          console.log('User not in users collection, checking faculties...');
          const facultyDoc = await getDoc(doc(db, 'faculties', user.uid));
          
          if (facultyDoc.exists() && requiredRole === 'faculty') {
            console.log('User found in faculties collection - authorized');
            setIsAuthorized(true);
          } else {
            console.log('User not found in any collection');
            setIsAuthorized(false);
            navigate('/faculty/login');
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAuthorized(false);
        navigate('/faculty/login');
      }
    });

    return () => unsubscribe();
  }, [requiredRole, navigate]);

  // Show loading while checking auth state
  if (!userFound) {
    return <div style={{ padding: '50px 20px', textAlign: 'center' }}>Checking access...</div>;
  }

  if (isAuthorized === null) {
    return <div style={{ padding: '50px 20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div style={{ padding: '50px 20px', textAlign: 'center' }}>Unauthorized access. Redirecting...</div>;
  }

  return <>{children}</>;
}
