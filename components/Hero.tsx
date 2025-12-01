import { FontFamily } from "@/util/FontFamily";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { IExpense, IInvoice } from "@/interface";

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

  const getExpense = () => {
    let total = 0;
    expenses.map((e) => {
      total += +e.amount;
    });
    return total;
  };

  return (
    <>
      <View className="bg-sky-600 pt-24 pb-10 rounded-b-[26px] px-5">
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
          <View className="flex-row gap-4 items-center">
            <Ionicons name="pie-chart-outline" size={30} color={"white"} />
            {/*<Ionicons name="search-outline" size={23} color={"white"} />*/}
          </View>
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
            <Text className="text-white">All invoice</Text>
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

          <View className="flex-col items-center">
            <Text
              className="font-bold text-3xl text-white"
              style={{ fontFamily: FontFamily.bricolage }}
            >
              {getExpense().toLocaleString()}
            </Text>
            <Text className="text-white">Expenses</Text>
          </View>
        </View>
      </View>
    </>
  );
}
