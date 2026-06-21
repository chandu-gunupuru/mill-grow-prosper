import { useEffect, useState, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "./Logo";

const STORAGE_KEY = "gmrm_intro_seen";
const SESSION_ATTR = "data-intro-shown";

interface LogoIntroProps {
  children: React.ReactNode;
}

export function LogoIntro({ children }: LogoIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Show intro once per browser session, or if the user cleared storage.
    const seen = false;
    // const seen =
    //   typeof window !== "undefined" &&
    //   (window.sessionStorage.getItem(STORAGE_KEY) === "1" ||
    //     document.body.hasAttribute(SESSION_ATTR));

    if (seen) {
      setShowIntro(false);
      setContentVisible(true);
      return;
    }

    const prefersReducedMotion = false;
    // const prefersReducedMotion =
    //   typeof window !== "undefined" &&
    //   window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      finishIntro();
      return;
    }

    setShowIntro(true);
  }, []);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      document.body.setAttribute(SESSION_ATTR, "true");
    }
    // Small delay before fading the page in so the overlay is gone first.
    requestAnimationFrame(() => {
      setContentVisible(true);
    });
  }, []);

  const handleSkip = useCallback(() => {
    finishIntro();
  }, [finishIntro]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSkip();
      }
    },
    [handleSkip]
  );

  // Do not render anything until client mount to avoid hydration mismatch.
  if (!mounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            role="dialog"
            aria-label="Welcome animation"
            aria-live="polite"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            onClick={handleSkip}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <motion.div
              className="flex cursor-default flex-col items-center"
              variants={{
                hidden: { scale: 0.6, opacity: 0, y: 60 },
                bloom: {
                  scale: [0.6, 1.05, 1],
                  opacity: [0, 1, 1],
                  y: [60, 0, 0],
                  transition: {
                    duration: 2.4,
                    times: [0, 0.35, 0.55],
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
                exit: {
                  scale: 1.15,
                  opacity: 0,
                  y: -120,
                  transition: {
                    duration: 0.7,
                    ease: "easeIn",
                  },
                },
              }}
              initial="hidden"
              animate="bloom"
              exit="exit"
              onAnimationComplete={finishIntro}
              onClick={(e) => e.stopPropagation()}
            >
              <Logo size={120} showText />
              <p className="sr-only">Gayathri Modern Rice Mill is loading</p>
            </motion.div>

            <p
              className="absolute bottom-8 text-xs tracking-widest text-muted-foreground opacity-60"
              aria-hidden="true"
            >
              Press any key to skip
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`transition-opacity duration-700 ease-out ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!contentVisible}
      >
        {children}
      </div>
    </>
  );
}
