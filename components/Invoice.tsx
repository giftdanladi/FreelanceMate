import { IInvoice } from "@/interface";
import { FontFamily } from "@/util/FontFamily";
import { deleteInvoice } from "@/util/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

interface IProp {
  data: IInvoice;
  onDelete?: () => void;
}

export default function Invoice({ data, onDelete }: IProp) {
  const router = useRouter();

  const handleDelete = () => {
    Alert.alert("Confirmation", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await deleteInvoice(data.id as string);
          if (res.success) {
            onDelete?.();
          } else {
            Alert.alert("Error", res.message as string);
          }
        },
      },
    ]);
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        onPress={handleDelete}
        className="bg-red-500 justify-center items-center w-20 rounded-2xl ml-2"
      >
        <Ionicons name="trash-outline" size={24} color="white" />
        <Text className="text-white text-xs font-bold">Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        onPress={() =>
          router.navigate({
            pathname: "/summary",
            params: { data: JSON.stringify(data) },
          })
        }
        className="flex-row items-center justify-between bg-white p-3 rounded-2xl"
      >
        <View className="flex-row items-center gap-3">
          <View className="bg-sky-100 w-14 h-14 flex justify-center items-center rounded-full backdrop-blur-2xl border-sky-300">
            <Ionicons name="receipt-outline" size={18} />
          </View>
          <View>
            <Text
              className="font-bold text-xl"
              style={{ fontFamily: FontFamily.bricolage }}
            >
              {data.clientName}
            </Text>
            <Text
              className={`text-sm ${data.status === "paid" ? "text-sky-600" : "text-red-600"}`}
            >
              {data.status}
            </Text>
          </View>
        </View>

        <Text
          className={`font-bold text-xl ${data.status === "paid" ? "text-sky-600" : "text-red-600"}`}
        >
          £{Intl.NumberFormat().format(+data.total)}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}
