import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ColorThemeSwitcher } from "@/components/ColorThemeSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountNav } from "@/components/AccountNav";

export function AccountLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {


  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex items-center justify-between py-4 px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-sm md:text-base font-semibold truncate">{title}</h1>
          <div className="flex items-center justify-end w-20">
            <ColorThemeSwitcher />
<ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-6 md:py-8 grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <AccountNav />


        {/* Content */}
        <section className="min-w-0">
          <div className="mb-5">
            <h2 className="text-2xl font-display font-bold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
