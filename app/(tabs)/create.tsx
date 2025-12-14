import { FontFamily } from "@/util/FontFamily";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useEffect, useState } from "react";
import { addInvoice } from "@/util/firestore";
import generateCode from "@/util/generateInvoice";
import { IUser } from "@/interface";
import { readData } from "@/util/storage";

export default function Page() {
  const [date, setDate] = useState<Date>(new Date());
  const [inputs, setInputs] = useState<Record<any, any>>({});
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const confirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const handleSubmit = async () => {
    if (Object.keys(inputs).length < 7) {
      return Alert.alert("Notification", "Please fill all forms!");
    }

    inputs.dueDate = date || new Date();

    inputs.invoiceNumber = generateCode();
    inputs.status = "pending";
    inputs.userId = user?.id;

    setLoading(true);
    try {
      const res = await addInvoice(inputs);
      if (res.success) {
        Alert.alert("Notification", "Invoice Created");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={50}
      >
        <Text
          className="text-2xl"
          style={{ fontFamily: FontFamily.bricolageBold }}
        >
          Create Invoice
        </Text>

        {/*Inputs*/}
        <ScrollView className="my-2 flex-col">
          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Client Name"
            onChangeText={(e) => setInputs({ ...inputs, clientName: e })}
            autoCorrect={false}
            autoFocus
          />

          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Client Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(e) => setInputs({ ...inputs, clientEmail: e })}
          />

          <View className="w-full flex-row gap-3">
            <TextInput
              className="flex-1 border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
              placeholder="Amount"
              onChangeText={(e) => setInputs({ ...inputs, amount: e })}
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
            />

            <TextInput
              className="flex-1 border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
              placeholder="Tax"
              onChangeText={(e) => setInputs({ ...inputs, tax: e })}
              autoCorrect={false}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Total"
            keyboardType="numbers-and-punctuation"
            autoCorrect={false}
            onChangeText={(e) => setInputs({ ...inputs, total: e })}
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
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Items purchased (seperate with commas)"
            onChangeText={(e) => setInputs({ ...inputs, items: e })}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 h-40 dark:text-black"
            placeholder="Note"
            onChangeText={(e) => setInputs({ ...inputs, note: e })}
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
                  Creating...
                </Text>
              </View>
            ) : (
              <Text className="text-sky-600 text-lg font-bold">
                Create invoice
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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