const express = require("express");
const router = express.Router();
const { ethers } = require("ethers");
const AppError = require("../utils/error");
const { asyncHandler } = require("../utils/asyncHandler");

const convertNumFromOneBaseToAnother = asyncHandler(async (req, res, next) => {
  try {
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const RPC_URL = process.env.RPC_URL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    const ABI = [
      "function processConversion(address walletToCharge, string inputNumber, uint8 inputBase, uint8 outputBase) public pure returns (address, string, uint8, uint8, string, string)",
    ];

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const converterContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      wallet
    );

    const { walletToCharge, inputNumber, inputBase, outputBase } = req.body;

    if (!walletToCharge || !inputNumber || !inputBase || !outputBase) {
      return next(
        new AppError(
          "Missing walletToCharge/inputNumber/inputBase/outputBase!",
          400
        )
      );
    }
    // Call processConversion
    const result = await converterContract.processConversion(
      walletToCharge,
      inputNumber,
      inputBase,
      outputBase
    );

    console.log("result: ", result);

    res.status(200).json({
      status: "success",
      data: {
        walletToCharge: result[0],
        inputNumber: result[1],
        // inputBase: result[2],
        // outputBase: result[3],
        inputBase: inputBase,
        outputBase: outputBase,
        outputNumber: result[4],
        outputHexadecimal: result[5],
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return next(new AppError(error.message, 500));
  }
});

router.post("/rootstock-o-level-math", convertNumFromOneBaseToAnother);

module.exports = router;
