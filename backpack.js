function scrapeLink(programMemory, link) {
    programMemory.xray(link, ".col-md-6", [{
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

export function addListeners(programMemory) {
    process.on("keyPrice", () => {
        console.log("<++> Key price fetched = " + programMemory.keyPrice);
        programMemory.prompt.run()
            .then(answers => {
                
                programMemory.scrapingLinksList = answers;
                
                programMemory.currentLink = programMemory.scrapingLinksList.pop()
                scrapeLinks(programMemory, links[programMemory.currentLink]);
            })
            .catch(console.error);
    
    });
    
    process.on("scrapingFinished", () => {
        programMemory.progressBar.stop();
        programMemory.scrapingOutput.sort(compareScrapedItems);
        console.log(programMemory.scrapingOutput);
    
        cacheText(convertScrapingOutput(programMemory.scrapingOutput), FileNames[programMemory.currentLink]);
    
        programMemory.scrapingOutput = [];
    
        if(programMemory.scrapingLinksList.length > 0) {
            programMemory.currentLink = programMemory.scrapingLinksList.pop()
            scrapeLinks(programMemory, links[programMemory.currentLink]);
        }
    });
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

const KeyUrl = "https://backpack.tf/stats/Unique/Mann%20Co.%20Supply%20Crate%20Key/Tradable/Craftable";

//Create global keyPrice
export function getKeyPrice(programMemory) {
    programMemory.xray(KeyUrl, ".price-box", ".value")
    ((err, result) => {
        result = result.replace(/\s+/g, "").split("–")[0];
        programMemory.keyPrice = result;
        process.emit("keyPrice");
    })
}


function getRefDifference(sellPrice, buyPrice) {
    return (sellPrice.ref - buyPrice.ref + (sellPrice.keys - buyPrice.keys) * keyPrice).toFixed(2);
}


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
    const excludeList = ["\"", "\'"];
    for(let string of excludeList) {
        console.log(string);
        output = output.replaceAll(string, "");
    }

    return output;
}


export const FileNames = {
    currencyLinks: 'currency',
    tauntLinks: 'taunt',
};




function cacheText(text, path) {
    fs.writeFileSync("./cache/" + path, text);
}