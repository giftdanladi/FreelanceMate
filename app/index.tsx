import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { loginUser } from "@/util/firestore";
import { useRouter } from "expo-router";
import { readData, storeData } from "@/util/storage";

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
      console.log(res)
      if (res.success) {
        await storeData("user", res.user);
        router.replace("/(tabs)");
      } else {
        Alert.alert("Notification", res.message as string);
      }
    } catch (error: any) {
      Alert.alert("Notification", `Server error! ${error}`);
    } finally {
      setLoading(false);
    }
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

      <ScrollView className="my-20 flex-col">
        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
          placeholder="Email Address"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          onChangeText={(e) => setInputs({ ...inputs, email: e })}
        />

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
          placeholder="Password"
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(e) => setInputs({ ...inputs, password: e })}
          keyboardType="default"
        />

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
