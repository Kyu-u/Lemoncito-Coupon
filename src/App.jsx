import { useState, useEffect, useRef, useCallback } from "react";
import logoImg from "./assets/lemoncito-logo.png";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  yellow:   "#F5C400",
  yellowDk: "#E6A800",
  green:    "#2E9E4F",
  greenLt:  "#E8F5EC",
  cream:    "#FFFBF0",
  dark:     "#1A2410",
  gray:     "#7A8570",
  grayLt:   "#F0F4ED",
  white:    "#FFFFFF",
  red:      "#E84855",
  gold:     "#FFD700",
  silver:   "#C0C0C0",
  bronze:   "#CD7F32",
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "LemonAide Extract", price: 100, emoji: "🧪", desc: "Pure concentrated lemon extract.", tag: "Premium" },
  { id: 2, name: "LemonAide Juice",   price: 20,  emoji: "🍾", desc: "Classic Lemoncito juice, chilled and naturally refreshing. No preservatives.", tag: "Bestseller" },
  { id: 3, name: "Raw Lemoncito",     price: 70,  emoji: "🍋", desc: "Pure Lemoncito for your own squeezing", tag: "Bestseller" },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS_DEF = [
  { id: "install",     label: "Welcome Gift",    desc: "Installed the app",            emoji: "🎁", coupon: "WELCOME10",  discount: 10, auto: true },
  { id: "firstgame",   label: "First Squeeze",   desc: "Play your first game",         emoji: "🎮", coupon: "FIRSTGAME5", discount: 5  },
  { id: "score50",     label: "Sharp Squeezer",  desc: "Score 50+ in one game",        emoji: "⚡", coupon: "SHARP15",    discount: 15 },
  { id: "play5",       label: "Juice Addict",    desc: "Play 5 games total",           emoji: "🏆", coupon: "ADDICT20",   discount: 20 },
  { id: "score100",    label: "Lemon Legend",    desc: "Score 100+ in one game",       emoji: "👑", coupon: "LEGEND25",   discount: 25 },
  { id: "purchase",    label: "First Order",     desc: "Complete your first purchase", emoji: "🛒", coupon: "NEXT10",     discount: 10 },
  { id: "leaderboard", label: "Top Squeezer",    desc: "Submit score to leaderboard",  emoji: "📋", coupon: "BOARD10",    discount: 10 },
];

// ─── INIT STATE ───────────────────────────────────────────────────────────────
const initState = () => ({
  unlocked: { install: true },
  coupons:  [{ code: "WELCOME10", label: "Welcome Gift", discount: 10, used: false }],
  gamesPlayed: 0, bestScore: 0, totalScore: 0, orders: [], playerName: "",
});

const medal      = (r) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;
const medalColor = (r) => r === 1 ? "#FFD700" : r === 2 ? "#C0C0C0" : r === 3 ? "#CD7F32" : T.gray;

// ─── AD BANNER ────────────────────────────────────────────────────────────────
const AdBanner = ({ style = {} }) => {
  const ads = [
    { bg: "#FFF3CD", text: "🌞 Summer Special! Fresh juice delivered to your door.", accent: "#E6A800" },
    { bg: "#D4EDDA", text: "🥤 Stay hydrated. LemonAide — made with real lemons.",  accent: "#2E9E4F" },
    { bg: "#FFE0E0", text: "🎯 Advertise here · contact@lemonaide.app",             accent: "#E84855" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1) % ads.length), 4000); return () => clearInterval(t); }, []);
  const ad = ads[idx];
  return (
    <div style={{ background: ad.bg, border: `1px solid ${ad.accent}33`, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, transition: "background 0.5s", ...style }}>
      <span style={{ fontSize: 10, color: ad.accent, fontWeight: 700, fontFamily: "'Nunito',sans-serif", flexShrink: 0 }}>AD</span>
      <span style={{ fontSize: 12, color: T.dark, fontFamily: "'Nunito',sans-serif", flex: 1 }}>{ad.text}</span>
    </div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", background: T.dark, color: T.white, borderRadius: 30, padding: "10px 22px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 14, zIndex: 1000, whiteSpace: "nowrap", boxShadow: "0 4px 20px #0005", animation: "fadeInOut 2.8s ease" }}>
      {msg}
    </div>
  );
};

