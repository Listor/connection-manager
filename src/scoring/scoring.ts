import type { DecaySettings, EventDoc, Weights } from "../types/index";

export function decayFactor(ageDays: number, d: DecaySettings): number {
  if (d.mode === "off") return 1;
  if (ageDays <= d.decayStartDays) return 1;
  const x = ageDays - d.decayStartDays;
  if (d.mode === "exponential") return Math.pow(0.5, x / d.halfLifeDays);
  const span = 2 * d.halfLifeDays; // linear falloff
  return Math.max(0, 1 - x / span);
}

export function eventScore(
  events: EventDoc[],
  now: Date,
  decay: DecaySettings
): number {
  if (!events.length) return 0;
  const sum = events.reduce((acc, ev) => {
    const ageDays = Math.max(
      0,
      (now.getTime() - new Date(ev.timestamp).getTime()) / 86400000
    );
    const f = decayFactor(ageDays, decay);
    const pts01 = ev.points * 20; // 1..5 → 20..100
    const contribution = pts01 * f;

    // Debug logging
    console.log(
      `Event: ${ev.points} points, age: ${ageDays.toFixed(
        2
      )} days, decay: ${f.toFixed(3)}, contribution: ${contribution.toFixed(1)}`
    );

    return acc + contribution;
  }, 0);

  console.log(`Total event score: ${sum.toFixed(1)}`);
  // Use sum instead of average so more interactions = higher score
  // Don't cap here - let totalScore handle the capping
  return Math.max(0, sum);
}

export function totalScore(
  categoryValue: number,
  eScore: number,
  affinity: number,
  w: Weights
): number {
  const categoryContribution = w.categories * categoryValue;
  const eventContribution = w.events * eScore;
  const affinityContribution = w.affinity * affinity;
  const total = categoryContribution + eventContribution + affinityContribution;

  // Debug logging
  console.log(`Total score calculation:`);
  console.log(
    `  Category: ${categoryValue} × ${
      w.categories
    } = ${categoryContribution.toFixed(1)}`
  );
  console.log(
    `  Events: ${eScore.toFixed(1)} × ${w.events} = ${eventContribution.toFixed(
      1
    )}`
  );
  console.log(
    `  Affinity: ${affinity} × ${w.affinity} = ${affinityContribution.toFixed(
      1
    )}`
  );
  console.log(`  Total: ${total.toFixed(1)} → ${Math.round(total)}`);

  return Math.round(Math.max(0, Math.min(100, total)));
}
