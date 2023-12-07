const axios = require("axios");
const express = require("express");
require("dotenv").config();

const {
  estimateFee,
  DEFAULT_ESTIMATE_GAS_PER_BLOB_BYTE,
  DEFAULT_TX_SIZE_COST_PER_BYTE,
} = require("./celestia");
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

const CALLDATA_GAS_PER_BYTE = 16;

const COINMARKETCAP_CURRENCY_IDS = {
  NEAR: 6535,
  ETH: 1027,
  TIA: 22861,
};

// Fetches the price of a currency in USD
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

    return price;
  } catch (error) {
    console.error("Error occurred:", error);
  }
};

// Fetches the gas price of a given blockchain
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
    } else if (currency_name === "NEAR") {
      // Fetching NEAR Gas per byte
      try {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "EXPERIMENTAL_protocol_config",
            params: { finality: "final" },
            id: 1,
            jsonrpc: "2.0",
          }),
          redirect: "follow",
        };

        const response = await fetch(
          "https://docs-demo.near-mainnet.quiknode.pro/",
          requestOptions
        );
        const result = await response.json();
        gasPrice = result.result.min_gas_price;
      } catch (error) {}
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

// Returns the estimated fee in the Ethereum blockchain
// Assumes no priority fee
async function estimateFeeETH(blobSizes) {
  const gasPrice = await fetchGasPrice("ETH");
  const ethPrice = await fetchPrice("ETH");
  var totalFee = 0;

  // Iterate through each blob size
  for (blob of blobSizes) {
    totalFee += blob * CALLDATA_GAS_PER_BYTE * gasPrice;
  }

  // Convert wei to ETH
  totalFee = (totalFee / 10 ** 18) * ethPrice;
  return totalFee;
}

async function estimateFeeTIA(blobSizes) {
  try {
    let fee = await estimateFee([16000000]);
    // convert uTIA to TIA
    let tiaFee = fee / 10 ** 6;
    let price = await fetchPrice("TIA");
    let usdFee = tiaFee * price;
    return usdFee;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function estimateFeeNEAR(blobSizes) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      method: "EXPERIMENTAL_protocol_config",
      params: {
        finality: "final",
      },
      id: 1,
      jsonrpc: "2.0",
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    // Fetching gas price and USD price asynchronously
    var gasPrice = await fetchGasPrice("NEAR");
    var usdPrice = await fetchPrice("NEAR");

    // Fetching protocol config
    const response = await fetch(
      "https://docs-demo.near-mainnet.quiknode.pro/",
      requestOptions
    );
    const result = await response.text();
    const regex = /"function_call_cost_per_byte":\{.*?\}/;
    const match = result.match(regex);

    if (match) {
      const jsonPart = match[0];

      try {
        // Parse the extracted JSON string
        const jsonObject = JSON.parse(`{${jsonPart}}`);

        // Accessing the data
        const functionCallCostPerByte =
          jsonObject.function_call_cost_per_byte.send_not_sir;

        var totalFee = 0;
        for (let blob of blobSizes) {
          totalFee += blob * functionCallCostPerByte;
        }
        totalFee = totalFee * gasPrice;

        // convert yoctoNEAR to NEAR
        totalFee = totalFee / 10 ** 24;

        // convert NEAR to USD
        const usdFee = totalFee * usdPrice;
        return usdFee;
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    } else {
      console.log("No match found or unable to capture JSON data");
    }
  } catch (error) {
    console.error("Error in estimateFeeNEAR:", error);
    return null;
  }
}
