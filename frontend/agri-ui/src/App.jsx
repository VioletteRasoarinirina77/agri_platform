import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, LineElement, PointElement
);



/* ─── Inline styles via CSS injection ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --forest:   #0d2818;
    --moss:     #1a4731;
    --leaf:     #2d6a4f;
    --sage:     #52b788;
    --mint:     #95d5b2;
    --cream:    #f8f4ef;
    --parchment:#ede8e1;
    --gold:     #c9a84c;
    --amber:    #e8b86d;
    --rust:     #c1440e;
    --ink:      #1c1c1c;
    --mist:     rgba(255,255,255,0.06);
    --glass:    rgba(255,255,255,0.04);
  }

  html, body, #root { height: 100%; font-family: 'Syne', sans-serif; }

  /* ── LOGIN ── */
  .login-shell {
    min-height: 100vh;
    background: var(--forest);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .login-shell::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 80%, rgba(45,106,79,.45) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 20%, rgba(82,183,136,.18) 0%, transparent 65%);
  }
  .login-grain {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
  }
  .login-card {
    position: relative;
    background: rgba(26,71,49,0.55);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(82,183,136,.18);
    border-radius: 28px;
    padding: 52px 48px;
    width: 440px;
    box-shadow: 0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04) inset;
    animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both;
  }
  .login-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 34px;
    color: var(--mint);
    letter-spacing: -1px;
    margin-bottom: 4px;
  }
  .login-sub {
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--sage);
    margin-bottom: 40px;
    font-weight: 600;
  }
  .field-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--sage);
    font-weight: 700;
    margin-bottom: 8px;
    display: block;
  }
  .field-wrap { margin-bottom: 20px; }
  .field-input {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(82,183,136,.25);
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-family: 'Syne', sans-serif;
    outline: none;
    transition: border-color .2s, background .2s;
  }
  .field-input:focus {
    border-color: var(--sage);
    background: rgba(82,183,136,.1);
  }
  .field-input::placeholder { color: rgba(255,255,255,.3); }
  .btn-primary {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--leaf), var(--sage));
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: transform .15s, box-shadow .15s, opacity .15s;
    margin-bottom: 12px;
    box-shadow: 0 8px 24px rgba(45,106,79,.4);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(45,106,79,.55); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary {
    width: 100%;
    padding: 14px;
    background: transparent;
    border: 1px solid rgba(82,183,136,.35);
    border-radius: 12px;
    color: var(--sage);
    font-size: 14px;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .btn-secondary:hover { background: rgba(82,183,136,.1); border-color: var(--sage); }
  .login-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0;
    color: rgba(255,255,255,.2);
    font-size: 12px;
  }
  .login-divider::before, .login-divider::after {
    content: ''; flex: 1;
    height: 1px; background: rgba(255,255,255,.1);
  }

  /* ── LAYOUT ── */
  .app-shell {
    display: flex;
    min-height: 100vh;
    background: var(--cream);
    transition: background .3s;
  }
  .app-shell.dark { background: #101a14; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 260px;
    min-height: 100vh;
    background: var(--forest);
    display: flex;
    flex-direction: column;
    padding: 32px 20px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
    box-shadow: 4px 0 32px rgba(0,0,0,.25);
  }
  .sidebar-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: var(--mint);
    padding: 0 12px;
    margin-bottom: 6px;
    letter-spacing: -1px;
  }
  .sidebar-tagline {
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--sage);
    padding: 0 12px;
    margin-bottom: 36px;
    font-weight: 700;
  }
  .nav-section {
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(82,183,136,.5);
    padding: 0 12px;
    margin-bottom: 8px;
    font-weight: 700;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    color: rgba(255,255,255,.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background .15s, color .15s;
    margin-bottom: 4px;
    letter-spacing: .3px;
  }
  .nav-item:hover { background: var(--mist); color: white; }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(45,106,79,.6), rgba(82,183,136,.25));
    color: var(--mint);
    border: 1px solid rgba(82,183,136,.2);
  }
  .nav-icon { font-size: 18px; width: 22px; text-align: center; }
  .sidebar-spacer { flex: 1; }
  .sidebar-user {
    display: flex; align-items: center; gap: 12px;
    padding: 14px;
    background: var(--mist);
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.06);
    margin-bottom: 12px;
  }
  .user-avatar {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, var(--leaf), var(--sage));
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 16px; color: white;
    flex-shrink: 0;
  }
  .user-info { min-width: 0; }
  .user-email {
    font-size: 12px; color: white; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .user-role {
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--sage); font-weight: 700; margin-top: 2px;
  }
  .btn-sidebar {
    width: 100%;
    padding: 11px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    color: rgba(255,255,255,.6);
    background: transparent;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all .2s;
    margin-bottom: 8px;
    font-weight: 500;
  }
  .btn-sidebar:hover { background: var(--mist); color: white; border-color: rgba(255,255,255,.2); }
  .btn-logout {
    width: 100%;
    padding: 11px;
    border: 1px solid rgba(193,68,14,.3);
    border-radius: 10px;
    color: #f87171;
    background: rgba(193,68,14,.08);
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all .2s;
    font-weight: 600;
  }
  .btn-logout:hover { background: rgba(193,68,14,.2); border-color: rgba(193,68,14,.5); }

  /* ── MAIN ── */
  .main-content {
    flex: 1;
    padding: 36px 40px;
    min-width: 0;
    overflow-y: auto;
  }
  .dark .main-content { color: #e8f5ee; }

  /* ── PAGE HEADER ── */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(0,0,0,.08);
  }
  .dark .page-header { border-color: rgba(255,255,255,.07); }
  .page-title {
    font-family: 'DM Serif Display', serif;
    font-size: 38px;
    color: var(--forest);
    letter-spacing: -1.5px;
    line-height: 1;
    margin-bottom: 6px;
  }
  .dark .page-title { color: var(--mint); }
  .page-date {
    font-size: 13px;
    color: #888;
    font-weight: 500;
    letter-spacing: .5px;
  }
  .badge-online {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    background: rgba(45,106,79,.1);
    border: 1px solid rgba(45,106,79,.2);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    color: var(--leaf);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .badge-online::before {
    content: ''; width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--sage);
    box-shadow: 0 0 6px var(--sage);
    animation: pulse 2s infinite;
  }

  /* ── KPI GRID ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 28px;
  }
  .kpi-card {
    background: white;
    border-radius: 20px;
    padding: 24px;
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: 0 2px 12px rgba(0,0,0,.05);
    position: relative;
    overflow: hidden;
    transition: transform .2s, box-shadow .2s;
    animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both;
  }
  .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,.1); }
  .dark .kpi-card { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.08); }
  .kpi-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 20px 20px 0 0;
    background: linear-gradient(90deg, var(--leaf), var(--sage));
  }
  .kpi-card:nth-child(2)::after { background: linear-gradient(90deg, var(--gold), var(--amber)); }
  .kpi-card:nth-child(3)::after { background: linear-gradient(90deg, #3b82f6, #93c5fd); }
  .kpi-card:nth-child(4)::after { background: linear-gradient(90deg, var(--rust), #f97316); }
  .kpi-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #999;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .kpi-value {
    font-family: 'DM Serif Display', serif;
    font-size: 42px;
    color: var(--forest);
    line-height: 1;
    letter-spacing: -2px;
  }
  .dark .kpi-value { color: white; }
  .kpi-value-sm {
    font-size: 28px;
    font-family: 'DM Serif Display', serif;
    color: var(--forest);
    line-height: 1;
  }
  .dark .kpi-value-sm { color: white; }
  .kpi-icon {
    position: absolute;
    right: 20px; bottom: 18px;
    font-size: 36px;
    opacity: .15;
  }
  .kpi-trend {
    font-size: 12px;
    font-weight: 600;
    color: var(--leaf);
    margin-top: 6px;
  }

  /* ── GRID 2 ── */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  /* ── CARDS ── */
  .panel {
    background: white;
    border-radius: 20px;
    padding: 28px;
    border: 1px solid rgba(0,0,0,.06);
    box-shadow: 0 2px 12px rgba(0,0,0,.04);
    animation: fadeUp .55s cubic-bezier(.22,1,.36,1) both;
  }
  .dark .panel { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.07); }
  .panel-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: var(--forest);
    letter-spacing: -.5px;
    margin-bottom: 20px;
  }
  .dark .panel-title { color: var(--mint); }
  .panel-title span { font-size: 18px; margin-right: 8px; }

  /* ── PRICE ROWS ── */
  .price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 8px;
    background: var(--cream);
    border: 1px solid var(--parchment);
    transition: background .15s;
  }
  .dark .price-row { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.06); }
  .price-row:hover { background: var(--parchment); }
  .dark .price-row:hover { background: rgba(255,255,255,.08); }
  .price-name {
    font-weight: 700;
    font-size: 14px;
    color: var(--forest);
    letter-spacing: .3px;
  }
  .dark .price-name { color: var(--mint); }
  .price-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    color: var(--leaf);
    background: rgba(45,106,79,.1);
    padding: 4px 12px;
    border-radius: 8px;
    border: 1px solid rgba(45,106,79,.2);
  }

  /* ── WEATHER ── */
  .weather-hero {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px;
    background: linear-gradient(135deg, var(--leaf), var(--sage));
    border-radius: 16px;
    margin-bottom: 16px;
    box-shadow: 0 8px 24px rgba(45,106,79,.3);
  }
  .weather-temp {
    font-family: 'DM Serif Display', serif;
    font-size: 64px;
    color: white;
    letter-spacing: -3px;
    line-height: 1;
  }
  .weather-label { font-size: 13px; color: rgba(255,255,255,.7); font-weight: 600; }
  .weather-region { font-size: 22px; color: white; font-weight: 800; margin-top: 4px; }
  .weather-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .weather-meta-item {
    padding: 12px 14px;
    background: var(--cream);
    border-radius: 12px;
    border: 1px solid var(--parchment);
  }
  .dark .weather-meta-item { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.08); }
  .wmeta-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #999; font-weight: 700; }
  .wmeta-val { font-size: 16px; font-weight: 700; color: var(--forest); margin-top: 2px; }
  .dark .wmeta-val { color: white; }

  /* ── FARMER TABLE ── */
  .farmer-item {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 14px 16px;
    border-radius: 14px;
    margin-bottom: 10px;
    background: var(--cream);
    border: 1px solid var(--parchment);
    transition: all .15s;
  }
  .dark .farmer-item { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.06); }
  .farmer-item:hover { border-color: var(--sage); transform: translateX(2px); }
  .farmer-name {
    font-weight: 700;
    font-size: 15px;
    color: var(--forest);
    margin-bottom: 3px;
  }
  .dark .farmer-name { color: white; }
  .farmer-details { font-size: 12px; color: #888; font-weight: 500; }
  .farmer-badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--leaf);
    background: rgba(45,106,79,.1);
    border: 1px solid rgba(45,106,79,.2);
    padding: 4px 10px;
    border-radius: 8px;
  }

  /* ── FORM ── */
  .form-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;
    font-weight: 700;
    margin-bottom: 7px;
    display: block;
  }
  .form-input {
    width: 100%;
    padding: 13px 16px;
    background: var(--cream);
    border: 1px solid var(--parchment);
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    margin-bottom: 14px;
    transition: border-color .2s, background .2s;
  }
  .dark .form-input {
    background: rgba(255,255,255,.06);
    border-color: rgba(255,255,255,.1);
    color: white;
  }
  .form-input:focus { border-color: var(--sage); background: white; }
  .dark .form-input:focus { background: rgba(82,183,136,.1); }
  .form-input::placeholder { color: #bbb; }
  .btn-add {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--leaf), var(--sage));
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(45,106,79,.35);
    transition: transform .15s, box-shadow .15s;
  }
  .btn-add:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(45,106,79,.45); }

  /* ── CHART ── */
  .chart-wrap { position: relative; }

  /* ── LOADING ── */
  .loading-shell {
    min-height: 100vh;
    background: var(--forest);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
  }
  .spinner {
    width: 48px; height: 48px;
    border: 3px solid rgba(82,183,136,.2);
    border-top-color: var(--sage);
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  .loading-text {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: var(--mint);
    letter-spacing: -1px;
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: .6; transform: scale(1.4); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(82,183,136,.3); border-radius: 99px; }
`;

/* ─── Component ─── */
export default function App() {
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("123456");
  const [prices, setPrices] = useState([]);
  const [weather, setWeather] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [name, setName] = useState("");
  const [culture, setCulture] = useState("");
  const [region, setRegion] = useState("");
  const [production, setProduction] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  useEffect(() => {
    // Try to load from localStorage, fall back to mock data
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setLogged(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (logged) loadData();
  }, [logged]);

  const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3000";
  const AUTH_BASE = import.meta?.env?.VITE_AUTH_BASE || "http://localhost:3001";

  const login = async () => {
    try {
      const { default: axios } = await import("axios");
      const res = await axios.post(`${AUTH_BASE}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setLogged(true);
    } catch (err) {
      console.error("login error:", err);
      // No mock login fallback.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLogged(false);
      setUser(null);
    }
  };


  const register = async () => {
    try {
      const { default: axios } = await import("axios");
      const res = await axios.post(`${AUTH_BASE}/auth/register`, { email, password, roles: ["FARMER"] });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setLogged(true);
    } catch (err) {
      console.error("register error:", err);
      // No mock fallback.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLogged(false);
      setUser(null);
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLogged(false);
    setUser(null);
    setPrices([]); setWeather(null); setFarmers([]);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { default: axios } = await import("axios");
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [pricesRes, weatherRes, farmersRes] = await Promise.all([
        axios.get(`${API_BASE}/api/prix`, { headers }),
        axios.get(`${API_BASE}/api/meteo/Toamasina`, { headers }),
        axios.get(`${API_BASE}/api/agriculteurs`, { headers }),
      ]);

      const pricesData = pricesRes?.data ?? [];
      const farmersData = farmersRes?.data ?? [];

      // Normalize API responses to the shape expected by the UI.
      // price-service => [{ produit, prix, unite, ... }]
      setPrices(
        (Array.isArray(pricesData) ? pricesData : []).map((p) => ({
          product: p.product ?? p.produit ?? p.nom,
          prix: p.prix,
          price: p.price,
          unite: p.unite,
        }))
      );

      // weather-service => { region, temperature, ... }
      setWeather(weatherRes?.data ?? null);

      // farmer-service => [{ nom, region, culture, surface_terrain, ... }]
      setFarmers(Array.isArray(farmersData) ? farmersData : []);
    } catch (err) {
      // No mock fallback: show empty UI instead.
      console.error("loadData error:", err);
      setPrices([]);
      setWeather(null);
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };


  const addFarmer = async () => {
    if (!name || !region || !culture || !production) return;
    try {
      const { default: axios } = await import("axios");
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/agriculteurs`,
        { nom: name, region, culture, surface_terrain: Number(production) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh from API so the UI is always consistent.
      await loadData();
    } catch (err) {
      console.error("addFarmer error:", err);
    } finally {
      setName("");
      setRegion("");
      setCulture("");
      setProduction("");
    }
  };


  const chartOpts = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0d2818",
        titleColor: "#95d5b2",
        bodyColor: "#fff",
        borderColor: "rgba(82,183,136,.3)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#888", font: { family: "Syne", size: 11 } } },
      y: { grid: { color: dark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)" }, ticks: { color: "#888", font: { family: "JetBrains Mono", size: 11 } } }
    }
  };

  const priceChartData = {
    labels: prices.map(p => p.product || p.nom || "—"),
    datasets: [{
      label: "Prix (Ar)",
      data: prices.map(p => Number(p.price || p.prix || 0)),
      backgroundColor: prices.map((_, i) =>
        ["rgba(45,106,79,.75)", "rgba(82,183,136,.75)", "rgba(149,213,178,.75)", "rgba(201,168,76,.75)", "rgba(232,184,109,.75)"][i % 5]
      ),
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const productionChartData = {
    labels: farmers.map(f => f.nom || "—"),
    datasets: [{
      label: "Surface (ha)",
      data: farmers.map(f => Number(f.surface_terrain || 0)),
      backgroundColor: "rgba(45,106,79,.75)",
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  /* ── LOGIN PAGE ── */
  if (!logged) return (
    <div className="login-shell">
      <div className="login-grain" />
      <div className="login-card">
        <div className="login-logo">🌾 AgriPlatform</div>
        <div className="login-sub">Madagascar · Toamasina</div>
        <div className="field-wrap">
          <label className="field-label">Adresse email</label>
          <input className="field-input" placeholder="email@domaine.mg" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field-wrap">
          <label className="field-label">Mot de passe</label>
          <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={login}>Connexion</button>
        <div className="login-divider">ou</div>
        <button className="btn-secondary" onClick={register}>Créer un compte agriculteur</button>
      </div>
    </div>
  );

  /* ── LOADING ── */
  if (loading) return (
    <div className="loading-shell">
      <div className="spinner" />
      <div className="loading-text">Chargement des données…</div>
    </div>
  );

  const navItems = [
    { icon: "🏠", label: "Dashboard" },
    { icon: "👨‍🌾", label: "Farmers" },
    { icon: "📊", label: "Analytics" },
    ...(user?.roles?.includes("ADMIN") ? [{ icon: "⚙️", label: "Admin Panel" }] : []),
  ];

  /* ── DASHBOARD ── */
  return (
    <div className={`app-shell${dark ? " dark" : ""}`}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">🌾 Agri</div>
        <div className="sidebar-tagline">Platform · Madagascar</div>

        <div className="nav-section">Navigation</div>
        {navItems.map(item => (
          <div
            key={item.label}
            className={`nav-item${activeNav === item.label ? " active" : ""}`}
            onClick={() => setActiveNav(item.label)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-email">{user?.email}</div>
            <div className="user-role">{user?.roles?.join(", ")}</div>
          </div>
        </div>

        <button className="btn-sidebar" onClick={() => setDark(!dark)}>
          {dark ? "☀️ Mode Clair" : "🌙 Mode Sombre"}
        </button>
        <button className="btn-logout" onClick={logout}>↪ Déconnexion</button>
      </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* ══ PAGE: DASHBOARD ══ */}
        {activeNav === "Dashboard" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Dashboard Agricole</div>
                <div className="page-date">
                  {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
              <div className="badge-online">Services en ligne</div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
              <div className="kpi-card" style={{ animationDelay: ".05s" }}>
                <div className="kpi-label">Agriculteurs</div>
                <div className="kpi-value">{farmers.length}</div>
                <div className="kpi-trend">↑ Actifs</div>
                <div className="kpi-icon">👨‍🌾</div>
              </div>
              <div className="kpi-card" style={{ animationDelay: ".1s" }}>
                <div className="kpi-label">Température</div>
                <div className="kpi-value-sm">{weather?.temperature ? `${weather.temperature}°C` : "—"}</div>
                <div className="kpi-trend" style={{ color: "#c9a84c" }}>{weather?.region}</div>
                <div className="kpi-icon">🌡️</div>
              </div>
              <div className="kpi-card" style={{ animationDelay: ".15s" }}>
                <div className="kpi-label">Produits</div>
                <div className="kpi-value">{prices.length}</div>
                <div className="kpi-trend" style={{ color: "#3b82f6" }}>↑ En marché</div>
                <div className="kpi-icon">💰</div>
              </div>
              <div className="kpi-card" style={{ animationDelay: ".2s" }}>
                <div className="kpi-label">Services</div>
                <div className="kpi-value-sm">4 Online</div>
                <div className="kpi-trend" style={{ color: "#f97316" }}>API · DB · Auth</div>
                <div className="kpi-icon">📡</div>
              </div>
            </div>

            {/* PANELS: Prix + Météo */}
            <div className="grid-2">
              <div className="panel" style={{ animationDelay: ".22s" }}>
                <div className="panel-title"><span>💰</span>Prix du Marché</div>
                {prices.map((p, i) => (
                  <div className="price-row" key={i}>
                    <span className="price-name">{p.product || p.nom}</span>
                    <span className="price-val">{(p.price || p.prix).toLocaleString()} Ar</span>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ animationDelay: ".26s" }}>
                <div className="panel-title"><span>☁️</span>Météo</div>
                <div className="weather-hero">
                  <div>
                    <div className="weather-label">Température actuelle</div>
                    <div className="weather-temp">{weather?.temperature}°</div>
                  </div>
                  <div>
                    <div className="weather-label">Région</div>
                    <div className="weather-region">{weather?.region}</div>
                  </div>
                </div>
                <div className="weather-meta">
                  {[
                    ["💧", "Humidité", "74%"],
                    ["💨", "Vent", "12 km/h"],
                    ["☀️", "UV Index", "Modéré"],
                    ["🌧️", "Précipitations", "Faibles"],
                  ].map(([icon, label, val]) => (
                    <div className="weather-meta-item" key={label}>
                      <div className="wmeta-label">{icon} {label}</div>
                      <div className="wmeta-val">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══ PAGE: FARMERS ══ */}
        {activeNav === "Farmers" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Agriculteurs</div>
                <div className="page-date">Gestion et enregistrement des agriculteurs</div>
              </div>
              <div className="badge-online">{farmers.length} enregistrés</div>
            </div>

            <div className="grid-2">
              {/* LIST */}
              <div className="panel" style={{ animationDelay: ".08s" }}>
                <div className="panel-title"><span>👨‍🌾</span>Liste des Agriculteurs</div>
                {farmers.map((f, i) => (
                  <div className="farmer-item" key={i}>
                    <div>
                      <div className="farmer-name">{f.nom}</div>
                      <div className="farmer-details">{f.region} · {f.culture} · {f.surface_terrain} ha</div>
                    </div>
                    <span className="farmer-badge">{f.culture}</span>
                  </div>
                ))}
              </div>

              {/* ADD FORM */}
              <div className="panel" style={{ animationDelay: ".14s" }}>
                <div className="panel-title"><span>➕</span>Ajouter un Agriculteur</div>
                {[
                  ["Nom complet", name, setName, "text"],
                  ["Région", region, setRegion, "text"],
                  ["Culture principale", culture, setCulture, "text"],
                  ["Surface terrain (ha)", production, setProduction, "number"],
                ].map(([label, val, setter, type]) => (
                  <div key={label}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-input"
                      type={type}
                      placeholder={label}
                      value={val}
                      onChange={e => setter(e.target.value)}
                    />
                  </div>
                ))}
                <button className="btn-add" onClick={addFarmer}>Ajouter l'agriculteur</button>
              </div>
            </div>
          </>
        )}

        {/* ══ PAGE: ANALYTICS ══ */}
        {activeNav === "Analytics" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Analytics</div>
                <div className="page-date">Visualisation des données agricoles</div>
              </div>
              <div className="badge-online">Données en temps réel</div>
            </div>

            {/* KPIs résumés */}
            <div className="kpi-grid" style={{ marginBottom: 28 }}>
              <div className="kpi-card" style={{ animationDelay: ".05s" }}>
                <div className="kpi-label">Total Agriculteurs</div>
                <div className="kpi-value">{farmers.length}</div>
                <div className="kpi-icon">👨‍🌾</div>
              </div>
              <div className="kpi-card" style={{ animationDelay: ".10s" }}>
                <div className="kpi-label">Produits Suivis</div>
                <div className="kpi-value">{prices.length}</div>
                <div className="kpi-icon">📦</div>
              </div>
              <div className="kpi-card" style={{ animationDelay: ".15s" }}>
                <div className="kpi-label">Surface Totale</div>
                <div className="kpi-value-sm">{farmers.reduce((s, f) => s + Number(f.surface_terrain || 0), 0).toFixed(1)} ha</div>
                <div className="kpi-icon">🌾</div>
              </div>
              <div className="kpi-card" style={{ animationDelay: ".20s" }}>
                <div className="kpi-label">Prix Moyen</div>
                <div className="kpi-value-sm">
                  {prices.length
                    ? Math.round(prices.reduce((s, p) => s + Number(p.price || p.prix || 0), 0) / prices.length).toLocaleString()
                    : "—"} Ar
                </div>
                <div className="kpi-icon">💰</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="panel chart-wrap" style={{ animationDelay: ".25s" }}>
                <div className="panel-title"><span>📊</span>Prix Agricoles</div>
                <Bar data={priceChartData} options={chartOpts} />
              </div>

              <div className="panel chart-wrap" style={{ animationDelay: ".32s" }}>
                <div className="panel-title"><span>🌾</span>Surface par Agriculteur</div>
                <Bar data={productionChartData} options={chartOpts} />
              </div>
            </div>
          </>
        )}

        {/* ══ PAGE: ADMIN PANEL ══ */}
        {activeNav === "Admin Panel" && (
          <>
            <div className="page-header">
              <div>
                <div className="page-title">Admin Panel</div>
                <div className="page-date">Gestion système et utilisateurs</div>
              </div>
              <div className="badge-online">Accès restreint</div>
            </div>

            <div className="grid-2">
              <div className="panel" style={{ animationDelay: ".08s" }}>
                <div className="panel-title"><span>⚙️</span>Informations Système</div>
                {[
                  ["Utilisateur connecté", user?.email],
                  ["Rôle", user?.roles?.join(", ")],
                  ["Agriculteurs enregistrés", farmers.length],
                  ["Produits en marché", prices.length],
                  ["Statut API", "En ligne"],
                ].map(([label, val]) => (
                  <div className="price-row" key={label}>
                    <span className="price-name">{label}</span>
                    <span className="price-val">{val}</span>
                  </div>
                ))}
              </div>

              <div className="panel" style={{ animationDelay: ".14s" }}>
                <div className="panel-title"><span>🔐</span>Sécurité</div>
                {[
                  ["Authentification", "JWT · Bearer Token"],
                  ["Session", "Active"],
                  ["Dernière connexion", new Date().toLocaleTimeString("fr-FR")],
                  ["Permissions", "Lecture / Écriture"],
                ].map(([label, val]) => (
                  <div className="price-row" key={label}>
                    <span className="price-name">{label}</span>
                    <span className="price-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}