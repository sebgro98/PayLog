import {  onAuthStateChanged ,createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { db } from "./firebaseModel";
import { collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,query, where} from "firebase/firestore";
import { toast } from 'react-toastify';

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
            console.log(error)
            throw error;
        }
    }

    async updatePayment1(payment, updatedData) {
        try {
            const dateString = payment.date.toString();
            const [year, month] = dateString.split('-');

            console.log("yearMonth", `${year}_${month}`);
            console.log("payment.id", updatedData);

            // Check if updatedData.payment is less than 0
            if (updatedData.payment < 0) {
                updatedData.expenses = Math.abs(updatedData.payment);
                updatedData.vat = updatedData.payment * 0.25;
            } else {
                updatedData.expenses = 0;
                updatedData.vat = updatedData.payment * 0.25;
            }

            updatedData.paymentVat = updatedData.payment - updatedData.vat;
            if(updatedData.paymentVat < 0) {
                updatedData.expenses = Math.abs(updatedData.paymentVat);
            }


            // Remove customer and notes from updatedData if they are empty
            if (updatedData.customer === '') {
                delete updatedData.customer;
            }
            if (updatedData.notes === '') {
                delete updatedData.notes;
            }

            const paymentRef = doc(db, 'Payments2', `${year}_${month}`, 'days', payment.id);
            await updateDoc(paymentRef, updatedData);
            toast(`Successfully updated payment for date: ${dateString}`);
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    }



    /*async  updatePayment(date, updatedData) {

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            console.log("date", date)
            const paymentDocRef = doc(db, 'Payments', user.email, date.date, date.id);
            await updateDoc(paymentDocRef, updatedData);
            toast(`Successfully updated payment for date: ${date}`);
        } catch (error) {
            console.error(`Error updating payment for date: ${date}`, error);
            throw error;
        }
    }*/

    /*async  getAllPayments(yearMonth) {
        const auth = getAuth();
        const user = auth.currentUser;
        console.log("wtf",yearMonth)

        try  {
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
        } catch (error) {
            toast.error('No user found');
            return [];
        }
    }*/

    async getPayments(selectedDate) {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            console.log("selected", selectedDate);
            const dateString = this.toLocalISOString(selectedDate);
            const [year, month] = dateString.split('-');

            console.log("month", month);
            const paymentsRef = collection(db, 'Payments2');
            const monthDocRef = doc(paymentsRef, `${year}_${month}`);
            const dayCollectionRef = collection(monthDocRef, 'days');

            // Add a filter to only retrieve payments for the current user's email
            const querySnapshot = await getDocs(
                query(dayCollectionRef, where('user_email', '==', user.email))
            );

            const payments = [];
            querySnapshot.forEach((doc) => {
                payments.push({ id: doc.id, ...doc.data() });
            });

            console.log('Before sorting:', payments);

            // Sort the payments array by the 'day' field in ascending order
            payments.sort((a, b) => a.date.localeCompare(b.date));

            console.log('After sorting:', payments);

            return payments;
        } catch (error) {
            console.error('Error getting payments:', error);
            return [];
        }
    }



    async getPaymentsYear(selectedDate) {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            const dateString = this.toLocalISOString(selectedDate);
            const [year] = dateString.split('-');
            console.log("selectedDate", selectedDate);
            console.log("dateString", dateString);
            const paymentsRef = collection(db, 'Payments2');

            const yearPayments = [];

            for (let month = 1; month <= 12; month++) {
                const monthString = String(month).padStart(2, '0');
                const monthDocRef = doc(paymentsRef, `${year}_${monthString}`);
                const dayCollectionRef = collection(monthDocRef, 'days');

                const querySnapshot = await getDocs(
                    query(dayCollectionRef, where('user_email', '==', user.email)) // Add query filter for user email
                );

                querySnapshot.forEach((doc) => {
                    yearPayments.push(doc.data());
                });
            }

            return yearPayments;
        } catch (error) {
            console.error('Error getting payments:', error);
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
            console.error(error)
            throw error
        }
    }

    async deletePayment(payment) {

        const dateString = payment.date.toString();
        const [year, month] = dateString.split('-');

        try {
            const docRef = doc(db, 'Payments2', `${year}_${month}`, 'days', payment.id);
            await deleteDoc(docRef);
            toast(`Deleted payment ${payment.date}`);
        } catch (error) {
            toast.error(error)
        }
    }

    toLocalISOString(date) {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset*60*1000));
        return adjustedDate.toISOString().split('T')[0];
    }

    async  addPayments(selectedDate, amountPayed, customer, notes) {
        try {
            const auth = getAuth();
            const user = auth.currentUser;


            // Convert date to string format to use as document ID (e.g. '2023-07-06')
            const dateString = this.toLocalISOString(selectedDate);
            console.log("This is date",dateString)

            const userPaymentsRef = collection(db, 'Payments', user.email, dateString);

            const userPostsCollectionSnapshot = await getDocs(userPaymentsRef);
            if (userPostsCollectionSnapshot.empty) {
                await setDoc(userPaymentsRef.parent, {[userPaymentsRef.id]: {}});
            }

            await addDoc(userPaymentsRef, {
                payment: amountPayed,
                customer: customer,
                notes: notes,

            });
        } catch {
            toast.error("User must be signed in to create a post.");
        }
    }

    async addPayment(selectedDate, payment, customer, notes) {
        try {
            const date = this.toLocalISOString(selectedDate);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            console.log("`${year}_${month}`", `${year}_${month}`)
            let vat = 0;
            let expenses = 0;
            if (payment < 0) {
                vat = payment * 0.25;
                expenses = payment.paymentVat;
            } else {
                vat = payment * 0.25; // Calculate positive VAT when payment is positive
            }
            let paymentVat = (payment - vat);

            if (paymentVat < 0) {
                expenses = Math.abs(paymentVat);
            }

            const auth = getAuth();
            const user = auth.currentUser;

            const paymentData = {
                user_email: user.email,
                payment,
                customer,
                notes,
                date,
                paymentVat,
                vat,
                expenses,
            };

            const paymentsRef = collection(db, 'Payments2');
            const monthDocRef = doc(paymentsRef, `${year}_${month}`);
            const dayCollectionRef = collection(monthDocRef, 'days');

            const userPostsCollectionSnapshot = await getDocs(dayCollectionRef);
            if (userPostsCollectionSnapshot.empty) {
                await setDoc(dayCollectionRef.parent, {[dayCollectionRef.id]: {}});
            }

            await addDoc(dayCollectionRef, paymentData);

            toast('Payment added successfully!');
        } catch (error) {
            toast.error('Error adding payment:', error);
        }
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
            console.error(error)
        }
    }
}



export default Model;
