import { useState, useEffect, useRef, useCallback } from "react";

// ─── GOOGLE FONTS ────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap";
document.head.appendChild(fontLink);

// ─── THEME ───────────────────────────────────────────────────────────────────
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
};

const css = (obj) => obj;

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Lemoncito Original",    price: 89,  emoji: "🍋", desc: "Classic fresh-squeezed lemon juice, chilled & refreshing.", tag: "Bestseller" },
  { id: 2, name: "Honey Blend",           price: 99,  emoji: "🍯", desc: "Fresh lemon with a touch of natural wildflower honey.", tag: "Sweet Pick" },
  { id: 3, name: "Mint Burst",            price: 109, emoji: "🌿", desc: "Zesty lemon infused with fresh garden mint leaves.", tag: "Refreshing" },
  { id: 4, name: "Bundle Pack (3 btls)",  price: 249, emoji: "📦", desc: "One of each flavor — perfect for sharing or stocking up.", tag: "Best Value" },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
const ACHIEVEMENTS_DEF = [
  { id: "install",   label: "Welcome Gift",   desc: "Installed the app",            emoji: "🎁", coupon: "WELCOME10",  discount: 10, type: "percent", auto: true },
  { id: "firstgame", label: "First Squeeze",  desc: "Play your first game",         emoji: "🎮", coupon: "FIRSTGAME5", discount: 5,  type: "percent" },
  { id: "score50",   label: "Sharp Squeezer", desc: "Score 50+ in one game",        emoji: "⚡", coupon: "SHARP15",    discount: 15, type: "percent" },
  { id: "play5",     label: "Juice Addict",   desc: "Play 5 games total",           emoji: "🏆", coupon: "ADDICT20",   discount: 20, type: "percent" },
  { id: "score100",  label: "Lemon Legend",   desc: "Score 100+ in one game",       emoji: "👑", coupon: "LEGEND25",   discount: 25, type: "percent" },
  { id: "purchase",  label: "First Order",    desc: "Complete your first purchase", emoji: "🛒", coupon: "NEXT10",     discount: 10, type: "percent" },
];

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const initState = () => {
  const unlocked = { install: true };
  const coupons = [{ code: "WELCOME10", label: "Welcome Gift", discount: 10, type: "percent", used: false }];
  return { unlocked, coupons, gamesPlayed: 0, bestScore: 0, totalScore: 0, orders: [] };
};

// ─── AD BANNER ───────────────────────────────────────────────────────────────
const AdBanner = ({ style = {} }) => {
  const ads = [
    { bg: "#FFF3CD", text: "🌞 Summer Special! Fresh juice delivered to your door.", accent: "#E6A800" },
    { bg: "#D4EDDA", text: "🥤 Stay hydrated. Lemoncito — made with real lemons.", accent: "#2E9E4F" },
    { bg: "#FFE0E0", text: "🎯 Sponsor Ad · advertise@lemoncito.app", accent: "#E84855" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ads.length), 4000);
    return () => clearInterval(t);
  }, []);
  const ad = ads[idx];
  return (
    <div style={{ background: ad.bg, border: `1px solid ${ad.accent}33`, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, ...style, transition: "background 0.5s" }}>
      <span style={{ fontSize: 10, color: ad.accent, fontWeight: 700, fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}>AD</span>
      <span style={{ fontSize: 12, color: T.dark, fontFamily: "'Nunito', sans-serif", flex: 1 }}>{ad.text}</span>
    </div>
  );
};

