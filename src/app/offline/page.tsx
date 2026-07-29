import { WifiOff } from "lucide-react";

/**
 * Offline fallback. next-pwa's Workbox config can be extended with a
 * NetworkOnly + fallback strategy pointing navigation requests here when
 * the network is unavailable and nothing is cached for the route yet.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <WifiOff className="size-10 text-muted-foreground" />
      <h1 className="font-display text-xl font-semibold">You're offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cached vocabulary and documents are still available. Reconnect to sync new progress and
        talk to your AI tutor.
      </p>
    </main>
  );
}
