import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import GoogleIcon from "../../assets/images/search.png";

/**
 * 🔒 GLOBAL LOCK
 * Prevents duplicate login attempts across the entire app
 */
let GOOGLE_LOGIN_IN_PROGRESS = false;

const GoogleSignInButton = ({ onLogin }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (GOOGLE_LOGIN_IN_PROGRESS) return;

    GOOGLE_LOGIN_IN_PROGRESS = true;
    setLoading(true);

    try {
      // 1️⃣ Firebase popup login
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2️⃣ ONE backend sync (never again)
      const res = await axios.post(
        "https://db.store1920.com/wp-json/custom/v1/google-login",
        {
          email: user.email,
          name: user.displayName || user.email.split("@")[0],
          firebase_uid: user.uid,
          photo_url: user.photoURL,
        },
        { timeout: 10000 }
      );

      const userInfo = {
        id: res.data.id || user.uid,
        name: user.displayName,
        email: user.email,
        token: res.data.token || "firebase-only",
        image: user.photoURL,
        photoURL: user.photoURL,
        firebaseUid: user.uid,
      };

      // 3️⃣ Persist session
      localStorage.setItem("token", userInfo.token);
      localStorage.setItem("userId", userInfo.id);
      localStorage.setItem("email", userInfo.email);

      // 4️⃣ Update app state
      login(userInfo);
      onLogin?.(userInfo);

    } catch (err) {
      if (err?.response?.status === 429) {
        alert("Please wait a few seconds and try again.");
      } else {
        console.error("Google login failed:", err);
        alert("Login failed. Please try again.");
      }
    } finally {
      // ⏱️ Delay unlock to match backend protection
      setTimeout(() => {
        GOOGLE_LOGIN_IN_PROGRESS = false;
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <button
      type="button"
      className="google-signin-btn"
      onClick={handleGoogleSignIn}
      disabled={loading}
      style={{
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      <img src={GoogleIcon} alt="Google Sign In" width={24} height={24} />
    </button>
  );
};

export default GoogleSignInButton;