// ─── COUPON BADGE ─────────────────────────────────────────────────────────────
const CouponBadge = ({ coupon, onUse, compact }) => (
  <div style={{ background: coupon.used ? T.grayLt : T.greenLt, border: `2px dashed ${coupon.used ? T.gray : T.green}`, borderRadius: 12, padding: compact ? "8px 12px" : "12px 16px", display: "flex", alignItems: "center", gap: 10, opacity: coupon.used ? 0.5 : 1 }}>
    <div style={{ fontSize: compact ? 20 : 26 }}>🎟️</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: compact ? 13 : 15, color: coupon.used ? T.gray : T.green, letterSpacing: 1 }}>{coupon.code}</div>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: T.gray }}>{coupon.label} · {coupon.discount}% off</div>
    </div>
    {coupon.used
      ? <span style={{ fontSize: 11, color: T.gray, fontFamily: "'Nunito', sans-serif" }}>Used</span>
      : onUse && <button onClick={() => onUse(coupon.code)} style={{ background: T.green, color: T.white, border: "none", borderRadius: 8, padding: "5px 12px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Use</button>
    }
  </div>
);

// ─── ACHIEVEMENT CARD ─────────────────────────────────────────────────────────
const AchievementCard = ({ ach, unlocked }) => (
  <div style={{ background: unlocked ? T.greenLt : T.grayLt, border: `2px solid ${unlocked ? T.green : "#DDD"}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, opacity: unlocked ? 1 : 0.65 }}>
    <div style={{ fontSize: 28, filter: unlocked ? "none" : "grayscale(1)" }}>{ach.emoji}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: unlocked ? T.dark : T.gray }}>{ach.label}</div>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.gray }}>{ach.desc}</div>
    </div>
    {unlocked
      ? <span style={{ background: T.green, color: T.white, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>✓ Earned</span>
      : <span style={{ background: "#EEE", color: T.gray, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "'Nunito', sans-serif" }}>Locked</span>
    }
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", background: T.dark, color: T.white, borderRadius: 30, padding: "10px 22px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, zIndex: 1000, whiteSpace: "nowrap", boxShadow: "0 4px 20px #0005", animation: "fadeInOut 2.8s ease" }}>
      {msg}
    </div>
  );
};

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────
const GameScreen = ({ appState, setAppState, setScreen, showToast }) => {
  const [phase, setPhase]     = useState("idle"); // idle | playing | done
  const [score, setScore]     = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lemons, setLemons]   = useState([]);
  const [combo, setCombo]     = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const areaRef  = useRef(null);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const lemonId  = useRef(0);
  const GAME_H   = 340;

  const endGame = useCallback((finalScore) => {
    setPhase("done");
    clearInterval(timerRef.current);
    clearInterval(spawnRef.current);
    setLemons([]);

    setAppState(prev => {
      const newPlayed = prev.gamesPlayed + 1;
      const newBest   = Math.max(prev.bestScore, finalScore);
      const newTotal  = prev.totalScore + finalScore;
      const newUnlocked = { ...prev.unlocked };
      const newCoupons  = [...prev.coupons];

      const unlock = (id) => {
        if (newUnlocked[id]) return;
        const ach = ACHIEVEMENTS_DEF.find(a => a.id === id);
        if (!ach) return;
        newUnlocked[id] = true;
        newCoupons.push({ code: ach.coupon, label: ach.label, discount: ach.discount, type: ach.type, used: false });
        setTimeout(() => showToast(`🏆 Achievement unlocked: ${ach.label}! Coupon added.`), 600);
      };

      if (!newUnlocked.firstgame) unlock("firstgame");
      if (finalScore >= 50)       unlock("score50");
      if (finalScore >= 100)      unlock("score100");
      if (newPlayed >= 5)         unlock("play5");

      return { ...prev, gamesPlayed: newPlayed, bestScore: newBest, totalScore: newTotal, unlocked: newUnlocked, coupons: newCoupons };
    });
  }, [setAppState, showToast]);

  const startGame = () => {
    setPhase("playing");
    setScore(0);
    setTimeLeft(30);
    setLemons([]);
    setCombo(0);
    lemonId.current = 0;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); clearInterval(spawnRef.current); return 0; }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      const w = areaRef.current ? areaRef.current.offsetWidth - 54 : 280;
      setLemons(prev => [...prev, { id: lemonId.current++, x: Math.random() * w, y: -50, speed: 1.4 + Math.random() * 1.8, size: 36 + Math.floor(Math.random() * 16) }]);
    }, 800);
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const raf = setInterval(() => {
      setLemons(prev => {
        const updated = prev.map(l => ({ ...l, y: l.y + l.speed })).filter(l => l.y < GAME_H + 60);
        return updated;
      });
    }, 30);
    return () => clearInterval(raf);
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      setPhase("done");
      setLemons([]);
      clearInterval(spawnRef.current);
      setScore(s => { endGame(s); return s; });
    }
  }, [timeLeft, phase]);

  const tapLemon = (id) => {
    if (phase !== "playing") return;
    setLemons(prev => prev.filter(l => l.id !== id));
    setScore(s => s + 1);
    setCombo(c => c + 1);
    setShowCombo(true);
    setTimeout(() => setShowCombo(false), 600);
  };

  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 10 ? T.green : T.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Lemon Tap 🍋</div>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.gray }}>Tap lemons before they fall!</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: T.gray }}>Best</div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 18, color: T.yellow }}>{appState.bestScore}</div>
        </div>
      </div>

      {phase === "idle" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24 }}>
          <div style={{ fontSize: 72 }}>🍋</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 20, color: T.dark }}>How to play</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: T.gray, marginTop: 6, lineHeight: 1.6 }}>Tap lemons as they fall.<br/>Score 50+ to unlock a 15% coupon.<br/>Score 100+ for 25% off!</div>
          </div>
          <div style={{ background: T.grayLt, borderRadius: 12, padding: "10px 16px", width: "100%", display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: T.green }}>{appState.gamesPlayed}</div><div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: T.gray }}>Games</div></div>
            <div style={{ width: 1, background: "#DDD" }} />
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: T.green }}>{appState.bestScore}</div><div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: T.gray }}>Best</div></div>
            <div style={{ width: 1, background: "#DDD" }} />
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: T.green }}>{appState.totalScore}</div><div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: T.gray }}>Total</div></div>
          </div>
          <button onClick={startGame} style={{ background: `linear-gradient(135deg, ${T.yellow}, ${T.yellowDk})`, color: T.dark, border: "none", borderRadius: 16, padding: "14px 48px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 18, cursor: "pointer", boxShadow: `0 4px 16px ${T.yellow}88` }}>
            Play Now!
          </button>
          <AdBanner style={{ width: "100%" }} />
        </div>
      )}

      {phase === "playing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 28, color: T.dark, minWidth: 50 }}>{score}</div>
            <div style={{ flex: 1 }}>
              <div style={{ background: "#DDD", borderRadius: 10, height: 10, overflow: "hidden" }}>
                <div style={{ background: timerColor, height: "100%", width: `${timerPct}%`, borderRadius: 10, transition: "width 1s linear, background 0.5s" }} />
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: timerColor, textAlign: "right", marginTop: 2, fontWeight: 700 }}>{timeLeft}s</div>
            </div>
          </div>
          <div ref={areaRef} style={{ position: "relative", flex: 1, background: "linear-gradient(180deg, #FFFDE7 0%, #E8F5EC 100%)", borderRadius: 18, overflow: "hidden", border: `2px solid ${T.yellow}55`, minHeight: GAME_H }}>
            {showCombo && combo > 1 && (
              <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translateX(-50%)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 24, color: T.yellow, pointerEvents: "none", zIndex: 10, textShadow: "0 2px 8px #0004" }}>x{combo} 🔥</div>
            )}
            {lemons.map(l => (
              <div key={l.id} onClick={() => tapLemon(l.id)} style={{ position: "absolute", left: l.x, top: l.y, width: l.size, height: l.size, fontSize: l.size - 4, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: "top 0.03s linear", filter: "drop-shadow(0 2px 4px #0003)" }}>🍋</div>
            ))}
            {lemons.length === 0 && phase === "playing" && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "'Nunito', sans-serif", color: `${T.gray}88`, fontSize: 13 }}>Lemons incoming...</div>
            )}
          </div>
        </div>
      )}

      {phase === "done" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
          <div style={{ fontSize: 60 }}>{score >= 100 ? "👑" : score >= 50 ? "⚡" : score >= 20 ? "🎉" : "😅"}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 16, color: T.gray }}>YOUR SCORE</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 56, color: T.dark, lineHeight: 1 }}>{score}</div>
            {score >= appState.bestScore && score > 0 && <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: T.green, fontWeight: 700 }}>🏅 New Best Score!</div>}
          </div>
          <div style={{ background: T.grayLt, borderRadius: 14, padding: "12px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: T.gray }}>
              {score >= 100 ? "🏆 Lemon Legend unlocked! Check your wallet." : score >= 50 ? "⚡ Sharp Squeezer unlocked! Coupon in wallet." : score >= 1 ? "Keep squeezing for bigger rewards!" : "Better luck next time! 🍋"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={startGame} style={{ background: `linear-gradient(135deg, ${T.yellow}, ${T.yellowDk})`, color: T.dark, border: "none", borderRadius: 14, padding: "12px 28px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
              Play Again
            </button>
            <button onClick={() => setScreen("wallet")} style={{ background: T.greenLt, color: T.green, border: `2px solid ${T.green}`, borderRadius: 14, padding: "12px 20px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Wallet 🎟️
            </button>
          </div>
          <AdBanner style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
};

// ─── SHOP SCREEN ──────────────────────────────────────────────────────────────
const ShopScreen = ({ appState, setAppState, showToast }) => {
  const [cart, setCart]         = useState([]);
  const [view, setView]         = useState("shop"); // shop | cart | confirm
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError]     = useState("");

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...p, qty: 1 }];
    });
    showToast(`${p.emoji} Added to cart!`);
  };
  const removeFromCart = (id) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  const total    = subtotal - discount;
  const cartQty  = cart.reduce((s, c) => s + c.qty, 0);

  const applyCoupon = () => {
    const found = appState.coupons.find(c => c.code === couponInput.toUpperCase() && !c.used);
    if (found) { setAppliedCoupon(found); setCouponError(""); showToast(`✅ Coupon applied! ${found.discount}% off`); }
    else { setCouponError("Invalid or already used coupon."); setAppliedCoupon(null); }
  };

  const placeOrder = () => {
    setAppState(prev => {
      const newCoupons = prev.coupons.map(c => c.code === appliedCoupon?.code ? { ...c, used: true } : c);
      const newUnlocked = { ...prev.unlocked };
      const finalCoupons = [...newCoupons];
      if (!newUnlocked.purchase) {
        newUnlocked.purchase = true;
        const ach = ACHIEVEMENTS_DEF.find(a => a.id === "purchase");
        finalCoupons.push({ code: ach.coupon, label: ach.label, discount: ach.discount, type: ach.type, used: false });
        setTimeout(() => showToast("🏆 First Order achievement! Coupon added to wallet!"), 800);
      }
      return { ...prev, coupons: finalCoupons, unlocked: newUnlocked, orders: [...prev.orders, { items: cart, total, date: new Date().toLocaleDateString() }] };
    });
    setView("confirm");
    setCart([]);
    setAppliedCoupon(null);
    setCouponInput("");
  };

  if (view === "confirm") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, padding: 28, background: T.cream }}>
      <div style={{ fontSize: 72 }}>🎉</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Order Placed!</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: T.gray, marginTop: 6 }}>Your fresh Lemoncito juice is on its way. 🍋</div>
      </div>
      <button onClick={() => setView("shop")} style={{ background: `linear-gradient(135deg, ${T.green}, #238a3f)`, color: T.white, border: "none", borderRadius: 14, padding: "13px 36px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
        Back to Shop
      </button>
    </div>
  );

  if (view === "cart") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.grayLt}` }}>
        <button onClick={() => setView("shop")} style={{ background: T.grayLt, border: "none", borderRadius: 10, padding: "6px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer", color: T.dark }}>← Back</button>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 20, color: T.dark }}>Your Cart</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cart.length === 0 && <div style={{ textAlign: "center", color: T.gray, fontFamily: "'Nunito', sans-serif", marginTop: 40 }}>Your cart is empty.</div>}
        {cart.map(item => (
          <div key={item.id} style={{ background: T.white, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px #0008" }}>
            <div style={{ fontSize: 32 }}>{item.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: T.dark }}>{item.name}</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: T.green, fontWeight: 700 }}>₱{item.price}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => removeFromCart(item.id)} style={{ background: T.grayLt, border: "none", borderRadius: 8, width: 28, height: 28, fontWeight: 800, cursor: "pointer", fontSize: 16, color: T.dark }}>−</button>
              <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 16, color: T.dark, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => addToCart(item)} style={{ background: T.green, border: "none", borderRadius: 8, width: 28, height: 28, fontWeight: 800, cursor: "pointer", fontSize: 16, color: T.white }}>+</button>
            </div>
          </div>
        ))}
        {cart.length > 0 && <>
          <div style={{ background: T.white, borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px #0008" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 8 }}>Apply Coupon</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={couponInput} onChange={e => setCouponInput(e.target.value)} placeholder="Enter coupon code" style={{ flex: 1, border: `1px solid #DDD`, borderRadius: 10, padding: "8px 12px", fontFamily: "'Nunito', sans-serif", fontSize: 13, outline: "none", background: T.cream }} />
              <button onClick={applyCoupon} style={{ background: T.green, color: T.white, border: "none", borderRadius: 10, padding: "8px 14px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Apply</button>
            </div>
            {couponError && <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.red, marginTop: 4 }}>{couponError}</div>}
            {appliedCoupon && <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.green, marginTop: 4, fontWeight: 700 }}>✅ {appliedCoupon.discount}% discount applied!</div>}
          </div>
          <div style={{ background: T.white, borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px #0008" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: T.gray, marginBottom: 6 }}>
              <span>Subtotal</span><span>₱{subtotal}</span>
            </div>
            {appliedCoupon && <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Nunito', sans-serif", fontSize: 14, color: T.green, fontWeight: 700, marginBottom: 6 }}>
              <span>Discount ({appliedCoupon.discount}%)</span><span>−₱{discount}</span>
            </div>}
            <div style={{ borderTop: `1px solid ${T.grayLt}`, paddingTop: 8, display: "flex", justifyContent: "space-between", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 18, color: T.dark }}>
              <span>Total</span><span style={{ color: T.green }}>₱{total}</span>
            </div>
          </div>
          <button onClick={placeOrder} style={{ background: `linear-gradient(135deg, ${T.green}, #238a3f)`, color: T.white, border: "none", borderRadius: 16, padding: "15px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: `0 4px 16px ${T.green}66` }}>
            Place Order 🛒
          </button>
          <AdBanner />
        </>}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Shop 🛒</div>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.gray }}>Fresh Lemoncito juice, delivered</div>
        </div>
        {cartQty > 0 && (
          <button onClick={() => setView("cart")} style={{ background: T.green, color: T.white, border: "none", borderRadius: 12, padding: "8px 14px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🛒 <span style={{ background: T.yellow, color: T.dark, borderRadius: 20, padding: "1px 7px", fontSize: 12, fontWeight: 800 }}>{cartQty}</span>
          </button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <AdBanner />
        {PRODUCTS.map(p => (
          <div key={p.id} style={{ background: T.white, borderRadius: 18, padding: "16px", display: "flex", gap: 14, alignItems: "center", boxShadow: "0 2px 10px #0009" }}>
            <div style={{ fontSize: 44, background: T.greenLt, borderRadius: 14, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 15, color: T.dark }}>{p.name}</div>
                <span style={{ background: T.yellow, color: T.dark, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>{p.tag}</span>
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.gray, marginBottom: 8, lineHeight: 1.4 }}>{p.desc}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 18, color: T.green }}>₱{p.price}</div>
                <button onClick={() => addToCart(p)} style={{ background: `linear-gradient(135deg, ${T.yellow}, ${T.yellowDk})`, color: T.dark, border: "none", borderRadius: 12, padding: "7px 16px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
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
  const available = appState.coupons.filter(c => !c.used);
  const used      = appState.coupons.filter(c => c.used);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream }}>
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.dark }}>Wallet 🎟️</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: T.gray }}>Your earned coupons & achievements</div>
      </div>
      <div style={{ display: "flex", margin: "12px 16px 0", background: T.grayLt, borderRadius: 12, padding: 4 }}>
        {["coupons", "achievements"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? T.white : "transparent", color: tab === t ? T.dark : T.gray, border: "none", borderRadius: 10, padding: "8px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s", boxShadow: tab === t ? "0 1px 4px #0001" : "none", textTransform: "capitalize" }}>
            {t === "coupons" ? `🎟️ Coupons (${available.length})` : `🏆 Achievements`}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === "coupons" && <>
          {available.length > 0 && <>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: T.green, textTransform: "uppercase" }}>Available ({available.length})</div>
            {available.map(c => <CouponBadge key={c.code} coupon={c} />)}
          </>}
          {used.length > 0 && <>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 700, color: T.gray, textTransform: "uppercase", marginTop: 8 }}>Used</div>
            {used.map(c => <CouponBadge key={c.code} coupon={c} />)}
          </>}
          {appState.coupons.length === 0 && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48 }}>🎟️</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", color: T.gray, marginTop: 8 }}>No coupons yet. Play the game to earn some!</div>
              <button onClick={() => setScreen("game")} style={{ background: T.yellow, color: T.dark, border: "none", borderRadius: 12, padding: "10px 24px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, marginTop: 14, cursor: "pointer" }}>Play Game 🍋</button>
            </div>
          )}
          {available.length > 0 && (
            <button onClick={() => setScreen("shop")} style={{ background: `linear-gradient(135deg, ${T.green}, #238a3f)`, color: T.white, border: "none", borderRadius: 14, padding: "13px", fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
              Use Coupons in Shop →
            </button>
          )}
        </>}
        {tab === "achievements" && ACHIEVEMENTS_DEF.map(ach => (
          <AchievementCard key={ach.id} ach={ach} unlocked={!!appState.unlocked[ach.id]} />
        ))}
      </div>
    </div>
  );
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HomeScreen = ({ appState, setScreen }) => {
  const available = appState.coupons.filter(c => !c.used);
  const unlockedCount = Object.keys(appState.unlocked).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.cream, overflowY: "auto" }}>
      <div style={{ background: `linear-gradient(135deg, ${T.green} 0%, #1e7a38 100%)`, padding: "28px 20px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.12, transform: "rotate(-15deg)" }}>🍋</div>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 28, color: T.white }}>Lemoncito 🍋</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14, color: "#ffffff99", marginTop: 2 }}>Play. Earn. Shop Fresh.</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <div style={{ background: "#ffffff1a", borderRadius: 14, padding: "10px 16px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.yellow }}>{appState.gamesPlayed}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#ffffff88" }}>Games</div>
          </div>
          <div style={{ background: "#ffffff1a", borderRadius: 14, padding: "10px 16px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.yellow }}>{available.length}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#ffffff88" }}>Coupons</div>
          </div>
          <div style={{ background: "#ffffff1a", borderRadius: 14, padding: "10px 16px", flex: 1, textAlign: "center" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: T.yellow }}>{unlockedCount}/{ACHIEVEMENTS_DEF.length}</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#ffffff88" }}>Badges</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <AdBanner />

        {available.length > 0 && (
          <div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 8 }}>🎟️ Your Active Coupons</div>
            {available.slice(0, 2).map(c => <CouponBadge key={c.code} coupon={c} compact />)}
            {available.length > 2 && <button onClick={() => setScreen("wallet")} style={{ background: "none", border: "none", color: T.green, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 4 }}>View all {available.length} coupons →</button>}
          </div>
        )}

        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 4 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={() => setScreen("game")} style={{ background: `linear-gradient(135deg, ${T.yellow}, ${T.yellowDk})`, border: "none", borderRadius: 18, padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: `0 4px 14px ${T.yellow}44` }}>
            <div style={{ fontSize: 34 }}>🎮</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 15, color: T.dark }}>Play Game</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#0008" }}>Earn coupons</div>
          </button>
          <button onClick={() => setScreen("shop")} style={{ background: `linear-gradient(135deg, ${T.green}, #238a3f)`, border: "none", borderRadius: 18, padding: "20px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: `0 4px 14px ${T.green}44` }}>
            <div style={{ fontSize: 34 }}>🛒</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 15, color: T.white }}>Shop Now</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, color: "#fff8" }}>Fresh juice</div>
          </button>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: T.dark }}>🏆 Achievements</div>
            <button onClick={() => setScreen("wallet")} style={{ background: "none", border: "none", color: T.green, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>See all →</button>
          </div>
          {ACHIEVEMENTS_DEF.slice(0, 3).map(ach => <div key={ach.id} style={{ marginBottom: 8 }}><AchievementCard ach={ach} unlocked={!!appState.unlocked[ach.id]} /></div>)}
        </div>

        <div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: T.dark, marginBottom: 8 }}>🍋 Featured Products</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {PRODUCTS.map(p => (
              <div key={p.id} onClick={() => setScreen("shop")} style={{ background: T.white, borderRadius: 16, padding: "14px 12px", minWidth: 120, flexShrink: 0, textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px #0009" }}>
                <div style={{ fontSize: 36 }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 12, color: T.dark, marginTop: 4 }}>{p.name}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: T.green, fontWeight: 700 }}>₱{p.price}</div>
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
  { id: "home",   label: "Home",  icon: "🏠" },
  { id: "game",   label: "Game",  icon: "🎮" },
  { id: "shop",   label: "Shop",  icon: "🛒" },
  { id: "wallet", label: "Wallet", icon: "🎟️" },
];

export default function App() {
  const [screen, setScreen]   = useState("home");
  const [appState, setAppState] = useState(initState);
  const [toast, setToast]     = useState(null);

  const showToast = useCallback((msg) => { setToast(msg); }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #1a3d1a 0%, #2a5c2a 50%, #1a3d1a 100%)", fontFamily: "'Nunito', sans-serif", padding: 16 }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        @keyframes fadeInOut { 0%{opacity:0;transform:translateX(-50%) translateY(-10px)} 15%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0} }
        button:active { transform: scale(0.96); }
      `}</style>

      <div style={{ width: 390, height: 750, background: T.cream, borderRadius: 40, overflow: "hidden", boxShadow: "0 30px 80px #00000088, 0 0 0 8px #2a3a2a, 0 0 0 12px #1a2a1a", display: "flex", flexDirection: "column", position: "relative" }}>

        {/* Status bar */}
        <div style={{ background: T.green, padding: "12px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>9:41</span>
          <div style={{ width: 100, height: 18, background: "rgba(0,0,0,0.25)", borderRadius: 10 }} />
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>100% 🔋</span>
        </div>

        {/* Toast */}
        {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

        {/* Screen content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {screen === "home"   && <HomeScreen   appState={appState} setScreen={setScreen} />}
          {screen === "game"   && <GameScreen   appState={appState} setAppState={setAppState} setScreen={setScreen} showToast={showToast} />}
          {screen === "shop"   && <ShopScreen   appState={appState} setAppState={setAppState} showToast={showToast} />}
          {screen === "wallet" && <WalletScreen appState={appState} setScreen={setScreen} />}
        </div>

        {/* Bottom nav */}
        <div style={{ background: T.white, borderTop: "1px solid #eee", display: "flex", flexShrink: 0, paddingBottom: 8 }}>
          {NAV.map(n => {
            const active = screen === n.id;
            const hasBadge = n.id === "wallet" && appState.coupons.filter(c => !c.used).length > 0;
            return (
              <button key={n.id} onClick={() => setScreen(n.id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 0 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", position: "relative" }}>
                {hasBadge && !active && <div style={{ position: "absolute", top: 6, right: "calc(50% - 14px)", width: 8, height: 8, background: T.red, borderRadius: "50%", border: `2px solid ${T.white}` }} />}
                <div style={{ fontSize: 22, filter: active ? "none" : "grayscale(0.4) opacity(0.6)" }}>{n.icon}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: active ? 800 : 600, color: active ? T.green : T.gray }}>{n.label}</div>
                {active && <div style={{ width: 20, height: 3, background: T.green, borderRadius: 2, position: "absolute", bottom: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
