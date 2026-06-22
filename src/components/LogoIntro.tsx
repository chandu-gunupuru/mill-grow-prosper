import { useEffect, useState, useCallback, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Logo } from "./Logo";

const STORAGE_KEY = "gmrm_intro_seen";
const SESSION_ATTR = "data-intro-shown";

// Module-level guard: prevents a second play within the same page load
// (e.g. React StrictMode double-invoking effects, or remounts).
let introHasPlayed = false;

interface LogoIntroProps {
  children: React.ReactNode;
}

export function LogoIntro({ children }: LogoIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    const seen =
      typeof window !== "undefined" &&
      (introHasPlayed ||
        window.localStorage.getItem(STORAGE_KEY) === "1" ||
        document.body.hasAttribute(SESSION_ATTR));

    if (seen) {
      setShowIntro(false);
      setContentVisible(true);
      return;
    }

    // Claim the intro slot synchronously so a second effect run can't replay it.
    introHasPlayed = true;
    if (typeof window !== "undefined") {
      document.body.setAttribute(SESSION_ATTR, "true");
      window.localStorage.setItem(STORAGE_KEY, "1");
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      finishIntro();
      return;
    }

    setShowIntro(true);
  }, []);

  const finishIntro = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
      document.body.setAttribute(SESSION_ATTR, "true");
    }
    // Reveal the site immediately, then unmount the overlay in the same tick.
    setContentVisible(true);
    setShowIntro(false);
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
      {showIntro && (
        <div
          role="dialog"
          aria-label="Welcome animation"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          onClick={handleSkip}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <motion.div
            className="flex cursor-default flex-col items-center"
            initial={{ scale: 0.6, opacity: 0, y: 60 }}
            animate={{
              scale: [0.6, 1.05, 1, 1],
              opacity: [0, 1, 1, 1],
              y: [60, 0, 0, 0],
            }}
            transition={{
              duration: 2,
              times: [0, 0.4, 0.6, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
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
        </div>
      )}

      <div aria-hidden={!contentVisible && showIntro}>{children}</div>
    </>
  );
}
