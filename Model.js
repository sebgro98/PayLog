import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebaseModel";
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, addDoc, updateDoc, orderBy, query } from "firebase/firestore";

class Model {
    constructor() {
        this.currentUserUID = null;
        this.currentLoggedInUser = null;
    }

    async Registration(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                getAuth(),
                email,
                password
            );
            await setDoc(doc(db, "Users", userCredential.user.uid), {
                email: userCredential.user.email,
                password: password,
            });
        } catch (error) {
            throw error;
        }
    }

    async logIn(email, password) {
        const auth = getAuth();
        await setPersistence(auth, browserLocalPersistence);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            this.currentUserUID = userCredential.user.uid;
            this.currentLoggedInUser = email;
            console.log(this.currentLoggedInUser);
            return email;
        } catch (error) {
            switch (error.code) {
                case "auth/invalid-email":
                    throw new Error("Invalid email!");
                case "auth/user-not-found":
                    throw new Error("Account does not exist!");
                case "auth/wrong-password":
                    throw new Error("Invalid password!");
                default:
                    throw new Error("Email or password invalid!");
            }
        }
    }

    toLocalISOString(date) {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset*60*1000));
        return adjustedDate.toISOString().split('T')[0];
    }

    async  addPayments(selectedDate, amountPayed, Customer) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User must be signed in to create a post.');
        }

        // Convert date to string format to use as document ID (e.g. '2023-07-06')
        const dateString = this.toLocalISOString(selectedDate);
        console.log(dateString)

        const userPaymentsRef = collection(db, 'Payments', user.email, dateString);

        // Add a new document with a server-generated ID
        const newPaymentRef = doc(userPaymentsRef);
        await setDoc(newPaymentRef, { payment: amountPayed, customer: Customer });
    }

    async logout() {
        const auth = getAuth();
        try {
            console.log(this.currentLoggedInUser);
            await auth.signOut();
            console.log(this.currentLoggedInUser);
            this.currentLoggedInUser = undefined;
            console.log(auth.currentUser);
        } catch (error) {
            console.error(error);
        }
    }
}



export default Model;
