// "use client";
// import { useEffect, useState } from "react";

// interface Location {
//   latitude: number | null;
//   longitude: number | null;
// }

// export default function Home() {
//   const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       const watchId = navigator.geolocation.watchPosition(
//         (position: GeolocationPosition) => {
//           setLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           });
//           setError(null); // Clear errors on successful update
//         },
//         (error: GeolocationPositionError) => {
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               setError("Permission denied. Please allow location access.");
//               break;
//             case error.POSITION_UNAVAILABLE:
//               setError("Location information is unavailable.");
//               break;
//             case error.TIMEOUT:
//               setError("The request to get user location timed out.");
//               break;
//             default:
//               setError("An unknown error occurred.");
//           }
//         },
//         { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
//       );

//       // Cleanup function to stop watching the position
//       return () => navigator.geolocation.clearWatch(watchId);
//     } else {
//       setError("Geolocation is not supported by your browser.");
//     }
//   }, []);

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h1>Live Location Tracker</h1>
//       {error ? (
//         <p style={{ color: "red" }}>{error}</p>
//       ) : location.latitude !== null && location.longitude !== null ? (
//         <div>
//           <p>Latitude: {location.latitude}</p>
//           <p>Longitude: {location.longitude}</p>
//         </div>
//       ) : (
//         <p>Fetching location...</p>
//       )}
//     </div>
//   );
// }
"use client";
import router from "next/router";
import { useEffect, useState } from "react";

interface Location {
  latitude: number | null;
  longitude: number | null;
}

export default function Home() {
  const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
  const [error, setError] = useState<string | null>(null);

  // Function to send location to backend
  const sendLocationToServer = async (latitude: number, longitude: number) => {
    try {
      console.log("working")
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User is not authenticated. Token missing.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/agent/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      console.log (response)

      if (!response.ok) {
        throw new Error("Failed to send location to server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error sending location to server.");
    }
  };

  useEffect(() => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        router.push('/login'); // Redirect if no token is found
      }
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setError(null); // Clear errors on successful update
          sendLocationToServer(latitude, longitude); // Send initial location to server
        },
        (error: GeolocationPositionError) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError("Permission denied. Please allow location access.");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setError("The request to get user location timed out.");
              break;
            default:
              setError("An unknown error occurred.");
          }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      // Update location every 5 minutes
      const intervalId = setInterval(() => {
        if (location.latitude !== null && location.longitude !== null) {
          sendLocationToServer(location.latitude, location.longitude);
        }
      // }, 5 * 60 * 1000); // 5 minutes in milliseconds
    }, 1000); 

      // Cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(intervalId);
      };
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, [location.latitude, location.longitude]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Live Location Tracker</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : location.latitude !== null && location.longitude !== null ? (
        <div>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
}
