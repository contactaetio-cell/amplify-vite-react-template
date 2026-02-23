import { motion } from "motion/react";
import { Logo } from "./Logo";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-aetio-blue-950/90 backdrop-blur-lg border-b border-aetio-blue-900/50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Logo className="text-white" />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-aetio-blue-200 hover:text-white text-sm transition-colors"
            >
              Log In
            </Link>
            <motion.a
              href="mailto:contactaetio@gmail.com?subject=Request%20Demo&body=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Aetio."
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-aetio-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-aetio-blue-700 transition-colors"
            >
              Request Demo
            </motion.a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-aetio-blue-900 pt-4"
          >
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                className="px-5 py-2 text-aetio-blue-200 hover:text-white text-sm transition-colors text-center"
              >
                Log In
              </Link>
              <a
                href="mailto:contactaetio@gmail.com?subject=Request%20Demo&body=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Aetio."
                className="px-5 py-2 bg-aetio-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-aetio-blue-700 transition-colors text-center"
              >
                Request Demo
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}