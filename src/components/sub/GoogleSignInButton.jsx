import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import GoogleIcon from '../../assets/images/search.png'; 


import React, { useRef, useState } from "react";

const GoogleSignInButton = ({ onLogin }) => {
  const { login } = useAuth();
  const signingInRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    // 🔒 HARD LOCK (prevents rate-limit)
    if (signingInRef.current) return;

    signingInRef.current = true;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const res = await axios.post(
        "https://db.store1920.com/wp-json/custom/v1/google-login",
        {
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          firebase_uid: firebaseUser.uid,
          photo_url: firebaseUser.photoURL,
        },
        {
          timeout: 8000, // ⏱️ IMPORTANT
        }
      );

      const userInfo = {
        id: res.data.id || res.data.user_id,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        token: res.data.token,
        image: firebaseUser.photoURL,
        firebaseUid: firebaseUser.uid,
      };

      localStorage.setItem("token", userInfo.token);
      localStorage.setItem("userId", userInfo.id);
      localStorage.setItem("email", userInfo.email);

      login(userInfo);
      onLogin?.(userInfo);

    } catch (err) {
      console.error("Google login failed:", err);
      alert("Login failed. Please try again.");
    } finally {
      signingInRef.current = false;
      setLoading(false);
    }
  };

  return (
    <button
      className="google-signin-btn"
      onClick={handleGoogleSignIn}
      disabled={loading}
      style={{ opacity: loading ? 0.6 : 1 }}
    >
      <img src={GoogleIcon} width={24} height={24} />
    </button>
  );
};


export default GoogleSignInButton;
