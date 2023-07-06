import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Modal} from 'react-native';
import Model from "./Model.js"

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
            console.error(error);

        }
    };

    const handleLogout = async () => {
        try {
            await model.logout();
            setLoggedIn(false);
        } catch (error) {
            console.error(error);

        }
    };

    const handleRegistration = async () => {
        try {
            await model.Registration(email, password);
            setRegistrationSuccessful(true);
        } catch (error) {
            console.error(error);
            // here you could show an error message to the user
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

    const renderGrid = () => {
        const DAYS_OF_WEEK = ["Mon", "Tues", "Wedne", "Thurs", "Fri", "Satur", "Sun"];
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
                        <TouchableOpacity style={styles.gridCell} key={dateInfo.date}
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
                <Button title="Go to Monthly Details" onPress={navigateToMonthlyDetails} />
            </View>

            {isLoading ? <Text>Loading...</Text> : <View style={styles.gridContainer}>{renderGrid()}</View>}

            {!loggedIn ? (
                <View>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        placeholder="Password"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Button title="Log In" onPress={handleLogin}/>
                    {!registrationSuccessful && <Button title="Register" onPress={handleRegistration}/>}
                </View>
            ) : (
                <Button title="Log Out" onPress={handleLogout}/>
            )}

            {isPopupVisible && (
                <Modal animationType="slide" transparent={true} visible={isPopupVisible}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text>Enter Payment and Customer details</Text>
                            <TextInput
                                placeholder="Payment"
                                value={payment}
                                onChangeText={setPayment}
                            />
                            <TextInput
                                placeholder="Customer"
                                value={customer}
                                onChangeText={setCustomer}
                            />
                            <TextInput
                                placeholder="Notes"
                                value={notes}
                                onChangeText={setNotes}
                            />
                            <Button title="Submit" onPress={async () => {
                                setIsPopupVisible(false);
                                const model = new Model();
                                await model.addPayments(selectedDate, payment, customer, notes);
                                setPayment('');
                                setCustomer('');
                                setNotes('');
                            }}/>
                            <Button title="Close" onPress={() => setIsPopupVisible(false)}/>
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
// Function to handle date press








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
        shadowRadius: 4,
        elevation: 5
    },

});




export default CalendarComponent;
