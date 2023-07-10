import React, { useEffect, useState} from 'react';
import Model from "./Model";
const model = new Model();

const YearlyDetails = ({route}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [taxes, setTaxes] = useState(0);
    const [afterTaxIncome, setAfterTaxIncome] = useState(0);
    const [payVat, setPayVat] = useState(0);
    const [vatTotal, setVatTotal] = useState(0);
    const [expenses, setExpenses] = useState(0);

    const {currentMonth} = route.params;
    useEffect(() => {
        const fetchYearlyDetails = async () => {

            const amount = await model.getPaymentsYear(currentMonth);

            let total = 0;
            amount.forEach(payment => {
                console.log("Payment:", payment.paymentVat);
                total += Number(payment.paymentVat);
            });
            setTotalIncome(total);

            let payVat = 0;
            amount.forEach(payment => {
                console.log("Payment:", payment.payment);
                payVat += Number(payment.payment);
            });
            setPayVat(payVat);

            let totalVat = 0;
            amount.forEach(payment => {
                console.log("Payment:", payment.vat);
                totalVat += Number(payment.vat);
            });
            setVatTotal(totalVat);

            let totalExpenses = 0;
            amount.forEach(payment => {
                console.log("totalExpenses:", payment.expenses);
                totalVat += Number(payment.expenses);
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
        }
        else if (surplusCapital >= 65501 && surplusCapital <= 75500) {
            basicDeduction = 27000;
        }
        else if (surplusCapital >= 75501 && surplusCapital <= 85500) {
            basicDeduction = 27000;
        }
        else if (surplusCapital >= 85501 && surplusCapital <= 95500) {
            basicDeduction = 27000;
        }
        else if (surplusCapital >= 95501 && surplusCapital <= 105000) {
            basicDeduction = 29000;
        }
        else if (surplusCapital >= 105001 && surplusCapital <= 115000) {
            basicDeduction = 33000;
        }
        else if (surplusCapital >= 115001 && surplusCapital <= 125000) {
            basicDeduction = 36000;
        }
        else if (surplusCapital >= 125001 && surplusCapital <= 135000) {
            basicDeduction = 36000;
        }
        else if (surplusCapital >= 135001 && surplusCapital <= 145000) {
            basicDeduction = 39500;
        }
        else if (surplusCapital >= 145001 && surplusCapital <= 167000) {
            basicDeduction = 400000;
        }
        else if (surplusCapital >= 167001 && surplusCapital <= 189600) {
            basicDeduction = 37800;
        }
        let employmentTaxCredit = (surplusCapital - basicDeduction) * 0.095
        console.log("surplusCapital", surplusCapital - basicDeduction)
        console.log("employmentTaxCredit", employmentTaxCredit)
        // Beräkna skatt och egenavgifter baserat på grundavdrag
        let tax = (surplusCapital - basicDeduction) * 0.29855;
        let socialSecurityFee = surplusCapital * 0.2987;

        // Avdrag på egenavgifter om överskottskapital är över 40000
        if (surplusCapital > 40000) {
            let socialSecurityReduction = (surplusCapital) * 0.0075;
            socialSecurityFee -= Math.min(socialSecurityReduction, 15000);
        }



        console.log("total",totalIncome)
        console.log("deductedIncome",deductedIncome)
        console.log("tax",tax)
        console.log("socialSecurityFee",socialSecurityFee)
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
        <div>
            <p> Total income incl. sales tax {Math.round(totalIncome)}</p>
            <p>Total income excl. sales tax: {Math.round(payVat)}</p>
            <p>Taxes to be paid: {Math.round(taxes)}</p>
            <p>Total income after taxes: {Math.round(afterTaxIncome)}</p>
            <p>Total Vat: {Math.round(vatTotal)}</p>
            <p>Total expenses: {Math.round(expenses)}</p>
        </div>
    );
}

export default YearlyDetails;