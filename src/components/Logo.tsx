import { Leaf } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 80, showText = true }: LogoProps) {
  // Match the site header logo: gold gradient tile + leaf, with brand wordmark.
  const iconBox = size;
  const leafSize = Math.round(size * 0.55);

  return (
    <div
      className={`flex items-center gap-4 ${className}`}
      aria-label="Gayathri Modern Rice Mill logo"
    >
      <div
        className="rounded-xl bg-gradient-gold grid place-items-center shadow-gold"
        style={{ width: iconBox, height: iconBox }}
      >
        <Leaf style={{ width: leafSize, height: leafSize }} className="text-primary" />
      </div>

      {showText && (
        <div className="leading-tight text-left">
          <p className="font-display font-bold text-primary text-3xl md:text-4xl tracking-tight">
            Gayathri
          </p>
          <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Modern Rice Mill
          </p>
        </div>
      )}
    </div>
  );
}
