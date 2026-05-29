import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Shield, Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";

// ── Validation helpers ────────────────────────────────────────────────────────
const validators = {
  email: (v) => {
    if (!v) return "Email is required";
    if (!v.endsWith("@gmail.com")) return "Only @gmail.com accounts are allowed";
    if (v.length < 11) return "Invalid Gmail address";
    const local = v.replace("@gmail.com", "");
    if (!/^[a-zA-Z0-9._%+-]+$/.test(local)) return "Invalid characters in email";
    return null;
  },
  password: (v) => {
    if (!v) return "Password is required";
    if (v.length < 8) return "Minimum 8 characters";
    if (!/[A-Z]/.test(v)) return "At least one uppercase letter";
    if (!/[0-9]/.test(v)) return "At least one number";
    if (!/[!@#$%^&*]/.test(v)) return "At least one special character (!@#$%^&*)";
    return null;
  },
  name: (v) => {
    if (!v) return "Full name is required";
    if (v.trim().length < 3) return "Name must be at least 3 characters";
    if (!/^[a-zA-Z\s]+$/.test(v)) return "Name can only contain letters";
    return null;
  },
  confirmPassword: (v, password) => {
    if (!v) return "Please confirm your password";
    if (v !== password) return "Passwords do not match";
    return null;
  },
};

// ── Password strength ─────────────────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)        score++;
  if (password.length >= 12)       score++;
  if (/[A-Z]/.test(password))      score++;
  if (/[0-9]/.test(password))      score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  if (score <= 1) return { score, label: "Very Weak",  color: "#ef4444", bars: 1 };
  if (score === 2) return { score, label: "Weak",       color: "#f97316", bars: 2 };
  if (score === 3) return { score, label: "Fair",       color: "#f59e0b", bars: 3 };
  if (score === 4) return { score, label: "Strong",     color: "#22c55e", bars: 4 };
  return             { score, label: "Very Strong", color: "#06b6d4", bars: 5 };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function InputField({ label, type, placeholder, value, onChange, onBlur, error, icon: Icon, rightElement, hint }) {
  return (
    <div>
      <label className="text-slate-400 text-xs font-semibold uppercase tracking-widest block mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${error ? "text-red-400" : "text-slate-500"}`} />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} ${rightElement ? "pr-10" : "pr-4"} py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none bg-white/5 text-slate-200 placeholder-slate-600
            ${error
              ? "border border-red-500/60 focus:border-red-500 bg-red-500/5"
              : "border border-white/10 focus:border-cyan-500/60 focus:bg-white/8"
            }`}
        />
        {rightElement && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle size={11} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-[11px]">{error}</p>
        </div>
      )}
      {hint && !error && <p className="text-slate-600 text-[11px] mt-1.5">{hint}</p>}
    </div>
  );
}

function PasswordStrengthBar({ password }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= strength.bars ? strength.color : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      <p className="text-[11px] font-medium" style={{ color: strength.color }}>{strength.label}</p>
    </div>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  const styles = {
    success: "bg-green-500/15 border-green-500/30 text-green-400",
    error:   "bg-red-500/15   border-red-500/30   text-red-400",
    info:    "bg-cyan-500/15  border-cyan-500/30  text-cyan-400",
  };
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium mb-4 ${styles[type]}`}>
      <span>{icons[type]}</span>
      {message}
    </div>
  );
}

// ── API calls ─────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

async function apiSignup(name, email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Signup failed");
  return data;
}

async function apiForgotPassword(email) {
  const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to send reset email");
  return data;
}

// ── Main Login Component ──────────────────────────────────────────────────────
export default function Login({ onLogin }) {
  const [tab, setTab] = useState("login");

  // login fields
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw,   setShowLoginPw]   = useState(false);
  const [rememberMe,    setRememberMe]    = useState(false);

  // signup fields
  const [signupName,     setSignupName]     = useState("");
  const [signupEmail,    setSignupEmail]    = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm,  setSignupConfirm]  = useState("");
  const [showSignupPw,   setShowSignupPw]   = useState(false);
  const [showConfirmPw,  setShowConfirmPw]  = useState(false);
  const [agreeTerms,     setAgreeTerms]     = useState(false);

  // forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent,  setForgotSent]  = useState(false);

  // errors
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  // ui state
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState({ message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 4000);
  };

  const touch = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const validate = {
    loginEmail:     () => { touch("loginEmail");     setErrors(e => ({...e, loginEmail:     validators.email(loginEmail)})); },
    loginPassword:  () => { touch("loginPassword");  setErrors(e => ({...e, loginPassword:  loginPassword ? null : "Password is required"})); },
    signupName:     () => { touch("signupName");     setErrors(e => ({...e, signupName:     validators.name(signupName)})); },
    signupEmail:    () => { touch("signupEmail");    setErrors(e => ({...e, signupEmail:    validators.email(signupEmail)})); },
    signupPassword: () => { touch("signupPassword"); setErrors(e => ({...e, signupPassword: validators.password(signupPassword)})); },
    signupConfirm:  () => { touch("signupConfirm");  setErrors(e => ({...e, signupConfirm:  validators.confirmPassword(signupConfirm, signupPassword)})); },
    forgotEmail:    () => { touch("forgotEmail");    setErrors(e => ({...e, forgotEmail:    validators.email(forgotEmail)})); },
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        if (!userInfo.email.endsWith("@gmail.com")) {
          showToast("Only @gmail.com accounts are allowed", "error");
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email:     userInfo.email,
            name:      userInfo.name,
            picture:   userInfo.picture,
            google_id: userInfo.sub,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Google login failed");

        sessionStorage.setItem("cg_token", data.access_token);
        showToast(`Welcome, ${userInfo.name}! 👋`, "success");
        setTimeout(() => onLogin(data.user), 800);
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    },
    onError: () => showToast("Google login failed. Try again.", "error"),
  });

  // ── Login submit ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    const emailErr = validators.email(loginEmail);
    const passErr  = loginPassword ? null : "Password is required";
    setErrors({ loginEmail: emailErr, loginPassword: passErr });
    setTouched({ loginEmail: true, loginPassword: true });
    if (emailErr || passErr) return;

    setLoading(true);
    try {
      const data = await apiLogin(loginEmail, loginPassword);
      sessionStorage.setItem("cg_token", data.access_token);
      showToast(`Welcome back, ${data.user?.name || "Admin"}! 👋`, "success");
      setTimeout(() => onLogin(data.user), 800);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Signup submit ───────────────────────────────────────────────────────────
  const handleSignup = async () => {
    const errs = {
      signupName:     validators.name(signupName),
      signupEmail:    validators.email(signupEmail),
      signupPassword: validators.password(signupPassword),
      signupConfirm:  validators.confirmPassword(signupConfirm, signupPassword),
    };
    setErrors(errs);
    setTouched({ signupName:true, signupEmail:true, signupPassword:true, signupConfirm:true });
    if (Object.values(errs).some(Boolean)) return;
    if (!agreeTerms) { showToast("Please agree to the Terms of Service", "error"); return; }

    setLoading(true);
    try {
      const data = await apiSignup(signupName, signupEmail, signupPassword);
      sessionStorage.setItem("cg_token", data.access_token);
      showToast("Account created successfully! 🎉", "success");
      setTimeout(() => onLogin(data.user), 800);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const emailErr = validators.email(forgotEmail);
    setErrors(e => ({ ...e, forgotEmail: emailErr }));
    setTouched(t => ({ ...t, forgotEmail: true }));
    if (emailErr) return;

    setLoading(true);
    try {
      await apiForgotPassword(forgotEmail);
      setForgotSent(true);
      showToast("Reset link sent! Check your Gmail inbox.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setTouched({});
    setToast({ message: "", type: "info" });
    setShowForgot(false);
    setForgotSent(false);
  };

  const features = ["Real-time Monitoring","Privacy First","AI Powered Analytics","Smart Alerts"];

  // ── Forgot password view ────────────────────────────────────────────────────
  const ForgotPasswordView = (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-cyan-400" />
        </div>
        <h3 className="text-white font-bold text-lg">Reset Password</h3>
        <p className="text-slate-500 text-xs mt-1">Enter your Gmail and we'll send a reset link</p>
      </div>

      {forgotSent ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <p className="text-white font-semibold mb-1">Email Sent!</p>
          <p className="text-slate-500 text-sm">Check <span className="text-cyan-400">{forgotEmail}</span> for the reset link.</p>
          <p className="text-slate-600 text-xs mt-3">Didn't receive it? Check your spam folder.</p>
        </div>
      ) : (
        <>
          <Toast message={toast.message} type={toast.type} />
          <InputField
            label="Gmail Address"
            type="email"
            placeholder="yourname@gmail.com"
            value={forgotEmail}
            onChange={e => { setForgotEmail(e.target.value); if(touched.forgotEmail) validate.forgotEmail(); }}
            onBlur={validate.forgotEmail}
            error={touched.forgotEmail ? errors.forgotEmail : null}
            icon={Mail}
            hint="Must be a @gmail.com address"
          />
          <button onClick={handleForgotPassword} disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin"/>Sending...</> : <>Send Reset Link <ArrowRight size={15}/></>}
          </button>
        </>
      )}

      <button onClick={() => { setShowForgot(false); setForgotSent(false); setErrors({}); setTouched({}); }}
        className="w-full text-center text-slate-500 text-xs hover:text-slate-300 transition-colors">
        ← Back to Login
      </button>
    </div>
  );

  // ── Login form ──────────────────────────────────────────────────────────────
  const LoginForm = (
    <div className="space-y-5">
      <Toast message={toast.message} type={toast.type} />

      <InputField
        label="Gmail Address"
        type="email"
        placeholder="yourname@gmail.com"
        value={loginEmail}
        onChange={e => { setLoginEmail(e.target.value); if(touched.loginEmail) validate.loginEmail(); }}
        onBlur={validate.loginEmail}
        error={touched.loginEmail ? errors.loginEmail : null}
        icon={Mail}
        hint="Only @gmail.com accounts are accepted"
      />

      <InputField
        label="Password"
        type={showLoginPw ? "text" : "password"}
        placeholder="Enter your password"
        value={loginPassword}
        onChange={e => { setLoginPassword(e.target.value); if(touched.loginPassword) validate.loginPassword(); }}
        onBlur={validate.loginPassword}
        error={touched.loginPassword ? errors.loginPassword : null}
        icon={Lock}
        rightElement={
          <button onClick={() => setShowLoginPw(!showLoginPw)} className="text-slate-500 hover:text-slate-300 transition-colors">
            {showLoginPw ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        }
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${rememberMe ? "bg-cyan-500 border-cyan-500" : "border-white/20 bg-transparent"}`}>
            {rememberMe && <span className="text-white text-[9px] font-bold">✓</span>}
          </div>
          <span className="text-slate-500 text-xs select-none">Remember me for 30 days</span>
        </label>
        <button onClick={() => { setShowForgot(true); setErrors({}); setTouched({}); }}
          className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors font-medium">
          Forgot Password?
        </button>
      </div>

      <button onClick={handleLogin} disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={15} className="animate-spin"/>Authenticating...</> : <>Login to CrowdGuard <ArrowRight size={15}/></>}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/8"/>
        <span className="text-slate-600 text-xs">or continue with</span>
        <div className="flex-1 h-px bg-white/8"/>
      </div>

      <button
        onClick={() => googleLogin()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 text-sm font-semibold transition-all duration-200 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );

  // ── Signup form ─────────────────────────────────────────────────────────────
  const SignupForm = (
    <div className="space-y-4">
      <Toast message={toast.message} type={toast.type} />

      <InputField
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={signupName}
        onChange={e => { setSignupName(e.target.value); if(touched.signupName) validate.signupName(); }}
        onBlur={validate.signupName}
        error={touched.signupName ? errors.signupName : null}
        icon={User}
        hint="Letters only, minimum 3 characters"
      />

      <InputField
        label="Gmail Address"
        type="email"
        placeholder="yourname@gmail.com"
        value={signupEmail}
        onChange={e => { setSignupEmail(e.target.value); if(touched.signupEmail) validate.signupEmail(); }}
        onBlur={validate.signupEmail}
        error={touched.signupEmail ? errors.signupEmail : null}
        icon={Mail}
        hint="Must be a valid @gmail.com address"
      />

      <div>
        <InputField
          label="Password"
          type={showSignupPw ? "text" : "password"}
          placeholder="Min 8 chars, uppercase, number, symbol"
          value={signupPassword}
          onChange={e => { setSignupPassword(e.target.value); if(touched.signupPassword) validate.signupPassword(); if(touched.signupConfirm) validate.signupConfirm(); }}
          onBlur={validate.signupPassword}
          error={touched.signupPassword ? errors.signupPassword : null}
          icon={Lock}
          rightElement={
            <button onClick={() => setShowSignupPw(!showSignupPw)} className="text-slate-500 hover:text-slate-300 transition-colors">
              {showSignupPw ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          }
        />
        <PasswordStrengthBar password={signupPassword} />
      </div>

      <InputField
        label="Confirm Password"
        type={showConfirmPw ? "text" : "password"}
        placeholder="Re-enter your password"
        value={signupConfirm}
        onChange={e => { setSignupConfirm(e.target.value); if(touched.signupConfirm) validate.signupConfirm(); }}
        onBlur={validate.signupConfirm}
        error={touched.signupConfirm ? errors.signupConfirm : null}
        icon={Lock}
        rightElement={
          <button onClick={() => setShowConfirmPw(!showConfirmPw)} className="text-slate-500 hover:text-slate-300 transition-colors">
            {showConfirmPw ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        }
      />

      {signupPassword && (
        <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-white/3 border border-white/5">
          {[
            { rule:"8+ characters",        pass: signupPassword.length >= 8         },
            { rule:"Uppercase letter",      pass: /[A-Z]/.test(signupPassword)       },
            { rule:"Number (0-9)",          pass: /[0-9]/.test(signupPassword)       },
            { rule:"Special char (!@#..)", pass: /[!@#$%^&*]/.test(signupPassword) },
          ].map(({rule,pass}) => (
            <div key={rule} className="flex items-center gap-1.5">
              <span className={`text-[10px] ${pass ? "text-green-400" : "text-slate-600"}`}>{pass ? "✓" : "○"}</span>
              <span className={`text-[10px] ${pass ? "text-green-400" : "text-slate-600"}`}>{rule}</span>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-start gap-2.5 cursor-pointer" onClick={() => setAgreeTerms(!agreeTerms)}>
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${agreeTerms ? "bg-cyan-500 border-cyan-500" : "border-white/20 bg-transparent"}`}>
          {agreeTerms && <span className="text-white text-[9px] font-bold">✓</span>}
        </div>
        <span className="text-slate-500 text-xs select-none leading-relaxed">
          I agree to the <span className="text-cyan-400">Terms of Service</span> and{" "}
          <span className="text-cyan-400">Privacy Policy</span>. I understand that only Gmail accounts are supported.
        </span>
      </label>

      <button onClick={handleSignup} disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
        {loading ? <><Loader2 size={15} className="animate-spin"/>Creating Account...</> : <>Create Account <ArrowRight size={15}/></>}
      </button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#05070f]"
      style={{ backgroundImage:`radial-gradient(ellipse at 30% 20%,rgba(6,182,212,0.08) 0%,transparent 50%), radial-gradient(ellipse at 70% 80%,rgba(59,130,246,0.08) 0%,transparent 50%)` }}>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex w-5/12 flex-col items-center justify-center p-16 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0"
          style={{ backgroundImage:`linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)`, backgroundSize:"50px 50px" }}/>
        <div className="absolute w-80 h-80 rounded-full opacity-10 animate-pulse"
          style={{ background:"radial-gradient(circle,#06b6d4,transparent)", top:"5%", left:"5%" }}/>
        <div className="absolute w-56 h-56 rounded-full opacity-8 animate-pulse"
          style={{ background:"radial-gradient(circle,#3b82f6,transparent)", bottom:"10%", right:"5%", animationDelay:"1.5s" }}/>

        <div className="relative text-center max-w-sm">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-3xl flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,rgba(6,182,212,0.12) 0%,rgba(59,130,246,0.12) 100%)", border:"1px solid rgba(6,182,212,0.2)", boxShadow:"0 0 50px rgba(6,182,212,0.12)" }}>
                <svg viewBox="0 0 120 100" width="90" height="75">
                  <rect x="10" y="40" width="20" height="60" rx="2" fill="rgba(6,182,212,0.3)" stroke="rgba(6,182,212,0.5)" strokeWidth="1"/>
                  <rect x="35" y="20" width="25" height="80" rx="2" fill="rgba(6,182,212,0.4)" stroke="rgba(6,182,212,0.6)" strokeWidth="1"/>
                  <rect x="65" y="30" width="20" height="70" rx="2" fill="rgba(59,130,246,0.3)" stroke="rgba(59,130,246,0.5)" strokeWidth="1"/>
                  <rect x="90" y="50" width="20" height="50" rx="2" fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" strokeWidth="1"/>
                  {[[13,44],[13,54],[23,44],[23,54],[38,24],[38,34],[38,44],[50,24],[50,34],[50,44],[68,34],[68,44],[68,54],[80,34],[80,44],[93,54],[93,64],[105,54]].map(([x,y],i)=>(
                    <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="rgba(6,182,212,0.8)" style={{filter:"drop-shadow(0 0 2px #06b6d4)"}}/>
                  ))}
                  <circle cx="47" cy="90" r="8" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="1"/>
                  {[[20,92],[25,92],[40,92],[50,92],[60,95],[70,92],[85,92],[95,95]].map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r="2" fill="rgba(6,182,212,0.9)"/>
                  ))}
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                <Shield size={16} className="text-white"/>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">CrowdGuard</h1>
          <p className="text-cyan-400/70 text-xs mb-8 font-semibold tracking-[0.2em] uppercase">Privacy-Preserving · AI-Powered</p>

          <div className="mb-8 flex items-center gap-2.5 bg-cyan-500/8 border border-cyan-500/20 rounded-2xl px-4 py-3">
            <Mail size={15} className="text-cyan-400 flex-shrink-0"/>
            <p className="text-cyan-400/80 text-xs text-left leading-relaxed">
              <span className="font-bold text-cyan-400">Gmail only.</span> Only <span className="font-mono">@gmail.com</span> accounts are accepted for security.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5 text-left">
                <CheckCircle size={12} className="text-cyan-400 flex-shrink-0"/>
                <span className="text-slate-400 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="rounded-3xl border border-white/8 p-8"
            style={{ background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)", boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>

            {showForgot ? ForgotPasswordView : (
              <>
                <div className="flex bg-white/5 rounded-xl p-1 mb-7 border border-white/8">
                  {[["login","Login"],["signup","Sign Up"]].map(([t,label]) => (
                    <button key={t} onClick={() => switchTab(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                        ${tab===t ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {tab === "login" ? LoginForm : SignupForm}

                <p className="text-center text-slate-600 text-xs mt-5">
                  {tab==="login" ? "New to CrowdGuard? " : "Already have an account? "}
                  <button onClick={() => switchTab(tab==="login"?"signup":"login")}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    {tab==="login" ? "Create account →" : "Sign in →"}
                  </button>
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Mail size={11} className="text-slate-600"/>
            <p className="text-slate-600 text-[11px]">Requires a valid <span className="font-mono text-slate-500">@gmail.com</span> account</p>
          </div>
        </div>
      </div>
    </div>
  );
}