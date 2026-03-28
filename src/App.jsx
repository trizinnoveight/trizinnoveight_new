import { useState, useEffect, useRef } from "react";

// ---- DARK MODE LOGO (white logo — shows on black background) ----
const TrizLogoDark = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="white"/>
    <circle cx="100" cy="100" r="78" fill="white" stroke="black" strokeWidth="7"/>
    <text x="100" y="117" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="800" fontSize="52" fill="black" letterSpacing="3">TRIZ</text>
  </svg>
);

// ---- LIGHT MODE LOGO (black logo — shows on white background) ----
const TrizLogoLight = ({ size = 42 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="black"/>
    <circle cx="100" cy="100" r="78" fill="black" stroke="white" strokeWidth="7"/>
    <text x="100" y="117" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="800" fontSize="52" fill="white" letterSpacing="3">TRIZ</text>
  </svg>
);

// ---- Theme Toggle Button ----
const ThemeToggle = ({ dark, onToggle }) => (
  <button onClick={onToggle} className="theme-toggle" aria-label="Toggle theme">
    <span className="toggle-icon">{dark ? "☀" : "☾"}</span>
    <span className="toggle-track">
      <span className="toggle-thumb" />
    </span>
  </button>
);

// ---- Animated Counter ----
const Counter = ({ end, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    let s = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [started, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// ---- Typewriter ----
const Typewriter = ({ texts, speed = 80 }) => {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[idx];
    if (!deleting && charIdx < current.length) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, speed);
      return () => clearTimeout(t);
    } else if (!deleting && charIdx === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    } else if (deleting && charIdx > 0) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, speed / 2);
      return () => clearTimeout(t);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIdx(i => (i + 1) % texts.length);
    }
  }, [charIdx, deleting, idx, texts, speed]);
  return <span>{displayed}<span className="cursor">|</span></span>;
};

// ---- Particle Background ----
const ParticleCanvas = ({ dark }) => {
  const canvasRef = useRef(null);
  const darkRef = useRef(dark);
  useEffect(() => { darkRef.current = dark; }, [dark]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.5 + 0.3, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4, alpha: Math.random() * 0.4 + 0.1 });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const c = darkRef.current ? "255,255,255" : "0,0,0";
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${p.alpha})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${c},${0.05 * (1 - dist / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};

// ---- Service Card ----
const ServiceCard = ({ icon, title, desc, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="service-card" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="card-line" />
    </div>
  );
};

// ---- Process Step ----
const ProcessStep = ({ num, title, desc, delay }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="process-step" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transition: `all 0.6s ease ${delay}ms` }}>
      <div className="step-num">{num}</div>
      <div className="step-content"><h4>{title}</h4><p>{desc}</p></div>
    </div>
  );
};

// ---- Cursor Follower ----
function CursorFollower() {
  const dot = useRef(null);
  const ring = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (dot.current) { dot.current.style.left = e.clientX + "px"; dot.current.style.top = e.clientY + "px"; }
      setTimeout(() => { if (ring.current) { ring.current.style.left = e.clientX + "px"; ring.current.style.top = e.clientY + "px"; } }, 60);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}

