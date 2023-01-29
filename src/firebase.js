import { initializeApp } from "firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYf7ozB9Icalqwm13LtQtRbxPMhawGItU",
  authDomain: "aara-uniforms-admin.firebaseapp.com",
  projectId: "aara-uniforms-admin",
  storageBucket: "aara-uniforms-admin.appspot.com",
  messagingSenderId: "1054527169621",
  appId: "1:1054527169621:web:790b1d7ff145a3024120dc",
};

initializeApp(firebaseConfig);

const db = getFirestore();

const colRef = collection(db, "orders");

getDocs(colRef).then((res) => {
  console.log(res.docs);
});
