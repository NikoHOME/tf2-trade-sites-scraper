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
        this.ballance = 0;
    }
}

class ProgramMemory {
    constructor() {
        this.scrapingOutput = [];
    }
}

let programMemory = new ProgramMemory();

function compareScrapedItems(a, b ) {
    if ( a.ballance < b.ballance ){
      return -1;
    }
    if ( a.ballance > b.ballance ){
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




function scrapeLinks(linkList) {

    //Couting scraped items;
    let counter = linkList.length;
    
    for(let link of linkList) {
        x(link, ".col-md-6", [{
            title: "h4",
            list: x( ".listing", [{
                name: '.item@title',
                value: '.item@data-listing_price',
                comment: '.item@data-listing_comment',
                //Check if specific elements exists to determine prefered trade type
                friend_to_trade: x(".btn-primary", "i.fa-user-plus@class"), //blue icon + user
                hagle_trade: x(".btn-primary", "i.fa-exchange@class"),      //blue icon + arrows
                buyout_trade: x(".btn-success", "i.fa-exchange@class"),     //green icon + arrows
                instant_trade: x(".btn-success", "i.fa-flash@class"),       //green icon + flash

                //Check if has any special modifiers
                spell: '.item@data-spell_1',
                effect: '.item@data-effect_name',

            }])
        }])
        ((err, result) => {
            
            
            if(err) {
                console.log(err);
                return;
            }

            if(result.length != 4) {
                console.log("<!!> Scrape failed for " + link);
                counter -= 1;
                return;
            }

            //Remove "Suggestion" section 
            result = result.slice(0,2);

            for(let column of result) {
                for(let item of column.list) {
                    // Remove friend to trade trades (can't automate them)
                    if(Object.keys(item).indexOf("friend_to_trade") != -1) {

                        column.list = column.list.filter( e => e !== item);
                        continue;
                    }
                    // Remove rare modifiers
                    if(Object.keys(item).indexOf("spell") != -1) {
                        column.list = column.list.filter( e => e !== item);
                        continue;
                    }
                    
                    if(Object.keys(item).indexOf("effect") != -1) {
                        column.list = column.list.filter( e => e !== item);
                        continue;
                    }

                    //Check if has normal currency listed
                    if(Object.keys(item).indexOf("value") == -1) {
                        column.list = column.list.filter( e => e !== item);
                        continue;
                    }
                    
                }
            }
            
            if(result[0].list.length == 0 || result[1].list.length == 0) {
                console.log("<!!> Not enough items found, scrape failed for " + link);
                counter -=1;
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
            scrapedItem.ballance = parseFloat(refDiffence);


            programMemory.scrapingOutput.push(scrapedItem);
            counter -= 1;
            console.log("<++> Scrape finished for " + link);


            if(counter == 0) {
                process.emit("scrapingFinished");
            }
        });
    }

}

import * as links from './links.js';

getKeyPrice();


process.on("keyPrice", () => {
    console.log("<++> Key price fetched = " + keyPrice);
    scrapeLinks(links.tauntLinks);
});

process.on("scrapingFinished", () => {
    programMemory.scrapingOutput.sort(compareScrapedItems);
    console.log(programMemory.scrapingOutput);
});