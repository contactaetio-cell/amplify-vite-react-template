import { motion } from "motion/react";
import { NetworkVisualization } from "./NetworkVisualization";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "./Logo";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-aetio-blue-950 to-aetio-blue-900">
      {/* Background network visualization */}
      <div className="absolute inset-0 text-aetio-blue-400/20">
        <NetworkVisualization />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Logo behind text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Logo variant="icon" className="w-[20rem] h-[20rem] md:w-[28rem] md:h-[28rem] text-white" />
          </motion.div>
          
          <h1 className="relative text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Insights Made Visible.<br />
            <span className="text-aetio-blue-400">Insights Made Valuable.</span>
          </h1>
          
          <p className="relative text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Centralize product research and analytics insights so teams can find, trust, and act on data faster.
          </p>
          
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="mailto:contactaetio@gmail.com?subject=Request%20Demo&body=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Aetio."
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-aetio-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-aetio-blue-700 transition-colors shadow-lg shadow-aetio-blue-600/30"
            >
              Request Demo
              <ArrowRight className="w-5 h-5" />
            </motion.a>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/product"
                className="px-8 py-4 bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <PlayCircle className="w-5 h-5" />
                See Platform Overview
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </section>
  );
}