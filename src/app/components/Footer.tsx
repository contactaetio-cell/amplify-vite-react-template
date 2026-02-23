import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-aetio-blue-950 border-t border-aetio-blue-900 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          {/* Logo and tagline */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <Logo className="text-white" />
            </div>
            <p className="text-slate-400 text-sm">
              Centralized insight knowledge and discovery platform for enterprise teams.
            </p>
          </div>
        </div>

        <div className="border-t border-aetio-blue-900 pt-8 text-center">
          <p className="text-sm text-aetio-blue-400">
            © 2026 Aetio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}