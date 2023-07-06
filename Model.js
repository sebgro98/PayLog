import {  onAuthStateChanged ,createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebaseModel";
import { collection, doc, getDocs, setDoc, addDoc,} from "firebase/firestore";

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

    async  getAllPayments() {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const paymentsCollectionRef = collection(db, 'Payment');
                const paymentsSnapshot = await getDocs(paymentsCollectionRef);
                const allPayments = [];

                for (const dateDoc of paymentsSnapshot.docs) {
                    const date = dateDoc.id;
                    const datePaymentsCollectionRef = collection(dateDoc.ref, 'fields');
                    const datePaymentsSnapshot = await getDocs(datePaymentsCollectionRef);

                    const datePayments = datePaymentsSnapshot.docs.map(doc => ({ date, id: doc.id, ...doc.data() }));

                    allPayments.push(...datePayments);
                }

                const orderedPayments = allPayments.sort((a, b) => a.date.localeCompare(b.date));
                console.log(orderedPayments);
                return orderedPayments;
            } else {
                console.log('No user found');
                return [];
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    async getUser() {
        return new Promise((resolve, reject) => {
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
                resolve(user);
            }, (error) => {
                reject(error);
            });
        });
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

    async  addPayments(selectedDate, amountPayed, Customer, notes) {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User must be signed in to create a post.');
        }

        // Convert date to string format to use as document ID (e.g. '2023-07-06')
        const dateString = this.toLocalISOString(selectedDate);
        console.log(dateString)

        const userPaymentsRef = collection(db, 'Payments', user.email, dateString);

        const userPostsCollectionSnapshot = await getDocs(userPaymentsRef);
        if (userPostsCollectionSnapshot.empty) {
            await setDoc(userPaymentsRef.parent, {[userPaymentsRef.id]: {}});
        }

        await addDoc(userPaymentsRef, {
            payment: amountPayed,
            customer: Customer,
            notes: notes,

        });
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
