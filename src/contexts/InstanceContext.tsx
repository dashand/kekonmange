import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(window.location.origin);

export interface Instance {
  id: string;
  code: string;
  name: string;
  lastAccessedAt: string;
}

interface InstanceContextType {
  activeInstance: Instance | null;
  knownInstances: Instance[];
  loading: boolean;
  joinInstance: (code: string) => Promise<Instance>;
  createInstance: (name: string) => Promise<Instance>;
  switchInstance: (code: string) => void;
  removeInstance: (code: string) => void;
  updateInstanceName: (name: string) => Promise<void>;
}

const InstanceContext = createContext<InstanceContextType | null>(null);

export const useInstance = () => {
  const ctx = useContext(InstanceContext);
  if (!ctx) throw new Error("useInstance must be used within InstanceProvider");
  return ctx;
};

const STORAGE_KEY = "kekonmange_instances";
const ACTIVE_KEY = "kekonmange_active_instance";

function getStoredCodes(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function setStoredCodes(codes: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
}

function generateHexCode(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
}

export const InstanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeInstance, setActiveInstance] = useState<Instance | null>(null);
  const [knownInstances, setKnownInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  // Load known instances on mount
  useEffect(() => {
    const loadInstances = async () => {
      const codes = getStoredCodes();
      const instances: Instance[] = [];
      for (const code of codes) {
        try {
          const records = await pb.collection("instances").getFullList({ filter: `code = '${code}'` });
          if (records.length > 0) {
            const r = records[0];
            instances.push({ id: r.id, code: r.code, name: r.name, lastAccessedAt: r.lastAccessedAt });
          }
        } catch { /* instance may have been purged */ }
      }
      // Clean up codes that no longer exist
      setStoredCodes(instances.map(i => i.code));
      setKnownInstances(instances);

      // Restore active instance
      const activeCode = localStorage.getItem(ACTIVE_KEY);
      const active = instances.find(i => i.code === activeCode);
      if (active) {
        setActiveInstance(active);
        // Touch lastAccessedAt
        try {
          await pb.collection("instances").update(active.id, { lastAccessedAt: new Date().toISOString() });
        } catch {}
      }
      setLoading(false);
    };
    loadInstances();
  }, []);

  const joinInstance = useCallback(async (code: string): Promise<Instance> => {
    console.log("[Instance] joinInstance called with:", code);
    const normalized = code.toUpperCase().trim();
    const records = await pb.collection("instances").getFullList({ filter: `code = '${normalized}'` });
    if (records.length === 0) throw new Error("Instance introuvable");
    const r = records[0];
    const inst: Instance = { id: r.id, code: r.code, name: r.name, lastAccessedAt: r.lastAccessedAt };
    
    const codes = getStoredCodes();
    if (!codes.includes(normalized)) {
      codes.push(normalized);
      setStoredCodes(codes);
    }
    
    setKnownInstances(prev => prev.find(i => i.code === normalized) ? prev : [...prev, inst]);
    setActiveInstance(inst);
    localStorage.setItem(ACTIVE_KEY, normalized);
    console.log("[Instance] activeInstance set to:", inst);
    
    await pb.collection("instances").update(inst.id, { lastAccessedAt: new Date().toISOString() });
    return inst;
  }, []);

  const createInstance = useCallback(async (name: string): Promise<Instance> => {
    let code: string;
    let attempts = 0;
    while (true) {
      code = generateHexCode();
      const existing = await pb.collection("instances").getFullList({ filter: `code = '${code}'` });
      if (existing.length === 0) break;
      attempts++;
      if (attempts > 10) throw new Error("Impossible de générer un code unique");
    }
    
    const record = await pb.collection("instances").create({
      code,
      name,
      lastAccessedAt: new Date().toISOString(),
    });
    
    const inst: Instance = { id: record.id, code: record.code, name: record.name, lastAccessedAt: record.lastAccessedAt };
    
    const codes = getStoredCodes();
    codes.push(code);
    setStoredCodes(codes);
    
    setKnownInstances(prev => [...prev, inst]);
    setActiveInstance(inst);
    localStorage.setItem(ACTIVE_KEY, code);
    
    return inst;
  }, []);

  const switchInstance = useCallback((code: string) => {
    const inst = knownInstances.find(i => i.code === code);
    if (inst) {
      setActiveInstance(inst);
      localStorage.setItem(ACTIVE_KEY, code);
      pb.collection("instances").update(inst.id, { lastAccessedAt: new Date().toISOString() }).catch(() => {});
    }
  }, [knownInstances]);

  const removeInstance = useCallback((code: string) => {
    const codes = getStoredCodes().filter(c => c !== code);
    setStoredCodes(codes);
    setKnownInstances(prev => prev.filter(i => i.code !== code));
    if (activeInstance?.code === code) {
      setActiveInstance(null);
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeInstance]);

  const updateInstanceName = useCallback(async (name: string) => {
    if (!activeInstance) return;
    await pb.collection("instances").update(activeInstance.id, { name });
    const updated = { ...activeInstance, name };
    setActiveInstance(updated);
    setKnownInstances(prev => prev.map(i => i.code === updated.code ? updated : i));
  }, [activeInstance]);

  return (
    <InstanceContext.Provider value={{
      activeInstance, knownInstances, loading,
      joinInstance, createInstance, switchInstance, removeInstance, updateInstanceName
    }}>
      {children}
    </InstanceContext.Provider>
  );
};
