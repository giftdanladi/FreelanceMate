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
    const q = query(chatRef, where("userId", "==", user.id));

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