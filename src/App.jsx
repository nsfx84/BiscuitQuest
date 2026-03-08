import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import * as Tone from "tone";

// ─── MUSIC SYSTEM ──────────────────────────────────

function useMusic() {
  const startedRef = useRef(false);
  const partsRef = useRef({});
  const synthsRef = useRef({});
  const modeRef = useRef("home_day");
  const mutedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  const init = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
    await Tone.start();
    Tone.getTransport().bpm.value = 68;

    const reverb = new Tone.Reverb({ decay: 6, wet: 0.5 }).toDestination();
    const delay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.2, wet: 0.15 }).connect(reverb);
    const bigReverb = new Tone.Reverb({ decay: 10, wet: 0.7 }).toDestination();

    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 },
      volume: -22,
    }).connect(reverb);

    const melody = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.3, decay: 0.8, sustain: 0.3, release: 2 },
      volume: -20,
    }).connect(delay);

    const bass = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.5, decay: 0.5, sustain: 0.7, release: 2 },
      volume: -26,
    }).connect(reverb);

    const sparkle = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.1, decay: 1.5, sustain: 0, release: 1.5 },
      volume: -28,
    }).connect(delay);

    // Night uses extra dreamy synth
    const dreamPad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 3, decay: 2, sustain: 0.6, release: 5 },
      volume: -25,
    }).connect(bigReverb);

    synthsRef.current = { pad, melody, bass, sparkle, dreamPad };

    const mk = (fn, notes, div) => new Tone.Sequence((time, n) => { if (!mutedRef.current && n) fn(time, n); }, notes, div);

    // ═══════════════════════════════════════
    // DAWN — Gentle awakening, soft rising notes, peaceful
    // Chords: Ebmaj7 → Cm7 → Abmaj7 → Bb (warm, hopeful)
    // ═══════════════════════════════════════
    const dawnPad = mk((t, c) => pad.triggerAttackRelease(c, "1n", t), [
      ["Eb4", "G4", "Bb4", "D5"],
      ["C4", "Eb4", "G4", "Bb4"],
      ["Ab3", "C4", "Eb4", "G4"],
      ["Bb3", "D4", "F4", "Ab4"],
    ], "1n");
    const dawnMelody = mk((t, n) => melody.triggerAttackRelease(n, "4n.", t), [
      "G5", null, null, null, "Bb5", null, null, null,
      null, null, "Eb5", null, null, null, null, null,
      "C5", null, null, null, null, null, "D5", null,
      null, null, null, null, "Eb5", null, null, null,
    ], "8n");
    const dawnBass = mk((t, n) => bass.triggerAttackRelease(n, "1n", t), [
      "Eb3", null, "C3", null, "Ab2", null, "Bb2", null,
    ], "2n");
    const dawnSparkle = mk((t, n) => sparkle.triggerAttackRelease(n, "8n", t), [
      null, null, null, null, null, null, null, "G6",
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, "Eb6", null, null,
      null, null, null, null, null, null, null, null,
    ], "8n");

    // ═══════════════════════════════════════
    // DAY — Bright, adventurous, upbeat, cheerful
    // Chords: C → G → Am → F (classic bright progression)
    // ═══════════════════════════════════════
    const dayPad = mk((t, c) => pad.triggerAttackRelease(c, "2n", t), [
      ["C4", "E4", "G4", "B4"],
      ["G3", "B3", "D4", "F#4"],
      ["A3", "C4", "E4", "G4"],
      ["F3", "A3", "C4", "E4"],
    ], "1n");
    const dayMelody = mk((t, n) => melody.triggerAttackRelease(n, "4n", t), [
      "E5", null, "G5", null, "C6", null, "B5", null,
      "A5", null, "G5", null, "E5", null, "D5", null,
      "C5", null, "E5", null, "A5", null, "G5", null,
      "F5", null, "A5", null, "G5", null, null, null,
    ], "8n");
    const dayBass = mk((t, n) => bass.triggerAttackRelease(n, "2n", t), [
      "C3", "C3", "G2", "G2", "A2", "A2", "F2", "F2",
    ], "2n");
    const daySparkle = mk((t, n) => sparkle.triggerAttackRelease(n, "16n", t), [
      null, null, "E6", null, null, null, null, null,
      null, null, null, null, "G6", null, null, null,
      null, null, null, "C6", null, null, null, null,
      null, null, null, null, null, null, "A5", null,
    ], "8n");

    // ═══════════════════════════════════════
    // DUSK — Golden, warm, slightly wistful, winding down
    // Chords: Dm9 → Bbmaj7 → Gm7 → A7 (warm minor feel)
    // ═══════════════════════════════════════
    const duskPad = mk((t, c) => pad.triggerAttackRelease(c, "1n", t), [
      ["D4", "F4", "A4", "E5"],
      ["Bb3", "D4", "F4", "A4"],
      ["G3", "Bb3", "D4", "F4"],
      ["A3", "C#4", "E4", "G4"],
    ], "1n");
    const duskMelody = mk((t, n) => melody.triggerAttackRelease(n, "4n.", t), [
      "A5", null, null, "F5", null, null, null, null,
      "D5", null, null, null, null, "E5", null, null,
      "F5", null, null, null, "D5", null, null, null,
      null, null, "C5", null, null, null, null, null,
    ], "8n");
    const duskBass = mk((t, n) => bass.triggerAttackRelease(n, "1n", t), [
      "D3", null, "Bb2", null, "G2", null, "A2", null,
    ], "2n");
    const duskSparkle = mk((t, n) => sparkle.triggerAttackRelease(n, "8n", t), [
      null, null, null, null, null, "D6", null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, "A5",
      null, null, null, null, null, null, null, null,
    ], "8n");

    // ═══════════════════════════════════════
    // NIGHT — Mysterious, spacious, dreamy, sparse
    // Chords: Em9 → Cmaj7 → Bm7 → Am9 (ethereal)
    // ═══════════════════════════════════════
    const nightPad = mk((t, c) => dreamPad.triggerAttackRelease(c, "1n.", t), [
      ["E3", "G3", "B3", "F#4"],
      ["C3", "E3", "G3", "B3"],
      ["B2", "D3", "F#3", "A3"],
      ["A2", "C3", "E3", "B3"],
    ], "1n.");
    const nightMelody = mk((t, n) => melody.triggerAttackRelease(n, "2n", t), [
      null, null, null, null, "B5", null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, "E5", null,
      null, null, null, null, null, null, null, null,
      null, null, "G5", null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ], "8n");
    const nightBass = mk((t, n) => bass.triggerAttackRelease(n, "1n.", t), [
      "E2", null, null, "C2", null, null, "B2", null, null, "A2", null, null,
    ], "2n");
    const nightSparkle = mk((t, n) => sparkle.triggerAttackRelease(n, "16n", t), [
      null, null, null, null, null, null, null, null,
      null, null, null, "F#6", null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, "B5", null,
      null, null, null, null, null, null, null, null,
    ], "8n");

    // ═══════════════════════════════════════
    // EXPLORING variations use same time-of-day feel but different chords
    // ═══════════════════════════════════════
    const exploreDawnPad = mk((t, c) => pad.triggerAttackRelease(c, "2n", t), [
      ["F4", "A4", "C5", "E5"],
      ["Db4", "F4", "Ab4", "C5"],
      ["Bb3", "D4", "F4", "A4"],
      ["C4", "E4", "G4", "B4"],
    ], "1n");
    const exploreDawnMelody = mk((t, n) => melody.triggerAttackRelease(n, "4n", t), [
      "C5", null, null, "E5", null, null, "A5", null,
      null, null, "F5", null, null, null, null, null,
      "D5", null, null, null, "F5", null, null, null,
      null, null, "G5", null, null, null, null, null,
    ], "8n");

    const exploreDayPad = mk((t, c) => pad.triggerAttackRelease(c, "2n", t), [
      ["D4", "F#4", "A4", "C#5"],
      ["G3", "B3", "D4", "F#4"],
      ["E3", "G3", "B3", "D4"],
      ["A3", "C#4", "E4", "G4"],
    ], "1n");
    const exploreDayMelody = mk((t, n) => melody.triggerAttackRelease(n, "4n", t), [
      "F#5", null, "A5", null, "D6", null, "C#6", null,
      "B5", null, "A5", null, "F#5", null, "E5", null,
      "D5", null, "F#5", null, "B5", null, "A5", null,
      "G5", null, "B5", null, "A5", null, null, null,
    ], "8n");

    const exploreDuskPad = mk((t, c) => pad.triggerAttackRelease(c, "2n", t), [
      ["E3", "G3", "B3", "D4"],
      ["C3", "Eb3", "G3", "Bb3"],
      ["Ab2", "C3", "Eb3", "G3"],
      ["Bb2", "D3", "F3", "A3"],
    ], "1n");
    const exploreDuskMelody = mk((t, n) => melody.triggerAttackRelease(n, "4n.", t), [
      "G5", null, null, "Eb5", null, null, null, null,
      null, "D5", null, null, null, null, "Bb4", null,
      null, null, "C5", null, null, null, null, null,
      null, null, null, null, "D5", null, null, null,
    ], "8n");

    const exploreNightPad = mk((t, c) => dreamPad.triggerAttackRelease(c, "1n.", t), [
      ["F#3", "A3", "C#4", "E4"],
      ["D3", "F#3", "A3", "C#4"],
      ["B2", "D3", "F#3", "A3"],
      ["E3", "G#3", "B3", "D4"],
    ], "1n.");
    const exploreNightMelody = mk((t, n) => melody.triggerAttackRelease(n, "2n", t), [
      null, null, null, null, "C#5", null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, "A5", null, null, null, null, null,
      null, null, null, null, null, null, null, null,
    ], "8n");

    // ═══════════════════════════════════════
    // BATTLE — Same for all times (urgent overrides ambiance)
    // ═══════════════════════════════════════
    const battlePad = mk((t, c) => pad.triggerAttackRelease(c, "4n", t), [
      ["A3", "C4", "E4"],
      ["E3", "G3", "B3"],
      ["D3", "F3", "A3"],
      ["E3", "G#3", "B3"],
    ], "2n");
    const battleMelody = mk((t, n) => melody.triggerAttackRelease(n, "8n", t), [
      "A4", null, "C5", "A4", null, "E5", null, "D5",
      "E5", null, "G5", null, "E5", null, "B4", null,
      "D5", null, "F5", "D5", null, "A5", null, null,
      "G#4", null, "B4", null, "E5", null, null, null,
    ], "8n");
    const battleBass = mk((t, n) => bass.triggerAttackRelease(n, "4n", t), [
      "A2", null, "A2", null, "E2", null, "E2", null,
      "D2", null, "D2", null, "E2", null, "E2", null,
    ], "4n");

    const sharedBass = (phase) => {
      if (phase === "dawn") return mk((t, n) => bass.triggerAttackRelease(n, "1n", t), ["F2", null, "Db2", null, "Bb2", null, "C2", null], "2n");
      if (phase === "dusk") return mk((t, n) => bass.triggerAttackRelease(n, "1n", t), ["E2", null, "C2", null, "Ab2", null, "Bb2", null], "2n");
      if (phase === "night") return mk((t, n) => bass.triggerAttackRelease(n, "1n.", t), ["F#2", null, null, "D2", null, null, "B2", null, null, "E2", null, null], "2n");
      return mk((t, n) => bass.triggerAttackRelease(n, "2n", t), ["D3", "D3", "G2", "G2", "E2", "E2", "A2", "A2"], "2n");
    };

    partsRef.current = {
      home_dawn: [dawnPad, dawnMelody, dawnBass, dawnSparkle],
      home_day: [dayPad, dayMelody, dayBass, daySparkle],
      home_dusk: [duskPad, duskMelody, duskBass, duskSparkle],
      home_night: [nightPad, nightMelody, nightBass, nightSparkle],
      exploring_dawn: [exploreDawnPad, exploreDawnMelody, sharedBass("dawn")],
      exploring_day: [exploreDayPad, exploreDayMelody, sharedBass("day")],
      exploring_dusk: [exploreDuskPad, exploreDuskMelody, sharedBass("dusk")],
      exploring_night: [exploreNightPad, exploreNightMelody, sharedBass("night")],
      battle: [battlePad, battleMelody, battleBass],
    };

    // Start transport then start initial sequences
    const hour = new Date().getHours();
    const phase = hour >= 5 && hour < 7 ? "dawn" : hour >= 7 && hour < 17 ? "day" : hour >= 17 && hour < 19 ? "dusk" : "night";
    const startKey = `home_${phase}`;
    modeRef.current = startKey;
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    if (partsRef.current[startKey]) partsRef.current[startKey].forEach(p => p.start(0));
    Tone.getTransport().start();
    } catch(e) { console.warn("Music init failed:", e); }
  }, []);

  const setMode = useCallback((mode, timePhase) => {
    if (!startedRef.current) return;
    const modeKey = mode === "battle" ? "battle" : `${mode}_${timePhase || "day"}`;
    if (modeKey === modeRef.current) return;
    try {
      // Stop transport, cancel everything, restart fresh
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      Tone.getTransport().position = 0;
      // Stop all sequences
      Object.values(partsRef.current).forEach(parts => parts.forEach(p => { try { p.stop(0); } catch(e) {} }));
      modeRef.current = modeKey;
      const next = partsRef.current[modeKey];
      if (next) next.forEach(p => { try { p.start(0); } catch(e) {} });
      Tone.getTransport().start();
    } catch(e) { /* ignore */ }
  }, []);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    if (mutedRef.current) {
      Tone.getDestination().volume.value = -Infinity;
    } else {
      Tone.getDestination().volume.value = 0;
    }
  }, []);

  return { init, setMode, toggleMute, muted };
}

// ─── DAY/NIGHT SYSTEM ──────────────────────────────

function useTimeOfDay() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000); // update every 30s
    return () => clearInterval(id);
  }, []);
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeFloat = hour + minute / 60; // e.g. 14.5 = 2:30 PM
  // Phases: dawn 5-7, day 7-17, dusk 17-19, night 19-5
  let phase, progress;
  if (timeFloat >= 5 && timeFloat < 7) { phase = "dawn"; progress = (timeFloat - 5) / 2; }
  else if (timeFloat >= 7 && timeFloat < 17) { phase = "day"; progress = (timeFloat - 7) / 10; }
  else if (timeFloat >= 17 && timeFloat < 19) { phase = "dusk"; progress = (timeFloat - 17) / 2; }
  else { phase = "night"; progress = timeFloat >= 19 ? (timeFloat - 19) / 10 : (timeFloat + 5) / 10; }
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { phase, progress, hour, timeFloat, timeStr };
}

function getTimeColors(phase, progress) {
  const themes = {
    dawn: {
      sky: [`linear-gradient(180deg, #1a1a3e 0%, #ff7e5f ${30 + progress * 40}%, #feb47b 100%)`, `linear-gradient(180deg, #4a90d9 0%, #ffb347 40%, #ff6f61 100%)`],
      ground: "#3a5f3a",
      headerBg: [`linear-gradient(135deg, #ff9a76, #ffc2a0, #ffdb99)`, `linear-gradient(135deg, #ffb347, #ff6f61, #ff9a76)`],
      headerText: "#4E342E",
    },
    day: {
      sky: [`linear-gradient(180deg, #56CCF2 0%, #87CEEB 40%, #B0E0E6 80%, #98D8C8 100%)`, `linear-gradient(180deg, #2980B9 0%, #56CCF2 40%, #87CEEB 100%)`],
      ground: "#4a7a3a",
      headerBg: [`linear-gradient(135deg, #FF8A65, #FFB74D, #FFD54F)`, `linear-gradient(135deg, #FFB74D, #FF8A65, #FFD54F)`],
      headerText: "#4E342E",
    },
    dusk: {
      sky: [`linear-gradient(180deg, #2c3e50 0%, #e74c3c ${40 + progress * 30}%, #f39c12 100%)`, `linear-gradient(180deg, #1a1a3e 0%, #6c3483 40%, #e74c3c 80%, #f39c12 100%)`],
      ground: "#2d4a2d",
      headerBg: [`linear-gradient(135deg, #e74c3c, #f39c12, #9b59b6)`, `linear-gradient(135deg, #6c3483, #e74c3c, #2c3e50)`],
      headerText: "#FFF8E1",
    },
    night: {
      sky: [`linear-gradient(180deg, #0a0a2e 0%, #16213e 40%, #1a1a3e 100%)`, `linear-gradient(180deg, #050520 0%, #0a0a2e 40%, #1a1a3e 100%)`],
      ground: "#1a2e1a",
      headerBg: [`linear-gradient(135deg, #1a237e, #283593, #3949ab)`, `linear-gradient(135deg, #0d1b2a, #1b2838, #1a237e)`],
      headerText: "#E8EAF6",
    },
  };
  const t = themes[phase];
  const idx = progress < 0.5 ? 0 : 1;
  return { sky: t.sky[idx], ground: t.ground, headerBg: t.headerBg[idx], headerText: t.headerText, phase };
}

