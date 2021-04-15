// import { ajax } from 'src/ajax';
import adapter from '../src/AnalyticsAdapter.js';
import CONSTANTS from '../src/constants.json';
import adaptermanager from '../src/adapterManager.js';
import { logMessage } from '../src/utils.js';

// const analyticsType = 'endpoint';
// const url = 'http://test.com';

let adnuntiusAnalytics = Object.assign(adapter({}), {
  track({ eventType, args }) {
    switch (eventType) {
      case CONSTANTS.EVENTS.AUCTION_INIT:
<<<<<<< HEAD
        logMessage('ADN:aucion init', args);
        break;
      case CONSTANTS.EVENTS.BID_REQUESTED:
        logMessage('ADN: bid requested:', args);
        break;
      case CONSTANTS.EVENTS.BID_RESPONSE:
        logMessage('ADN: bid response:', args);
        break;
      case CONSTANTS.EVENTS.BIDDER_DONE:
        logMessage('ADN: bid done:', args.bids);
        break;
      case CONSTANTS.EVENTS.BID_WON:
        logMessage('ADN: Bid Won', args);
        break;
      case CONSTANTS.EVENTS.BID_TIMEOUT:
        logMessage('ADN: Bid timeout', args);
        break;
      case CONSTANTS.EVENTS.AUCTION_END:
        logMessage('ADN: auction end:', args);
=======
        logMessage('AA:', args);
        break;

      case CONSTANTS.EVENTS.BID_RESPONSE:
        logMessage('Bid Response:', args);
        break;

      case CONSTANTS.EVENTS.BID_WON:

        logMessage('Bid Won:', args);
        break;

      case CONSTANTS.EVENTS.AUCTION_END:
        logMessage('ENDED!:', args);
>>>>>>> c33ca66e109af0e12cfb2ec819d875bb1695baba
        break;
    }
  }
});

// save the base class function
adnuntiusAnalytics.originEnableAnalytics = adnuntiusAnalytics.enableAnalytics;

// override enableAnalytics so we can get access to the config passed in from the page
adnuntiusAnalytics.enableAnalytics = function (config) {
  //   const initOptions = config.options;
  logMessage('Ding: ', config)
  adnuntiusAnalytics.originEnableAnalytics(config); // call the base class function
};

adaptermanager.registerAnalyticsAdapter({
  adapter: adnuntiusAnalytics,
  code: 'adnuntius',
  gvlid: 1
});

export default adnuntiusAnalytics;
