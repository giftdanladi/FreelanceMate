import { IUser } from "@/interface";
import { FontFamily } from "@/util/FontFamily";
import { deleteAccount } from "@/util/firestore";
import { clearStorage, readData } from "@/util/storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<IUser>();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          clearStorage();
          router.replace("/register");
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (user?.id) {
              const res = await deleteAccount(user.id);
              if (res.success) {
                clearStorage();
                router.replace("/register");
              } else {
                Alert.alert("Error", res.message || "Failed to delete account");
              }
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    (async () => {
      setUser(await readData("user"));
    })();
  });
  return (
    <>
      <SafeAreaView className="px-5 pt-3">
        <View className="flex-row justify-between">
          <Text className="font-medium text-2xl">Account</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => router.navigate("/settings")}>
              <Ionicons name="cog-outline" size={32} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" color={"#f87171"} size={32} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-10">
          <Text
            className="text-4xl font-bold"
            style={{ fontFamily: FontFamily.bricolage }}
          >
            {user?.fullname || "Freelance Mate"}
          </Text>
          <Text>Joined 2025.</Text>
        </View>
      </SafeAreaView>
      <ScrollView className="rounded-t-[26px] h-screen px-5">
        <View className="mb-3 bg-white p-3 rounded-2xl">
          <View>
            <Text className="text-lg text-sky-600">Business name</Text>
          </View>
          <Text className="text-md text-black">{user?.business}</Text>
        </View>

        <View className="mb-3 bg-white p-3 rounded-2xl">
          <Text className="text-lg text-sky-600">Contact details</Text>
          <Text className="text-md text-black mb-1">{user?.email}</Text>
          <Text className="text-md text-black">{user?.contactPhone}</Text>
        </View>

        <View className="mb-3 bg-white p-3 rounded-2xl">
          <View>
            <Text className="text-lg text-sky-600">Address</Text>
          </View>
          <Text className="text-md text-black">{user?.contactAddress}</Text>
        </View>
        <Text className="text-gray-500 text-sm">
          You can update your profile through the settings.
        </Text>
        <TouchableOpacity
          className="bg-red-50 p-4 rounded-xl flex-row items-center gap-2 mt-10"
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-medium">Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        className="items-end absolute bottom-20 right-5"
        onPress={() => router.navigate("/chat")}
      >
        <View className="flex-row items-center justify-center gap-2 my-10 bg-sky-600 p-4 w-44 rounded-full">
          <Ionicons name="chatbubbles-outline" color={"#f0f9ff"} size={20} />
          <Text className="text-md text-white font-bold">Ask AI</Text>
        </View>
      </TouchableOpacity>
    </>
  );
}