function SkyBackground({ phase, progress }) {
  const isNight = phase === "night";
  const isDusk = phase === "dusk";
  const isDawn = phase === "dawn";
  const isDay = phase === "day";

  // Sun position: rises dawn, arcs during day, sets at dusk
  const sunVisible = phase !== "night";
  let sunY, sunX;
  if (isDawn) { sunY = 85 - progress * 35; sunX = 15 + progress * 15; }
  else if (isDay) { sunY = 50 - Math.sin(progress * Math.PI) * 40; sunX = 30 + progress * 40; }
  else if (isDusk) { sunY = 50 + progress * 40; sunX = 70 + progress * 15; }
  else { sunY = 120; sunX = 50; }

  // Moon opposite
  const moonVisible = phase === "night" || (isDusk && progress > 0.5) || (isDawn && progress < 0.3);
  let moonY = isNight ? 25 - Math.sin(progress * Math.PI) * 15 : isDusk ? 60 - progress * 30 : 55;
  let moonX = isNight ? 20 + progress * 50 : 75;

  // Stars count
  const starCount = isNight ? 25 : isDusk ? Math.floor(progress * 15) : isDawn ? Math.floor((1 - progress) * 10) : 0;

  const stars = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      x: 5 + ((i * 37) % 90),
      y: 3 + ((i * 23) % 50),
      size: 1 + (i % 3),
      delay: (i * 0.4) % 3,
    }));
  }, []);

  // Cloud positions
  const clouds = useMemo(() => [
    { x: 10, y: 20, w: 80, h: 30, speed: 45 },
    { x: 55, y: 12, w: 60, h: 24, speed: 60 },
    { x: 30, y: 35, w: 70, h: 26, speed: 75 },
    { x: 75, y: 25, w: 55, h: 22, speed: 90 },
  ], []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <style>{`
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes cloudDrift { 0% { transform: translateX(-120px); } 100% { transform: translateX(calc(100vw + 120px)); } }
        @keyframes sunGlow { 0%, 100% { box-shadow: 0 0 40px 15px rgba(255,200,50,0.3); } 50% { box-shadow: 0 0 60px 25px rgba(255,200,50,0.5); } }
        @keyframes moonGlow { 0%, 100% { box-shadow: 0 0 20px 8px rgba(200,210,255,0.2); } 50% { box-shadow: 0 0 35px 15px rgba(200,210,255,0.35); } }
        @keyframes shootingStar { 0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; } 100% { transform: translateX(150px) translateY(150px) rotate(-45deg); opacity: 0; } }
      `}</style>

      {/* Stars */}
      {stars.slice(0, starCount).map((s, i) => (
        <div key={`s${i}`} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "white",
          animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}

      {/* Shooting star at night */}
      {isNight && progress > 0.3 && progress < 0.7 && (
        <div style={{
          position: "absolute", left: "20%", top: "15%",
          width: 2, height: 2, background: "white", borderRadius: "50%",
          boxShadow: "-20px 0 10px 1px rgba(255,255,255,0.5)",
          animation: "shootingStar 2s ease-in infinite",
          animationDelay: "3s",
        }} />
      )}

      {/* Sun */}
      {sunVisible && (
        <div style={{
          position: "absolute", left: `${sunX}%`, top: `${sunY}%`,
          width: 50, height: 50, borderRadius: "50%",
          background: isDusk ? "linear-gradient(135deg, #ff6b35, #ff4500)" : "linear-gradient(135deg, #FFD700, #FFA500)",
          animation: "sunGlow 4s ease-in-out infinite",
          transition: "left 30s linear, top 30s linear",
          opacity: isDusk ? 1 - progress * 0.6 : isDawn ? 0.5 + progress * 0.5 : 1,
        }} />
      )}

      {/* Moon */}
      {moonVisible && (
        <div style={{
          position: "absolute", left: `${moonX}%`, top: `${moonY}%`,
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #E8EAF6, #C5CAE9)",
          animation: "moonGlow 5s ease-in-out infinite",
          transition: "left 30s linear, top 30s linear",
          boxShadow: "inset -6px -2px 0 0 #0a0a2e",
        }} />
      )}

      {/* Clouds */}
      {(isDay || isDawn || isDusk) && clouds.map((c, i) => (
        <div key={`c${i}`} style={{
          position: "absolute", top: `${c.y}%`,
          width: c.w, height: c.h,
          borderRadius: "50%",
          background: isDay ? "rgba(255,255,255,0.4)" : isDusk ? "rgba(120,60,80,0.3)" : "rgba(255,200,150,0.3)",
          animation: `cloudDrift ${c.speed}s linear infinite`,
          animationDelay: `${-i * 18}s`,
          filter: "blur(2px)",
        }} />
      ))}

      {/* Night clouds (darker) */}
      {isNight && clouds.slice(0, 2).map((c, i) => (
        <div key={`nc${i}`} style={{
          position: "absolute", top: `${c.y + 5}%`,
          width: c.w, height: c.h,
          borderRadius: "50%",
          background: "rgba(20,20,60,0.5)",
          animation: `cloudDrift ${c.speed + 30}s linear infinite`,
          animationDelay: `${-i * 25}s`,
          filter: "blur(3px)",
        }} />
      ))}

      {/* Ground / hills */}
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "120px" }} viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,80 Q150,20 300,60 Q450,100 600,50 Q750,0 900,40 Q1050,80 1200,30 L1200,120 L0,120Z"
          fill={isNight ? "#0d1a0d" : isDusk ? "#2a4a2a" : isDawn ? "#3a5a3a" : "#4a7a3a"}
          opacity="0.7" />
        <path d="M0,95 Q200,50 400,80 Q600,110 800,70 Q1000,30 1200,60 L1200,120 L0,120Z"
          fill={isNight ? "#0a150a" : isDusk ? "#1e3a1e" : isDawn ? "#2e4e2e" : "#3a6a2e"}
          opacity="0.8" />
        {/* Trees on hills */}
        {[80, 200, 350, 500, 650, 780, 920, 1050, 1150].map((x, i) => (
          <g key={i} transform={`translate(${x}, ${55 + Math.sin(x * 0.01) * 25})`}>
            <polygon points="-6,0 6,0 0,-18" fill={isNight ? "#0a200a" : isDusk ? "#1a3a1a" : "#2d5a1e"} opacity="0.8" />
            <rect x="-1.5" y="0" width="3" height="6" fill={isNight ? "#1a0a0a" : "#5D4037"} opacity="0.6" />
          </g>
        ))}
      </svg>

      {/* Fireflies at dusk/night */}
      {(isNight || isDusk) && Array.from({ length: 8 }, (_, i) => (
        <div key={`ff${i}`} style={{
          position: "absolute",
          left: `${10 + (i * 12) % 80}%`,
          bottom: `${8 + (i * 7) % 20}%`,
          width: 4, height: 4, borderRadius: "50%",
          background: isNight ? "#ffff66" : "#ffcc44",
          animation: `twinkle ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          boxShadow: `0 0 6px 2px ${isNight ? "rgba(255,255,100,0.6)" : "rgba(255,200,50,0.4)"}`,
        }} />
      ))}
    </div>
  );
}

// ─── DATA ──────────────────────────────────────────

const CREATURE_STAGES = {
  water: [
    { name: "Bubbles", emoji: "🐙", saying: "Blub blub! I need water biscuits!" },
    { name: "Tideswirl", emoji: "🐋", saying: "The ocean flows through me!" },
    { name: "Leviathan", emoji: "🌊", saying: "I AM the sea! 🔱" },
  ],
  fire: [
    { name: "Sparky", emoji: "🐉", saying: "Roar! Feed me fire biscuits!" },
    { name: "Blazeclaw", emoji: "🔥", saying: "My flames grow stronger!" },
    { name: "Inferno King", emoji: "☀️", saying: "Nothing can withstand my fire! 👑" },
  ],
  forest: [
    { name: "Mossy", emoji: "🦎", saying: "Hehe! I love forest biscuits!" },
    { name: "Thornvine", emoji: "🌿", saying: "The forest speaks to me!" },
    { name: "Ancient Treant", emoji: "🌳", saying: "I am one with nature! 🍃" },
  ],
  sky: [
    { name: "Breeze", emoji: "🦅", saying: "Wheee! Sky biscuits please!" },
    { name: "Stormwing", emoji: "🌪️", saying: "I ride the lightning!" },
    { name: "Sky Titan", emoji: "⚡", saying: "The heavens bow to me! 🌩️" },
  ],
  star: [
    { name: "Twinkle", emoji: "🦄", saying: "✨ Star biscuits make me glow!" },
    { name: "Celestia", emoji: "🌙", saying: "The stars guide my path!" },
    { name: "Galaxy Lord", emoji: "🌌", saying: "I hold the cosmos in my hooves! 💫" },
  ],
  ice: [
    { name: "Frosty", emoji: "🐧", saying: "Brrr! Ice biscuits are yummy!" },
    { name: "Glacius", emoji: "🧊", saying: "Winter is my kingdom!" },
    { name: "Blizzard Beast", emoji: "❄️", saying: "An eternal winter follows me! 🏔️" },
  ],
};

const HEARTS_PER_STAGE = 5;
function getCreatureStage(fc) { if (fc >= HEARTS_PER_STAGE * 2) return 2; if (fc >= HEARTS_PER_STAGE) return 1; return 0; }
function getCreatureData(type, fc) { return { ...CREATURE_STAGES[type][getCreatureStage(fc)], stage: getCreatureStage(fc) }; }
function getHeartsInCurrentStage(fc) { return fc - (getCreatureStage(fc) * HEARTS_PER_STAGE); }
function isMaxEvolution(fc) { return fc >= HEARTS_PER_STAGE * 3; }

const CREATURES = [
  { id: "water", type: "water", color: "#4FC3F7", bg: "#E1F5FE", needs: "water" },
  { id: "fire", type: "fire", color: "#FF7043", bg: "#FBE9E7", needs: "fire" },
  { id: "forest", type: "forest", color: "#66BB6A", bg: "#E8F5E9", needs: "forest" },
  { id: "sky", type: "sky", color: "#AB47BC", bg: "#F3E5F5", needs: "sky" },
  { id: "star", type: "star", color: "#FFD54F", bg: "#FFFDE7", needs: "star" },
  { id: "ice", type: "ice", color: "#80DEEA", bg: "#E0F7FA", needs: "ice" },
];

const BISCUIT_TYPES = [
  { id: "water", name: "Water Biscuit", emoji: "🔵", color: "#4FC3F7", chipColor: "#29B6F6", drizzle: "#0288D1" },
  { id: "fire", name: "Fire Biscuit", emoji: "🔴", color: "#FF7043", chipColor: "#F44336", drizzle: "#D32F2F" },
  { id: "forest", name: "Forest Biscuit", emoji: "🟢", color: "#66BB6A", chipColor: "#43A047", drizzle: "#2E7D32" },
  { id: "sky", name: "Sky Biscuit", emoji: "🟣", color: "#AB47BC", chipColor: "#9C27B0", drizzle: "#7B1FA2" },
  { id: "star", name: "Star Biscuit", emoji: "🌟", color: "#FFD54F", chipColor: "#FFC107", drizzle: "#FF8F00" },
  { id: "ice", name: "Ice Biscuit", emoji: "🧊", color: "#80DEEA", chipColor: "#4DD0E1", drizzle: "#00ACC1" },
];

function BiscuitSVG({ type, size = 40, corrupted = false }) {
  const b = BISCUIT_TYPES.find(bt => bt.id === type) || BISCUIT_TYPES[0];
  const s = size;

  if (corrupted) {
    return (
      <svg width={s} height={s} viewBox="0 0 60 60">
        {/* Corrupted biscuit - sickly green/purple */}
        <ellipse cx="30" cy="32" rx="25" ry="22" fill="#5D4037" opacity="0.3"/>
        <ellipse cx="30" cy="30" rx="25" ry="22" fill="#4a3728"/>
        <ellipse cx="30" cy="30" rx="25" ry="22" fill="url(#corruptGrad)" opacity="0.6"/>
        {/* Cracks */}
        <path d="M18,22 L25,30 L20,38" stroke="#1B5E20" strokeWidth="1.5" fill="none" opacity="0.7"/>
        <path d="M38,18 L34,28 L40,35" stroke="#1B5E20" strokeWidth="1.5" fill="none" opacity="0.7"/>
        {/* Poison spots */}
        <circle cx="22" cy="24" r="3.5" fill="#76FF03" opacity="0.6"/>
        <circle cx="38" cy="28" r="3" fill="#76FF03" opacity="0.5"/>
        <circle cx="28" cy="36" r="2.5" fill="#B2FF59" opacity="0.5"/>
        <circle cx="36" cy="20" r="2" fill="#76FF03" opacity="0.4"/>
        <circle cx="25" cy="30" r="2" fill="#69F0AE" opacity="0.5"/>
        {/* Skull mark */}
        <circle cx="30" cy="28" r="5" fill="#1B5E20" opacity="0.4"/>
        <circle cx="28" cy="27" r="1.2" fill="#76FF03" opacity="0.8"/>
        <circle cx="32" cy="27" r="1.2" fill="#76FF03" opacity="0.8"/>
        <path d="M28,31 L30,33 L32,31" stroke="#76FF03" strokeWidth="0.8" fill="none" opacity="0.7"/>
        {/* Texture edge */}
        <ellipse cx="30" cy="30" rx="25" ry="22" fill="none" stroke="#33691E" strokeWidth="1.5" strokeDasharray="3,2" opacity="0.5"/>
        <defs>
          <radialGradient id="corruptGrad"><stop offset="0%" stopColor="#76FF03" stopOpacity="0.3"/><stop offset="100%" stopColor="#1B5E20" stopOpacity="0.2"/></radialGradient>
        </defs>
      </svg>
    );
  }

  // Unique chip/spot positions per type so they look different
  const chipPositions = {
    water: [{x:20,y:22,r:3},{x:37,y:26,r:2.5},{x:25,y:35,r:2},{x:35,y:18,r:2},{x:30,y:30,r:1.8}],
    fire: [{x:22,y:20,r:2.5},{x:35,y:24,r:3},{x:28,y:34,r:2.5},{x:38,y:35,r:2},{x:20,y:30,r:1.5}],
    forest: [{x:24,y:23,r:2.8},{x:36,y:20,r:2},{x:22,y:33,r:2.2},{x:34,y:32,r:2.5},{x:30,y:26,r:1.8}],
    sky: [{x:22,y:25,r:2.5},{x:36,y:22,r:2.8},{x:28,y:36,r:2},{x:38,y:32,r:2.2},{x:26,y:18,r:1.5}],
    star: [{x:25,y:22,r:2.5},{x:35,y:28,r:2.8},{x:22,y:32,r:2},{x:38,y:20,r:2},{x:30,y:35,r:2.2}],
    ice: [{x:20,y:24,r:2.5},{x:35,y:20,r:2.2},{x:26,y:34,r:2.8},{x:38,y:34,r:2},{x:30,y:24,r:1.5}],
  };

  const chips = chipPositions[type] || chipPositions.water;

  return (
    <svg width={s} height={s} viewBox="0 0 60 60">
      <defs>
        <radialGradient id={`bk-${type}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#F5DEB3"/>
          <stop offset="50%" stopColor="#DEB887"/>
          <stop offset="100%" stopColor="#C8A96E"/>
        </radialGradient>
        <radialGradient id={`shine-${type}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="30" cy="34" rx="25" ry="20" fill="#8D6E63" opacity="0.2"/>

      {/* Biscuit body - golden baked look */}
      <ellipse cx="30" cy="30" rx="25" ry="22" fill={`url(#bk-${type})`}/>

      {/* Baked edge ring */}
      <ellipse cx="30" cy="30" rx="25" ry="22" fill="none" stroke="#B8860B" strokeWidth="1.5" opacity="0.4"/>
      <ellipse cx="30" cy="30" rx="23" ry="20" fill="none" stroke="#D4A96E" strokeWidth="0.8" opacity="0.3" strokeDasharray="4,3"/>

      {/* Bake spots - darker patches */}
      <circle cx="18" cy="28" r="4" fill="#C49A6C" opacity="0.3"/>
      <circle cx="40" cy="32" r="3.5" fill="#C49A6C" opacity="0.25"/>
      <circle cx="30" cy="40" r="3" fill="#B8860B" opacity="0.15"/>

      {/* Coloured chips/spots for this type */}
      {chips.map((ch, i) => (
        <g key={i}>
          <circle cx={ch.x} cy={ch.y} r={ch.r} fill={b.chipColor}/>
          <circle cx={ch.x - 0.5} cy={ch.y - 0.5} r={ch.r * 0.5} fill="white" opacity="0.3"/>
        </g>
      ))}

      {/* Type-specific decoration */}
      {type === "water" && (
        <path d="M18,30 Q22,26 26,30 Q30,34 34,30 Q38,26 42,30" stroke={b.drizzle} strokeWidth="1.5" fill="none" opacity="0.5"/>
      )}
      {type === "fire" && <>
        <path d="M28,16 Q30,12 32,16" stroke="#FF6F00" strokeWidth="1.5" fill="none" opacity="0.4"/>
        <path d="M25,17 Q28,10 31,17" stroke="#FFD54F" strokeWidth="1" fill="none" opacity="0.3"/>
      </>}
      {type === "forest" && <>
        <path d="M28,18 L30,14 L32,18Z" fill="#2E7D32" opacity="0.4"/>
        <line x1="30" y1="18" x2="30" y2="22" stroke="#4E342E" strokeWidth="0.8" opacity="0.4"/>
      </>}
      {type === "sky" && <>
        <path d="M26,16 Q30,12 34,16 Q30,14 26,16Z" fill="#E1BEE7" opacity="0.5"/>
        <circle cx="22" cy="17" r="2" fill="#CE93D8" opacity="0.3"/>
        <circle cx="38" cy="17" r="1.5" fill="#CE93D8" opacity="0.3"/>
      </>}
      {type === "star" && <>
        <polygon points="30,14 31.5,18 36,18 32.5,21 34,25 30,22 26,25 27.5,21 24,18 28.5,18" fill="#FFA000" opacity="0.45"/>
      </>}
      {type === "ice" && <>
        <line x1="26" y1="18" x2="34" y2="18" stroke="#B3E5FC" strokeWidth="1" opacity="0.5"/>
        <line x1="28" y1="16" x2="28" y2="20" stroke="#B3E5FC" strokeWidth="0.8" opacity="0.4"/>
        <line x1="32" y1="16" x2="32" y2="20" stroke="#B3E5FC" strokeWidth="0.8" opacity="0.4"/>
        <circle cx="30" cy="16" r="1.5" fill="#E0F7FA" opacity="0.5"/>
      </>}

      {/* Drizzle lines across biscuit */}
      <path d={`M16,26 Q20,24 24,27 Q28,30 32,27 Q36,24 40,27 Q44,30 44,28`} stroke={b.drizzle} strokeWidth="1" fill="none" opacity="0.25"/>

      {/* Shine/gloss */}
      <ellipse cx="30" cy="30" rx="25" ry="22" fill={`url(#shine-${type})`}/>

      {/* Crumb texture */}
      <circle cx="16" cy="34" r="1" fill="#B8860B" opacity="0.3"/>
      <circle cx="44" cy="26" r="1" fill="#B8860B" opacity="0.25"/>
      <circle cx="22" cy="40" r="0.8" fill="#B8860B" opacity="0.2"/>
    </svg>
  );
}

const LOCATIONS = [
  { id: "ocean", name: "Crystal Ocean", emoji: "🌊", bg: "linear-gradient(135deg, #0077B6, #00B4D8, #90E0EF)", biscuits: ["water", "ice"], description: "Waves crash on sparkling shores...", enemies: ["crab", "shark"], boss: "krakenLord" },
  { id: "volcano", name: "Ember Mountain", emoji: "🌋", bg: "linear-gradient(135deg, #D00000, #E85D04, #FAA307)", biscuits: ["fire", "star"], description: "Hot lava flows between the rocks...", enemies: ["lavaSlime", "fireImp"], boss: "magmaKing" },
  { id: "enchanted", name: "Enchanted Woods", emoji: "🌲", bg: "linear-gradient(135deg, #2D6A4F, #52B788, #95D5B2)", biscuits: ["forest", "sky"], description: "Magical trees whisper secrets...", enemies: ["goblin", "troll"], boss: "darkWitch" },
  { id: "clouds", name: "Cloud Kingdom", emoji: "☁️", bg: "linear-gradient(135deg, #7B2CBF, #C77DFF, #E0AAFF)", biscuits: ["sky", "star"], description: "Fluffy clouds stretch forever...", enemies: ["stormSprite", "skyBandit"], boss: "thunderGod" },
  { id: "arctic", name: "Frozen Tundra", emoji: "❄️", bg: "linear-gradient(135deg, #CAF0F8, #ADE8F4, #48CAE4)", biscuits: ["ice", "water"], description: "Everything sparkles with frost...", enemies: ["frostWolf", "snowGremlin"], boss: "iceQueen" },
  { id: "desert", name: "Golden Dunes", emoji: "🏜️", bg: "linear-gradient(135deg, #E9C46A, #F4A261, #E76F51)", biscuits: ["fire", "forest"], description: "Sand dunes shimmer in the heat...", enemies: ["sandBandit", "scorpion"], boss: "sandWyrm" },
];

const ENEMIES = {
  crab: { name: "Snappy Crab", emoji: "🦀", hp: 3, color: "#E53935", taunt: "I'll pinch your biscuits!", steal: 1 },
  shark: { name: "Biscuit Shark", emoji: "🦈", hp: 5, color: "#455A64", taunt: "Those biscuits are MINE!", steal: 2 },
  lavaSlime: { name: "Lava Slime", emoji: "🔥", hp: 4, color: "#FF6F00", taunt: "Sizzle! Give me those!", steal: 1 },
  fireImp: { name: "Fire Imp", emoji: "👹", hp: 4, color: "#BF360C", taunt: "Hehehe! Biscuit time!", steal: 2 },
  goblin: { name: "Sneaky Goblin", emoji: "👺", hp: 3, color: "#558B2F", taunt: "Yoink! My biscuits now!", steal: 1 },
  troll: { name: "Grumpy Troll", emoji: "🧌", hp: 6, color: "#5D4037", taunt: "TROLL HUNGRY!", steal: 3 },
  stormSprite: { name: "Storm Sprite", emoji: "⚡", hp: 3, color: "#7C4DFF", taunt: "Zap!", steal: 1 },
  skyBandit: { name: "Sky Bandit", emoji: "🦇", hp: 4, color: "#4A148C", taunt: "Swooping in!", steal: 2 },
  frostWolf: { name: "Frost Wolf", emoji: "🐺", hp: 5, color: "#0277BD", taunt: "Awoo! Biscuits!", steal: 2 },
  snowGremlin: { name: "Snow Gremlin", emoji: "☃️", hp: 3, color: "#4DD0E1", taunt: "Cold biscuits!", steal: 1 },
  sandBandit: { name: "Sand Bandit", emoji: "🏴‍☠️", hp: 4, color: "#A1887F", taunt: "Hand them over!", steal: 2 },
  scorpion: { name: "Giant Scorpion", emoji: "🦂", hp: 5, color: "#E65100", taunt: "Click click!", steal: 2 },
};

const BOSSES = {
  krakenLord: { name: "Kraken Lord", emoji: "🦑", hp: 12, color: "#1565C0", taunt: "THE DEEP SWALLOWS ALL!", attackSpeed: 2500 },
  magmaKing: { name: "Magma King", emoji: "👑", hp: 14, color: "#BF360C", taunt: "BURN IN MY FIRE!", attackSpeed: 2200 },
  darkWitch: { name: "Dark Witch", emoji: "🧙‍♀️", hp: 10, color: "#2E7D32", taunt: "MY CURSE CORRUPTS ALL!", attackSpeed: 1800 },
  thunderGod: { name: "Thunder God", emoji: "🌩️", hp: 13, color: "#6A1B9A", taunt: "FEEL MY LIGHTNING!", attackSpeed: 2000 },
  iceQueen: { name: "Ice Queen", emoji: "👸", hp: 11, color: "#00838F", taunt: "FREEZE AND SURRENDER!", attackSpeed: 2300 },
  sandWyrm: { name: "Sand Wyrm", emoji: "🐛", hp: 15, color: "#8D6E63", taunt: "THE SANDS DEVOUR!", attackSpeed: 2600 },
};

const AVATARS = [
  { id: "explorer", emoji: "🧑‍🚀", name: "Space Explorer", color: "#5C6BC0", category: "character" },
  { id: "fairy", emoji: "🧚", name: "Forest Fairy", color: "#AB47BC", category: "character" },
  { id: "wizard", emoji: "🧙", name: "Wizard", color: "#7E57C2", category: "character" },
  { id: "princess", emoji: "👸", name: "Princess", color: "#EC407A", category: "character" },
  { id: "ninja", emoji: "🥷", name: "Ninja", color: "#455A64", category: "character" },
  { id: "pirate", emoji: "🏴‍☠️", name: "Pirate", color: "#8D6E63", category: "character" },
  { id: "superhero", emoji: "🦸", name: "Superhero", color: "#EF5350", category: "character" },
  { id: "mermaid", emoji: "🧜", name: "Mermaid", color: "#26C6DA", category: "character" },
  { id: "elf", emoji: "🧝", name: "Elf", color: "#66BB6A", category: "character" },
  { id: "vampire", emoji: "🧛", name: "Vampire", color: "#7B1FA2", category: "character" },
  { id: "robot", emoji: "🤖", name: "Robot", color: "#78909C", category: "character" },
  { id: "alien", emoji: "👽", name: "Alien", color: "#4CAF50", category: "character" },
  // Animals — grouped by species with breeds
  { id: "siamese-cat", emoji: "🐱", name: "Siamese Cat", color: "#D4A574", category: "animal", species: "Cats" },
  { id: "british-shorthair", emoji: "🐱", name: "British Shorthair", color: "#90A4AE", category: "animal", species: "Cats" },
  { id: "bsh-blue-white", emoji: "🐱", name: "Blue & White BSH", color: "#78909C", category: "animal", species: "Cats" },
  { id: "bsh-lilac", emoji: "🐱", name: "Lilac BSH", color: "#CE93D8", category: "animal", species: "Cats" },
  { id: "bsh-cream", emoji: "🐱", name: "Cream BSH", color: "#FFE0B2", category: "animal", species: "Cats" },
  { id: "bsh-chocolate", emoji: "🐱", name: "Chocolate BSH", color: "#795548", category: "animal", species: "Cats" },
  { id: "bsh-golden", emoji: "🐱", name: "Golden BSH", color: "#FFB74D", category: "animal", species: "Cats" },
  { id: "bsh-cinnamon", emoji: "🐱", name: "Cinnamon BSH", color: "#D4A574", category: "animal", species: "Cats" },
  { id: "persian-cat", emoji: "🐱", name: "Persian Cat", color: "#FFCC80", category: "animal", species: "Cats" },
  { id: "black-cat", emoji: "🐈‍⬛", name: "Black Cat", color: "#37474F", category: "animal", species: "Cats" },
  { id: "tabby-cat", emoji: "🐱", name: "Tabby Cat", color: "#FF9800", category: "animal", species: "Cats" },
  { id: "ragdoll-cat", emoji: "🐱", name: "Ragdoll", color: "#B0BEC5", category: "animal", species: "Cats" },
  { id: "sphynx-cat", emoji: "🐱", name: "Sphynx", color: "#FFAB91", category: "animal", species: "Cats" },
  { id: "maine-coon", emoji: "🐱", name: "Maine Coon", color: "#8D6E63", category: "animal", species: "Cats" },

  { id: "golden-retriever", emoji: "🐶", name: "Golden Retriever", color: "#FFB74D", category: "animal", species: "Dogs" },
  { id: "husky", emoji: "🐶", name: "Husky", color: "#78909C", category: "animal", species: "Dogs" },
  { id: "german-shepherd", emoji: "🐶", name: "German Shepherd", color: "#8D6E63", category: "animal", species: "Dogs" },
  { id: "poodle", emoji: "🐩", name: "Poodle", color: "#CE93D8", category: "animal", species: "Dogs" },
  { id: "corgi", emoji: "🐶", name: "Corgi", color: "#FFCC80", category: "animal", species: "Dogs" },
  { id: "dalmatian", emoji: "🐶", name: "Dalmatian", color: "#EEEEEE", category: "animal", species: "Dogs" },
  { id: "labrador", emoji: "🐶", name: "Labrador", color: "#A1887F", category: "animal", species: "Dogs" },
  { id: "shiba-inu", emoji: "🐶", name: "Shiba Inu", color: "#FF8A65", category: "animal", species: "Dogs" },

  { id: "fox", emoji: "🦊", name: "Red Fox", color: "#FF5722", category: "animal", species: "Wild" },
  { id: "arctic-fox", emoji: "🦊", name: "Arctic Fox", color: "#E0E0E0", category: "animal", species: "Wild" },
  { id: "wolf", emoji: "🐺", name: "Grey Wolf", color: "#607D8B", category: "animal", species: "Wild" },
  { id: "white-wolf", emoji: "🐺", name: "White Wolf", color: "#ECEFF1", category: "animal", species: "Wild" },
  { id: "lion", emoji: "🦁", name: "Lion", color: "#FFA000", category: "animal", species: "Wild" },
  { id: "tiger", emoji: "🐯", name: "Tiger", color: "#E65100", category: "animal", species: "Wild" },
  { id: "snow-leopard", emoji: "🐆", name: "Snow Leopard", color: "#B0BEC5", category: "animal", species: "Wild" },
  { id: "panther", emoji: "🐆", name: "Black Panther", color: "#263238", category: "animal", species: "Wild" },
  { id: "bear", emoji: "🐻", name: "Brown Bear", color: "#8D6E63", category: "animal", species: "Wild" },
  { id: "polar-bear", emoji: "🐻‍❄️", name: "Polar Bear", color: "#E3F2FD", category: "animal", species: "Wild" },
  { id: "panda", emoji: "🐼", name: "Panda", color: "#37474F", category: "animal", species: "Wild" },
  { id: "red-panda", emoji: "🐼", name: "Red Panda", color: "#D84315", category: "animal", species: "Wild" },

  { id: "bunny", emoji: "🐰", name: "White Bunny", color: "#F8BBD0", category: "animal", species: "Cute" },
  { id: "lop-bunny", emoji: "🐰", name: "Lop Bunny", color: "#BCAAA4", category: "animal", species: "Cute" },
  { id: "hamster", emoji: "🐹", name: "Hamster", color: "#FFCC80", category: "animal", species: "Cute" },
  { id: "koala", emoji: "🐨", name: "Koala", color: "#9E9E9E", category: "animal", species: "Cute" },
  { id: "hedgehog", emoji: "🦔", name: "Hedgehog", color: "#A1887F", category: "animal", species: "Cute" },
  { id: "squirrel", emoji: "🐿️", name: "Squirrel", color: "#D4A574", category: "animal", species: "Cute" },
  { id: "otter", emoji: "🦦", name: "Otter", color: "#795548", category: "animal", species: "Cute" },
  { id: "monkey", emoji: "🐵", name: "Monkey", color: "#A1887F", category: "animal", species: "Cute" },

  { id: "dragon", emoji: "🐲", name: "Dragon", color: "#2E7D32", category: "animal", species: "Fantasy" },
  { id: "ice-dragon", emoji: "🐲", name: "Ice Dragon", color: "#4FC3F7", category: "animal", species: "Fantasy" },
  { id: "fire-dragon", emoji: "🐲", name: "Fire Dragon", color: "#FF5722", category: "animal", species: "Fantasy" },
  { id: "unicorn", emoji: "🦄", name: "Unicorn", color: "#CE93D8", category: "animal", species: "Fantasy" },
  { id: "phoenix", emoji: "🔥", name: "Phoenix", color: "#FF6D00", category: "animal", species: "Fantasy" },
  { id: "pegasus", emoji: "🦄", name: "Pegasus", color: "#90CAF9", category: "animal", species: "Fantasy" },

  { id: "eagle", emoji: "🦅", name: "Eagle", color: "#455A64", category: "animal", species: "Birds" },
  { id: "owl", emoji: "🦉", name: "Owl", color: "#6D4C41", category: "animal", species: "Birds" },
  { id: "parrot", emoji: "🦜", name: "Parrot", color: "#4CAF50", category: "animal", species: "Birds" },
  { id: "flamingo", emoji: "🦩", name: "Flamingo", color: "#F48FB1", category: "animal", species: "Birds" },
  { id: "penguin", emoji: "🐧", name: "Penguin", color: "#263238", category: "animal", species: "Birds" },
  { id: "swan", emoji: "🦢", name: "Swan", color: "#FAFAFA", category: "animal", species: "Birds" },

  { id: "dolphin", emoji: "🐬", name: "Dolphin", color: "#0097A7", category: "animal", species: "Ocean" },
  { id: "shark", emoji: "🦈", name: "Shark", color: "#546E7A", category: "animal", species: "Ocean" },
  { id: "whale", emoji: "🐋", name: "Whale", color: "#1565C0", category: "animal", species: "Ocean" },
  { id: "octopus", emoji: "🐙", name: "Octopus", color: "#E91E63", category: "animal", species: "Ocean" },
  { id: "jellyfish", emoji: "🪼", name: "Jellyfish", color: "#B39DDB", category: "animal", species: "Ocean" },
  { id: "seahorse", emoji: "🐴", name: "Seahorse", color: "#FFB74D", category: "animal", species: "Ocean" },
  { id: "turtle", emoji: "🐢", name: "Sea Turtle", color: "#66BB6A", category: "animal", species: "Ocean" },

  { id: "butterfly", emoji: "🦋", name: "Butterfly", color: "#7C4DFF", category: "animal", species: "Tiny" },
  { id: "bee", emoji: "🐝", name: "Bee", color: "#FDD835", category: "animal", species: "Tiny" },
  { id: "ladybug", emoji: "🐞", name: "Ladybug", color: "#E53935", category: "animal", species: "Tiny" },
  { id: "frog", emoji: "🐸", name: "Frog", color: "#4CAF50", category: "animal", species: "Tiny" },
  { id: "bat", emoji: "🦇", name: "Bat", color: "#4A148C", category: "animal", species: "Tiny" },
  { id: "snail", emoji: "🐌", name: "Snail", color: "#BCAAA4", category: "animal", species: "Tiny" },
];

const ATTACK_WORDS = ["POW!", "BAM!", "WHACK!", "BONK!", "SMACK!", "ZAP!", "WHAM!", "KAPOW!"];
const STAGE_NAMES = ["Baby", "Teen", "Ultimate"];

// ─── COMPONENTS ──────────────────────────────────────────

const COLOR_OPTIONS = [
  { id: "none", name: "Default", bg: "transparent", ring: "#BDBDBD" },
  { id: "white", name: "White", bg: "#FFFFFF", ring: "#E0E0E0" },
  { id: "grey", name: "Grey", bg: "#9E9E9E", ring: "#757575" },
  { id: "black", name: "Black", bg: "#37474F", ring: "#263238" },
  { id: "brown", name: "Brown", bg: "#8D6E63", ring: "#6D4C41" },
  { id: "cream", name: "Cream", bg: "#FFF8E1", ring: "#FFE082" },
  { id: "ginger", name: "Ginger", bg: "#FF8A65", ring: "#E64A19" },
  { id: "golden", name: "Golden", bg: "#FFD54F", ring: "#FFA000" },
  { id: "pink", name: "Pink", bg: "#F8BBD0", ring: "#EC407A" },
  { id: "blue", name: "Blue", bg: "#90CAF9", ring: "#1E88E5" },
  { id: "purple", name: "Purple", bg: "#CE93D8", ring: "#8E24AA" },
  { id: "green", name: "Green", bg: "#A5D6A7", ring: "#43A047" },
  { id: "red", name: "Red", bg: "#EF9A9A", ring: "#E53935" },
  { id: "teal", name: "Teal", bg: "#80CBC4", ring: "#00897B" },
  { id: "silver", name: "Silver", bg: "#CFD8DC", ring: "#90A4AE" },
  { id: "rainbow", name: "Rainbow", bg: "linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B59B6)", ring: "#FF6B6B" },
];

// SVG animal face drawings - each returns an SVG element
function AnimalFace({ animalId, bodyColor, size = 42 }) {
  const c = COLOR_OPTIONS.find(c => c.id === bodyColor) || COLOR_OPTIONS[0];
  const fill = c.bg === "transparent" ? "#ccc" : (c.id === "rainbow" ? "#F48FB1" : c.bg);
  const dark = c.ring || "#555";
  const s = size;
  const av = AVATARS.find(a => a.id === animalId);
  const species = av?.species || "";
  const id = av?.id || "";

  // Determine shapes based on animal
  // Cats
  if (species === "Cats" || id.includes("cat") || id.includes("bsh")) {
    const isBlack = id === "black-cat";
    const isSphynx = id === "sphynx-cat";
    const isTabby = id === "tabby-cat";
    const isSiamese = id === "siamese-cat";
    const isBSH = id.startsWith("bsh") || id === "british-shorthair";
    const isBSHBlueWhite = id === "bsh-blue-white";
    const isBSHLilac = id === "bsh-lilac";
    const isBSHCream = id === "bsh-cream";
    const isBSHChocolate = id === "bsh-chocolate";
    const isBSHGolden = id === "bsh-golden";
    const isBSHCinnamon = id === "bsh-cinnamon";
    const isRagdoll = id === "ragdoll-cat";

    // BSH have rounder, chunkier faces
    const headRX = isBSH ? 36 : 34;
    const headRY = isBSH ? 32 : 30;

    // BSH-specific colours when no custom colour chosen
    const bshFill = fill;
    const bshBlueGrey = "#90A4AE";

    // Blue & White BSH: the "blue" is actually grey-blue, with big white patches
    // It's a bicolour cat - white body with grey-blue patches
    const blueWhitePatchColor = "#78909C";

    // Eye colours per breed
    const eyeColor = isBlack ? "#66BB6A" : isSiamese ? "#42A5F5" :
      isBSHGolden ? "#FF8F00" : isBSHLilac ? "#FFB300" :
      isBSH ? "#FF8F00" : isRagdoll ? "#42A5F5" : "#2196F3";

    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {/* Ears */}
        <polygon points="18,38 30,8 42,35" fill={isBSHBlueWhite ? blueWhitePatchColor : bshFill} stroke={dark} strokeWidth="2"/>
        <polygon points="58,35 70,8 82,38" fill={bshFill} stroke={dark} strokeWidth="2"/>
        <polygon points="23,35 30,15 37,33" fill={isSiamese ? "#5D4037" : isBSH ? "#F8BBD0" : "#F8BBD0"} opacity="0.5"/>
        <polygon points="63,33 70,15 77,35" fill={isSiamese ? "#5D4037" : isBSH ? "#F8BBD0" : "#F8BBD0"} opacity="0.5"/>

        {/* Head */}
        <ellipse cx="50" cy="55" rx={headRX} ry={headRY} fill={bshFill} stroke={dark} strokeWidth="2"/>

        {/* BSH Blue & White — white is the base, grey-blue patches on top and sides */}
        {isBSHBlueWhite && <>
          {/* The cat is white with grey-blue patches - NOT blue */}
          <ellipse cx="50" cy="55" rx={headRX} ry={headRY} fill="white"/>
          <ellipse cx="50" cy="55" rx={headRX} ry={headRY} fill="none" stroke={dark} strokeWidth="2"/>
          {/* Grey-blue patch over left side of face and head */}
          <path d="M18,38 Q30,8 42,35 Q45,42 44,55 Q42,65 35,70 Q25,68 20,55 Q16,45 18,38Z" fill={blueWhitePatchColor} opacity="0.85"/>
          {/* Small patch on right ear */}
          <path d="M62,35 Q70,8 80,36 Q78,40 72,38 Q66,36 62,35Z" fill={blueWhitePatchColor} opacity="0.7"/>
          {/* Patch on top of head */}
          <ellipse cx="50" cy="32" rx="15" ry="8" fill={blueWhitePatchColor} opacity="0.6"/>
        </>}

        {/* BSH Lilac — soft pinkish-grey with even colour */}
        {isBSHLilac && <ellipse cx="50" cy="55" rx={headRX-2} ry={headRY-2} fill="#D1C4E9" opacity="0.3"/>}

        {/* BSH Chocolate — rich brown, slightly darker muzzle */}
        {isBSHChocolate && <ellipse cx="50" cy="65" rx="16" ry="10" fill="#5D4037" opacity="0.25"/>}

        {/* BSH Golden — warm gradient shimmer */}
        {isBSHGolden && <>
          <ellipse cx="40" cy="48" rx="10" ry="8" fill="#FFE082" opacity="0.3"/>
          <ellipse cx="60" cy="48" rx="10" ry="8" fill="#FFE082" opacity="0.3"/>
        </>}

        {/* BSH Cinnamon — warm reddish-brown, lighter belly */}
        {isBSHCinnamon && <ellipse cx="50" cy="72" rx="18" ry="8" fill="#FFCCBC" opacity="0.4"/>}

        {/* BSH Cream — very soft, even cream colour, lighter chin */}
        {isBSHCream && <ellipse cx="50" cy="68" rx="14" ry="8" fill="white" opacity="0.35"/>}

        {/* Regular BSH (blue/grey) — white chest */}
        {id === "british-shorthair" && <ellipse cx="50" cy="78" rx="14" ry="8" fill="white" opacity="0.7"/>}

        {/* BSH chubby cheeks - all BSH variants */}
        {isBSH && <>
          <ellipse cx="30" cy="60" rx="8" ry="6" fill={isBSHBlueWhite ? "white" : bshFill} opacity="0.4"/>
          <ellipse cx="70" cy="60" rx="8" ry="6" fill={bshFill} opacity="0.4"/>
        </>}

        {/* Tabby stripes */}
        {isTabby && <>
          <path d="M30,40 Q35,37 40,40" stroke={dark} strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M60,40 Q65,37 70,40" stroke={dark} strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M35,48 Q40,45 45,48" stroke={dark} strokeWidth="2" fill="none" opacity="0.3"/>
        </>}

        {/* Siamese dark face */}
        {isSiamese && <ellipse cx="50" cy="62" rx="18" ry="12" fill="#5D4037" opacity="0.5"/>}

        {/* Ragdoll V-shaped face mask */}
        {isRagdoll && <>
          <path d="M38,42 L50,35 L62,42 L58,55 L50,58 L42,55Z" fill="#8D6E63" opacity="0.25"/>
          <ellipse cx="50" cy="70" rx="18" ry="10" fill="white" opacity="0.5"/>
        </>}

        {/* Eyes - BSH have big round copper/amber eyes */}
        <ellipse cx="38" cy="52" rx={isBSH ? 7 : 6} ry={isBSH ? 7 : 7} fill="white"/>
        <ellipse cx="62" cy="52" rx={isBSH ? 7 : 6} ry={isBSH ? 7 : 7} fill="white"/>
        <ellipse cx="39" cy="53" rx={isBSH ? 4 : 3.5} ry={isBSH ? 4.5 : 4.5} fill={eyeColor}/>
        <ellipse cx="63" cy="53" rx={isBSH ? 4 : 3.5} ry={isBSH ? 4.5 : 4.5} fill={eyeColor}/>
        <circle cx="40" cy="51" r="1.2" fill="white"/>
        <circle cx="64" cy="51" r="1.2" fill="white"/>

        {/* Nose */}
        <polygon points="48,61 52,61 50,64" fill={isSiamese ? "#37474F" : isBSHChocolate ? "#4E342E" : "#F48FB1"}/>

        {/* Mouth - BSH have a little smile */}
        <path d={isBSH ? "M44,65 Q47,69 50,66 Q53,69 56,65" : "M46,65 Q50,70 54,65"} stroke={dark} strokeWidth="1.5" fill="none" opacity="0.5"/>

        {/* Whiskers */}
        <line x1="14" y1="58" x2="36" y2="60" stroke={dark} strokeWidth="1" opacity="0.4"/>
        <line x1="14" y1="64" x2="36" y2="63" stroke={dark} strokeWidth="1" opacity="0.4"/>
        <line x1="64" y1="60" x2="86" y2="58" stroke={dark} strokeWidth="1" opacity="0.4"/>
        <line x1="64" y1="63" x2="86" y2="64" stroke={dark} strokeWidth="1" opacity="0.4"/>

        {/* Persian flat face */}
        {id === "persian-cat" && <ellipse cx="50" cy="58" rx="16" ry="14" fill={bshFill} opacity="0.3"/>}

        {/* Maine Coon fluff */}
        {id === "maine-coon" && <>
          <ellipse cx="50" cy="80" rx="28" ry="10" fill={bshFill} opacity="0.5"/>
          <ellipse cx="30" cy="70" rx="8" ry="6" fill={bshFill} opacity="0.4"/>
          <ellipse cx="70" cy="70" rx="8" ry="6" fill={bshFill} opacity="0.4"/>
        </>}
      </svg>
    );
  }
  // Dogs
  if (species === "Dogs") {
    const isHusky = id === "husky";
    const isDalmatian = id === "dalmatian";
    const isCorgi = id === "corgi";
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {/* Floppy ears */}
        <ellipse cx="22" cy="42" rx="14" ry="22" fill={fill} stroke={dark} strokeWidth="2" transform="rotate(-15,22,42)"/>
        <ellipse cx="78" cy="42" rx="14" ry="22" fill={fill} stroke={dark} strokeWidth="2" transform="rotate(15,78,42)"/>
        {/* Head */}
        <ellipse cx="50" cy="52" rx="32" ry="30" fill={fill} stroke={dark} strokeWidth="2"/>
        {/* Husky mask */}
        {isHusky && <path d="M30,45 Q50,35 70,45 Q65,70 50,72 Q35,70 30,45Z" fill="white" opacity="0.6"/>}
        {/* Dalmatian spots */}
        {isDalmatian && <>
          <circle cx="35" cy="42" r="4" fill="#333" opacity="0.6"/>
          <circle cx="62" cy="38" r="3" fill="#333" opacity="0.6"/>
          <circle cx="55" cy="68" r="3.5" fill="#333" opacity="0.6"/>
          <circle cx="40" cy="65" r="2.5" fill="#333" opacity="0.6"/>
        </>}
        {/* Corgi blaze */}
        {isCorgi && <path d="M42,35 L50,28 L58,35 L55,60 L45,60Z" fill="white" opacity="0.5"/>}
        {/* Eyes */}
        <circle cx="38" cy="48" r="5.5" fill="white"/>
        <circle cx="62" cy="48" r="5.5" fill="white"/>
        <circle cx="39" cy="49" r="3.5" fill="#4E342E"/>
        <circle cx="63" cy="49" r="3.5" fill="#4E342E"/>
        <circle cx="40" cy="47" r="1.2" fill="white"/>
        <circle cx="64" cy="47" r="1.2" fill="white"/>
        {/* Nose */}
        <ellipse cx="50" cy="60" rx="6" ry="4" fill="#37474F"/>
        <ellipse cx="50" cy="59" rx="2" ry="1" fill="#666" opacity="0.5"/>
        {/* Mouth */}
        <path d="M44,64 Q50,70 56,64" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.4"/>
        {/* Tongue */}
        <ellipse cx="50" cy="71" rx="4" ry="5" fill="#EF5350" opacity="0.7"/>
      </svg>
    );
  }
  // Foxes/Wolves
  if (id.includes("fox") || id.includes("wolf")) {
    const isFox = id.includes("fox");
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {/* Pointy ears */}
        <polygon points="15,40 28,5 38,38" fill={fill} stroke={dark} strokeWidth="2"/>
        <polygon points="62,38 72,5 85,40" fill={fill} stroke={dark} strokeWidth="2"/>
        <polygon points="20,38 28,12 33,36" fill={isFox ? "#FFF3E0" : "#ddd"} opacity="0.5"/>
        <polygon points="67,36 72,12 80,38" fill={isFox ? "#FFF3E0" : "#ddd"} opacity="0.5"/>
        {/* Head */}
        <ellipse cx="50" cy="55" rx="32" ry="28" fill={fill} stroke={dark} strokeWidth="2"/>
        {/* White muzzle */}
        <ellipse cx="50" cy="65" rx="18" ry="14" fill="white" opacity="0.7"/>
        {/* Eyes */}
        <ellipse cx="37" cy="50" rx="5" ry="6" fill={isFox ? "#FF8F00" : "#B0BEC5"}/>
        <ellipse cx="63" cy="50" rx="5" ry="6" fill={isFox ? "#FF8F00" : "#B0BEC5"}/>
        <ellipse cx="38" cy="51" rx="2.5" ry="3.5" fill="#111"/>
        <ellipse cx="64" cy="51" rx="2.5" ry="3.5" fill="#111"/>
        <circle cx="39" cy="49" r="1" fill="white"/>
        <circle cx="65" cy="49" r="1" fill="white"/>
        {/* Nose */}
        <ellipse cx="50" cy="62" rx="4" ry="3" fill="#222"/>
        {/* Mouth */}
        <path d="M46,65 Q50,68 54,65" stroke="#555" strokeWidth="1" fill="none"/>
      </svg>
    );
  }
  // Bunnies
  if (id.includes("bunny")) {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {/* Long ears */}
        <ellipse cx="35" cy="22" rx="8" ry="22" fill={fill} stroke={dark} strokeWidth="2"/>
        <ellipse cx="65" cy="22" rx="8" ry="22" fill={fill} stroke={dark} strokeWidth="2"/>
        <ellipse cx="35" cy="22" rx="4" ry="16" fill="#F8BBD0" opacity="0.5"/>
        <ellipse cx="65" cy="22" rx="4" ry="16" fill="#F8BBD0" opacity="0.5"/>
        {/* Head */}
        <circle cx="50" cy="58" r="28" fill={fill} stroke={dark} strokeWidth="2"/>
        {/* Cheeks */}
        <circle cx="32" cy="62" r="8" fill="#F8BBD0" opacity="0.3"/>
        <circle cx="68" cy="62" r="8" fill="#F8BBD0" opacity="0.3"/>
        {/* Eyes */}
        <circle cx="40" cy="54" r="5" fill="white"/>
        <circle cx="60" cy="54" r="5" fill="white"/>
        <circle cx="41" cy="55" r="3" fill="#E91E63"/>
        <circle cx="61" cy="55" r="3" fill="#E91E63"/>
        <circle cx="42" cy="53" r="1" fill="white"/>
        <circle cx="62" cy="53" r="1" fill="white"/>
        {/* Nose */}
        <ellipse cx="50" cy="63" rx="3" ry="2" fill="#F48FB1"/>
        {/* Mouth */}
        <path d="M47,66 Q50,70 53,66" stroke={dark} strokeWidth="1" fill="none" opacity="0.4"/>
        {/* Teeth */}
        <rect x="47" y="66" width="3" height="4" rx="1" fill="white" stroke={dark} strokeWidth="0.5"/>
        <rect x="50" y="66" width="3" height="4" rx="1" fill="white" stroke={dark} strokeWidth="0.5"/>
      </svg>
    );
  }
  // Dragons/Fantasy
  if (species === "Fantasy") {
    const isIce = id === "ice-dragon";
    const isFire = id === "fire-dragon";
    const isUnicorn = id === "unicorn" || id === "pegasus";
    if (isUnicorn) {
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,2 45,30 55,30" fill="#FFD54F" stroke="#FFA000" strokeWidth="1.5"/>
          <ellipse cx="50" cy="55" rx="30" ry="28" fill={fill} stroke={dark} strokeWidth="2"/>
          {/* Mane */}
          <path d="M22,40 Q15,50 20,60 Q25,55 22,40Z" fill="#CE93D8" opacity="0.6"/>
          <path d="M18,48 Q10,58 16,68 Q22,62 18,48Z" fill="#AB47BC" opacity="0.5"/>
          {/* Eyes */}
          <circle cx="38" cy="52" r="5" fill="white"/>
          <circle cx="62" cy="52" r="5" fill="white"/>
          <circle cx="39" cy="53" r="3" fill="#7C4DFF"/>
          <circle cx="63" cy="53" r="3" fill="#7C4DFF"/>
          <circle cx="40" cy="51" r="1" fill="white"/>
          <circle cx="64" cy="51" r="1" fill="white"/>
          <ellipse cx="50" cy="64" rx="3" ry="2" fill="#F8BBD0"/>
          <path d="M46,67 Q50,71 54,67" stroke={dark} strokeWidth="1" fill="none" opacity="0.4"/>
          {id === "pegasus" && <>
            <path d="M10,45 Q0,35 8,25 Q15,30 12,42Z" fill="#90CAF9" opacity="0.7"/>
            <path d="M90,45 Q100,35 92,25 Q85,30 88,42Z" fill="#90CAF9" opacity="0.7"/>
          </>}
        </svg>
      );
    }
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {/* Horns */}
        <polygon points="20,35 15,8 30,30" fill={isIce ? "#B3E5FC" : isFire ? "#FF6F00" : "#FDD835"} stroke={dark} strokeWidth="1.5"/>
        <polygon points="70,30 85,8 80,35" fill={isIce ? "#B3E5FC" : isFire ? "#FF6F00" : "#FDD835"} stroke={dark} strokeWidth="1.5"/>
        {/* Head */}
        <ellipse cx="50" cy="55" rx="30" ry="28" fill={fill} stroke={dark} strokeWidth="2"/>
        {/* Scales */}
        <circle cx="35" cy="40" r="3" fill={dark} opacity="0.15"/>
        <circle cx="50" cy="36" r="3" fill={dark} opacity="0.15"/>
        <circle cx="65" cy="40" r="3" fill={dark} opacity="0.15"/>
        {/* Eyes */}
        <ellipse cx="38" cy="50" rx="6" ry="7" fill={isIce ? "#E1F5FE" : "#FFF9C4"}/>
        <ellipse cx="62" cy="50" rx="6" ry="7" fill={isIce ? "#E1F5FE" : "#FFF9C4"}/>
        <ellipse cx="39" cy="51" rx="2" ry="5" fill="#111"/>
        <ellipse cx="63" cy="51" rx="2" ry="5" fill="#111"/>
        {/* Nostrils */}
        <circle cx="44" cy="64" r="2.5" fill={dark} opacity="0.4"/>
        <circle cx="56" cy="64" r="2.5" fill={dark} opacity="0.4"/>
        {/* Mouth */}
        <path d="M38,70 Q50,76 62,70" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.4"/>
        {isFire && <text x="42" y="82" fontSize="12" opacity="0.6">🔥</text>}
        {isIce && <text x="42" y="82" fontSize="12" opacity="0.6">❄️</text>}
        {id === "phoenix" && <text x="42" y="82" fontSize="12" opacity="0.6">✨</text>}
      </svg>
    );
  }
  // Birds
  if (species === "Birds") {
    const isPenguin = id === "penguin";
    const isFlamingo = id === "flamingo";
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill={fill} stroke={dark} strokeWidth="2"/>
        {isPenguin && <ellipse cx="50" cy="58" rx="18" ry="20" fill="white" opacity="0.8"/>}
        {/* Eyes */}
        <circle cx="38" cy="45" r="5" fill="white"/>
        <circle cx="62" cy="45" r="5" fill="white"/>
        <circle cx="39" cy="46" r="3" fill="#111"/>
        <circle cx="63" cy="46" r="3" fill="#111"/>
        <circle cx="40" cy="44" r="1" fill="white"/>
        <circle cx="64" cy="44" r="1" fill="white"/>
        {/* Beak */}
        <polygon points="44,55 50,65 56,55" fill={isFlamingo ? "#FF7043" : isPenguin ? "#FF9800" : "#FFA000"} stroke={dark} strokeWidth="1"/>
        {/* Flamingo crest */}
        {isFlamingo && <ellipse cx="50" cy="22" rx="6" ry="10" fill="#F48FB1" opacity="0.6"/>}
        {/* Owl tufts */}
        {id === "owl" && <>
          <ellipse cx="32" cy="28" rx="8" ry="12" fill={fill} stroke={dark} strokeWidth="1.5"/>
          <ellipse cx="68" cy="28" rx="8" ry="12" fill={fill} stroke={dark} strokeWidth="1.5"/>
        </>}
        {/* Parrot colors */}
        {id === "parrot" && <>
          <path d="M20,50 Q15,35 25,25" stroke="#FF5722" strokeWidth="3" fill="none" opacity="0.5"/>
          <path d="M80,50 Q85,35 75,25" stroke="#2196F3" strokeWidth="3" fill="none" opacity="0.5"/>
        </>}
        {id === "swan" && <path d="M50,80 Q50,90 45,95" stroke={fill} strokeWidth="4" fill="none"/>}
      </svg>
    );
  }
  // Ocean
  if (species === "Ocean") {
    const isShark = id === "shark";
    const isOctopus = id === "octopus";
    const isJelly = id === "jellyfish";
    if (isOctopus) {
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <ellipse cx="50" cy="40" rx="28" ry="24" fill={fill} stroke={dark} strokeWidth="2"/>
          {/* Tentacles */}
          {[20,32,44,56,68,80].map((x,i) => <path key={i} d={`M${x},60 Q${x+(i%2?5:-5)},78 ${x},90`} stroke={fill} strokeWidth="5" fill="none" strokeLinecap="round"/>)}
          <circle cx="40" cy="38" r="6" fill="white"/>
          <circle cx="60" cy="38" r="6" fill="white"/>
          <circle cx="41" cy="39" r="3.5" fill="#111"/>
          <circle cx="61" cy="39" r="3.5" fill="#111"/>
          <circle cx="42" cy="37" r="1.2" fill="white"/>
          <circle cx="62" cy="37" r="1.2" fill="white"/>
          <path d="M44,50 Q50,55 56,50" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
      );
    }
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="34" ry="24" fill={fill} stroke={dark} strokeWidth="2"/>
        {isShark && <polygon points="50,20 44,35 56,35" fill={fill} stroke={dark} strokeWidth="1.5"/>}
        {isJelly && <>
          {[30,40,50,60,70].map((x,i) => <path key={i} d={`M${x},72 Q${x+3},85 ${x-2},95`} stroke={fill} strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round"/>)}
        </>}
        <circle cx="38" cy="46" r="5" fill="white"/>
        <circle cx="62" cy="46" r="5" fill="white"/>
        <circle cx="39" cy="47" r="3" fill="#111"/>
        <circle cx="63" cy="47" r="3" fill="#111"/>
        <circle cx="40" cy="45" r="1" fill="white"/>
        <circle cx="64" cy="45" r="1" fill="white"/>
        {isShark && <path d="M38,56 L42,60 L46,56 L50,60 L54,56 L58,60 L62,56" stroke="white" strokeWidth="1.5" fill="none"/>}
        {!isShark && <path d="M46,55 Q50,59 54,55" stroke={dark} strokeWidth="1.5" fill="none" opacity="0.4"/>}
      </svg>
    );
  }
  // Wild (lions, tigers, bears, pandas, leopards)
  if (species === "Wild") {
    const isLion = id === "lion";
    const isTiger = id === "tiger";
    const isPanda = id === "panda" || id === "red-panda";
    const isBear = id.includes("bear");
    const isPanther = id === "panther";
    const isSnowLeopard = id === "snow-leopard";
    if (isPanda) {
      const isRed = id === "red-panda";
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="30" cy="28" r="12" fill={isRed ? "#D84315" : "#333"} stroke={dark} strokeWidth="1.5"/>
          <circle cx="70" cy="28" r="12" fill={isRed ? "#D84315" : "#333"} stroke={dark} strokeWidth="1.5"/>
          <circle cx="50" cy="52" r="30" fill={fill} stroke={dark} strokeWidth="2"/>
          {/* Eye patches */}
          <ellipse cx="38" cy="48" rx="10" ry="9" fill={isRed ? "#5D4037" : "#333"}/>
          <ellipse cx="62" cy="48" rx="10" ry="9" fill={isRed ? "#5D4037" : "#333"}/>
          <circle cx="38" cy="48" r="5" fill="white"/>
          <circle cx="62" cy="48" r="5" fill="white"/>
          <circle cx="39" cy="49" r="3" fill="#111"/>
          <circle cx="63" cy="49" r="3" fill="#111"/>
          <circle cx="40" cy="47" r="1" fill="white"/>
          <circle cx="64" cy="47" r="1" fill="white"/>
          <ellipse cx="50" cy="62" rx="5" ry="3" fill="#333"/>
          <path d="M46,66 Q50,70 54,66" stroke="#555" strokeWidth="1" fill="none"/>
          {isRed && <path d="M35,62 L38,58 M42,58 L45,62" stroke="white" strokeWidth="1.5" opacity="0.5"/>}
        </svg>
      );
    }
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {isLion && <circle cx="50" cy="50" r="38" fill="#D4A017" opacity="0.5"/>}
        {isLion && <circle cx="50" cy="50" r="34" fill="#B8860B" opacity="0.3"/>}
        {/* Ears */}
        <circle cx="25" cy="30" r="10" fill={fill} stroke={dark} strokeWidth="2"/>
        <circle cx="75" cy="30" r="10" fill={fill} stroke={dark} strokeWidth="2"/>
        {/* Head */}
        <circle cx="50" cy="52" r="28" fill={fill} stroke={dark} strokeWidth="2"/>
        {/* Tiger stripes */}
        {isTiger && <>
          <path d="M28,40 Q32,35 36,40" stroke="#BF360C" strokeWidth="2.5" fill="none" opacity="0.5"/>
          <path d="M64,40 Q68,35 72,40" stroke="#BF360C" strokeWidth="2.5" fill="none" opacity="0.5"/>
          <path d="M46,32 L50,28 L54,32" stroke="#BF360C" strokeWidth="2" fill="none" opacity="0.5"/>
        </>}
        {/* Snow leopard spots */}
        {isSnowLeopard && <>
          <circle cx="35" cy="42" r="3" fill={dark} opacity="0.2"/>
          <circle cx="65" cy="42" r="3" fill={dark} opacity="0.2"/>
          <circle cx="42" cy="65" r="2.5" fill={dark} opacity="0.2"/>
          <circle cx="58" cy="65" r="2.5" fill={dark} opacity="0.2"/>
        </>}
        {isBear && <ellipse cx="50" cy="62" rx="16" ry="12" fill={id === "polar-bear" ? "#E8EAF6" : "#D7CCC8"} opacity="0.6"/>}
        {/* Eyes */}
        <circle cx="38" cy="48" r="5" fill="white"/>
        <circle cx="62" cy="48" r="5" fill="white"/>
        <circle cx="39" cy="49" r="3" fill={isPanther ? "#66BB6A" : "#4E342E"}/>
        <circle cx="63" cy="49" r="3" fill={isPanther ? "#66BB6A" : "#4E342E"}/>
        <circle cx="40" cy="47" r="1" fill="white"/>
        <circle cx="64" cy="47" r="1" fill="white"/>
        {/* Nose */}
        <ellipse cx="50" cy="60" rx="5" ry="3.5" fill={isPanther ? "#111" : "#5D4037"}/>
        <path d="M45,64 Q50,68 55,64" stroke={dark} strokeWidth="1" fill="none" opacity="0.4"/>
      </svg>
    );
  }
  // Cute (hamster, koala, hedgehog, squirrel, otter, monkey)
  if (species === "Cute") {
    const isHedgehog = id === "hedgehog";
    const isMonkey = id === "monkey";
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {isHedgehog && <>
          {[20,30,40,50,60,70,80].map((x,i) => <line key={i} x1={x} y1={18+Math.abs(i-3)*3} x2={x+(i<3?-4:i>3?4:0)} y2={6} stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round"/>)}
        </>}
        <circle cx="30" cy="32" r="8" fill={fill} stroke={dark} strokeWidth="1.5"/>
        <circle cx="70" cy="32" r="8" fill={fill} stroke={dark} strokeWidth="1.5"/>
        {isMonkey && <>
          <circle cx="30" cy="32" r="6" fill="#FFCC80" opacity="0.7"/>
          <circle cx="70" cy="32" r="6" fill="#FFCC80" opacity="0.7"/>
        </>}
        <circle cx="50" cy="55" r="28" fill={fill} stroke={dark} strokeWidth="2"/>
        {isMonkey && <ellipse cx="50" cy="62" rx="18" ry="14" fill="#FFCC80" opacity="0.6"/>}
        <circle cx="38" cy="50" r="5" fill="white"/>
        <circle cx="62" cy="50" r="5" fill="white"/>
        <circle cx="39" cy="51" r="3" fill="#111"/>
        <circle cx="63" cy="51" r="3" fill="#111"/>
        <circle cx="40" cy="49" r="1" fill="white"/>
        <circle cx="64" cy="49" r="1" fill="white"/>
        <circle cx="34" cy="58" r="6" fill="#F8BBD0" opacity="0.3"/>
        <circle cx="66" cy="58" r="6" fill="#F8BBD0" opacity="0.3"/>
        <ellipse cx="50" cy="61" rx="3" ry="2" fill={isMonkey ? "#5D4037" : "#F48FB1"}/>
        <path d="M46,64 Q50,68 54,64" stroke={dark} strokeWidth="1" fill="none" opacity="0.4"/>
        {id === "hamster" && <>
          <ellipse cx="32" cy="56" rx="8" ry="6" fill={fill} opacity="0.5"/>
          <ellipse cx="68" cy="56" rx="8" ry="6" fill={fill} opacity="0.5"/>
        </>}
      </svg>
    );
  }
  // Tiny (butterfly, bee, ladybug, frog, bat, snail)
  if (species === "Tiny") {
    const isBee = id === "bee";
    const isButterfly = id === "butterfly";
    const isFrog = id === "frog";
    const isBat = id === "bat";
    if (isFrog) {
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="33" cy="30" r="12" fill={fill} stroke={dark} strokeWidth="2"/>
          <circle cx="67" cy="30" r="12" fill={fill} stroke={dark} strokeWidth="2"/>
          <circle cx="33" cy="29" r="6" fill="white"/>
          <circle cx="67" cy="29" r="6" fill="white"/>
          <circle cx="34" cy="30" r="3.5" fill="#111"/>
          <circle cx="68" cy="30" r="3.5" fill="#111"/>
          <ellipse cx="50" cy="58" rx="32" ry="24" fill={fill} stroke={dark} strokeWidth="2"/>
          <path d="M32,62 Q50,75 68,62" stroke={dark} strokeWidth="2" fill="none" opacity="0.4"/>
          <circle cx="36" cy="56" r="5" fill="#E8F5E9" opacity="0.4"/>
          <circle cx="64" cy="56" r="5" fill="#E8F5E9" opacity="0.4"/>
        </svg>
      );
    }
    if (isButterfly) {
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <ellipse cx="28" cy="38" rx="20" ry="18" fill={fill} stroke={dark} strokeWidth="1.5" opacity="0.7"/>
          <ellipse cx="72" cy="38" rx="20" ry="18" fill={fill} stroke={dark} strokeWidth="1.5" opacity="0.7"/>
          <ellipse cx="32" cy="65" rx="14" ry="12" fill={fill} stroke={dark} strokeWidth="1.5" opacity="0.5"/>
          <ellipse cx="68" cy="65" rx="14" ry="12" fill={fill} stroke={dark} strokeWidth="1.5" opacity="0.5"/>
          <circle cx="28" cy="38" r="5" fill="white" opacity="0.4"/>
          <circle cx="72" cy="38" r="5" fill="white" opacity="0.4"/>
          <ellipse cx="50" cy="50" rx="6" ry="28" fill={dark} opacity="0.7"/>
          <circle cx="47" cy="24" r="3" fill="#111"/>
          <circle cx="53" cy="24" r="3" fill="#111"/>
          <line x1="45" y1="22" x2="38" y2="10" stroke={dark} strokeWidth="1.5"/>
          <line x1="55" y1="22" x2="62" y2="10" stroke={dark} strokeWidth="1.5"/>
          <circle cx="38" cy="9" r="2" fill={dark}/>
          <circle cx="62" cy="9" r="2" fill={dark}/>
        </svg>
      );
    }
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {isBat && <>
          <path d="M10,40 Q5,25 25,30 Q20,20 40,28 L50,35 L60,28 Q80,20 75,30 Q95,25 90,40 L50,50Z" fill={fill} stroke={dark} strokeWidth="1.5"/>
        </>}
        <circle cx="50" cy={isBat ? 55 : 52} r={isBat ? 18 : 26} fill={fill} stroke={dark} strokeWidth="2"/>
        {isBee && <>
          <line x1="28" y1="45" x2="72" y2="45" stroke="#333" strokeWidth="3" opacity="0.4"/>
          <line x1="30" y1="55" x2="70" y2="55" stroke="#333" strokeWidth="3" opacity="0.4"/>
          <line x1="32" y1="65" x2="68" y2="65" stroke="#333" strokeWidth="3" opacity="0.4"/>
        </>}
        {id === "ladybug" && <>
          <line x1="50" y1="28" x2="50" y2="78" stroke="#111" strokeWidth="2"/>
          <circle cx="38" cy="45" r="4" fill="#111" opacity="0.6"/>
          <circle cx="60" cy="55" r="3.5" fill="#111" opacity="0.6"/>
          <circle cx="40" cy="65" r="3" fill="#111" opacity="0.6"/>
        </>}
        {id === "snail" && <ellipse cx="65" cy="65" rx="20" ry="18" fill="#BCAAA4" stroke={dark} strokeWidth="2"/>}
        <circle cx={isBat?44:40} cy={isBat?52:48} r={isBat?3:4.5} fill="white"/>
        <circle cx={isBat?56:60} cy={isBat?52:48} r={isBat?3:4.5} fill="white"/>
        <circle cx={isBat?45:41} cy={isBat?53:49} r={isBat?2:3} fill="#111"/>
        <circle cx={isBat?57:61} cy={isBat?53:49} r={isBat?2:3} fill="#111"/>
        <path d={`M${isBat?47:45},${isBat?59:58} Q50,${isBat?62:62} ${isBat?53:55},${isBat?59:58}`} stroke={dark} strokeWidth="1" fill="none" opacity="0.4"/>
      </svg>
    );
  }
  // Fallback: just emoji in circle
  return null;
}

