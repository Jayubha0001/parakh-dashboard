import { ADMIN_PASSWORD, DEFAULT_TAB_FLAGS } from "./adminConfig";
import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";

const STORAGE_KEY = "parakh-dashboard-feature-flags";

// Attendance and CRC Visit default OFF (as they were as static flags);
// Reports and Comparison default ON since they've always just been
// regular, always-visible tabs up to now — turning them off is new,
// opt-in behaviour, not a change to what anyone currently sees.
const DEFAULT_FLAGS = { ...DEFAULT_TAB_FLAGS };

// Soft admin gate. The password is set in src/config/adminConfig.js
// (edit ADMIN_PASSWORD there). Not real security — see that file.

const FeatureFlagsContext = createContext({
  flags: DEFAULT_FLAGS,
  setFlag: () => {},
  isAdmin: false,
  unlockAdmin: async () => false,
  lockAdmin: () => {},
});

const API = "/api/tab-flags";

export const FeatureFlagsProvider = ({ children }) => {
  const [flags, setFlags] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_FLAGS, ...JSON.parse(saved) } : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });
  // true once the shared (Vercel) store answered — then it is the source of truth for everyone.
  const [shared, setShared] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const pwRef = useRef("");

  useEffect(() => {
    fetch(API, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no api"))))
      .then((d) => {
        setShared(true);
        setFlags({ ...DEFAULT_FLAGS, ...(d.flags || {}) });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch {
      // ignore
    }
  }, [flags]);

  const post = (payload) =>
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(d.error || `Error ${r.status}`), { status: r.status });
      return d;
    });

  const value = useMemo(
    () => ({
      flags,
      shared,
      saveError,
      isAdmin,
      setFlag: (key, val) => {
        const next = { ...flags, [key]: val };
        setFlags(next);
        setSaveError("");
        if (shared) post({ password: pwRef.current, flags: next }).catch((e) => setSaveError(`Could not save for everyone: ${e.message}`));
      },
      unlockAdmin: async (pin) => {
        try {
          await post({ action: "verify", password: pin });
          pwRef.current = pin;
          setIsAdmin(true);
          return true;
        } catch (e) {
          // Server reachable but rejected the password -> wrong. No server (local dev) -> local password.
          if (e.status === 401) return false;
          if (!shared && pin === ADMIN_PASSWORD) {
            setIsAdmin(true);
            return true;
          }
          setSaveError(e.status ? e.message : "");
          return false;
        }
      },
      lockAdmin: () => {
        pwRef.current = "";
        setIsAdmin(false);
      },
    }),
    [flags, shared, saveError, isAdmin]
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext);
