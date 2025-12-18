import Invoice from "@/components/Invoice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Hero from "../../components/Hero";
import { useCallback, useEffect, useState } from "react";
import { IExpense, IInvoice } from "@/interface";
import { getAllExpenses, getAllInvoice } from "@/util/firestore";

export default function Page() {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);

  const fetchExpense = async () => {
    try {
      const res = await getAllExpenses();
      if (res.success) {
        setExpenses(res.data);
      }
    } catch (error: any) {
      Alert.alert("Notification", `Failed to load expenses! ${error}`);
    }
  };

  const fetchInvoice = async () => {
    try {
      const res = await getAllInvoice();
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (error: any) {
      Alert.alert("Notification", `Failed to load invoices! ${error}`);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    try {
      await fetchInvoice();
    } catch (e: any) {
      Alert.alert(`Error fetching topics! ${e}`);
    } finally {
      setRefresh(false);
    }
  }, []);

  useEffect(() => {
    setInterval(async () => {
      fetchInvoice();
      fetchExpense();
    }, 4000);
  }, []);

  useEffect(() => {
    fetchInvoice();
    fetchExpense();
  }, []);

  const router = useRouter();
  return (
    <View className="flex-1">
      <Hero invoice={invoices} expenses={expenses} />
      <FlatList
        data={invoices}
        renderItem={({ item }) => <Invoice data={item} />}
        className="px-5 mt-5 flex-1"
        ListEmptyComponent={
          <Text className="text-center my-5">No invoice yet</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100, gap: 13 }}
      ></FlatList>

      <TouchableOpacity
        onPress={() => router.navigate("/add-expense")}
        className="absolute bottom-28 right-7"
      >
        <Ionicons name="add-circle" size={50} />
      </TouchableOpacity>
      <StatusBar style="light" />
    </View>
  );
}