import { IInvoice } from "@/interface";
import { FontFamily } from "@/util/FontFamily";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface IProp {
  data: IInvoice;
}

export default function Invoice({ data }: IProp) {
  const router = useRouter();
  return (
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
  );
}