import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GoogleGenAI } from "@google/genai";
import Constants from "expo-constants";
import { use, useEffect, useState } from "react";
import { IConversation, IUser } from "@/interface";
import { readData } from "@/util/storage";
import { addChat, getAllConversations } from "@/util/firestore";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

export default function Chat() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [user, setUser] = useState<IUser>();

  const ai = new GoogleGenAI({
    apiKey: Constants?.expoConfig?.extra?.GENAI_API_KEY,
  });

  const handlePrompt = async () => {
    try {
      setLoading(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const data = {
        id: Math.random().toString(),
        userId: user?.id as string,
        prompt: prompt,
        response: response.text as string,
        createdAt: "",
      };

      conversations.push(data);
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
  }, [user]);
  return (
    <>
      <View className="h-screen">
        {loading && <ActivityIndicator color="#0000ff" className="m-5" />}
        <FlatList
          data={conversations}
          className="mb-56 h-screen"
          renderItem={({ item }) => (
            <>
              <View className="p-5">
                <Markdown>{item.response}</Markdown>
              </View>
              <View className="flex justify-end items-end px-7 pb-3">
                <TouchableOpacity
                  onPress={async () => {
                    await Clipboard.setStringAsync(item.response);
                    Alert.alert("Copied!");
                  }}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons name="copy-outline" size={18} />
                  <Text className="font-medium">Copy</Text>
                </TouchableOpacity>
              </View>
              <View className="w-full h-[1px] bg-sky-600"></View>
            </>
          )}
          keyExtractor={(item) => item.id as string}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "height" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <View className="px-5 w-full absolute bottom-36">
            <TextInput
              className="w-full border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
              placeholder="Type your message here"
              autoCorrect={false}
              returnKeyType="done"
              autoCapitalize="none"
              submitBehavior="submit"
              value={prompt}
              onSubmitEditing={handlePrompt}
              onChangeText={(e) => setPrompt(e)}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
      <StatusBar style="auto" />
    </>
  );
}