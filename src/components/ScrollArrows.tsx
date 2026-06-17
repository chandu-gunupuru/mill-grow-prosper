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
    <div className="fixed right-5 bottom-10 z-[60] flex flex-col gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ duration: 0.25 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-12 h-12 rounded-full bg-card/95 backdrop-blur-md border-2 border-border text-foreground shadow-premium grid place-items-center hover:border-primary hover:text-primary hover:scale-110 transition-all"
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
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
            className="w-12 h-12 rounded-full bg-card/95 backdrop-blur-md border-2 border-border text-foreground shadow-premium grid place-items-center hover:border-gold hover:text-primary hover:scale-110 transition-all"
          >
            <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

