import { useEffect, useState } from "react";
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

// Data lives at users/{uid}/entries/{YYYY-MM}, so it's private to the signed-in
// account and persists in Firestore indefinitely until explicitly deleted.
export function useEntries(uid) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "entries"), orderBy("month", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoaded(true);
      },
      () => setLoaded(true)
    );
    return unsub;
  }, [uid]);

  async function saveEntry(uidArg, entry) {
    await setDoc(doc(db, "users", uidArg, "entries", entry.month), entry);
  }

  async function deleteEntry(uidArg, month) {
    await deleteDoc(doc(db, "users", uidArg, "entries", month));
  }

  return { entries, loaded, saveEntry, deleteEntry };
}
