import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell/StoreShell";
import { NotFoundBoard } from "@/components/layout/NotFound/NotFoundBoard";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function RootNotFound() {
  return (
    <StoreShell>
      <NotFoundBoard />
    </StoreShell>
  );
}
