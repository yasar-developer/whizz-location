// "use"
// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";

// const IndexPage = () => {
//   const router = useRouter();

//   const validateToken = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         throw new Error("No token found in localStorage.");
//       }
  
//       const response = await axios.get('http://localhost:5000/api/auth/validate', {
//         headers: {
//           Authorization: `Bearer ${token}`, // Send token as a Bearer token
//         },
//       });
  
//       console.log(response.data); // Handle response
//     } catch (error:any) {
//       console.error("Authentication failed:", error.response?.data || error.message);
//     }
//   };

//   useEffect(() => {
//     validateToken();
//     const isAuthenticated = false; // Replace this with actual authentication logic

//     if (!isAuthenticated) {
//       router.push("/login");
//     } else {
//       router.push("/live_tracker");
//     }
//   }, [router]);

//   return null; // You can optionally show a loading spinner here
// };

// export default IndexPage;
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const IndexPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const validateToken = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(token)
      if (!token) {
        throw new Error("No token found in localStorage.");
      }

      const response = await axios.get('http://localhost:5000/api/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`, // Send token as a Bearer token
        },
      });

      console.log(response.data); // Handle successful response
      setIsAuthenticated(true); // Token is valid, so set authenticated to true
    } catch (error:any) {
      console.error("Authentication failed:", error.response?.data || error.message);
      setIsAuthenticated(false); // If error, set authenticated to false
    } finally {
      setLoading(false); // After validation, set loading to false
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/liveTracker"); // Redirect to /live_tracker if authenticated
      } else {
        router.push("/login"); // Redirect to /login if not authenticated
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // Optionally, show a loading spinner or message
  }

  return null; // Return null or empty since redirection happens on state change
};

export default IndexPage;
