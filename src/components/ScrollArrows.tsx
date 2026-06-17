import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function ScrollArrows() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setShowTop(scrolled > 300);
      setShowBottom(docHeight > 300 && scrolled < docHeight - 300);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () => {
    const docHeight = document.documentElement.scrollHeight;
    window.scrollTo({ top: docHeight, behavior: "smooth" });
  };

  return (
    <div className="fixed right-5 bottom-8 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ duration: 0.25 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center hover:scale-110 transition-transform"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -10 }}
            transition={{ duration: 0.25 }}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            className="w-11 h-11 rounded-full bg-gold text-primary shadow-lg shadow-gold/30 grid place-items-center hover:scale-110 transition-transform"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
