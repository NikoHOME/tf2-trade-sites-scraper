const Xray = require('x-ray');
const x = Xray()

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

//Create global keyPrice
function getKeyPrice() {
    x(KeyUrl, ".price-box", ".value")
    ((err, result) => {
        result = result.replace(/\s+/g, "").split("–")[0];
        keyPrice = result;
        process.emit("keyPrice");
    })
}


const links = [
    "https://backpack.tf/stats/Unique/Taunt%3A%20Conga/Tradable/Craftable",
    "https://backpack.tf/stats/Unique/Taunt%3A%20Square%20Dance/Tradable/Craftable",
    "https://backpack.tf/stats/Unique/Taunt%3A%20Skullcracker/Tradable/Craftable",
    "https://backpack.tf/stats/Unique/Mann%20Co.%20Supply%20Crate%20Key/Tradable/Craftable",
];

function scrapeLinks(outputList) {

    //Couting scraped items;
    let counter = links.length;
    
    for(let link of links) {
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

            }])
        }])
        ((err, result) => {
            
            //Remove "Suggestion" section 
            result = result.slice(0,2);

            for(let column of result) {
                for(item of column.list) {
                    // Remove friend to trade trades (can't automate them)
                    if(Object.keys(item).indexOf("friend_to_trade") != -1) {
                        column.list.splice(column.list.indexOf(item), 1);
                    }
                    
                }
            }
            //Pick the top offers (best prices)
            let bestSell = result[0].list[0];
            let bestBuy = result[1].list[0];

            let sellPrice = parseItemPrice(bestSell.value);
            let buyPrice = parseItemPrice(bestBuy.value);

            let refDiffence = getRefDifference(sellPrice, buyPrice);
            
            let scrapedItem = new ScrapedItem();

            scrapedItem.name = result[0].list[0].name;
            scrapedItem.ballance = refDiffence;


            outputList.push(scrapedItem);
            counter -= 1;


            if(counter == 0)
                process.emit("scrapingFinished", outputList);
        });
    }

}



getKeyPrice();

process.on("keyPrice", () => {
    console.log("<++> Key price fetched = " + keyPrice);
    let scrapedItems = [];
    scrapeLinks(scrapedItems);
});

process.on("scrapingFinished", (scrapedItems) => {
    scrapedItems.sort(compareScrapedItems);
    console.log(scrapedItems);
})