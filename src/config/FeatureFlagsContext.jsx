import { ADMIN_PASSWORD } from "./adminConfig";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "parakh-dashboard-feature-flags";

// Attendance and CRC Visit default OFF (as they were as static flags);
// Reports and Comparison default ON since they've always just been
// regular, always-visible tabs up to now — turning them off is new,
// opt-in behaviour, not a change to what anyone currently sees.
const DEFAULT_FLAGS = {
  attendance: false,
  crcVisit: false,
  reports: true,
  comparison: true,
  dataDownload: true,
};

// Soft admin gate. The password is set in src/config/adminConfig.js
// (edit ADMIN_PASSWORD there). Not real security — see that file.
const ADMIN_PIN = ADMIN_PASSWORD;

const FeatureFlagsContext = createContext({
  flags: DEFAULT_FLAGS,
  setFlag: () => {},
  isAdmin: false,
  unlockAdmin: () => false,
  lockAdmin: () => {},
});

export const FeatureFlagsProvider = ({ children }) => {
  const [flags, setFlags] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_FLAGS, ...JSON.parse(saved) } : DEFAULT_FLAGS;
    } catch {
      return DEFAULT_FLAGS;
    }
  });

  // Admin unlock is per-tab-session only (not persisted) — reopening the
  // dashboard later always starts locked again.
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch {
      // ignore — localStorage can be unavailable
    }
  }, [flags]);

  const value = useMemo(
    () => ({
      flags,
      setFlag: (key, val) => setFlags((prev) => ({ ...prev, [key]: val })),
      isAdmin,
      unlockAdmin: (pin) => {
        const ok = pin === ADMIN_PIN;
        if (ok) setIsAdmin(true);
        return ok;
      },
      lockAdmin: () => setIsAdmin(false),
    }),
    [flags, isAdmin]
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext);
