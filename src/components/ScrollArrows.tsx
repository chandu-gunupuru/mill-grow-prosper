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
    "w-[52px] h-[52px] rounded-full grid place-items-center transition-all duration-200 " +
    "bg-card border-2 border-primary/40 text-primary shadow-premium " +
    "hover:bg-primary hover:border-primary hover:text-primary-foreground hover:shadow-gold hover:scale-110 hover:-translate-y-0.5";

  return (
    <div className="fixed right-6 bottom-10 z-[60] flex flex-col gap-3">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 14 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={btnBase}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -14 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            className={btnBase}
          >
            <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}


