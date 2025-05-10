import { Buffer } from "buffer";
import moment from "moment-timezone";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: "app.log" })],
});

function parseBinaryData(buffer) {
  try {
    // Validate buffer type
    if (!Buffer.isBuffer(buffer)) {
      logger.error("Invalid data format: Expected a Buffer");
      throw new Error("Invalid data format, expected a Buffer.");
    }

    // Read initial fields to determine message structure
    const responseCode = buffer.readUInt8(0);
    const messageLength = buffer.readUInt16LE(1);

    // Validate responseCode (assuming valid codes are 0-255, adjust as per protocol)
    if (responseCode === undefined || responseCode < 0 || responseCode > 255) {
      logger.error(`Invalid responseCode: ${responseCode}`);
      throw new Error(`Invalid responseCode: ${responseCode}`);
    }

    // Validate messageLength and buffer size
    if (messageLength < 62) {
      logger.error(`Message length too small: ${messageLength} bytes, expected at least 62 bytes`);
      throw new Error(`Message length too small: ${messageLength} bytes, expected at least 62 bytes.`);
    }

    if (buffer.length < messageLength) {
      logger.error(`Buffer too small: ${buffer.length} bytes, expected ${messageLength} bytes`);
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
      logger.warn(`Invalid securityId: ${parsedData.securityId}`);
      throw new Error(`Invalid securityId: ${parsedData.securityId}`);
    }

    if (parsedData.latestTradedPrice < 0 || isNaN(parsedData.latestTradedPrice)) {
      logger.warn(`Invalid latestTradedPrice: ${parsedData.latestTradedPrice}`);
      throw new Error(`Invalid latestTradedPrice: ${parsedData.latestTradedPrice}`);
    }

    if (parsedData.volume < 0 || isNaN(parsedData.volume)) {
      logger.warn(`Invalid volume: ${parsedData.volume}`);
      throw new Error(`Invalid volume: ${parsedData.volume}`);
    }

   

    // Log successful parsing
    logger.info(`Successfully parsed data for securityId: ${parsedData.securityId}`);

    return parsedData;
  } catch (error) {
    logger.error(`Error parsing binary data: ${error.message}`, {
      bufferLength: buffer?.length,
      errorStack: error.stack,
    });
    throw error; // Re-throw to allow caller to handle
  }
}

export default parseBinaryData;