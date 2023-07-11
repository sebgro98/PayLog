import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Modal} from 'react-native';
import Model from "./Model.js"
import {toast} from "react-toastify";

const CalendarComponent = (  {navigation }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [monthName, setMonthName] = useState(() => currentMonth.toLocaleString('default', {month: 'long'}));
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);


    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registrationSuccessful, setRegistrationSuccessful] = useState(false);
    const model = new Model();

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [payment, setPayment] = useState('');
    const [customer, setCustomer] = useState('');
    const [notes, setNotes] = useState('');


    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
        setCurrentMonth(newMonth);
        console.log("this",currentMonth)
    };

    useEffect(() => {
        const monthName = `${currentMonth.toLocaleString('default', {month: 'long'})} ${currentMonth.getFullYear()}`;
        setMonthName(monthName);

        const newCalendarData = generateCalendarData(currentMonth);
        setCalendarData(newCalendarData);

        setIsLoading(false); // Set loading to false after the calendar data has been generated
    }, [currentMonth]);

    useEffect(() => {
        const fetchUserLoginState = async () => {
            const isLoggedIn = await model.getUser();
            setLoggedIn(isLoggedIn);
        };

        fetchUserLoginState()
    }, []);

    const handleLogin = async () => {
        try {
            await model.logIn(email, password);
            setLoggedIn(true);
        } catch (error) {
            switch (error.code) {
                case "auth/invalid-email":
                    toast.error("Invalid email address");
                    break;
                case "auth/user-disabled":
                    toast.error("User account is disabled");
                    break;
                case "auth/user-not-found":
                    toast.error("User not found");
                    break;
                case "auth/wrong-password":
                    toast.error("Invalid password");
                    break;
                case "auth/missing-password":
                    toast.error("missing password")
                    break;
                default:
                    console.error(error);
                    break;
            }
        }
    };

    const handleLogout = async () => {
        try {
            await model.logout();
            setLoggedIn(false);
            setRegistrationSuccessful(false);
        } catch (error) {
            console.error(error)

        }
    };

    const handleRegistration = async () => {
        try {
            await model.Registration(email, password);
            await model.logIn(email, password);
            setRegistrationSuccessful(true);
            setLoggedIn(true); // Set the logged-in state to true
        } catch (error) {
            switch (error.code) {
                case "auth/invalid-email":
                    toast.error("Invalid email address");
                    break;
                case "auth/missing-email":
                    toast.error("Email address is required");
                    break;
                case "auth/weak-password":
                    toast.error("Password should be at least 6 characters long");
                    break;
                case "auth/missing-password":
                    toast.error("missing-password");
                    break;

                default:
                    console.error(error);
                    break;
            }
        }
    };

    const handleDatePress = async (dateInfo) => {
        console.log(dateInfo.date);
        setSelectedDate(dateInfo.date);
        setIsPopupVisible(true);
    };
    const navigateToMonthlyDetails = () => {
        navigation.navigate('MonthlyDetails', { currentMonth });
    };
    const navigateToYearlyDetails = () => {
        navigation.navigate('YearlyDetails', { currentMonth });
    };

    const renderGrid = () => {
        const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const currentDate = new Date(); // Get the current date

        return DAYS_OF_WEEK.map((day, index) => (
            <View style={styles.column} key={day}>
                <Text style={styles.dayLabel}>{day}</Text>
                {calendarData[index].map((dateInfo) => {
                    // Check if the date is the current date
                    const isCurrentDay =
                        dateInfo.day === currentDate.getDate() &&
                        dateInfo.date.getMonth() === currentDate.getMonth() &&
                        dateInfo.date.getFullYear() === currentDate.getFullYear();

                    return (
                        <TouchableOpacity style={[styles.gridCell, { width: 57, height: 57 }]} key={dateInfo.date}
                                          onPress={() => handleDatePress(dateInfo)}>
                            <Text
                                style={dateInfo.isCurrentMonth ?
                                    isCurrentDay ? styles.currentDay : styles.currentMonthDay
                                    : styles.lastMonthDay
                                }
                            >
                                {dateInfo.day}
                            </Text>
                        </TouchableOpacity>

                    );
                })}
            </View>
        ));
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.monthText}>{monthName}</Text>
                <TouchableOpacity onPress={() => navigateMonth(-1)}>
                    <Text style={styles.arrowText}>{'<'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateMonth(1)}>
                    <Text style={styles.arrowText}>{'>'}</Text>
                </TouchableOpacity>

                <Button title="Monthly-Details" onPress={navigateToMonthlyDetails} />
            </View>

            {isLoading ? <Text>Loading...</Text> : <View style={styles.gridContainer}>{renderGrid()}</View>}

            <View style={styles.container_button}>
                <View style={styles.buttonSpacing}>
                    <Button title="Yearly-Details" onPress={navigateToYearlyDetails} />
                </View>
                {!loggedIn ? (
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#aaaaaa"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#aaaaaa"
                        />
                        <View style={styles.buttonContainer}>
                            <Button title="Log In" onPress={handleLogin} color="#409EFF" />
                            {!registrationSuccessful && (
                                <Button
                                    title="Register"
                                    onPress={handleRegistration}
                                    color="#67C23A"
                                />
                            )}
                        </View>
                    </View>
                ) : (
                    <Button title="Log Out" onPress={handleLogout} color="#F56C6C" />
                )}

            </View>

            {isPopupVisible && (
                <Modal visible={isPopupVisible} onDismiss={() => setIsPopupVisible(false)}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>
                                Enter Payment and Customer details for{' '}
                                {selectedDate.toLocaleDateString('en-GB')}
                            </Text>
                            <TextInput
                                placeholder={"Payment"}

                                value={payment}
                                onChangeText={setPayment}
                                style={styles.textInput}
                            />
                            <TextInput
                                placeholder={"Customer"}
                                value={customer}
                                onChangeText={setCustomer}
                                style={styles.textInput}
                            />
                            <TextInput
                                placeholder={"notes"}
                                value={notes}
                                onChangeText={setNotes}
                                style={styles.textInput}
                            />
                            <View style={styles.buttonContainer}>
                            <Button
                                mode="contained"
                                onPress={async () => {
                                    setIsPopupVisible(false);
                                    const model = new Model();
                                    await model.addPayment(selectedDate, payment, customer, notes);
                                    setPayment('');
                                    setCustomer('');
                                    setNotes('');
                                }}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                title={'Submit'}>

                            </Button>
                            <Button
                                mode="text"
                                onPress={() => setIsPopupVisible(false)}
                                style={styles.button}
                                labelStyle={styles.buttonLabel}
                                title={'Close'}>

                            </Button>
                                </View>
                        </View>
                    </View>
                </Modal>
            )}



        </View>

    );
}

