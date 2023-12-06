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

function estimateGas(blobSizes, gasPerByte, txSizeCost) {
  return (
    gasToConsume(blobSizes, gasPerByte) +
    txSizeCost * BYTES_PER_BLOB_INFO * blobSizes.length +
    PFB_GAS_FIXED_COST
  );
}
