import WebSocket from "ws";
import axios from "axios";
import fs from "fs";

async function main() {
  try {
    // 👇 Change this value to test different strike prices (e.g. 70000, 90000)
    const TARGET_STRIKE = 66500;
    
    // 1. Get an active BTC option instrument
    const res = await axios.get("https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&kind=option");
    
    // Pick the first active call option that matches our target strike
    const instrument = res.data.result.find(i => i.is_active && i.option_type === "call" && i.strike === TARGET_STRIKE);
    
    if (!instrument) {
      console.error(`❌ Could not find an active call option with strike price ${TARGET_STRIKE}. Try a different value.`);
      process.exit(1);
    }
    
    const instrumentName = instrument.instrument_name;

    console.log(`Subscribing to active instrument: ${instrumentName}`);

    // 2. Connect WebSocket
    const ws = new WebSocket("wss://www.deribit.com/ws/api/v2");
    
    ws.on("open", () => {
      const subscribeMsg = {
        jsonrpc: "2.0",
        method: "public/subscribe",
        params: {
          channels: [`ticker.${instrumentName}.100ms`]
        },
        id: 1
      };
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on("message", (data) => {
      const response = JSON.parse(data);
      if (response.method === "subscription") {
        fs.writeFileSync("deribit_output.json", JSON.stringify(response, null, 2));
        console.log("Got ticker data! Saved to deribit_output.json");
        process.exit(0);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket Error:", error);
      process.exit(1);
    });

    setTimeout(() => {
      console.log("Timeout reached, exiting...");
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();