import { StoreShell } from "@/components/layout/StoreShell/StoreShell";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
