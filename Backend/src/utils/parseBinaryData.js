import { Buffer } from "buffer";

function parseBinaryData(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid data format, expected a Buffer.");
  }



  console.log("Received buffer length:", buffer.length);

  if (buffer.length < 162) {
    throw new Error("Buffer too small, expected at least 162 bytes.");
  }

  return {
    responseCode: buffer.readUInt8(0),
    messageLength: buffer.readUInt16LE(1), 
    exchangeSegment: buffer.readUInt8(3), 
    securityId: buffer.readInt32LE(4), //

    latestTradedPrice: buffer.readFloatLE(8),
    lastTradedQty: buffer.readInt16LE(12),
    lastTradeTime: buffer.readUInt32LE(14),
    avgTradePrice: buffer.readFloatLE(18),
    volume: buffer.readUInt32LE(22),
    totalSellQty: buffer.readUInt32LE(26),
    totalBuyQty: buffer.readUInt32LE(30),
    openInterest: buffer.readUInt32LE(34),
    highestOpenInterest: buffer.readUInt32LE(38),
    lowestOpenInterest: buffer.readUInt32LE(42),
    dayOpen: buffer.readFloatLE(46),
    dayClose: buffer.readFloatLE(50),
    dayHigh: buffer.readFloatLE(54),
    dayLow: buffer.readFloatLE(58),

  
  };
}

export default parseBinaryData;
