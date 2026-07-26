import logoMark from "@/assets/gmrm-logo-mark.png";
import logoFull from "@/assets/gmrm-logo-full.png";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  /** When true, render the full branded logo (with wordmark & ribbon). */
  full?: boolean;
}

export function Logo({ className = "", size = 80, showText = true, full = false }: LogoProps) {
  // Full branded logo — used on the splash screen.
  if (full) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        aria-label="Gayathri Modern Rice Mill logo"
      >
        <img
          src={logoFull}
          alt="Gayathri Modern Rice Mill"
          width={size}
          height={size}
          className="h-auto w-auto select-none drop-shadow-xl"
          style={{ maxWidth: size, maxHeight: size }}
          draggable={false}
        />
      </div>
    );
  }

  // Navbar / compact usage — square mark + optional wordmark.
  const iconBox = size;

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-label="Gayathri Modern Rice Mill logo"
    >
      <img
        src={logoMark}
        alt="Gayathri Modern Rice Mill"
        width={iconBox}
        height={iconBox}
        className="rounded-xl object-contain shadow-gold ring-1 ring-border/60 bg-cream"
        style={{ width: iconBox, height: iconBox }}
        draggable={false}
      />

      {showText && (
        <div className="leading-tight text-left">
          <p className="font-display font-bold text-primary text-2xl md:text-3xl tracking-tight">
            Gayathri
          </p>
          <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Modern Rice Mill
          </p>
        </div>
      )}
    </div>
  );
}
