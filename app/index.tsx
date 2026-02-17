import { loginUser, requestResetCode, verifyAndResetPassword } from "@/util/firestore";
import { readData, storeData } from "@/util/storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const [inputs, setInputs] = useState<Record<any, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (Object.keys(inputs).length < 2) {
      return Alert.alert("Notification", "All inputs are required!");
    }

    setLoading(true);
    try {
      const res = await loginUser(inputs);
      if (res.success) {
        await storeData("user", res.user);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Notification", res.message as string);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      "Reset Password",
      "Enter your email address:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Code",
          onPress: async (email: string | undefined) => {
            if (!email) return Alert.alert("Error", "Email is required");

            setLoading(true);
            const res = await requestResetCode(email);
            setLoading(false);

            if (res.success) {
              Alert.prompt(
                "Verify Code",
                "Enter the 6-digit code sent to your email:",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Next",
                    onPress: (code: string | undefined) => {
                      if (!code) return Alert.alert("Error", "Code is required");

                      Alert.prompt(
                        "New Password",
                        "Enter your new password:",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Reset Password",
                            onPress: async (newPassword: string | undefined) => {
                              if (!newPassword) return Alert.alert("Error", "Password is required");

                              setLoading(true);
                              const resetRes = await verifyAndResetPassword(email, code, newPassword);
                              setLoading(false);

                              Alert.alert("Notification", resetRes.message);
                              console.log(resetRes.message as string)
                            }
                          }
                        ],
                        "secure-text"
                      );
                    }
                  }
                ],
                "plain-text"
              );
            } else {
              Alert.alert("Error", res.message);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  useEffect(() => {
    (async () => {
      if (await readData("user")) {
        router.replace("/(tabs)");
      }
    })();
  }, [router]);
  return (
    <SafeAreaView className="px-5">
      <View className="mt-5">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 150, height: 90 }}
          contentFit="fill"
          tintColor={"#0284c7"}
        />
      </View>
      <Text className="text-3xl mt-20 ml-5 font-bold">Hey,</Text>
      <Text className="text-3xl ml-5 font-bold">Login Now.</Text>
      <View className="ml-5 mt-1 flex-row items-center">
        <Text className="text-lg">If you are new here,</Text>
        <Pressable onPress={() => router.navigate("/register")}>
          <Text className="font-medium text-sky-600"> please register.</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="my-20 flex-col">
          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Email Address"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            onChangeText={(e) => setInputs({ ...inputs, email: e })}
          />

          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Password"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(e) => setInputs({ ...inputs, password: e })}
            keyboardType="default"
          />

          <TouchableOpacity
            className="flex-row items-center justify-end px-2 mb-5"
            onPress={handleForgotPassword}
          >
            <Text className="text-sky-600 font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-sky-600 p-5 mt-10 items-center rounded-2xl"
            onPress={handleLogin}
          >
            {loading ? (
              <View className="flex-row gap-2">
                <ActivityIndicator />
                <Text className="text-sky-100 text-lg font-medium">
                  Authenticating...
                </Text>
              </View>
            ) : (
              <Text className="text-sky-100 text-lg font-bold">Login</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    backgroundColor: "rgba(2, 132, 199, 0.1)", // Semi-transparent sky-600
    borderRadius: 16,
    // padding: 20,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.3)", // Slightly more visible border
    // Shadow for iOS
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Shadow for Android
    elevation: 5,
  },
  glassText: {
    color: "#fff",
    fontSize: 16,
  },
});