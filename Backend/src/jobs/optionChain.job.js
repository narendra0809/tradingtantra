import cron from 'node-cron';
import { fetchAndSaveAllUnderlyings } from '../services/optionChain.service.js';

class OptionChainJob {
  constructor() {
    this.task = null;
  }

  start() {
    if (this.task) return;

    this.task = cron.schedule('*/3 9-15 * * 1-5', async () => {
      try {
        console.log('Running option chain data fetch...');
        await fetchAndSaveAllUnderlyings();
      } catch (error) {
        console.error('Error in option chain job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    });

    console.log('Option chain job started');
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('Option chain job stopped');
    }
  }
}

export default new OptionChainJob();