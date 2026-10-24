import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import CustomCursor from "@/components/layout/CustomCursor";
import ScrollProgress from "@/components/layout/ScrollProgress";

/**
 * All client-side context lives here so the root layout stays a Server Component.
 * The session is read on the server and handed down, which avoids an extra
 * client fetch on first paint.
 */
export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <ToastProvider>
        <ScrollProgress />
        <CustomCursor />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
