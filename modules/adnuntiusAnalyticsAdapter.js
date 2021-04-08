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
        logMessage('AA:', args);
        break;

      case CONSTANTS.EVENTS.AUCTION_END:
        logMessage('ENDED!:', args);
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