//const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const generateCalendarData = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    let calendarData = Array(7).fill().map(() => Array());

    // Find out what day of the week the month starts on
    const startDay = new Date(year, monthIndex, 1).getDay();
    // Calculate the number of days from the previous month that should be included
    const daysFromLastMonth = (startDay + 6) % 7; // This will ensure the week starts from Monday

    // Generate the calendar data for the days from the last month
    for (let day = daysFromLastMonth; day > 0; day--) {
        const date = new Date(year, monthIndex, -day + 1);
        const dayData = {
            day: date.getDate(),
            date: date,
            isCurrentMonth: false,
        };
        const dayOfWeek = (date.getDay() + 6) % 7; // 0 will be Monday, 1 will be Tuesday, etc.
        calendarData[dayOfWeek].push(dayData);
    }

    // Generate the calendar data for the current month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, monthIndex, day);
        const dayData = {
            day: day,
            date: date,
            isCurrentMonth: true,
        };
        const dayOfWeek = (date.getDay() + 6) % 7; // 0 will be Monday, 1 will be Tuesday, etc.
        calendarData[dayOfWeek].push(dayData);
    }


    return calendarData;
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    monthText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
    },
    arrowContainer: {
        paddingHorizontal: 200,
    },
    arrowText: {
        paddingHorizontal: 5,
        fontSize: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
        marginHorizontal: 0, // Added horizontal margin
        alignItems: 'center',
    },
    gridCell: {
        borderWidth: 1,
        borderColor: 'gray',
        width: '100%',  // take up the full width of the parent column
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayLabel: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    currentMonthDay: {
        color: 'black',
    },
    lastMonthDay: {
        color: 'lightgray',
    },
    currentDay: {
        color: 'white',
        backgroundColor: 'blue',
        borderRadius: 50,
        textAlign: 'center',
        width: 20,
        height: 20,
        lineHeight:20,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        width: '80%',
        maxWidth: 400,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 16,
    },
    textInput: {
        marginBottom: 16,
        width: '100%',
        backgroundColor: '#F6F6F6',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
    },
    button: {
        marginTop: 8,
        width: '100%',
    },
    buttonContent: {
        height: 48,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    container_button: {
        flex: 1,
        backgroundColor: '#F2F5F8',
    },
    formContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: '#D3DCE6',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#FFF',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 20,
    },
    calendarContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        padding: 20,
    },

    buttonSpacing: {
        marginBottom: 20, // Adjust the top margin as needed
    },

});




export default CalendarComponent;