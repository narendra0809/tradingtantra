import { Buffer } from "buffer";


function parseBinaryData(buffer) {
  try {
    // Validate buffer type
    if (!Buffer.isBuffer(buffer)) {
      throw new Error("Invalid data format, expected a Buffer.");
    }

    // DEBUG: Log raw buffer info for diagnosis
    console.log("📥 Buffer info - Length:", buffer.length, "bytes, First 20 bytes:", buffer.slice(0, 20).toString('hex'));

    // Read initial fields to determine message structure
    const responseCode = buffer.readUInt8(0);
    const messageLength = buffer.readUInt16LE(1);

    console.log("📥 Parsing - ResponseCode:", responseCode, ", MessageLength:", messageLength);

    // DEBUG: Handle different message types from Dhan API
    // ResponseCode 1 = Heartbeat/ping, ResponseCode 2 = Ack, ResponseCode 3+ = Market data
    if (responseCode === 1) {
      console.log("💓 Received heartbeat message");
      return { isHeartbeat: true };
    }
    if (responseCode === 2) {
      console.log("✅ Received acknowledgment message");
      return { isAcknowledgment: true, length: buffer.length };
    }
    if (buffer.length < 62) {
      console.warn("⚠️ Short message received:", buffer.length, "bytes -可能是其他消息类型");
      // Don't throw, just return null for short messages
      return { isShortMessage: true, length: buffer.length, data: buffer.toString('hex') };
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
    // Log the error but don't crash - return null for graceful handling
    console.error("❌ Error parsing binary data:", error.message);
    return null;
  }
}

export default parseBinaryData;