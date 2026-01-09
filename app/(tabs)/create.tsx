import { IUser } from "@/interface";
import { addInvoice } from "@/util/firestore";
import { FontFamily } from "@/util/FontFamily";
import generateCode from "@/util/generateInvoice";
import { readData } from "@/util/storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

interface InvoiceItem {
  id: string;
  name: string;
  price: string;
}

export default function Page() {
  const [date, setDate] = useState<Date>(new Date());
  const [inputs, setInputs] = useState<Record<any, any>>({});
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: Date.now().toString(), name: "", price: "" },
  ]);
  const router = useRouter();

  const confirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: "", price: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: "name" | "price", value: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price;
    }, 0);
  };

  const calculateTotal = (): number => {
    return calculateSubtotal();
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!inputs.clientName || !inputs.clientEmail || !inputs.clientAddress) {
      return Alert.alert("Notification", "Please fill all required fields!");
    }

    // Validate items
    const validItems = items.filter((item) => item.name.trim() && item.price);
    if (validItems.length === 0) {
      return Alert.alert("Notification", "Please add at least one item with a price!");
    }

    // Calculate amounts
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    // Format items as JSON string with name and price
    const itemsData = validItems.map((item) => ({
      name: item.name,
      price: parseFloat(item.price) || 0,
    }));
    const itemsString = JSON.stringify(itemsData);

    // Prepare invoice data
    const invoiceData: any = {
      ...inputs,
      items: itemsString,
      amount: subtotal.toString(),
      tax: "0", // No tax
      total: total.toString(),
      dueDate: date || new Date(),
      invoiceNumber: generateCode(),
      userId: user?.id,
    };

    Alert.alert("Confirmation", "Is this a paid invoice?", [
      {
        text: "No, pending",
        style: "cancel",
        onPress: () => {
          invoiceData.status = "pending";
          createInvoice(invoiceData);
        },
      },
      {
        text: "Paid",
        onPress: () => {
          invoiceData.status = "paid";
          createInvoice(invoiceData);
        },
      },
    ]);
  };

  const createInvoice = async (_inputs: any) => {
    setLoading(true);
    try {
      const res = await addInvoice(_inputs);
      if (res.success) {
        Alert.alert("Notification", "Invoice Created");
        router.replace("/");
        // Reset form
        setInputs({});
        setItems([{ id: Date.now().toString(), name: "", price: "" }]);
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
        <ScrollView
          className="my-2 flex-col"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80, minHeight: "100%" }}
        >
          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Client name"
            defaultValue={inputs.clientName}
            onChangeText={(e) => setInputs({ ...inputs, clientName: e })}
            autoCorrect={false}
            autoFocus
          />

          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Client email"
            keyboardType="email-address"
            defaultValue={inputs.clientEmail}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(e) => setInputs({ ...inputs, clientEmail: e })}
          />

          <TextInput
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 dark:text-black"
            placeholder="Address"
            defaultValue={inputs.clientAddress}
            autoCorrect={false}
            onChangeText={(e) => setInputs({ ...inputs, clientAddress: e })}
            multiline
          />

          {/* Items Section */}
          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-lg"
                style={{ fontFamily: FontFamily.bricolageBold }}
              >
                Items
              </Text>
              <TouchableOpacity
                onPress={addItem}
                className="bg-sky-600 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold">+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View
                key={item.id}
                className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 font-medium">
                    Item {index + 1}
                  </Text>
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      className="bg-red-100 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-red-600 font-semibold">Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  className="border-[1px] border-gray-200 mb-2 bg-gray-50 rounded-xl p-3 focus:border-sky-500 font-medium placeholder:text-gray-400 dark:text-black"
                  placeholder="Item name"
                  value={item.name}
                  onChangeText={(e) => updateItem(item.id, "name", e)}
                  autoCorrect={false}
                />
                <TextInput
                  className="border-[1px] border-gray-200 bg-gray-50 rounded-xl p-3 focus:border-sky-500 font-medium placeholder:text-gray-400 dark:text-black"
                  placeholder="Price (£)"
                  value={item.price}
                  onChangeText={(e) => updateItem(item.id, "price", e)}
                  keyboardType="decimal-pad"
                  autoCorrect={false}
                />
              </View>
            ))}

            {/* Summary Section */}
            <View className="bg-gray-50 rounded-2xl p-4 mb-3 border-[1px] border-gray-200">
              <View className="flex-row justify-between">
                <Text
                  className="text-lg font-bold"
                  style={{ fontFamily: FontFamily.bricolageBold }}
                >
                  Total:
                </Text>
                <Text
                  className="text-lg font-bold text-sky-600"
                  style={{ fontFamily: FontFamily.bricolageBold }}
                >
                  £{calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-gray-800">Due date</Text>
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
            className="border-[1px] border-gray-300 mb-3 bg-white rounded-2xl p-5 focus:border-sky-500 font-medium placeholder:text-gray-500 h-40 dark:text-black"
            placeholder="Notes"
            defaultValue={inputs.note}
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