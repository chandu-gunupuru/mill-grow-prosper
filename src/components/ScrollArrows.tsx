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

  const btnBase =
    "w-14 h-14 rounded-full grid place-items-center transition-all duration-200 " +
    "bg-gold border-[3px] border-primary text-primary shadow-gold " +
    "hover:bg-primary hover:border-gold hover:text-primary-foreground hover:shadow-premium hover:scale-110";

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.6, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={btnBase}
          >
            <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.6, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            className={btnBase}
          >
            <ArrowDown className="w-6 h-6" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
