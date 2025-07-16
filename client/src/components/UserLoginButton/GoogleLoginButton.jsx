import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkGoogleReady = () => {
      if (window.google && window.google.accounts) {
        setIsGoogleReady(true);
      } else {
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            setIsGoogleReady(true);
          } else {
            setHasError(true);
          }
        }, 2000);
      }
    };

    checkGoogleReady();
  }, []);

  const handleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Decoded JWT:", decoded);

      const { name, email, picture } = decoded;

      if (!picture) {
        console.warn("⚠️ No picture in decoded token!");
      }

      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userImage", picture || "/Image/default-profile.png");

      navigate("/home", { state: { name } });
    } catch (err) {
      console.error("Login failed", err);
      setHasError(true);
    }
  };

  const handleLoginError = (error) => {
    console.log("Google Login Failed", error);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px", textAlign: "center" }}>
        <p style={{ color: "#6c757d", fontSize: "14px", margin: 0 }}>
          הכפתור של Google זמנית לא זמין
        </p>
      </div>
    );
  }

  if (!isGoogleReady) {
    return (
      <div style={{ marginTop: "20px", padding: "10px", textAlign: "center" }}>
        <p style={{ color: "#6c757d", fontSize: "14px", margin: 0 }}>
          טוען...
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        useOneTap={false}
        auto_select={false}
      />
    </div>
  );
};

export default GoogleLoginButton;