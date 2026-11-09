import { Stack } from "expo-router";
import { RoleGuard } from "../../features/auth/RoleGuard";

export default function Layout() {
  return (
    <RoleGuard role="PLATFORM_ADMIN">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGuard>
  );
}