// ─── COUPON BADGE ─────────────────────────────────────────────────────────────
const CouponBadge = ({ coupon, compact }) => (
  <div style={{ background: coupon.used ? T.grayLt : T.greenLt, border: `2px dashed ${coupon.used ? T.gray : T.green}`, borderRadius: 12, padding: compact ? "8px 12px" : "12px 16px", display: "flex", alignItems: "center", gap: 10, opacity: coupon.used ? 0.5 : 1 }}>
    <div style={{ fontSize: compact ? 20 : 26 }}>🎟️</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: compact ? 13 : 15, color: coupon.used ? T.gray : T.green, letterSpacing: 1 }}>{coupon.code}</div>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: T.gray }}>{coupon.label} · {coupon.discount}% off</div>
    </div>
    {coupon.used && <span style={{ fontSize: 11, color: T.gray, fontFamily: "'Nunito',sans-serif" }}>Used</span>}
  </div>
);

// ─── ACHIEVEMENT CARD ─────────────────────────────────────────────────────────
const AchievementCard = ({ ach, unlocked }) => (
  <div style={{ background: unlocked ? T.greenLt : T.grayLt, border: `2px solid ${unlocked ? T.green : "#DDD"}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, opacity: unlocked ? 1 : 0.65 }}>
    <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1)" }}>{ach.emoji}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: unlocked ? T.dark : T.gray }}>{ach.label}</div>
      <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.gray }}>{ach.desc}</div>
    </div>
    {unlocked
      ? <span style={{ background: T.green, color: T.white, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>✓</span>
      : <span style={{ background: "#EEE", color: T.gray, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "'Nunito',sans-serif" }}>🔒</span>}
  </div>
);

// ─── LEADERBOARD SCREEN ───────────────────────────────────────────────────────
const LeaderboardScreen = ({ appState, setAppState, showToast }) => {
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [nameInput, setNameInput] = useState(appState.playerName || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  const loadBoard = async () => {
    setLoading(true);
    try {
      const result = await window.storage.list("lb:", true);
      const keys = result?.keys || [];
      const all = [];
      for (const k of keys) {
        try { const r = await window.storage.get(k, true); if (r?.value) all.push(JSON.parse(r.value)); } catch {}
      }
      all.sort((a, b) => b.score - a.score);
      setEntries(all.slice(0, 20));
    } catch { setEntries([]); }
    setLoading(false);
  };

  useEffect(() => { loadBoard(); }, []);

  const handleSubmit = async () => {
    const name = nameInput.trim();
    if (!name) { setError("Please enter your name."); return; }
    if (appState.bestScore === 0) { setError("Play at least one game first!"); return; }
    setError(""); setSubmitting(true);
    const key = `lb:${name.toLowerCase().replace(/\s+/g,"_")}`;
    try {
      let existingScore = 0;
      try { const ex = await window.storage.get(key, true); if (ex?.value) existingScore = JSON.parse(ex.value).score || 0; } catch {}
      if (appState.bestScore > existingScore) {
        await window.storage.set(key, JSON.stringify({ name, score: appState.bestScore, date: new Date().toLocaleDateString() }), true);
      }
      setAppState(prev => {
        const next = { ...prev, playerName: name };
        if (!prev.unlocked.leaderboard) {
          const ach = ACHIEVEMENTS_DEF.find(a => a.id === "leaderboard");
          next.unlocked = { ...prev.unlocked, leaderboard: true };
          next.coupons  = [...prev.coupons, { code: ach.coupon, label: ach.label, discount: ach.discount, used: false }];
          setTimeout(() => showToast("📋 Leaderboard achievement! 10% coupon earned!"), 600);
        }
        return next;
      });
      setSubmitted(true);
      await loadBoard();
    } catch { setError("Failed to submit. Try again."); }
    setSubmitting(false);
  };

  const myRank = entries.findIndex(e => e.name.toLowerCase() === nameInput.trim().toLowerCase()) + 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ background: "linear-gradient(135deg,#1a3d1a,#2E9E4F)", padding: "18px 20px 20px" }}>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: T.white }}>Leaderboard 🏆</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Top Lemon Tappers worldwide</div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 16px", textAlign: "center", flex: 1 }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: T.yellow }}>{appState.bestScore}</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Your Best</div>
          </div>
          {myRank > 0 && (
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 16px", textAlign: "center", flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: T.yellow }}>{medal(myRank)}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Your Rank</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {!submitted ? (
          <div style={{ background: T.white, borderRadius: 16, padding: "14px 16px", boxShadow: "0 2px 10px #0009" }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 15, color: T.dark, marginBottom: 10 }}>
              {appState.bestScore > 0 ? `Submit your best: ${appState.bestScore} pts` : "Play a game to submit your score!"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Your name" maxLength={20}
                style={{ flex: 1, border: `2px solid ${T.grayLt}`, borderRadius: 10, padding: "9px 12px", fontFamily: "'Nunito',sans-serif", fontSize: 14, outline: "none", background: T.cream, color: T.dark }} />
              <button onClick={handleSubmit} disabled={submitting || appState.bestScore === 0}
                style={{ background: appState.bestScore === 0 ? T.grayLt : `linear-gradient(135deg,${T.yellow},${T.yellowDk})`, color: appState.bestScore === 0 ? T.gray : T.dark, border: "none", borderRadius: 10, padding: "9px 16px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, cursor: appState.bestScore === 0 ? "default" : "pointer" }}>
                {submitting ? "..." : "Submit"}
              </button>
            </div>
            {error && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.red, marginTop: 6 }}>{error}</div>}
            {!appState.unlocked?.leaderboard && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: T.green, marginTop: 6 }}>🎟️ First submission earns a 10% coupon!</div>}
          </div>
        ) : (
          <div style={{ background: T.greenLt, border: `2px solid ${T.green}`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 26 }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.green }}>Score submitted!</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.gray }}>Check your rank below.</div>
            </div>
            <button onClick={() => setSubmitted(false)} style={{ background: "none", border: `1px solid ${T.green}`, borderRadius: 8, padding: "4px 10px", fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.green, cursor: "pointer" }}>Edit</button>
          </div>
        )}

        <AdBanner />

        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 4 }}>Rankings</div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: T.gray, fontFamily: "'Nunito',sans-serif" }}>Loading scores...</div>
        ) : entries.length === 0 ? (
          <div style={{ background: T.white, borderRadius: 16, padding: 28, textAlign: "center", boxShadow: "0 2px 8px #0008" }}>
            <div style={{ fontSize: 44 }}>🏆</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", color: T.gray, marginTop: 8, fontSize: 14 }}>No scores yet — be the first!</div>
          </div>
        ) : entries.map((entry, i) => {
          const rank = i + 1;
          const isMe  = entry.name.toLowerCase() === nameInput.trim().toLowerCase();
          const col   = medalColor(rank);
          return (
            <div key={`${entry.name}-${entry.score}`} style={{ background: isMe ? T.greenLt : T.white, border: `2px solid ${isMe ? T.green : rank <= 3 ? col + "55" : "#eee"}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: rank <= 3 ? `0 2px 12px ${col}33` : "0 1px 4px #0006" }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: rank <= 3 ? col + "22" : T.grayLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: rank <= 3 ? 22 : 14, fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, color: col, flexShrink: 0 }}>{medal(rank)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 15, color: isMe ? T.green : T.dark }}>
                  {entry.name} {isMe && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>(You)</span>}
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: T.gray }}>{entry.date}</div>
              </div>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: rank <= 3 ? col : T.dark }}>{entry.score}</div>
            </div>
          );
        })}
        {entries.length > 0 && (
          <button onClick={loadBoard} style={{ background: T.grayLt, border: "none", borderRadius: 12, padding: "10px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, color: T.gray, cursor: "pointer" }}>🔄 Refresh</button>
        )}
      </div>
    </div>
  );
};

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
const GameScreen = ({ appState, setAppState, setScreen, showToast }) => {
  const [phase, setPhase]       = useState("idle");
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lemons, setLemons]     = useState([]);
  const [combo, setCombo]       = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const areaRef = useRef(null), timerRef = useRef(null), spawnRef = useRef(null), lemonId = useRef(0);
  const GAME_H = 310;

  const endGame = useCallback((finalScore) => {
    setPhase("done"); clearInterval(timerRef.current); clearInterval(spawnRef.current); setLemons([]);
    setAppState(prev => {
      const newPlayed = prev.gamesPlayed + 1, newBest = Math.max(prev.bestScore, finalScore), newTotal = prev.totalScore + finalScore;
      const newUnlocked = { ...prev.unlocked }, newCoupons = [...prev.coupons];
      const unlock = (id) => {
        if (newUnlocked[id]) return;
        const ach = ACHIEVEMENTS_DEF.find(a => a.id === id); if (!ach) return;
        newUnlocked[id] = true;
        newCoupons.push({ code: ach.coupon, label: ach.label, discount: ach.discount, used: false });
        setTimeout(() => showToast(`🏆 ${ach.label} unlocked! Coupon added.`), 600);
      };
      if (!newUnlocked.firstgame) unlock("firstgame");
      if (finalScore >= 50)       unlock("score50");
      if (finalScore >= 100)      unlock("score100");
      if (newPlayed >= 5)         unlock("play5");
      return { ...prev, gamesPlayed: newPlayed, bestScore: newBest, totalScore: newTotal, unlocked: newUnlocked, coupons: newCoupons };
    });
  }, [setAppState, showToast]);

  const startGame = () => {
    setPhase("playing"); setScore(0); setTimeLeft(30); setLemons([]); setCombo(0); lemonId.current = 0;
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); clearInterval(spawnRef.current); return 0; } return t - 1; }), 1000);
    spawnRef.current = setInterval(() => {
      const w = (areaRef.current ? areaRef.current.offsetWidth : 340) - 54;
      setLemons(prev => [...prev, { id: lemonId.current++, x: Math.random() * w, y: -50, speed: 1.4 + Math.random() * 1.8, size: 36 + Math.floor(Math.random() * 16) }]);
    }, 800);
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const raf = setInterval(() => setLemons(prev => prev.map(l => ({ ...l, y: l.y + l.speed })).filter(l => l.y < GAME_H + 60)), 30);
    return () => clearInterval(raf);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) { setPhase("done"); setLemons([]); clearInterval(spawnRef.current); setScore(s => { endGame(s); return s; }); }
  }, [timeLeft, phase]);

  const tapLemon = (id) => {
    if (phase !== "playing") return;
    setLemons(prev => prev.filter(l => l.id !== id));
    setScore(s => s + 1); setCombo(c => c + 1); setShowCombo(true);
    setTimeout(() => setShowCombo(false), 600);
  };

  const timerColor = timeLeft > 10 ? T.green : T.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Lemon Tap 🍋</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.gray }}>Tap lemons before they fall!</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: T.gray }}>Best</div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: T.yellow }}>{appState.bestScore}</div>
        </div>
      </div>

      {phase === "idle" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 20 }}>
          <div style={{ fontSize: 64 }}>🍋</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: T.dark }}>How to Play</div>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.gray, marginTop: 4, lineHeight: 1.6 }}>Tap lemons as they fall in 30 seconds.<br/>50+ → 15% coupon · 100+ → 25% off!</div>
          </div>
          <div style={{ background: T.grayLt, borderRadius: 14, padding: "10px 16px", width: "100%", display: "flex", justifyContent: "space-around" }}>
            {[["Games", appState.gamesPlayed], ["Best", appState.bestScore], ["Total", appState.totalScore]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 18, color: T.green }}>{v}</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: T.gray }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={startGame} style={{ background: `linear-gradient(135deg,${T.yellow},${T.yellowDk})`, color: T.dark, border: "none", borderRadius: 16, padding: "14px 48px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: `0 4px 16px ${T.yellow}88` }}>Play Now!</button>
          <AdBanner style={{ width: "100%" }} />
        </div>
      )}

      {phase === "playing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px 14px", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 30, color: T.dark, minWidth: 54 }}>{score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ background: "#DDD", borderRadius: 10, height: 10, overflow: "hidden" }}>
                <div style={{ background: timerColor, height: "100%", width: `${(timeLeft/30)*100}%`, borderRadius: 10, transition: "width 1s linear, background 0.5s" }} />
              </div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: timerColor, textAlign: "right", marginTop: 2, fontWeight: 700 }}>{timeLeft}s</div>
            </div>
          </div>
          <div ref={areaRef} style={{ position: "relative", flex: 1, background: "linear-gradient(180deg,#FFFDE7 0%,#E8F5EC 100%)", borderRadius: 18, overflow: "hidden", border: `2px solid ${T.yellow}55`, minHeight: GAME_H }}>
            {showCombo && combo > 1 && <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translateX(-50%)", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 24, color: T.yellow, pointerEvents: "none", zIndex: 10, textShadow: "0 2px 8px #0004" }}>x{combo} 🔥</div>}
            {lemons.map(l => <div key={l.id} onClick={() => tapLemon(l.id)} style={{ position: "absolute", left: l.x, top: l.y, width: l.size, height: l.size, fontSize: l.size - 4, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 2px 4px #0003)" }}>🍋</div>)}
            {lemons.length === 0 && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Nunito',sans-serif", color: `${T.gray}88`, fontSize: 13 }}>Lemons incoming...</div>}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 20 }}>
          <div style={{ fontSize: 56 }}>{score >= 100 ? "👑" : score >= 50 ? "⚡" : score >= 20 ? "🎉" : "😅"}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, color: T.gray }}>YOUR SCORE</div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 54, color: T.dark, lineHeight: 1 }}>{score}</div>
            {score >= appState.bestScore && score > 0 && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.green, fontWeight: 700 }}>🏅 New Best Score!</div>}
          </div>
          <div style={{ background: T.grayLt, borderRadius: 14, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.gray }}>
              {score >= 100 ? "👑 Lemon Legend! Check your wallet." : score >= 50 ? "⚡ Sharp Squeezer unlocked!" : score >= 1 ? "Keep squeezing for bigger rewards!" : "Better luck next time! 🍋"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={startGame} style={{ background: `linear-gradient(135deg,${T.yellow},${T.yellowDk})`, color: T.dark, border: "none", borderRadius: 14, padding: "11px 26px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Play Again</button>
            <button onClick={() => setScreen("leaderboard")} style={{ background: T.greenLt, color: T.green, border: `2px solid ${T.green}`, borderRadius: 14, padding: "11px 18px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🏆 Leaderboard</button>
            <button onClick={() => setScreen("wallet")} style={{ background: T.grayLt, color: T.gray, border: "none", borderRadius: 14, padding: "11px 16px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🎟️ Wallet</button>
          </div>
          <AdBanner style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
};

// ─── SHOP SCREEN ──────────────────────────────────────────────────────────────
const ShopScreen = ({ appState, setAppState, showToast }) => {
  const [cart, setCart]                   = useState([]);
  const [view, setView]                   = useState("shop");
  const [couponInput, setCouponInput]     = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError]     = useState("");

  const addToCart = (p) => { setCart(prev => { const ex = prev.find(c => c.id === p.id); return ex ? prev.map(c => c.id === p.id ? { ...c, qty: c.qty+1 } : c) : [...prev, { ...p, qty: 1 }]; }); showToast(`${p.emoji} Added to cart!`); };
  const removeFromCart = (id) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty-1 } : c).filter(c => c.qty > 0));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  const total    = subtotal - discount;
  const cartQty  = cart.reduce((s, c) => s + c.qty, 0);

  const applyCoupon = () => {
    const found = appState.coupons.find(c => c.code === couponInput.toUpperCase() && !c.used);
    if (found) { setAppliedCoupon(found); setCouponError(""); showToast(`✅ ${found.discount}% coupon applied!`); }
    else { setCouponError("Invalid or already used coupon."); setAppliedCoupon(null); }
  };

  const placeOrder = () => {
    setAppState(prev => {
      const newCoupons = prev.coupons.map(c => c.code === appliedCoupon?.code ? { ...c, used: true } : c);
      const newUnlocked = { ...prev.unlocked }, finalCoupons = [...newCoupons];
      if (!newUnlocked.purchase) {
        newUnlocked.purchase = true;
        const ach = ACHIEVEMENTS_DEF.find(a => a.id === "purchase");
        finalCoupons.push({ code: ach.coupon, label: ach.label, discount: ach.discount, used: false });
        setTimeout(() => showToast("🏆 First Order achievement! 10% coupon added!"), 800);
      }
      return { ...prev, coupons: finalCoupons, unlocked: newUnlocked, orders: [...prev.orders, { items: cart, total, date: new Date().toLocaleDateString() }] };
    });
    setView("confirm"); setCart([]); setAppliedCoupon(null); setCouponInput("");
  };

  if (view === "confirm") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, padding: 28, background: T.cream }}>
      <div style={{ fontSize: 72 }}>🎉</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Order Placed!</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: T.gray, marginTop: 6 }}>Your LemonAide is on its way. 🍋</div>
      </div>
      <button onClick={() => setView("shop")} style={{ background: `linear-gradient(135deg,${T.green},#238a3f)`, color: T.white, border: "none", borderRadius: 14, padding: "13px 36px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>Back to Shop</button>
    </div>
  );

  if (view === "cart") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.grayLt}` }}>
        <button onClick={() => setView("shop")} style={{ background: T.grayLt, border: "none", borderRadius: 10, padding: "6px 14px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, cursor: "pointer", color: T.dark, fontSize: 13 }}>← Back</button>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: T.dark }}>Your Cart</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cart.length === 0 && <div style={{ textAlign: "center", color: T.gray, fontFamily: "'Nunito',sans-serif", marginTop: 40 }}>Your cart is empty.</div>}
        {cart.map(item => (
          <div key={item.id} style={{ background: T.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px #0008" }}>
            <div style={{ fontSize: 32 }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.dark }}>{item.name}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.green, fontWeight: 700 }}>₱{item.price}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => removeFromCart(item.id)} style={{ background: T.grayLt, border: "none", borderRadius: 8, width: 28, height: 28, fontWeight: 800, cursor: "pointer", fontSize: 16, color: T.dark }}>−</button>
              <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: T.dark, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => addToCart(item)} style={{ background: T.green, border: "none", borderRadius: 8, width: 28, height: 28, fontWeight: 800, cursor: "pointer", fontSize: 16, color: T.white }}>+</button>
            </div>
          </div>
        ))}
        {cart.length > 0 && <>
          <div style={{ background: T.white, borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px #0008" }}>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 8 }}>Apply Coupon</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Coupon code" style={{ flex: 1, border: `1px solid #DDD`, borderRadius: 10, padding: "8px 12px", fontFamily: "'Nunito',sans-serif", fontSize: 13, outline: "none", background: T.cream, color: T.dark }} />
              <button onClick={applyCoupon} style={{ background: T.green, color: T.white, border: "none", borderRadius: 10, padding: "8px 14px", fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Apply</button>
            </div>
            {couponError && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.red, marginTop: 4 }}>{couponError}</div>}
            {appliedCoupon && <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.green, marginTop: 4, fontWeight: 700 }}>✅ {appliedCoupon.discount}% discount applied!</div>}
          </div>
          <div style={{ background: T.white, borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px #0008" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Nunito',sans-serif", fontSize: 14, color: T.gray, marginBottom: 6 }}><span>Subtotal</span><span>₱{subtotal}</span></div>
            {appliedCoupon && <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Nunito',sans-serif", fontSize: 14, color: T.green, fontWeight: 700, marginBottom: 6 }}><span>Discount ({appliedCoupon.discount}%)</span><span>−₱{discount}</span></div>}
            <div style={{ borderTop: `1px solid ${T.grayLt}`, paddingTop: 8, display: "flex", justifyContent: "space-between", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: T.dark }}><span>Total</span><span style={{ color: T.green }}>₱{total}</span></div>
          </div>
          <button onClick={placeOrder} style={{ background: `linear-gradient(135deg,${T.green},#238a3f)`, color: T.white, border: "none", borderRadius: 16, padding: "15px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: `0 4px 16px ${T.green}66` }}>Place Order 🛒</button>
          <AdBanner />
        </>}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Shop 🛒</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.gray }}>Fresh LemonAide, delivered</div>
        </div>
        {cartQty > 0 && (
          <button onClick={() => setView("cart")} style={{ background: T.green, color: T.white, border: "none", borderRadius: 12, padding: "8px 14px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🛒 <span style={{ background: T.yellow, color: T.dark, borderRadius: 20, padding: "1px 7px", fontSize: 12, fontWeight: 800 }}>{cartQty}</span>
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <AdBanner />
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ background: T.white, borderRadius: 20, padding: "20px", display: "flex", gap: 16, alignItems: "center", boxShadow: "0 2px 14px #0009" }}>
            <div style={{ fontSize: 52, background: T.greenLt, borderRadius: 18, width: 78, height: 78, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 17, color: T.dark }}>{p.name}</div>
                <span style={{ background: T.yellow, color: T.dark, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, fontFamily: "'Nunito',sans-serif" }}>{p.tag}</span>
              </div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.gray, marginBottom: 12, lineHeight: 1.5 }}>{p.desc}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: T.green }}>₱{p.price}</div>
                <button onClick={() => addToCart(p)} style={{ background: `linear-gradient(135deg,${T.yellow},${T.yellowDk})`, color: T.dark, border: "none", borderRadius: 12, padding: "9px 20px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>+ Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── WALLET SCREEN ────────────────────────────────────────────────────────────
const WalletScreen = ({ appState, setScreen }) => {
  const [tab, setTab] = useState("coupons");
  const available = appState.coupons.filter(c => !c.used), used = appState.coupons.filter(c => c.used);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Wallet 🎟️</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.gray }}>Your coupons & achievements</div>
      </div>
      <div style={{ display: "flex", margin: "12px 16px 0", background: T.grayLt, borderRadius: 12, padding: 4 }}>
        {["coupons", "achievements"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab===t ? T.white : "transparent", color: tab===t ? T.dark : T.gray, border: "none", borderRadius: 10, padding: "8px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s", boxShadow: tab===t ? "0 1px 4px #0001" : "none" }}>
            {t === "coupons" ? `🎟️ Coupons (${available.length})` : `🏆 Achievements`}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === "coupons" && <>
          {available.length > 0 && <><div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: T.green, textTransform: "uppercase" }}>Available ({available.length})</div>{available.map(c => <CouponBadge key={c.code} coupon={c} />)}</>}
          {used.length > 0 && <><div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginTop: 8 }}>Used</div>{used.map(c => <CouponBadge key={c.code} coupon={c} />)}</>}
          {appState.coupons.length === 0 && (
            <div style={{ textAlign: "center", padding: 36 }}>
              <div style={{ fontSize: 44 }}>🎟️</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", color: T.gray, marginTop: 8 }}>No coupons yet. Play to earn!</div>
              <button onClick={() => setScreen("game")} style={{ background: T.yellow, color: T.dark, border: "none", borderRadius: 12, padding: "10px 24px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, marginTop: 14, cursor: "pointer" }}>Play Game 🍋</button>
            </div>
          )}
          {available.length > 0 && <button onClick={() => setScreen("shop")} style={{ background: `linear-gradient(135deg,${T.green},#238a3f)`, color: T.white, border: "none", borderRadius: 14, padding: "13px", fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 }}>Use Coupons in Shop →</button>}
        </>}
        {tab === "achievements" && ACHIEVEMENTS_DEF.map(ach => <AchievementCard key={ach.id} ach={ach} unlocked={!!appState.unlocked[ach.id]} />)}
      </div>
    </div>
  );
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HomeScreen = ({ appState, setScreen }) => {
  const available = appState.coupons.filter(c => !c.used), unlockedCount = Object.keys(appState.unlocked).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream, overflowY: "auto" }}>
      <div style={{ background: "linear-gradient(135deg,#1a3d1a 0%,#2E9E4F 100%)", padding: "26px 20px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 110, opacity: 0.12, transform: "rotate(-15deg)" }}>🍋</div>
        <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 28, color: T.white }}>LemonAide 🍋</div>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Play. Earn. Shop Fresh.</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[["Games", appState.gamesPlayed], ["Coupons", available.length], ["Badges", `${unlockedCount}/${ACHIEVEMENTS_DEF.length}`]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 16px", flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 20, color: T.yellow }}>{v}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <AdBanner />

        {available.length > 0 && (
          <div>
            <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 8 }}>🎟️ Active Coupons</div>
            {available.slice(0, 2).map(c => <div key={c.code} style={{ marginBottom: 6 }}><CouponBadge coupon={c} compact /></div>)}
            {available.length > 2 && <button onClick={() => setScreen("wallet")} style={{ background: "none", border: "none", color: T.green, fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View all {available.length} →</button>}
          </div>
        )}

        <div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "game",        emoji: "🎮", label: "Play Game",   sub: "Earn coupons",  bg: `linear-gradient(135deg,${T.yellow},${T.yellowDk})`, tc: T.dark  },
              { id: "shop",        emoji: "🛒", label: "Shop",        sub: "Fresh products", bg: `linear-gradient(135deg,${T.green},#238a3f)`,         tc: T.white },
              { id: "leaderboard", emoji: "🏆", label: "Leaderboard", sub: "Top players",    bg: "linear-gradient(135deg,#1a3d1a,#2E9E4F)",            tc: T.white },
              { id: "wallet",      emoji: "🎟️", label: "Wallet",      sub: `${available.length} coupons`, bg: T.white, tc: T.dark, border: `2px solid ${T.grayLt}` },
            ].map(btn => (
              <button key={btn.id} onClick={() => setScreen(btn.id)} style={{ background: btn.bg, border: btn.border || "none", borderRadius: 18, padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", boxShadow: "0 3px 12px #00000018" }}>
                <div style={{ fontSize: 30 }}>{btn.emoji}</div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 14, color: btn.tc }}>{btn.label}</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: btn.tc === T.white ? "rgba(255,255,255,0.7)" : T.gray }}>{btn.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 8 }}>🍋 Our Products</div>
          <div style={{ display: "flex", gap: 12 }}>
            {PRODUCTS.map(p => (
              <div key={p.id} onClick={() => setScreen("shop")} style={{ background: T.white, borderRadius: 16, padding: "16px", flex: 1, textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px #0009" }}>
                <div style={{ fontSize: 38 }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 13, color: T.dark, marginTop: 6 }}>{p.name}</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.green, fontWeight: 700, marginTop: 2 }}>₱{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",        label: "Home",   icon: "🏠" },
  { id: "game",        label: "Game",   icon: "🎮" },
  { id: "leaderboard", label: "Ranks",  icon: "🏆" },
  { id: "shop",        label: "Shop",   icon: "🛒" },
  { id: "wallet",      label: "Wallet", icon: "🎟️" },
];

export default function App() {
  const [screen, setScreen]     = useState("home");
  const [appState, setAppState] = useState(initState);
  const [toast, setToast]       = useState(null);
  const showToast = useCallback((msg) => setToast(msg), []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 }}>
      <div style={{ width: 390, height: 780, background: T.cream, borderRadius: 44, overflow: "hidden", boxShadow: "0 30px 80px #00000088,0 0 0 8px #2a3a2a,0 0 0 12px #1a2a1a", display: "flex", flexDirection: "column", position: "relative" }}>
        <style>{`
          *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
          ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#ccc;border-radius:4px}
          @keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(-10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0}}
          button:active{transform:scale(0.96)}
        `}</style>

        <div style={{ background: T.green, padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>9:41</span>
          <div style={{ width: 100, height: 18, background: "rgba(0,0,0,0.25)", borderRadius: 10 }} />
          <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>100% 🔋</span>
        </div>

        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

        <div style={{ flex: 1, overflow: "hidden" }}>
          {screen === "home"        && <HomeScreen        appState={appState} setScreen={setScreen} />}
          {screen === "game"        && <GameScreen        appState={appState} setAppState={setAppState} setScreen={setScreen} showToast={showToast} />}
          {screen === "leaderboard" && <LeaderboardScreen appState={appState} setAppState={setAppState} showToast={showToast} />}
          {screen === "shop"        && <ShopScreen        appState={appState} setAppState={setAppState} showToast={showToast} />}
          {screen === "wallet"      && <WalletScreen      appState={appState} setScreen={setScreen} />}
        </div>

        <div style={{ background: T.white, borderTop: "1px solid #eee", display: "flex", flexShrink: 0, paddingBottom: 6 }}>
          {NAV.map(n => {
            const active   = screen === n.id;
            const hasBadge = n.id === "wallet" && appState.coupons.filter(c => !c.used).length > 0;
            return (
              <button key={n.id} onClick={() => setScreen(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "9px 0 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", position: "relative" }}>
                {hasBadge && !active && <div style={{ position: "absolute", top: 6, right: "calc(50% - 14px)", width: 8, height: 8, background: T.red, borderRadius: "50%", border: `2px solid ${T.white}` }} />}
                <div style={{ fontSize: 20, filter: active ? "none" : "grayscale(0.4) opacity(0.6)" }}>{n.icon}</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 9, fontWeight: active ? 800 : 600, color: active ? T.green : T.gray }}>{n.label}</div>
                {active && <div style={{ width: 18, height: 3, background: T.green, borderRadius: 2, position: "absolute", bottom: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
