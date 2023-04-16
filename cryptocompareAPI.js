const axios = require('axios');
const apiUrl = 'https://min-api.cryptocompare.com/data/price';

const usdRate = async (token) => {
    const responses = await axios.get(`${apiUrl}?fsym=${token}&tsyms=USD`);
    return responses.data
};

module.exports = {
    usdRate
}