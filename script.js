document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value);
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value);
    const operationalCharges = parseFloat(document.getElementById('operationalCharges').value);
    const lifespan = parseInt(document.getElementById('lifespan').value);
    const discountRate = parseFloat(document.getElementById('discountRate').value) / 100;

    const cashFlows = calculateCashFlows(initialInvestment, expectedReturn, operationalCharges, lifespan);
    const npv = calculateNPV(cashFlows, discountRate);
    const paybackPeriod = calculatePaybackPeriod(cashFlows);
    const irr = calculateIRR(cashFlows);
    const uncertainty = calculateUncertainty(cashFlows);

    displayResults(npv, paybackPeriod, irr, uncertainty);
});

function calculateCashFlows(investment, expectedReturn, operationalCharges, lifespan) {
    const cashFlows = [-investment]; // Initial investment as a negative cash flow
    for (let i = 1; i <= lifespan; i++) {
        const cashFlow = expectedReturn - operationalCharges;
        cashFlows.push(cashFlow);
    }
    return cashFlows;
}

function calculateNPV(cashFlows, discountRate) {
    return cashFlows.reduce((acc, flow, t) => acc + flow / Math.pow(1 + discountRate, t), 0);
}

function calculatePaybackPeriod(cashFlows) {
    let cumulativeCashFlow = 0;
    for (let year = 0; year < cashFlows.length; year++) {
        cumulativeCashFlow += cashFlows[year];
        if (cumulativeCashFlow >= 0) {
            return year;
        }
    }
    return null; // If payback period is not reached
}

function calculateIRR(cashFlows) {
    let irr = 0.1; // Initial guess
    const iterations = 1000;
    const tolerance = 1e-6;

    for (let i = 0; i < iterations; i++) {
        const npv = calculateNPV(cashFlows, irr);
        if (Math.abs(npv) < tolerance) break;

        const derivative = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + irr, t) * -t, 0);
        irr -= npv / derivative; // Newton-Raphson method
    }
    return irr * 100; // Return as percentage
}

function calculateUncertainty(cashFlows) {
    const averageReturn = cashFlows.slice(1).reduce((a, b) => a + b, 0) / (cashFlows.length - 1);
    const deviations = cashFlows.slice(1).map(cf => Math.pow(cf - averageReturn, 2));
    const variance = deviations.reduce((a, b) => a + b) / (cashFlows.length - 2);
    return Math.sqrt(variance); // Standard deviation
}

function displayResults(npv, paybackPeriod, irr, uncertainty) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Results</h2>
        <p><strong>NPV:</strong> $${npv.toFixed(2)}</p>
        <p><strong>Payback Period:</strong> ${paybackPeriod !== null ? paybackPeriod + ' years' : 'Not reached'}</p>
        <p><strong>IRR:</strong> ${irr.toFixed(2)}%</p>
        <p><strong>Uncertainty (Standard Deviation):</strong> $${uncertainty.toFixed(2)}</p>
    `;
}
