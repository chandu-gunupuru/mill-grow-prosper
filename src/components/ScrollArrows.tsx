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
    "bg-[#dc2626] border-[3px] border-white text-white " +
    "shadow-[0_8px_24px_-4px_rgba(220,38,38,0.6)] " +
    "hover:bg-[#b91c1c] hover:scale-110 hover:shadow-[0_12px_32px_-4px_rgba(220,38,38,0.75)]";

  return (
    <div className="fixed right-6 bottom-8 z-[60] flex flex-col items-center gap-3">
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
            <ArrowUp className="w-6 h-6" strokeWidth={3} />
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
            <ArrowDown className="w-6 h-6" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
