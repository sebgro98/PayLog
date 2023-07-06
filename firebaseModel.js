import firebaseConfig from './firebaseConfig.js';
import {initializeApp} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
    db,
    auth,
}
export default app;