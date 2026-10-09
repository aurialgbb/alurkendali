"use client";
import { m } from "motion/react";
import { useLocale } from "@/lib/locale";
import { roleLabels } from "@/lib/demo-scenarios";
import type { RoleType } from "@/lib/demo-data";

export const HANDOFF_MS = 1400;

/** Roles in the order they act, without consecutive repeats. */
export function castOf(roles: readonly RoleType[]) {
  return roles.filter(
    (role, index) => index === 0 || roles[index - 1] !== role,
  );
}

// Tells the visitor up front who they will play, then becomes the stage for the
// handoff: when work passes to the next person, a document travels along the line
// between their chips. That handoff is the product's point (no chat needed).
export default function CastStrip({
  roles,
  active,
  handoffTo,
  started,
  complete,
}: {
  roles: readonly RoleType[];
  active: RoleType;
  handoffTo: RoleType | null;
  started: boolean;
  complete: boolean;
}) {
  const { t: tr } = useLocale();
  const cast = castOf(roles);
  const activeIndex = cast.indexOf(handoffTo ?? active);
  return (
    <div className="cast-strip">
      <span className="cast-label">
        {tr(
          cast.length > 1
            ? `Anda akan memerankan ${cast.length} orang`
            : "Anda memerankan satu orang",
        )}
      </span>
      <ol>
        {cast.map((role, index) => {
          const done = complete || (started && index < activeIndex);
          const current = started && !complete && index === activeIndex;
          const receiving = handoffTo !== null && index === activeIndex;
          return (
            <li
              key={role}
              className={`${done ? "is-done" : ""} ${current ? "is-current" : ""}`}
            >
              {index > 0 && (
                <span className="cast-line" aria-hidden="true">
                  {receiving && (
                    <m.i
                      className="cast-document"
                      initial={{ left: "0%", opacity: 0 }}
                      animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                      transition={{
                        duration: HANDOFF_MS / 1000,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </span>
              )}
              <span className="cast-chip">
                <span className="cast-dot" aria-hidden="true">
                  {done ? "✓" : index + 1}
                </span>
                {tr(roleLabels[role])}
              </span>
            </li>
          );
        })}
      </ol>
      <span className="cast-time">{tr("Sekitar 1 menit")}</span>
    </div>
  );
}
