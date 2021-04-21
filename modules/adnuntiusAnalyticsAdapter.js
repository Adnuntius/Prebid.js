// import { ajax } from 'src/ajax';
import adapter from '../src/AnalyticsAdapter.js';
import CONSTANTS from '../src/constants.json';
import adaptermanager from '../src/adapterManager.js';
import { logMessage, timestamp } from '../src/utils.js';
import { ajax } from '../src/ajax.js';

// const analyticsType = 'endpoint';
// const url = 'http://test.com';

const URL = 'https://6xvzkr0nqh.execute-api.eu-north-1.amazonaws.com'

const auctions = {}
const BID_WON_TIMEOUT = 500;

let adnuntiusAnalytics = Object.assign(adapter({}), {
  track({ eventType, args }) {
    const time = timestamp();
    switch (eventType) {
      case CONSTANTS.EVENTS.AUCTION_INIT:
        auctions[args.auctionId] = { bids: {}, bidAdUnits: {} };
        logMessage('ADN: aucion init', args);
        break;
      case CONSTANTS.EVENTS.BID_REQUESTED:
        auctions[args.auctionId].timeStamp = args.start;
        args.bids.forEach(function (bidRequest) {
          auctions[args.auctionId].gdprApplies = args.gdprConsent ? args.gdprConsent.gdprApplies : undefined;
          auctions[args.auctionId].gdprConsent = args.gdprConsent ? args.gdprConsent.consentString : undefined;

          auctions[args.auctionId].bids[bidRequest.bidId] = {
            bidder: bidRequest.bidder,
            adUnit: bidRequest.adUnitCode,
            isBid: false,
            won: false,
            timeout: false,
            sent: false,
            readyToSend: false,
            start: args.start,
            floorData: bidRequest.floorData,
            auc: bidRequest.auc,
            buc: bidRequest.buc
          }

          logMessage(bidRequest);
        })
        logMessage('ADN: bid requested:', args);
        break;
      case CONSTANTS.EVENTS.BID_RESPONSE:

        let bidResponse = auctions[args.auctionId].bids[args.requestId];
        bidResponse.isBid = args.getStatusCode() === CONSTANTS.STATUS.GOOD;
        bidResponse.width = args.width;
        bidResponse.height = args.height;
        bidResponse.cpm = args.cpm;
        bidResponse.ttr = args.timeToRespond;
        bidResponse.readyToSend = true;
        bidResponse.mediaType = args.mediaType;
        if (!bidResponse.ttr) {
          bidResponse.ttr = time - bidResponse.start;
        }
        if (!auctions[args.auctionId].bidAdUnits[bidResponse.adUnit]) {
          auctions[args.auctionId].bidAdUnits[bidResponse.adUnit] =
          {
            sent: 0,
            timeStamp: auctions[args.auctionId].timeStamp
          };
        }
        logMessage('ADN: bid response:', args);
        break;
      case CONSTANTS.EVENTS.BIDDER_DONE:
        args.bids.forEach(doneBid => {
          let bid = auctions[doneBid.auctionId].bids[doneBid.bidId || doneBid.requestId];
          if (!bid.ttr) {
            bid.ttr = time - bid.start;
          }
          bid.readyToSend = true;
        });
        logMessage('ADN: bid done:', args.bids);
        break;
      case CONSTANTS.EVENTS.BID_WON:
        let wonBid = auctions[args.auctionId].bids[args.requestId];
        wonBid.won = true;
        if (wonBid.sendStatus != false) {
          this.send()
        }
        logMessage('ADN: Bid Won', args);
        break;
      case CONSTANTS.EVENTS.BID_TIMEOUT:
        args.forEach(timeout => {
          auctions[timeout.auctionId].bids[timeout.bidId].timeout = true;
        });
        logMessage('ADN: Bid timeout', args);
        break;
      case CONSTANTS.EVENTS.NO_BID:
        logMessage('ADN: NO BID:', args);
        break;
      case CONSTANTS.EVENTS.AUCTION_END:
        logMessage('ADN: auction end:', args);
        setTimeout(() => {
          this.send()
        }, BID_WON_TIMEOUT);
        break;
      case CONSTANTS.EVENTS.AD_RENDER_FAILED:
        logMessage('ADN: renderFail:', args);
        break;
      case CONSTANTS.EVENTS.AUCTION_DEBUG:
        logMessage('ADN: auction DEBUG:', args);
        break;
    }
  },
  send: () => {
    logMessage('ADN: SENDING AUCTION:', auctions);
    const bulkSend = []
    Object.keys(auctions).forEach(auctionId => {
      Object.keys(auctions[auctionId].bids).forEach(bidId => {
        const bid = auctions[auctionId].bids[bidId]
        logMessage('ADN: RUNNING BID:', bid);
        if (bid.readyToSend && !bid.sent) bulkSend.push(bid)
        bid.sent = true
      });
    });
    if (bulkSend.length > 0) {
      ajax(URL, undefined, JSON.stringify(bulkSend), { method: 'POST' });
      logMessage('ADN: SENDING:', bulkSend);
    }
  }

});

adnuntiusAnalytics.originEnableAnalytics = adnuntiusAnalytics.enableAnalytics;
adnuntiusAnalytics.enableAnalytics = function (config) {
  logMessage('Ding: ', config)
  adnuntiusAnalytics.originEnableAnalytics(config);
};

adaptermanager.registerAnalyticsAdapter({
  adapter: adnuntiusAnalytics,
  code: 'adnuntius',
  gvlid: 1
});

export default adnuntiusAnalytics;
