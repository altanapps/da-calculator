const axios = require("axios");
require("dotenv").config();

import { defaultEstimateGas } from "./celestia";

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const COINMARKETCAP_CURRENCY_IDS = {
  NEAR: 6535,
  ETH: 1027,
  TIA: 22861,
};

const fetchPrice = async (currency_name) => {
  id = COINMARKETCAP_CURRENCY_IDS[currency_name];
  try {
    const url = `https://pro-api.coinmarketcap.com/v2/tools/price-conversion`;
    const params = {
      amount: 1,
      id: id,
    };
    const headers = {
      "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
    };

    const response = await axios.get(url, { params, headers });
    const price = response.data.data.quote["USD"].price;

    console.log(`1 ${currency_name} is equal to ${price}`);
    return price;
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

const fetchGasPrice = async (currency_name, blobSizes) => {
  // Get gas price
  // currency_name: ETH or NEAR
  // blobSizes: array of blob sizes or undefined if currency_name is ETH or NEAR
  try {
    let response, gasPrice;

    if (currency_name === "ETH") {
      // Get ETH gas price
      response = await axios.post(
        `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
        {
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 1,
        }
      );
      gasPrice = parseInt(response.data.result, 16);
      console.log(`Current ETH Gas Price: ${gasPrice} wei`);
    } else if (currency_name === "NEAR") {
      // Get NEAR gas price
      response = await axios.post(
        `https://near-mainnet.infura.io/v3/${INFURA_API_KEY}`,
        {
          jsonrpc: "2.0",
          id: 1,
          method: "gas_price",
          params: [null], // You can specify a block height here if needed
        }
      );
      gasPrice = response.data.result.gas_price;
      console.log(`Current NEAR Gas Price: ${gasPrice} yoctoNEAR`);
    } else if (currency_name === "TIA") {
      // Get TIA gas price
      if (blobSizes === undefined) {
        console.error("Blob sizes must be specified for TIA");
        return;
      }

      gas = defaultEstimateGas(blobSizes);
      return gas;
    } else {
      console.error("Unsupported currency");
      return;
    }

    return gasPrice;
  } catch (error) {
    console.error("Error fetching gas price:", error);
  }
};

// Example usage
currency_name = "ETH";
fetchPrice(currency_name);
fetchGasPrice(currency_name);
