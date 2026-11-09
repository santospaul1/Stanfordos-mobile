import { Stack } from "expo-router";
import { RoleGuard } from "../../features/auth/RoleGuard";

export default function Layout() {
  return (
    <RoleGuard role="ADMIN">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGuard>
  );
}
