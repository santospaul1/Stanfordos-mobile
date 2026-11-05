import { Redirect } from "expo-router";

export default function Index() {
  // Temporary first-stage behavior.
  // We will replace this with an authenticated session check.
  return <Redirect href="/(auth)/login" />;
}
