import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  Screen,
  Card,
  Button,
  EmptyState,
  ErrorBanner,
} from "../../../components/ui";
import { Brand } from "../../../constants/brand";
import { mockAnnouncementsService } from "../../../features/announcements/mock-announcements";
import type { AnnouncementItem } from "../../../features/announcements/types";
import { useOnline } from "../../../hooks/use-online";

export default function TeacherAnnouncementsScreen() {
  const { online, requireOnline } = useOnline();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await mockAnnouncementsService.listForTeacher());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handlePost() {
    setError(null);
    setPosting(true);
    try {
      requireOnline();
      await mockAnnouncementsService.create({
        title,
        body,
        audience: "CLASS",
        classSectionName: "Form 1A",
      });
      setTitle("");
      setBody("");
      setShowComposer(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post announcement.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Announcements</Text>
          <Pressable onPress={() => setShowComposer((v) => !v)}>
            <Text style={styles.link}>
              {showComposer ? "Cancel" : "New"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          School and class notices. Posting requires a live connection.
        </Text>
      </View>

      {error ? <ErrorBanner message={error} /> : null}

      {showComposer ? (
        <Card style={styles.composer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Announcement title"
          />
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={body}
            onChangeText={setBody}
            placeholder="Write your message"
            multiline
            textAlignVertical="top"
          />
          <Button
            title={online ? "Post announcement" : "Connect to post"}
            onPress={handlePost}
            loading={posting}
            disabled={!online || posting}
          />
        </Card>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState title="No announcements" />
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <Card key={item.id}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMeta}>
                {item.authorName}
                {item.classSectionName ? ` · ${item.classSectionName}` : ""}
                {" · "}
                {item.audience}
              </Text>
              <Text style={styles.itemBody}>{item.body}</Text>
              <Text style={styles.itemDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18 },
  back: { color: Brand.primary, fontSize: 16, fontWeight: "700", marginBottom: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "800", color: Brand.text },
  link: { color: Brand.primary, fontSize: 15, fontWeight: "700" },
  subtitle: { marginTop: 6, fontSize: 14, color: Brand.textSecondary, lineHeight: 20 },
  composer: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.text,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  textarea: { minHeight: 100 },
  center: { paddingVertical: 48, alignItems: "center" },
  list: { gap: 10 },
  itemTitle: { fontSize: 16, fontWeight: "700", color: Brand.text },
  itemMeta: { marginTop: 4, fontSize: 12, color: Brand.textSecondary },
  itemBody: { marginTop: 10, fontSize: 14, color: Brand.text, lineHeight: 20 },
  itemDate: { marginTop: 10, fontSize: 11, color: Brand.textMuted },
});
