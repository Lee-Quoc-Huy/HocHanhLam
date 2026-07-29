import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { LANGUAGE_LIST } from "@/config/languages";
import { BookOpenText, LayoutDashboard } from "lucide-react";

export default function MarketingHomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
        Personal AI Language Learning OS
      </span>
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-xl text-muted-foreground">{siteConfig.description}</p>

      <div className="flex flex-wrap justify-center gap-3">
        {LANGUAGE_LIST.map((lang) => (
          <span
            key={lang.code}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
            style={{ borderColor: `hsl(var(--${lang.accentToken}) / 0.4)` }}
          >
            {lang.flagEmoji} {lang.label}
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <Button asChild size="lg" className="gap-2">
          <Link href="/vocabulary">
            <BookOpenText className="size-4" /> Open Vocabulary Vault
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="gap-2">
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}
