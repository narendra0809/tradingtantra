export default {
  optionChainUrl: 'https://api.dhan.co/v2/optionchain',
  expiryListUrl: 'https://api.dhan.co/v2/optionchain/expirylist',
  accessToken: process.env.DHAN_ACCESS_TOKEN,
  clientId: process.env.DHAN_CLIENT_ID,
  underlyings: [
    { name: 'NIFTY', scrip: 13, seg: 'IDX_I', stepSize: 50 },
    { name: 'BANKNIFTY', scrip: 25, seg: 'IDX_I', stepSize: 100 },
    { name: 'FINNIFTY', scrip: 27, seg: 'IDX_I', stepSize: 50 },
    { name: 'MIDCPNIFTY', scrip: 442, seg: 'IDX_I', stepSize: 75 },
    { name: 'SENSEX', scrip: 51, seg: 'IDX_I', stepSize: 100 },
  ],
};