import type { ReactNode } from "react";
import ProtectedWorkspace from "@/components/workspace/protected";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedWorkspace>{children}</ProtectedWorkspace>;
}