// ================================================================
// ---- MAIN APP ----
// ================================================================
export default function App() {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true); setError(false);
    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, message: formData.message }),
      });
      if (res.ok) { setSubmitted(true); setFormData({ name: "", email: "", message: "" }); setTimeout(() => setSubmitted(false), 5000); }
      else setError(true);
    } catch { setError(true); }
    finally { setSending(false); }
  };

  const services = [
    { icon: "⬡", title: "Web Development", desc: "Custom, high-performance websites built with modern technologies. From landing pages to complex web applications, we craft digital experiences that convert." },
    { icon: "◈", title: "UI/UX Design", desc: "User-centric design that balances aesthetics with functionality. We create intuitive interfaces that delight users and drive engagement." },
    { icon: "⬟", title: "Mobile Applications", desc: "Native and cross-platform mobile apps that deliver seamless experiences on iOS and Android. Built for performance, designed for users." },
    { icon: "◇", title: "E-Commerce Solutions", desc: "Complete online store setups with secure payment gateways, inventory management, and conversion-optimized product pages." },
    { icon: "⬠", title: "SEO & Performance", desc: "Technical SEO and performance optimization to ensure your website ranks high and loads fast, turning visitors into customers." },
    { icon: "⬡", title: "Maintenance & Support", desc: "Ongoing technical support and maintenance to keep your digital presence running smoothly and securely 24/7." },
  ];

  const stats = [
    { end: 50, suffix: "+", label: "Projects Delivered" },
    { end: 30, suffix: "+", label: "Happy Clients" },
    { end: 3, suffix: "+", label: "Years of Innovation" },
    { end: 100, suffix: "%", label: "Client Satisfaction" },
  ];

  const steps = [
    { num: "01", title: "Discovery", desc: "We dive deep into understanding your goals, audience, and competitive landscape." },
    { num: "02", title: "Strategy", desc: "A tailored digital strategy crafted to meet your specific business objectives." },
    { num: "03", title: "Design", desc: "Pixel-perfect designs that reflect your brand identity and captivate your audience." },
    { num: "04", title: "Develop", desc: "Clean, scalable code built with the latest technologies and best practices." },
    { num: "05", title: "Launch", desc: "Rigorous testing followed by a smooth deployment to take your vision live." },
    { num: "06", title: "Grow", desc: "Continuous support, analytics, and optimization to keep you ahead of the curve." },
  ];

  // ---- All theme values in one place ----
  const bg          = dark ? "#000000"                    : "#f5f5f0";
  const fg          = dark ? "#ffffff"                    : "#0a0a0a";
  const gray        = dark ? "#888888"                    : "#666666";
  const lightGray   = dark ? "#cccccc"                    : "#444444";
  const border      = dark ? "rgba(255,255,255,0.1)"      : "rgba(0,0,0,0.1)";
  const cardBg      = dark ? "rgba(255,255,255,0.02)"     : "rgba(0,0,0,0.02)";
  const cardHover   = dark ? "rgba(255,255,255,0.05)"     : "rgba(0,0,0,0.04)";
  const navBg       = dark ? "rgba(0,0,0,0.88)"           : "rgba(245,245,240,0.92)";
  const mobileBg    = dark ? "rgba(0,0,0,0.97)"           : "rgba(245,245,240,0.98)";
  const btnBg       = dark ? "#ffffff"                    : "#0a0a0a";
  const btnFg       = dark ? "#000000"                    : "#ffffff";
  const btnHover    = dark ? "#e0e0e0"                    : "#2a2a2a";
  const bgText      = dark ? "rgba(255,255,255,0.03)"     : "rgba(0,0,0,0.04)";
  const scrollLine  = dark ? "rgba(255,255,255,0.5)"      : "rgba(0,0,0,0.4)";
  const mqColor     = dark ? "#555555"                    : "#aaaaaa";
  const trkBg       = dark ? "#333333"                    : "#cccccc";
  const trkThumb    = dark ? "#ffffff"                    : "#0a0a0a";
  const shadow      = dark ? "rgba(255,255,255,0.1)"      : "rgba(0,0,0,0.15)";
  const outlineW    = dark ? "2px white"                  : "2px #0a0a0a";
  const outlineSec  = dark ? "2px rgba(255,255,255,0.3)"  : "2px rgba(0,0,0,0.25)";
  const ringBorder  = dark ? "rgba(255,255,255,0.4)"      : "rgba(0,0,0,0.3)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${bg}; color: ${fg}; font-family: 'Barlow', sans-serif; overflow-x: hidden; cursor: none; transition: background 0.5s, color 0.5s; }

        /* CURSOR */
        .cursor-dot { width: 8px; height: 8px; background: ${fg}; border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; transform: translate(-50%,-50%); }
        .cursor-ring { width: 32px; height: 32px; border: 1px solid ${ringBorder}; border-radius: 50%; position: fixed; pointer-events: none; z-index: 9998; transform: translate(-50%,-50%); }

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px 5%; display: flex; align-items: center; justify-content: space-between; transition: all 0.4s; }
        nav.scrolled { background: ${navBg}; backdrop-filter: blur(20px); padding: 14px 5%; border-bottom: 1px solid ${border}; }
        .nav-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .nav-logo-text { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.2rem; letter-spacing: 2px; line-height: 1.1; color: ${fg}; }
        .nav-logo-sub { font-size: 0.55rem; letter-spacing: 3px; color: ${gray}; font-weight: 400; }
        .nav-links { display: flex; gap: 40px; list-style: none; }
        .nav-links a { color: ${lightGray}; text-decoration: none; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; font-weight: 500; position: relative; cursor: pointer; transition: color 0.3s; }
        .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: ${fg}; transition: width 0.3s; }
        .nav-links a:hover { color: ${fg}; }
        .nav-links a:hover::after { width: 100%; }

        /* THEME TOGGLE */
        .theme-toggle { background: none; border: 1px solid ${border}; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 40px; transition: all 0.3s; }
        .theme-toggle:hover { background: ${cardBg}; }
        .toggle-icon { font-size: 0.95rem; color: ${fg}; line-height: 1; }
        .toggle-track { width: 36px; height: 18px; background: ${trkBg}; border-radius: 9px; position: relative; transition: background 0.4s; flex-shrink: 0; }
        .toggle-thumb { position: absolute; top: 2px; left: ${dark ? "18px" : "2px"}; width: 14px; height: 14px; background: ${trkThumb}; border-radius: 50%; transition: left 0.35s cubic-bezier(0.4,0,0.2,1), background 0.4s; }

        .nav-right { display: flex; gap: 12px; align-items: center; }
        .nav-cta { background: ${btnBg}; color: ${btnFg}; border: none; padding: 10px 24px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
        .nav-cta:hover { background: ${btnHover}; transform: translateY(-1px); }

        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; }
        .hamburger span { width: 24px; height: 1.5px; background: ${fg}; transition: all 0.3s; display: block; }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4.5px,4.5px); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4.5px,-4.5px); }

        .mobile-menu { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: ${mobileBg}; z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 36px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 2.5rem; font-weight: 700; letter-spacing: 4px; color: ${fg}; text-decoration: none; cursor: pointer; text-transform: uppercase; transition: opacity 0.2s; }
        .mobile-menu a:hover { opacity: 0.4; }
        .mobile-toggle { margin-top: 8px; display: none; }

        /* HERO */
        #hero { min-height: 100vh; position: relative; display: flex; flex-direction: column; justify-content: center; padding: 0 5%; overflow: hidden; }
        .hero-bg-text { position: absolute; font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: min(22vw,280px); color: ${bgText}; letter-spacing: -5px; top: 50%; left: 50%; transform: translate(-50%,-50%); white-space: nowrap; pointer-events: none; user-select: none; text-shadow: 0 0 60px rgba(255,255,255,0.15); filter: blur(0.6px);opacity: 0.9;}
        .hero-content { position: relative; z-index: 2; max-width: 900px; }
        .hero-eyebrow { font-size: 0.7rem; letter-spacing: 5px; color: ${gray}; text-transform: uppercase; margin-bottom: 28px; opacity: 0; transform: translateY(20px); transition: all 0.8s ease 0.2s; }
        .hero-eyebrow.visible { opacity: 1; transform: translateY(0); }
        .hero-h1 { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: clamp(3.5rem,10vw,9rem); line-height: 0.9; letter-spacing: -2px; text-transform: uppercase; margin-bottom: 32px; }
        .hero-h1 .line { display: block; overflow: hidden; }
        .hero-h1 .line span { display: block; opacity: 0; transform: translateY(100%); transition: all 0.9s cubic-bezier(0.16,1,0.3,1); color: ${fg}; }
        .hero-h1 .line span.visible { opacity: 1; transform: translateY(0); }
        .hero-h1 .outline { -webkit-text-stroke: ${outlineW}; color: transparent; }
        .hero-type { font-size: clamp(1.1rem,2.5vw,1.5rem); font-weight: 300; color: ${lightGray}; letter-spacing: 1px; min-height: 2rem; margin-bottom: 36px; opacity: 0; transform: translateY(20px); transition: all 0.8s ease 0.7s; }
        .hero-type.visible { opacity: 1; transform: translateY(0); }
        .hero-sub { font-size: clamp(1rem,2vw,1.2rem); color: ${lightGray}; font-weight: 300; line-height: 1.7; max-width: 500px; margin-bottom: 48px; opacity: 0; transform: translateY(20px); transition: all 0.8s ease 0.9s; }
        .hero-sub.visible { opacity: 1; transform: translateY(0); }
        .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; opacity: 0; transform: translateY(20px); transition: all 0.8s ease 1.1s; }
        .hero-btns.visible { opacity: 1; transform: translateY(0); }

        .btn-primary { background: ${btnBg}; color: ${btnFg}; border: none; padding: 16px 36px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
        .btn-primary:hover { background: ${btnHover}; transform: translateY(-2px); box-shadow: 0 10px 30px ${shadow}; }
        .btn-outline { background: transparent; color: ${fg}; border: 1px solid ${border}; padding: 16px 36px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
        .btn-outline:hover { border-color: ${fg}; background: ${cardBg}; transform: translateY(-2px); }

        .hero-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; animation: fadeIn 1s ease 2s forwards; cursor: pointer; }
        .hero-scroll span { font-size: 0.6rem; letter-spacing: 4px; color: ${gray}; text-transform: uppercase; }
        .scroll-line { width: 1px; height: 50px; background: linear-gradient(to bottom, ${scrollLine}, transparent); animation: scrollPulse 2s ease infinite; }
        @keyframes scrollPulse { 0%,100% { transform: scaleY(1); opacity: 0.5; } 50% { transform: scaleY(1.3); opacity: 1; } }
        @keyframes fadeIn { to { opacity: 1; } }

        /* SHARED SECTION */
        section { padding: 120px 5%; }
        .section-label { font-size: 0.65rem; letter-spacing: 5px; color: ${gray}; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; }
        .section-label::before { content: ''; display: block; width: 30px; height: 1px; background: ${gray}; }
        .section-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: clamp(2.5rem,6vw,5.5rem); text-transform: uppercase; line-height: 0.95; letter-spacing: -1px; color: ${fg}; }
        .section-title .outline { -webkit-text-stroke: ${outlineW}; color: transparent; }

        /* MARQUEE */
        .marquee-section { border-top: 1px solid ${border}; border-bottom: 1px solid ${border}; padding: 20px 0; overflow: hidden; }
        .marquee-track { display: flex; gap: 60px; white-space: nowrap; animation: marquee 20s linear infinite; }
        .marquee-item { font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 0.75rem; letter-spacing: 4px; text-transform: uppercase; color: ${mqColor}; flex-shrink: 0; }
        .marquee-dot { color: ${fg}; margin: 0 10px; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* ABOUT */
        #about { border-top: 1px solid ${border}; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 60px; align-items: start; }
        .about-left p { font-size: 1.05rem; line-height: 1.9; color: ${lightGray}; font-weight: 300; margin-bottom: 24px; }
        .about-right { display: flex; flex-direction: column; }
        .stat-item { padding: 32px 0; border-bottom: 1px solid ${border}; display: flex; align-items: baseline; gap: 24px; }
        .stat-item:first-child { border-top: 1px solid ${border}; }
        .stat-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 3.5rem; line-height: 1; color: ${fg}; }
        .stat-label { font-size: 0.75rem; letter-spacing: 2px; color: ${gray}; text-transform: uppercase; }

        /* SERVICES */
        #services { border-top: 1px solid ${border}; background: ${cardBg}; }
        .services-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; margin-top: 60px; border: 1px solid ${border}; }
        .service-card { padding: 40px 36px; border: 1px solid ${border}; position: relative; overflow: hidden; cursor: default; }
        .service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 0; background: ${cardHover}; transition: height 0.3s; }
        .service-card:hover::before { height: 100%; }
        .card-icon { font-size: 2rem; margin-bottom: 20px; display: block; opacity: 0.5; }
        .service-card h3 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.3rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; color: ${fg}; }
        .service-card p { font-size: 0.85rem; line-height: 1.8; color: ${gray}; }
        .card-line { position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background: ${fg}; transition: width 0.4s; }
        .service-card:hover .card-line { width: 100%; }

        /* PROCESS */
        #process { border-top: 1px solid ${border}; }
        .process-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 60px; align-items: start; }
        .process-steps { display: flex; flex-direction: column; }
        .process-step { display: flex; gap: 24px; padding: 28px 0; border-bottom: 1px solid ${border}; align-items: flex-start; }
        .process-step:first-child { border-top: 1px solid ${border}; }
        .step-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.75rem; letter-spacing: 2px; color: ${gray}; min-width: 30px; margin-top: 2px; }
        .step-content h4 { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.1rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; color: ${fg}; }
        .step-content p { font-size: 0.82rem; line-height: 1.7; color: ${gray}; }
        .process-right { position: sticky; top: 120px; }
        .process-big-text { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: clamp(4rem,8vw,7rem); text-transform: uppercase; line-height: 0.9; letter-spacing: -2px; margin-bottom: 32px; color: ${fg}; }
        .process-big-text .outline { -webkit-text-stroke: ${outlineSec}; color: transparent; display: block; }
        .process-desc { font-size: 1rem; line-height: 1.8; color: ${lightGray}; font-weight: 300; margin-bottom: 32px; }

        /* CONTACT */
        #contact { border-top: 1px solid ${border}; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; margin-top: 60px; align-items: start; }
        .contact-info p { font-size: 1rem; color: ${lightGray}; line-height: 1.8; font-weight: 300; margin-bottom: 40px; }
        .contact-item { display: flex; flex-direction: column; gap: 4px; padding: 20px 0; border-bottom: 1px solid ${border}; }
        .contact-item:first-of-type { border-top: 1px solid ${border}; }
        .contact-item-label { font-size: 0.6rem; letter-spacing: 4px; color: ${gray}; text-transform: uppercase; }
        .contact-item-val { font-size: 0.95rem; color: ${fg}; font-weight: 500; }
        .contact-item a { color: ${fg}; text-decoration: none; }
        .contact-item a:hover { text-decoration: underline; }
        .contact-form { display: flex; flex-direction: column; }
        .form-group { position: relative; border-bottom: 1px solid ${border}; }
        .form-group:first-child { border-top: 1px solid ${border}; }
        .form-group input, .form-group textarea { width: 100%; background: transparent; border: none; outline: none; padding: 24px 0; color: ${fg}; font-family: 'Barlow', sans-serif; font-size: 0.95rem; font-weight: 300; resize: none; }
        .form-group input::placeholder, .form-group textarea::placeholder { color: ${gray}; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; }
        .form-group::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 1px; background: ${fg}; transition: width 0.4s; }
        .form-group:focus-within::after { width: 100%; }
        .form-submit { margin-top: 32px; background: ${btnBg}; color: ${btnFg}; border: none; padding: 18px 48px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; align-self: flex-start; }
        .form-submit:hover { background: ${btnHover}; transform: translateY(-2px); }
        .form-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .form-success { margin-top: 16px; font-size: 0.8rem; letter-spacing: 2px; color: ${lightGray}; text-transform: uppercase; animation: fadeIn 0.5s ease forwards; }

        /* FOOTER */
        footer { border-top: 1px solid ${border}; padding: 40px 5%; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-left { display: flex; align-items: center; gap: 14px; }
        .footer-brand { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: 3px; text-transform: uppercase; color: ${fg}; }
        .footer-tagline { font-size: 0.65rem; letter-spacing: 3px; color: ${gray}; text-transform: uppercase; }
        .footer-copy { font-size: 0.7rem; color: ${gray}; letter-spacing: 1px; }

        .cursor { opacity: 1; animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .nav-links, .nav-cta { display: none; }
          .hamburger { display: flex; }
          .about-grid, .contact-grid, .process-layout { grid-template-columns: 1fr; gap: 40px; }
          .process-right { position: static; }
          .services-grid { grid-template-columns: 1fr 1fr; }
          .mobile-toggle { display: flex !important; }
        }
        @media (max-width: 600px) {
          section { padding: 80px 5%; }
          .services-grid { grid-template-columns: 1fr; }
          .hero-btns { flex-direction: column; }
          .btn-primary, .btn-outline { text-align: center; }
        }
      `}</style>

      <CursorFollower />

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <div className="nav-logo" onClick={() => scrollTo("hero")}>
          {dark ? <TrizLogoDark size={40} /> : <TrizLogoLight size={40} />}
          <div>
            <div className="nav-logo-text">TRIZINNOVEIGHT</div>
            <div className="nav-logo-sub">Innovate Today · Thrive Tomorrow</div>
          </div>
        </div>
        <ul className="nav-links">
          {["about","services","process","contact"].map(s => (
            <li key={s}><a onClick={() => scrollTo(s)}>{s}</a></li>
          ))}
        </ul>
        <div className="nav-right">
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          <button className="nav-cta" onClick={() => scrollTo("contact")}>Get In Touch</button>
        </div>
        <div className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {["about","services","process","contact"].map(s => (
          <a key={s} onClick={() => scrollTo(s)}>{s}</a>
        ))}
        <div className="mobile-toggle">
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </div>
      </div>

      {/* HERO */}
      <section id="hero">
        <ParticleCanvas dark={dark} />
        <div className="hero-bg-text">TRIZ</div>
        <div className="hero-content">
          <div className={`hero-eyebrow ${heroVisible ? "visible" : ""}`}>Web Solutions · Digital Innovation · Ahmedabad, India</div>
          <h1 className="hero-h1">
            <span className="line"><span className={heroVisible ? "visible" : ""} style={{ transitionDelay: "0.3s" }}>We Build</span></span>
            <span className="line"><span className={`outline ${heroVisible ? "visible" : ""}`} style={{ transitionDelay: "0.5s" }}>Digital</span></span>
            <span className="line"><span className={heroVisible ? "visible" : ""} style={{ transitionDelay: "0.7s" }}>Excellence</span></span>
          </h1>
          <div className={`hero-type ${heroVisible ? "visible" : ""}`}>
            <Typewriter texts={["Custom Web Development","UI/UX Design","Mobile Applications","E-Commerce Solutions"]} />
          </div>
          <p className={`hero-sub ${heroVisible ? "visible" : ""}`}>We transform your vision into powerful digital experiences. From concept to launch, we build solutions that innovate today and help you thrive tomorrow.</p>
          <div className={`hero-btns ${heroVisible ? "visible" : ""}`}>
            <button className="btn-primary" onClick={() => scrollTo("services")}>Our Services</button>
            <button className="btn-outline" onClick={() => scrollTo("contact")}>Start a Project</button>
          </div>
        </div>
        <div className="hero-scroll" onClick={() => scrollTo("about")}>
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-track">
          {Array(8).fill(["Web Development","UI/UX Design","Mobile Apps","E-Commerce","SEO","Branding","React","Node.js"]).flat().map((item, i) => (
            <span key={i} className="marquee-item">{item}<span className="marquee-dot">◆</span></span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="section-label">About Us</div>
        <h2 className="section-title">Turning Ideas Into<br /><span className="outline">Digital Reality</span></h2>
        <div className="about-grid">
          <div className="about-left">
            <p>TRIZINNOVEIGHT is a digital solutions company built on one simple belief — that great technology, thoughtfully applied, transforms businesses. We combine technical excellence with sharp design thinking to deliver products that stand out.</p>
            <p>Every project we take on is approached with the same intensity: understand deeply, design boldly, and build with precision. We work closely with our clients to ensure every digital touchpoint reflects their brand and drives measurable results.</p>
            <p>Whether you're launching your first digital product or scaling an existing platform, we bring the expertise and creativity to make it exceptional.</p>
          </div>
          <div className="about-right">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-num"><Counter end={s.end} suffix={s.suffix} /></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="section-label">What We Do</div>
        <h2 className="section-title">Our <span className="outline">Services</span></h2>
        <div className="services-grid">
          {services.map((s, i) => <ServiceCard key={i} {...s} delay={i * 80} />)}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <div className="section-label">How We Work</div>
        <div className="process-layout">
          <div className="process-steps">
            {steps.map((s, i) => <ProcessStep key={i} {...s} delay={i * 100} />)}
          </div>
          <div className="process-right">
            <div className="process-big-text">Our<br /><span className="outline">Process</span><br />Works</div>
            <p className="process-desc">Six refined stages, each designed to ensure your project is delivered on time, on budget, and beyond expectations. We keep you involved at every step.</p>
            <button className="btn-primary" onClick={() => scrollTo("contact")}>Let's Start →</button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="section-label">Get In Touch</div>
        <h2 className="section-title">Start Your<br /><span className="outline">Project</span></h2>
        <div className="contact-grid">
          <div className="contact-info">
            <p>Ready to build something remarkable? Tell us about your project and let's make it happen. We typically respond within 24 hours.</p>
            <div className="contact-item">
              <span className="contact-item-label">Email</span>
              <span className="contact-item-val"><a href="mailto:info@trizinnoveight.com">info@trizinnoveight.com</a></span>
            </div>
            <div className="contact-item">
              <span className="contact-item-label">Website</span>
              <span className="contact-item-val"><a href="https://trizinnoveight.com" target="_blank" rel="noreferrer">trizinnoveight.com</a></span>
            </div>
            <div className="contact-item">
              <span className="contact-item-label">Location</span>
              <span className="contact-item-val">Ahmedabad, Gujarat, India</span>
            </div>
            <div className="contact-item">
              <span className="contact-item-label">Availability</span>
              <span className="contact-item-val">Open for new projects</span>
            </div>
          </div>
          <div>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Your Name" value={formData.name} required onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email Address" value={formData.email} required onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <textarea rows={5} placeholder="Tell us about your project..." value={formData.message} required onChange={e => setFormData({...formData, message: e.target.value})} />
              </div>
              <button type="submit" className="form-submit" disabled={sending}>
                {sending ? "Sending..." : "Send Message →"}
              </button>
              {submitted && <p className="form-success">✓ Message sent! We'll get back to you within 24 hours.</p>}
              {error && <p className="form-success" style={{color:"#e05555"}}>✗ Something went wrong. Email us directly at info@trizinnoveight.com</p>}
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          {dark ? <TrizLogoDark size={32} /> : <TrizLogoLight size={32} />}
          <div>
            <div className="footer-brand">Trizinnoveight</div>
            <div className="footer-tagline">Innovate Today · Thrive Tomorrow</div>
          </div>
        </div>
        <div className="footer-copy">© {new Date().getFullYear()} Trizinnoveight. All rights reserved.</div>
      </footer>
    </>
  );
}
