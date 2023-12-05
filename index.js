const axios = require("axios");
require("dotenv").config();

const INFURA_API_KEY = process.env.INFURA_API_KEY;

const getGasPrice = async () => {
  try {
    // Get ETH gas price
    const ethResponse = await axios.post(
      `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      {
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1,
      }
    );
    const ethGasPrice = parseInt(ethResponse.data.result, 16);
    console.log(`Current ETH Gas Price: ${ethGasPrice} wei`);

    // Get NEAR gas price
    const nearResponse = await axios.post(
      `https://near-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "gas_price",
        params: [null], // You can specify a block height here if needed
      }
    );

    const nearGasPrice = nearResponse.data.result.gas_price;
    console.log(`Current NEAR Gas Price: ${nearGasPrice} yoctoNEAR`);
  } catch (error) {
    console.error("Error fetching gas price:", error);
  }
};

getGasPrice();
