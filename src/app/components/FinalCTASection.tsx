import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-aetio-blue-950 to-aetio-blue-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-aetio-blue-400 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Make Every Insight Count.
          </h2>
          <p className="text-xl text-aetio-blue-200 mb-10 max-w-2xl mx-auto">
            Transform how your organization discovers, shares, and leverages research intelligence.
          </p>
          
          <motion.a
            href="mailto:contactaetio@gmail.com?subject=Schedule%20Demo&body=Hi%2C%20I%27d%20like%20to%20schedule%20a%20demo%20of%20Aetio."
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-white text-aetio-blue-950 rounded-lg font-semibold text-lg flex items-center gap-2 hover:bg-aetio-blue-50 transition-colors shadow-2xl shadow-black/20 mx-auto"
          >
            Schedule Demo
            <ArrowRight className="w-5 h-5" />
          </motion.a>

          <p className="text-sm text-aetio-blue-400 mt-6">
            Join leading enterprises making insights accessible to every team.
          </p>
        </motion.div>
      </div>
    </section>
  );
}