import { FontFamily } from "@/util/FontFamily";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
// import FileSystem from "expo-file-system";
import { IInvoice, IUser } from "@/interface";
import { updateInvoiceStatus } from "@/util/firestore";
import generateInvoiceHTML from "@/util/GenerateInvoiceHTML";
import { readData } from "@/util/storage";
import { shareAsync } from "expo-sharing";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  // Share,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Summary() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const client: IInvoice = JSON.parse(data);
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(false);

  const printInvoice = async () => {
    setLoading(true);
    const invoiceData: IInvoice = client;
    try {
      const pdfFile = await Print.printToFileAsync({
        html: generateInvoiceHTML(invoiceData, user as IUser),
      });

      await shareAsync(pdfFile.uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice ${invoiceData.invoiceNumber}`,
        UTI: ".pdf",
      });
    } catch (error: any) {
      Alert.alert("Print failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (_status: string) => {
    try {
      const res = await updateInvoiceStatus(client.id as string, _status);
      if (res.success) {
        Alert.alert("Notification", "Status changed to " + _status);
      } else {
        Alert.alert("Status change failed", res.message);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeStatus = () => {
    Alert.alert("Confirmation", "Change invoice status", [
      {
        text: "Paid",
        onPress: () => handleUpdateStatus("paid"),
      },
      {
        text: "Overdue",
        style: "destructive",
        onPress: () => handleUpdateStatus("overdue"),
      },
    ]);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await readData("user");
      setUser(user);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <ActivityIndicator color={"blue"} className="flex-1" />;
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <View className="flex-row ml-5 mt-5 gap-3 items-center">
        <Ionicons name="receipt-outline" size={30} />
        <Text className="font-bold text-2xl">{client.invoiceNumber}</Text>
      </View>
      <View className="p-5 gap-6 divide-y-2">
        <View className="flex-row justify-between items-center">
          <Text className="font-medium text-lg">Client name:</Text>
          <Text className="font-medium text-lg">{client.clientName}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="font-medium text-lg">Client email:</Text>
          <Text className="font-medium text-lg">{client.clientEmail}</Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="font-medium text-lg">Amount:</Text>
          <Text className="font-medium text-lg">
            £{Intl.NumberFormat().format(+client.amount)}.00
          </Text>
        </View>

        {/* <View className="flex-row justify-between items-center">
          <Text className="font-medium text-lg">Tax:</Text>
          <Text className="font-medium text-lg">
            £{Intl.NumberFormat().format(+client.tax)}.00
          </Text>
        </View> */}

        <View className="flex-row justify-between items-center">
          <Text className="font-medium text-lg">Total:</Text>
          <Text className="font-medium text-lg">
            £{Intl.NumberFormat().format(+client.total)}.00
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="font-medium text-lg">Due Date:</Text>
          <Text className="font-medium text-lg">
            {moment((client.dueDate as any)?.seconds * 1000).format(
              "MMMM Do, YYYY",
            )}
          </Text>
        </View>

        {/* Items Section */}
        <View className="bg-white p-5 rounded-2xl">
          <Text
            className="font-bold text-lg mb-3"
            style={{ fontFamily: FontFamily.bricolageBold }}
          >
            Items:
          </Text>
          {(() => {
            try {
              // Try to parse as JSON (new format with prices)
              const items = JSON.parse(client.items);
              return items.map(
                (item: { name: string; price: number }, index: number) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-2 border-b border-gray-200"
                  >
                    <Text className="font-medium flex-1">{item.name}</Text>
                    <Text className="font-medium">
                      £{item.price.toFixed(2)}
                    </Text>
                  </View>
                ),
              );
            } catch {
              // Fallback to old format (comma-separated names)
              return client.items
                .split(",")
                .map((item: string, index: number) => (
                  <View
                    key={index}
                    className="flex-row justify-between items-center py-2 border-b border-gray-200"
                  >
                    <Text className="font-medium flex-1">{item.trim()}</Text>
                  </View>
                ));
            }
          })()}
        </View>

        <View className="bg-white p-5 rounded-2xl">
          <Text className="font-bold text-lg">Note:</Text>
          <Text className="font-medium">{client.note}</Text>
        </View>
      </View>

      {/*Actions*/}
      <View
        className="flex-row gap-2 px-5 mt-5 justify-end"
        style={{
          elevation: 5,
          shadowColor: "gray",
          shadowOpacity: 0.5,
          shadowRadius: 1,
          shadowOffset: {
            height: 5,
            width: 5,
          },
        }}
      >
        <TouchableOpacity
          className="bg-sky-500 px-7 py-5 rounded-l-full flex-row items-center gap-2 flex-grow"
          onPress={() => handleChangeStatus()}
        >
          <Ionicons name="checkmark-done" size={20} color={"white"} />
          <Text
            className="text-sky-100 font-medium"
            style={{ fontFamily: FontFamily.bricolage }}
          >
            Change status
          </Text>
        </TouchableOpacity>

        {/*<TouchableOpacity className="bg-red-500 px-7 py-5 rounded-l-full flex-row items-center gap-2">
          <Ionicons name="close-circle-outline" size={20} color={"white"} />
          <Text
            className="text-red-100 font-medium"
            style={{ fontFamily: FontFamily.bricolage }}
          >
            Mark unpaid
          </Text>
        </TouchableOpacity>*/}

        <TouchableOpacity
          className="bg-slate-700 px-7 py-5 rounded-r-full flex-row items-center gap-2 flex-grow justify-center"
          onPress={printInvoice}
        >
          <Ionicons name="download-outline" size={20} color={"white"} />
          <Text
            className="text-sky-100 font-medium"
            style={{ fontFamily: FontFamily.bricolage }}
          >
            Download
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}