"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  freshScenario,
  freshScenarios,
  transition,
  validSavedScenarios,
  type ScenarioId,
  type ScenarioMap,
  type ScenarioAction,
} from "./demo-scenarios";
const KEY = "alur_kendali_guided_v1";
type Change =
  | { type: "load"; value: ScenarioMap }
  | { type: "reset"; id: ScenarioId }
  | { type: "action"; id: ScenarioId; action: ScenarioAction; at: string };
function reducer(state: ScenarioMap, change: Change): ScenarioMap {
  if (change.type === "load") return change.value;
  if (change.type === "reset")
    return { ...state, [change.id]: freshScenario(change.id) };
  return {
    ...state,
    [change.id]: transition(
      change.id,
      state[change.id],
      change.action,
      change.at,
    ),
  };
}
const GuidedContext = createContext<{
  states: ScenarioMap;
  loaded: boolean;
  notice: string;
  act: (id: ScenarioId, action: ScenarioAction) => void;
  reset: (id: ScenarioId) => void;
} | null>(null);
export function GuidedProvider({ children }: { children: ReactNode }) {
  const [states, dispatch] = useReducer(reducer, undefined, freshScenarios);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.version === 1 && validSavedScenarios(saved.states))
          dispatch({ type: "load", value: saved.states });
        else
          setNotice(
            "Progress lama tidak dapat dibaca. Skenario dimulai dari data contoh yang baru.",
          );
      }
    } catch {
      setNotice(
        "Progress sebelumnya tidak dapat dibaca. Anda tetap dapat mencoba demo pada sesi ini.",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, states }));
    } catch {
      setNotice(
        "Penyimpanan browser tidak tersedia. Perubahan hanya berlaku selama sesi ini.",
      );
    }
  }, [states, loaded]);
  return (
    <GuidedContext.Provider
      value={{
        states,
        loaded,
        notice,
        act: (id, action) => {
          if (loaded)
            dispatch({
              type: "action",
              id,
              action,
              at: new Date().toISOString(),
            });
        },
        reset: (id) => dispatch({ type: "reset", id }),
      }}
    >
      {children}
    </GuidedContext.Provider>
  );
}
export function useGuided() {
  const value = useContext(GuidedContext);
  if (!value) throw new Error("GuidedProvider diperlukan");
  return value;
}
