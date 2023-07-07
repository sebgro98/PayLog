import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    Button,
    StyleSheet
} from 'react-native';
import Model from "./Model";

const MonthlyDetails = ({route}) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentForm, setPaymentForm] = useState({payment: '', notes: '', customer: ''});
    const [modalVisible, setModalVisible] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalTaxAmount, setTotalTaxAmount] = useState(0);

    const {currentMonth} = route.params;
    const model = new Model();

    const fetchPayments = useCallback(async () => {
        console.log("Fetching payments...");
        try {
            const allPayments = await model.getAllPayments(currentMonth);
            console.log("Fetched payments successfully:", allPayments);

            let total = 0;
            allPayments.forEach(payment => {
                console.log("Payment:", payment.payment);
                total += Number(payment.payment);
            });
            setTotalAmount(total);

            setMonthlyData(allPayments);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    }, [model, currentMonth]);

    useEffect(() => {
        fetchPayments();
    }, []);

    const confirmDeletePayment = () => {
        if (window.confirm("Are you sure you want to delete this payment?")) {
            deletePayment();
        }
    };

    useEffect(() => {
        if (totalAmount > 0) {
            const xAmount = totalAmount * 0.4;
            const taxAmount = totalAmount - xAmount;
            console.log("Total tax amount:", taxAmount);
            setTotalTaxAmount(taxAmount);
        }
        else {
            setTotalTaxAmount(totalAmount)
        }
    }, [totalAmount]);

    const deletePayment = async () => {
        try {
            await model.deletePayment(selectedPayment);
            setSelectedPayment(null);
            setModalVisible(!modalVisible);
            fetchPayments(); // Refetch payments to show updated data
        } catch (error) {
            console.error("Error deleting payment:", error);
        }
    };


    const updatePayment = async () => {
        console.log("Date__", selectedPayment)
        console.log("paymentFa", paymentForm)
        try {
            await model.updatePayment(selectedPayment, paymentForm);
            setSelectedPayment(null);
            setModalVisible(!modalVisible);
            fetchPayments();
        } catch (error) {
            console.error("Error updating payment:", error);
        }
    };

    // Render
    return (
        <View style={styles.container}>
            <Text style={styles.amount}>Total Amount: {totalAmount}</Text>
            <Text style={styles.amount}>Amount after taxes: {totalTaxAmount}</Text>
            <Text style={styles.header}>Monthly Detail
                for {`${currentMonth.toLocaleString('default', {month: 'long'})} ${currentMonth.getFullYear()}`}</Text>
            {
                monthlyData.map((data, index) => (
                    <TouchableOpacity style={styles.paymentCard} key={index} onPress={() => {
                        setSelectedPayment(data);
                        setModalVisible(true);
                    }}>
                        <Text style={styles.paymentText}>Date: {new Date(data.date).toLocaleDateString()}</Text>
                        <Text style={styles.paymentText}>Payment: {data.payment}</Text>
                        <Text style={styles.paymentText}>Customer: {data.customer}</Text>
                        <Text style={styles.paymentText}>Notes: {data.notes}</Text>
                    </TouchableOpacity>
                ))
            }
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Edit Payment information</Text>
                        <TextInput
                            placeholder="Payment"
                            style={styles.modalInput}
                            value={paymentForm.payment}
                            onChangeText={(text) => setPaymentForm({...paymentForm, payment: text})}
                        />

                        <TextInput
                            placeholder="Customer"
                            style={styles.modalInput}
                            value={paymentForm.customer} // Corrected value
                            onChangeText={(text) => setPaymentForm({
                                ...paymentForm,
                                customer: text
                            })}
                        />

                        <TextInput
                            placeholder="Notes"
                            style={styles.modalInput}
                            value={paymentForm.notes} // Corrected value
                            onChangeText={(text) => setPaymentForm({...paymentForm, notes: text})} // Corrected handler
                        />
                        <View style={styles.buttonContainer}>
                            <View style={styles.button}>
                                <Button title="Save Changes" onPress={updatePayment}/>
                            </View>
                            <View style={styles.button}>
                                <Button title="Delete" onPress={confirmDeletePayment}/>
                            </View>
                            <View style={styles.button}>
                                <Button title="Close" onPress={() => {
                                    setModalVisible(!modalVisible);
                                    setPaymentForm({payment: '', notes: '', customer: ''});
                                }}/>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    paymentText: {
        fontSize: 18,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18
    },
    modalInput: {
        width: '100%',
        height: 40,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        margin: 5,
    },
    amount: {
        fontSize: 18,
    }
});

export default MonthlyDetails;