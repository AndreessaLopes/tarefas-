// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOK_CndJvFmiWwvWy62IgtTuwGX_FQNds",
  authDomain: "tarefaplus-7f848.firebaseapp.com",
  projectId: "tarefaplus-7f848",
  storageBucket: "tarefaplus-7f848.firebasestorage.app",
  messagingSenderId: "110111349094",
  appId: "1:110111349094:web:69be4dea8ee0147c1ad0a7",
  measurementId: "G-XDR59LL7P4"
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db };