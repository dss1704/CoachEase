import type { ReactNode } from "react";
import ProtectedWorkspace from "@/components/workspace/protected";
export default function ClientsLayout({ children }: { children: ReactNode }) {
  return <ProtectedWorkspace>{children}</ProtectedWorkspace>;
}
