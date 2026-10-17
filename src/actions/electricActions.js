import {
  PAYMENT_LIST_REQUEST,
  PAYMENT_LIST_SUCCESS,
  PAYMENT_LIST_FAIL,
  PAYMENT_DETAILS_REQUEST,
  PAYMENT_DETAILS_SUCCESS,
  PAYMENT_DETAILS_FAIL,
  PAYMENT_DELETE_SUCCESS,
  PAYMENT_DELETE_REQUEST,
  PAYMENT_DELETE_FAIL,
  PAYMENT_CREATE_REQUEST,
  PAYMENT_CREATE_SUCCESS,
  PAYMENT_CREATE_FAIL,
  PAYMENT_UPDATE_REQUEST,
  PAYMENT_UPDATE_SUCCESS,
  PAYMENT_UPDATE_FAIL,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  USER_LOGOUT,
  KWH_REQUEST,
  KWH_SUCCESS,
  KWH_FAIL,
  PAYMENT_PAID_SET,
} from "../constants/electricConstants";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  getDoc,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { ref, deleteObject, getStorage } from "firebase/storage";
import { auth } from "../firebase";
import { db } from "../firebase";

export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: userCredential.user,
      });
    })
    .catch((error) => {
      dispatch({
        type: LOGIN_FAIL,
        payload: error.message,
      });
    });
};

export const logout = () => async (dispatch) => {
  await signOut(auth);
  dispatch({ type: USER_LOGOUT });
};

export const listPayments = () => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_LIST_REQUEST });

    const snapshot = await getDocs(collection(db, "payments"));
    const payments = snapshot.docs.map((paymentDoc) => ({
      id: paymentDoc.id,
      ...paymentDoc.data(),
    }));

    dispatch({
      type: PAYMENT_LIST_SUCCESS,
      payload: payments,
    });
  } catch (error) {
    dispatch({
      type: PAYMENT_LIST_FAIL,
      payload: error.message,
    });
  }
};

export const fetchPaymentDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_DETAILS_REQUEST });

    const paymentDoc = await getDoc(doc(db, "payments", id));
    if (!paymentDoc.exists()) {
      throw new Error("Payment not found");
    }

    dispatch({
      type: PAYMENT_DETAILS_SUCCESS,
      payload: { ...paymentDoc.data(), id: paymentDoc.id },
    });
  } catch (error) {
    dispatch({
      type: PAYMENT_DETAILS_FAIL,
      payload: error.message,
    });
  }
};

export const deletePayment = (id, image) => async (dispatch) => {
  try {
    dispatch({
      type: PAYMENT_DELETE_REQUEST,
    });

    await deleteDoc(doc(db, "payments", id));
    await deleteDoc(doc(db, "KWH", id));

    // The records are already gone; a missing/undeletable image shouldn't fail the delete
    if (image) {
      try {
        await deleteObject(ref(getStorage(), image));
      } catch (storageError) {
        console.warn("Could not delete payment image:", storageError.message);
      }
    }
    dispatch(getKWH());

    dispatch({
      type: PAYMENT_DELETE_SUCCESS,
    });
  } catch (error) {
    dispatch({
      type: PAYMENT_DELETE_FAIL,
      payload: error.message,
    });
  }
};

export const createPayment =
  (KWH, date, price, paid, image, pricePerKwh) => async (dispatch) => {
    try {
      dispatch({
        type: PAYMENT_CREATE_REQUEST,
      });

      const paymentRef = await addDoc(collection(db, "payments"), {
        KWH,
        date,
        image,
        paid,
        price,
        pricePerKwh,
        updateTime: serverTimestamp(),
      });

      await setDoc(doc(db, "KWH", paymentRef.id), {
        KWH,
        date,
        updateTime: serverTimestamp(),
      });

      dispatch({
        type: PAYMENT_CREATE_SUCCESS,
        payload: paymentRef,
      });
    } catch (error) {
      dispatch({
        type: PAYMENT_CREATE_FAIL,
        payload: error.message,
      });
    }
  };

export const updatePayment =
  ({ id, paid, price, KWH, date, image }) =>
  async (dispatch) => {
    try {
      dispatch({
        type: PAYMENT_UPDATE_REQUEST,
      });
      const updatedFields = { KWH, date, image, paid, price };

      await updateDoc(doc(db, "payments", id), updatedFields);
      await updateDoc(doc(db, "KWH", id), {
        KWH,
        date,
        updateTime: serverTimestamp(),
      });

      dispatch({
        type: PAYMENT_UPDATE_SUCCESS,
        payload: updatedFields,
      });
    } catch (error) {
      dispatch({
        type: PAYMENT_UPDATE_FAIL,
        payload: error.message,
      });
    }
  };

export const getKWH = () => async (dispatch) => {
  try {
    dispatch({ type: KWH_REQUEST });

    const snapshot = await getDocs(collection(db, "KWH"));
    const readings = snapshot.docs.map((readingDoc) => readingDoc.data());

    const maxKwh = readings.length
      ? Math.max(...readings.map((reading) => Number(reading.KWH) || 0))
      : 0;
    const lastUpdateMs = Math.max(
      0,
      ...readings.map((reading) =>
        reading.updateTime ? reading.updateTime.toMillis() : 0
      )
    );
    const lastUpdate = lastUpdateMs
      ? new Date(lastUpdateMs).toLocaleDateString("en-GB")
      : null;

    dispatch({
      type: KWH_SUCCESS,
      payload: [maxKwh, lastUpdate],
    });
  } catch (error) {
    dispatch({
      type: KWH_FAIL,
      payload: error.message,
    });
  }
};

// Optimistically flips the "paid" flag on one or more payments; reverts if the write fails
export const setPaymentsPaid = (ids, paid) => async (dispatch, getState) => {
  const previousStatuses = getState()
    .electricList.payments.filter((payment) => ids.includes(payment.id))
    .map((payment) => ({ id: payment.id, paid: payment.paid }));

  dispatch({ type: PAYMENT_PAID_SET, payload: { ids, paid } });

  try {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.update(doc(db, "payments", id), { paid }));
    await batch.commit();
  } catch (error) {
    previousStatuses.forEach(({ id, paid: previousPaid }) =>
      dispatch({
        type: PAYMENT_PAID_SET,
        payload: { ids: [id], paid: previousPaid },
      })
    );
    throw error;
  }
};
