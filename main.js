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

import * as fs from "fs";
import * as backpack from "./backpack.js"

checkForEssentialFiles();
backpack.addListeners(programMemory);
backpack.getKeyPrice(programMemory);









function checkForEssentialFiles() {
    if(!fs.existsSync("./cache"))
        fs.mkdirSync("./cache");
}

