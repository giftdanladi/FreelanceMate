import { IUser } from "@/interface";
import { addExpense } from "@/util/firestore";
import { readData } from "@/util/storage";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
  const [date, setDate] = useState<Date>(new Date());
  const [inputs, setInputs] = useState<Record<any, any>>({});
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const router = useRouter()

  const confirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const handleSubmit = async () => {
    inputs.date = date || new Date();
    inputs.userId = user?.id;

    if (Object.keys(inputs).length < 4) {
      return Alert.alert("Notification", "All inputs are required!");
    }

    setLoading(true);
    try {
      const res = await addExpense(inputs);
      if (res.success) {
        Alert.alert("Notification", "Expense Created");
        router.replace("/expenses")
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
    <SafeAreaView className="p-5 h-full">
      {/*<Text
        className="text-2xl mt-5"
        style={{ fontFamily: FontFamily.bricolageBold }}
      >
        Add Expense
      </Text>*/}

      {/*Inputs*/}
      <ScrollView className="my-2 flex-col" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, minHeight: '100%' }}>
        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
          placeholder="Category"
          autoCorrect={false}
          onChangeText={(e) => setInputs({ ...inputs, category: e })}
        />

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
          placeholder="Amount"
          onChangeText={(e) => setInputs({ ...inputs, amount: e })}
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
        />

        <View className="gap-2">
          <Text className="text-gray-800">Date</Text>
          <View className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 font-medium">
            {showDatePicker && (
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={date}
                onConfirm={confirm}
                onCancel={() => setShowDatePicker(false)}
              />
            )}
            {!showDatePicker && (
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TextInput
          className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium h-40 placeholder:text-gray-500 dark:text-black"
          placeholder="Description"
          onChangeText={(e) => setInputs({ ...inputs, description: e })}
          multiline
        />

        <TouchableOpacity
          className="w-full bg-sky-600 p-5 items-center rounded-2xl"
          style={styles.glassContainer}
          onPress={handleSubmit}
        >
          {loading ? (
            <View className="flex-row gap-2">
              <ActivityIndicator />
              <Text className="text-sky-600 text-lg font-medium">
                Adding...
              </Text>
            </View>
          ) : (
            <Text className="text-sky-600 text-lg font-bold">Add expense</Text>
          )}
        </TouchableOpacity>
        <Link href={'/expenses'} asChild>
          <TouchableOpacity className="my-5 items-center bg-white p-4 mx-20 rounded-full">
            <Text className="text-sky-500 font-medium">View all expenses</Text>
          </TouchableOpacity></Link>
      </ScrollView>
      <StatusBar style="dark" />
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