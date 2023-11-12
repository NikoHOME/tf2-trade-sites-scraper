
class ScrapedItem {
    constructor() {
        this.name = "";
        this.balance = 0;
        this.buyOrder = 0;
        this.sellOrder = 0;
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



async function scrapeLink(programMemory, link) {
    //Reset the driver to default
    programMemory.xray.driver(programMemory.backpackDriver);

    await programMemory.xray(link, ".col-md-6", [{
        title: "h4",
        list: programMemory.xray( ".listing", [{
            name: '.item@title',
            value: '.item@data-listing_price',
            comment: '.item@data-listing_comment',
            //Check if specific elements exists to determine prefered trade type
            friend_to_trade: programMemory.xray(".btn-primary", "i.fa-user-plus@class"), //blue icon + user
            hagle_trade: programMemory.xray(".btn-primary", "i.fa-exchange@class"),      //blue icon + arrows
            friend_to_trade_buyout: programMemory.xray(".btn-success", "i.fa-user-plus@class"), //green icon + user
            buyout_trade: programMemory.xray(".btn-success", "i.fa-exchange@class"),     //green icon + arrows
            instant_trade: programMemory.xray(".btn-success", "i.fa-flash@class"),       //green icon + flash

            //Check if has any special modifiers
            spell: '.item@data-spell_1',
            effect: '.item@data-effect_name',

        }])
    }])
    ((err, result) => {
        processScrape(programMemory, err, result, link);
    });
}

import { FileNames, cacheObject, ObjectFileNames } from './file.js';

async function scrapeLinks(programMemory, linkList) {

    //Couting scraped items;
    programMemory.scrapingItemCounter = linkList.length;
    //Start progress bar
    programMemory.progressBar.start(linkList.length, 0, {
        speed: "N/A"
    });
    
    for(let link of linkList) {
        await scrapeLink(programMemory, link);
    }

    programMemory.progressBar.stop();
    programMemory.scrapingOutput.sort(compareScrapedItems);
    console.log(programMemory.scrapingOutput);

    cacheText(convertScrapingOutput(programMemory.scrapingOutput), FileNames[programMemory.currentLink]);
    cacheObject(programMemory.scrapingOutput, ObjectFileNames[FileNames[programMemory.currentLink]]);
    programMemory.scrapingOutput = [];

    if(programMemory.backpackLinksList.length > 0) {
        programMemory.currentLink = programMemory.backpackLinksList.pop()
        scrapeLinks(programMemory, Links.backpackLinks[programMemory.currentLink]);
    }

}

import { Links } from './links.js';
import { cacheText } from './file.js';


import { parseItemPrice, getRefDifference } from './func.js';

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
    
    
    let sellPrice = parseItemPrice(bestSell.value);
    let buyPrice = parseItemPrice(bestBuy.value);

    let refDiffence = getRefDifference(programMemory, sellPrice, buyPrice);
    
    let scrapedItem = new ScrapedItem();

    scrapedItem.name = result[0].list[0].name;
    scrapedItem.balance = refDiffence;
    scrapedItem.buyOrder = bestBuy;
    scrapedItem.sellOrder = bestSell;

    programMemory.scrapingOutput.push(scrapedItem);

    if(programMemory.debug) console.log("<++> Scrape finished for " + link);


    programMemory.decrementCounter();
}

const KeyUrl = "https://backpack.tf/stats/Unique/Mann%20Co.%20Supply%20Crate%20Key/Tradable/Craftable";

//Create global keyPrice
export async function getKeyPrice(programMemory) {
    await programMemory.xray(KeyUrl, ".price-box", ".value")
    ((err, result) => {
        result = result.replace(/\s+/g, "").split("–")[0];
        programMemory.keyPrice = result;
    })
}




import { removeSpecialChars } from './file.js';

function convertScrapingOutput(scrapingOutput) {

    let output = "";
    for(let item of scrapingOutput) {
        output += item.name + "\n";
        output += "Balance: " + item.balance + "\n";
        output += "Sell price: " + item.sellOrder.value + "\n";
        output += "Buy price: " + item.buyOrder.value + "\n";
        output += "Sell comment: "  + item.sellOrder.comment + "\n";
        output += "Buy comment: " + item.buyOrder.comment + "\n\n";
    }
    

    return removeSpecialChars(output);
}


export async function startBackpackScraping(programMemory) {

    

    if(programMemory.backpackLinksList.length > 0) {
        programMemory.currentLink = programMemory.backpackLinksList.pop();
        scrapeLinks(programMemory, Links.backpackLinks[programMemory.currentLink]);
    } 
}