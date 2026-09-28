"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { DEMO_ROLES, type RoleType } from "./demo-data";
import {
  explorerReducer,
  initialExplorer,
  parseExplorer,
  type ExplorerState,
  type NewExpense,
} from "./demo-explorer-state";
type Context = ExplorerState & {
  isLoaded: boolean;
  notice: string;
  roleInfo: (typeof DEMO_ROLES)[RoleType];
  switchRole: (role: RoleType) => void;
  resetDemoData: () => void;
  addExpense: (data: NewExpense) => void;
  approveExpenseManager: (id: string, notes: string) => void;
  verifyExpenseFinance: (id: string, ref: string, notes: string) => void;
  rejectExpense: (id: string, reason: string) => void;
  approveAdjustment: (id: string) => void;
  approveProcurementPR: (id: string) => void;
  payProcurementPO: (id: string) => void;
  toggleOperationItem: (id: string, index: number) => void;
};
const DemoContext = createContext<Context | null>(null);
const KEY = "alur_kendali_demo_state_v2";
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    explorerReducer,
    undefined,
    initialExplorer,
  );
  const [isLoaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(KEY) ??
        localStorage.getItem("alur_kendali_demo_state_v1");
      if (raw) {
        const parsed = parseExplorer(JSON.parse(raw));
        if (parsed) dispatch({ type: "load", value: parsed });
        else
          setNotice(
            "Data eksplorasi lama tidak sesuai. Data contoh awal digunakan kembali.",
          );
      }
    } catch {
      setNotice("Data lama tidak dapat dibaca. Data contoh awal digunakan.");
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      setNotice(
        "Penyimpanan browser tidak tersedia. Perubahan hanya berlaku pada sesi ini.",
      );
    }
  }, [state, isLoaded]);
  const metadata = () => ({
    uid: crypto.randomUUID(),
    at: new Date().toLocaleString("id-ID"),
  });
  return (
    <DemoContext.Provider
      value={{
        ...state,
        isLoaded,
        notice,
        roleInfo: DEMO_ROLES[state.currentRole],
        switchRole: (role) => dispatch({ type: "role", role }),
        resetDemoData: () => dispatch({ type: "reset" }),
        addExpense: (data) => dispatch({ type: "add", data, ...metadata() }),
        approveExpenseManager: (id, note) =>
          dispatch({ type: "approve", id, note, ...metadata() }),
        verifyExpenseFinance: (id, ref, note) =>
          dispatch({ type: "verify", id, ref, note, ...metadata() }),
        rejectExpense: (id, note) =>
          dispatch({ type: "reject", id, note, ...metadata() }),
        approveAdjustment: (id) =>
          dispatch({ type: "adjust", id, ...metadata() }),
        approveProcurementPR: (id) =>
          dispatch({ type: "order", id, ...metadata() }),
        payProcurementPO: (id) => dispatch({ type: "pay", id, ...metadata() }),
        toggleOperationItem: (id, index) =>
          dispatch({ type: "check", id, index, ...metadata() }),
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider diperlukan");
  return context;
}
