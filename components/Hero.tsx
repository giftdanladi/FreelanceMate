import { IExpense, IInvoice } from "@/interface";
import { FontFamily } from "@/util/FontFamily";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface IProp {
  invoice: IInvoice[];
  expenses: IExpense[];
}

export default function Hero({ invoice, expenses }: IProp) {
  const getIncome = () => {
    let total = 0;
    invoice
      .filter((inv) => inv.status === "paid")
      .map((e) => {
        total += +e.total;
      });
    return total;
  };

  const getOverdue = () => {
    let total = 0;
    invoice
      .filter((inv) => inv.status === "overdue")
      .map((e) => {
        total += +e.total;
      });
    return total;
  };

  const getExpense = () => {
    let total = 0;
    expenses.map((e) => {
      total += +e.amount;
    });
    return total;
  };

  return (
    <>
      <View className="bg-sky-600 pt-16 pb-10 rounded-b-[26px] px-5">
        <View className="flex-row justify-between">
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 100, height: 60 }}
            contentFit="fill"
            tintColor={"white"}
          />
          {/*<Text
            className="text-3xl font-bold text-white"
            style={{ fontFamily: FontFamily.bricolageBold }}
          >
            FreelanceMate
          </Text>*/}
          <Link href={"/chat"} asChild>
            <TouchableOpacity className="flex-row gap-1 items-center">
              <Text className="text-white">Let's Chat</Text>
              <Ionicons name="chatbubbles-outline" size={20} color={"white"} />
            </TouchableOpacity>
          </Link>
        </View>
        {/* Data View */}
        <View className="mt-8 flex-row justify-between">
          <View className="flex-col items-center">
            {/*<Text className="text-lg text-sky-200">This Month</Text>*/}
            <Text
              className="font-bold text-3xl text-white"
              style={{ fontFamily: FontFamily.bricolage }}
            >
              {invoice.length.toLocaleString()}
            </Text>
            <Text className="text-white">All invoices</Text>
          </View>

          <View className="flex-col items-center">
            <Text
              className="font-bold text-3xl text-white"
              style={{ fontFamily: FontFamily.bricolage }}
            >
              {getIncome().toLocaleString()}
            </Text>
            <Text className="text-white">Income</Text>
          </View>

          <Link href="/overdue" className="flex-col items-center" asChild>
            <TouchableOpacity>
              <Text
                className="font-bold text-3xl text-white"
                style={{ fontFamily: FontFamily.bricolage }}
              >
                {getOverdue().toLocaleString()}
              </Text>
              <Text className="text-white">Overdue</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}