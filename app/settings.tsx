import { IUser } from "@/interface";
import { updateProfile } from "@/util/firestore";
import { readData, storeData } from "@/util/storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  const [user, setUser] = useState<IUser>();
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);

    const data = {
      fullname: inputs.fullname || user?.fullname,
      email: inputs.email || user?.email,
      business: inputs.business || user?.business,
      contactPhone: inputs.contactPhone || user?.contactPhone,
      contactAddress: inputs.contactAddress || user?.contactAddress,
    };

    try {
      const res = await updateProfile(user?.id as string, data);
      if (res.success) {
        const newData = {
          id: user?.id,
          ...data,
        };
        await storeData("user", newData);
        router.replace("/account");
        Alert.alert("Notification", "Profile updated!");
      } else {
        Alert.alert("Notification", res.message);
      }
    } catch (error: any) {
      Alert.alert("Notification", `Server error! ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setUser(await readData("user"));
    })();
  });

  return (
    <SafeAreaView className="px-3 py-3 h-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={50}
        className="h-[80%]"
      >
        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
          placeholder="Full Name"
          autoCorrect={false}
          defaultValue={user?.fullname}
          editable={true}
          onChangeText={(e) => setInputs({ ...inputs, fullname: e })}
        />

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
          placeholder="Business name"
          autoCorrect={false}
          defaultValue={user?.business}
          editable={true}
          onChangeText={(e) => setInputs({ ...inputs, business: e })}
        />

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
          placeholder="Contact phone"
          autoCorrect={false}
          defaultValue={user?.contactPhone}
          editable={true}
          onChangeText={(e) => setInputs({ ...inputs, contactPhone: e })}
        />

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500"
          placeholder="Email Address"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          defaultValue={user?.email}
          onChangeText={(e) => setInputs({ ...inputs, email: e })}
        />

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 h-40"
          placeholder="Contact address"
          defaultValue={user?.contactAddress}
          onChangeText={(e) => setInputs({ ...inputs, contactAddress: e })}
          editable={true}
          multiline
        />

        <TouchableOpacity
          className="w-96 bg-sky-600 p-5 items-center rounded-2xl absolute bottom-0 justify-center ml-8"
          style={styles.glassContainer}
          onPress={handleSubmit}
        >
          {loading ? (
            <View className="flex-row gap-2">
              <ActivityIndicator />
              <Text className="text-sky-600 text-lg font-medium">
                Updating...
              </Text>
            </View>
          ) : (
            <Text className="text-sky-600 text-lg font-bold">Update profile</Text>
          )}
        </TouchableOpacity>
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