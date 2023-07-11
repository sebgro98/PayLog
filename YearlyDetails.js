import React, { useEffect, useState } from 'react';
import Model from './Model';

const model = new Model();

const YearlyDetails = ({ route }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [afterTaxIncome, setAfterTaxIncome] = useState(0);
    const [payVat, setPayVat] = useState(0);
    const [vatTotal, setVatTotal] = useState(0);
    const [expenses, setExpenses] = useState(0);

    const { currentMonth } = route.params;

    useEffect(() => {
        const fetchYearlyDetails = async () => {
            const amount = await model.getPaymentsYear(currentMonth);

            let total = 0;
            amount.forEach((payment) => {
                total += Number(payment.paymentVat);
            });
            setTotalIncome(total);

            let payVat = 0;
            amount.forEach((payment) => {
                payVat += Number(payment.payment);
            });
            setPayVat(payVat);

            let totalVat = 0;
            amount.forEach((payment) => {
                totalVat += Number(payment.vat);
            });
            setVatTotal(totalVat);

            let totalExpenses = 0;
            amount.forEach((payment) => {
                totalExpenses += Number(payment.expenses);
                console.log("expenses", payment.expenses);
            });
            setExpenses(totalExpenses);



            setIsLoading(false);
        };

        fetchYearlyDetails();
    }, []);

    useEffect(() => {
        // Schablonavdrag på 25% om inkomsten är positiv
        let deductedIncome = totalIncome >= 0 ? totalIncome * 0.25 : 0;

        // Beräkna överskottskapital
        let surplusCapital = totalIncome - deductedIncome;

        // Grundavdrag beroende på överskottskapital
        let basicDeduction = 0;
        if (surplusCapital > 22500 && surplusCapital < 65500) {
            basicDeduction = 25000;
        } else if (surplusCapital >= 65500 && surplusCapital <= 75500) {
            basicDeduction = 27000;
        } else if (surplusCapital >= 65501 && surplusCapital <= 75500) {
            basicDeduction = 27000;
        } else if (surplusCapital >= 75501 && surplusCapital <= 85500) {
            basicDeduction = 27000;
        } else if (surplusCapital >= 85501 && surplusCapital <= 95500) {
            basicDeduction = 27000;
        } else if (surplusCapital >= 95501 && surplusCapital <= 105000) {
            basicDeduction = 29000;
        } else if (surplusCapital >= 105001 && surplusCapital <= 115000) {
            basicDeduction = 33000;
        } else if (surplusCapital >= 115001 && surplusCapital <= 125000) {
            basicDeduction = 36000;
        } else if (surplusCapital >= 125001 && surplusCapital <= 135000) {
            basicDeduction = 36000;
        } else if (surplusCapital >= 135001 && surplusCapital <= 145000) {
            basicDeduction = 39500;
        } else if (surplusCapital >= 145001 && surplusCapital <= 167000) {
            basicDeduction = 400000;
        } else if (surplusCapital >= 167001 && surplusCapital <= 189600) {
            basicDeduction = 37800;
        }

        let employmentTaxCredit = (surplusCapital - basicDeduction) * 0.095;

        // Beräkna skatt och egenavgifter baserat på grundavdrag
        let tax = (surplusCapital - basicDeduction) * 0.29855;
        let socialSecurityFee = surplusCapital * 0.2987;

        // Avdrag på egenavgifter om överskottskapital är över 40000
        if (surplusCapital > 40000) {
            let socialSecurityReduction = surplusCapital * 0.0075;
            socialSecurityFee -= Math.min(socialSecurityReduction, 15000);
        }

        // calculate income after taxes
        let salaryAfterTax = totalIncome - tax - socialSecurityFee + employmentTaxCredit;

        // update data
        setTaxes(tax + socialSecurityFee);
        setAfterTaxIncome(salaryAfterTax);
    }, [totalIncome]);

    if (isLoading) {
        return <div>Loading...</div>; // Render the loading screen while waiting for results
    }

    return (
        <div style={styles.container}>
            <p style={styles.heading}>Yearly Details</p>
            <div style={styles.detailsContainer}>
                <div style={styles.detail}>
                    <p style={styles.label}>Total income incl. sales tax</p>
                    <p style={styles.value}>{Math.round(totalIncome)}kr</p>
                </div>
                <div style={styles.detail}>
                    <p style={styles.label}>Total income excl. sales tax</p>
                    <p style={styles.value}>{Math.round(payVat)}kr</p>
                </div>
                <div style={styles.detail}>
                    <p style={styles.label}>Taxes to be paid</p>
                    <p style={styles.value}>{Math.round(taxes)}kr</p>
                </div>
                <div style={styles.detail}>
                    <p style={styles.label}>Total income after taxes</p>
                    <p style={styles.value}>{Math.round(afterTaxIncome)}kr</p>
                </div>
                <div style={styles.detail}>
                    <p style={styles.label}>Total Vat</p>
                    <p style={styles.value}>{Math.round(vatTotal)}kr</p>
                </div>
                <div style={styles.detail}>
                    <p style={styles.label}>Total expenses</p>
                    <p style={styles.value}>{Math.round(expenses)}kr</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    detailsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridGap: 20,
    },
    detail: {
        backgroundColor: '#F6F6F6',
        padding: 10,
        borderRadius: 8,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
    },
};

export default YearlyDetails;