function AvatarDisplay({ emoji, bodyColor, size = 42, animalId }) {
  const c = COLOR_OPTIONS.find(c => c.id === bodyColor) || COLOR_OPTIONS[0];
  const isRainbow = bodyColor === "rainbow";
  const av = animalId ? AVATARS.find(a => a.id === animalId) : null;
  const isAnimal = av?.category === "animal";

  // Use SVG for animals
  if (isAnimal) {
    const svgFace = AnimalFace({ animalId, bodyColor: bodyColor || "none", size });
    if (svgFace) return svgFace;
  }

  // Emoji fallback for characters
  return (
    <div style={{
      fontSize: size * 0.55, width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: c.bg === "transparent" ? "rgba(255,255,255,0.3)" : isRainbow ? c.bg : c.bg,
      border: `2px solid ${c.ring}`,
      boxShadow: bodyColor !== "none" ? `0 2px 8px ${c.ring}44` : "none",
      flexShrink: 0,
    }}>{emoji}</div>
  );
}

function AvatarSelect({ onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [tab, setTab] = useState("character");
  const [animalSpecies, setAnimalSpecies] = useState("Cats");
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedColor, setSelectedColor] = useState("none");

  const animals = AVATARS.filter(a => a.category === "animal");
  const speciesList = [...new Set(animals.map(a => a.species))];
  const speciesEmojis = { Cats: "🐱", Dogs: "🐶", Wild: "🦁", Cute: "🐰", Fantasy: "🐲", Birds: "🦅", Ocean: "🐬", Tiny: "🦋" };

  const filtered = tab === "character"
    ? AVATARS.filter(a => a.category === "character")
    : animals.filter(a => a.species === animalSpecies);

  // Step 2: colour picker
  if (selectedAvatar) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)", fontFamily: "'Quicksand', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 20, overflowY: "auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes floatIn { from { transform: translateY(30px) scale(0.8); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } } @keyframes bobble { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>

        <div style={{ animation: "floatIn 0.5s ease-out", textAlign: "center", marginTop: 10, marginBottom: 8 }}>
          <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#4E342E", margin: "0 0 4px" }}>Choose your colour!</h2>
          <p style={{ color: "#6D4C41", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>Pick a colour for {selectedAvatar.name}</p>
        </div>

        {/* Preview */}
        <div style={{ animation: "floatIn 0.5s ease-out 0.1s both, bobble 2s ease-in-out infinite", marginBottom: 16 }}>
          <AvatarDisplay emoji={selectedAvatar.emoji} bodyColor={selectedColor} size={90} animalId={selectedAvatar.id} />
        </div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: selectedAvatar.color, marginBottom: 4 }}>
          {selectedColor !== "none" ? `${COLOR_OPTIONS.find(c => c.id === selectedColor)?.name} ` : ""}{selectedAvatar.name}
        </div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#8D6E63", marginBottom: 16 }}>
          {playerName || "Adventurer"}
        </div>

        {/* Colour grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
          maxWidth: 360, width: "100%", animation: "floatIn 0.5s ease-out 0.15s both",
        }}>
          {COLOR_OPTIONS.map((c, i) => {
            const isSelected = selectedColor === c.id;
            const isRainbow = c.id === "rainbow";
            return (
              <div key={c.id} onClick={() => setSelectedColor(c.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "10px 4px 8px", borderRadius: 14, cursor: "pointer",
                  background: isSelected ? `${c.ring}22` : "rgba(255,255,255,0.6)",
                  border: `3px solid ${isSelected ? c.ring : "transparent"}`,
                  transition: "all 0.2s",
                  transform: isSelected ? "scale(1.08)" : "scale(1)",
                  animation: `floatIn 0.3s ease-out ${0.15 + i * 0.02}s both`,
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: isRainbow ? c.bg : c.bg === "transparent" ? "repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 12px 12px" : c.bg,
                  border: `2px solid ${c.ring}`,
                  boxShadow: isSelected ? `0 0 12px ${c.ring}66` : "0 1px 4px rgba(0,0,0,0.1)",
                }} />
                <span style={{
                  fontFamily: "'Fredoka', sans-serif", fontSize: "0.6rem", fontWeight: 600,
                  color: isSelected ? c.ring : "#8D6E63",
                }}>{c.name}</span>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, animation: "floatIn 0.5s ease-out 0.3s both" }}>
          <button onClick={() => setSelectedAvatar(null)} style={{
            fontFamily: "'Fredoka', sans-serif", fontSize: "0.9rem", fontWeight: 700,
            padding: "10px 20px", borderRadius: 14, cursor: "pointer",
            background: "rgba(255,255,255,0.7)", border: "2px solid #BDBDBD", color: "#757575",
          }}>← Back</button>
          <button onClick={() => onSelect({ ...selectedAvatar, bodyColor: selectedColor, playerName: playerName.trim() || "Adventurer" })} style={{
            fontFamily: "'Fredoka', sans-serif", fontSize: "0.9rem", fontWeight: 700,
            padding: "10px 28px", borderRadius: 14, cursor: "pointer",
            background: `linear-gradient(135deg, ${selectedAvatar.color}, ${selectedAvatar.color}cc)`,
            border: "none", color: "white",
            boxShadow: `0 4px 12px ${selectedAvatar.color}44`,
          }}>Let's Go! 🍪</button>
        </div>
      </div>
    );
  }

  // Step 1: pick avatar
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)", fontFamily: "'Quicksand', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 20, overflowY: "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes floatIn { from { transform: translateY(30px) scale(0.8); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } } @keyframes bobble { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>

      <div style={{ animation: "floatIn 0.6s ease-out", textAlign: "center", marginBottom: 6, marginTop: 10 }}>
        <div style={{ fontSize: "3rem", animation: "bobble 2s ease-in-out infinite" }}>🍪</div>
        <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "2rem", fontWeight: 700, color: "#4E342E", margin: "6px 0 2px" }}>Biscuit Quest</h1>
        <p style={{ color: "#6D4C41", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>Choose your adventurer!</p>
      </div>

      <div style={{ margin: "12px 0", animation: "floatIn 0.6s ease-out 0.1s both" }}>
        <input type="text" placeholder="Type your name..." value={playerName} onChange={e => setPlayerName(e.target.value)} maxLength={16}
          style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.1rem", padding: "10px 20px", borderRadius: 14, border: "3px solid #FFB74D", background: "rgba(255,255,255,0.85)", color: "#4E342E", textAlign: "center", outline: "none", width: 220, fontWeight: 600 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, animation: "floatIn 0.6s ease-out 0.15s both" }}>
        {[
          { id: "character", label: "🧑 Characters", color: "#7E57C2" },
          { id: "animal", label: "🐾 Animals", color: "#FF9800" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: "'Fredoka', sans-serif", fontSize: "0.9rem", fontWeight: 700,
            padding: "8px 20px", borderRadius: 14, cursor: "pointer",
            border: tab === t.id ? `3px solid ${t.color}` : "3px solid transparent",
            background: tab === t.id ? `${t.color}22` : "rgba(255,255,255,0.6)",
            color: tab === t.id ? t.color : "#8D6E63", transition: "all 0.2s",
            transform: tab === t.id ? "scale(1.05)" : "scale(1)",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Animal species sub-tabs */}
      {tab === "animal" && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, justifyContent: "center",
          maxWidth: 440, animation: "floatIn 0.4s ease-out 0.18s both",
        }}>
          {speciesList.map(sp => (
            <button key={sp} onClick={() => setAnimalSpecies(sp)} style={{
              fontFamily: "'Fredoka', sans-serif", fontSize: "0.72rem", fontWeight: 700,
              padding: "5px 12px", borderRadius: 10, cursor: "pointer",
              border: animalSpecies === sp ? "2px solid #FF9800" : "2px solid transparent",
              background: animalSpecies === sp ? "#FFF3E0" : "rgba(255,255,255,0.5)",
              color: animalSpecies === sp ? "#E65100" : "#8D6E63",
              transition: "all 0.2s",
            }}>{speciesEmojis[sp] || "🐾"} {sp}</button>
          ))}
        </div>
      )}

      {/* Avatar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 440, width: "100%", animation: "floatIn 0.5s ease-out 0.2s both" }}>
        {filtered.map((av, i) => (
          <div key={av.id} onClick={() => setSelectedAvatar(av)}
            onMouseEnter={() => setHoveredId(av.id)} onMouseLeave={() => setHoveredId(null)}
            style={{
              background: hoveredId === av.id ? `linear-gradient(135deg, ${av.color}22, ${av.color}44)` : "rgba(255,255,255,0.7)",
              border: `3px solid ${hoveredId === av.id ? av.color : "transparent"}`, borderRadius: 16,
              padding: "12px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", transition: "all 0.2s",
              transform: hoveredId === av.id ? "scale(1.08) translateY(-4px)" : "scale(1)",
              animation: `floatIn 0.3s ease-out ${0.2 + i * 0.03}s both`,
            }}>
            {av.category === "animal"
              ? <AvatarDisplay emoji={av.emoji} bodyColor="none" size={48} animalId={av.id} />
              : <span style={{ fontSize: "2rem" }}>{av.emoji}</span>
            }
            <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "0.65rem", fontWeight: 600, color: hoveredId === av.id ? av.color : "#6D4C41" }}>{av.name}</span>
          </div>
        ))}
      </div>

      <p style={{ color: "#A1887F", fontSize: "0.78rem", marginTop: 16, fontWeight: 600 }}>
        {tab === "character" ? "Pick a character, then choose a colour!" : `Browsing ${animalSpecies} — pick a breed!`}
      </p>
    </div>
  );
}

function EvolutionScreen({ creature, oldStage, newStage, color, onDone }) {
  const [phase, setPhase] = useState("old");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("flash"), 1200);
    const t2 = setTimeout(() => setPhase("new"), 2200);
    const t3 = setTimeout(onDone, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: phase === "flash" ? `radial-gradient(circle, white 0%, ${color} 40%, #1a1a2e 80%)` : "linear-gradient(180deg, #1a1a2e 0%, #0f3460 50%, #1a1a2e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Quicksand', sans-serif", transition: "background 0.5s" }}>
      <style>{`
        @keyframes evoPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); filter: brightness(1.3); } }
        @keyframes evoSpin { from { transform: rotate(0) scale(1); } 50% { transform: rotate(180deg) scale(0.3); } to { transform: rotate(360deg) scale(1); } }
        @keyframes evoReveal { from { transform: scale(0) rotate(-180deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes evoStars { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-80px) scale(0.3); opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      {phase === "old" && <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#FFD54F", marginBottom: 20, animation: "slideUp 0.5s ease-out" }}>What's happening...?!</div>
        <div style={{ fontSize: "5rem", animation: "evoPulse 0.8s ease-in-out infinite", filter: `drop-shadow(0 0 30px ${color})` }}>{oldStage.emoji}</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.1rem", fontWeight: 700, color, marginTop: 12 }}>{oldStage.name} is evolving!</div>
      </div>}
      {phase === "flash" && <div style={{ fontSize: "5rem", animation: "evoSpin 1s ease-in-out" }}>✨</div>}
      {phase === "new" && <div style={{ textAlign: "center", animation: "slideUp 0.6s ease-out" }}>
        {[...Array(12)].map((_, i) => <div key={i} style={{ position: "absolute", left: `${20 + Math.random() * 60}%`, top: `${30 + Math.random() * 40}%`, fontSize: "1.5rem", animation: `evoStars 1.5s ease-out ${i * 0.15}s infinite` }}>{["✨", "⭐", "🌟", "💫", "🎆"][i % 5]}</div>)}
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#FFD54F", marginBottom: 16 }}>🎉 EVOLVED! 🎉</div>
        <div style={{ fontSize: "6rem", animation: "evoReveal 0.8s ease-out", filter: `drop-shadow(0 0 40px ${color})` }}>{newStage.emoji}</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.5rem", fontWeight: 700, color, marginTop: 12 }}>{newStage.name}</div>
        <div style={{ fontSize: "0.85rem", color: "#ccc", marginTop: 8, fontStyle: "italic" }}>"{newStage.saying}"</div>
      </div>}
    </div>
  );
}

function FloatingBiscuit({ biscuit, onClick, style }) {
  return (
    <div onClick={onClick} style={{
      position: "absolute", fontSize: "2.2rem", cursor: "pointer",
      animation: "bobble 2s ease-in-out infinite",
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
      transition: "transform 0.15s", userSelect: "none", zIndex: 5, ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.4)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >{biscuit.emoji}</div>
  );
}

function EnemyOnField({ enemy, onClick, style }) {
  const [secsLeft, setSecsLeft] = useState(60);
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (enemy.spawnTime || Date.now())) / 1000);
      setSecsLeft(Math.max(0, 60 - elapsed));
    }, 500);
    return () => clearInterval(id);
  }, [enemy.spawnTime]);

  const urgent = secsLeft <= 15;
  const critical = secsLeft <= 5;

  return (
    <div onClick={onClick} style={{
      position: "absolute", fontSize: "2.4rem", cursor: "pointer",
      animation: critical ? "battleShake 0.4s ease-in-out infinite" : "enemyWobble 1s ease-in-out infinite",
      filter: `drop-shadow(0 4px 12px rgba(200,0,0,${urgent ? "0.7" : "0.4"}))`,
      transition: "transform 0.15s", userSelect: "none", zIndex: 8, ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {enemy.emoji}
      <div style={{
        position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
        background: critical ? "rgba(255,0,0,0.95)" : urgent ? "rgba(255,100,0,0.9)" : "rgba(200,0,0,0.85)",
        color: "white", borderRadius: 6,
        padding: "1px 6px", fontSize: "0.5rem", fontWeight: 800, whiteSpace: "nowrap",
        fontFamily: "'Fredoka', sans-serif",
        animation: urgent ? "pulse 0.5s ease-in-out infinite" : "none",
      }}>
        ⚔️ {secsLeft}s
      </div>
      {/* Timer bar under enemy */}
      <div style={{
        position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
        width: 36, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.3)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 2, transition: "width 0.5s",
          background: critical ? "#FF1744" : urgent ? "#FF9100" : "#4CAF50",
          width: `${(secsLeft / 60) * 100}%`,
        }} />
      </div>
    </div>
  );
}

