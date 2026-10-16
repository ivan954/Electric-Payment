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

export const loginToPaiments = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const date = userCredential.user;

      dispatch({
        type: LOGIN_SUCCESS,
        payload: date,
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
  const data = [];
  try {
    dispatch({ type: PAYMENT_LIST_REQUEST });

    const querySnapshot = await getDocs(collection(db, "payments"));
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });

    dispatch({
      type: PAYMENT_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: PAYMENT_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const PaymentDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: PAYMENT_DETAILS_REQUEST });

    const docRef = doc(db, "payments", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      dispatch({
        type: PAYMENT_DETAILS_SUCCESS,
        payload: { ...docSnap.data(), id: docSnap.id },
      });
    } else {
      throw new Error("No such document!");
    }
  } catch (error) {
    dispatch({
      type: PAYMENT_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deletePayment = (id, image) => async (dispatch, getState) => {
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
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;

    dispatch({
      type: PAYMENT_DELETE_FAIL,
      payload: message,
    });
  }
};

export const createPayment =
  (KWH, date, price, paid, image) => async (dispatch, getState) => {
    try {
      dispatch({
        type: PAYMENT_CREATE_REQUEST,
      });

      const data = await addDoc(collection(db, "payments"), {
        KWH: KWH,
        date: date,
        image: image,
        paid: paid,
        price: price,
        updateTime: serverTimestamp(),
      });

      await setDoc(doc(db, "KWH", data.id), {
        KWH: KWH,
        date: date,
        updateTime: serverTimestamp(),
      });

      dispatch({
        type: PAYMENT_CREATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({
        type: PAYMENT_CREATE_FAIL,
        payload: message,
      });
    }
  };

export const updatePayment =
  ({ id, paid, price, KWH, date, image }) =>
  async (dispatch, getState) => {
    try {
      dispatch({
        type: PAYMENT_UPDATE_REQUEST,
      });
      const data = {
        KWH: KWH,
        date: date,
        image: image,
        paid: paid,
        price: price,
      };

      const examcollref = doc(db, "payments", id);
      await updateDoc(examcollref, data);
      await updateDoc(doc(db, "KWH", examcollref.id), {
        KWH: KWH,
        date: date,
        updateTime: serverTimestamp(),
      });

      dispatch({
        type: PAYMENT_UPDATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;

      dispatch({
        type: PAYMENT_UPDATE_FAIL,
        payload: message,
      });
    }
  };

export const getKWH = () => async (dispatch) => {
  try {
    dispatch({ type: KWH_REQUEST });

    const snapshot = await getDocs(collection(db, "KWH"));
    const readings = snapshot.docs.map((d) => d.data());

    const maxKwh = readings.length
      ? Math.max(...readings.map((r) => Number(r.KWH) || 0))
      : 0;
    const lastUpdateMs = Math.max(
      0,
      ...readings.map((r) => (r.updateTime ? r.updateTime.toMillis() : 0))
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
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Optimistically flips the "paid" flag on one or more payments; reverts if the write fails
export const setPaymentsPaid = (ids, paid) => async (dispatch, getState) => {
  const previous = getState()
    .electricList.payments.filter((p) => ids.includes(p.id))
    .map((p) => ({ id: p.id, paid: p.paid }));

  dispatch({ type: PAYMENT_PAID_SET, payload: { ids, paid } });

  try {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.update(doc(db, "payments", id), { paid }));
    await batch.commit();
  } catch (error) {
    previous.forEach(({ id, paid: oldPaid }) =>
      dispatch({ type: PAYMENT_PAID_SET, payload: { ids: [id], paid: oldPaid } })
    );
    throw error;
  }
};
