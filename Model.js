import {  onAuthStateChanged ,createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebaseModel";
import { collection, doc, getDocs, setDoc, addDoc,query, updateDoc} from "firebase/firestore";

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


    async  updatePayment(date, updatedData) {

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const paymentDocRef = doc(db, 'Payments', user.email, date.date, date.id);
            await updateDoc(paymentDocRef, updatedData);
            console.log(`Successfully updated payment for date: ${date}`);
        } catch (error) {
            console.error(`Error updating payment for date: ${date}`, error);
            throw error;
        }
    }

    async  getAllPayments(yearMonth) {
        const auth = getAuth();
        const user = auth.currentUser;
        console.log("wtf",yearMonth)

        if (user) {
            console.log(`Fetching payments for user: ${user.email}`);

            yearMonth = this.toLocalISOString(yearMonth);
            console.log("yearmonth",yearMonth)

            const allPayments = [];
            const [year, month, day] = yearMonth.split('-').map(Number);
            const daysInMonth = new Date(year, month, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                // Create the dateString in 'YYYY-MM-DD' format
                const dateString = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
                console.log(`Fetching payments for date: ${dateString}`);

                const dayCollectionRef = collection(db, 'Payments', user.email, dateString);
                const daySnapshot = await getDocs(dayCollectionRef);

                console.log(`Found ${daySnapshot.docs.length} payments for date: ${dateString}`);

                const dayPayments = daySnapshot.docs.map(doc => ({id: doc.id, date: dateString, ...doc.data()}));
                allPayments.push(...dayPayments);
            }

            console.log(`Found a total of ${allPayments.length} payments for the month`);
            return allPayments;
        } else {
            console.error('No user found');
            return [];
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
