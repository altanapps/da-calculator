// Assume 29 bytes for namespace
// https://github.com/celestiaorg/celestia-app/blob/main/pkg/appconsts/global_consts.go#L64
const NAMESPACE_SIZE = 29;
const SHARE_SIZE = 512;
const SHARE_INFO_BYTES = 1;
const SEQUENCE_LEN_BYTES = 4;
const BYTES_PER_BLOB_INFO = 70;
const PFB_GAS_FIXED_COST = 75000;
const DEFAULT_TX_SIZE_COST_PER_BYTE = 10;

const DEFAULT_ESTIMATE_GAS_PER_BLOB_BYTE = 8;

const FIRST_SPARSE_SHARE_CONTENT_SIZE =
  SHARE_SIZE - NAMESPACE_SIZE - SHARE_INFO_BYTES - SEQUENCE_LEN_BYTES;

const CONTINUATION_SPARSE_SHARE_CONTENT_SIZE =
  SHARE_SIZE - NAMESPACE_SIZE - SHARE_INFO_BYTES;

const CELESTIA_MAINNET = "https://explorer.modular.cloud/celestia-mainnet";
const SELECTOR =
  "#main-content > div > section:nth-child(2) > div > div > div.grid.grid-cols-2.tab:grid-cols-4.lg:grid-cols-5.[grid-template-areas:var(--grid-area-mobile)].tab:[grid-template-areas:var(--grid-area-tab)].lg:[grid-template-areas:var(--grid-area-lg)].auto-rows-[153px].tab:auto-rows-[146.5px].auto-cols-[145px].w-full.gap-8.tab:gap-10.font-medium.max-w-full.accent-primary > div.border-mid-dark-100.w-full.rounded-lg.border.shadow-sm.bg-white.p-4.flex.flex-col.items-start.gap-[1.125rem].md:gap-5.min-h-36.h-full.[grid-area:GP] > div.flex.flex-col.gap-2.items-start > p.text-base.tab:text-lg";

// const XPATH = "/html/body/main/div/section[2]/div/div/div[2]/div[7]/div[2]";

const axios = require("axios");
const cheerio = require("cheerio");

function sparseSharesNeeded(sequenceLen) {
  if (sequenceLen == 0) {
    return 0;
  }

  if (sequenceLen < FIRST_SPARSE_SHARE_CONTENT_SIZE) {
    return 1;
  }

  let bytesAvailable = FIRST_SPARSE_SHARE_CONTENT_SIZE;
  let sharesNeeded = 1;

  while (bytesAvailable < sequenceLen) {
    bytesAvailable += CONTINUATION_SPARSE_SHARE_CONTENT_SIZE;
    sharesNeeded++;
  }
  return sharesNeeded;
}

// https://github.com/celestiaorg/celestia-app/blob/4e966f981e4cf49bd450eb73981532d20651eb6b/x/blob/types/payforblob.go#L157
function gasToConsume(blobSizes, gasPerByte) {
  let totalSharesUsed = 0;
  for (const blobSize of blobSizes) {
    totalSharesUsed += sparseSharesNeeded(blobSize);
  }
  return totalSharesUsed * gasPerByte * SHARE_SIZE;
}

function defaultEstimateGas(blobSizes) {
  return estimateGas(blobSizes, 1, 0);
}

function estimateGasLimit(blobSizes, gasPerByte, txSizeCost) {
  return (
    gasToConsume(blobSizes, gasPerByte) +
    txSizeCost * BYTES_PER_BLOB_INFO * blobSizes.length +
    PFB_GAS_FIXED_COST
  );
}

function estimateGasFee() {
  axios
    .get("https://explorer.modular.cloud/celestia-mainnet")
    .then((response) => {
      const html = response.data;
      console.log(html);

      // Regular expression to capture the value after specific <p> tags
      const regex =
        /<p class="text-muted uppercase text-xxs tab:text-xs">GAS PRICE<\/p><p class="text-base tab:text-lg">([0-9.]+)<\/p>/;
      const match = regex.exec(html);

      if (match && match[1]) {
        console.log(match[1]); // This should be your desired value
        return match[1];
      } else {
        console.log("No match found");
      }
    });
}
