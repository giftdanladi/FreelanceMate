import Invoice from "@/components/Invoice";
import { IInvoice } from "@/interface";
import { getAllInvoice } from "@/util/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function OverduePage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<IInvoice[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchInvoices = useCallback(async () => {
        try {
            const res = await getAllInvoice();
            if (res.success) {
                setInvoices(res.data);
            } else if (res.message) {
                Alert.alert("Notification", String(res.message));
            }
        } catch (error: any) {
            Alert.alert("Notification", `Failed to load invoices! ${error}`);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchInvoices();
        } catch (error: any) {
            Alert.alert("Notification", `Failed to refresh invoices! ${error}`);
        } finally {
            setRefreshing(false);
        }
    }, [fetchInvoices]);

    const overdueInvoices = useMemo(
        () => invoices.filter((inv) => inv.status === "overdue"),
        [invoices],
    );

    const totalOverdue = useMemo(
        () =>
            overdueInvoices.reduce(
                (sum, inv) => sum + Number(inv.total || 0),
                0,
            ),
        [overdueInvoices],
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-red-500 pt-16 pb-6 px-5 rounded-b-[26px]">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-red-400 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={22} color="white" />
                    </TouchableOpacity>
                    {/* <Text className="text-white text-lg font-semibold">Overdue</Text> */}
                    <View className="w-10" />
                </View>

                <View className="mt-6">
                    <Text className="text-red-100 text-sm">Total overdue</Text>
                    <Text className="text-white text-3xl font-bold mt-1">
                        £{Intl.NumberFormat().format(totalOverdue)}
                    </Text>
                    <Text className="text-red-100 mt-1">
                        {overdueInvoices.length} invoice
                        {overdueInvoices.length === 1 ? "" : "s"} past due
                    </Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={overdueInvoices}
                keyExtractor={(item) => item.id as string}
                renderItem={({ item }) => <Invoice data={item} />}
                className="px-5 mt-5 flex-1"
                contentContainerStyle={{
                    paddingBottom: 32,
                    gap: 12,
                }}
                ListEmptyComponent={
                    <View className="mt-10 items-center">
                        <Ionicons name="checkmark-done-circle-outline" size={40} />
                        <Text className="mt-3 text-slate-500 font-medium">
                            No overdue invoices. Great job!
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