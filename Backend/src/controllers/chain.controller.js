import { convertToIST } from '../utils/dateUtils.js';
import { fetchAndSaveAllUnderlyings } from '../services/optionChain.service.js';

export const getOptionChainData = async (req, res) => {
  try {
    const result = await fetchAndSaveAllUnderlyings();
    res.json({
      success: true,
      message: 'Option chain data fetched successfully',
      data: result,
      timestamp: convertToIST(Date.now())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching option chain data',
      error: error.message
    });
  }
};