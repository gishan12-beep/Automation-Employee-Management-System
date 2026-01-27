import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordFirstLoginApi } from "../../../services/authService";

export default function ChangePassword() {
  const navigate = useNavigate();

  // ✅ read from localStorage (matches Login.jsx & PrivateRoute approach)
  const token = localStorage.getItem("token") || "";
  const username =
    localStorage.getItem("role") === "EMPLOYEE"
      ? localStorage.getItem("employee_id") || "Employee"
      : "Employee";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!token) {
      setErr("Session expired. Please login again.");
      return;
    }
    if (!newPassword || !confirm) {
      setErr("Please fill all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ✅ First-login change password (no current password needed)
      await changePasswordFirstLoginApi(token, newPassword);

      // ✅ unlock employee routes (AppRoutes reads this)
      localStorage.setItem("must_change_password", "0");

      setMsg("Password updated successfully. Redirecting...");
      setTimeout(() => navigate("/employee/dashboard", { replace: true }), 600);
    } catch (e2) {
      setErr(e2?.message || "Change password failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("must_change_password");
    navigate("/", { replace: true });
  };

  return (
    <div className="page-wrapper">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        .floating-circle { position: absolute; border-radius: 50%; pointer-events: none; z-index: 0; }
        .fc-1 { animation: float 20s ease-in-out infinite; background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%); width: 400px; height: 400px; top: -100px; left: -100px; }
        .fc-2 { animation: floatReverse 25s ease-in-out infinite; background: radial-gradient(circle, rgba(56, 142, 60, 0.06) 0%, transparent 70%); width: 350px; height: 350px; bottom: -80px; right: -80px; }
        .fc-3 { animation: float 18s ease-in-out infinite; background: radial-gradient(circle, rgba(67, 160, 71, 0.05) 0%, transparent 70%); width: 250px; height: 250px; top: 20%; right: 10%; }

        .page-wrapper { min-height: 100vh; display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden; background: #f6f7fb; padding: 20px; }
        
        .card { 
          width: 100%; 
          max-width: 440px; 
          background: rgba(255, 255, 255, 0.8); 
          backdrop-filter: blur(12px); 
          border: 1px solid rgba(255, 255, 255, 0.5); 
          border-radius: 24px; 
          padding: 40px; 
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); 
          position: relative; 
          z-index: 1; 
        }

        .title { font-size: 28px; font-weight: 900; color: #2c5530; margin-bottom: 8px; }
        .sub { color: #4b5563; font-size: 15px; margin-bottom: 24px; font-weight: 500; }

        .alert { padding: 12px 16px; border-radius: 12px; font-weight: 800; font-size: 13px; margin-bottom: 16px; }
        .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

        .label { display: block; margin-bottom: 8px; font-weight: 800; font-size: 11px; color: #6b7280; text-transform: uppercase; }
        .input { width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 700; outline: none; background: #fff; transition: all 0.2s; margin-bottom: 16px; }
        .input:focus { border-color: #4a7c4e; box-shadow: 0 0 0 3px rgba(74, 124, 78, 0.1); }

        .checkbox-row { display: flex; alignItems: center; gap: 10px; margin-bottom: 24px; cursor: pointer; }
        .checkbox-row input { cursor: pointer; }
        .checkbox-row label { fontSize: 13; color: #4b5563; fontWeight: 600; cursor: pointer; }

        .btn { width: 100%; padding: 14px; border-radius: 14px; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; border: none; }
        .btn-primary { background: linear-gradient(135deg, #4a7c4e 0%, #5a8c5e 100%); color: #fff; box-shadow: 0 4px 15px rgba(74, 124, 78, 0.15); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-ghost { background: transparent; border: 1px solid #e5e7eb; color: #4b5563; margin-top: 12px; }
        .btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
      `}</style>

      <div className="floating-circle fc-1"></div>
      <div className="floating-circle fc-2"></div>
      <div className="floating-circle fc-3"></div>

      <div className="card">
        <h2 className="title">Set New Password</h2>
        <p className="sub">Hi {username}, please set a new password to continue.</p>

        {err && <div className="alert alert-error">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}

        <form onSubmit={onSubmit}>
          <label className="label">New Password</label>
          <input
            className="input"
            type={show ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Min 8 characters"
          />

          <label className="label">Confirm New Password</label>
          <input
            className="input"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Repeat new password"
          />

          <div
            className="checkbox-row"
            onClick={() => setShow(!show)}
          >
            <input
              type="checkbox"
              checked={show}
              onChange={() => { }}
              onClick={(e) => e.stopPropagation()}
            />
            <label>Show passwords</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
