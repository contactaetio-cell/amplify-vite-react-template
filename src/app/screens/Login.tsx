import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Logo } from "../components/Logo";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Shield,
} from "lucide-react";

// =============================================================================
// AWS COGNITO CONFIGURATION
// Replace these placeholder values with your actual AWS Cognito configuration.
//
// 1. Create a Cognito User Pool in the AWS Console
// 2. Configure App Client with OAuth 2.0 settings
// 3. Enable the identity providers you want (Google, Microsoft/Azure AD, SAML)
// 4. Set the callback URLs to include your domain + /login
//
// Example integration with AWS Amplify:
//   import { Amplify } from 'aws-amplify';
//   import { signIn, signUp, signInWithRedirect } from 'aws-amplify/auth';
//
//   Amplify.configure({
//     Auth: {
//       Cognito: {
//         userPoolId: AWS_CONFIG.userPoolId,
//         userPoolClientId: AWS_CONFIG.userPoolClientId,
//         loginWith: {
//           oauth: {
//             domain: AWS_CONFIG.oauthDomain,
//             scopes: ['openid', 'email', 'profile'],
//             redirectSignIn: [window.location.origin + '/login'],
//             redirectSignOut: [window.location.origin],
//             responseType: 'code',
//           },
//         },
//       },
//     },
//   });
// =============================================================================
const AWS_CONFIG = {
  region: "us-east-2", // e.g. "us-east-1"
  userPoolId: "us-east-2_r5A98BgtA", // e.g. "us-east-1_aBcDeFgHi"
  userPoolClientId: "1evpd4jv92bo5qeot0krfuc593", // e.g. "1a2b3c4d5e6f7g8h9i0j"
  oauthDomain: "cognito-idp.us-east-2.amazonaws.com/us-east-2_r5A98BgtA", // e.g. "aetio.auth.us-east-1.amazoncognito.com"
  identityProviders: {
    google: "Google",
    microsoft: "AzureAD", // or your configured OIDC provider name
    saml: "YourSAMLProvider", // your enterprise SAML provider name
  },
};

// The published Enterprise Insight Discovery Platform dashboard.
// After successful authentication, users are redirected here.
const DASHBOARD_URL = "https://pug-plasma-05079230.figma.site";

type AuthMode = "signin" | "signup";

export default function Login() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  console.log("sign in")
  // ---------------------------------------------------------------------------
  // AWS Cognito Auth Handlers (placeholder implementations)
  // Replace these with actual AWS Amplify / Cognito SDK calls.
  // ---------------------------------------------------------------------------

  const redirectToDashboard = () => {
    window.location.href = DASHBOARD_URL;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        // AWS Amplify: await signIn({ username: email, password });
        console.log("Sign in with:", { email, password });
        console.log("AWS Config:", AWS_CONFIG);

        // Simulated delay, then redirect to the platform dashboard
        await new Promise((r) => setTimeout(r, 1500));
        redirectToDashboard();
      } else {
        // AWS Amplify: await signUp({
        //   username: email,
        //   password,
        //   options: { userAttributes: { email, name: fullName } }
        // });
        console.log("Sign up with:", { email, password, fullName });

        await new Promise((r) => setTimeout(r, 1500));
        // After sign-up, redirect to dashboard (or show verification step)
        redirectToDashboard();
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (
    provider: "google" | "microsoft" | "saml"
  ) => {
    setError("");
    setIsLoading(true);

    try {
      // AWS Amplify: await signInWithRedirect({
      //   provider: { custom: AWS_CONFIG.identityProviders[provider] }
      // });
      //
      // For Google specifically:
      //   await signInWithRedirect({ provider: 'Google' });
      //
      // For Microsoft/Azure AD:
      //   await signInWithRedirect({ provider: { custom: 'AzureAD' } });

      console.log(`Social sign-in with ${provider}`);
      console.log(
        "Would redirect to:",
        `https://${AWS_CONFIG.oauthDomain}/oauth2/authorize`
      );

      // Simulated delay, then redirect to the platform dashboard
      await new Promise((r) => setTimeout(r, 1000));
      redirectToDashboard();
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aetio-blue-950 flex flex-col">
      {/* Top bar with logo */}
      <div className="px-6 py-5">
        <Link to="/">
          <Logo className="text-white" />
        </Link>
      </div>

      {/* Main centered auth card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-aetio-blue-900/70 border border-aetio-blue-800 rounded-2xl p-8 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl text-white mb-2">
                {mode === "signin"
                  ? "Welcome back"
                  : "Create your account"}
              </h1>
              <p className="text-aetio-blue-300 text-sm">
                {mode === "signin"
                  ? "Sign in to access your insight platform"
                  : "Get started with Aetio in seconds"}
              </p>
            </div>

            {/* Social / SSO buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialSignIn("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.07] border border-aetio-blue-700 rounded-lg text-white hover:bg-white/[0.12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-sm">Continue with Google</span>
              </button>

              <button
                onClick={() => handleSocialSignIn("microsoft")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.07] border border-aetio-blue-700 rounded-lg text-white hover:bg-white/[0.12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                <span className="text-sm">Continue with Microsoft</span>
              </button>

              <button
                onClick={() => handleSocialSignIn("saml")}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.07] border border-aetio-blue-700 rounded-lg text-white hover:bg-white/[0.12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Building2 className="w-5 h-5 text-aetio-blue-300" />
                <span className="text-sm">Continue with Enterprise SSO</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-aetio-blue-700/50" />
              <span className="text-xs text-aetio-blue-400 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-aetio-blue-700/50" />
            </div>

            {/* Email / Password form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm text-aetio-blue-200 mb-1.5">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aetio-blue-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-aetio-blue-800/50 border border-aetio-blue-700 rounded-lg text-white placeholder:text-aetio-blue-500 focus:outline-none focus:ring-2 focus:ring-aetio-blue-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm text-aetio-blue-200 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aetio-blue-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-aetio-blue-800/50 border border-aetio-blue-700 rounded-lg text-white placeholder:text-aetio-blue-500 focus:outline-none focus:ring-2 focus:ring-aetio-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-aetio-blue-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aetio-blue-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "signup"
                        ? "Min. 8 characters"
                        : "Enter your password"
                    }
                    className="w-full pl-10 pr-11 py-2.5 bg-aetio-blue-800/50 border border-aetio-blue-700 rounded-lg text-white placeholder:text-aetio-blue-500 focus:outline-none focus:ring-2 focus:ring-aetio-blue-500 focus:border-transparent text-sm"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-aetio-blue-400 hover:text-aetio-blue-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-aetio-blue-400 hover:text-aetio-blue-200 transition-colors"
                    onClick={() =>
                      alert(
                        "Forgot password placeholder — wire up Cognito's forgotPassword flow."
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 bg-aetio-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-aetio-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Toggle sign in / sign up */}
            <div className="mt-6 text-center">
              <p className="text-sm text-aetio-blue-400">
                {mode === "signin"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError("");
                  }}
                  className="text-aetio-blue-200 hover:text-white transition-colors underline underline-offset-2"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Security note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-aetio-blue-500"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Secured by AWS Cognito with enterprise-grade encryption</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}