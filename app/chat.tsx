import { IConversation, IUser } from "@/interface";
import { getAllConversations } from "@/util/firestore";
import { readData } from "@/util/storage";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Clipboard from "expo-clipboard";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";

// ─── Config ──────────────────────────────────────────────────────────────────
// Set this to your deployed Next.js URL (or localhost for dev)
const API_BASE_URL = "https://freelancematebackend.vercel.app";

// ─────────────────────────────────────────────────────────────────────────────

export default function Chat() {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [user, setUser] = useState<IUser>();
  const flatListRef = useRef<FlatList>(null);

  // ── Send message ──────────────────────────────────────────────────────────
  const handlePrompt = async () => {
    if (!prompt.trim()) return;

    const currentUser = user ?? ((await readData("user")) as IUser | undefined);
    if (!user && currentUser) setUser(currentUser);

    // Optimistically add the user message to the list while waiting
    const optimisticEntry: IConversation = {
      id: `temp-${Date.now()}`,
      userId: currentUser?.id ?? "anonymous",
      prompt,
      response: "", // placeholder — will be replaced on success
      createdAt: "",
    };
    setConversations((prev) => [...prev, optimisticEntry]);
    const sentPrompt = prompt;
    setPrompt("");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: sentPrompt,
          user: currentUser
        }),
      });

      if (!res.ok) {
        let errorText = "Unknown error";
        try {
          const errorJson = await res.json();
          errorText = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorText = await res.text();
        }
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const json = await res.json();
      const { response, conversation } = json as {
        response: string;
        conversation: IConversation;
      };

      // Replace the optimistic entry with the real one
      setConversations((prev) =>
        prev.map((c) =>
          c.id === optimisticEntry.id ? { ...conversation, response } : c
        )
      );
    } catch (error) {
      console.error("[Chat] handlePrompt error:", error);
      // Remove the optimistic entry and show an error
      setConversations((prev) =>
        prev.filter((c) => c.id !== optimisticEntry.id)
      );
      Alert.alert(
        "Error",
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Load conversation history ─────────────────────────────────────────────
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await getAllConversations();
      if (res.success) setConversations(res.data);
    } catch (error) {
      console.error("[Chat] fetchConversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    (async () => {
      const _user = await readData("user");
      setUser(_user as IUser);
    })();
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (conversations.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversations]);

  const headerHeight = useHeaderHeight();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          className="flex-1 bg-gray-50"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={headerHeight}
        >
          <View className="flex-1 bg-gray-50">
            {conversations.length === 0 && !loading && (
              <View className="flex-1 justify-center items-center px-6">
                <View className="bg-white rounded-full p-4 mb-4">
                  <Ionicons name="chatbubbles" size={48} color="#10a37f" />
                </View>
                <Text className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                  How can I help you today?
                </Text>
                <Text className="text-gray-500 text-center text-base">
                  Ask me anything about your invoices, expenses, or profile
                </Text>
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={conversations}
              className="flex-1"
              contentContainerStyle={{
                paddingBottom: 20,
                paddingTop: 20,
                flexGrow: conversations.length === 0 ? 1 : 0,
              }}
              renderItem={({ item }) => (
                <View className="mb-6">
                  {/* User message */}
                  <View className="px-4 mb-4">
                    <View className="flex-row justify-end">
                      <View className="max-w-[85%]">
                        <View className="bg-[#10a37f] rounded-3xl rounded-tr-sm px-5 py-3.5 shadow-sm">
                          <Text className="text-white text-[15px] leading-6 font-normal">
                            {item.prompt}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* AI response */}
                  <View className="px-4">
                    <View className="flex-row">
                      <View className="mr-3 mt-1">
                        <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                          <Ionicons name="sparkles" size={18} color="#10a37f" />
                        </View>
                      </View>
                      <View className="flex-1 max-w-[85%]">
                        {item.response ? (
                          <>
                            <View className="bg-white rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100">
                              <Markdown
                                style={{
                                  body: {
                                    fontSize: 15,
                                    lineHeight: 24,
                                    color: "#374151",
                                    fontFamily: "System",
                                  },
                                  paragraph: { marginTop: 0, marginBottom: 12 },
                                  heading1: {
                                    fontSize: 20,
                                    fontWeight: "600",
                                    marginBottom: 8,
                                    marginTop: 16,
                                  },
                                  heading2: {
                                    fontSize: 18,
                                    fontWeight: "600",
                                    marginBottom: 8,
                                    marginTop: 16,
                                  },
                                  code_inline: {
                                    backgroundColor: "#f3f4f6",
                                    paddingHorizontal: 4,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    fontSize: 14,
                                  },
                                  code_block: {
                                    backgroundColor: "#f3f4f6",
                                    padding: 12,
                                    borderRadius: 8,
                                    marginVertical: 8,
                                  },
                                  list_item: { marginBottom: 4 },
                                }}
                              >
                                {item.response}
                              </Markdown>
                            </View>
                            <TouchableOpacity
                              onPress={async () => {
                                await Clipboard.setStringAsync(item.response);
                                Alert.alert(
                                  "Copied!",
                                  "Response copied to clipboard"
                                );
                              }}
                              className="flex-row items-center gap-1.5 mt-2 ml-2"
                            >
                              <Ionicons
                                name="copy-outline"
                                size={16}
                                color="#6b7280"
                              />
                              <Text className="text-gray-500 text-sm font-medium">
                                Copy
                              </Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          // Loading state for optimistic entry
                          <View className="bg-white rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100">
                            <ActivityIndicator size="small" color="#10a37f" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id as string}
              showsVerticalScrollIndicator={false}
            />

            {/* Input bar */}
            <View className="bg-white border-t border-gray-200 px-4 py-3">
              <View className="flex-row items-end bg-white rounded-3xl border border-gray-300 shadow-sm">
                <TextInput
                  className="flex-1 px-5 py-4 text-[15px] text-gray-800 max-h-32"
                  placeholder="Message..."
                  placeholderTextColor="#9ca3af"
                  autoCorrect={false}
                  returnKeyType="send"
                  autoCapitalize="sentences"
                  multiline
                  value={prompt}
                  onSubmitEditing={handlePrompt}
                  onChangeText={setPrompt}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={handlePrompt}
                  disabled={!prompt.trim() || loading}
                  className="mr-3 mb-2 mt-2"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#10a37f" />
                  ) : (
                    <View className="bg-[#10a37f] rounded-full p-2.5">
                      <Ionicons name="send" size={20} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <StatusBar style="auto" />
    </>
  );
}