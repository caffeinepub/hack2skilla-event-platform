import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";
import { isAdminSessionActive, setAdminSession } from "../utils/auth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const {
    login,
    isLoggingIn,
    isLoginSuccess,
    isLoginError,
    loginError,
    identity,
  } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const [checking, setChecking] = useState(false);
  const [denied, setDenied] = useState(false);

  // If already have a valid admin session, redirect
  useEffect(() => {
    if (isAdminSessionActive()) {
      void navigate({ to: "/admin" });
    }
  }, [navigate]);

  // After login success, check admin status
  useEffect(() => {
    if (isLoginSuccess && identity && !adminLoading) {
      setChecking(true);
    }
  }, [isLoginSuccess, identity, adminLoading]);

  useEffect(() => {
    if (checking && !adminLoading && isAdmin !== undefined) {
      setChecking(false);
      if (isAdmin) {
        setAdminSession(identity!.getPrincipal().toString());
        void navigate({ to: "/admin" });
      } else {
        setDenied(true);
      }
    }
  }, [checking, adminLoading, isAdmin, identity, navigate]);

  const isProcessing = isLoggingIn || checking || adminLoading;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 60%), linear-gradient(180deg, #050A18, #0A1430)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <div className="glass-card rounded-3xl p-8 border border-neon-purple/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple mx-auto mb-4 flex items-center justify-center shadow-neon-purple">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Connect with Internet Identity to access the dashboard.
            </p>
          </div>

          {/* Denied */}
          {denied && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
              data-ocid="admin_login.error_state"
            >
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Access Denied
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your identity does not have admin privileges.
                </p>
              </div>
            </motion.div>
          )}

          {/* Login error */}
          {isLoginError && loginError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
            >
              <p className="text-sm text-destructive">{loginError.message}</p>
            </motion.div>
          )}

          <Button
            onClick={login}
            disabled={isProcessing}
            className="w-full btn-gradient text-white border-0 h-12 text-base font-semibold"
            data-ocid="admin_login.connect.button"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {checking ? "Verifying admin access..." : "Connecting..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Connect with Internet Identity
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
            Only authorized administrators can access the dashboard. Your
            Internet Identity must be whitelisted.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
