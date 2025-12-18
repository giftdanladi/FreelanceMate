import { IConversation, IUser } from "@/interface";
import {
  addChat,
  getAllConversations,
  getExpenseStats,
  getInvoiceStats,
  getSalesStatsThisMonth,
} from "@/util/firestore";
import { readData } from "@/util/storage";
import { Ionicons } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Markdown from "react-native-markdown-display";

export default function Chat() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [user, setUser] = useState<IUser>();
  const flatListRef = useRef<FlatList>(null);

  const ai = new GoogleGenAI({
    apiKey: Constants?.expoConfig?.extra?.GENAI_API_KEY,
  });

  const handlePrompt = async () => {
    const currentUser = user || ((await readData("user")) as IUser | undefined);
    if (!user && currentUser) {
      setUser(currentUser);
    }

    try {
      setLoading(true);
      const lowerPrompt = prompt.toLowerCase();

      // Handle invoice count questions with real data
      if (lowerPrompt.includes("invoice")) {
        const isAskingHowMany =
          lowerPrompt.includes("how many") ||
          lowerPrompt.includes("number of") ||
          lowerPrompt.includes("get total") ||
          lowerPrompt.includes("count of") ||
          lowerPrompt.includes("total invoice") ||
          lowerPrompt.includes("total invoices");

        const mentionsPending = lowerPrompt.includes("pending");
        const mentionsOverdue = lowerPrompt.includes("overdue");
        const mentionsPaid = lowerPrompt.includes("paid") || lowerPrompt.includes("completed");

        if (isAskingHowMany || mentionsPending || mentionsOverdue || mentionsPaid) {
          const statsRes = await getInvoiceStats();

          if (statsRes.success) {
            const { total, paid, pending, overdue } = statsRes.data as {
              total: number;
              paid: number;
              pending: number;
              overdue: number;
            };

            let statsResponse = "";

            if (mentionsPending && !mentionsOverdue && !mentionsPaid) {
              statsResponse = `You currently have ${pending} pending invoice${pending === 1 ? "" : "s"}.`;
            } else if (mentionsOverdue && !mentionsPending && !mentionsPaid) {
              statsResponse = `You currently have ${overdue} overdue invoice${overdue === 1 ? "" : "s"}.`;
            } else if (mentionsPaid && !mentionsPending && !mentionsOverdue) {
              statsResponse = `You currently have ${paid} paid invoice${paid === 1 ? "" : "s"}.`;
            } else {
              statsResponse = `You currently have ${total} invoice${total === 1 ? "" : "s"} in total: ${paid} paid, ${pending} pending, and ${overdue} overdue.`;
            }

            const data = {
              id: Math.random().toString(),
              userId: currentUser?.id as string,
              prompt: prompt,
              response: statsResponse,
              createdAt: "",
            };

            setConversations((prev) => [...prev, data]);
            setResponse(statsResponse);
            await addChat(data);
            return;
          }
        }
      }

      // Handle expense-related questions with real data
      if (
        lowerPrompt.includes("expense") ||
        lowerPrompt.includes("expenses") ||
        lowerPrompt.includes("spend") ||
        lowerPrompt.includes("spent") ||
        lowerPrompt.includes("cost")
      ) {
        const statsRes = await getExpenseStats();

        if (statsRes.success) {
          const { total, totalAmount, byCategory } = statsRes.data as {
            total: number;
            totalAmount: number;
            byCategory: Record<string, number>;
          };

          const formattedTotal = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
            minimumFractionDigits: 2,
          }).format(totalAmount);

          let statsResponse = `You have recorded ${total} expense${total === 1 ? "" : "s"} so far, totalling ${formattedTotal}.`;

          const categoryEntries = Object.entries(byCategory);
          if (categoryEntries.length > 0) {
            const topCategories = categoryEntries
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(
                ([category, amount]) =>
                  `${category}: ${new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP",
                    minimumFractionDigits: 2,
                  }).format(amount)}`,
              )
              .join(", ");

            statsResponse += ` Your top spending categories are ${topCategories}.`;
          }

          const data = {
            id: Math.random().toString(),
            userId: currentUser?.id as string,
            prompt: prompt,
            response: statsResponse,
            createdAt: "",
          };

          setConversations((prev) => [...prev, data]);
          setResponse(statsResponse);
          await addChat(data);
          return;
        }
      }

      // Handle profile / account info questions
      if (
        lowerPrompt.includes("profile") ||
        lowerPrompt.includes("my details") ||
        lowerPrompt.includes("my info") ||
        lowerPrompt.includes("account") ||
        lowerPrompt.includes("business") ||
        lowerPrompt.includes("contact")
      ) {
        if (currentUser) {
          const profileResponse = `Here are your profile details:\n\n- **Name**: ${currentUser.fullname}\n- **Business**: ${currentUser.business}\n- **Email**: ${currentUser.email}\n- **Phone**: ${currentUser.contactPhone}\n- **Address**: ${currentUser.contactAddress}`;

          const data = {
            id: Math.random().toString(),
            userId: currentUser.id as string,
            prompt: prompt,
            response: profileResponse,
            createdAt: "",
          };

          setConversations((prev) => [...prev, data]);
          setResponse(profileResponse);
          await addChat(data);
          return;
        }
      }

      // Handle sales / revenue questions
      if (
        lowerPrompt.includes("sale") ||
        lowerPrompt.includes("sales") ||
        lowerPrompt.includes("revenue")
      ) {
        const isAskingBiggest =
          lowerPrompt.includes("biggest") ||
          lowerPrompt.includes("highest") ||
          lowerPrompt.includes("largest");

        const isThisMonth =
          lowerPrompt.includes("this month") ||
          lowerPrompt.includes("current month");

        if (isAskingBiggest || isThisMonth) {
          const statsRes: any = await getSalesStatsThisMonth();

          if (statsRes.success) {
            const { highestSale, totalSales, count } = statsRes.data;

            const format = (amount: number) =>
              new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
                minimumFractionDigits: 2,
              }).format(amount);

            let statsResponse = "";

            if (count === 0) {
              statsResponse =
                "You don’t have any sales recorded for this month yet.";
            } else if (isAskingBiggest) {
              statsResponse = `Your biggest sale this month is ${format(highestSale)}.`;
            } else {
              statsResponse = `This month, you’ve made ${count} sale${count === 1 ? "" : "s"
                } totalling ${format(totalSales)}.`;
            }

            const data = {
              id: Math.random().toString(),
              userId: currentUser?.id as string,
              prompt,
              response: statsResponse,
              createdAt: "",
            };

            setConversations((prev) => [...prev, data]);
            setResponse(statsResponse);
            await addChat(data);
            return;
          }
        }
      }

      // Fallback to AI response
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const data = {
        id: Math.random().toString(),
        userId: currentUser?.id as string,
        prompt: prompt,
        response: response.text as string,
        createdAt: "",
      };

      setConversations((prev) => [...prev, data]);
      setResponse(response.text as string);
      await addChat(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await getAllConversations();
      if (res.success) {
        setConversations(res.data);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    (async () => {
      const _user = await readData("user");
      setUser(_user);
    })();
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversations]);
  return (
    <>
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
              flexGrow: conversations.length === 0 ? 1 : 0
            }}
            renderItem={({ item }) => (
              <View className="mb-6">
                {/* User's Question */}
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

                {/* AI's Response */}
                <View className="px-4">
                  <View className="flex-row">
                    <View className="mr-3 mt-1">
                      <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                        <Ionicons name="sparkles" size={18} color="#10a37f" />
                      </View>
                    </View>
                    <View className="flex-1 max-w-[85%]">
                      <View className="bg-white rounded-3xl rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100">
                        <Markdown
                          style={{
                            body: {
                              fontSize: 15,
                              lineHeight: 24,
                              color: '#374151',
                              fontFamily: 'System'
                            },
                            paragraph: {
                              marginTop: 0,
                              marginBottom: 12,
                            },
                            heading1: {
                              fontSize: 20,
                              fontWeight: '600',
                              marginBottom: 8,
                              marginTop: 16,
                            },
                            heading2: {
                              fontSize: 18,
                              fontWeight: '600',
                              marginBottom: 8,
                              marginTop: 16,
                            },
                            code_inline: {
                              backgroundColor: '#f3f4f6',
                              paddingHorizontal: 4,
                              paddingVertical: 2,
                              borderRadius: 4,
                              fontSize: 14,
                            },
                            code_block: {
                              backgroundColor: '#f3f4f6',
                              padding: 12,
                              borderRadius: 8,
                              marginVertical: 8,
                            },
                            list_item: {
                              marginBottom: 4,
                            }
                          }}
                        >
                          {item.response}
                        </Markdown>
                      </View>
                      <TouchableOpacity
                        onPress={async () => {
                          await Clipboard.setStringAsync(item.response);
                          Alert.alert("Copied!", "Response copied to clipboard");
                        }}
                        className="flex-row items-center gap-1.5 mt-2 ml-2"
                      >
                        <Ionicons name="copy-outline" size={16} color="#6b7280" />
                        <Text className="text-gray-500 text-sm font-medium">Copy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id as string}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Area */}
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
                onChangeText={(e) => setPrompt(e)}
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
            {loading && conversations.length > 0 && (
              <View className="flex-row items-center mt-3 ml-4">
                <View className="mr-3">
                  <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                    <Ionicons name="sparkles" size={18} color="#10a37f" />
                  </View>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 bg-[#10a37f] rounded-full" />
                  <View className="w-2 h-2 bg-[#10a37f] rounded-full" style={{ opacity: 0.6 }} />
                  <View className="w-2 h-2 bg-[#10a37f] rounded-full" style={{ opacity: 0.3 }} />
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </>
  );
}