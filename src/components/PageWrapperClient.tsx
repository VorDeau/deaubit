import { useLocation, Outlet } from "react-router-dom";
import AppShell from "./AppShell";
import GlobalSecurityGate from "./GlobalSecurityGate";

export default function PageWrapperClient() {
  const { pathname } = useLocation();

  return (
    <GlobalSecurityGate>
      <AppShell>
        <Outlet />
      </AppShell>
    </GlobalSecurityGate>
  );
}
