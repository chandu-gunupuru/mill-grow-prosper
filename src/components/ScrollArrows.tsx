import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

export function ScrollArrows() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60]">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-12 h-12 rounded-full grid place-items-center bg-primary text-primary-foreground border-2 border-primary-foreground shadow-lg hover:scale-110 transition-transform"
          >
            <ArrowUp className="w-5 h-5" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
