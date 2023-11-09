import Xray from 'x-ray';


class ItemPrice {
    constructor() {
        this.keys = 0;
        this.ref = 0;
    }
}


class ScrapedItem {
    constructor() {
        this.name = "";
        this.balance = 0;
        this.buyOrder = 0;
        this.sellOrder = 0;
    }
}

class ProgramMemory {
    constructor() {
        this.scrapingLinksList = [];
        this.scrapingOutput = [];
        this.scrapingItemCounter;
        this.currentLink;
        this.debug = false;
        this.keyPrice = 0;
        this.progressBar;
        this.prompt;
        this.xray;
    }

    decrementCounter() {
        this.scrapingItemCounter -= 1;
        this.progressBar.increment();

        if(this.scrapingItemCounter == 0) {
            process.emit("scrapingFinished");
        }
    }

}



function compareScrapedItems(a, b ) {
    if ( a.balance < b.balance ){
      return -1;
    }
    if ( a.balance > b.balance ){
      return 1;
    }
    return 0;
  }

function parseItemPrice(priceString) {
    // 3 Cases
    // 2 keys, 34.55 ref
    // 2 keys
    // 34.55 ref
    //Remove commas and split by spaces

    let splitPriceString = priceString.replace(",","").split(" ");
    let itemPrice = new ItemPrice();
    //Case 1
    if(splitPriceString.length > 2) {
        itemPrice.keys = splitPriceString[0];
        itemPrice.ref = splitPriceString[2];
        return itemPrice;
    }
    //Case 2 & 3
    itemPrice[splitPriceString[1]] = splitPriceString[0];
    return itemPrice;
    
}










let keyPrice = 0;


import * as links from './links.js';

//import * as Enquirer from 'enquirer';
import pkg_enq from 'enquirer';
const {MultiSelect} = pkg_enq;

import pkg_bar from 'cli-progress';
const {SingleBar} = pkg_bar;

import pkg_ansi from 'ansi-colors';
const colors = pkg_ansi;


let programMemory = new ProgramMemory();

programMemory.xray = new Xray();

programMemory.prompt = new MultiSelect({
    name: 'value',
    message: 'Pick items to fetch, space to select, enter to confirm',
    limit: 7,
    choices: [
        { message: 'currency (backpack.tf)', name: 'currencyLinks' },
        { message: 'taunts (backpack.tf)', name: 'tauntLinks' },
    ],
});
  
programMemory.progressBar = new SingleBar({
    format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

//import pkg_request from "request-x-ray";
//const {makeDriver} = pkg_request;

import * as req from "request-x-ray";
const makeDriver = req.default;

const options = {
	method: "GET", 						//Set HTTP method
	jar: true, 							//Enable cookies
	headers: {							//Set headers
		"User-Agent": "Firefox/48.0",
        "Cookie": "cf_clearance=r8zv6eAt7dK.ONcJPngkU.KTU1cRhimoqBo4VwaM3z0-1699538390-0-1-db383275.3bba728a.133b37ab-0.2.1699538390; __stripe_mid=30c75d2e-d342-4430-9e9f-3165dd79f6e0b0fc61; scraptf=rf5bib08ti03g003ddhq07kmc2; ncmp.domain=scrap.tf; ncmp=CPz10AAPz10AADyvHAENDaCgAP_AAH_AACiQgoNV_H__bX9v8X7_6ft0eY1f9_j77uQxBhfJs-4F3LvW_JwX32E7NF36tq4KmRoEu3ZBIUNtHJnUTVmxaogVrzHsak2cpTNKJ-BkkHMRe2dYCF5vm4tjeQKZ5_p_d3f52T_9_dv-39zz3913v3d9f-_1-Pjde5_9H_v_fRfb-_If9_7-_8v8_t_rk2_eT1__9evv__--________9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBQar-P_-2v7f4v3_0_bo8xq_7_H33chiDC-TZ9wLuXet-TgvvsJ2aLv1bVwVMjQJduyCQobaOTOomrNi1RArXmPY1Js5SmaUT8DJIOYi9s6wELzfNxbG8gUzz_T-7u_zsn_7-7f9v7nnv7rvfu76_9_r8fG69z_6P_f--i-39-Q_7_39_5f5_b_XJt-8nr__69ff__99________6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAA.YAAAAAAAAAAA; ncmp-cc=:"
	}
}

const driver = makeDriver(options);		//Create driver

programMemory.xray.driver(driver);	

programMemory.xray("http://www.google.com", "title")(function(err, res) {
	console.log(res);
})




import * as fs from "fs";
import * as backpack from "./backpack.js"

// checkForEssentialFiles();
// backpack.addListeners(programMemory);
// backpack.getKeyPrice(programMemory);









function checkForEssentialFiles() {
    if(!fs.existsSync("./cache"))
        fs.mkdirSync("./cache");
}

