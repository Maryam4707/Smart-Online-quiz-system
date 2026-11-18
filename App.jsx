import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState(undefined); // undefined = still loading

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setProfile(undefined);
      setChecking(false);
    });
  }, []);

  // Listen to the user's profile (role) in Firestore.
  useEffect(() => {
    if (!user) return;
    let timer;
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        clearTimeout(timer);
        if (snap.exists()) setProfile(snap.data());
        else {
          // Profile may still be saving right after signup; fall back to student.
          timer = setTimeout(() => setProfile((p) => p ?? { role: "student", name: user.displayName || "" }), 1500);
        }
      },
      () => setProfile({ role: "student", name: user.displayName || "" })
    );
    return () => { clearTimeout(timer); unsub(); };
  }, [user]);

  if (checking) return null;
  if (!user) return <AuthPage />;
  if (!profile) return <div className="boot">Loading your dashboard…</div>;
  return <Dashboard user={user} profile={profile} />;
}
