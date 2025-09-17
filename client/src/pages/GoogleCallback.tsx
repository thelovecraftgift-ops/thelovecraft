// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const GoogleCallback = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = searchParams.get("token");
//     const userDataStr = searchParams.get("userData");

//     if (token && userDataStr) {
//       try {
//         const userData = JSON.parse(decodeURIComponent(userDataStr));

//         // Store token and user data in localStorage
//         localStorage.setItem("user_token", token);
//         localStorage.setItem("user", JSON.stringify(userData));

//         // Redirect to dashboard
//         navigate("/");
//       } catch (error) {
//         console.error("Error processing Google login:", error);
//         navigate("/login");
//       }
//     } else {
//       navigate("/login");
//     }
//   }, [navigate, searchParams]);

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <h2>Processing Google login...</h2>
//     </div>
//   );
// };

// export default GoogleCallback;


// src/pages/GoogleCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { useToast } from '@/hooks/use-toast';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithData } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = () => {
      try {
        // Get token and userData from URL parameters
        const token = searchParams.get('token');
        const userDataParam = searchParams.get('userData');

        console.log('Google callback - Token:', token);
        console.log('Google callback - UserData param:', userDataParam);

        if (token && userDataParam) {
          // Decode and parse user data
          const userData = JSON.parse(decodeURIComponent(userDataParam));
          console.log('Parsed user data:', userData);

          // Login with the received data
          loginWithData(userData, token);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.firstName}!`,
          });

          // Redirect based on user role
          if (userData.role === 'admin') {
            navigate('/');
          } else {
            navigate('/');
          }
        } else {
          throw new Error('Missing token or user data from Google OAuth');
        }
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        toast({
          title: "Login Failed",
          description: "There was an error processing your Google login.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [searchParams, loginWithData, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing your Google login...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
