import { db } from "@/firebaseConfig";
import { IExpense, IInvoice, IUser } from "@/interface";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { readData } from "./storage";

const invoiceRef = collection(db, "invoices");
const expenseRef = collection(db, "expenses");
const usersRef = collection(db, "users");
const chatRef = collection(db, "chats");

export const loginUser = async (user: any) => {
  try {
    const q = query(
      usersRef,
      where("email", "==", user.email),
      where("password", "==", user.password),
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const user = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      };
      return {
        success: true,
        user,
      };
    } else {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

const emailExists = async (email: string) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  return !querySnapshot.empty;
};

export const addUser = async (data: any) => {
  try {
    const usersRef = collection(db, "users");
    const [emailTaken] = await Promise.all([emailExists(data.email)]);

    if (emailTaken) {
      return {
        success: false,
        message: `Email already exists.`,
      };
    }

    const userData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(usersRef, userData);

    return {
      success: true,
      message: `User added successfully.`,
      data: {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getAllInvoice = async () => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id as string),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const data: any = [];

    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getInvoiceStats = async () => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id as string),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const total = invoices.length;
    const paid = invoices.filter((inv) => inv.status === "paid").length;
    const pending = invoices.filter((inv) => inv.status === "pending").length;
    const overdue = invoices.filter((inv) => inv.status === "overdue").length;

    return {
      success: true,
      data: {
        total,
        paid,
        pending,
        overdue,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const addInvoice = async (data: any) => {
  try {
    await addDoc(invoiceRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Invoice added successfully.`,
    };
  } catch (error: any) {
    console.error("Error adding invoice: ", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  status: string,
) => {
  try {
    const invoiceDocRef = doc(invoiceRef, invoiceId);

    await updateDoc(invoiceDocRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Invoice status updated to ${status} successfully.`,
    };
  } catch (error: any) {
    console.error("Error updating invoice status: ", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllExpenses = async () => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      expenseRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const data: any = [];

    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getExpenseStats = async () => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      expenseRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const expenses: IExpense[] = [];

    snapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...(doc.data() as IExpense) });
    });

    const total = expenses.length;
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0,
    );

    const byCategory: Record<string, number> = {};
    expenses.forEach((exp) => {
      const category = exp.category || "Uncategorized";
      const amount = Number(exp.amount || 0);
      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category] += amount;
    });

    return {
      success: true,
      data: {
        total,
        totalAmount,
        byCategory,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const addExpense = async (data: any) => {
  try {
    await addDoc(expenseRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Expense added successfully.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error,
    };
  }
};

export const updateProfile = async (uid: string, updatedData: any) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updatedData);
    return {
      success: true,
      message: `Profile updated!`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error,
    };
  }
};

export const addChat = async (data: any) => {
  try {
    await addDoc(chatRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Chat added successfully.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getAllConversations = async () => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      chatRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "asc") // Added orderBy to fix query
    );

    const snapshot = await getDocs(q);
    const data: any = [];

    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

export const getSalesStatsThisMonth = async () => {
  const user: IUser = await readData("user");

  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const paidThisMonth = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;

      const createdAt =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : inv.createdAt?.toDate?.();

      if (!createdAt) return false;

      return (
        createdAt.getMonth() === currentMonth &&
        createdAt.getFullYear() === currentYear
      );
    });

    const totalSales = paidThisMonth.reduce(
      (sum, inv) => sum + Number(inv.total || 0),
      0,
    );

    const highestSale = paidThisMonth.reduce(
      (max, inv) => Math.max(max, Number(inv.total || 0)),
      0,
    );

    return {
      success: true,
      data: {
        count: paidThisMonth.length,
        totalSales,
        highestSale,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// NEW: Get sales stats for last month
export const getSalesStatsLastMonth = async () => {
  const user: IUser = await readData("user");

  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const paidLastMonth = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;

      const createdAt =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : inv.createdAt?.toDate?.();

      if (!createdAt) return false;

      return (
        createdAt.getMonth() === lastMonth &&
        createdAt.getFullYear() === lastMonthYear
      );
    });

    const totalSales = paidLastMonth.reduce(
      (sum, inv) => sum + Number(inv.total || 0),
      0,
    );

    const highestSale = paidLastMonth.reduce(
      (max, inv) => Math.max(max, Number(inv.total || 0)),
      0,
    );

    return {
      success: true,
      data: {
        count: paidLastMonth.length,
        totalSales,
        highestSale,
        month: lastMonth,
        year: lastMonthYear,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// NEW: Get sales stats for a specific month
export const getSalesStatsByMonth = async (month: number, year: number) => {
  const user: IUser = await readData("user");

  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const paidInMonth = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;

      const createdAt =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : inv.createdAt?.toDate?.();

      if (!createdAt) return false;

      return (
        createdAt.getMonth() === month &&
        createdAt.getFullYear() === year
      );
    });

    const totalSales = paidInMonth.reduce(
      (sum, inv) => sum + Number(inv.total || 0),
      0,
    );

    const highestSale = paidInMonth.reduce(
      (max, inv) => Math.max(max, Number(inv.total || 0)),
      0,
    );

    return {
      success: true,
      data: {
        count: paidInMonth.length,
        totalSales,
        highestSale,
        month,
        year,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// NEW: Get invoice stats by month
export const getInvoiceStatsByMonth = async (month: number, year: number) => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id as string),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const allInvoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      allInvoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const invoices = allInvoices.filter((inv) => {
      const createdAt =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : inv.createdAt?.toDate?.();

      if (!createdAt) return false;

      return (
        createdAt.getMonth() === month &&
        createdAt.getFullYear() === year
      );
    });

    const total = invoices.length;
    const paid = invoices.filter((inv) => inv.status === "paid").length;
    const pending = invoices.filter((inv) => inv.status === "pending").length;
    const overdue = invoices.filter((inv) => inv.status === "overdue").length;

    return {
      success: true,
      data: {
        total,
        paid,
        pending,
        overdue,
        month,
        year,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// Helper function to get month name
export const getMonthName = (month: number): string => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[month];
};

export const getDetailedInvoiceContext = async () => {
  const user: IUser = await readData("user");
  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id as string),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const now = new Date();
    const unpaidInvoices = invoices.filter((inv) => inv.status !== "paid");

    // Categorize unpaid invoices
    const pending = unpaidInvoices.filter((inv) => inv.status === "pending");
    const overdue = unpaidInvoices.filter((inv) => inv.status === "overdue");

    // Analyze each unpaid invoice
    const invoiceDetails = unpaidInvoices.map((inv) => {
      const dueDate = inv.dueDate instanceof Date
        ? inv.dueDate
        : typeof inv.dueDate === 'string'
          ? new Date(inv.dueDate)
          : inv.dueDate?.toDate?.();

      const issueDate = inv.createdAt instanceof Date
        ? inv.createdAt
        : inv.createdAt?.toDate?.();

      let daysOverdue = 0;
      let daysTillDue = 0;

      if (dueDate) {
        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          daysOverdue = diffDays;
        } else {
          daysTillDue = Math.abs(diffDays);
        }
      }

      return {
        id: inv.id,
        status: inv.status,
        total: inv.total,
        clientName: inv.clientName || "Unknown Client",
        dueDate,
        issueDate,
        daysOverdue,
        daysTillDue,
        isOverdue: daysOverdue > 0,
        isPending: inv.status === "pending" && daysOverdue === 0,
      };
    });

    return {
      success: true,
      data: {
        totalUnpaid: unpaidInvoices.length,
        pendingCount: pending.length,
        overdueCount: overdue.length,
        invoiceDetails,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// Replace the invoice query handling section in your Chat.tsx handlePrompt function
// with this enhanced version:

export const handleUnpaidInvoiceQuery = async (
  prompt: string,
  currentUser: IUser
) => {
  const lowerPrompt = prompt.toLowerCase();

  const isAskingWhy =
    lowerPrompt.includes("why") ||
    lowerPrompt.includes("reason");

  const mentionsUnpaid =
    lowerPrompt.includes("unpaid") ||
    lowerPrompt.includes("not paid") ||
    lowerPrompt.includes("haven't been paid");

  if (isAskingWhy && mentionsUnpaid) {
    const contextRes = await getDetailedInvoiceContext();

    if (contextRes.success) {
      const { totalUnpaid, overdueCount, pendingCount, invoiceDetails } =
        contextRes.data as unknown as {
          totalUnpaid: number;
          overdueCount: number;
          pendingCount: number;
          invoiceDetails: Array<{
            id: string;
            status: string;
            total: number;
            clientName: string;
            daysOverdue: number;
            daysTillDue: number;
            isOverdue: boolean;
            isPending: boolean;
          }>;
        };

      let response = "";

      if (totalUnpaid === 0) {
        response = "You don't have any unpaid invoices. All invoices have been paid. Great job staying on top of your finances! 🎉";
      } else if (totalUnpaid === 1) {
        const inv = invoiceDetails[0];

        if (inv.isOverdue) {
          const dayText = inv.daysOverdue === 1 ? "day" : "days";
          response = `You have one unpaid invoice because it has passed its due date by ${inv.daysOverdue} ${dayText} and has not yet been paid. `;
          response += `This invoice is for ${inv.clientName}. `;
          response += `Would you like me to help you draft a follow-up reminder?`;
        } else if (inv.isPending) {
          if (inv.daysTillDue > 0) {
            const dayText = inv.daysTillDue === 1 ? "day" : "days";
            response = `You have one unpaid invoice because it was issued recently and has not yet reached its due date (due in ${inv.daysTillDue} ${dayText}). `;
            response += `This is normal, and no action is required right now. The invoice is for ${inv.clientName}.`;
          } else {
            response = `You have one unpaid invoice for ${inv.clientName}. It's currently pending and no action is required yet.`;
          }
        }
      } else {
        // Multiple unpaid invoices
        const overdueInvoices = invoiceDetails.filter(inv => inv.isOverdue);
        const pendingInvoices = invoiceDetails.filter(inv => inv.isPending);

        response = `You have ${totalUnpaid} unpaid invoices. `;

        if (overdueCount > 0 && pendingCount > 0) {
          response += `${overdueCount} ${overdueCount === 1 ? 'is' : 'are'} overdue and ${pendingCount} ${pendingCount === 1 ? 'is' : 'are'} still pending. `;
        } else if (overdueCount > 0) {
          response += `All ${overdueCount} ${overdueCount === 1 ? 'has' : 'have'} passed their due dates. `;
        } else if (pendingCount > 0) {
          response += `All ${pendingCount} ${pendingCount === 1 ? 'is' : 'are'} still within their payment period. `;
        }

        // Mention most overdue
        if (overdueInvoices.length > 0) {
          const mostOverdue = overdueInvoices.reduce((prev, current) =>
            current.daysOverdue > prev.daysOverdue ? current : prev
          );

          const dayText = mostOverdue.daysOverdue === 1 ? "day" : "days";
          response += `The most overdue is for ${mostOverdue.clientName}, which is ${mostOverdue.daysOverdue} ${dayText} late. `;
        }

        response += `Would you like help prioritizing follow-ups?`;
      }

      return {
        success: true,
        response,
      };
    }
  }

  return { success: false };
};

// Get income/sales for a specific month
export const getIncomeByMonth = async (month: number, year: number) => {
  const user: IUser = await readData("user");

  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const paidInMonth = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;

      const createdAt =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : inv.createdAt?.toDate?.();

      if (!createdAt) return false;

      return (
        createdAt.getMonth() === month &&
        createdAt.getFullYear() === year
      );
    });

    const totalIncome = paidInMonth.reduce(
      (sum, inv) => sum + Number(inv.total || 0),
      0,
    );

    const highestSale = paidInMonth.reduce(
      (max, inv) => Math.max(max, Number(inv.total || 0)),
      0,
    );

    const averageSale = paidInMonth.length > 0 ? totalIncome / paidInMonth.length : 0;

    return {
      success: true,
      data: {
        count: paidInMonth.length,
        totalIncome,
        highestSale,
        averageSale,
        month,
        year,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// Get income for the last N months
export const getIncomeLastNMonths = async (numberOfMonths: number = 6) => {
  const user: IUser = await readData("user");

  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const now = new Date();
    const monthlyData: Array<{
      month: number;
      year: number;
      monthName: string;
      totalIncome: number;
      count: number;
    }> = [];

    // Get data for last N months
    for (let i = 0; i < numberOfMonths; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = targetDate.getMonth();
      const year = targetDate.getFullYear();

      const paidInMonth = invoices.filter((inv) => {
        if (inv.status !== "paid") return false;

        const createdAt =
          inv.createdAt instanceof Date
            ? inv.createdAt
            : inv.createdAt?.toDate?.();

        if (!createdAt) return false;

        return (
          createdAt.getMonth() === month &&
          createdAt.getFullYear() === year
        );
      });

      const totalIncome = paidInMonth.reduce(
        (sum, inv) => sum + Number(inv.total || 0),
        0,
      );

      monthlyData.push({
        month,
        year,
        monthName: getMonthName(month),
        totalIncome,
        count: paidInMonth.length,
      });
    }

    // Reverse so oldest month is first
    monthlyData.reverse();

    return {
      success: true,
      data: monthlyData,
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// Predict future income based on historical data
export const predictFutureIncome = async () => {
  const user: IUser = await readData("user");

  try {
    // Get last 6 months of data
    const historyRes = await getIncomeLastNMonths(6);

    if (!historyRes.success || !historyRes.data) {
      return {
        success: false,
        message: "Unable to fetch historical data",
      };
    }

    const monthlyData = historyRes.data;

    // Filter out months with no income for more accurate prediction
    const monthsWithIncome = monthlyData.filter(m => m.totalIncome > 0);

    if (monthsWithIncome.length === 0) {
      return {
        success: true,
        data: {
          prediction: 0,
          confidence: "low",
          message: "Not enough data to make a prediction. Start tracking your income!",
          averageMonthlyIncome: 0,
          trend: "insufficient_data",
        },
      };
    }

    // Calculate average monthly income
    const totalIncome = monthsWithIncome.reduce((sum, m) => sum + m.totalIncome, 0);
    const averageMonthlyIncome = totalIncome / monthsWithIncome.length;

    // Calculate trend (simple linear regression)
    let trend: "increasing" | "decreasing" | "stable" | "insufficient_data" = "stable";
    let growthRate = 0;

    if (monthsWithIncome.length >= 3) {
      const recentMonths = monthsWithIncome.slice(-3);
      const earlierMonths = monthsWithIncome.slice(0, Math.min(3, monthsWithIncome.length - 3));

      if (earlierMonths.length > 0) {
        const recentAvg = recentMonths.reduce((sum, m) => sum + m.totalIncome, 0) / recentMonths.length;
        const earlierAvg = earlierMonths.reduce((sum, m) => sum + m.totalIncome, 0) / earlierMonths.length;

        const percentChange = ((recentAvg - earlierAvg) / earlierAvg) * 100;
        growthRate = percentChange;

        if (percentChange > 10) {
          trend = "increasing";
        } else if (percentChange < -10) {
          trend = "decreasing";
        }
      }
    }

    // Make prediction for next month
    let prediction = averageMonthlyIncome;

    if (trend === "increasing") {
      // Apply growth rate to prediction
      prediction = averageMonthlyIncome * (1 + (growthRate / 100));
    } else if (trend === "decreasing") {
      // Apply decline rate to prediction
      prediction = averageMonthlyIncome * (1 + (growthRate / 100));
    }

    // Determine confidence level
    let confidence: "low" | "medium" | "high" = "low";
    if (monthsWithIncome.length >= 6) {
      confidence = "high";
    } else if (monthsWithIncome.length >= 3) {
      confidence = "medium";
    }

    return {
      success: true,
      data: {
        prediction: Math.max(0, prediction), // Don't predict negative income
        confidence,
        averageMonthlyIncome,
        trend,
        growthRate,
        monthsAnalyzed: monthsWithIncome.length,
        historicalData: monthlyData,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};

// Get year-to-date income
export const getYearToDateIncome = async () => {
  const user: IUser = await readData("user");

  try {
    const q = query(
      invoiceRef,
      where("userId", "==", user.id),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const invoices: IInvoice[] = [];

    snapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...(doc.data() as IInvoice) });
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    const paidThisYear = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;

      const createdAt =
        inv.createdAt instanceof Date
          ? inv.createdAt
          : inv.createdAt?.toDate?.();

      if (!createdAt) return false;

      return createdAt.getFullYear() === currentYear;
    });

    const totalIncome = paidThisYear.reduce(
      (sum, inv) => sum + Number(inv.total || 0),
      0,
    );

    return {
      success: true,
      data: {
        totalIncome,
        count: paidThisYear.length,
        year: currentYear,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error,
    };
  }
};