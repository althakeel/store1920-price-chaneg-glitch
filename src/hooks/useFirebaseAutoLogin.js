import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

/**
 * Restores Firebase session on refresh.
 * ❌ NEVER calls backend
 */
const useFirebaseAutoLogin = (onLogin) => {
  const handled = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {

      if (!firebaseUser) return;
      if (handled.current) return;

      handled.current = true;

      const userInfo = {
        id: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        token: localStorage.getItem("token") || "firebase-only",
        image: firebaseUser.photoURL,
        photoURL: firebaseUser.photoURL,
        firebaseUid: firebaseUser.uid,
      };

      onLogin?.(userInfo);

      console.log("Firebase session restored (no backend call)");
    });

    return () => unsubscribe();
  }, [onLogin]);
};

export default useFirebaseAutoLogin;
