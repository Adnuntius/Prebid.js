// import { getGlobal } from '../src/prebidGlobal.js';
import { submodule } from '../src/hook.js'
import { logError, logMessage } from '../src/utils.js'
import { ajax } from '../src/ajax.js';

const tzo = new Date().getTimezoneOffset();
const ADN_USER_ID = JSON.parse(window.localStorage.getItem('adn.data')).browserId

function init(config, userConsent) {
  return true;
}

const providers = {
  adnuntius: {
    url: params => {
      return 'https://data.adnuntius.com/usr?tzo=' + tzo + '&browserId=' + ADN_USER_ID + '&folderId=' + params.folderId
    },
    function: res => {
      logMessage('ADN: adn-return', res)
      return res
    },
  },
  novatiq: {
    url: params => 'https://novatiq.consumor.io/segments/v1/novademo/45340f6d-d9ee-4ee9-b785-36f3e30ff1599999',
    function: res => {
      logMessage('ADN: novatiq-return', res)
      return res
    },
  }
}

// Make sure that ajax has a function as callback
function prepProvider(provider) {
  return new Promise((resolve, reject) => {
    ajax(providers[provider.name].url(provider), {
      success: function (res) { resolve(providers[provider.name].function(res)) },
      error: function (err) { reject(err) }
    })
  });
}

function alterBidRequests(reqBidsConfigObj, callback, config, userConsent) {
  const params = config.params
  // const pbjsG = getGlobal()
  // const affectedBidders = (params.bidders) ? Object.keys(params.bidders).filter(function (bidder) {
  //   return params.bidders[bidder] == true
  // }) : []
  const affectedProviders = (params.providers) ? Object.keys(params.providers).map(provider => {
    return {
      ...params.providers[provider],
      name: provider
    }
  }) : []
  logMessage('ADN: providers', affectedProviders);

  const providerRequests = affectedProviders.map(provider => prepProvider(provider))
  logMessage('ADN: providerReq', providerRequests);
  Promise.allSettled(providerRequests).then((values) => {
    logMessage('ADN: PROMISE', values);
    // SEGMENT_LIST = [...SEGMENT_LIST, ...segments]
    // pbjsG.setBidderConfig({
    //   bidders: affectedBidders,
    //   config: {
    //     segments: SEGMENT_LIST
    //   }
    // });
    callback();
  }).catch(err => logError('ADN: err', err));
}

/** @type {RtdSubmodule} */
export const adnuntiusSubmodule = {
  name: 'adnuntius',
  init: init,
  getBidRequestData: alterBidRequests,
};

export function beforeInit() {
  submodule('realTimeData', adnuntiusSubmodule);
}

beforeInit();