function SickScreen({ creature, creatureData, onSummonBoss }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "linear-gradient(180deg, #1b0a2e 0%, #2d1045 50%, #1b0a2e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Quicksand', sans-serif", padding: 20 }}>
      <style>{`
        @keyframes sickPulse { 0%, 100% { filter: hue-rotate(0deg) brightness(0.8); } 50% { filter: hue-rotate(80deg) brightness(0.5); } }
        @keyframes poisonDrip { 0% { transform: translateY(-5px); opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#CE93D8", marginBottom: 8, animation: "slideUp 0.5s ease-out" }}>☠️ OH NO! ☠️</div>
      <div style={{ fontSize: "1rem", color: "#EF9A9A", marginBottom: 20, textAlign: "center", animation: "slideUp 0.5s ease-out 0.1s both" }}>
        {creatureData.name} ate a corrupted biscuit and got sick!
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: "5rem", animation: "sickPulse 1.5s ease-in-out infinite" }}>{creatureData.emoji}</div>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: `${20 + i * 15}%`, top: 0, fontSize: "1rem", animation: `poisonDrip 1.5s ease-in ${i * 0.3}s infinite`, color: "#76FF03" }}>☠️</div>
        ))}
      </div>
      <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1rem", fontWeight: 600, color: "#A5D6A7", marginTop: 16, textAlign: "center", animation: "slideUp 0.5s ease-out 0.3s both" }}>
        Only a healing potion can save them!<br />Defeat the boss to get one!
      </div>
      <button onClick={onSummonBoss} style={{
        marginTop: 24, background: "linear-gradient(135deg, #7B1FA2, #E040FB)", color: "white",
        border: "none", borderRadius: 18, padding: "16px 40px", fontFamily: "'Fredoka', sans-serif",
        fontSize: "1.2rem", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 20px rgba(224,64,251,0.5)", animation: "slideUp 0.5s ease-out 0.5s both",
      }}>⚔️ FIGHT THE BOSS! ⚔️</button>
    </div>
  );
}

function BattleScreen({ enemy, avatar, onWin, onLose, isBoss }) {
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const playerMaxHp = isBoss ? 8 : 5;
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [attackEffect, setAttackEffect] = useState(null);
  const [enemyAttackEffect, setEnemyAttackEffect] = useState(null);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [battleLog, setBattleLog] = useState([`${enemy.name} appeared! "${enemy.taunt}"`]);
  const enemyTimerRef = useRef(null);
  const battleOverRef = useRef(false);

  const atkSpeed = isBoss ? (enemy.attackSpeed || 2000) : (1800 + Math.random() * 1200);

  useEffect(() => {
    const enemyAttack = () => {
      if (battleOverRef.current) return;
      setShakePlayer(true); setEnemyAttackEffect("💥");
      setBattleLog(prev => [...prev.slice(-3), `${enemy.name} attacks you!`]);
      setPlayerHp(prev => {
        const dmg = isBoss ? (Math.random() < 0.3 ? 2 : 1) : 1;
        const next = prev - dmg;
        if (next <= 0) { battleOverRef.current = true; setTimeout(() => onLose(enemy), 800); }
        return Math.max(0, next);
      });
      setTimeout(() => { setShakePlayer(false); setEnemyAttackEffect(null); }, 400);
      if (!battleOverRef.current) enemyTimerRef.current = setTimeout(enemyAttack, isBoss ? (enemy.attackSpeed || 2000) : (1800 + Math.random() * 1200));
    };
    enemyTimerRef.current = setTimeout(enemyAttack, isBoss ? 1500 : (2000 + Math.random() * 1000));
    return () => clearTimeout(enemyTimerRef.current);
  }, [enemy, onLose, isBoss]);

  const attackEnemy = () => {
    if (battleOverRef.current) return;
    const word = ATTACK_WORDS[Math.floor(Math.random() * ATTACK_WORDS.length)];
    setAttackEffect(word); setShakeEnemy(true);
    setBattleLog(prev => [...prev.slice(-3), `You hit ${enemy.name}! ${word}`]);
    setEnemyHp(prev => {
      const next = prev - 1;
      if (next <= 0) { battleOverRef.current = true; clearTimeout(enemyTimerRef.current); setTimeout(() => onWin(enemy), 600); }
      return next;
    });
    setTimeout(() => { setAttackEffect(null); setShakeEnemy(false); }, 350);
  };

  const eHp = Math.max(0, (enemyHp / enemy.hp) * 100);
  const pHp = Math.max(0, (playerHp / playerMaxHp) * 100);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: isBoss
        ? "linear-gradient(180deg, #2d0a0a 0%, #4a0e0e 30%, #1a0505 100%)"
        : "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Quicksand', sans-serif", padding: 20,
    }}>
      <div style={{
        fontFamily: "'Fredoka', sans-serif", fontSize: isBoss ? "1.8rem" : "1.6rem", fontWeight: 700,
        color: isBoss ? "#FF1744" : "#FF6B6B", marginBottom: 20,
        textShadow: isBoss ? "0 0 30px rgba(255,23,68,0.7)" : "0 0 20px rgba(255,107,107,0.5)",
        animation: "pulse 2s ease-in-out infinite",
      }}>{isBoss ? "👑 BOSS BATTLE! 👑" : "⚔️ BATTLE! ⚔️"}</div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          fontSize: isBoss ? "5.5rem" : "4.5rem",
          animation: shakeEnemy ? "battleShake 0.3s" : "enemyWobble 2s ease-in-out infinite",
          filter: enemyHp <= 0 ? "grayscale(1) opacity(0.5)" : isBoss ? `drop-shadow(0 0 30px ${enemy.color})` : "drop-shadow(0 0 20px rgba(255,0,0,0.3))",
        }}>{enemy.emoji}</div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: enemy.color, marginTop: 4 }}>
          {enemy.name} {isBoss && "👑"}
        </div>
        <div style={{ width: 200, height: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8, margin: "6px auto", overflow: "hidden", border: isBoss ? "2px solid #FF1744" : "2px solid rgba(255,255,255,0.2)" }}>
          <div style={{ height: "100%", borderRadius: 6, background: eHp > 50 ? "linear-gradient(90deg, #66BB6A, #43A047)" : eHp > 25 ? "linear-gradient(90deg, #FFA726, #FF9800)" : "linear-gradient(90deg, #EF5350, #D32F2F)", width: `${eHp}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: "0.7rem", color: "#aaa" }}>HP: {Math.max(0, enemyHp)}/{enemy.hp}</div>
        {attackEffect && <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#FFD54F", fontFamily: "'Fredoka', sans-serif", animation: "attackPop 0.35s ease-out forwards" }}>{attackEffect}</div>}
      </div>

      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFD54F", fontFamily: "'Fredoka', sans-serif", margin: "0 0 16px" }}>VS</div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: "3.5rem", animation: shakePlayer ? "battleShake 0.3s" : "bobble 2s ease-in-out infinite", display: "flex", justifyContent: "center" }}>
          <AvatarDisplay emoji={avatar?.emoji || "🧑"} bodyColor={avatar?.bodyColor || "none"} size={70} animalId={avatar?.id} />
        </div>
        <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1rem", fontWeight: 700, color: avatar?.color || "#fff", marginTop: 4 }}>{avatar?.playerName || "You"}</div>
        <div style={{ width: 200, height: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8, margin: "6px auto", overflow: "hidden", border: "2px solid rgba(255,255,255,0.2)" }}>
          <div style={{ height: "100%", borderRadius: 6, background: pHp > 50 ? "linear-gradient(90deg, #4FC3F7, #29B6F6)" : pHp > 25 ? "linear-gradient(90deg, #FFA726, #FF9800)" : "linear-gradient(90deg, #EF5350, #D32F2F)", width: `${pHp}%`, transition: "width 0.3s" }} />
        </div>
        <div style={{ fontSize: "0.7rem", color: "#aaa" }}>HP: {Math.max(0, playerHp)}/{playerMaxHp}</div>
        {enemyAttackEffect && <div style={{ fontSize: "1.5rem", animation: "attackPop 0.35s ease-out forwards" }}>{enemyAttackEffect}</div>}
      </div>

      <button onClick={attackEnemy} style={{
        background: isBoss ? "linear-gradient(135deg, #FF1744, #D50000)" : "linear-gradient(135deg, #FF6B6B, #EE5A24)",
        color: "white", border: "none", borderRadius: 18, padding: "16px 48px",
        fontFamily: "'Fredoka', sans-serif", fontSize: "1.3rem", fontWeight: 700, cursor: "pointer",
        boxShadow: isBoss ? "0 4px 25px rgba(255,23,68,0.6)" : "0 4px 20px rgba(238,90,36,0.5)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.92)"}
        onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >⚔️ ATTACK! ⚔️</button>
      <div style={{ fontSize: "0.7rem", color: "#888", marginTop: 8 }}>
        {isBoss ? "Tap FAST! The boss hits hard!" : "Tap fast to defeat the enemy!"}
      </div>

      <div style={{ marginTop: 16, maxWidth: 320, width: "100%", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "8px 12px" }}>
        {battleLog.slice(-3).map((log, i) => (
          <div key={i} style={{ fontSize: "0.72rem", color: i === battleLog.slice(-3).length - 1 ? "#FFD54F" : "#999", fontWeight: i === battleLog.slice(-3).length - 1 ? 700 : 400, padding: "2px 0" }}>{log}</div>
        ))}
      </div>
    </div>
  );
}

