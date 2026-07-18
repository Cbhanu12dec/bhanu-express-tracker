import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, ALLOWED_EMAIL } from "../firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && u.email !== ALLOWED_EMAIL) {
        // Someone else's account somehow signed in — kick them out immediately.
        await signOut(auth);
        setUser(null);
        setError("This app is locked to a single account. Access denied.");
      } else {
        setUser(u);
      }
      setChecking(false);
    });
    return unsub;
  }, []);

  async function login(email, password) {
    setError("");
    if (email.trim().toLowerCase() !== ALLOWED_EMAIL) {
      setError("This app is locked to a single account. Access denied.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError("Sign-in failed. Check your email and password.");
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, checking, error, login, logout };
}
