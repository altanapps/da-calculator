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
const NEAR_DA_FUNCTION_CALL_METHOD_NAME_BYTE_SIZE = 6;
const CALLDATA_GAS_PER_BYTE = 16;
const TRANSACTION_FEE = 21000;

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
throw error;  }
};

// Returns the estimated fee in the Ethereum blockchain
// Assumes no priority fee
async function estimateFeeETH(blobSizes) {
  // https://docs.infura.io/networks/ethereum/json-rpc-methods/eth_gasprice
  const gasPrice = (await fetchGasPrice("ETH")) / 10 ** 9; // convert from wei to gwei
  var totalGas = 0;
  // Iterate through each blob size
  for (blob of blobSizes) {
    totalGas += CALLDATA_GAS_PER_BYTE * blob + TRANSACTION_FEE;
  }

  // This is the total fee in gwei
  var totalFee = (totalGas / 2) * gasPrice;
  const ethPrice = await fetchPrice("ETH");

  // Convert from gwei to ETH
  totalFee = totalFee / 10 ** 9; // convert from wei to ETH

  // Convert from ETH to USD
  totalFee = totalFee * ethPrice;
  return totalFee;
}

async function estimateFeeTIA(blobSizes) {
  try {
    let fee = await estimateFee(blobSizes);
    // convert uTIA to TIA
    let tiaFee = fee / 10 ** 6;
    let price = await fetchPrice("TIA");
    let usdFee = tiaFee * price;
    return usdFee;
  } catch (error) {
    throw error;
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
    const gas_fee_rates = JSON.parse(await response.text()).result.runtime_config.transaction_costs;
    if (gas_fee_rates) {
      try {
        const startup_cost = gas_fee_rates.action_receipt_creation_config.send_sir + gas_fee_rates.action_receipt_creation_config.execution;
        const function_call_base_cost = gas_fee_rates.action_creation_config.function_call_cost.send_sir + gas_fee_rates.action_creation_config.function_call_cost.execution;
        var totalFee = 0;
        for (let blob of blobSizes) {
          totalFee += (blob + NEAR_DA_FUNCTION_CALL_METHOD_NAME_BYTE_SIZE) * gas_fee_rates.action_creation_config.function_call_cost_per_byte.send_sir + gas_fee_rates.action_creation_config.function_call_cost_per_byte.execution * (blob + NEAR_DA_FUNCTION_CALL_METHOD_NAME_BYTE_SIZE) + startup_cost + function_call_base_cost;
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
//Returns the estimated fee in the Ethereum blockchain
const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable if available
const host = "0.0.0.0"; // Listen on all network interfaces

app.use(express.json());

// Endpoint for fetching price
app.post("/estimateFee", async (req, res) => {
  try {
    const ethFee = await estimateFeeETH(req.body.blobSizes);
    const nearFee = await estimateFeeNEAR(req.body.blobSizes);
    const tiaFee = await estimateFeeTIA(req.body.blobSizes);

    const result = {
      ETH: ethFee,
      NEAR: nearFee,
      TIA: tiaFee,
    };

    res.json(result);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

const rateLimit = require("express-rate-limit");
// Set up rate limiter: maximum of 100 requests per minute
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMS
  message: "Too many requests from this IP, please try again later",
});

// Apply to all requests
app.use(limiter);

app.listen(port, () => {
  console.log(`Example app listening at http://${host}:${port}`);
});

