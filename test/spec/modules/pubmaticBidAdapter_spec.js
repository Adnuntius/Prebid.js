import { expect } from 'chai';
import { spec, checkVideoPlacement, _getDomainFromURL, assignDealTier, prepareMetaObject, getDeviceConnectionType, setIBVField, setTTL } from 'modules/pubmaticBidAdapter.js';
import * as utils from 'src/utils.js';
import { config } from 'src/config.js';
import { createEidsArray } from 'modules/userId/eids.js';
import { bidderSettings } from 'src/bidderSettings.js';
const constants = require('src/constants.js');

describe('PubMatic adapter', function () {
  let bidRequests;
  let videoBidRequests;
  let multipleMediaRequests;
  let bidResponses;
  let nativeBidRequests;
  let nativeBidRequestsWithAllParams;
  let nativeBidRequestsWithoutAsset;
  let nativeBidRequestsWithRequiredParam;
  let nativeBidResponse;
  let validnativeBidImpression;
  let validnativeBidImpressionWithRequiredParam;
  let nativeBidImpressionWithoutRequiredParams;
  let validnativeBidImpressionWithAllParams;
  let bannerAndVideoBidRequests;
  let bannerAndNativeBidRequests;
  let videoAndNativeBidRequests;
  let bannerVideoAndNativeBidRequests;
  let bannerBidResponse;
  let videoBidResponse;
  let schainConfig;
  let outstreamBidRequest;
  let validOutstreamBidRequest;
  let outstreamVideoBidResponse;

  beforeEach(function () {
    schainConfig = {
      'ver': '1.0',
      'complete': 1,
      'nodes': [
        {
          'asi': 'indirectseller.com',
          'sid': '00001',
          'hp': 1
        },

        {
          'asi': 'indirectseller-2.com',
          'sid': '00002',
          'hp': 2
        }
      ]
    };

    bidRequests = [
      {
        bidder: 'pubmatic',
        mediaTypes: {
          banner: {
            sizes: [[728, 90], [160, 600]]
          }
        },
        params: {
          publisherId: '5670',
          adSlot: '/15671365/DMDemo@300x250:0',
          kadfloor: '1.2',
    		  pmzoneid: 'aabc, ddef',
    		  kadpageurl: 'www.publisher.com',
    		  yob: '1986',
    		  gender: 'M',
    		  lat: '12.3',
    		  lon: '23.7',
    		  wiid: '1234567890',
    		  profId: '100',
    		  verId: '200',
          currency: 'AUD',
          dctr: 'key1:val1,val2|key2:val1'
        },
        placementCode: '/19968336/header-bid-tag-1',
        sizes: [[300, 250], [300, 600]],
        bidId: '23acc48ad47af5',
        requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
        bidderRequestId: '1c56ad30b9b8ca8',
        ortb2Imp: {
          ext: {
            tid: '92489f71-1bf2-49a0-adf9-000cea934729',
            gpid: '/1111/homepage-leftnav'
          }
        },
        schain: schainConfig
      }
    ];

    videoBidRequests =
    [
      {
        code: 'video1',
        mediaTypes: {
          video: {
            playerSize: [640, 480],
            context: 'instream'
          }
        },
        bidder: 'pubmatic',
        bidId: '22bddb28db77d',
        params: {
          publisherId: '5890',
          adSlot: 'Div1@0x0', // ad_id or tagid
          wiid: 'new-unique-wiid',
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30,
            startdelay: 5,
            playbackmethod: [1, 3],
            api: [1, 2],
            protocols: [2, 3],
            battr: [13, 14],
            linearity: 1,
            placement: 2,
            plcmt: 1,
            minbitrate: 10,
            maxbitrate: 10
          }
        }
      }
    ];

    multipleMediaRequests = [
      {
        bidder: 'pubmatic',
        params: {
          publisherId: '301',
          adSlot: '/15671365/DMDemo@300x250:0',
          kadfloor: '1.2',
          pmzoneid: 'aabc, ddef',
          kadpageurl: 'www.publisher.com',
          yob: '1986',
          gender: 'M',
          lat: '12.3',
          lon: '23.7',
          wiid: '1234567890',
          profId: '100',
          verId: '200'
        },
        mediaTypes: {
          banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
          }
        }
      },
      {
        code: 'div-instream',
        mediaTypes: {
          video: {
            context: 'instream',
            playerSize: [300, 250]
          },
        },
        bidder: 'pubmatic',
        params: {
          publisherId: '5890',
          adSlot: 'Div1@640x480', // ad_id or tagid
          wiid: '1234567890',
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30,
            startdelay: 15,
            playbackmethod: [1, 3],
            api: [1, 2],
            protocols: [2, 3],
            w: 640,
            h: 480,
            battr: [13, 14],
            linearity: 1,
            placement: 2,
            plcmt: 1,
            minbitrate: 100,
            maxbitrate: 4096
          }
        }
      }
    ];

    nativeBidRequests = [{
      code: '/19968336/prebid_native_example_1',
      sizes: [
        [300, 250]
      ],
      mediaTypes: {
        native: {
          title: {
            required: true,
            length: 80
          },
          image: {
            required: true,
            sizes: [300, 250]
          },
          sponsoredBy: {
            required: true
          }
        }
      },
      nativeParams: {
        title: { required: true, length: 80 },
        image: { required: true, sizes: [300, 250] },
        sponsoredBy: { required: true }
      },
      nativeOrtbRequest: {
        ver: '1.2',
        assets: [
          { id: 0, required: 1, title: {len: 140} },
          { id: 1, required: 1, img: { type: 3, w: 300, h: 250 } },
          { id: 2, required: 1, data: { type: 1 } }
        ]
      },
      bidder: 'pubmatic',
      params: {
        publisherId: '5670',
        adSlot: '/43743431/NativeAutomationPrebid@1x1',
        wiid: 'new-unique-wiid'
      },
      bidId: '2a5571261281d4',
      requestId: 'B68287E1-DC39-4B38-9790-FE4F179739D6',
      bidderRequestId: '1c56ad30b9b8ca8',
    }];

    nativeBidRequestsWithAllParams = [{
      code: '/19968336/prebid_native_example_1',
      sizes: [
        [300, 250]
      ],
      mediaTypes: {
        native: {
          title: {required: true, len: 80, ext: {'title1': 'title2'}},
          icon: {required: true, sizes: [50, 50], ext: {'icon1': 'icon2'}},
          image: {required: true, sizes: [728, 90], ext: {'image1': 'image2'}, 'mimes': ['image/png', 'image/gif']},
          sponsoredBy: {required: true, len: 10, ext: {'sponsor1': 'sponsor2'}},
          body: {required: true, len: 10, ext: {'body1': 'body2'}},
          rating: {required: true, len: 10, ext: {'rating1': 'rating2'}},
          likes: {required: true, len: 10, ext: {'likes1': 'likes2'}},
          downloads: {required: true, len: 10, ext: {'downloads1': 'downloads2'}},
          price: {required: true, len: 10, ext: {'price1': 'price2'}},
          saleprice: {required: true, len: 10, ext: {'saleprice1': 'saleprice2'}},
          phone: {required: true, len: 10, ext: {'phone1': 'phone2'}},
          address: {required: true, len: 10, ext: {'address1': 'address2'}},
          desc2: {required: true, len: 10, ext: {'desc21': 'desc22'}},
          displayurl: {required: true, len: 10, ext: {'displayurl1': 'displayurl2'}}
        }
      },
      nativeParams: {
        title: {required: true, len: 80, ext: {'title1': 'title2'}},
        icon: {required: true, sizes: [50, 50], ext: {'icon1': 'icon2'}},
        image: {required: true, sizes: [728, 90], ext: {'image1': 'image2'}, 'mimes': ['image/png', 'image/gif']},
        sponsoredBy: {required: true, len: 10, ext: {'sponsor1': 'sponsor2'}},
        body: {required: true, len: 10, ext: {'body1': 'body2'}},
        rating: {required: true, len: 10, ext: {'rating1': 'rating2'}},
        likes: {required: true, len: 10, ext: {'likes1': 'likes2'}},
        downloads: {required: true, len: 10, ext: {'downloads1': 'downloads2'}},
        price: {required: true, len: 10, ext: {'price1': 'price2'}},
        saleprice: {required: true, len: 10, ext: {'saleprice1': 'saleprice2'}},
        phone: {required: true, len: 10, ext: {'phone1': 'phone2'}},
        address: {required: true, len: 10, ext: {'address1': 'address2'}},
        desc2: {required: true, len: 10, ext: {'desc21': 'desc22'}},
        displayurl: {required: true, len: 10, ext: {'displayurl1': 'displayurl2'}}
      },
      nativeOrtbRequest: {
        'ver': '1.2',
        'assets': [
          {'id': 0, 'required': 1, 'title': {'len': 80}},
          {'id': 1, 'required': 1, 'img': {'type': 1, 'w': 50, 'h': 50}},
          {'id': 2, 'required': 1, 'img': {'type': 3, 'w': 728, 'h': 90}},
          {'id': 3, 'required': 1, 'data': {'type': 1, 'len': 10}},
          {'id': 4, 'required': 1, 'data': {'type': 2, 'len': 10}},
          {'id': 5, 'required': 1, 'data': {'type': 3, 'len': 10}},
          {'id': 6, 'required': 1, 'data': {'type': 4, 'len': 10}},
          {'id': 7, 'required': 1, 'data': {'type': 5, 'len': 10}},
          {'id': 8, 'required': 1, 'data': {'type': 6, 'len': 10}},
          {'id': 9, 'required': 1, 'data': {'type': 8, 'len': 10}},
          {'id': 10, 'required': 1, 'data': {'type': 9, 'len': 10}}
        ]
      },
      bidder: 'pubmatic',
      params: {
        publisherId: '5670',
        adSlot: '/43743431/NativeAutomationPrebid@1x1',
        wiid: 'new-unique-wiid'
      },
      bidId: '2a5571261281d4',
      requestId: 'B68287E1-DC39-4B38-9790-FE4F179739D6',
      bidderRequestId: '1c56ad30b9b8ca8',
    }];

    nativeBidRequestsWithoutAsset = [{
      code: '/19968336/prebid_native_example_1',
      sizes: [
        [300, 250]
      ],
      mediaTypes: {
        native: {
          type: 'image'
        }
      },
      nativeParams: {
        title: { required: true },
        image: { required: true },
        sponsoredBy: { required: true },
        clickUrl: { required: true }
      },
      bidder: 'pubmatic',
      params: {
        publisherId: '5670',
        adSlot: '/43743431/NativeAutomationPrebid@1x1',
        wiid: 'new-unique-wiid'
      }
    }];

    nativeBidRequestsWithRequiredParam = [{
      code: '/19968336/prebid_native_example_1',
      sizes: [
        [300, 250]
      ],
      mediaTypes: {
        native: {
          title: {
            required: false,
            length: 80
          },
          image: {
            required: false,
            sizes: [300, 250]
          },
          sponsoredBy: {
            required: true
          }
        }
      },
      nativeParams: {
        title: { required: false, length: 80 },
        image: { required: false, sizes: [300, 250] },
        sponsoredBy: { required: true }
      },
      nativeOrtbRequest: {
        ver: '1.2',
        assets: [
          { id: 0, required: 0, title: {len: 140} },
          { id: 1, required: 0, img: {type: 3, w: 300, h: 250} },
          { id: 2, required: 1, data: {type: 1} }
        ]
      },
      bidder: 'pubmatic',
      params: {
        publisherId: '5670',
        adSlot: '/43743431/NativeAutomationPrebid@1x1',
        wiid: 'new-unique-wiid'
      }
    }];

    bannerAndVideoBidRequests = [
      {
        code: 'div-banner-video',
        ortb2Imp: {
          banner: {
            pos: 1
          }
        },
        mediaTypes: {
          video: {
            playerSize: [640, 480],
            context: 'instream',
            pos: 2
          },
          banner: {
            sizes: [[300, 250], [300, 600]],
            pos: 1
          }
        },
        bidder: 'pubmatic',
        params: {
          publisherId: '301',
          adSlot: '/15671365/DMDemo@300x250:0',
          kadfloor: '1.2',
          pmzoneid: 'aabc, ddef',
          kadpageurl: 'www.publisher.com',
          yob: '1986',
          gender: 'M',
          lat: '12.3',
          lon: '23.7',
          wiid: '1234567890',
          profId: '100',
          verId: '200',
          currency: 'AUD',
          dctr: 'key1:val1,val2|key2:val1',
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30,
            startdelay: 15,
            playbackmethod: [1, 3],
            api: [1, 2],
            protocols: [2, 3],
            w: 640,
            h: 480,
            battr: [13, 14],
            linearity: 1,
            placement: 2,
            plcmt: 1,
            minbitrate: 100,
            maxbitrate: 4096
          }
        },
        placementCode: '/19968336/header-bid-tag-1',
        sizes: [[728, 90]],
        bidId: '23acc48ad47af5',
        requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
        bidderRequestId: '1c56ad30b9b8ca8',
        transactionId: '92489f71-1bf2-49a0-adf9-000cea934729'
      }
    ];

    bannerAndNativeBidRequests = [
      {
        code: 'div-banner-native',
        mediaTypes: {
          native: {
            title: {
              required: true,
              length: 80
            },
            image: {
              required: true,
              sizes: [300, 250]
            },
            sponsoredBy: {
              required: true
            }
          },
          banner: {
            sizes: [[300, 250], [300, 600]]
          }
        },
        nativeParams: {
          title: { required: true, length: 80 },
          image: { required: true, sizes: [300, 250] },
          sponsoredBy: { required: true }
        },
        nativeOrtbRequest: {
          ver: '1.2',
          assets: [
            {id: 0, required: 1, title: {len: 140}},
            {id: 1, required: 1, img: {type: 3, w: 300, h: 250}},
            {id: 2, required: 1, data: {type: 1}}
          ]
        },
        bidder: 'pubmatic',
        params: {
          publisherId: '301',
          adSlot: '/15671365/DMDemo@300x250:0',
          kadfloor: '1.2',
          pmzoneid: 'aabc, ddef',
          kadpageurl: 'www.publisher.com',
          yob: '1986',
          gender: 'M',
          lat: '12.3',
          lon: '23.7',
          wiid: '1234567890',
          profId: '100',
          verId: '200',
          currency: 'AUD',
          dctr: 'key1:val1,val2|key2:val1'
        },
        placementCode: '/19968336/header-bid-tag-1',
        sizes: [[728, 90]],
        bidId: '23acc48ad47af5',
        requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
        bidderRequestId: '1c56ad30b9b8ca8',
        transactionId: '92489f71-1bf2-49a0-adf9-000cea934729'
      }
    ];

    videoAndNativeBidRequests = [
      {
        code: 'div-video-native',
        mediaTypes: {
          native: {
            title: {
              required: true,
              length: 80
            },
            image: {
              required: true,
              sizes: [300, 250]
            },
            sponsoredBy: {
              required: true
            }
          },
          video: {
            playerSize: [640, 480],
            context: 'instream'
          }
        },
        nativeParams: {
          title: { required: true, length: 80 },
          image: { required: true, sizes: [300, 250] },
          sponsoredBy: { required: true }
        },
        nativeOrtbRequest: {
          ver: '1.2',
          assets: [
            { id: 0, required: 1, title: {len: 140} },
            { id: 1, required: 1, img: { type: 3, w: 300, h: 250 } },
            { id: 2, required: 1, data: { type: 1 } }
          ]
        },
        bidder: 'pubmatic',
        params: {
          publisherId: '301',
          adSlot: '/15671365/DMDemo@300x250:0',
          wiid: 'new-unique-wiid',
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30,
            startdelay: 15,
            playbackmethod: [1, 3],
            api: [1, 2],
            protocols: [2, 3],
            w: 640,
            h: 480,
            battr: [13, 14],
            linearity: 1,
            placement: 2,
            plcmt: 1,
            minbitrate: 100,
            maxbitrate: 4096
          }
        },
        placementCode: '/19968336/header-bid-tag-1',
        sizes: [[728, 90]],
        bidId: '23acc48ad47af5',
        requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
        bidderRequestId: '1c56ad30b9b8ca8',
        transactionId: '92489f71-1bf2-49a0-adf9-000cea934729'
      }
    ];

    bannerVideoAndNativeBidRequests = [
      {
        code: 'div-video-native',
        mediaTypes: {
          native: {
            title: {
              required: true,
              length: 80
            },
            image: {
              required: true,
              sizes: [300, 250]
            },
            sponsoredBy: {
              required: true
            }
          },
          video: {
            playerSize: [640, 480],
            context: 'instream'
          },
          banner: {
            sizes: [[300, 250], [300, 600]]
          }
        },
        nativeParams: {
          title: { required: true, length: 80 },
          image: { required: true, sizes: [300, 250] },
          sponsoredBy: { required: true }
        },
        nativeOrtbRequest: {
          ver: '1.2',
          assets: [
            { id: 0, required: 1, title: {len: 80} },
            { id: 1, required: 1, img: { type: 3, w: 300, h: 250 } },
            { id: 2, required: 1, data: { type: 1 } }
          ]
        },
        bidder: 'pubmatic',
        params: {
          publisherId: '301',
          adSlot: '/15671365/DMDemo@300x250:0',
          wiid: 'new-unique-wiid',
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30,
            startdelay: 15,
            playbackmethod: [1, 3],
            api: [1, 2],
            protocols: [2, 3],
            w: 640,
            h: 480,
            battr: [13, 14],
            linearity: 1,
            placement: 2,
            plcmt: 1,
            minbitrate: 100,
            maxbitrate: 4096
          }
        },
        placementCode: '/19968336/header-bid-tag-1',
        sizes: [[728, 90]],
        bidId: '23acc48ad47af5',
        requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
        bidderRequestId: '1c56ad30b9b8ca8',
        transactionId: '92489f71-1bf2-49a0-adf9-000cea934729'
      }
    ];

    bidResponses = {
      'body': {
        'id': '93D3BAD6-E2E2-49FB-9D89-920B1761C865',
        'seatbid': [{
          'seat': 'seat-id',
          'ext': {
            'buyid': 'BUYER-ID-987'
          },
          'bid': [{
            'id': '74858439-49D7-4169-BA5D-44A046315B2F',
            'impid': '22bddb28db77d',
            'price': 1.3,
            'adm': 'image3.pubmatic.com Layer based creative',
            'adomain': ['blackrock.com'],
            'h': 250,
            'w': 300,
            'ext': {
              'deal_channel': 6,
              'advid': 976,
              'dspid': 123,
              'dchain': 'dchain'
            }
          }]
        }, {
          'ext': {
            'buyid': 'BUYER-ID-789'
          },
          'bid': [{
            'id': '74858439-49D7-4169-BA5D-44A046315BEF',
            'impid': '22bddb28db77e',
            'price': 1.7,
            'adm': 'image3.pubmatic.com Layer based creative',
            'adomain': ['hivehome.com'],
            'h': 250,
            'w': 300,
            'ext': {
              'deal_channel': 5,
              'advid': 832,
              'dspid': 422
            }
          }]
        }]
      }
    };

    nativeBidResponse = {
      'body': {
        'id': '1544691825939',
        'seatbid': [{
          'bid': [{
            'id': 'B68287E1-DC39-4B38-9790-FE4F179739D6',
            'impid': '2a5571261281d4',
            'price': 0.01,
            'adm': "{\"native\":{\"assets\":[{\"id\":1,\"title\":{\"text\":\"Native Test Title\"}},{\"id\":2,\"img\":{\"h\":627,\"url\":\"http://stagingpub.net/native_ads/PM-Native-Ad-1200x627.png\",\"w\":1200}},{\"data\":{\"value\":\"Sponsored By PubMatic\"},\"id\":4}],\"imptrackers\":[\"http://imptracker.com/main/9bde02d0-6017-11e4-9df7-005056967c35\",\"http://172.16.4.213/AdServer/AdDisplayTrackerServlet?operId=1&pubId=5890&siteId=5892&adId=6016&adType=12&adServerId=243&kefact=0.010000&kaxefact=0.010000&kadNetFrequecy=0&kadwidth=0&kadheight=0&kadsizeid=7&kltstamp=1544692761&indirectAdId=0&adServerOptimizerId=2&ranreq=0.1&kpbmtpfact=1.000000&dcId=1&tldId=0&passback=0&svr=MADS1107&ekefact=GSQSXOLKDgBAvRnoiNj0LxtpAnNEO30u1ZI5sITloOsP7gzh&ekaxefact=GSQSXAXLDgD0fOZLCjgbnVJiyS3D65dqDkxfs2ArpC3iugXw&ekpbmtpfact=GSQSXCDLDgB5mcooOvXtCKmx7TnNDJDY2YuHFOL3o9ceoU4H&crID=campaign111&lpu=advertiserdomain.com&ucrid=273354366805642829&campaignId=16981&creativeId=0&pctr=0.000000&wDSPByrId=511&wDspId=6&wbId=0&wrId=0&wAdvID=1&isRTB=1&rtbId=C09BB577-B8C1-4C3E-A0FF-73F6F631C80A&imprId=B68287E1-DC39-4B38-9790-FE4F179739D6&oid=B68287E1-DC39-4B38-9790-FE4F179739D6&pageURL=http%3A%2F%2Ftest.com%2FTestPages%2Fnativead.html\"],\"jstracker\":\"<script src='http:\\\\/\\\\/stagingpub.net\\\\/native\\\\/tempReseponse.js'><script src='http:\\\\/\\\\/stagingpub.net\\\\/native\\\\/tempReseponse.js'>\",\"link\":{\"clicktrackers\":[\"http://clicktracker.com/main/9bde02d0-6017-11e4-9df7-005056967c35\",\"&pubId=5890&siteId=5892&adId=6016&kadsizeid=7&tldId=0&passback=0&campaignId=16981&creativeId=0&adServerId=243&impid=B68287E1-DC39-4B38-9790-FE4F179739D6\"],\"fallback\":\"http://www.pubmatic.com\",\"url\":\"http://www.pubmatic.com\"}}}",
            'adomain': ['advertiserdomain.com'],
            'cid': '16981',
            'crid': 'campaign111',
            'ext': {
              'dspid': 6
            }
          }],
          'seat': '527'
        }],
        'cur': 'USD'
      }
    }

    validnativeBidImpression = {
      'native': {
        'request': '{"ver":"1.2","assets":[{"id":0,"required":1,"title":{"len":80}},{"id":1,"required":1,"img":{"type":3,"w":300,"h":250}},{"id":2,"required":1,"data":{"type":1}}]}'
      }
    }

    nativeBidImpressionWithoutRequiredParams = {
      'native': {
        'request': '{"assets":[{"id":4,"required":1,"data":{"type":1}}]}'
      }
    }

    validnativeBidImpressionWithRequiredParam = {
      'native': {
        'request': '{"ver":"1.2","assets":[{"id":0,"required":0,"title":{"len":80}},{"id":1,"required":0,"img":{"type":3,"w":300,"h":250}},{"id":2,"required":1,"data":{"type":1}}]}'
      }
    }

    validnativeBidImpressionWithAllParams = {
      native: {
        'request': '{"ver":"1.2","assets":[{"id":0,"required":1,"title":{"len":80,"ext":{"title1":"title2"}}},{"id":1,"required":1,"img":{"type":1,"w":50,"h":50,"ext":{"icon1":"icon2"}}},{"id":2,"required":1,"img":{"type":3,"w":728,"h":90,"ext":{"image1":"image2"},"mimes":["image/png","image/gif"]}},{"id":3,"required":1,"data":{"type":1,"len":10,"ext":{"sponsor1":"sponsor2"}}},{"id":4,"required":1,"data":{"type":2,"len":10,"ext":{"body1":"body2"}}},{"id":5,"required":1,"data":{"type":3,"len":10,"ext":{"rating1":"rating2"}}},{"id":6,"required":1,"data":{"type":4,"len":10,"ext":{"likes1":"likes2"}}},{"id":7,"required":1,"data":{"type":5,"len":10,"ext":{"downloads1":"downloads2"}}},{"id":8,"required":1,"data":{"type":6,"len":10,"ext":{"price1":"price2"}}},{"id":9,"required":1,"data":{"type":7,"len":10,"ext":{"saleprice1":"saleprice2"}}},{"id":10,"required":1,"data":{"type":8,"len":10,"ext":{"phone1":"phone2"}}},{"id":11,"required":1,"data":{"type":9,"len":10,"ext":{"address1":"address2"}}},{"id":12,"required":1,"data":{"type":10,"len":10,"ext":{"desc21":"desc22"}}},{"id":13,"required":1,"data":{"type":11,"len":10,"ext":{"displayurl1":"displayurl2"}}}]}'
      }
    }

    bannerBidResponse = {
      'body': {
        'id': '93D3BAD6-E2E2-49FB-9D89-920B1761C865',
        'seatbid': [{
          'bid': [{
            'id': '74858439-49D7-4169-BA5D-44A046315B2F',
            'impid': '23acc48ad47af5',
            'price': 1.3,
            'adm': '<span class="PubAPIAd"  id="4E733404-CC2E-48A2-BC83-4DD5F38FE9BB"><script type="text/javascript"> document.writeln(\'<iframe width="300" scrolling="no" height="250" frameborder="0" name="iframe0" allowtransparency="true" marginheight="0" marginwidth="0" vspace="0" hspace="0" src="http://ads.pubmatic.com/AdTag/dummyImage.png"></iframe>\');</script><iframe width="0" scrolling="no" height="0" frameborder="0" src="http://aktrack.pubmatic.com/AdServer/AdDisplayTrackerServlet?pubId=5890" style="position:absolute;top:-15000px;left:-15000px" vspace="0" hspace="0" marginwidth="0" marginheight="0" allowtransparency="true" name="pbeacon"></iframe></span> <!-- PubMatic Ad Ends -->',
            'h': 250,
            'w': 300,
            'ext': {
              'deal_channel': 6
            }
          }]
        }]
      }
    };

    videoBidResponse = {
      'body': {
        'id': '93D3BAD6-E2E2-49FB-9D89-920B1761C865',
        'seatbid': [{
          'bid': [{
            'id': '74858439-49D7-4169-BA5D-44A046315B2F',
            'impid': '22bddb28db77d',
            'price': 1.3,
            'adm': '<VAST version="3.0"><Ad id="601364"><InLine><AdSystem>Acudeo Compatible</AdSystem><AdTitle>VAST 2.0 Instream Test 1</AdTitle><Description>VAST 2.0 Instream Test 1</Description><Impression><![CDATA[http://172.16.4.213/AdServer/AdDisplayTrackerServlet?operId=1&pubId=5890&siteId=47163&adId=1405268&adType=13&adServerId=243&kefact=70.000000&kaxefact=70.000000&kadNetFrequecy=0&kadwidth=0&kadheight=0&kadsizeid=97&kltstamp=1529929473&indirectAdId=0&adServerOptimizerId=2&ranreq=0.1&kpbmtpfact=100.000000&dcId=1&tldId=0&passback=0&svr=MADS1107&ekefact=Ad8wW91TCwCmdG0jlfjXn7Tyzh20hnTVx-m5DoNSep-RXGDr&ekaxefact=Ad8wWwRUCwAGir4Zzl1eF0bKiC-qrCV0D0yp_eE7YizB_BQk&ekpbmtpfact=Ad8wWxRUCwD7qgzwwPE2LnS5-Ou19uO5amJl1YT6-XVFvQ41&imprId=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&oid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&crID=creative-1_1_2&ucrid=160175026529250297&campaignId=17050&creativeId=0&pctr=0.000000&wDSPByrId=511&wDspId=6&wbId=0&wrId=0&wAdvID=3170&isRTB=1&rtbId=EBCA079F-8D7C-45B8-B733-92951F670AA1&pmZoneId=zone1&pageURL=www.yahoo.com&lpu=ae.com]]></Impression><Impression>https://dsptracker.com/{PSPM}</Impression><Error><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&er=[ERRORCODE]]]></Error><Error><![CDATA[https://Errortrack.com?p=1234&er=[ERRORCODE]]]></Error><Creatives><Creative AdID="601364"><Linear skipoffset="20%"><TrackingEvents><Tracking event="close"><![CDATA[https://mytracking.com/linear/close]]></Tracking><Tracking event="skip"><![CDATA[https://mytracking.com/linear/skip]]></Tracking><Tracking event="creativeView"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=1]]></Tracking><Tracking event="start"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=2]]></Tracking><Tracking event="midpoint"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=3]]></Tracking><Tracking event="firstQuartile"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=4]]></Tracking><Tracking event="thirdQuartile"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=5]]></Tracking><Tracking event="complete"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=6]]></Tracking></TrackingEvents><Duration>00:00:04</Duration><VideoClicks><ClickTracking><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=99]]></ClickTracking><ClickThrough>https://www.pubmatic.com</ClickThrough></VideoClicks><MediaFiles><MediaFile delivery="progressive" type="video/mp4" bitrate="500" width="400" height="300" scalable="true" maintainAspectRatio="true"><![CDATA[https://stagingnyc.pubmatic.com:8443/video/Shashank/mediaFileHost/media/mp4-sample-2.mp4]]></MediaFile></MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>',
            'h': 250,
            'w': 300,
            'ext': {
              'deal_channel': 6
            }
          }]
        }]
      }
    };
    outstreamBidRequest =
    [
      {
        code: 'video1',
        mediaTypes: {
          video: {
            playerSize: [640, 480],
            context: 'outstream'
          }
        },
        bidder: 'pubmatic',
        bidId: '47acc48ad47af5',
        requestId: '0fb4905b-1234-4152-86be-c6f6d259ba99',
        bidderRequestId: '1c56ad30b9b8ca8',
        transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
        params: {
          publisherId: '5670',
          outstreamAU: 'pubmatic-test',
          adSlot: 'Div1@0x0', // ad_id or tagid
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30
          }
        }
      }
    ];

    validOutstreamBidRequest = {
      auctionId: '92489f71-1bf2-49a0-adf9-000cea934729',
      auctionStart: 1585918458868,
      bidderCode: 'pubmatic',
      bidderRequestId: '47acc48ad47af5',
      bids: [{
        adUnitCode: 'video1',
        auctionId: '92489f71-1bf2-49a0-adf9-000cea934729',
        bidId: '47acc48ad47af5',
        bidRequestsCount: 1,
        bidder: 'pubmatic',
        bidderRequestId: '47acc48ad47af5',
        mediaTypes: {
          video: {
            context: 'outstream'
          }
        },
        params: {
          publisherId: '5670',
          outstreamAU: 'pubmatic-test',
          adSlot: 'Div1@0x0', // ad_id or tagid
          video: {
            mimes: ['video/mp4', 'video/x-flv'],
            skippable: true,
            minduration: 5,
            maxduration: 30
          }
        },
        sizes: [[768, 432], [640, 480], [630, 360]],
        transactionId: '92489f71-1bf2-49a0-adf9-000cea934729'
      }],
      start: 11585918458869,
      timeout: 3000
    };

    outstreamVideoBidResponse = {
      'body': {
        'id': '93D3BAD6-E2E2-49FB-9D89-920B1761C865',
        'seatbid': [{
          'bid': [{
            'id': '0fb4905b-1234-4152-86be-c6f6d259ba99',
            'impid': '47acc48ad47af5',
            'price': 1.3,
            'adm': '<VAST version="3.0"><Ad id="601364"><InLine><AdSystem>Acudeo Compatible</AdSystem><AdTitle>VAST 2.0 Instream Test 1</AdTitle><Description>VAST 2.0 Instream Test 1</Description><Impression><![CDATA[http://172.16.4.213/AdServer/AdDisplayTrackerServlet?operId=1&pubId=5890&siteId=47163&adId=1405268&adType=13&adServerId=243&kefact=70.000000&kaxefact=70.000000&kadNetFrequecy=0&kadwidth=0&kadheight=0&kadsizeid=97&kltstamp=1529929473&indirectAdId=0&adServerOptimizerId=2&ranreq=0.1&kpbmtpfact=100.000000&dcId=1&tldId=0&passback=0&svr=MADS1107&ekefact=Ad8wW91TCwCmdG0jlfjXn7Tyzh20hnTVx-m5DoNSep-RXGDr&ekaxefact=Ad8wWwRUCwAGir4Zzl1eF0bKiC-qrCV0D0yp_eE7YizB_BQk&ekpbmtpfact=Ad8wWxRUCwD7qgzwwPE2LnS5-Ou19uO5amJl1YT6-XVFvQ41&imprId=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&oid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&crID=creative-1_1_2&ucrid=160175026529250297&campaignId=17050&creativeId=0&pctr=0.000000&wDSPByrId=511&wDspId=6&wbId=0&wrId=0&wAdvID=3170&isRTB=1&rtbId=EBCA079F-8D7C-45B8-B733-92951F670AA1&pmZoneId=zone1&pageURL=www.yahoo.com&lpu=ae.com]]></Impression><Impression>https://dsptracker.com/{PSPM}</Impression><Error><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&er=[ERRORCODE]]]></Error><Error><![CDATA[https://Errortrack.com?p=1234&er=[ERRORCODE]]]></Error><Creatives><Creative AdID="601364"><Linear skipoffset="20%"><TrackingEvents><Tracking event="close"><![CDATA[https://mytracking.com/linear/close]]></Tracking><Tracking event="skip"><![CDATA[https://mytracking.com/linear/skip]]></Tracking><Tracking event="creativeView"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=1]]></Tracking><Tracking event="start"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=2]]></Tracking><Tracking event="midpoint"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=3]]></Tracking><Tracking event="firstQuartile"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=4]]></Tracking><Tracking event="thirdQuartile"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=5]]></Tracking><Tracking event="complete"><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=6]]></Tracking></TrackingEvents><Duration>00:00:04</Duration><VideoClicks><ClickTracking><![CDATA[http://172.16.4.213/track?operId=7&p=5890&s=47163&a=1405268&wa=243&ts=1529929473&wc=17050&crId=creative-1_1_2&ucrid=160175026529250297&impid=48F73E1A-7F23-443D-A53C-30EE6BBF5F7F&advertiser_id=3170&ecpm=70.000000&e=99]]></ClickTracking><ClickThrough>https://www.pubmatic.com</ClickThrough></VideoClicks><MediaFiles><MediaFile delivery="progressive" type="video/mp4" bitrate="500" width="400" height="300" scalable="true" maintainAspectRatio="true"><![CDATA[https://stagingnyc.pubmatic.com:8443/video/Shashank/mediaFileHost/media/mp4-sample-2.mp4]]></MediaFile></MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>',
            'h': 250,
            'w': 300,
            'ext': {
              'deal_channel': 6
            }
          }]
        }]
      }
    };
  });

  describe('implementation', function () {
  	describe('Bid validations', function () {
  		it('valid bid case', function () {
		  let validBid = {
	        bidder: 'pubmatic',
	        params: {
	          publisherId: '301',
	          adSlot: '/15671365/DMDemo@300x250:0'
	        }
	      },
	      isValid = spec.isBidRequestValid(validBid);
	      expect(isValid).to.equal(true);
  		});

      it('invalid bid case: publisherId not passed', function () {
		    let validBid = {
	        bidder: 'pubmatic',
	        params: {
	          adSlot: '/15671365/DMDemo@300x250:0'
	        }
	      },
	      isValid = spec.isBidRequestValid(validBid);
	      expect(isValid).to.equal(false);
  		});

      it('invalid bid case: publisherId is not string', function () {
        let validBid = {
            bidder: 'pubmatic',
            params: {
              publisherId: 301,
              adSlot: '/15671365/DMDemo@300x250:0'
            }
          },
          isValid = spec.isBidRequestValid(validBid);
        expect(isValid).to.equal(false);
      });

      it('valid bid case: adSlot is not passed', function () {
        let validBid = {
            bidder: 'pubmatic',
            params: {
              publisherId: '301'
            }
          },
          isValid = spec.isBidRequestValid(validBid);
        expect(isValid).to.equal(true);
      });

      if (FEATURES.VIDEO) {
        it('should check for context if video is present', function() {
          let bid = {
              'bidder': 'pubmatic',
              'params': {
                'adSlot': 'SLOT_NHB1@728x90',
                'publisherId': '5890'
              },
              'mediaTypes': {
                'video': {
                  'playerSize': [
                    [640, 480]
                  ],
                  'protocols': [1, 2, 5],
                  'context': 'instream',
                  'mimes': ['video/flv'],
                  'skippable': false,
                  'skip': 1,
                  'linearity': 2
                }
              },
              'adUnitCode': 'video1',
              'transactionId': '803e3750-0bbe-4ffe-a548-b6eca15087bf',
              'sizes': [
                [640, 480]
              ],
              'bidId': '2c95df014cfe97',
              'bidderRequestId': '1fe59391566442',
              'auctionId': '3a4118ef-fb96-4416-b0b0-3cfc1cebc142',
              'src': 'client',
              'bidRequestsCount': 1,
              'bidderRequestsCount': 1,
              'bidderWinsCount': 0
            },
            isValid = spec.isBidRequestValid(bid);
          expect(isValid).to.equal(true);
        })

        it('should return false if context is not present in video', function() {
          let bid = {
              'bidder': 'pubmatic',
              'params': {
                'adSlot': 'SLOT_NHB1@728x90',
                'publisherId': '5890'
              },
              'mediaTypes': {
                'video': {
                  'w': 640,
                  'h': 480,
                  'protocols': [1, 2, 5],
                  'mimes': ['video/flv'],
                  'skippable': false,
                  'skip': 1,
                  'linearity': 2
                }
              },
              'adUnitCode': 'video1',
              'transactionId': '803e3750-0bbe-4ffe-a548-b6eca15087bf',
              'sizes': [
                [640, 480]
              ],
              'bidId': '2c95df014cfe97',
              'bidderRequestId': '1fe59391566442',
              'auctionId': '3a4118ef-fb96-4416-b0b0-3cfc1cebc142',
              'src': 'client',
              'bidRequestsCount': 1,
              'bidderRequestsCount': 1,
              'bidderWinsCount': 0
            },
            isValid = spec.isBidRequestValid(bid);
          expect(isValid).to.equal(false);
        })

        it('bid.mediaTypes.video.mimes OR bid.params.video.mimes should be present and must be a non-empty array', function() {
          let bid = {
            'bidder': 'pubmatic',
            'params': {
              'adSlot': 'SLOT_NHB1@728x90',
              'publisherId': '5890',
              'video': {}
            },
            'mediaTypes': {
              'video': {
                'playerSize': [
                  [640, 480]
                ],
                'protocols': [1, 2, 5],
                'context': 'instream',
                'skippable': false,
                'skip': 1,
                'linearity': 2
              }
            },
            'adUnitCode': 'video1',
            'transactionId': '803e3750-0bbe-4ffe-a548-b6eca15087bf',
            'sizes': [
              [640, 480]
            ],
            'bidId': '2c95df014cfe97',
            'bidderRequestId': '1fe59391566442',
            'auctionId': '3a4118ef-fb96-4416-b0b0-3cfc1cebc142',
            'src': 'client',
            'bidRequestsCount': 1,
            'bidderRequestsCount': 1,
            'bidderWinsCount': 0
          };

          delete bid.params.video.mimes; // Undefined
          bid.mediaTypes.video.mimes = 'string'; // NOT array
          expect(spec.isBidRequestValid(bid)).to.equal(false);

          delete bid.params.video.mimes; // Undefined
          delete bid.mediaTypes.video.mimes; // Undefined
          expect(spec.isBidRequestValid(bid)).to.equal(false);

          delete bid.params.video.mimes; // Undefined
          bid.mediaTypes.video.mimes = ['video/flv']; // Valid
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          delete bid.mediaTypes.video.mimes; // mediaTypes.video.mimes undefined
          bid.params.video = {mimes: 'string'}; // NOT array
          expect(spec.isBidRequestValid(bid)).to.equal(false);

          delete bid.mediaTypes.video.mimes; // mediaTypes.video.mimes undefined
          delete bid.params.video.mimes; // Undefined
          expect(spec.isBidRequestValid(bid)).to.equal(false);

          delete bid.mediaTypes.video.mimes; // mediaTypes.video.mimes undefined
          bid.params.video.mimes = ['video/flv']; // Valid
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          delete bid.mediaTypes.video.mimes; // Undefined
          bid.params.video.mimes = ['video/flv']; // Valid
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          delete bid.mediaTypes.video.mimes; // Undefined
          delete bid.params.video.mimes; // Undefined
          expect(spec.isBidRequestValid(bid)).to.equal(false);
        });

        it('checks on bid.params.outstreamAU & bid.renderer & bid.mediaTypes.video.renderer', function() {
          const getThebid = function() {
            let bid = utils.deepClone(validOutstreamBidRequest.bids[0]);
            bid.params.outstreamAU = 'pubmatic-test';
            bid.renderer = ' '; // we are only checking if this key is set or not
            bid.mediaTypes.video.renderer = ' '; // we are only checking if this key is set or not
            return bid;
          }

          // true: when all are present
          // mdiatype: outstream
          // bid.params.outstreamAU : Y
          // bid.renderer : Y
          // bid.mediaTypes.video.renderer : Y
          let bid = getThebid();
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          // true: atleast one is present; 3 cases
          // mdiatype: outstream
          // bid.params.outstreamAU : Y
          // bid.renderer : N
          // bid.mediaTypes.video.renderer : N
          bid = getThebid();
          delete bid.renderer;
          delete bid.mediaTypes.video.renderer;
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          // true: atleast one is present; 3 cases
          // mdiatype: outstream
          // bid.params.outstreamAU : N
          // bid.renderer : Y
          // bid.mediaTypes.video.renderer : N
          bid = getThebid();
          delete bid.params.outstreamAU;
          delete bid.mediaTypes.video.renderer;
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          // true: atleast one is present; 3 cases
          // mdiatype: outstream
          // bid.params.outstreamAU : N
          // bid.renderer : N
          // bid.mediaTypes.video.renderer : Y
          bid = getThebid();
          delete bid.params.outstreamAU;
          delete bid.renderer;
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          // false: none present; only outstream
          // mdiatype: outstream
          // bid.params.outstreamAU : N
          // bid.renderer : N
          // bid.mediaTypes.video.renderer : N
          bid = getThebid();
          delete bid.params.outstreamAU;
          delete bid.renderer;
          delete bid.mediaTypes.video.renderer;
          expect(spec.isBidRequestValid(bid)).to.equal(false);

          // true: none present; outstream + Banner
          // mdiatype: outstream, banner
          // bid.params.outstreamAU : N
          // bid.renderer : N
          // bid.mediaTypes.video.renderer : N
          bid = getThebid();
          delete bid.params.outstreamAU;
          delete bid.renderer;
          delete bid.mediaTypes.video.renderer;
          bid.mediaTypes.banner = {sizes: [ [300, 250], [300, 600] ]};
          expect(spec.isBidRequestValid(bid)).to.equal(true);

          // true: none present; outstream + Native
          // mdiatype: outstream, native
          // bid.params.outstreamAU : N
          // bid.renderer : N
          // bid.mediaTypes.video.renderer : N
          bid = getThebid();
          delete bid.params.outstreamAU;
          delete bid.renderer;
          delete bid.mediaTypes.video.renderer;
          bid.mediaTypes.native = {}
          expect(spec.isBidRequestValid(bid)).to.equal(true);
        });
      }
    });

  	describe('Request formation', function () {
  		it('buildRequests function should not modify original bidRequests object', function () {
        let originalBidRequests = utils.deepClone(bidRequests);
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        expect(bidRequests).to.deep.equal(originalBidRequests);
      });

      it('buildRequests function should not modify original nativebidRequests object', function () {
        let originalBidRequests = utils.deepClone(nativeBidRequests);
        let request = spec.buildRequests(nativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        expect(nativeBidRequests).to.deep.equal(originalBidRequests);
      });

      it('Endpoint checking', function () {
  		  let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        expect(request.url).to.equal('https://hbopenbid.pubmatic.com/translator?source=prebid-client');
        expect(request.method).to.equal('POST');
      });

      it('should return bidderRequest property', function() {
        let request = spec.buildRequests(bidRequests, validOutstreamBidRequest);
        expect(request.bidderRequest).to.equal(validOutstreamBidRequest);
      });

      it('bidderRequest should be undefined if bidderRequest is not present', function() {
        let request = spec.buildRequests(bidRequests);
        expect(request.bidderRequest).to.be.undefined;
      });

      it('test flag not sent when pubmaticTest=true is absent in page url', function() {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.test).to.equal(undefined);
      });

  		it('Request params check', function () {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id',
          ortb2: {
            source: {
              tid: 'source-tid'
            },
            device: {
              geo: {
                lat: '36.5189',
                lon: '-76.4063'
              }
            },
            user: {
              geo: {
                lat: '26.8915',
                lon: '-56.6340'
              }
            },
          }
        });
        let data = JSON.parse(request.data);
  		  expect(data.at).to.equal(1); // auction type
  		  expect(data.cur[0]).to.equal('USD'); // currency
  		  expect(data.site.domain).to.be.a('string'); // domain should be set
  		  expect(data.site.page).to.equal(bidRequests[0].params.kadpageurl); // forced pageURL
  		  expect(data.site.publisher.id).to.equal(bidRequests[0].params.publisherId); // publisher Id
  		  expect(data.user.yob).to.equal(parseInt(bidRequests[0].params.yob)); // YOB
  		  expect(data.user.gender).to.equal(bidRequests[0].params.gender); // Gender
  		  expect(data.device.geo.lat).to.equal('36.5189'); // Latitude
  		  expect(data.device.geo.lon).to.equal('-76.4063'); // Lognitude
  		  expect(data.user.geo.lat).to.equal('26.8915'); // Latitude
  		  expect(data.user.geo.lon).to.equal('-56.6340'); // Lognitude
  		  expect(data.ext.wrapper.wv).to.equal($$REPO_AND_VERSION$$); // Wrapper Version
  		  expect(data.ext.wrapper.transactionId).to.equal(bidRequests[0].ortb2Imp.ext.tid); // Prebid TransactionId
        expect(data.source.tid).to.equal('source-tid'); // Prebid TransactionId
  		  expect(data.ext.wrapper.wiid).to.equal(bidRequests[0].params.wiid); // OpenWrap: Wrapper Impression ID
  		  expect(data.ext.wrapper.profile).to.equal(parseInt(bidRequests[0].params.profId)); // OpenWrap: Wrapper Profile ID
  		  expect(data.ext.wrapper.version).to.equal(parseInt(bidRequests[0].params.verId)); // OpenWrap: Wrapper Profile Version ID

  		  expect(data.imp[0].id).to.equal(bidRequests[0].bidId); // Prebid bid id is passed as id
  		  expect(data.imp[0].bidfloor).to.equal(parseFloat(bidRequests[0].params.kadfloor)); // kadfloor
  		  expect(data.imp[0].tagid).to.equal('/15671365/DMDemo'); // tagid
  		  expect(data.imp[0].banner.w).to.equal(300); // width
  		  expect(data.imp[0].banner.h).to.equal(250); // height
        expect(data.imp[0].ext.gpid).to.equal(bidRequests[0].ortb2Imp.ext.gpid);
  		  expect(data.imp[0].ext.pmZoneId).to.equal(bidRequests[0].params.pmzoneid.split(',').slice(0, 50).map(id => id.trim()).join()); // pmzoneid
        expect(data.imp[0].ext.key_val).to.exist.and.to.equal(bidRequests[0].params.dctr);
        expect(data.imp[0].bidfloorcur).to.equal(bidRequests[0].params.currency);
        expect(data.source.ext.schain).to.deep.equal(bidRequests[0].schain);
        expect(data.ext.epoch).to.exist;
        expect(data.imp[0].displaymanager).to.equal('Prebid.js');
        expect(data.imp[0].displaymanagerver).to.equal('$prebid.version$');
  		});

      it('Set tmax from global config if not set by requestBids method', function() {
        let sandbox = sinon.sandbox.create();
        sandbox.stub(config, 'getConfig').callsFake((key) => {
			  var config = {
            bidderTimeout: 3000
			  };
			  return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
			  auctionId: 'new-auction-id', timeout: 3000
        });
        let data = JSON.parse(request.data);
        expect(data.tmax).to.deep.equal(3000);
        sandbox.restore();
      });
      describe('Marketplace parameters', function() {
        let bidderSettingStub;
        beforeEach(function() {
          bidderSettingStub = sinon.stub(bidderSettings, 'get');
        });

        afterEach(function() {
          bidderSettingStub.restore();
        });

        it('should not be present when allowAlternateBidderCodes is undefined', function () {
          bidderSettingStub.returns(undefined);
          let request = spec.buildRequests(bidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          expect(data.ext.marketplace).to.equal(undefined);
        });

        it('should be pubmatic and groupm when allowedAlternateBidderCodes is \'groupm\'', function () {
          bidderSettingStub.withArgs('pubmatic', 'allowAlternateBidderCodes').returns(true);
          bidderSettingStub.withArgs('pubmatic', 'allowedAlternateBidderCodes').returns(['groupm']);
          let request = spec.buildRequests(bidRequests, {
            auctionId: 'new-auction-id',
            bidderCode: 'pubmatic'
          });
          let data = JSON.parse(request.data);
          expect(data.ext.marketplace.allowedbidders).to.be.an('array');
          expect(data.ext.marketplace.allowedbidders.length).to.equal(2);
          expect(data.ext.marketplace.allowedbidders[0]).to.equal('pubmatic');
          expect(data.ext.marketplace.allowedbidders[1]).to.equal('groupm');
        });

        it('should be ALL by default', function () {
          bidderSettingStub.returns(true);
          let request = spec.buildRequests(bidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          expect(data.ext.marketplace.allowedbidders).to.be.an('array');
          expect(data.ext.marketplace.allowedbidders[0]).to.equal('all');
        });

        it('should be ALL when allowedAlternateBidderCodes is \'*\'', function () {
          bidderSettingStub.withArgs('pubmatic', 'allowAlternateBidderCodes').returns(true);
          bidderSettingStub.withArgs('pubmatic', 'allowedAlternateBidderCodes').returns(['*']);
          let request = spec.buildRequests(bidRequests, {
            auctionId: 'new-auction-id',
            bidderCode: 'pubmatic'
          });
          let data = JSON.parse(request.data);
          expect(data.ext.marketplace.allowedbidders).to.be.an('array');
          expect(data.ext.marketplace.allowedbidders[0]).to.equal('all');
        });
      })

      it('Set content from config, set site.content', function() {
        let sandbox = sinon.sandbox.create();
        const content = {
          'id': 'alpha-numeric-id'
        };
        sandbox.stub(config, 'getConfig').callsFake((key) => {
          var config = {
            content: content
          };
          return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.site.content).to.deep.equal(content);
        sandbox.restore();
      });

      it('Merge the device info from config', function() {
        let sandbox = sinon.sandbox.create();
        sandbox.stub(config, 'getConfig').callsFake((key) => {
          var config = {
            device: {
              'newkey': 'new-device-data'
            }
          };
          return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.device.js).to.equal(1);
        expect(data.device.dnt).to.equal((navigator.doNotTrack == 'yes' || navigator.doNotTrack == '1' || navigator.msDoNotTrack == '1') ? 1 : 0);
        expect(data.device.h).to.equal(screen.height);
        expect(data.device.w).to.equal(screen.width);
        expect(data.device.language).to.equal(navigator.language.split('-')[0]);
        expect(data.device.newkey).to.equal('new-device-data');// additional data from config
        sandbox.restore();
      });

      it('Merge the device info from config; data from config overrides the info we have gathered', function() {
        let sandbox = sinon.sandbox.create();
        sandbox.stub(config, 'getConfig').callsFake((key) => {
          var config = {
            device: {
              newkey: 'new-device-data',
              language: 'MARATHI'
            }
          };
          return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.device.js).to.equal(1);
        expect(data.device.dnt).to.equal((navigator.doNotTrack == 'yes' || navigator.doNotTrack == '1' || navigator.msDoNotTrack == '1') ? 1 : 0);
        expect(data.device.h).to.equal(screen.height);
        expect(data.device.w).to.equal(screen.width);
        expect(data.device.language).to.equal('MARATHI');// // data overriding from config
        expect(data.device.newkey).to.equal('new-device-data');// additional data from config
        sandbox.restore();
      });

      it('Set app from config, copy publisher and ext from site, unset site', function() {
        let sandbox = sinon.sandbox.create();
        sandbox.stub(config, 'getConfig').callsFake((key) => {
          var config = {
            app: {
              bundle: 'org.prebid.mobile.demoapp',
              domain: 'prebid.org'
            }
          };
          return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.app.bundle).to.equal('org.prebid.mobile.demoapp');
        expect(data.app.domain).to.equal('prebid.org');
        expect(data.app.publisher.id).to.equal(bidRequests[0].params.publisherId);
        expect(data.site).to.not.exist;
        sandbox.restore();
      });

      it('Set app, content from config, copy publisher and ext from site, unset site, config.content in app.content', function() {
        let sandbox = sinon.sandbox.create();
        const content = {
          'id': 'alpha-numeric-id'
        };
        sandbox.stub(config, 'getConfig').callsFake((key) => {
          var config = {
            content: content,
            app: {
              bundle: 'org.prebid.mobile.demoapp',
              domain: 'prebid.org'
            }
          };
          return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.app.bundle).to.equal('org.prebid.mobile.demoapp');
        expect(data.app.domain).to.equal('prebid.org');
        expect(data.app.publisher.id).to.equal(bidRequests[0].params.publisherId);
        expect(data.app.content).to.deep.equal(content);
        expect(data.site).to.not.exist;
        sandbox.restore();
      });

      it('Set app.content, content from config, copy publisher and ext from site, unset site, config.app.content in app.content', function() {
        let sandbox = sinon.sandbox.create();
        const content = {
          'id': 'alpha-numeric-id'
        };
        const appContent = {
          id: 'app-content-id-2'
        };
        sandbox.stub(config, 'getConfig').callsFake((key) => {
          var config = {
            content: content,
            app: {
              bundle: 'org.prebid.mobile.demoapp',
              domain: 'prebid.org',
              content: appContent
            }
          };
          return config[key];
        });
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.app.bundle).to.equal('org.prebid.mobile.demoapp');
        expect(data.app.domain).to.equal('prebid.org');
        expect(data.app.publisher.id).to.equal(bidRequests[0].params.publisherId);
        expect(data.app.content).to.deep.equal(appContent);
        expect(data.site).to.not.exist;
        sandbox.restore();
      });

      it('Request params check: without adSlot', function () {
        delete bidRequests[0].params.adSlot;
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id',
		  ortb2: {
            device: {
              geo: {
                lat: '36.5189',
                lon: '-76.4063'
              }
            },
            user: {
              geo: {
                lat: '26.8915',
                lon: '-56.6340'
              }
            },
          }
        });
        let data = JSON.parse(request.data);
        expect(data.at).to.equal(1); // auction type
        expect(data.cur[0]).to.equal('USD'); // currency
        expect(data.site.domain).to.be.a('string'); // domain should be set
        expect(data.site.page).to.equal(bidRequests[0].params.kadpageurl); // forced pageURL
        expect(data.site.publisher.id).to.equal(bidRequests[0].params.publisherId); // publisher Id
        expect(data.user.yob).to.equal(parseInt(bidRequests[0].params.yob)); // YOB
        expect(data.user.gender).to.equal(bidRequests[0].params.gender); // Gender
        expect(data.device.geo.lat).to.equal('36.5189'); // Latitude
        expect(data.device.geo.lon).to.equal('-76.4063'); // Lognitude
        expect(data.user.geo.lat).to.equal('26.8915'); // Latitude
        expect(data.user.geo.lon).to.equal('-56.6340'); // Lognitude
        expect(data.ext.wrapper.wv).to.equal($$REPO_AND_VERSION$$); // Wrapper Version
        expect(data.ext.wrapper.transactionId).to.equal(bidRequests[0].ortb2Imp.ext.tid); // Prebid TransactionId
        expect(data.ext.wrapper.wiid).to.equal(bidRequests[0].params.wiid); // OpenWrap: Wrapper Impression ID
        expect(data.ext.wrapper.profile).to.equal(parseInt(bidRequests[0].params.profId)); // OpenWrap: Wrapper Profile ID
        expect(data.ext.wrapper.version).to.equal(parseInt(bidRequests[0].params.verId)); // OpenWrap: Wrapper Profile Version ID

        expect(data.imp[0].id).to.equal(bidRequests[0].bidId); // Prebid bid id is passed as id
        expect(data.imp[0].bidfloor).to.equal(parseFloat(bidRequests[0].params.kadfloor)); // kadfloor
        expect(data.imp[0].tagid).to.deep.equal(undefined); // tagid
        expect(data.imp[0].banner.w).to.equal(728); // width
        expect(data.imp[0].banner.h).to.equal(90); // height
        expect(data.imp[0].banner.format).to.deep.equal([{w: 160, h: 600}]);
        expect(data.imp[0].ext.gpid).to.equal(bidRequests[0].ortb2Imp.ext.gpid);
        expect(data.imp[0].ext.key_val).to.exist.and.to.equal(bidRequests[0].params.dctr);
        expect(data.imp[0].ext.pmZoneId).to.equal(bidRequests[0].params.pmzoneid.split(',').slice(0, 50).map(id => id.trim()).join()); // pmzoneid
        expect(data.imp[0].bidfloorcur).to.equal(bidRequests[0].params.currency);
      });

      it('Request params multi size format object check', function () {
        let bidRequests = [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '301',
              adSlot: '/15671365/DMDemo@300x250:0',
              kadfloor: '1.2',
              pmzoneid: 'aabc, ddef',
              kadpageurl: 'www.publisher.com',
              yob: '1986',
              gender: 'M',
              lat: '12.3',
              lon: '23.7',
              wiid: '1234567890',
              profId: '100',
              verId: '200',
              currency: 'AUD'
            },
            placementCode: '/19968336/header-bid-tag-1',
            bidId: '23acc48ad47af5',
            requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
            bidderRequestId: '1c56ad30b9b8ca8',
            transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
            mediaTypes: {
              banner: {
				  sizes: [[728, 90], [160, 600]],
				  pos: 1
              }
            }
          }
        ];
        /* case 1 - size passed in adslot */
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);

        expect(data.imp[0].banner.w).to.equal(300); // width
        expect(data.imp[0].banner.h).to.equal(250); // height

        /* case 2 - size passed in adslot as well as in sizes array */
        bidRequests[0].sizes = [[300, 600], [300, 250]];
        bidRequests[0].mediaTypes = {
          banner: {
            sizes: [[300, 600], [300, 250]]
          }
        };
        request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);

        expect(data.imp[0].banner.w).to.equal(300); // width
        expect(data.imp[0].banner.h).to.equal(250); // height

        /* case 3 - size passed in sizes but not in adslot */
        bidRequests[0].params.adSlot = '/15671365/DMDemo';
        bidRequests[0].sizes = [[300, 250], [300, 600]];
        bidRequests[0].mediaTypes = {
          banner: {
            sizes: [[300, 250], [300, 600]]
          }
        };
        request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);

        expect(data.imp[0].banner.w).to.equal(300); // width
        expect(data.imp[0].banner.h).to.equal(250); // height
        expect(data.imp[0].banner.format).exist.and.to.be.an('array');
        expect(data.imp[0].banner.format[0]).exist.and.to.be.an('object');
        expect(data.imp[0].banner.format[0].w).to.equal(300); // width
        expect(data.imp[0].banner.format[0].h).to.equal(600); // height
      });

      it('Request params currency check', function () {
        let multipleBidRequests = [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '301',
              adSlot: '/15671365/DMDemo@300x250:0',
              kadfloor: '1.2',
              pmzoneid: 'aabc, ddef',
              kadpageurl: 'www.publisher.com',
              yob: '1986',
              gender: 'M',
              lat: '12.3',
              lon: '23.7',
              wiid: '1234567890',
              profId: '100',
              verId: '200',
              currency: 'AUD'
            },
            placementCode: '/19968336/header-bid-tag-1',
            sizes: [[300, 250], [300, 600]],
            bidId: '23acc48ad47af5',
            requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
            bidderRequestId: '1c56ad30b9b8ca8',
            transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
            mediaTypes: {
              banner: {
				  sizes: [[728, 90], [160, 600]],
				  pos: 1
              }
			  }
          },
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '301',
              adSlot: '/15671365/DMDemo@300x250:0',
              kadfloor: '1.2',
              pmzoneid: 'aabc, ddef',
              kadpageurl: 'www.publisher.com',
              yob: '1986',
              gender: 'M',
              lat: '12.3',
              lon: '23.7',
              wiid: '1234567890',
              profId: '100',
              verId: '200',
              currency: 'GBP'
            },
            placementCode: '/19968336/header-bid-tag-1',
            sizes: [[300, 250], [300, 600]],
            bidId: '23acc48ad47af5',
            requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
            bidderRequestId: '1c56ad30b9b8ca8',
            transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
            mediaTypes: {
              banner: {
				  sizes: [[728, 90], [160, 600]],
				  pos: 1
              }
			  }
          }
        ];

        /* case 1 -
            currency specified in both adunits
            output: imp[0] and imp[1] both use currency specified in bidRequests[0].params.currency

        */
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);

        expect(data.imp[0].bidfloorcur).to.equal(bidRequests[0].params.currency);
        expect(data.imp[1].bidfloorcur).to.equal(bidRequests[0].params.currency);

        /* case 2 -
            currency specified in only 1st adunit
            output: imp[0] and imp[1] both use currency specified in bidRequests[0].params.currency

        */
        delete multipleBidRequests[1].params.currency;
        request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);
        expect(data.imp[0].bidfloorcur).to.equal(bidRequests[0].params.currency);
        expect(data.imp[1].bidfloorcur).to.equal(bidRequests[0].params.currency);

        /* case 3 -
            currency specified in only 1st adunit
            output: imp[0] and imp[1] both use default currency - USD

        */
        delete multipleBidRequests[0].params.currency;
        request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);
        expect(data.imp[0].bidfloorcur).to.equal('USD');
        expect(data.imp[1].bidfloorcur).to.equal('USD');

        /* case 4 -
            currency not specified in 1st adunit but specified in 2nd adunit
            output: imp[0] and imp[1] both use default currency - USD

        */
        multipleBidRequests[1].params.currency = 'AUD';
        request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);
        expect(data.imp[0].bidfloorcur).to.equal('USD');
        expect(data.imp[1].bidfloorcur).to.equal('USD');
      });

      it('Pass auctiondId as wiid if wiid is not passed in params', function () {
        let bidRequest = {
          auctionId: 'new-auction-id',
		  ortb2: {
            device: {
              geo: {
                lat: '36.5189',
                lon: '-76.4063'
              }
            },
            user: {
              geo: {
                lat: '26.8915',
                lon: '-56.6340'
              }
            },
          }
        };
        delete bidRequests[0].params.wiid;
        let request = spec.buildRequests(bidRequests, bidRequest);
        let data = JSON.parse(request.data);
        expect(data.at).to.equal(1); // auction type
        expect(data.cur[0]).to.equal('USD'); // currency
        expect(data.site.domain).to.be.a('string'); // domain should be set
        expect(data.site.page).to.equal(bidRequests[0].params.kadpageurl); // forced pageURL
        expect(data.site.publisher.id).to.equal(bidRequests[0].params.publisherId); // publisher Id
        expect(data.user.yob).to.equal(parseInt(bidRequests[0].params.yob)); // YOB
        expect(data.user.gender).to.equal(bidRequests[0].params.gender); // Gender
        expect(data.device.geo.lat).to.equal('36.5189'); // Latitude
  		  expect(data.device.geo.lon).to.equal('-76.4063'); // Lognitude
  		  expect(data.user.geo.lat).to.equal('26.8915'); // Latitude
  		  expect(data.user.geo.lon).to.equal('-56.6340'); // Lognitude
        expect(data.ext.wrapper.wv).to.equal($$REPO_AND_VERSION$$); // Wrapper Version
        expect(data.ext.wrapper.transactionId).to.equal(bidRequests[0].ortb2Imp.ext.tid); // Prebid TransactionId
        expect(data.ext.wrapper.wiid).to.equal('new-auction-id'); // OpenWrap: Wrapper Impression ID
        expect(data.ext.wrapper.profile).to.equal(parseInt(bidRequests[0].params.profId)); // OpenWrap: Wrapper Profile ID
        expect(data.ext.wrapper.version).to.equal(parseInt(bidRequests[0].params.verId)); // OpenWrap: Wrapper Profile Version ID

        expect(data.imp[0].id).to.equal(bidRequests[0].bidId); // Prebid bid id is passed as id
        expect(data.imp[0].bidfloor).to.equal(parseFloat(bidRequests[0].params.kadfloor)); // kadfloor
        expect(data.imp[0].tagid).to.equal('/15671365/DMDemo'); // tagid
        expect(data.imp[0].banner.w).to.equal(300); // width
        expect(data.imp[0].banner.h).to.equal(250); // height
        expect(data.imp[0].ext.gpid).to.equal(bidRequests[0].ortb2Imp.ext.gpid);
        expect(data.imp[0].ext.pmZoneId).to.equal(bidRequests[0].params.pmzoneid.split(',').slice(0, 50).map(id => id.trim()).join()); // pmzoneid
      });

      it('Request params check with GDPR Consent', function () {
        let bidRequest = {
          gdprConsent: {
            consentString: 'kjfdniwjnifwenrif3',
            gdprApplies: true
          },
		  ortb2: {
            device: {
              geo: {
                lat: '36.5189',
                lon: '-76.4063'
              }
            },
            user: {
              geo: {
                lat: '26.8915',
                lon: '-56.6340'
              }
            },
          }
        };
  		  let request = spec.buildRequests(bidRequests, bidRequest);
  		  let data = JSON.parse(request.data);
        expect(data.user.ext.consent).to.equal('kjfdniwjnifwenrif3');
        expect(data.regs.ext.gdpr).to.equal(1);
  		  expect(data.at).to.equal(1); // auction type
  		  expect(data.cur[0]).to.equal('USD'); // currency
  		  expect(data.site.domain).to.be.a('string'); // domain should be set
  		  expect(data.site.page).to.equal(bidRequests[0].params.kadpageurl); // forced pageURL
  		  expect(data.site.publisher.id).to.equal(bidRequests[0].params.publisherId); // publisher Id
  		  expect(data.user.yob).to.equal(parseInt(bidRequests[0].params.yob)); // YOB
  		  expect(data.user.gender).to.equal(bidRequests[0].params.gender); // Gender
  		  expect(data.device.geo.lat).to.equal('36.5189'); // Latitude
  		  expect(data.device.geo.lon).to.equal('-76.4063'); // Lognitude
  		  expect(data.user.geo.lat).to.equal('26.8915'); // Latitude
  		  expect(data.user.geo.lon).to.equal('-56.6340'); // Lognitude
  		  expect(data.ext.wrapper.wv).to.equal($$REPO_AND_VERSION$$); // Wrapper Version
  		  expect(data.ext.wrapper.transactionId).to.equal(bidRequests[0].ortb2Imp.ext.tid); // Prebid TransactionId
  		  expect(data.ext.wrapper.wiid).to.equal(bidRequests[0].params.wiid); // OpenWrap: Wrapper Impression ID
        expect(data.ext.wrapper.profile).to.equal(parseInt(bidRequests[0].params.profId)); // OpenWrap: Wrapper Profile ID
  		  expect(data.ext.wrapper.version).to.equal(parseInt(bidRequests[0].params.verId)); // OpenWrap: Wrapper Profile Version ID

  		  expect(data.imp[0].id).to.equal(bidRequests[0].bidId); // Prebid bid id is passed as id
  		  expect(data.imp[0].bidfloor).to.equal(parseFloat(bidRequests[0].params.kadfloor)); // kadfloor
  		  expect(data.imp[0].tagid).to.equal('/15671365/DMDemo'); // tagid
        expect(data.imp[0].ext.gpid).to.equal(bidRequests[0].ortb2Imp.ext.gpid);
  		  expect(data.imp[0].banner.w).to.equal(300); // width
  		  expect(data.imp[0].banner.h).to.equal(250); // height
  		  expect(data.imp[0].ext.pmZoneId).to.equal(bidRequests[0].params.pmzoneid.split(',').slice(0, 50).map(id => id.trim()).join()); // pmzoneid
  		});

      it('Request params check with USP/CCPA Consent', function () {
        let bidRequest = {
          uspConsent: '1NYN',
		  ortb2: {
            device: {
              geo: {
                lat: '36.5189',
                lon: '-76.4063'
              }
            },
            user: {
              geo: {
                lat: '26.8915',
                lon: '-56.6340'
              }
            },
          }
        };
        let request = spec.buildRequests(bidRequests, bidRequest);
        let data = JSON.parse(request.data);
        expect(data.regs.ext.us_privacy).to.equal('1NYN');// USP/CCPAs
        expect(data.at).to.equal(1); // auction type
        expect(data.cur[0]).to.equal('USD'); // currency
        expect(data.site.domain).to.be.a('string'); // domain should be set
        expect(data.site.page).to.equal(bidRequests[0].params.kadpageurl); // forced pageURL
        expect(data.site.publisher.id).to.equal(bidRequests[0].params.publisherId); // publisher Id
        expect(data.user.yob).to.equal(parseInt(bidRequests[0].params.yob)); // YOB
        expect(data.user.gender).to.equal(bidRequests[0].params.gender); // Gender
        expect(data.device.geo.lat).to.equal('36.5189'); // Latitude
  		  expect(data.device.geo.lon).to.equal('-76.4063'); // Lognitude
  		  expect(data.user.geo.lat).to.equal('26.8915'); // Latitude
  		  expect(data.user.geo.lon).to.equal('-56.6340'); // Lognitude
        expect(data.ext.wrapper.wv).to.equal($$REPO_AND_VERSION$$); // Wrapper Version
        expect(data.ext.wrapper.transactionId).to.equal(bidRequests[0].ortb2Imp.ext.tid); // Prebid TransactionId
        expect(data.ext.wrapper.wiid).to.equal(bidRequests[0].params.wiid); // OpenWrap: Wrapper Impression ID
        expect(data.ext.wrapper.profile).to.equal(parseInt(bidRequests[0].params.profId)); // OpenWrap: Wrapper Profile ID
        expect(data.ext.wrapper.version).to.equal(parseInt(bidRequests[0].params.verId)); // OpenWrap: Wrapper Profile Version ID

        expect(data.imp[0].id).to.equal(bidRequests[0].bidId); // Prebid bid id is passed as id
        expect(data.imp[0].bidfloor).to.equal(parseFloat(bidRequests[0].params.kadfloor)); // kadfloor
        expect(data.imp[0].tagid).to.equal('/15671365/DMDemo'); // tagid
        expect(data.imp[0].banner.w).to.equal(300); // width
        expect(data.imp[0].banner.h).to.equal(250); // height
        expect(data.imp[0].ext.gpid).to.equal(bidRequests[0].ortb2Imp.ext.gpid);
        expect(data.imp[0].ext.pmZoneId).to.equal(bidRequests[0].params.pmzoneid.split(',').slice(0, 50).map(id => id.trim()).join()); // pmzoneid

        // second request without USP/CCPA
        let request2 = spec.buildRequests(bidRequests, {});
        let data2 = JSON.parse(request2.data);
        expect(data2.regs).to.equal(undefined);// USP/CCPAs
      });

      it('Request params should include DSA signals if present', function () {
        const dsa = {
          dsarequired: 3,
          pubrender: 0,
          datatopub: 2,
          transparency: [
            {
              domain: 'platform1domain.com',
              dsaparams: [1]
            },
            {
              domain: 'SSP2domain.com',
              dsaparams: [1, 2]
            }
          ]
        };

        let bidRequest = {
		      ortb2: {
            regs: {
              ext: {
                dsa
              }
            }
          }
        };
        let request = spec.buildRequests(bidRequests, bidRequest);
        let data = JSON.parse(request.data);
        assert.deepEqual(data.regs.ext.dsa, dsa);
      });

      it('Request params check with JW player params', function() {
        let bidRequests = [
          {
            bidder: 'pubmatic',
            params: {
              publisherId: '301',
              adSlot: '/15671365/DMDemo@300x250:0',
              dctr: 'key1=val1|key2=val2,val3'
            },
            placementCode: '/19968336/header-bid-tag-1',
            sizes: [[300, 250], [300, 600]],
            bidId: '23acc48ad47af5',
            requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
            bidderRequestId: '1c56ad30b9b8ca8',
            transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
            rtd: {
              jwplayer: {
                targeting: {
                  content: { id: 'jw_d9J2zcaA' },
                  segments: ['80011026', '80011035']
                }
              }
            },
            mediaTypes: {
              banner: {
				  sizes: [[728, 90], [160, 600]],
				  pos: 1
              }
			  }
          }];
        let key_val_output = 'key1=val1|key2=val2,val3|jw-id=jw_d9J2zcaA|jw-80011026=1|jw-80011035=1'
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.imp[0].ext).to.exist.and.to.be.an('object');
        expect(data.imp[0].ext.key_val).to.exist.and.to.equal(key_val_output);

        // jw player data not available. Only dctr sent.
        delete bidRequests[0].rtd;
        request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);

        expect(data.imp[0].ext).to.exist.and.to.be.an('object'); // dctr parameter
        expect(data.imp[0].ext.key_val).to.exist.and.to.equal(bidRequests[0].params.dctr);

        // jw player data is available, but dctr is not present
        bidRequests[0].rtd = {
          jwplayer: {
            targeting: {
              content: { id: 'jw_d9J2zcaA' },
              segments: ['80011026', '80011035']
            }
          }
        };

        delete bidRequests[0].params.dctr;
        key_val_output = 'jw-id=jw_d9J2zcaA|jw-80011026=1|jw-80011035=1';
        request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        data = JSON.parse(request.data);

        expect(data.imp[0].ext).to.exist.and.to.be.an('object');
        expect(data.imp[0].ext.key_val).to.exist.and.to.equal(key_val_output);
      });

      describe('FPD', function() {
        let newRequest;

        describe('ortb2.site should not override page, domain & ref values', function() {
          it('When above properties are present in ortb2.site', function() {
            const ortb2 = {
              site: {
                domain: 'page.example.com',
                page: 'https://page.example.com/here.html',
                ref: 'https://page.example.com/here.html'
              }
            };
            const request = spec.buildRequests(bidRequests, {ortb2});
            let data = JSON.parse(request.data);
            expect(data.site.domain).not.equal('page.example.com');
            expect(data.site.page).not.equal('https://page.example.com/here.html');
            expect(data.site.ref).not.equal('https://page.example.com/here.html');
          });

          it('When above properties are absent in ortb2.site', function () {
            const ortb2 = {
              site: {}
            };
            let request = spec.buildRequests(bidRequests, {
              auctionId: 'new-auction-id',
              ortb2
            });
            let data = JSON.parse(request.data);
            let response = spec.interpretResponse(bidResponses, request);
            expect(data.site.page).to.equal(bidRequests[0].params.kadpageurl);
            expect(data.site.domain).to.equal(_getDomainFromURL(data.site.page));
            expect(response[0].referrer).to.equal(data.site.ref);
          });

          it('With some extra properties in ortb2.site', function() {
            const ortb2 = {
              site: {
                domain: 'page.example.com',
                page: 'https://page.example.com/here.html',
                ref: 'https://page.example.com/here.html',
                cat: ['IAB2'],
                sectioncat: ['IAB2-2']
              }
            };
            const request = spec.buildRequests(bidRequests, {ortb2});
            let data = JSON.parse(request.data);
            expect(data.site.domain).not.equal('page.example.com');
            expect(data.site.page).not.equal('https://page.example.com/here.html');
            expect(data.site.ref).not.equal('https://page.example.com/here.html');
            expect(data.site.cat).to.deep.equal(['IAB2']);
            expect(data.site.sectioncat).to.deep.equal(['IAB2-2']);
          });
        });

        it('ortb2.site should be merged except page, domain & ref in the request', function() {
          const ortb2 = {
            site: {
              cat: ['IAB2'],
              sectioncat: ['IAB2-2']
            }
          };
          const request = spec.buildRequests(bidRequests, {ortb2});
          let data = JSON.parse(request.data);
          expect(data.site.cat).to.deep.equal(['IAB2']);
          expect(data.site.sectioncat).to.deep.equal(['IAB2-2']);
        });

        it('ortb2.user should be merged in the request', function() {
          const ortb2 = {
            user: {
              yob: 1985
            }
          };
          const request = spec.buildRequests(bidRequests, {ortb2});
          let data = JSON.parse(request.data);
          expect(data.user.yob).to.equal(1985);
        });

        it('ortb2.badv should be merged in the request', function() {
          const ortb2 = {
            badv: ['example.com']
          };
          const request = spec.buildRequests(bidRequests, {ortb2});
          let data = JSON.parse(request.data);
          expect(data.badv).to.deep.equal(['example.com']);
        });

        describe('ortb2Imp', function() {
          describe('ortb2Imp.ext.gpid', function() {
            beforeEach(function () {
              if (bidRequests[0].hasOwnProperty('ortb2Imp')) {
                delete bidRequests[0].ortb2Imp;
              }
            });

            it('should send gpid if imp[].ext.gpid is specified', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  gpid: 'ortb2Imp.ext.gpid'
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext).to.have.property('gpid');
              expect(data.imp[0].ext.gpid).to.equal('ortb2Imp.ext.gpid');
            });

            it('should not send if imp[].ext.gpid is not specified', function() {
              bidRequests[0].ortb2Imp = { ext: { } };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext).to.not.have.property('gpid');
            });
          });

          describe('ortb2Imp.ext.data.pbadslot', function() {
            beforeEach(function () {
              if (bidRequests[0].hasOwnProperty('ortb2Imp')) {
                delete bidRequests[0].ortb2Imp;
              }
            });

            it('should not send if imp[].ext.data object is invalid', function() {
              bidRequests[0].ortb2Imp = {
                ext: {}
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext).to.not.have.property('data');
            });

            it('should not send if imp[].ext.data.pbadslot is undefined', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              if (data.imp[0].ext.data) {
                expect(data.imp[0].ext.data).to.not.have.property('pbadslot');
              } else {
                expect(data.imp[0].ext).to.not.have.property('data');
              }
            });

            it('should not send if imp[].ext.data.pbadslot is empty string', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                    pbadslot: ''
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              if (data.imp[0].ext.data) {
                expect(data.imp[0].ext.data).to.not.have.property('pbadslot');
              } else {
                expect(data.imp[0].ext).to.not.have.property('data');
              }
            });

            it('should send if imp[].ext.data.pbadslot is string', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                    pbadslot: 'abcd'
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext.data).to.have.property('pbadslot');
              expect(data.imp[0].ext.data.pbadslot).to.equal('abcd');
            });
          });

          describe('ortb2Imp.ext.data.adserver', function() {
            beforeEach(function () {
              if (bidRequests[0].hasOwnProperty('ortb2Imp')) {
                delete bidRequests[0].ortb2Imp;
              }
            });

            it('should not send if imp[].ext.data object is invalid', function() {
              bidRequests[0].ortb2Imp = {
                ext: {}
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext).to.not.have.property('data');
            });

            it('should not send if imp[].ext.data.adserver is undefined', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              if (data.imp[0].ext.data) {
                expect(data.imp[0].ext.data).to.not.have.property('adserver');
              } else {
                expect(data.imp[0].ext).to.not.have.property('data');
              }
            });

            it('should send', function() {
              let adSlotValue = 'abc';
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                    adserver: {
                      name: 'GAM',
                      adslot: adSlotValue
                    }
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext.data.adserver.name).to.equal('GAM');
              expect(data.imp[0].ext.data.adserver.adslot).to.equal(adSlotValue);
              expect(data.imp[0].ext.dfp_ad_unit_code).to.equal(adSlotValue);
            });
          });

          describe('ortb2Imp.ext.data.other', function() {
            beforeEach(function () {
              if (bidRequests[0].hasOwnProperty('ortb2Imp')) {
                delete bidRequests[0].ortb2Imp;
              }
            });

            it('should not send if imp[].ext.data object is invalid', function() {
              bidRequests[0].ortb2Imp = {
                ext: {}
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext).to.not.have.property('data');
            });

            it('should not send if imp[].ext.data.other is undefined', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              if (data.imp[0].ext.data) {
                expect(data.imp[0].ext.data).to.not.have.property('other');
              } else {
                expect(data.imp[0].ext).to.not.have.property('data');
              }
            });

            it('ortb2Imp.ext.data.other', function() {
              bidRequests[0].ortb2Imp = {
                ext: {
                  data: {
                    other: 1234
                  }
                }
              };
              const request = spec.buildRequests(bidRequests, {});
              let data = JSON.parse(request.data);
              expect(data.imp[0].ext.data.other).to.equal(1234);
            });
          });
        });
      });

      describe('setting imp.floor using floorModule', function() {
        /*
          Use the minimum value among floor from floorModule per mediaType
          If params.adfloor is set then take max(kadfloor, min(floors from floorModule))
          set imp.bidfloor only if it is more than 0
        */

        let newRequest;
        let floorModuleTestData;
        let getFloor = function(req) {
          // actual getFloor module does not work like this :)
          // special treatment for banner since for other mediaTypes we pass *
          if (req.mediaType === 'banner') {
            return floorModuleTestData[req.mediaType][ req.size[0] + 'x' + req.size[1] ] || {};
          }
          return floorModuleTestData[req.mediaType] || {};
        };

        beforeEach(() => {
          floorModuleTestData = {
            'banner': {
              '300x250': {
                'currency': 'USD',
                'floor': 1.50
              },
              '300x600': {
                'currency': 'USD',
                'floor': 2.0
              }
            },
            'video': {
              'currency': 'USD',
              'floor': 2.50
            },
            'native': {
              'currency': 'USD',
              'floor': 3.50
            }
          };
          newRequest = utils.deepClone(bannerVideoAndNativeBidRequests);
          newRequest[0].getFloor = getFloor;
        });

        it('bidfloor should be undefined if calculation is <= 0', function() {
          floorModuleTestData.banner['300x250'].floor = 0; // lowest of them all
          newRequest[0].params.kadfloor = undefined;
          let request = spec.buildRequests(newRequest, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.bidfloor).to.equal(undefined);
        });

        if (FEATURES.VIDEO) {
          it('ignore floormodule o/p if floor is not number', function() {
            floorModuleTestData.banner['300x250'].floor = 'Not-a-Number';
            floorModuleTestData.banner['300x600'].floor = 'Not-a-Number';
            newRequest[0].params.kadfloor = undefined;
            let request = spec.buildRequests(newRequest, {
              auctionId: 'new-auction-id'
            });
            let data = JSON.parse(request.data);
            data = data.imp[0];
            expect(data.bidfloor).to.equal(2.5); // video will be lowest now
          });

          it('ignore floormodule o/p if currency is not matched', function() {
            floorModuleTestData.banner['300x250'].currency = 'INR';
            floorModuleTestData.banner['300x600'].currency = 'INR';
            newRequest[0].params.kadfloor = undefined;
            let request = spec.buildRequests(newRequest, {
              auctionId: 'new-auction-id'
            });
            let data = JSON.parse(request.data);
            data = data.imp[0];
            expect(data.bidfloor).to.equal(2.5); // video will be lowest now
          });
        }

        it('kadfloor is not passed, use minimum from floorModule', function() {
          newRequest[0].params.kadfloor = undefined;
          let request = spec.buildRequests(newRequest, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.bidfloor).to.equal(1.5);
        });

        it('should use mediatype specific floor for multiformat request', function() {
          newRequest[0].params.kadfloor = undefined;
          let request = spec.buildRequests(newRequest, {
			  auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
		  expect(data.bidfloor).to.equal(1.50);
		  expect(data.native.ext.bidfloor).to.equal(3.50);
        });

        it('should use delete granular floor if impression level floor is same as granular level', function() {
          newRequest[0].params.kadfloor = undefined;
          let request = spec.buildRequests(newRequest, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.bidfloor).to.equal(1.50);
          expect(data.bidfloorcur).to.equal('USD');
          expect(data.banner.ext).to.equal(undefined);
          expect(data.native.ext.bidfloor).to.equal(3.50);
		  });

        it('kadfloor is passed as 3, use kadfloor as it is highest', function() {
          newRequest[0].params.kadfloor = '3.0';// yes, we want it as a string
          let request = spec.buildRequests(newRequest, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.bidfloor).to.equal(3);
        });

        it('kadfloor is passed as 1, use min of floorModule as it is highest', function() {
          newRequest[0].params.kadfloor = '1.0';// yes, we want it as a string
          let request = spec.buildRequests(newRequest, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.bidfloor).to.equal(1.5);
        });
      });

      it('should NOT include coppa flag in bid request if coppa config is not present', () => {
        const request = spec.buildRequests(bidRequests, {});
        let data = JSON.parse(request.data);
        if (data.regs) {
          // in case GDPR is set then data.regs will exist
          expect(data.regs.coppa).to.equal(undefined);
        } else {
          expect(data.regs).to.equal(undefined);
        }
      });

      it('should include coppa flag in bid request if coppa is set to true', () => {
        let sandbox = sinon.sandbox.create();
        sandbox.stub(config, 'getConfig').callsFake(key => {
          const config = {
            'coppa': true
          };
          return config[key];
        });
        const request = spec.buildRequests(bidRequests, {});
        let data = JSON.parse(request.data);
        expect(data.regs.coppa).to.equal(1);
        sandbox.restore();
      });

      it('should NOT include coppa flag in bid request if coppa is set to false', () => {
        let sandbox = sinon.sandbox.create();
        sandbox.stub(config, 'getConfig').callsFake(key => {
          const config = {
            'coppa': false
          };
          return config[key];
        });
        const request = spec.buildRequests(bidRequests, {});
        let data = JSON.parse(request.data);
        if (data.regs) {
          // in case GDPR is set then data.regs will exist
          expect(data.regs.coppa).to.equal(undefined);
        } else {
          expect(data.regs).to.equal(undefined);
        }
        sandbox.restore();
      });

      describe('userIdAsEids', function() {
        let sandbox;
        beforeEach(() => {
          sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('Request should have EIDs', function() {
          bidRequests[0].userId = {};
          bidRequests[0].userId.tdid = 'TTD_ID_FROM_USER_ID_MODULE';
          bidRequests[0].userIdAsEids = [{
            'source': 'adserver.org',
            'uids': [{
              'id': 'TTD_ID_FROM_USER_ID_MODULE',
              'atype': 1,
              'ext': {
                'rtiPartner': 'TDID'
              }
            }]
          }];
          let request = spec.buildRequests(bidRequests, {});
          let data = JSON.parse(request.data);
          expect(data.user.eids).to.deep.equal(bidRequests[0].userIdAsEids);
        });

        it('Request should NOT have EIDs userIdAsEids is NOT object', function() {
          let request = spec.buildRequests(bidRequests, {});
          let data = JSON.parse(request.data);
          expect(data.user.eids).to.deep.equal(undefined);
        });
      });

	  it('should pass device.sua if present in bidderRequest fpd ortb2 object', function () {
        const suaObject = {'source': 2, 'platform': {'brand': 'macOS', 'version': ['12', '4', '0']}, 'browsers': [{'brand': 'Not_A Brand', 'version': ['99', '0', '0', '0']}, {'brand': 'Google Chrome', 'version': ['109', '0', '5414', '119']}, {'brand': 'Chromium', 'version': ['109', '0', '5414', '119']}], 'mobile': 0, 'model': '', 'bitness': '64', 'architecture': 'x86'};
        let request = spec.buildRequests(multipleMediaRequests, {
          auctionId: 'new-auction-id',
		  ortb2: {
            device: {
              sua: suaObject
            }
		  }
        });
        let data = JSON.parse(request.data);
        expect(data.device.sua).to.exist.and.to.be.an('object');
        expect(data.device.sua).to.deep.equal(suaObject);
      });

      it('should pass device.ext.cdep if present in bidderRequest fpd ortb2 object', function () {
        const cdepObj = {
          cdep: 'example_label_1'
        };
        let request = spec.buildRequests(multipleMediaRequests, {
          auctionId: 'new-auction-id',
          ortb2: {
            device: {
              ext: cdepObj
            }
          }
        });
        let data = JSON.parse(request.data);
        expect(data.device.ext.cdep).to.exist.and.to.be.an('string');
        expect(data.device.ext).to.deep.equal(cdepObj);
      });

      it('should pass enriched device data from ortb2 object if present in bidderRequest fpd', function () {
        const fpdBidderRequest = {
          auctionId: 'new-auction-id',
          ortb2: {
            device: {
              w: 980,
              h: 1720,
              dnt: 0,
              ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1',
              language: 'en',
              devicetype: 1,
              make: 'Apple',
              model: 'iPhone 12 Pro Max',
              os: 'iOS',
              osv: '17.4',
            }
          },
        };

        const request = spec.buildRequests(multipleMediaRequests, fpdBidderRequest);
        const data = JSON.parse(request.data);

        expect(data.device.w).to.equal(fpdBidderRequest.ortb2.device.w);
        expect(data.device.h).to.equal(fpdBidderRequest.ortb2.device.h);
        expect(data.device.dnt).to.equal(fpdBidderRequest.ortb2.device.dnt);
        expect(data.device.ua).to.equal(fpdBidderRequest.ortb2.device.ua);
        expect(data.device.language).to.equal(fpdBidderRequest.ortb2.device.language);
        expect(data.device.devicetype).to.equal(fpdBidderRequest.ortb2.device.devicetype);
        expect(data.device.make).to.equal(fpdBidderRequest.ortb2.device.make);
        expect(data.device.model).to.equal(fpdBidderRequest.ortb2.device.model);
        expect(data.device.os).to.equal(fpdBidderRequest.ortb2.device.os);
        expect(data.device.osv).to.equal(fpdBidderRequest.ortb2.device.osv);
      });

      it('Request params should have valid native bid request for all valid params', function () {
        let request = spec.buildRequests(nativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.imp[0].native).to.exist;
        expect(data.imp[0].native['request']).to.exist;
        expect(data.imp[0].tagid).to.equal('/43743431/NativeAutomationPrebid');
        expect(data.imp[0]['native']['request']).to.exist.and.to.be.an('string');
        expect(data.imp[0]['native']['request']).to.exist.and.to.equal(validnativeBidImpression.native.request);
      });

      it('Request params should not have valid native bid request for non native request', function () {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.imp[0].native).to.not.exist;
      });

      it('Request params should have valid native bid request with valid required param values for all valid params', function () {
        let request = spec.buildRequests(nativeBidRequestsWithRequiredParam, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.imp[0].native).to.exist;
        expect(data.imp[0].native['request']).to.exist;
        expect(data.imp[0].tagid).to.equal('/43743431/NativeAutomationPrebid');
        expect(data.imp[0]['native']['request']).to.exist.and.to.be.an('string');
        expect(data.imp[0]['native']['request']).to.exist.and.to.equal(validnativeBidImpressionWithRequiredParam.native.request);
      });

      it('Request params should have valid native bid request for all native params', function () {
        let request = spec.buildRequests(nativeBidRequestsWithAllParams, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.imp[0].native).to.exist;
        expect(data.imp[0].native['request']).to.exist;
        expect(data.imp[0].tagid).to.equal('/43743431/NativeAutomationPrebid');
        expect(data.imp[0]['native']['request']).to.exist.and.to.be.an('string');
        expect(data.imp[0]['native']['request']).to.exist.and.to.equal(validnativeBidImpressionWithAllParams.native.request);
      });

      it('Request params - should handle banner and native format in single adunit', function() {
        let request = spec.buildRequests(bannerAndNativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        data = data.imp[0];

        expect(data.banner).to.exist;
        expect(data.banner.w).to.equal(300);
        expect(data.banner.h).to.equal(250);
        expect(data.banner.format).to.exist;
        expect(data.banner.format.length).to.equal(bannerAndNativeBidRequests[0].mediaTypes.banner.sizes.length);

        expect(data.native).to.exist;
        expect(data.native.request).to.exist;
      });

      it('Request params - banner and native multiformat request - should have native object incase of invalid config present', function() {
        bannerAndNativeBidRequests[0].mediaTypes.native = {
          title: { required: true },
          image: { required: true },
          sponsoredBy: { required: true },
          clickUrl: { required: true }
        };
        bannerAndNativeBidRequests[0].nativeParams = {
          title: { required: true },
          image: { required: true },
          sponsoredBy: { required: true },
          clickUrl: { required: true }
        }
        let request = spec.buildRequests(bannerAndNativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        data = data.imp[0];

        expect(data.banner).to.exist;
        expect(data.native).to.exist;
      });

      it('Request params - should not add banner object if mediaTypes.banner is missing, but adunits.sizes is present', function() {
        delete bannerAndNativeBidRequests[0].mediaTypes.banner;
        bannerAndNativeBidRequests[0].sizes = [729, 90];

        let request = spec.buildRequests(bannerAndNativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        data = data.imp[0];

        expect(data.banner).to.not.exist;

        expect(data.native).to.exist;
        expect(data.native.request).to.exist;
      });

      if (FEATURES.VIDEO) {
        it('Request params - should not contain banner imp if mediaTypes.banner is not present and sizes is specified in bid.sizes', function() {
          delete bannerAndVideoBidRequests[0].mediaTypes.banner;
          bannerAndVideoBidRequests[0].params.sizes = [300, 250];

          let request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.banner).to.not.exist;
        });

        it('Request params check for 1 banner and 1 video ad', function () {
          let request = spec.buildRequests(multipleMediaRequests, {
            auctionId: 'new-auction-id',
            ortb2: {
              device: {
				  geo: {
                  lat: '36.5189',
                  lon: '-76.4063'
				  }
              },
              user: {
				  geo: {
                  lat: '26.8915',
                  lon: '-56.6340'
				  }
              },
			  }
          });
          let data = JSON.parse(request.data);

          expect(data.imp).to.be.an('array')
          expect(data.imp).with.length.above(1);

          expect(data.at).to.equal(1); // auction type
          expect(data.cur[0]).to.equal('USD'); // currency
          expect(data.site.domain).to.be.a('string'); // domain should be set
          expect(data.site.page).to.equal(multipleMediaRequests[0].params.kadpageurl); // forced pageURL
          expect(data.site.publisher.id).to.equal(multipleMediaRequests[0].params.publisherId); // publisher Id
          expect(data.user.yob).to.equal(parseInt(multipleMediaRequests[0].params.yob)); // YOB
          expect(data.user.gender).to.equal(multipleMediaRequests[0].params.gender); // Gender
          expect(data.device.geo.lat).to.equal('36.5189'); // Latitude
  		    expect(data.device.geo.lon).to.equal('-76.4063'); // Lognitude
  		    expect(data.user.geo.lat).to.equal('26.8915'); // Latitude
  		    expect(data.user.geo.lon).to.equal('-56.6340'); // Lognitude
          expect(data.ext.wrapper.wv).to.equal($$REPO_AND_VERSION$$); // Wrapper Version
          expect(data.ext.wrapper.transactionId).to.equal(multipleMediaRequests[0].transactionId); // Prebid TransactionId
          expect(data.ext.wrapper.wiid).to.equal(multipleMediaRequests[0].params.wiid); // OpenWrap: Wrapper Impression ID
          expect(data.ext.wrapper.profile).to.equal(parseInt(multipleMediaRequests[0].params.profId)); // OpenWrap: Wrapper Profile ID
          expect(data.ext.wrapper.version).to.equal(parseInt(multipleMediaRequests[0].params.verId)); // OpenWrap: Wrapper Profile Version ID

          // banner imp object check
          expect(data.imp[0].id).to.equal(multipleMediaRequests[0].bidId); // Prebid bid id is passed as id
          expect(data.imp[0].bidfloor).to.equal(parseFloat(multipleMediaRequests[0].params.kadfloor)); // kadfloor
          expect(data.imp[0].tagid).to.equal('/15671365/DMDemo'); // tagid
          expect(data.imp[0].banner.w).to.equal(300); // width
          expect(data.imp[0].banner.h).to.equal(250); // height
          expect(data.imp[0].ext.pmZoneId).to.equal(multipleMediaRequests[0].params.pmzoneid.split(',').slice(0, 50).map(id => id.trim()).join()); // pmzoneid

          // video imp object check
          expect(data.imp[1].video).to.exist;
          expect(data.imp[1].tagid).to.equal('Div1');
          expect(data.imp[1]['video']['mimes']).to.exist.and.to.be.an('array');
          expect(data.imp[1]['video']['mimes'][0]).to.equal(multipleMediaRequests[1].params.video['mimes'][0]);
          expect(data.imp[1]['video']['mimes'][1]).to.equal(multipleMediaRequests[1].params.video['mimes'][1]);
          expect(data.imp[1]['video']['minduration']).to.equal(multipleMediaRequests[1].params.video['minduration']);
          expect(data.imp[1]['video']['maxduration']).to.equal(multipleMediaRequests[1].params.video['maxduration']);
          expect(data.imp[1]['video']['startdelay']).to.equal(multipleMediaRequests[1].params.video['startdelay']);

          expect(data.imp[1]['video']['playbackmethod']).to.exist.and.to.be.an('array');
          expect(data.imp[1]['video']['playbackmethod'][0]).to.equal(multipleMediaRequests[1].params.video['playbackmethod'][0]);
          expect(data.imp[1]['video']['playbackmethod'][1]).to.equal(multipleMediaRequests[1].params.video['playbackmethod'][1]);

          expect(data.imp[1]['video']['api']).to.exist.and.to.be.an('array');
          expect(data.imp[1]['video']['api'][0]).to.equal(multipleMediaRequests[1].params.video['api'][0]);
          expect(data.imp[1]['video']['api'][1]).to.equal(multipleMediaRequests[1].params.video['api'][1]);

          expect(data.imp[1]['video']['protocols']).to.exist.and.to.be.an('array');
          expect(data.imp[1]['video']['protocols'][0]).to.equal(multipleMediaRequests[1].params.video['protocols'][0]);
          expect(data.imp[1]['video']['protocols'][1]).to.equal(multipleMediaRequests[1].params.video['protocols'][1]);

          expect(data.imp[1]['video']['battr']).to.exist.and.to.be.an('array');
          expect(data.imp[1]['video']['battr'][0]).to.equal(multipleMediaRequests[1].params.video['battr'][0]);
          expect(data.imp[1]['video']['battr'][1]).to.equal(multipleMediaRequests[1].params.video['battr'][1]);

          expect(data.imp[1]['video']['linearity']).to.equal(multipleMediaRequests[1].params.video['linearity']);
          expect(data.imp[1]['video']['placement']).to.equal(multipleMediaRequests[1].params.video['placement']);
          expect(data.imp[1]['video']['plcmt']).to.equal(multipleMediaRequests[1].params.video['plcmt']);
          expect(data.imp[1]['video']['minbitrate']).to.equal(multipleMediaRequests[1].params.video['minbitrate']);
          expect(data.imp[1]['video']['maxbitrate']).to.equal(multipleMediaRequests[1].params.video['maxbitrate']);

          expect(data.imp[1]['video']['w']).to.equal(multipleMediaRequests[1].mediaTypes.video.playerSize[0]);
          expect(data.imp[1]['video']['h']).to.equal(multipleMediaRequests[1].mediaTypes.video.playerSize[1]);
        });

        // ================================================
        it('Request params - should handle banner and video format in single adunit', function() {
          let request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.banner).to.exist;
          expect(data.banner.w).to.equal(300);
          expect(data.banner.h).to.equal(250);
          expect(data.banner.format).to.exist;
          expect(data.banner.format.length).to.equal(bannerAndVideoBidRequests[0].mediaTypes.banner.sizes.length);
          expect(data.banner.pos).to.equal(1);

          // Case: when size is not present in adslo
          bannerAndVideoBidRequests[0].params.adSlot = '/15671365/DMDemo';
          request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.banner).to.exist;
          expect(data.banner.w).to.equal(bannerAndVideoBidRequests[0].mediaTypes.banner.sizes[0][0]);
          expect(data.banner.h).to.equal(bannerAndVideoBidRequests[0].mediaTypes.banner.sizes[0][1]);
          expect(data.banner.format).to.exist;
          expect(data.banner.format.length).to.equal(bannerAndVideoBidRequests[0].mediaTypes.banner.sizes.length - 1);

          expect(data.video).to.exist;
          expect(data.video.w).to.equal(bannerAndVideoBidRequests[0].mediaTypes.video.playerSize[0]);
          expect(data.video.h).to.equal(bannerAndVideoBidRequests[0].mediaTypes.video.playerSize[1]);
          expect(data.video.pos).to.equal(2);
        });

        it('Request params - should handle banner, video and native format in single adunit', function() {
          let request = spec.buildRequests(bannerVideoAndNativeBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.banner).to.exist;
          expect(data.banner.w).to.equal(300);
          expect(data.banner.h).to.equal(250);
          expect(data.banner.format).to.exist;
          expect(data.banner.format.length).to.equal(bannerAndNativeBidRequests[0].mediaTypes.banner.sizes.length);
          expect(data.banner.pos).to.equal(0);

          expect(data.video).to.exist;
          expect(data.video.w).to.equal(bannerAndVideoBidRequests[0].mediaTypes.video.playerSize[0]);
          expect(data.video.h).to.equal(bannerAndVideoBidRequests[0].mediaTypes.video.playerSize[1]);

          expect(data.native).to.exist;
          expect(data.native.request).to.exist;
        });

        it('Request params - should handle video and native format in single adunit', function() {
          let request = spec.buildRequests(videoAndNativeBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.video).to.exist;
          expect(data.video.w).to.equal(bannerAndVideoBidRequests[0].mediaTypes.video.playerSize[0]);
          expect(data.video.h).to.equal(bannerAndVideoBidRequests[0].mediaTypes.video.playerSize[1]);

          expect(data.native).to.exist;
          expect(data.native.request).to.exist;
        });

        it('Request params - banner and video req in single adslot - should ignore banner imp if banner size is set to fluid and send video imp object', function () {
          /* Adslot configured for banner and video.
             banner size is set to [['fluid'], [300, 250]]
             adslot specifies a size as 300x250
             => banner imp object should have primary w and h set to 300 and 250. fluid is ignored
          */
          bannerAndVideoBidRequests[0].mediaTypes.banner.sizes = [['fluid'], [160, 600]];

          let request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.banner).to.exist;
          expect(data.banner.w).to.equal(300);
          expect(data.banner.h).to.equal(250);
          expect(data.banner.format).to.exist;
          expect(data.banner.format[0].w).to.equal(160);
          expect(data.banner.format[0].h).to.equal(600);

          /* Adslot configured for banner and video.
             banner size is set to [['fluid'], [300, 250]]
             adslot does not specify any size
             => banner imp object should have primary w and h set to 300 and 250. fluid is ignored
          */
          bannerAndVideoBidRequests[0].mediaTypes.banner.sizes = [['fluid'], [160, 600]];
          bannerAndVideoBidRequests[0].params.adSlot = '/15671365/DMDemo';

          request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.banner).to.exist;
          expect(data.banner.w).to.equal(160);
          expect(data.banner.h).to.equal(600);
          expect(data.banner.format).to.not.exist;

          /* Adslot configured for banner and video.
             banner size is set to [[728 90], ['fluid'], [300, 250]]
             adslot does not specify any size
             => banner imp object should have primary w and h set to 728 and 90.
                banner.format should have 300, 250 set in it
                fluid is ignore
          */

          bannerAndVideoBidRequests[0].mediaTypes.banner.sizes = [[728, 90], ['fluid'], [300, 250]];
          request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.banner).to.exist;
          expect(data.banner.w).to.equal(728);
          expect(data.banner.h).to.equal(90);
          expect(data.banner.format).to.exist;
          expect(data.banner.format[0].w).to.equal(300);
          expect(data.banner.format[0].h).to.equal(250);

          /* Adslot configured for banner and video.
             banner size is set to [['fluid']]
             adslot does not specify any size
             => banner object should not be sent in the request. only video should be sent.
          */

          bannerAndVideoBidRequests[0].mediaTypes.banner.sizes = [['fluid']];
          request = spec.buildRequests(bannerAndVideoBidRequests, {
            auctionId: 'new-auction-id'
          });
          data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.banner).to.not.exist;
          expect(data.video).to.exist;
        });

        it('Request params - video and native multiformat request - should have native object incase of invalid config present', function() {
          videoAndNativeBidRequests[0].mediaTypes.native = {
            title: { required: true },
            image: { required: true },
            sponsoredBy: { required: true },
            clickUrl: { required: true }
          };
          videoAndNativeBidRequests[0].nativeParams = {
            title: { required: true },
            image: { required: true },
            sponsoredBy: { required: true },
            clickUrl: { required: true }
          }
          let request = spec.buildRequests(videoAndNativeBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.video).to.exist;
          expect(data.native).to.exist;
        });

        it('should build video impression if video params are present in adunit.mediaTypes instead of bid.params', function() {
          let videoReq = [{
            'bidder': 'pubmatic',
            'params': {
              'adSlot': 'SLOT_NHB1@728x90',
              'publisherId': '5890',
            },
            'mediaTypes': {
              'video': {
                'playerSize': [
                  [640, 480]
                ],
                'protocols': [1, 2, 5],
                'context': 'instream',
                'mimes': ['video/flv'],
                'skip': 1,
                'linearity': 2
              }
            },
            'adUnitCode': 'video1',
            'transactionId': 'adc36682-887c-41e9-9848-8b72c08332c0',
            'sizes': [
              [640, 480]
            ],
            'bidId': '21b59b1353ba82',
            'bidderRequestId': '1a08245305e6dd',
            'auctionId': 'bad3a743-7491-4d19-9a96-b0a69dd24a67',
            'src': 'client',
            'bidRequestsCount': 1,
            'bidderRequestsCount': 1,
            'bidderWinsCount': 0
          }]
          let request = spec.buildRequests(videoReq, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];
          expect(data.video).to.exist;
        });

        it('should build video impression with overwriting video params present in adunit.mediaTypes with bid.params', function() {
          let videoReq = [{
            'bidder': 'pubmatic',
            'params': {
              'adSlot': 'SLOT_NHB1@728x90',
              'publisherId': '5890',
              'video': {
                'mimes': ['video/mp4'],
                'protocols': [1, 2, 5],
                'linearity': 1
              }
            },
            'mediaTypes': {
              'video': {
                'playerSize': [
                  [640, 480]
                ],
                'protocols': [1, 2, 5],
                'context': 'instream',
                'mimes': ['video/flv'],
                'skip': 1,
                'linearity': 2
              }
            },
            'adUnitCode': 'video1',
            'transactionId': 'adc36682-887c-41e9-9848-8b72c08332c0',
            'sizes': [
              [640, 480]
            ],
            'bidId': '21b59b1353ba82',
            'bidderRequestId': '1a08245305e6dd',
            'auctionId': 'bad3a743-7491-4d19-9a96-b0a69dd24a67',
            'src': 'client',
            'bidRequestsCount': 1,
            'bidderRequestsCount': 1,
            'bidderWinsCount': 0
          }]
          let request = spec.buildRequests(videoReq, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          data = data.imp[0];

          expect(data.video).to.exist;
          expect(data.video.linearity).to.equal(1);
        });

        it('Request params check for video ad', function () {
          let request = spec.buildRequests(videoBidRequests, {
            auctionId: 'new-auction-id'
          });
          let data = JSON.parse(request.data);
          expect(data.imp[0].video).to.exist;
          expect(data.imp[0].tagid).to.equal('Div1');
          expect(data.imp[0]['video']['mimes']).to.exist.and.to.be.an('array');
          expect(data.imp[0]['video']['mimes'][0]).to.equal(videoBidRequests[0].params.video['mimes'][0]);
          expect(data.imp[0]['video']['mimes'][1]).to.equal(videoBidRequests[0].params.video['mimes'][1]);
          expect(data.imp[0]['video']['minduration']).to.equal(videoBidRequests[0].params.video['minduration']);
          expect(data.imp[0]['video']['maxduration']).to.equal(videoBidRequests[0].params.video['maxduration']);
          expect(data.imp[0]['video']['startdelay']).to.equal(videoBidRequests[0].params.video['startdelay']);

          expect(data.imp[0]['video']['playbackmethod']).to.exist.and.to.be.an('array');
          expect(data.imp[0]['video']['playbackmethod'][0]).to.equal(videoBidRequests[0].params.video['playbackmethod'][0]);
          expect(data.imp[0]['video']['playbackmethod'][1]).to.equal(videoBidRequests[0].params.video['playbackmethod'][1]);

          expect(data.imp[0]['video']['api']).to.exist.and.to.be.an('array');
          expect(data.imp[0]['video']['api'][0]).to.equal(videoBidRequests[0].params.video['api'][0]);
          expect(data.imp[0]['video']['api'][1]).to.equal(videoBidRequests[0].params.video['api'][1]);

          expect(data.imp[0]['video']['protocols']).to.exist.and.to.be.an('array');
          expect(data.imp[0]['video']['protocols'][0]).to.equal(videoBidRequests[0].params.video['protocols'][0]);
          expect(data.imp[0]['video']['protocols'][1]).to.equal(videoBidRequests[0].params.video['protocols'][1]);

          expect(data.imp[0]['video']['battr']).to.exist.and.to.be.an('array');
          expect(data.imp[0]['video']['battr'][0]).to.equal(videoBidRequests[0].params.video['battr'][0]);
          expect(data.imp[0]['video']['battr'][1]).to.equal(videoBidRequests[0].params.video['battr'][1]);

          expect(data.imp[0]['video']['linearity']).to.equal(videoBidRequests[0].params.video['linearity']);
          expect(data.imp[0]['video']['placement']).to.equal(videoBidRequests[0].params.video['placement']);
          expect(data.imp[0]['video']['plcmt']).to.equal(videoBidRequests[0].params.video['plcmt']);
          expect(data.imp[0]['video']['minbitrate']).to.equal(videoBidRequests[0].params.video['minbitrate']);
          expect(data.imp[0]['video']['maxbitrate']).to.equal(videoBidRequests[0].params.video['maxbitrate']);

          expect(data.imp[0]['video']['w']).to.equal(videoBidRequests[0].mediaTypes.video.playerSize[0]);
          expect(data.imp[0]['video']['h']).to.equal(videoBidRequests[0].mediaTypes.video.playerSize[1]);
        });
      }

      describe('GPP', function() {
        it('Request params check with GPP Consent', function () {
          let bidRequest = {
            gppConsent: {
              'gppString': 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN',
              'fullGppData': {
                'sectionId': 3,
                'gppVersion': 1,
                'sectionList': [
                  5,
                  7
                ],
                'applicableSections': [
                  5
                ],
                'gppString': 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN',
                'pingData': {
                  'cmpStatus': 'loaded',
                  'gppVersion': '1.0',
                  'cmpDisplayStatus': 'visible',
                  'supportedAPIs': [
                    'tcfca',
                    'usnat',
                    'usca',
                    'usva',
                    'usco',
                    'usut',
                    'usct'
                  ],
                  'cmpId': 31
                },
                'eventName': 'sectionChange'
              },
              'applicableSections': [
                5
              ],
              'apiVersion': 1
            }
          };
          let request = spec.buildRequests(bidRequests, bidRequest);
          let data = JSON.parse(request.data);
          expect(data.regs.gpp).to.equal('DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN');
          expect(data.regs.gpp_sid[0]).to.equal(5);
        });

        it('Request params check without GPP Consent', function () {
          let bidRequest = {};
          let request = spec.buildRequests(bidRequests, bidRequest);
          let data = JSON.parse(request.data);
          expect(data.regs).to.equal(undefined);
        });

        it('Request params check with GPP Consent read from ortb2', function () {
          let bidRequest = {
            ortb2: {
              regs: {
                'gpp': 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN',
                'gpp_sid': [
                  5
                ]
              }
            }
          };
          let request = spec.buildRequests(bidRequests, bidRequest);
          let data = JSON.parse(request.data);
          expect(data.regs.gpp).to.equal('DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN');
          expect(data.regs.gpp_sid[0]).to.equal(5);
        });
      });

      describe('Fledge', function() {
        it('should not send imp.ext.ae when FLEDGE is disabled, ', function () {
          let bidRequest = Object.assign([], bidRequests);
          bidRequest[0].ortb2Imp = {
            ext: { ae: 1 }
          };
          const req = spec.buildRequests(bidRequest, { ...bidRequest, paapi: {enabled: false} });
          let data = JSON.parse(req.data);
          if (data.imp[0].ext) {
            expect(data.imp[0].ext).to.not.have.property('ae');
          }
        });

        it('when FLEDGE is enabled, should send whatever is set in ortb2imp.ext.ae in all bid requests', function () {
          let bidRequest = Object.assign([], bidRequests);
          delete bidRequest[0].params.test;
          bidRequest[0].ortb2Imp = {
            ext: { ae: 1 }
          };
          const req = spec.buildRequests(bidRequest, { ...bidRequest, paapi: {enabled: true} });
          let data = JSON.parse(req.data);
          expect(data.imp[0].ext.ae).to.equal(1);
        });
      });

      it('should send connectiontype parameter if browser contains navigator.connection property', function () {
        const bidRequest = spec.buildRequests(bidRequests);
        let data = JSON.parse(bidRequest.data);
        if (window.navigator && window.navigator.connection) {
          expect(data.device).to.include.any.keys('connectiontype');
        }
      });

      it('should send imp.pmp in request if pmp json is present in adUnit ortb2Imp object', function () {
        let originalBidRequests = utils.deepClone(bidRequests);
        originalBidRequests[0].ortb2Imp.pmp = {
          'private_auction': 0,
          'deals': [{ 'id': '5678' }]
        }
        const bidRequest = spec.buildRequests(originalBidRequests);
        let data = JSON.parse(bidRequest.data);
        expect(data.imp[0].pmp).to.exist.and.to.be.an('object');
      })

      it('should not send imp.pmp in request if pmp json is not present in adUnit ortb2Imp object', function () {
        let originalBidRequests = utils.deepClone(bidRequests);
        const bidRequest = spec.buildRequests(originalBidRequests);
        let data = JSON.parse(bidRequest.data);
        expect(data.imp[0].pmp).to.deep.equal(undefined);
      })
  	});

    it('Request params dctr check', function () {
      let multipleBidRequests = [
        {
          bidder: 'pubmatic',
          params: {
            publisherId: '301',
            adSlot: '/15671365/DMDemo@300x250:0',
            dctr: 'key1=val1|key2=val2,!val3'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
        },
        {
          bidder: 'pubmatic',
          params: {
            publisherId: '301',
            adSlot: '/15671365/DMDemo@300x250:0',
            kadfloor: '1.2',
            pmzoneid: 'aabc, ddef',
            kadpageurl: 'www.publisher.com',
            yob: '1986',
            gender: 'M',
            lat: '12.3',
            lon: '23.7',
            wiid: '1234567890',
            profId: '100',
            verId: '200',
            currency: 'GBP',
            dctr: 'key1=val3|key2=val1,!val3|key3=val123'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
        }
      ];

      let request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      let data = JSON.parse(request.data);

      /* case 1 -
        dctr is found in adunit[0]
      */

      expect(data.imp[0].ext).to.exist.and.to.be.an('object'); // dctr parameter
      expect(data.imp[0].ext.key_val).to.exist.and.to.equal(multipleBidRequests[0].params.dctr);

      /* case 2 -
        dctr not present in adunit[0] but present in adunit[1]
      */
      delete multipleBidRequests[0].params.dctr;
      request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      data = JSON.parse(request.data);

      expect(data.imp[0].ext).to.exist.and.to.deep.equal({});
      expect(data.imp[1].ext).to.exist.and.to.be.an('object'); // dctr parameter
      expect(data.imp[1].ext.key_val).to.exist.and.to.equal(multipleBidRequests[1].params.dctr);

      /* case 3 -
        dctr is present in adunit[0], but is not a string value
      */
      multipleBidRequests[0].params.dctr = 123;
      request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      data = JSON.parse(request.data);

      expect(data.imp[0].ext).to.exist.and.to.deep.equal({});
    });

    it('Request params deals check', function () {
      let multipleBidRequests = [
        {
          bidder: 'pubmatic',
          params: {
            publisherId: '301',
            adSlot: '/15671365/DMDemo@300x250:0',
            kadfloor: '1.2',
            pmzoneid: 'aabc, ddef',
            kadpageurl: 'www.publisher.com',
            yob: '1986',
            gender: 'M',
            lat: '12.3',
            lon: '23.7',
            wiid: '1234567890',
            profId: '100',
            verId: '200',
            currency: 'AUD',
            deals: ['deal-id-1', 'deal-id-2', 'dea'] // "dea" will not be passed as more than 3 characters needed
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
        },
        {
          bidder: 'pubmatic',
          params: {
            publisherId: '301',
            adSlot: '/15671365/DMDemo@300x250:0',
            kadfloor: '1.2',
            pmzoneid: 'aabc, ddef',
            kadpageurl: 'www.publisher.com',
            yob: '1986',
            gender: 'M',
            lat: '12.3',
            lon: '23.7',
            wiid: '1234567890',
            profId: '100',
            verId: '200',
            currency: 'GBP',
            deals: ['deal-id-100', 'deal-id-200']
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
        }
      ];

      let request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      let data = JSON.parse(request.data);
      // case 1 - deals are passed as expected, ['', ''] , in both adUnits
      expect(data.imp[0].pmp).to.deep.equal({
        'private_auction': 0,
        'deals': [
          {
            'id': 'deal-id-1'
          },
          {
            'id': 'deal-id-2'
          }
        ]
      });
      expect(data.imp[1].pmp).to.deep.equal({
        'private_auction': 0,
        'deals': [
          {
            'id': 'deal-id-100'
          },
          {
            'id': 'deal-id-200'
          }
        ]
      });

      // case 2 - deals not present in adunit[0]
      delete multipleBidRequests[0].params.deals;
      request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      data = JSON.parse(request.data);
      expect(data.imp[0].pmp).to.not.exist;

      // case 3 - deals is present in adunit[0], but is not an array
      multipleBidRequests[0].params.deals = 123;
      request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      data = JSON.parse(request.data);
      expect(data.imp[0].pmp).to.not.exist;

      // case 4 - deals is present in adunit[0] as an array but one of the value is not a string
      multipleBidRequests[0].params.deals = [123, 'deal-id-1'];
      request = spec.buildRequests(multipleBidRequests, {
        auctionId: 'new-auction-id'
      });
      data = JSON.parse(request.data);
      expect(data.imp[0].pmp).to.deep.equal({
        'private_auction': 0,
        'deals': [
          {
            'id': 'deal-id-1'
          }
        ]
      });
    });

    describe('Request param acat checking', function() {
      let multipleBidRequests = [
		  {
          bidder: 'pubmatic',
          params: {
			  publisherId: '301',
			  adSlot: '/15671365/DMDemo@300x250:0',
			  kadfloor: '1.2',
			  pmzoneid: 'aabc, ddef',
			  kadpageurl: 'www.publisher.com',
			  yob: '1986',
			  gender: 'M',
			  lat: '12.3',
			  lon: '23.7',
			  wiid: '1234567890',
			  profId: '100',
			  verId: '200',
			  currency: 'AUD',
			  dctr: 'key1=val1|key2=val2,!val3'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
		  },
		  {
          bidder: 'pubmatic',
          params: {
			  publisherId: '301',
			  adSlot: '/15671365/DMDemo@300x250:0',
			  kadfloor: '1.2',
			  pmzoneid: 'aabc, ddef',
			  kadpageurl: 'www.publisher.com',
			  yob: '1986',
			  gender: 'M',
			  lat: '12.3',
			  lon: '23.7',
			  wiid: '1234567890',
			  profId: '100',
			  verId: '200',
			  currency: 'GBP',
			  dctr: 'key1=val3|key2=val1,!val3|key3=val123'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
		  }
      ];

      it('acat: pass only strings', function() {
		  multipleBidRequests[0].params.acat = [1, 2, 3, 'IAB1', 'IAB2'];
		  let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
		  });
		  let data = JSON.parse(request.data);
		  expect(data.ext.acat).to.exist.and.to.deep.equal(['IAB1', 'IAB2']);
      });

	  it('acat: trim the strings', function() {
        multipleBidRequests[0].params.acat = ['   IAB1    ', '   IAB2   '];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.ext.acat).to.exist.and.to.deep.equal(['IAB1', 'IAB2']);
      });

	  it('acat: pass only unique strings', function() {
        multipleBidRequests[0].params.acat = ['IAB1', 'IAB2', 'IAB1', 'IAB2', 'IAB1', 'IAB2'];
        multipleBidRequests[1].params.acat = ['IAB1', 'IAB2', 'IAB1', 'IAB2', 'IAB1', 'IAB3'];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.ext.acat).to.exist.and.to.deep.equal(['IAB1', 'IAB2', 'IAB3']);
      });
      it('ortb2.ext.prebid.bidderparams.pubmatic.acat should be passed in request payload', function() {
        const ortb2 = {
          ext: {
            prebid: {
              bidderparams: {
                pubmatic: {
                  acat: ['IAB1', 'IAB2', 'IAB1', 'IAB2', 'IAB1', 'IAB2']
                }
              }
            }
          }
        };
        const request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id',
          bidderCode: 'pubmatic',
          ortb2
        });
        let data = JSON.parse(request.data);
        expect(data.ext.acat).to.deep.equal(['IAB1', 'IAB2']);
      });
    });

    describe('Request param bcat checking', function() {
      let multipleBidRequests = [
        {
          bidder: 'pubmatic',
          params: {
            publisherId: '301',
            adSlot: '/15671365/DMDemo@300x250:0',
            kadfloor: '1.2',
            pmzoneid: 'aabc, ddef',
            kadpageurl: 'www.publisher.com',
            yob: '1986',
            gender: 'M',
            lat: '12.3',
            lon: '23.7',
            wiid: '1234567890',
            profId: '100',
            verId: '200',
            currency: 'AUD',
            dctr: 'key1=val1|key2=val2,!val3'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
        },
        {
          bidder: 'pubmatic',
          params: {
            publisherId: '301',
            adSlot: '/15671365/DMDemo@300x250:0',
            kadfloor: '1.2',
            pmzoneid: 'aabc, ddef',
            kadpageurl: 'www.publisher.com',
            yob: '1986',
            gender: 'M',
            lat: '12.3',
            lon: '23.7',
            wiid: '1234567890',
            profId: '100',
            verId: '200',
            currency: 'GBP',
            dctr: 'key1=val3|key2=val1,!val3|key3=val123'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: '23acc48ad47af5',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          transactionId: '92489f71-1bf2-49a0-adf9-000cea934729',
		  mediaTypes: {
            banner: {
			  sizes: [[728, 90], [160, 600]],
			  pos: 1
            }
		  }
        }
      ];

      it('bcat: pass only strings', function() {
        multipleBidRequests[0].params.bcat = [1, 2, 3, 'IAB1', 'IAB2'];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.bcat).to.exist.and.to.deep.equal(['IAB1', 'IAB2']);
      });

      it('bcat: pass strings with length greater than 3', function() {
        multipleBidRequests[0].params.bcat = ['AB', 'CD', 'IAB1', 'IAB2'];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.bcat).to.exist.and.to.deep.equal(['IAB1', 'IAB2']);
      });

      it('bcat: trim the strings', function() {
        multipleBidRequests[0].params.bcat = ['   IAB1    ', '   IAB2   '];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.bcat).to.exist.and.to.deep.equal(['IAB1', 'IAB2']);
      });

      it('bcat: pass only unique strings', function() {
        // multi slot
        multipleBidRequests[0].params.bcat = ['IAB1', 'IAB2', 'IAB1', 'IAB2', 'IAB1', 'IAB2'];
        multipleBidRequests[1].params.bcat = ['IAB1', 'IAB2', 'IAB1', 'IAB2', 'IAB1', 'IAB3'];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.bcat).to.exist.and.to.deep.equal(['IAB1', 'IAB2', 'IAB3']);
      });

      it('bcat: do not pass bcat if all entries are invalid', function() {
        // multi slot
        multipleBidRequests[0].params.bcat = ['', 'IAB', 'IAB'];
        multipleBidRequests[1].params.bcat = ['    ', 22, 99999, 'IA'];
        let request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.bcat).to.deep.equal(undefined);
      });

	  it('ortb2.bcat should merged with slot level bcat param', function() {
        multipleBidRequests[0].params.bcat = ['IAB-1', 'IAB-2'];
        const ortb2 = {
          bcat: ['IAB-3', 'IAB-4']
        };
        const request = spec.buildRequests(multipleBidRequests, {
          auctionId: 'new-auction-id',
          bidderCode: 'pubmatic',
          ortb2
        });
        let data = JSON.parse(request.data);
        expect(data.bcat).to.deep.equal(['IAB-1', 'IAB-2', 'IAB-3', 'IAB-4']);
      });
    });

    describe('Response checking', function () {
      it('should check for valid response values', function () {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        let response = spec.interpretResponse(bidResponses, request);
        expect(response).to.be.an('array').with.length.above(0);
        expect(response[0].requestId).to.equal(bidResponses.body.seatbid[0].bid[0].impid);
        expect(response[0].cpm).to.equal(parseFloat((bidResponses.body.seatbid[0].bid[0].price).toFixed(2)));
        expect(response[0].width).to.equal(bidResponses.body.seatbid[0].bid[0].w);
        expect(response[0].height).to.equal(bidResponses.body.seatbid[0].bid[0].h);
        if (bidResponses.body.seatbid[0].bid[0].crid) {
          expect(response[0].creativeId).to.equal(bidResponses.body.seatbid[0].bid[0].crid);
        } else {
          expect(response[0].creativeId).to.equal(bidResponses.body.seatbid[0].bid[0].id);
        }
        expect(response[0].dealId).to.equal(bidResponses.body.seatbid[0].bid[0].dealid);
        expect(response[0].currency).to.equal('USD');
        expect(response[0].netRevenue).to.equal(true);
        expect(response[0].ttl).to.equal(360);
        expect(response[0].meta.networkId).to.equal(123);
        expect(response[0].adserverTargeting.hb_buyid_pubmatic).to.equal('BUYER-ID-987');
        expect(response[0].meta.buyerId).to.equal('seat-id');
        expect(response[0].meta.dchain).to.equal('dchain');
        expect(response[0].meta.clickUrl).to.equal('blackrock.com');
        expect(response[0].meta.advertiserDomains[0]).to.equal('blackrock.com');
        expect(response[0].referrer).to.include(data.site.ref);
        expect(response[0].ad).to.equal(bidResponses.body.seatbid[0].bid[0].adm);
        expect(response[0].pm_seat).to.equal(bidResponses.body.seatbid[0].seat);
        expect(response[0].pm_dspid).to.equal(bidResponses.body.seatbid[0].bid[0].ext.dspid);
        expect(response[0].partnerImpId).to.equal(bidResponses.body.seatbid[0].bid[0].id);

        expect(response[1].requestId).to.equal(bidResponses.body.seatbid[1].bid[0].impid);
        expect(response[1].cpm).to.equal(parseFloat((bidResponses.body.seatbid[1].bid[0].price).toFixed(2)));
        expect(response[1].width).to.equal(bidResponses.body.seatbid[1].bid[0].w);
        expect(response[1].height).to.equal(bidResponses.body.seatbid[1].bid[0].h);
        if (bidResponses.body.seatbid[1].bid[0].crid) {
          expect(response[1].creativeId).to.equal(bidResponses.body.seatbid[1].bid[0].crid);
        } else {
          expect(response[1].creativeId).to.equal(bidResponses.body.seatbid[1].bid[0].id);
        }
        expect(response[1].dealId).to.equal(bidResponses.body.seatbid[1].bid[0].dealid);
        expect(response[1].currency).to.equal('USD');
        expect(response[1].netRevenue).to.equal(true);
        expect(response[1].ttl).to.equal(360);
        expect(response[1].meta.networkId).to.equal(422);
        expect(response[1].adserverTargeting.hb_buyid_pubmatic).to.equal('BUYER-ID-789');
        expect(response[1].meta.buyerId).to.equal(832);
        expect(response[1].meta.clickUrl).to.equal('hivehome.com');
        expect(response[1].meta.advertiserDomains[0]).to.equal('hivehome.com');
        expect(response[1].referrer).to.include(data.site.ref);
        expect(response[1].ad).to.equal(bidResponses.body.seatbid[1].bid[0].adm);
        expect(response[1].pm_seat).to.equal(bidResponses.body.seatbid[1].seat || null);
        expect(response[1].pm_dspid).to.equal(bidResponses.body.seatbid[1].bid[0].ext.dspid);
        expect(response[0].partnerImpId).to.equal(bidResponses.body.seatbid[0].bid[0].id);
      });

      it('should check for dealChannel value selection', function () {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let response = spec.interpretResponse(bidResponses, request);
        expect(response).to.be.an('array').with.length.above(0);
        expect(response[0].dealChannel).to.equal('PMPG');
        expect(response[1].dealChannel).to.equal('PREF');
      });

      it('should check for unexpected dealChannel value selection', function () {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let updateBiResponse = bidResponses;
        updateBiResponse.body.seatbid[0].bid[0].ext.deal_channel = 11;

        let response = spec.interpretResponse(updateBiResponse, request);

        expect(response).to.be.an('array').with.length.above(0);
        expect(response[0].dealChannel).to.equal(null);
      });

      it('should have a valid native bid response', function() {
        let request = spec.buildRequests(nativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        data.imp[0].id = '2a5571261281d4';
        request.data = JSON.stringify(data);
        let response = spec.interpretResponse(nativeBidResponse, request);
        let assets = response[0].native.ortb.assets;
        expect(response).to.be.an('array').with.length.above(0);
        expect(response[0].native).to.exist.and.to.be.an('object');
        expect(response[0].mediaType).to.exist.and.to.equal('native');
        expect(assets).to.be.an('array').with.length.above(0);
        expect(assets[0].title).to.exist.and.to.be.an('object');
        expect(assets[1].img).to.exist.and.to.be.an('object');
        expect(assets[1].img.url).to.exist.and.to.be.an('string');
        expect(assets[1].img.h).to.exist;
        expect(assets[1].img.w).to.exist;
        expect(assets[2].data).to.exist.and.to.be.an('object');
      });

      it('should check for valid banner mediaType in case of multiformat request', function() {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let response = spec.interpretResponse(bannerBidResponse, request);

        expect(response[0].mediaType).to.equal('banner');
      });

      it('should check for valid native mediaType in case of multiformat request', function() {
        let request = spec.buildRequests(nativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let response = spec.interpretResponse(nativeBidResponse, request);

        expect(response[0].mediaType).to.equal('native');
      });

      it('should not assign renderer if bid is native', function() {
        let request = spec.buildRequests(nativeBidRequests, {
          auctionId: 'new-auction-id'
        });
        let response = spec.interpretResponse(nativeBidResponse, request);
        expect(response[0].renderer).to.not.exist;
      });

      it('should not assign renderer if bid is of banner', function() {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let response = spec.interpretResponse(bidResponses, request);
        expect(response[0].renderer).to.not.exist;
      });

      it('should set ibv field in bid.ext when bid.ext.ibv exists', function() {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });

        let copyOfBidResponse = utils.deepClone(bannerBidResponse);
        let bidExt = utils.deepClone(copyOfBidResponse.body.seatbid[0].bid[0].ext);
        copyOfBidResponse.body.seatbid[0].bid[0].ext = Object.assign(bidExt, {
          ibv: true
        });

        let response = spec.interpretResponse(copyOfBidResponse, request);
        expect(response[0].ext.ibv).to.equal(true);
        expect(response[0].meta.mediaType).to.equal('video');
      });

      it('should not set ibv field when bid.ext does not exist ', function() {
        let request = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });

        let response = spec.interpretResponse(bannerBidResponse, request);
        expect(response[0].ext).to.not.exist;
        expect(response[0].meta).to.exist;
        expect(response[0].meta.mediaType).to.equal('banner');
      });

      if (FEATURES.VIDEO) {
        it('should check for valid video mediaType in case of multiformat request', function() {
          let request = spec.buildRequests(videoBidRequests, {
            auctionId: 'new-auction-id'
          });
          let response = spec.interpretResponse(videoBidResponse, request);
          expect(response[0].mediaType).to.equal('video');
        });

        it('should assign renderer if bid is video and request is for outstream', function() {
          let request = spec.buildRequests(outstreamBidRequest, validOutstreamBidRequest);
          let response = spec.interpretResponse(outstreamVideoBidResponse, request);
          expect(response[0].renderer).to.exist;
        });

        it('should not assign renderer if bidderRequest is not present', function() {
          let request = spec.buildRequests(outstreamBidRequest, {
            auctionId: 'new-auction-id'
          });
          let response = spec.interpretResponse(outstreamVideoBidResponse, request);
          expect(response[0].renderer).to.not.exist;
        });

        it('should not assign renderer if bid is video and request is for instream', function() {
          let request = spec.buildRequests(videoBidRequests, {
            auctionId: 'new-auction-id'
          });
          let response = spec.interpretResponse(videoBidResponse, request);
          expect(response[0].renderer).to.not.exist;
        });

        it('should assign mediaType by reading bid.ext.mediaType', function() {
          let newvideoRequests = [{
            'bidder': 'pubmatic',
            'params': {
              'adSlot': 'SLOT_NHB1@728x90',
              'publisherId': '5670',
              'video': {
                'mimes': ['video/mp4'],
                'skippable': true,
                'protocols': [1, 2, 5],
                'linearity': 1
              }
            },
            'mediaTypes': {
              'video': {
                'playerSize': [
                  [640, 480]
                ],
                'protocols': [1, 2, 5],
                'context': 'instream',
                'mimes': ['video/flv'],
                'skippable': false,
                'skip': 1,
                'linearity': 2
              }
            },
            'adUnitCode': 'video1',
            'transactionId': '803e3750-0bbe-4ffe-a548-b6eca15087bf',
            'sizes': [
              [640, 480]
            ],
            'bidId': '2c95df014cfe97',
            'bidderRequestId': '1fe59391566442',
            'auctionId': '3a4118ef-fb96-4416-b0b0-3cfc1cebc142',
            'src': 'client',
            'bidRequestsCount': 1,
            'bidderRequestsCount': 1,
            'bidderWinsCount': 0
          }];
          let newvideoBidResponses = {
            'body': {
              'id': '1621441141473',
              'cur': 'USD',
              'customdata': 'openrtb1',
              'ext': {
                'buyid': 'myBuyId'
              },
              'seatbid': [{
                'bid': [{
                  'id': '2c95df014cfe97',
                  'impid': '2c95df014cfe97',
                  'price': 4.2,
                  'cid': 'test1',
                  'crid': 'test2',
                  'adm': "<VAST version='3.0'><Ad id='601364'><InLine><AdSystem>Acudeo Compatible</AdSystem><AdTitle>VAST 2.0 Instream Test 1</AdTitle><Description>VAST 2.0 Instream Test 1</Description><Creatives><Creative AdID='601364'><Linear skipoffset='20%'><TrackingEvents><Tracking event='close'><![CDATA[https://mytracking.com/linear/close]]></Tracking><Tracking event='skip'><![CDATA[https://mytracking.com/linear/skip]]></Tracking><MediaFiles><MediaFile delivery='progressive' type='video/mp4' bitrate='500' width='400' height='300' scalable='true' maintainAspectRatio='true'><![CDATA[https://localhost/pubmatic.mp4]]></MediaFile></MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>",
                  'w': 0,
                  'h': 0,
                  'dealId': 'ASEA-MS-KLY-TTD-DESKTOP-ID-VID-6S-030420',
                  'ext': {
                    'bidtype': 1
                  }
                }],
                'ext': {
                  'buyid': 'myBuyId'
                }
              }]
            },
            'headers': {}
          }
          let newrequest = spec.buildRequests(newvideoRequests, {
            auctionId: 'new-auction-id'
          });
          let newresponse = spec.interpretResponse(newvideoBidResponses, newrequest);
          expect(newresponse[0].mediaType).to.equal('video')
        })

        it('should assign mediaType even if bid.ext.mediaType does not exists', function() {
          let newvideoRequests = [{
            'bidder': 'pubmatic',
            'params': {
              'adSlot': 'SLOT_NHB1@728x90',
              'publisherId': '5670',
              'video': {
                'mimes': ['video/mp4'],
                'skippable': true,
                'protocols': [1, 2, 5],
                'linearity': 1
              }
            },
            'mediaTypes': {
              'video': {
                'playerSize': [
                  [640, 480]
                ],
                'protocols': [1, 2, 5],
                'context': 'instream',
                'mimes': ['video/flv'],
                'skippable': false,
                'skip': 1,
                'linearity': 2
              }
            },
            'adUnitCode': 'video1',
            'transactionId': '803e3750-0bbe-4ffe-a548-b6eca15087bf',
            'sizes': [
              [640, 480]
            ],
            'bidId': '2c95df014cfe97',
            'bidderRequestId': '1fe59391566442',
            'auctionId': '3a4118ef-fb96-4416-b0b0-3cfc1cebc142',
            'src': 'client',
            'bidRequestsCount': 1,
            'bidderRequestsCount': 1,
            'bidderWinsCount': 0
          }];
          let newvideoBidResponses = {
            'body': {
              'id': '1621441141473',
              'cur': 'USD',
              'customdata': 'openrtb1',
              'ext': {
                'buyid': 'myBuyId'
              },
              'seatbid': [{
                'bid': [{
                  'id': '2c95df014cfe97',
                  'impid': '2c95df014cfe97',
                  'price': 4.2,
                  'cid': 'test1',
                  'crid': 'test2',
                  'adm': "<VAST version='3.0'><Ad id='601364'><InLine><AdSystem>Acudeo Compatible</AdSystem><AdTitle>VAST 2.0 Instream Test 1</AdTitle><Description>VAST 2.0 Instream Test 1</Description><Creatives><Creative AdID='601364'><Linear skipoffset='20%'><TrackingEvents><Tracking event='close'><![CDATA[https://mytracking.com/linear/close]]></Tracking><Tracking event='skip'><![CDATA[https://mytracking.com/linear/skip]]></Tracking><MediaFiles><MediaFile delivery='progressive' type='video/mp4' bitrate='500' width='400' height='300' scalable='true' maintainAspectRatio='true'><![CDATA[https://localhost/pubmatic.mp4]]></MediaFile></MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>",
                  'w': 0,
                  'h': 0,
                  'dealId': 'ASEA-MS-KLY-TTD-DESKTOP-ID-VID-6S-030420'
                }],
                'ext': {
                  'buyid': 'myBuyId'
                }
              }]
            },
            'headers': {}
          }
          let newrequest = spec.buildRequests(newvideoRequests, {
            auctionId: 'new-auction-id'
          });
          let newresponse = spec.interpretResponse(newvideoBidResponses, newrequest);
          expect(newresponse[0].mediaType).to.equal('video')
        });
      }
    });

    describe('Fledge Auction config Response', function () {
      let response;
      let bidRequestConfigs = [
        {
          bidder: 'pubmatic',
          mediaTypes: {
            banner: {
              sizes: [[728, 90], [160, 600]]
            }
          },
          params: {
            publisherId: '5670',
            adSlot: '/15671365/DMDemo@300x250:0',
            kadfloor: '1.2',
            pmzoneid: 'aabc, ddef',
            kadpageurl: 'www.publisher.com',
            yob: '1986',
            gender: 'M',
            lat: '12.3',
            lon: '23.7',
            wiid: '1234567890',
            profId: '100',
            verId: '200',
            currency: 'AUD',
            dctr: 'key1:val1,val2|key2:val1'
          },
          placementCode: '/19968336/header-bid-tag-1',
          sizes: [[300, 250], [300, 600]],
          bidId: 'test_bid_id',
          requestId: '0fb4905b-9456-4152-86be-c6f6d259ba99',
          bidderRequestId: '1c56ad30b9b8ca8',
          ortb2Imp: {
            ext: {
              tid: '92489f71-1bf2-49a0-adf9-000cea934729',
              ae: 1
            }
          },
        }
      ];

      let bidRequest = spec.buildRequests(bidRequestConfigs, {});
      let bidResponse = {
        seatbid: [{
          bid: [{
            impid: 'test_bid_id',
            price: 2,
            w: 728,
            h: 250,
            crid: 'test-creative-id',
            dealid: 'test-deal-id',
            adm: 'test-ad-markup'
          }]
        }],
        cur: 'AUS',
        ext: {
          fledge_auction_configs: {
            'test_bid_id': {
              seller: 'ads.pubmatic.com',
              interestGroupBuyers: ['dsp1.com'],
              sellerTimeout: 0,
              perBuyerSignals: {
                'dsp1.com': {
                  bid_macros: 0.1,
                  disallowed_adv_ids: [
                    '5678',
                    '5890'
                  ],
                }
              }
            }
          }
        }
      };

      response = spec.interpretResponse({ body: bidResponse }, bidRequest);
      it('should return FLEDGE auction_configs alongside bids', function () {
        expect(response).to.have.property('bids');
        expect(response).to.have.property('paapi');
        expect(response.paapi.length).to.equal(1);
        expect(response.paapi[0].bidId).to.equal('test_bid_id');
      });
    });

    describe('Preapare metadata', function () {
      it('Should copy all fields from ext to meta', function () {
        const dsa = {
          behalf: 'Advertiser',
          paid: 'Advertiser',
          transparency: [{
            domain: 'dsp1domain.com',
            dsaparams: [1, 2]
          }],
          adrender: 1
        };

        const bid = {
          'adomain': [
            'mystartab.com'
          ],
          cat: ['IAB_CATEGORY'],
          ext: {
            advid: '12',
            'dspid': 6,
            'deal_channel': 1,
            'bidtype': 0,
            advertiserId: 'adid',
            dsa,
            // networkName: 'nwnm',
            // primaryCatId: 'pcid',
            // advertiserName: 'adnm',
            // agencyId: 'agid',
            // agencyName: 'agnm',
            // brandId: 'brid',
            // brandName: 'brnm',
            // dchain: 'dc',
            // demandSource: 'ds',
            // secondaryCatIds: ['secondaryCatIds']
          },
        };

        const br = {
          mediaType: 'video'
        };
        prepareMetaObject(br, bid, null);
        expect(br.meta.networkId).to.equal(6); // dspid
        expect(br.meta.buyerId).to.equal('12'); // adid
        expect(br.meta.advertiserId).to.equal('12');
        // expect(br.meta.networkName).to.equal('nwnm');
        expect(br.meta.primaryCatId).to.equal('IAB_CATEGORY');
        // expect(br.meta.advertiserName).to.equal('adnm');
        expect(br.meta.agencyId).to.equal('12');
        // expect(br.meta.agencyName).to.equal('agnm');
        expect(br.meta.brandId).to.equal('mystartab.com');
        // expect(br.meta.brandName).to.equal('brnm');
        // expect(br.meta.dchain).to.equal('dc');
        expect(br.meta.demandSource).to.equal(6);
        expect(br.meta.secondaryCatIds).to.be.an('array').with.length.above(0);
        expect(br.meta.secondaryCatIds[0]).to.equal('IAB_CATEGORY');
        expect(br.meta.advertiserDomains).to.be.an('array').with.length.above(0); // adomain
        expect(br.meta.clickUrl).to.equal('mystartab.com'); // adomain
        expect(br.meta.dsa).to.equal(dsa); // dsa
        expect(br.meta.mediaType).to.equal('video'); // mediaType
      });

      it('Should be empty, when ext and adomain is absent in bid object', function () {
        const bid = {};
        const br = {};
        prepareMetaObject(br, bid, null);
        expect(Object.keys(br.meta).length).to.equal(0);
      });

      it('Should be empty, when ext and adomain will not have properties', function () {
        const bid = {
          'adomain': [],
          ext: {}
        };
        const br = {};
        prepareMetaObject(br, bid, null);
        expect(Object.keys(br.meta).length).to.equal(0);
        expect(br.meta.advertiserDomains).to.equal(undefined); // adomain
        expect(br.meta.clickUrl).to.equal(undefined); // adomain
      });

      it('Should have buyerId,advertiserId, agencyId value of site ', function () {
        const bid = {
          'adomain': [],
          ext: {
            advid: '12',
          }
        };
        const br = {};
        prepareMetaObject(br, bid, '5100');
        expect(br.meta.buyerId).to.equal('5100'); // adid
        expect(br.meta.advertiserId).to.equal('5100');
        expect(br.meta.agencyId).to.equal('5100');
      });
    });

    describe('getUserSyncs', function() {
      const syncurl_iframe = 'https://ads.pubmatic.com/AdServer/js/user_sync.html?kdntuid=1&p=5670';
      const syncurl_image = 'https://image8.pubmatic.com/AdServer/ImgSync?p=5670';
      let sandbox;
      beforeEach(function () {
        sandbox = sinon.sandbox.create();
      });
      afterEach(function() {
        sandbox.restore();
      });

      it('execute as per config', function() {
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, undefined, undefined)).to.deep.equal([{
          type: 'iframe', url: syncurl_iframe
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, undefined, undefined)).to.deep.equal([{
          type: 'image', url: syncurl_image
        }]);
      });

      it('CCPA/USP', function() {
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, undefined, '1NYN')).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}&us_privacy=1NYN`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, undefined, '1NYN')).to.deep.equal([{
          type: 'image', url: `${syncurl_image}&us_privacy=1NYN`
        }]);
      });

      it('GDPR', function() {
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, {gdprApplies: true, consentString: 'foo'}, undefined)).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}&gdpr=1&gdpr_consent=foo`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, {gdprApplies: false, consentString: 'foo'}, undefined)).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}&gdpr=0&gdpr_consent=foo`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, {gdprApplies: true, consentString: undefined}, undefined)).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}&gdpr=1&gdpr_consent=`
        }]);

        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, {gdprApplies: true, consentString: 'foo'}, undefined)).to.deep.equal([{
          type: 'image', url: `${syncurl_image}&gdpr=1&gdpr_consent=foo`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, {gdprApplies: false, consentString: 'foo'}, undefined)).to.deep.equal([{
          type: 'image', url: `${syncurl_image}&gdpr=0&gdpr_consent=foo`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, {gdprApplies: true, consentString: undefined}, undefined)).to.deep.equal([{
          type: 'image', url: `${syncurl_image}&gdpr=1&gdpr_consent=`
        }]);
      });

      it('COPPA: true', function() {
        sandbox.stub(config, 'getConfig').callsFake(key => {
          const config = {
            'coppa': true
          };
          return config[key];
        });
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, undefined, undefined)).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}&coppa=1`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, undefined, undefined)).to.deep.equal([{
          type: 'image', url: `${syncurl_image}&coppa=1`
        }]);
      });

      it('COPPA: false', function() {
        sandbox.stub(config, 'getConfig').callsFake(key => {
          const config = {
            'coppa': false
          };
          return config[key];
        });
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, undefined, undefined)).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, undefined, undefined)).to.deep.equal([{
          type: 'image', url: `${syncurl_image}`
        }]);
      });

      it('GDPR + COPPA:true + CCPA/USP', function() {
        sandbox.stub(config, 'getConfig').callsFake(key => {
          const config = {
            'coppa': true
          };
          return config[key];
        });
        expect(spec.getUserSyncs({ iframeEnabled: true }, {}, {gdprApplies: true, consentString: 'foo'}, '1NYN')).to.deep.equal([{
          type: 'iframe', url: `${syncurl_iframe}&gdpr=1&gdpr_consent=foo&us_privacy=1NYN&coppa=1`
        }]);
        expect(spec.getUserSyncs({ iframeEnabled: false }, {}, {gdprApplies: true, consentString: 'foo'}, '1NYN')).to.deep.equal([{
          type: 'image', url: `${syncurl_image}&gdpr=1&gdpr_consent=foo&us_privacy=1NYN&coppa=1`
        }]);
      });

      describe('GPP', function() {
        it('should return userSync url without Gpp consent if gppConsent is undefined', () => {
          const result = spec.getUserSyncs({iframeEnabled: true}, undefined, undefined, undefined, undefined);
          expect(result).to.deep.equal([{
            type: 'iframe', url: `${syncurl_iframe}`
          }]);
        });

        it('should return userSync url without Gpp consent if gppConsent.gppString is undefined', () => {
          const gppConsent = { applicableSections: ['5'] };
          const result = spec.getUserSyncs({iframeEnabled: true}, undefined, undefined, undefined, gppConsent);
          expect(result).to.deep.equal([{
            type: 'iframe', url: `${syncurl_iframe}`
          }]);
        });

        it('should return userSync url without Gpp consent if gppConsent.applicableSections is undefined', () => {
          const gppConsent = { gppString: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN' };
          const result = spec.getUserSyncs({iframeEnabled: true}, undefined, undefined, undefined, gppConsent);
          expect(result).to.deep.equal([{
            type: 'iframe', url: `${syncurl_iframe}`
          }]);
        });

        it('should return userSync url without Gpp consent if gppConsent.applicableSections is an empty array', () => {
          const gppConsent = { gppString: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN', applicableSections: [] };
          const result = spec.getUserSyncs({iframeEnabled: true}, undefined, undefined, undefined, gppConsent);
          expect(result).to.deep.equal([{
            type: 'iframe', url: `${syncurl_iframe}`
          }]);
        });

        it('should concatenate gppString and applicableSections values in the returned userSync iframe url', () => {
          const gppConsent = { gppString: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN', applicableSections: [5] };
          const result = spec.getUserSyncs({iframeEnabled: true}, undefined, undefined, undefined, gppConsent);
          expect(result).to.deep.equal([{
            type: 'iframe', url: `${syncurl_iframe}&gpp=${encodeURIComponent(gppConsent.gppString)}&gpp_sid=${encodeURIComponent(gppConsent.applicableSections)}`
          }]);
        });

        it('should concatenate gppString and applicableSections values in the returned userSync image url', () => {
          const gppConsent = { gppString: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA~1YNN', applicableSections: [5] };
          const result = spec.getUserSyncs({iframeEnabled: false}, undefined, undefined, undefined, gppConsent);
          expect(result).to.deep.equal([{
            type: 'image', url: `${syncurl_image}&gpp=${encodeURIComponent(gppConsent.gppString)}&gpp_sid=${encodeURIComponent(gppConsent.applicableSections)}`
          }]);
        });
      });
    });

    describe('getDeviceConnectionType', function() {
      it('is a function', function(done) {
        getDeviceConnectionType.should.be.a('function');
        done();
      });

      it('should return matched value if navigator.connection is present', function(done) {
        const connectionValue = getDeviceConnectionType();
        if (window?.navigator?.connection) {
          expect(connectionValue).to.be.a('number');
        }
        done();
      });
    });

    if (FEATURES.VIDEO) {
      describe('Checking for Video.plcmt property', function() {
        let sandbox, utilsMock;
        const adUnit = 'Div1';
        const msg_placement_missing = 'Video.plcmt param missing for Div1';
        let videoData = {
          battr: [6, 7],
          skipafter: 15,
          maxduration: 50,
          context: 'instream',
          playerSize: [640, 480],
          skip: 0,
          connectiontype: [1, 2, 6],
          skipmin: 10,
          minduration: 10,
          mimes: ['video/mp4', 'video/x-flv'],
        }
        beforeEach(() => {
          utilsMock = sinon.mock(utils);
          sandbox = sinon.sandbox.create();
          sandbox.spy(utils, 'logWarn');
        });

        afterEach(() => {
          utilsMock.restore();
          sandbox.restore();
        })

        it('should log Video.plcmt param missing', function() {
          checkVideoPlacement(videoData, adUnit);
          sinon.assert.calledWith(utils.logWarn, msg_placement_missing);
        })
        it('shoud not log Video.plcmt param missing', function() {
          videoData['plcmt'] = 1;
          checkVideoPlacement(videoData, adUnit);
          sinon.assert.neverCalledWith(utils.logWarn, msg_placement_missing);
        })
      });
    }

    describe('Banner Request param battr checking', function() {
      it('should add battr params to bannerObj if present in ortb2Imp.banner', function() {
        let originalBidRequests = utils.deepClone(bidRequests);
        let bannerObj = utils.deepClone(originalBidRequests[0].ortb2Imp.banner);
        originalBidRequests[0].ortb2Imp.banner = Object.assign(bannerObj, {
          battr: [1, 2]
        });

        const req = spec.buildRequests(originalBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(req.data);
        expect(data.imp[0]['banner']['battr']).to.exist.and.to.be.an('array');
        expect(data.imp[0]['banner']['battr'][0]).to.equal(originalBidRequests[0].ortb2Imp.banner['battr'][0]);
        expect(data.imp[0]['banner']['battr'][1]).to.equal(originalBidRequests[0].ortb2Imp.banner['battr'][1]);
      });

      it('should not add battr params to bannerObj if not present in ortb2Imp.banner', function() {
        const req = spec.buildRequests(bidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(req.data);
        expect(data.imp[0]['banner']['battr']).to.equal(undefined);
      });

      it('should not add battr params if _checkParamDataType returns undefined (Mismatch data type)', function() {
        let originalBidRequests = utils.deepClone(bidRequests);
        let bannerObj = utils.deepClone(originalBidRequests[0].ortb2Imp.banner);
        originalBidRequests[0].ortb2Imp.banner = Object.assign(bannerObj, {
          battr: 1
        });

        const req = spec.buildRequests(originalBidRequests, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(req.data);
        expect(data.imp[0]['banner']['battr']).to.equal(undefined);
      });
    });

    describe('setIBVField', function() {
      it('should set ibv field in newBid.ext when bid.ext.ibv exists', function() {
        const bid = {
          ext: {
            ibv: true
          }
        };
        const newBid = {};
        setIBVField(bid, newBid);
        expect(newBid.ext).to.exist;
        expect(newBid.ext.ibv).to.equal(true);
        expect(newBid.meta).to.exist;
        expect(newBid.meta.mediaType).to.equal('video');
      });

      it('should not set ibv field when bid.ext.ibv does not exist', function() {
        const bid = {
          ext: {}
        };
        const newBid = {};
        setIBVField(bid, newBid);
        expect(newBid.ext).to.not.exist;
        expect(newBid.meta).to.not.exist;
      });

      it('should not set ibv field when bid.ext does not exist', function() {
        const bid = {};
        const newBid = {};
        setIBVField(bid, newBid);
        expect(newBid.ext).to.not.exist;
        expect(newBid.meta).to.not.exist;
      });

      it('should preserve existing newBid.ext properties', function() {
        const bid = {
          ext: {
            ibv: true
          }
        };
        const newBid = {
          ext: {
            existingProp: 'should remain'
          }
        };
        setIBVField(bid, newBid);
        expect(newBid.ext.existingProp).to.equal('should remain');
        expect(newBid.ext.ibv).to.equal(true);
        expect(newBid.meta).to.exist;
        expect(newBid.meta.mediaType).to.equal('video');
      });
    });
  });

  if (FEATURES.VIDEO) {
    describe('Video request params', function() {
      let sandbox, utilsMock, newVideoRequest;
      beforeEach(() => {
        utilsMock = sinon.mock(utils);
        sandbox = sinon.sandbox.create();
        sandbox.spy(utils, 'logWarn');
        newVideoRequest = utils.deepClone(videoBidRequests)
      });

      afterEach(() => {
        utilsMock.restore();
        sandbox.restore();
      })

      it('Should log warning if video params from mediaTypes and params obj of bid are not present', function () {
        delete newVideoRequest[0].mediaTypes.video;
        delete newVideoRequest[0].params.video;

        let request = spec.buildRequests(newVideoRequest, {
          auctionId: 'new-auction-id'
        });

        sinon.assert.calledOnce(utils.logWarn);
        expect(request).to.equal(undefined);
      });

      it('Should consider video params from mediaType object of bid', function () {
        delete newVideoRequest[0].params.video;

        let request = spec.buildRequests(newVideoRequest, {
          auctionId: 'new-auction-id'
        });
        let data = JSON.parse(request.data);
        expect(data.imp[0].video).to.exist;
        expect(data.imp[0]['video']['w']).to.equal(videoBidRequests[0].mediaTypes.video.playerSize[0]);
        expect(data.imp[0]['video']['h']).to.equal(videoBidRequests[0].mediaTypes.video.playerSize[1]);
        expect(data.imp[0]['video']['battr']).to.equal(undefined);
      });

      describe('Assign Deal Tier (i.e. prebidDealPriority)', function () {
        let videoSeatBid, request, newBid;
        // let data = JSON.parse(request.data);
        beforeEach(function () {
          videoSeatBid = videoBidResponse.body.seatbid[0].bid[0];
          // const adpodValidOutstreamBidRequest = validOutstreamBidRequest.bids[0].mediaTypes.video.context = 'adpod';
          request = spec.buildRequests(bidRequests, validOutstreamBidRequest);
          newBid = {
            requestId: '47acc48ad47af5'
          };
          videoSeatBid.ext = videoSeatBid.ext || {};
          videoSeatBid.ext.video = videoSeatBid.ext.video || {};
        // videoBidRequests[0].mediaTypes.video = videoBidRequests[0].mediaTypes.video || {};
        });

        it('should not assign video object if deal priority is missing', function () {
          assignDealTier(newBid, videoSeatBid, request);
          expect(newBid.video).to.equal(undefined);
          expect(newBid.video).to.not.exist;
        });

        it('should not assign video object if context is not a adpod', function () {
          videoSeatBid.ext.prebiddealpriority = 5;
          assignDealTier(newBid, videoSeatBid, request);
          expect(newBid.video).to.equal(undefined);
          expect(newBid.video).to.not.exist;
        });

        describe('when video deal tier object is present', function () {
          beforeEach(function () {
            videoSeatBid.ext.prebiddealpriority = 5;
            request.bidderRequest.bids[0].mediaTypes.video = {
              ...request.bidderRequest.bids[0].mediaTypes.video,
              context: 'adpod',
              maxduration: 50
            };
          });

          it('should set video deal tier object, when maxduration is present in ext', function () {
            assignDealTier(newBid, videoSeatBid, request);
            expect(newBid.video.durationSeconds).to.equal(50);
            expect(newBid.video.context).to.equal('adpod');
            expect(newBid.video.dealTier).to.equal(5);
          });

          it('should set video deal tier object, when duration is present in ext', function () {
            videoSeatBid.ext.video.duration = 20;
            assignDealTier(newBid, videoSeatBid, request);
            expect(newBid.video.durationSeconds).to.equal(20);
            expect(newBid.video.context).to.equal('adpod');
            expect(newBid.video.dealTier).to.equal(5);
          });
        });
      });
    });
  }

  describe('Marketplace params', function () {
    let sandbox, utilsMock, newBidRequests, newBidResponses;
    beforeEach(() => {
      utilsMock = sinon.mock(utils);
      sandbox = sinon.sandbox.create();
      sandbox.spy(utils, 'logInfo');
      newBidRequests = utils.deepClone(bidRequests)
      newBidRequests[0].bidder = 'groupm';
      newBidResponses = utils.deepClone(bidResponses);
      newBidResponses.body.seatbid[0].bid[0].ext.marketplace = 'groupm'
    });

    afterEach(() => {
      utilsMock.restore();
      sandbox.restore();
    })

    it('Should add bidder code as groupm for marketplace groupm response ', function () {
      let request = spec.buildRequests(newBidRequests, {
        auctionId: 'new-auction-id'
      });
      let response = spec.interpretResponse(newBidResponses, request);
      expect(response).to.be.an('array').with.length.above(0);
      expect(response[0].bidderCode).to.equal('groupm');
    });
  });

  describe('setTTL', function() {
    it('should set ttl field in newBid.ttl when bid.exp exists', function() {
      const bid = {
        exp: 200
      };
      const newBid = {};
      setTTL(bid, newBid);
      expect(newBid.ttl).to.equal(200);
    });

    it('should set ttl as 360 mediatype banner', function() {
      const bid = {};
      const newBid = {
        mediaType: 'banner'
      };
      setTTL(bid, newBid);
      expect(newBid.ttl).to.equal(360);
    });

    it('should set ttl as 1800 mediatype video', function() {
      const bid = {};
      const newBid = {
        mediaType: 'video'
      };
      setTTL(bid, newBid);
      expect(newBid.ttl).to.equal(1800);
    });

    it('should set ttl as 1800 mediatype native', function() {
      const bid = {};
      const newBid = {
        mediaType: 'native'
      };
      setTTL(bid, newBid);
      expect(newBid.ttl).to.equal(1800);
    });

    it('should set ttl as 360 as default if all condition fails', function() {
      const bid = {};
      const newBid = {};
      setTTL(bid, newBid);
      expect(newBid.ttl).to.equal(360);
    });
  });
});
