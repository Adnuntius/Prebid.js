import { getGlobal } from '../src/prebidGlobal.js';
import { submodule } from '../src/hook.js'
import { logError } from '../src/utils.js'
import { ajax } from '../src/ajax.js';

const tzo = new Date().getTimezoneOffset();
const ADN_USER_ID = JSON.parse(window.localStorage.getItem('adn.data')).browserId

function init(config, userConsent) {
  return true;
}

const providers = {
  adnuntius: {
    url: params => 'https://data.adnuntius.com/usr?tzo=' + tzo + '&browserId=' + ADN_USER_ID + '&folderId=' + params.folderId,
    function: res => JSON.parse(res).segments,
  },
  novatiq: {
    url: params => 'https://novatiq.consumor.io/segments/v1/novademo/45340f6d-d9ee-4ee9-b785-36f3e30ff1599999',
    function: res => JSON.parse(res).segments,
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
  const pbjsG = getGlobal()
  const affectedBidders = (params.bidders)
    ? Object.keys(params.bidders).filter(function (bidder) {
      return params.bidders[bidder] == true
    })
    : []

  const affectedProviders = (params.providers)
    ? Object.keys(params.providers).map(provider => {
      return {
        ...params.providers[provider],
        name: provider
      }
    })
    : []

  const providerRequests = affectedProviders.map(provider => prepProvider(provider))

  Promise.allSettled(providerRequests).then((values) => {
    const segments = values.reduce((segments, array) => (array.status === 'fulfilled') ? segments.concat(array.value) : [], [])

    pbjsG.setBidderConfig({
      bidders: affectedBidders,
      config: {
        rtd: {
          adnuntius: { segments }
        }
      }
    });

    callback();
  })
    .catch(err => logError('ADN: err', err));
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
