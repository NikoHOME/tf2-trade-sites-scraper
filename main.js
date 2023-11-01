import Xray from 'x-ray';
const x = new Xray();

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
        this.buyOrder;
        this.sellOrder;
    }
}

class ProgramMemory {
    constructor() {
        this.scrapingLinksList = [];
        this.scrapingOutput = [];
        this.scrapingItemCounter;
        this.currentLink;
        this.debug = false;
        this.progressBar;
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

function getRefDifference(sellPrice, buyPrice) {
    return (sellPrice.ref - buyPrice.ref + (sellPrice.keys - buyPrice.keys) * keyPrice).toFixed(2);
}


const KeyUrl = "https://backpack.tf/stats/Unique/Mann%20Co.%20Supply%20Crate%20Key/Tradable/Craftable";
let keyPrice = 0;
//Create global keyPrice
function getKeyPrice() {
    x(KeyUrl, ".price-box", ".value")
    ((err, result) => {
        result = result.replace(/\s+/g, "").split("–")[0];
        keyPrice = result;
        process.emit("keyPrice");
    })
}


function processScrape(programMemory, err, result, link) {


    if(err) {
        //console.log(err);
        if(programMemory.debug) console.log("<!!> Error for " + link);
        programMemory.decrementCounter();
        return;
    }

    if(result.length != 4) {
        if(programMemory.debug) console.log("<!!> Scrape failed for " + link);
        if(programMemory.debug) console.log("<||> Retrying " + link);
        scrapeLink(programMemory, link);
        return;
        programMemory.scrapingItemCounter -= 1;
        if(programMemory.scrapingItemCounter == 0) {
            process.emit("scrapingFinished");
        }
        return;
    }

    //Remove "Suggestion" section 
    result = result.slice(0,2);
    const filteredFields = [
        "friend_to_trade", 
        "friend_to_trade_buyout",
        "spell",
        "effect",
    ];
    for(let column of result) {
        for(let item of column.list) {
            // Remove friend to trade trades (can't automate them)
            for(let field of filteredFields) {
                if(Object.keys(item).indexOf(field) != -1) {

                    column.list = column.list.filter( e => e !== item);
                    continue;
                }
            }
            //Check if the item has normal currency listed otherwise remove it
            if(Object.keys(item).indexOf("value") == -1) {
                column.list = column.list.filter( e => e !== item);
                continue;
            }
            
        }
    }
    
    if(result[0].list.length == 0 || result[1].list.length == 0) {
        if(programMemory.debug) console.log("<!!> Not enough items found, scrape failed for " + link);
        programMemory.decrementCounter();
        return;
    }



    //Pick the top offers (best prices)
    
    let bestSell = result[0].list[0];
    let bestBuy = result[1].list[0];
    
    //console.log(bestBuy);
    //console.log(bestSell);
    
    let sellPrice = parseItemPrice(bestSell.value);
    let buyPrice = parseItemPrice(bestBuy.value);

    let refDiffence = getRefDifference(sellPrice, buyPrice);
    
    let scrapedItem = new ScrapedItem();

    scrapedItem.name = result[0].list[0].name;
    scrapedItem.balance = parseFloat(refDiffence);
    scrapedItem.buyOrder = bestBuy;
    scrapedItem.sellOrder = bestSell;

    //console.log(programMemory.scrapingOutput);
    programMemory.scrapingOutput.push(scrapedItem);

    if(programMemory.debug) console.log("<++> Scrape finished for " + link);


    programMemory.decrementCounter();
}




function scrapeLink(programMemory, link) {
    x(link, ".col-md-6", [{
        title: "h4",
        list: x( ".listing", [{
            name: '.item@title',
            value: '.item@data-listing_price',
            comment: '.item@data-listing_comment',
            //Check if specific elements exists to determine prefered trade type
            friend_to_trade: x(".btn-primary", "i.fa-user-plus@class"), //blue icon + user
            hagle_trade: x(".btn-primary", "i.fa-exchange@class"),      //blue icon + arrows
            friend_to_trade_buyout: x(".btn-success", "i.fa-user-plus@class"), //green icon + user
            buyout_trade: x(".btn-success", "i.fa-exchange@class"),     //green icon + arrows
            instant_trade: x(".btn-success", "i.fa-flash@class"),       //green icon + flash

            //Check if has any special modifiers
            spell: '.item@data-spell_1',
            effect: '.item@data-effect_name',

        }])
    }])
    ((err, result) => {
        processScrape(programMemory, err, result, link);
    });
}


function scrapeLinks(programMemory, linkList) {



    //Couting scraped items;
    programMemory.scrapingItemCounter = linkList.length;
    //Start progress bar
    programMemory.progressBar.start(linkList.length, 0, {
        speed: "N/A"
    });
    
    for(let link of linkList) {
        scrapeLink(programMemory, link);
    }

}

import * as links from './links.js';

//import * as Enquirer from 'enquirer';
import pkg_enq from 'enquirer';
const {MultiSelect} = pkg_enq;

import pkg_bar from 'cli-progress';
const {SingleBar} = pkg_bar;

import pkg_ansi from 'ansi-colors';
const colors = pkg_ansi;


let programMemory = new ProgramMemory();


const prompt = new MultiSelect({
    name: 'value',
    message: 'Pick items to fetch, space to select, enter to confirm',
    limit: 7,
    choices: [
        { message: 'currency', name: 'currencyLinks' },
        { message: 'taunts', name: 'tauntLinks' },
    ],
});
  
programMemory.progressBar = new SingleBar({
    format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});



getKeyPrice();


process.on("keyPrice", () => {
    console.log("<++> Key price fetched = " + keyPrice);
    prompt.run()
        .then(answers => {
            
            programMemory.scrapingLinksList = answers;
            
            scrapeLinks(programMemory, links[programMemory.scrapingLinksList.pop()]);
        })
        .catch(console.error);

});

process.on("scrapingFinished", () => {
    programMemory.progressBar.stop();
    programMemory.scrapingOutput.sort(compareScrapedItems);
    console.log(programMemory.scrapingOutput);
    programMemory.scrapingOutput = [];

    if(programMemory.scrapingLinksList.length > 0) {
        scrapeLinks(programMemory, links[programMemory.scrapingLinksList.pop()]);
    }
});




function cacheOutput(scrapingOutput) {

}