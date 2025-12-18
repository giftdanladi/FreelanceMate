import { IExpense } from "@/interface";
import { getAllExpenses } from "@/util/firestore";
import { FontFamily } from "@/util/FontFamily";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Timestamp } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Helper function to format date from Firestore timestamp or string
const formatDate = (date: any): string => {
    if (!date) return "No date";

    // Check if it's a Firestore timestamp object
    if (date && typeof date === "object" && "seconds" in date) {
        const timestamp = date as Timestamp;
        const dateObj = timestamp.toDate();
        return dateObj.toLocaleDateString();
    }

    // Check if it's already a Date object
    if (date instanceof Date) {
        return date.toLocaleDateString();
    }

    // If it's a string, try to parse it
    if (typeof date === "string") {
        try {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                return dateObj.toLocaleDateString();
            }
        } catch (e) {
            // If parsing fails, return the string as is
        }
        return date;
    }

    return "Invalid date";
};

export default function ExpensesPage() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<IExpense[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchExpenses = useCallback(async () => {
        try {
            const res = await getAllExpenses();
            if (res.success) {
                setExpenses(res.data);
            } else if (res.message) {
                Alert.alert("Notification", String(res.message));
            }
        } catch (error: any) {
            Alert.alert("Notification", `Failed to load expenses! ${error}`);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchExpenses();
        } catch (error: any) {
            Alert.alert("Notification", `Failed to refresh expenses! ${error}`);
        } finally {
            setRefreshing(false);
        }
    }, [fetchExpenses]);

    const totalSpent = useMemo(
        () =>
            expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
        [expenses],
    );

    const renderItem = ({ item }: { item: IExpense }) => {
        return (
            <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl">
                <View className="flex-row items-center gap-3">
                    <View className="w-11 h-11 rounded-full bg-emerald-100 items-center justify-center">
                        <Ionicons name="cash-outline" size={20} color="#047857" />
                    </View>
                    <View className="max-w-[60%]">
                        <Text
                            className="text-base font-semibold text-slate-900"
                            style={{ fontFamily: FontFamily.bricolage }}
                            numberOfLines={1}
                        >
                            {item.description || "Expense"}
                        </Text>
                        <Text className="text-xs text-slate-500 mt-0.5">
                            {item.category || "Uncategorized"} • {formatDate(item.date)}
                        </Text>
                    </View>
                </View>

                <Text className="text-lg font-semibold text-emerald-600">
                    £{Intl.NumberFormat().format(Number(item.amount || 0))}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-emerald-500 pt-16 pb-6 px-5 rounded-b-[26px]">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-emerald-400 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={22} color="white" />
                    </TouchableOpacity>
                    {/* <Text className="text-white text-lg font-semibold">
                        Expenses
                    </Text> */}
                    <View className="w-10" />
                </View>

                <View className="mt-6">
                    <Text className="text-emerald-100 text-sm">Total spent</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                        £{Intl.NumberFormat().format(totalSpent)}
                    </Text>
                    <Text className="text-emerald-100 mt-1">
                        {expenses.length} expense
                        {expenses.length === 1 ? "" : "s"} recorded
                    </Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id as string}
                renderItem={renderItem}
                className="px-5 mt-5 flex-1"
                contentContainerStyle={{
                    paddingBottom: 32,
                    gap: 12,
                }}
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Ionicons
                            name="clipboard-outline"
                            size={40}
                            color="#94a3b8"
                        />
                        <Text className="mt-3 text-slate-500 font-medium">
                            No expenses yet. Start by adding one from the home screen.
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            <StatusBar style="light" />
        </View>
    );
}