function CreatureCard({ creature, fedCount, onFeed, inventory, isSick, potions, onHeal }) {
  const data = getCreatureData(creature.type, fedCount);
  const stage = getCreatureStage(fedCount);
  const heartsInStage = getHeartsInCurrentStage(fedCount);
  const maxed = isMaxEvolution(fedCount);
  const hasCorrectBiscuit = (inventory[creature.needs] || 0) > 0;
  const hasCorrupted = (inventory[`corrupted_${creature.needs}`] || 0) > 0;
  const hasBiscuit = hasCorrectBiscuit || hasCorrupted;
  const hearts = maxed ? "⭐⭐⭐⭐⭐" : "❤️".repeat(heartsInStage) + "🤍".repeat(HEARTS_PER_STAGE - heartsInStage);
  const canFeed = hasBiscuit && !maxed && !isSick;
  const canHeal = isSick && potions > 0;

  return (
    <div style={{
      background: isSick ? "linear-gradient(135deg, #E8F5E9, #C8E6C9)" : creature.bg,
      borderRadius: 20, padding: "18px 16px",
      border: `3px solid ${isSick ? "#76FF03" : stage === 2 ? "#FFD700" : creature.color}`,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      position: "relative", overflow: "hidden", transition: "all 0.3s",
      cursor: canFeed || canHeal ? "pointer" : "default",
      boxShadow: isSick ? "0 0 20px rgba(118,255,3,0.4)" : stage === 2 ? `0 0 25px #FFD70066` : "0 2px 8px rgba(0,0,0,0.08)",
      filter: isSick ? "saturate(0.5)" : "none",
    }}
      onClick={() => {
        if (canHeal) onHeal(creature);
        else if (canFeed) onFeed(creature);
      }}
      onMouseEnter={e => { if (canFeed || canHeal) e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {/* Badges */}
      {isSick ? (
        <div style={{ position: "absolute", top: 6, right: 8, fontSize: "0.6rem", background: "#76FF03", color: "#1B5E20", borderRadius: 8, padding: "2px 6px", fontWeight: 800, fontFamily: "'Fredoka', sans-serif", animation: "pulse 1s ease-in-out infinite" }}>☠️ SICK</div>
      ) : (
        <div style={{ position: "absolute", top: 6, right: 8, fontSize: "0.6rem", background: stage === 2 ? "linear-gradient(135deg, #FFD700, #FFA000)" : stage === 1 ? creature.color : "#BDBDBD", color: "white", borderRadius: 8, padding: "2px 6px", fontWeight: 800, fontFamily: "'Fredoka', sans-serif" }}>{maxed ? "MAX ✨" : STAGE_NAMES[stage]}</div>
      )}

      <div style={{
        fontSize: stage === 2 ? "3.3rem" : "3rem",
        animation: isSick ? "sickWobble 2s ease-in-out infinite" : maxed ? "wiggle 0.5s ease-in-out infinite" : fedCount > 0 ? "bobble 3s ease-in-out infinite" : "none",
        filter: isSick ? "hue-rotate(80deg) brightness(0.7)" : stage === 2 ? `drop-shadow(0 0 12px ${creature.color})` : "none",
      }}>{data.emoji}</div>

      <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: isSick ? "#4CAF50" : creature.color }}>
        {data.name}
      </div>

      <div style={{ fontSize: "0.75rem", letterSpacing: 1 }}>{isSick ? "💚💚💚💚💚" : hearts}</div>

      {!maxed && !isSick && (
        <div style={{ width: "90%", height: 6, background: "rgba(0,0,0,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, transition: "width 0.3s", background: `linear-gradient(90deg, ${creature.color}, ${creature.color}cc)`, width: `${(heartsInStage / HEARTS_PER_STAGE) * 100}%` }} />
        </div>
      )}

      <div style={{ fontSize: "0.65rem", color: isSick ? "#2E7D32" : "#666", fontStyle: "italic", textAlign: "center", fontFamily: "'Quicksand', sans-serif", lineHeight: 1.3 }}>
        {isSick ? "I feel terrible... I need a potion... 🤢" : maxed ? "Fully evolved! 🏆" : heartsInStage >= 4 ? "Almost evolving! 🔮" : data.saying}
      </div>

      {canHeal && (
        <div style={{ fontSize: "0.7rem", background: "linear-gradient(135deg, #7B1FA2, #E040FB)", color: "white", borderRadius: 10, padding: "4px 12px", fontWeight: 700, fontFamily: "'Fredoka', sans-serif", animation: "pulse 1s ease-in-out infinite" }}>
          🧪 USE POTION!
        </div>
      )}
      {canFeed && !isSick && (
        <div style={{ fontSize: "0.7rem", background: creature.color, color: "white", borderRadius: 10, padding: "4px 12px", fontWeight: 700, fontFamily: "'Fredoka', sans-serif", animation: "pulse 1.5s ease-in-out infinite" }}>
          {hasCorrupted && !hasCorrectBiscuit ? "⚠️ FEED (corrupted?)" : "TAP TO FEED! 🍪"}
        </div>
      )}
    </div>
  );
}

// ─── MAIN GAME ──────────────────────────────────────────

export default function BiscuitQuest() {
  const [screen, setScreen] = useState("avatar");
  const [avatar, setAvatar] = useState(null);
  const [inventory, setInventory] = useState({});
  const [fedCounts, setFedCounts] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);
  const [floatingBiscuits, setFloatingBiscuits] = useState([]);
  const [collectAnimation, setCollectAnimation] = useState(null);
  const [totalCollected, setTotalCollected] = useState(0);
  const [message, setMessage] = useState("");
  const [enemies, setEnemies] = useState([]);
  const [activeBattle, setActiveBattle] = useState(null);
  const [isBossBattle, setIsBossBattle] = useState(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [stolenBiscuits, setStolenBiscuits] = useState(0);
  const [evolution, setEvolution] = useState(null);
  const [sickCreatures, setSickCreatures] = useState({});
  const [potions, setPotions] = useState(0);
  const [sickScreen, setSickScreen] = useState(null);
  const [corruptedInWorld, setCorruptedInWorld] = useState([]);
  const timerRef = useRef(null);
  const enemySpawnRef = useRef(null);
  const music = useMusic();

  // Music mode switching with time-of-day
  const timeForMusic = useTimeOfDay();
  useEffect(() => {
    if (activeBattle) music.setMode("battle");
    else if (screen === "exploring") music.setMode("exploring", timeForMusic.phase);
    else music.setMode("home", timeForMusic.phase);
  }, [screen, activeBattle, timeForMusic.phase, music.setMode]);

  const allMaxed = CREATURES.every(c => isMaxEvolution(fedCounts[c.id] || 0));
  const inventoryCount = Object.values(inventory).reduce((a, b) => a + b, 0);
  const totalEvolutions = CREATURES.reduce((sum, c) => sum + getCreatureStage(fedCounts[c.id] || 0), 0);
  const sickCount = Object.values(sickCreatures).filter(Boolean).length;

  const spawnBiscuits = useCallback((location) => {
    const biscuits = [];
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const type = location.biscuits[Math.floor(Math.random() * location.biscuits.length)];
      const biscuit = BISCUIT_TYPES.find(b => b.id === type);
      biscuits.push({ ...biscuit, key: `${Date.now()}-${i}`, x: 10 + Math.random() * 75, y: 15 + Math.random() * 55, delay: Math.random() * 2, corrupted: false });
    }
    setFloatingBiscuits(biscuits);
  }, []);

  // Enemies spawn
  useEffect(() => {
    if (screen === "exploring" && currentLocation) {
      const spawnEnemy = () => {
        const locEnemies = currentLocation.enemies;
        const enemyId = locEnemies[Math.floor(Math.random() * locEnemies.length)];
        setEnemies(prev => [...prev.slice(-2), { ...ENEMIES[enemyId], id: enemyId, key: `enemy-${Date.now()}`, x: 5 + Math.random() * 80, y: 10 + Math.random() * 60, spawnTime: Date.now() }]);
        enemySpawnRef.current = setTimeout(spawnEnemy, 5000 + Math.random() * 6000);
      };
      enemySpawnRef.current = setTimeout(spawnEnemy, 3000 + Math.random() * 2000);
      return () => clearTimeout(enemySpawnRef.current);
    }
  }, [screen, currentLocation]);

  // After 60 seconds, unfought enemies leave a corrupted biscuit and disappear
  useEffect(() => {
    if (screen === "exploring" && enemies.length > 0) {
      const checkTimer = setInterval(() => {
        const now = Date.now();
        setEnemies(prev => {
          const expired = prev.filter(e => now - e.spawnTime >= 60000);
          if (expired.length > 0) {
            expired.forEach(e => {
              // Drop a corrupted biscuit into the field
              const bType = currentLocation?.biscuits[Math.floor(Math.random() * (currentLocation?.biscuits.length || 1))] || "water";
              setFloatingBiscuits(fb => [...fb, {
                ...BISCUIT_TYPES.find(b => b.id === bType),
                key: `corrupt-${Date.now()}-${Math.random()}`,
                x: e.x, y: e.y, delay: 0, corrupted: true,
              }]);
            });
            setMessage("⚠️ An enemy left a corrupted biscuit behind! 💀");
            return prev.filter(e => now - e.spawnTime < 60000);
          }
          return prev;
        });
      }, 1000);
      return () => clearInterval(checkTimer);
    }
  }, [screen, enemies.length, currentLocation]);

  const travelTo = (location) => {
    setCurrentLocation(location); setScreen("traveling"); setEnemies([]);
    setMessage(`Traveling to ${location.name}...`);
    setTimeout(() => { setScreen("exploring"); setMessage(location.description); spawnBiscuits(location); }, 1500);
  };

  const collectBiscuit = (biscuit) => {
    if (biscuit.corrupted) {
      setInventory(prev => ({ ...prev, [`corrupted_${biscuit.id}`]: (prev[`corrupted_${biscuit.id}`] || 0) + 1 }));
    } else {
      setInventory(prev => ({ ...prev, [biscuit.id]: (prev[biscuit.id] || 0) + 1 }));
    }
    setTotalCollected(prev => prev + 1);
    setCollectAnimation({ type: biscuit.id, corrupted: biscuit.corrupted, key: Date.now() });
    setFloatingBiscuits(prev => prev.filter(b => b.key !== biscuit.key));
    setTimeout(() => setCollectAnimation(null), 600);
  };

  const startBattle = (enemy) => { setActiveBattle(enemy); setIsBossBattle(false); };

  const onBattleWin = (enemy) => {
    setActiveBattle(null);
    if (isBossBattle) {
      setBossesDefeated(prev => prev + 1);
      setPotions(prev => prev + 1);
      setMessage(`👑 You defeated ${enemy.name}! You got a Healing Potion! 🧪`);
      setIsBossBattle(false);
    } else {
      setEnemies(prev => prev.filter(e => e.key !== enemy.key));
      setEnemiesDefeated(prev => prev + 1);
      if (currentLocation) {
        const bonusType = currentLocation.biscuits[Math.floor(Math.random() * currentLocation.biscuits.length)];
        const bonusBiscuit = BISCUIT_TYPES.find(b => b.id === bonusType);
        setInventory(prev => ({ ...prev, [bonusType]: (prev[bonusType] || 0) + 1 }));
        setTotalCollected(prev => prev + 1);
        setMessage(`You defeated ${enemy.name}! They dropped a ${bonusBiscuit.name}! 🎉`);
      }
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const onBattleLose = (enemy) => {
    setActiveBattle(null);
    if (isBossBattle) {
      setMessage(`👑 ${enemy.name} was too strong! Try again when you're ready! 💪`);
      setIsBossBattle(false);
    } else {
      const stealCount = enemy.steal;
      setInventory(prev => {
        const next = { ...prev }; let stolen = 0;
        for (const key of Object.keys(next)) { if (!key.startsWith("corrupted_")) { while (next[key] > 0 && stolen < stealCount) { next[key]--; stolen++; } } }
        return next;
      });
      setStolenBiscuits(prev => prev + stealCount);
      setMessage(`${enemy.name} stole ${stealCount} biscuit${stealCount > 1 ? "s" : ""}! 😢`);
      setEnemies(prev => prev.filter(e => e.key !== enemy.key));
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const feedCreature = (creature) => {
    if (sickCreatures[creature.id] || isMaxEvolution(fedCounts[creature.id] || 0)) return;

    const hasClean = (inventory[creature.needs] || 0) > 0;
    const hasCorrupted = (inventory[`corrupted_${creature.needs}`] || 0) > 0;

    if (hasClean) {
      // Feed clean biscuit — normal
      const currentFed = fedCounts[creature.id] || 0;
      const oldStage = getCreatureStage(currentFed);
      const newFed = currentFed + 1;
      const newStage = getCreatureStage(newFed);
      setInventory(prev => ({ ...prev, [creature.needs]: prev[creature.needs] - 1 }));
      setFedCounts(prev => ({ ...prev, [creature.id]: newFed }));
      if (newStage > oldStage) {
        setEvolution({ creature, oldStage: CREATURE_STAGES[creature.type][oldStage], newStage: CREATURE_STAGES[creature.type][newStage], color: creature.color });
      } else {
        setMessage(`${getCreatureData(creature.type, newFed).name} loved that biscuit! 😋`);
        setTimeout(() => setMessage(""), 2000);
      }
    } else if (hasCorrupted) {
      // Fed corrupted biscuit — creature gets SICK!
      setInventory(prev => ({ ...prev, [`corrupted_${creature.needs}`]: prev[`corrupted_${creature.needs}`] - 1 }));
      setSickCreatures(prev => ({ ...prev, [creature.id]: true }));
      const data = getCreatureData(creature.type, fedCounts[creature.id] || 0);
      setSickScreen({ creature, creatureData: data });
    }
  };

  const healCreature = (creature) => {
    if (potions > 0 && sickCreatures[creature.id]) {
      setPotions(prev => prev - 1);
      setSickCreatures(prev => ({ ...prev, [creature.id]: false }));
      const data = getCreatureData(creature.type, fedCounts[creature.id] || 0);
      setMessage(`🧪 ${data.name} was healed! They feel much better! 💖`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const summonBoss = () => {
    setSickScreen(null);
    // Find the boss for the last visited location, or a random one
    const loc = currentLocation || LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const bossData = BOSSES[loc.boss];
    setActiveBattle({ ...bossData, key: `boss-${Date.now()}` });
    setIsBossBattle(true);
  };

  const goHome = () => { setScreen("home"); setCurrentLocation(null); setFloatingBiscuits([]); setEnemies([]); };

  useEffect(() => {
    if (screen === "exploring" && currentLocation && floatingBiscuits.length === 0) {
      timerRef.current = setTimeout(() => { spawnBiscuits(currentLocation); setMessage("More biscuits appeared! 🍪"); }, 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [screen, floatingBiscuits.length, currentLocation, spawnBiscuits]);

  if (screen === "avatar") return <AvatarSelect onSelect={(chosen) => { music.init(); setAvatar(chosen); setScreen("home"); }} />;

  return <GameView {...{ screen, avatar, inventory, fedCounts, currentLocation, floatingBiscuits,
    collectAnimation, totalCollected, message, enemies, activeBattle, isBossBattle,
    enemiesDefeated, bossesDefeated, evolution, setEvolution, sickCreatures,
    potions, sickScreen, allMaxed, inventoryCount, totalEvolutions, sickCount,
    travelTo, collectBiscuit, startBattle, onBattleWin: () => onBattleWin(activeBattle),
    onBattleLose: () => onBattleLose(activeBattle), feedCreature, healCreature, summonBoss, goHome, setMessage,
    music }} />;
}

function LocationScene({ locationId, timePhase }) {
  const n = timePhase === "night";
  const dk = timePhase === "dusk";
  const dw = timePhase === "dawn";
  const d = timePhase === "day";

  // Sky colours per time
  const skys = {
    day: { top: "#56CCF2", mid: "#87CEEB", bot: "#B0E0E6" },
    dawn: { top: "#1a1a3e", mid: "#ff7e5f", bot: "#feb47b" },
    dusk: { top: "#2c3e50", mid: "#e74c3c", bot: "#f39c12" },
    night: { top: "#050520", mid: "#0a0a2e", bot: "#1a1a3e" },
  };
  const sky = skys[timePhase];

  // Location-specific scene elements
  const scenes = {
    ocean: () => (
      <svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="osky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sky.top}/><stop offset="50%" stopColor={sky.mid}/><stop offset="100%" stopColor={sky.bot}/></linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#osky)"/>
        {/* Sun/Moon */}
        {(d || dw) && <circle cx="320" cy={d ? 50 : 80} r="25" fill="#FFD54F" opacity={dw ? 0.6 : 0.9}/>}
        {dk && <circle cx="340" cy="60" r="22" fill="#FF6F00" opacity="0.7"/>}
        {n && <><circle cx="60" cy="40" r="18" fill="#E8EAF6" opacity="0.8"/><circle cx="52" cy="36" r="18" fill={sky.top}/></>}
        {/* Stars at night */}
        {(n || dk) && [30,80,150,220,300,350,120,260].map((x,i) => <circle key={i} cx={x} cy={10+((i*17)%60)} r={n?1.5:0.8} fill="white" opacity={n?0.7:0.3}/>)}
        {/* Distant islands */}
        <ellipse cx="50" cy="180" rx="40" ry="15" fill={n?"#0d1a0d":dk?"#2a4a2a":"#2d6a4f"} opacity="0.5"/>
        <ellipse cx="350" cy="175" rx="30" ry="12" fill={n?"#0d1a0d":dk?"#2a4a2a":"#2d6a4f"} opacity="0.4"/>
        {/* Water */}
        <rect y="190" width="400" height="130" fill={n?"#0a1628":dk?"#1a3a5c":"#0077B6"} opacity="0.85"/>
        {/* Waves */}
        {[0,1,2,3,4].map(i => <path key={i} d={`M${-20+i*100},${210+i*8} Q${30+i*100},${200+i*8} ${80+i*100},${215+i*8} Q${130+i*100},${230+i*8} ${180+i*100},${212+i*8}`} stroke={n?"rgba(100,150,200,0.2)":"rgba(255,255,255,0.25)"} strokeWidth="2" fill="none"/>)}
        {/* Wave highlights */}
        {d && [50,150,280].map((x,i) => <ellipse key={i} cx={x} cy={220+i*10} rx="20" ry="2" fill="white" opacity="0.15"/>)}
        {/* Rocks */}
        <path d="M30,280 Q35,255 50,260 Q55,265 60,280Z" fill={n?"#1a2a1a":"#455A64"}/>
        <path d="M340,275 Q350,250 365,258 Q370,268 375,280Z" fill={n?"#1a2a1a":"#546E7A"}/>
        {/* Shells/coral */}
        {d && <><circle cx="45" cy="278" r="3" fill="#F48FB1" opacity="0.6"/><circle cx="355" cy="272" r="2.5" fill="#FF8A65" opacity="0.5"/></>}
        {/* Sea foam */}
        <path d="M0,285 Q50,278 100,285 Q150,292 200,283 Q250,276 300,285 Q350,292 400,282" stroke="white" strokeWidth="1.5" fill="none" opacity={n?0.1:0.3}/>
        {/* Sandy beach bottom */}
        <path d="M0,290 Q100,285 200,292 Q300,298 400,288 L400,320 L0,320Z" fill={n?"#3e2723":"#F4A261"} opacity={n?0.6:0.8}/>
      </svg>
    ),
    volcano: () => (
      <svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={n?"#1a0505":dk?"#2d0a0a":sky.top}/><stop offset="100%" stopColor={n?"#3a0a0a":"#4a0e0e"}/></linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#vsky)"/>
        {(n||dk) && [40,120,200,280,350,90,310].map((x,i) => <circle key={i} cx={x} cy={15+((i*19)%55)} r={n?1.5:0.8} fill="white" opacity={n?0.5:0.2}/>)}
        {/* Distant mountains */}
        <polygon points="0,200 60,120 120,190 180,100 240,180 300,110 360,170 400,140 400,320 0,320" fill={n?"#1a0505":"#5D4037"} opacity="0.4"/>
        {/* Main volcano */}
        <polygon points="120,280 200,60 280,280" fill={n?"#2a1010":"#6D4C41"}/>
        <polygon points="140,280 200,90 260,280" fill={n?"#3a1515":"#795548"} opacity="0.7"/>
        {/* Crater glow */}
        <ellipse cx="200" cy="70" rx="20" ry="8" fill="#FF6F00" opacity={n?0.9:0.7}/>
        <ellipse cx="200" cy="68" rx="14" ry="5" fill="#FFD54F" opacity="0.6"/>
        {/* Lava streams */}
        <path d="M195,78 Q190,140 185,200 Q183,240 180,280" stroke="#FF6F00" strokeWidth="4" fill="none" opacity={n?0.8:0.5}/>
        <path d="M205,78 Q215,130 220,200 Q222,250 225,280" stroke="#FF6F00" strokeWidth="3" fill="none" opacity={n?0.7:0.4}/>
        <path d="M200,78 Q200,160 198,280" stroke="#FFD54F" strokeWidth="2" fill="none" opacity="0.3"/>
        {/* Smoke/ash */}
        {[180,195,210,225].map((x,i) => <ellipse key={i} cx={x} cy={45-i*8} rx={10+i*5} ry={6+i*3} fill={n?"#555":"#9E9E9E"} opacity={0.2-i*0.03}/>)}
        {/* Embers floating */}
        {[50,130,270,320,170,90].map((x,i) => <circle key={i} cx={x} cy={100+((i*37)%160)} r="2" fill={n?"#FF6F00":"#FFD54F"} opacity={0.3+Math.sin(i)*0.2}/>)}
        {/* Rocky ground */}
        <path d="M0,270 Q50,260 100,268 Q200,255 300,265 Q350,270 400,260 L400,320 L0,320Z" fill={n?"#1a0a0a":"#4E342E"} opacity="0.7"/>
      </svg>
    ),
    enchanted: () => (
      <svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={n?"#051005":dk?"#1a3a1a":dw?"#2a4a2a":sky.top}/><stop offset="50%" stopColor={n?"#0a200a":"#2D6A4F"}/><stop offset="100%" stopColor={n?"#0d2d0d":"#52B788"}/></linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#fsky)"/>
        {/* Light filtering through canopy */}
        {d && [60,140,250,340].map((x,i) => <ellipse key={i} cx={x} cy={30+i*15} rx="30" ry="80" fill="#95D5B2" opacity="0.08"/>)}
        {n && [40,130,250,330].map((x,i) => <circle key={i} cx={x} cy={20+((i*23)%50)} r={1.5} fill="white" opacity="0.4"/>)}
        {/* Background trees */}
        {[30,80,140,200,260,320,370].map((x,i) => (
          <g key={i}>
            <polygon points={`${x-15},280 ${x},${140+((i*17)%40)} ${x+15},280`} fill={n?"#0a200a":dk?"#1a3a1a":"#2D6A4F"} opacity={0.5+i*0.05}/>
            <polygon points={`${x-12},260 ${x},${160+((i*13)%30)} ${x+12},260`} fill={n?"#0d2d0d":dk?"#2a4a2a":"#40916C"} opacity={0.4+i*0.04}/>
          </g>
        ))}
        {/* Foreground trees with detail */}
        {[20,110,290,380].map((x,i) => (
          <g key={`ft${i}`}>
            <rect x={x-4} y={200+i*5} width="8" height={100-i*5} fill={n?"#2a1a0a":"#5D4037"} rx="2"/>
            <polygon points={`${x-25},220 ${x},${130+i*10} ${x+25},220`} fill={n?"#0d2d0d":"#2D6A4F"}/>
            <polygon points={`${x-20},190 ${x},${140+i*8} ${x+20},190`} fill={n?"#0a3a0a":"#40916C"} opacity="0.8"/>
            <polygon points={`${x-14},165 ${x},${150+i*5} ${x+14},165`} fill={n?"#0d4a0d":"#52B788"} opacity="0.7"/>
          </g>
        ))}
        {/* Mushrooms */}
        {d && <><ellipse cx="70" cy="285" rx="8" ry="5" fill="#E53935" opacity="0.7"/><rect x="68" y="285" width="4" height="10" fill="#BCAAA4" rx="1"/><circle cx="65" cy="283" r="1.5" fill="white" opacity="0.7"/><circle cx="73" cy="282" r="1" fill="white" opacity="0.7"/></>}
        {/* Fireflies */}
        {(n||dk) && [60,130,200,270,340,90,310].map((x,i) => <circle key={i} cx={x} cy={160+((i*29)%100)} r="2.5" fill="#FFFF00" opacity={n?0.6:0.3}>
          <animate attributeName="opacity" values={`${n?0.6:0.3};${n?0.1:0.05};${n?0.6:0.3}`} dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
        </circle>)}
        {/* Path */}
        <path d="M0,300 Q100,290 200,295 Q300,300 400,288" stroke={n?"#1a1a0a":"#8D6E63"} strokeWidth="12" fill="none" opacity="0.4" strokeLinecap="round"/>
        {/* Forest floor */}
        <path d="M0,295 Q100,288 200,293 Q300,298 400,285 L400,320 L0,320Z" fill={n?"#0a150a":"#2D6A4F"} opacity="0.6"/>
      </svg>
    ),
    clouds: () => (
      <svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={n?"#0a0520":dk?"#2a1050":dw?"#4a2080":sky.top}/><stop offset="100%" stopColor={n?"#1a1040":"#E0AAFF"}/></linearGradient>
          <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="red"/><stop offset="17%" stopColor="orange"/><stop offset="33%" stopColor="yellow"/><stop offset="50%" stopColor="green"/><stop offset="67%" stopColor="blue"/><stop offset="83%" stopColor="indigo"/><stop offset="100%" stopColor="violet"/></linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#csky)"/>
        {n && [50,120,200,280,340,80,250].map((x,i) => <circle key={i} cx={x} cy={15+((i*19)%50)} r="1.5" fill="white" opacity="0.6"/>)}
        {(d||dw) && <circle cx="320" cy="50" r="22" fill="#FFD54F" opacity={dw?0.5:0.8}/>}
        {/* Large clouds as platforms */}
        {[{x:50,y:240,w:120},{x:200,y:200,w:140},{x:320,y:250,w:100},{x:100,y:160,w:100},{x:280,y:140,w:110}].map((cl,i) => (
          <g key={i}>
            <ellipse cx={cl.x} cy={cl.y} rx={cl.w/2} ry="22" fill={n?"rgba(40,40,80,0.5)":dk?"rgba(150,100,150,0.4)":"rgba(255,255,255,0.5)"}/>
            <ellipse cx={cl.x-15} cy={cl.y-12} rx={cl.w/3} ry="18" fill={n?"rgba(40,40,80,0.4)":dk?"rgba(150,100,150,0.3)":"rgba(255,255,255,0.45)"}/>
            <ellipse cx={cl.x+20} cy={cl.y-8} rx={cl.w/3.5} ry="15" fill={n?"rgba(40,40,80,0.35)":dk?"rgba(150,100,150,0.25)":"rgba(255,255,255,0.4)"}/>
          </g>
        ))}
        {/* Rainbow (day only) */}
        {d && <path d="M50,300 Q200,80 350,300" stroke="url(#rainbow)" strokeWidth="4" fill="none" opacity="0.2"/>}
        {/* Castle towers in distance */}
        <rect x="180" y="100" width="12" height="40" fill={n?"#2a2050":"#9C27B0"} opacity="0.3"/>
        <rect x="210" y="90" width="10" height="50" fill={n?"#2a2050":"#7B1FA2"} opacity="0.3"/>
        <polygon points="174,100 186,80 198,100" fill={n?"#2a2050":"#AB47BC"} opacity="0.3"/>
        <polygon points="205,90 215,72 225,90" fill={n?"#2a2050":"#9C27B0"} opacity="0.3"/>
        {/* Sparkles */}
        {[70,160,250,330,110,290].map((x,i) => <circle key={i} cx={x} cy={80+((i*31)%180)} r="2" fill={n?"#CE93D8":"#FFD54F"} opacity={0.3}>
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2+i*0.4}s`} repeatCount="indefinite"/>
        </circle>)}
      </svg>
    ),
    arctic: () => (
      <svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="asky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={n?"#050520":dk?"#1a2a40":dw?"#4a6a8a":sky.top}/><stop offset="100%" stopColor={n?"#0a1530":"#CAF0F8"}/></linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#asky)"/>
        {n && [40,110,190,270,340,70,230,310].map((x,i) => <circle key={i} cx={x} cy={10+((i*17)%55)} r="1.5" fill="white" opacity="0.7"/>)}
        {/* Aurora borealis (night/dusk) */}
        {(n||dk) && <>
          <path d="M0,30 Q100,10 200,40 Q300,20 400,35" stroke="#4FC3F7" strokeWidth="8" fill="none" opacity="0.15"/>
          <path d="M0,45 Q150,25 250,50 Q350,30 400,50" stroke="#66BB6A" strokeWidth="6" fill="none" opacity="0.12"/>
          <path d="M0,55 Q120,40 220,60 Q320,40 400,55" stroke="#CE93D8" strokeWidth="5" fill="none" opacity="0.1"/>
        </>}
        {(d||dw) && <circle cx="320" cy={dw?75:45} r="20" fill="#FFD54F" opacity={dw?0.5:0.7}/>}
        {/* Icy mountains */}
        <polygon points="0,200 50,100 100,180 150,80 200,170 250,90 300,160 350,110 400,190 400,320 0,320" fill={n?"#1a2a3a":"#ADE8F4"} opacity="0.5"/>
        <polygon points="50,200 100,120 150,190 200,100 250,180 300,110 350,190 400,150 400,320 0,320" fill={n?"#0a1a2a":"#90E0EF"} opacity="0.4"/>
        {/* Snow caps */}
        {[50,150,250,350].map((x,i) => <polygon key={i} points={`${x-8},${100+i*10} ${x},${80+i*10} ${x+8},${100+i*10}`} fill="white" opacity={n?0.3:0.7}/>)}
        {/* Frozen lake */}
        <ellipse cx="200" cy="260" rx="120" ry="25" fill={n?"#1a3a5a":"#B3E5FC"} opacity={n?0.4:0.5}/>
        <path d="M130,258 L170,262 M200,255 L230,260 M250,258 L280,263" stroke="white" strokeWidth="0.8" opacity={n?0.2:0.3}/>
        {/* Snow ground */}
        <path d="M0,270 Q100,260 200,268 Q300,275 400,262 L400,320 L0,320Z" fill={n?"#1a2a3a":"#E0F7FA"} opacity="0.8"/>
        <path d="M0,285 Q80,278 160,283 Q240,290 320,280 Q360,276 400,282 L400,320 L0,320Z" fill={n?"#0d1a2d":"white"} opacity={n?0.5:0.7}/>
        {/* Snowflakes */}
        {(d||dw) && [30,90,160,230,300,360].map((x,i) => <text key={i} x={x} y={120+((i*41)%150)} fontSize="8" fill="white" opacity="0.4">❄</text>)}
      </svg>
    ),
    desert: () => (
      <svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={n?"#0a0520":dk?"#4a2020":dw?"#ff7e5f":sky.top}/><stop offset="100%" stopColor={n?"#1a1030":dk?"#E76F51":"#F4A261"}/></linearGradient>
        </defs>
        <rect width="400" height="320" fill="url(#dsky)"/>
        {(d||dw) && <circle cx="300" cy={dw?70:40} r={d?30:25} fill={dk?"#FF6F00":"#FFD54F"} opacity={dw?0.6:0.9}/>}
        {dk && <circle cx="340" cy="55" r="28" fill="#FF6F00" opacity="0.7"/>}
        {n && <><circle cx="80" cy="35" r="16" fill="#E8EAF6" opacity="0.7"/><circle cx="73" cy="31" r="16" fill={n?sky.top:"#0a0520"}/></>}
        {n && [50,130,200,280,350,90,310,170].map((x,i) => <circle key={i} cx={x} cy={12+((i*19)%50)} r="1.5" fill="white" opacity="0.6"/>)}
        {/* Sand dunes */}
        <path d="M-20,220 Q60,170 140,210 Q220,250 300,190 Q370,160 420,200 L420,320 L-20,320Z" fill={n?"#3e2723":"#E9C46A"} opacity="0.7"/>
        <path d="M-20,240 Q80,200 180,235 Q280,270 380,210 L420,230 L420,320 L-20,320Z" fill={n?"#4a3020":"#F4A261"} opacity="0.8"/>
        <path d="M-20,260 Q100,240 200,258 Q300,275 400,250 L400,320 L0,320Z" fill={n?"#5a3828":"#E76F51"} opacity="0.6"/>
        {/* Pyramids */}
        <polygon points="80,260 120,160 160,260" fill={n?"#2a1a10":"#D4A96E"} opacity="0.5"/>
        <polygon points="85,260 120,168 155,260" fill={n?"#3a2a18":"#DEB887"} opacity="0.3"/>
        {/* Cactus */}
        <rect x="280" y="220" width="6" height="40" fill={n?"#1a3a1a":"#2E7D32"} rx="3"/>
        <rect x="274" y="230" width="6" height="15" fill={n?"#1a3a1a":"#2E7D32"} rx="3" transform="rotate(-30,277,230)"/>
        <rect x="286" y="225" width="5" height="18" fill={n?"#1a3a1a":"#388E3C"} rx="2.5" transform="rotate(25,289,225)"/>
        {/* Heat shimmer (day) */}
        {d && <path d="M0,200 Q50,195 100,200 Q150,205 200,198 Q250,192 300,200 Q350,207 400,198" stroke="white" strokeWidth="1" fill="none" opacity="0.15"/>}
        {/* Tumbleweeds */}
        {d && <circle cx="180" cy="270" r="6" fill="none" stroke={n?"#3a2a18":"#A1887F"} strokeWidth="1.5" opacity="0.4"/>}
        {/* Oasis (small) */}
        <ellipse cx="330" cy="270" rx="18" ry="6" fill={n?"#0a2a3a":"#4FC3F7"} opacity={n?0.3:0.4}/>
        <polygon points="325,270 328,240 331,270" fill={n?"#0d2d0d":"#2E7D32"} opacity="0.5"/>
        <polygon points="330,268 334,235 337,268" fill={n?"#0a3a0a":"#388E3C"} opacity="0.4"/>
      </svg>
    ),
  };

  const renderScene = scenes[locationId];
  return renderScene ? renderScene() : (
    <div style={{ position: "absolute", inset: 0, background: n ? "#1a1a2e" : "#87CEEB" }} />
  );
}

function GameView({ screen, avatar, inventory, fedCounts, currentLocation, floatingBiscuits,
  collectAnimation, totalCollected, message, enemies, activeBattle, isBossBattle,
  enemiesDefeated, bossesDefeated, evolution, setEvolution, sickCreatures,
  potions, sickScreen, allMaxed, inventoryCount, totalEvolutions, sickCount,
  travelTo, collectBiscuit, startBattle, onBattleWin, onBattleLose,
  feedCreature, healCreature, summonBoss, goHome, setMessage, music }) {

  const time = useTimeOfDay();
  const tc = getTimeColors(time.phase, time.progress);

  return (
    <div style={{ minHeight: "100vh", background: tc.sky, fontFamily: "'Quicksand', sans-serif", position: "relative", overflow: "hidden", transition: "background 10s ease" }}>
      <SkyBackground phase={time.phase} progress={time.progress} />
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes bobble { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes collectPop { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(2.5); opacity: 0.8; } 100% { transform: scale(0); opacity: 0; } }
        @keyframes sparkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes travelBounce { 0%, 100% { transform: translateY(0) rotate(-5deg); } 25% { transform: translateY(-20px) rotate(5deg); } 75% { transform: translateY(-10px) rotate(-3deg); } }
        @keyframes enemyWobble { 0%, 100% { transform: translateX(0) rotate(0); } 25% { transform: translateX(-6px) rotate(-5deg); } 75% { transform: translateX(6px) rotate(5deg); } }
        @keyframes battleShake { 0% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } 100% { transform: translateX(0); } }
        @keyframes attackPop { 0% { transform: scale(0.5) translateY(0); opacity: 1; } 100% { transform: scale(1.5) translateY(-30px); opacity: 0; } }
        @keyframes enemyAppear { from { transform: scale(0) rotate(180deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes sickWobble { 0%, 100% { transform: translateX(0) rotate(0); } 25% { transform: translateX(-3px) rotate(-2deg); } 75% { transform: translateX(3px) rotate(2deg); } }
        @keyframes corruptPulse { 0%, 100% { filter: hue-rotate(0deg) brightness(1); } 50% { filter: hue-rotate(90deg) brightness(0.7); } }
      `}</style>

      {/* Overlays */}
      {evolution && <EvolutionScreen creature={evolution.creature} oldStage={evolution.oldStage} newStage={evolution.newStage} color={evolution.color} onDone={() => { setEvolution(null); setMessage(`${evolution.newStage.name} has arrived! 🎉`); setTimeout(() => setMessage(""), 3000); }} />}
      {sickScreen && <SickScreen creature={sickScreen.creature} creatureData={sickScreen.creatureData} onSummonBoss={summonBoss} />}
      {activeBattle && <BattleScreen enemy={activeBattle} avatar={avatar} onWin={onBattleWin} onLose={onBattleLose} isBoss={isBossBattle} />}

      {/* Header */}
      <div style={{ background: tc.headerBg, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", position: "relative", zIndex: 10, transition: "background 10s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarDisplay emoji={avatar?.emoji || "🍪"} bodyColor={avatar?.bodyColor || "none"} size={42} animalId={avatar?.id} />
          <div>
            <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.4rem", fontWeight: 700, color: tc.headerText, margin: 0 }}>{avatar?.playerName || "Biscuit Quest"}</h1>
            <div style={{ fontSize: "0.65rem", color: tc.headerText, fontWeight: 600, opacity: 0.8 }}>
              {time.phase === "night" ? "🌙" : time.phase === "dawn" ? "🌅" : time.phase === "dusk" ? "🌇" : "☀️"} {time.timeStr} • {totalEvolutions} evolutions • {bossesDefeated} bosses
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700, color: tc.headerText }}>🎒{inventoryCount}</div>
          <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700, color: tc.headerText }}>⚔️{enemiesDefeated}</div>
          {potions > 0 && <div style={{ background: "rgba(156,39,176,0.3)", borderRadius: 10, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700, color: time.phase === "night" ? "#CE93D8" : "#7B1FA2" }}>🧪{potions}</div>}
          {sickCount > 0 && <div style={{ background: "rgba(118,255,3,0.25)", borderRadius: 10, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700, color: "#76FF03", animation: "pulse 1s ease-in-out infinite" }}>☠️{sickCount}</div>}
          <div onClick={music?.toggleMute} style={{ background: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "3px 8px", fontSize: "0.7rem", fontWeight: 700, color: tc.headerText, cursor: "pointer" }}>{music?.muted ? "🔇" : "🔊"}</div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes("stole") || message.includes("beat") || message.includes("corrupted") ? "rgba(255,200,200,0.95)" : message.includes("potion") || message.includes("healed") ? "rgba(225,190,231,0.95)" : "rgba(255,255,255,0.9)",
          padding: "10px 20px", textAlign: "center", fontWeight: 600,
          color: message.includes("stole") || message.includes("beat") ? "#C62828" : message.includes("corrupted") ? "#4A148C" : message.includes("potion") || message.includes("healed") ? "#6A1B9A" : "#5D4037",
          fontSize: "0.9rem", animation: "slideUp 0.3s ease-out", borderBottom: "2px solid rgba(255,255,255,0.2)",
          position: "relative", zIndex: 5,
        }}>{message}</div>
      )}

      {collectAnimation && <div style={{ position: "fixed", top: "50%", left: "50%", animation: "collectPop 0.6s ease-out forwards", zIndex: 100, pointerEvents: "none" }}><BiscuitSVG type={collectAnimation.type} size={60} corrupted={collectAnimation.corrupted} /></div>}

      {allMaxed && screen === "home" && (
        <div style={{ background: "linear-gradient(135deg, #FFD700, #FFA000)", padding: "16px", textAlign: "center", animation: "slideUp 0.5s ease-out", position: "relative", zIndex: 5 }}>
          <div style={{ fontSize: "2rem" }}>🎉🏆👑🏆🎉</div>
          <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#4E342E" }}>ALL CREATURES FULLY EVOLVED!</div>
        </div>
      )}

      <div style={{ padding: "16px 16px 100px", position: "relative", zIndex: 2 }}>
        {/* HOME */}
        {screen === "home" && (
          <div style={{ animation: "slideUp 0.4s ease-out" }}>
            {/* Sick warning */}
            {sickCount > 0 && (
              <div style={{ background: "rgba(118,255,3,0.1)", border: "2px solid #76FF03", borderRadius: 14, padding: "10px 14px", marginBottom: 12, textAlign: "center" }}>
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "#2E7D32" }}>
                  ☠️ {sickCount} creature{sickCount > 1 ? "s are" : " is"} sick! {potions > 0 ? "Use a potion to heal them!" : "Fight a boss to get a healing potion!"} 🧪
                </span>
                {potions === 0 && sickCount > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={summonBoss} style={{
                      background: "linear-gradient(135deg, #7B1FA2, #E040FB)", color: "white", border: "none",
                      borderRadius: 12, padding: "8px 20px", fontFamily: "'Fredoka', sans-serif", fontSize: "0.85rem",
                      fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(224,64,251,0.4)",
                    }}>⚔️ Fight a Boss for Potion!</button>
                  </div>
                )}
              </div>
            )}

            {(enemiesDefeated > 0 || bossesDefeated > 0) && (
              <div style={{ background: "rgba(239,83,80,0.1)", border: "2px solid #EF5350", borderRadius: 14, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-around" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.2rem" }}>⚔️</div><div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#C62828" }}>{enemiesDefeated} defeated</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.2rem" }}>👑</div><div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#6A1B9A" }}>{bossesDefeated} bosses</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.2rem" }}>🔮</div><div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#7B1FA2" }}>{totalEvolutions} evolved</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: "1.2rem" }}>⭐</div><div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#5D4037" }}>{totalCollected} found</div></div>
              </div>
            )}

            <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.2rem", color: "#5D4037", margin: "8px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              🐾 Your Creatures <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "#8D6E63" }}>Feed to evolve! Beware corrupted biscuits!</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {CREATURES.map(creature => (
                <CreatureCard key={creature.id} creature={creature} fedCount={fedCounts[creature.id] || 0}
                  onFeed={feedCreature} inventory={inventory} isSick={!!sickCreatures[creature.id]}
                  potions={potions} onHeal={healCreature} />
              ))}
            </div>

            {inventoryCount > 0 && (
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 14, marginBottom: 20, border: "2px dashed #FFCC80" }}>
                <h3 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1rem", color: "#5D4037", margin: "0 0 8px" }}>🎒 Your Backpack</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {BISCUIT_TYPES.map(b => {
                    const clean = inventory[b.id] || 0;
                    const corrupt = inventory[`corrupted_${b.id}`] || 0;
                    if (clean === 0 && corrupt === 0) return null;
                    return (
                      <div key={b.id} style={{ display: "flex", gap: 4, flexDirection: "column" }}>
                        {clean > 0 && <div style={{ background: `${b.color}22`, border: `2px solid ${b.color}`, borderRadius: 12, padding: "4px 10px", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><BiscuitSVG type={b.id} size={22} /> {b.name} ×{clean}</div>}
                        {corrupt > 0 && <div style={{ background: "rgba(118,255,3,0.15)", border: "2px solid #76FF03", borderRadius: 12, padding: "4px 10px", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, color: "#2E7D32" }}><BiscuitSVG type={b.id} size={22} corrupted /> Corrupted {b.name} ×{corrupt}</div>}
                      </div>
                    );
                  })}
                  {potions > 0 && <div style={{ background: "rgba(156,39,176,0.15)", border: "2px solid #9C27B0", borderRadius: 12, padding: "4px 10px", fontSize: "0.8rem", fontWeight: 600, color: "#6A1B9A", display: "flex", alignItems: "center", gap: 4 }}>🧪 Healing Potion ×{potions}</div>}
                </div>
              </div>
            )}

            <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.2rem", color: "#5D4037", margin: "0 0 12px" }}>🗺️ Go Exploring! <span style={{ fontSize: "0.7rem", color: "#C62828" }}>⚠️ Enemies corrupt biscuits!</span></h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {LOCATIONS.map(loc => (
                <div key={loc.id} onClick={() => travelTo(loc)} style={{
                  background: loc.bg, borderRadius: 16, padding: 16, cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  color: "white", textAlign: "center", minHeight: 100, display: "flex", flexDirection: "column",
                  justifyContent: "center", alignItems: "center", gap: 6, position: "relative",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05) translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span style={{ fontSize: "2.2rem" }}>{loc.emoji}</span>
                  <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: "1rem", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>{loc.name}</span>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    {loc.biscuits.map(b => <span key={b} style={{ display: "inline-flex" }}><BiscuitSVG type={b} size={20} /></span>)}
                  </div>
                  <div style={{ position: "absolute", top: 6, right: 8, display: "flex", gap: 2, fontSize: "0.75rem" }}>
                    {loc.enemies.map(eId => <span key={eId}>{ENEMIES[eId].emoji}</span>)}
                    <span title={BOSSES[loc.boss].name}>👑</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAVELING */}
        {screen === "traveling" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
            <div style={{ fontSize: "4rem", animation: "travelBounce 1s ease-in-out infinite" }}>🧭</div>
            <div style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#5D4037" }}>Traveling to {currentLocation?.name}...</div>
            <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFB74D", animation: `sparkle 1s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }} />)}</div>
          </div>
        )}

        {/* EXPLORING */}
        {screen === "exploring" && currentLocation && (
          <div style={{ animation: "slideUp 0.4s ease-out" }}>
            {enemies.length > 0 && (
              <div style={{ background: "rgba(198,40,40,0.1)", border: "2px solid #EF5350", borderRadius: 12, padding: "8px 14px", marginBottom: 10, textAlign: "center" }}>
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#C62828" }}>
                  ⚠️ {enemies.length} enem{enemies.length === 1 ? "y" : "ies"} nearby! Fight before the timer runs out or they'll leave corrupted biscuits!
                </span>
              </div>
            )}
            <div style={{ position: "relative", borderRadius: 20, minHeight: 320, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", marginBottom: 16 }}>
              {/* Rich SVG background */}
              <LocationScene locationId={currentLocation.id} timePhase={time.phase} />

              {/* Location name */}
              <div style={{ position: "absolute", top: 12, left: 16, fontFamily: "'Fredoka', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "rgba(255,255,255,0.95)", textShadow: "0 2px 8px rgba(0,0,0,0.5)", zIndex: 10 }}>
                {currentLocation.emoji} {currentLocation.name}
              </div>

              {/* Biscuits - normal and corrupted */}
              {floatingBiscuits.map(biscuit => (
                <div key={biscuit.key} onClick={() => collectBiscuit(biscuit)}
                  style={{
                    position: "absolute", cursor: "pointer",
                    left: `${biscuit.x}%`, top: `${biscuit.y}%`,
                    animation: biscuit.corrupted ? "corruptPulse 1s ease-in-out infinite, bobble 2s ease-in-out infinite" : "bobble 2s ease-in-out infinite",
                    animationDelay: `${biscuit.delay}s`,
                    filter: biscuit.corrupted ? "drop-shadow(0 4px 12px rgba(118,255,3,0.6))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                    transition: "transform 0.15s", userSelect: "none", zIndex: 5,
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.4)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <BiscuitSVG type={biscuit.id} size={44} corrupted={biscuit.corrupted} />
                  {biscuit.corrupted && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: "0.5rem", color: "#76FF03", fontWeight: 800, whiteSpace: "nowrap", fontFamily: "'Fredoka', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>CURSED!</div>}
                </div>
              ))}

              {/* Enemies */}
              {enemies.map(enemy => (
                <EnemyOnField key={enemy.key} enemy={enemy} onClick={() => startBattle(enemy)}
                  style={{ left: `${enemy.x}%`, top: `${enemy.y}%`, animation: "enemyAppear 0.4s ease-out, enemyWobble 1s ease-in-out infinite 0.4s" }} />
              ))}

              {floatingBiscuits.length === 0 && enemies.length === 0 && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "rgba(255,255,255,0.9)", fontFamily: "'Fredoka', sans-serif", fontWeight: 600 }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>👀</div>Looking for more biscuits...
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={goHome} style={{ background: "linear-gradient(135deg, #FF8A65, #FF7043)", color: "white", border: "none", borderRadius: 14, padding: "12px 28px", fontFamily: "'Fredoka', sans-serif", fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(255,112,67,0.4)" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >🏠 Go Home & Feed Creatures</button>
            </div>
            {inventoryCount > 0 && (
              <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                {BISCUIT_TYPES.map(b => {
                  const clean = inventory[b.id] || 0;
                  const corrupt = inventory[`corrupted_${b.id}`] || 0;
                  if (clean === 0 && corrupt === 0) return null;
                  return (
                    <span key={b.id} style={{ background: "rgba(255,255,255,0.8)", borderRadius: 8, padding: "3px 8px", fontSize: "0.75rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <BiscuitSVG type={b.id} size={18} />×{clean}{corrupt > 0 && <span style={{ color: "#76FF03", display: "inline-flex", alignItems: "center", gap: 2 }}> <BiscuitSVG type={b.id} size={16} corrupted />×{corrupt}</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
