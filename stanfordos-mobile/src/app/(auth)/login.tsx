import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, type Href } from "expo-router";

import { useAuth } from "../../features/auth/AuthContext";
import { DEMO_LOGIN_HINTS } from "../../features/auth/mock-auth.repository";
import { ROLE_HOME_ROUTES } from "../../constants/roles";

export default function LoginScreen() {
  const { login, session, status, isMockAuth } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  if (status === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (session) {
    const dest = ROLE_HOME_ROUTES[session.user.role];
    return <Redirect href={dest as Href} />;
  }

  async function handleLogin() {
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await login({
        identifier: identifier.trim(),
        password,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.brandName}>Stanfordos</Text>
            <Text style={styles.brandSubtitle}>
              School management, wherever you are.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.description}>
              Sign in to access your school account.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="name@school.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                editable={!loading}
              />
              <Pressable
                style={styles.toggle}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
              >
                <Text style={styles.toggleText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>

            {isMockAuth ? (
              <View style={styles.demoSection}>
                <Pressable onPress={() => setShowHints((v) => !v)}>
                  <Text style={styles.demoToggle}>
                    {showHints ? "Hide demo accounts" : "Show demo accounts"}
                  </Text>
                </Pressable>

                {showHints
                  ? DEMO_LOGIN_HINTS.map((hint) => (
                      <Pressable
                        key={hint.email}
                        style={styles.hintRow}
                        onPress={() => {
                          setIdentifier(hint.email);
                          setPassword(hint.password);
                          setError(null);
                        }}
                      >
                        <Text style={styles.hintEmail}>{hint.email}</Text>
                        <Text style={styles.hintRole}>{hint.role}</Text>
                      </Pressable>
                    ))
                  : null}

                <Text style={styles.demoNote}>
                  Password for all demo accounts: password123
                </Text>
              </View>
            ) : null}

            <Text style={styles.footer}>
              Secure access to your school community.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brand: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  brandSubtitle: {
    color: "#64748B",
    marginTop: 6,
    fontSize: 14,
  },
  form: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  passwordRow: {
    position: "relative",
    marginBottom: 20,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 64,
  },
  toggle: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  toggleText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    height: 54,
    backgroundColor: "#1D4ED8",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  demoToggle: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    marginBottom: 6,
  },
  hintEmail: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  hintRole: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  demoNote: {
    marginTop: 8,
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 22,
  },
});
