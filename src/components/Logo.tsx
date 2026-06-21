interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 80, showText = true }: LogoProps) {
  const stroke = "currentColor";

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      aria-label="Gayathri Modern Rice Mill logo"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
        className="text-primary"
      >
        {/* Outer ring */}
        <circle
          cx="60"
          cy="60"
          r="56"
          stroke={stroke}
          strokeWidth="2.5"
          strokeOpacity="0.2"
        />
        {/* Inner badge */}
        <circle cx="60" cy="60" r="44" fill="var(--color-cream)" fillOpacity="0.12" />
        {/* Stylised rice grain / leaf */}
        <path
          d="M60 30c-8 12-18 24-18 38 0 10 8 18 18 18s18-8 18-18C78 54 68 42 60 30z"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="var(--color-primary)"
          fillOpacity="0.15"
        />
        <path
          d="M60 48v30"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Small accent grains */}
        <circle cx="42" cy="80" r="4" fill="var(--color-gold)" />
        <circle cx="78" cy="80" r="4" fill="var(--color-gold)" />
        <circle cx="60" cy="92" r="4" fill="var(--color-gold)" />
      </svg>

      {showText && (
        <div className="text-center">
          <p className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            Gayathri
          </p>
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Modern Rice Mill
          </p>
        </div>
      )}
    </div>
  );
}
