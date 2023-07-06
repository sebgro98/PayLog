import React, {useCallback, useEffect, useState} from 'react';
import { View, Text } from 'react-native';
import Model from "./Model";

const MonthlyDetails = ({ route }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const { currentMonth } = route.params;
    const model = new Model();

    const fetchPayments = useCallback(async () => {
        console.log("Fetching payments...");
        try {
            const allPosts = await model.getAllPayments();
            console.log("Fetched payments successfully:", allPosts);
        } catch (error) {
            console.error("Error fetching payments:", error);
        }
    }, [model]);

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <View>
            <Text>Monthly Detail for {`${currentMonth.toLocaleString('default', {month: 'long'})} ${currentMonth.getFullYear()}`}</Text>
            {
                monthlyData.map((data, index) => (
                    <View key={index}>
                        <Text>Date: {new Date(data.date).toLocaleDateString()}</Text>
                        <Text>Payment: {data.payment}</Text>
                        <Text>Customer: {data.customer}</Text>
                    </View>
                ))
            }
        </View>
    );
};

export default MonthlyDetails;