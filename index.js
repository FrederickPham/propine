const fs = require('fs');
const csv = require('fast-csv');
const path = require('path');
const { transactionType } = require('./constants');
const cryptocompareAPI = require('./cryptocompareAPI')
const filePath = path.join(__dirname, '/data/transactions.csv')

/**
 * @name transactions.csv
 * @param {timestamp, transaction_type, token, amount}
 */


const rowProcess = (tokens, row) => {
    if (!tokens[row.token]) tokens[row.token] = 0;
    if (row.transaction_type === transactionType.deposit) {
        tokens[row.token] += Number(row.amount)
    } else {
        tokens[row.token] -= Number(row.amount)
    }
}

const getDataFromCsv = async (filePath) => {
    const result = await new Promise((resovle, reject) => {
        const tokens = {};
        const csvStream = csv.parse({ headers: true })
            .on('data', (row) => {
                rowProcess(tokens, row)
            })
            .on('end', () => {
                console.log('Finished processing CSV file', tokens);
                resovle(tokens);
            })
            .on('error', (err) => {
                reject(err)
            })
        fs.createReadStream(filePath).pipe(csvStream);
    });

    return result;
}


const mapValueToUSD = async () => {
    const result = [];
    try {
        const tokens = await getDataFromCsv(filePath);
        for (const name in tokens) {
            const rate = await cryptocompareAPI.usdRate(name);
            result.push({
                token: name,
                amount: tokens[name],
                usd: rate.USD,
                totalUSD: tokens[name] * rate.USD
            })
        }
        return result;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    } finally {
        console.log({ result })
    }
};

mapValueToUSD()