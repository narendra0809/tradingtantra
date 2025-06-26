import { Buffer } from "buffer";


function parseBinaryData(buffer) {
  try {
    // Validate buffer type
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Invalid data format, expected a Buffer.");
    }

    // Read initial fields to determine message structure
    const responseCode = buffer.readUInt8(0);
    const messageLength = buffer.readUInt16LE(1);

    // Validate responseCode (assuming valid codes are 0-255, adjust as per protocol)
    if (responseCode === undefined || responseCode < 0 || responseCode > 255) {
      throw new Error(`Invalid responseCode: ${responseCode}`);
    }

    // Validate messageLength and buffer size
    if (messageLength < 62) {
      throw new Error(`Message length too small: ${messageLength} bytes, expected at least 62 bytes.`);
    }

    if (buffer.length < messageLength) {
      throw new Error(`Buffer too small: ${buffer.length} bytes, expected ${messageLength} bytes.`);
    }

    // Read core fields
    const parsedData = {
      securityId: buffer.readInt32LE(4),
      latestTradedPrice: buffer.readFloatLE(8),
      avgTradePrice: buffer.readFloatLE(18),
      volume: buffer.readUInt32LE(22),
      dayOpen: buffer.readFloatLE(46),
      dayClose: buffer.readFloatLE(50),
      dayHigh: buffer.readFloatLE(54),
      dayLow: buffer.readFloatLE(58),
    };

    // Validate critical fields
    if (parsedData.securityId <= 0) {
      throw new Error(`Invalid securityId: ${parsedData.securityId}`);
    }

    if (parsedData.latestTradedPrice < 0 || isNaN(parsedData.latestTradedPrice)) {
      throw new Error(`Invalid latestTradedPrice: ${parsedData.latestTradedPrice}`);
    }

    if (parsedData.volume < 0 || isNaN(parsedData.volume)) {
      throw new Error(`Invalid volume: ${parsedData.volume}`);
    }

   


    return parsedData;
  } catch (error) {
   
    throw error; // Re-throw to allow caller to handle
  }
}

export default parseBinaryData;