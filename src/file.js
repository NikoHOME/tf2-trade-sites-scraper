import * as fs from "fs";


export function cacheText(text, path) {
    fs.writeFileSync("./cache/" + path, text);
}

export function cacheObject(obj, path) {
    fs.writeFileSync("./cache/" + path, JSON.stringify(obj, null, 2));
}
export function readCacheObject(path) {
    return JSON.parse(fs.readFileSync("./cache/" + path, 'utf8'));
}

export function checkForEssentialFiles() {
    if(!fs.existsSync("./cache"))
        fs.mkdirSync("./cache");
}

export const FileNames = {
    backpackCurrencyLinks: 'backpack_currency',
    backpackTauntLinks: 'backpack_taunt',
    scrapTauntLink: 'scrap_taunt',
    scrapWeaponLink: 'scrap_weapon',
};

export const ObjectFileNames = {
    backpack_currency: '.backpack_currency',
    backpack_taunt: '.backpack_taunt',
    scrap_taunt: '.scrap_taunt',
    scrap_weapon: '.scrap_weapon',
};

export function removeSpecialChars(text) {
    const excludeList = ["\"", "\'"];
    for(let string of excludeList) {
        text = text.replaceAll(string, "");
    }
    return text;
}

import { parseItemPrice, getRefDifference } from './func.js';


function compareCombinedItems(a, b ) {
    if ( a.scrapBackpackSellBalance < b.scrapBackpackSellBalance ){
      return -1;
    }
    if ( a.scrapBackpackSellBalance > b.scrapBackpackSellBalance ){
      return 1;
    }
    return 0;
  }

export function combineTauntFiles(programMemory) {
    
    if(!fs.existsSync("./cache/.backpack_taunt")) {
        console.log("Backpack taunt list missing");
        return;
    }
    if(!fs.existsSync("./cache/.scrap_taunt")) {
        console.log("Scrap taunt list missing");
        return;
    }


    let scrap = readCacheObject(".scrap_taunt");
    let backpack = readCacheObject(".backpack_taunt");

    let combinedArray = [];

    for(let scrapItem of scrap) {
        for(let backpackItem of backpack) {
            if(backpackItem.name == scrapItem.name)
            {

                combinedArray.push({
                    name: backpackItem.name,
                    scrapBackpackSellBalance: getRefDifference(
                        programMemory,
                        parseItemPrice(scrapItem.price),
                        parseItemPrice(backpackItem.sellOrder.value), 
                        
                    ),
                    scrapBackpackBuyBalance: getRefDifference(
                        programMemory,
                        parseItemPrice(scrapItem.price),
                        parseItemPrice(backpackItem.buyOrder.value), 
                        
                    ),
                    balance: backpackItem.balance,
                    backpackSell: backpackItem.sellOrder.value,
                    backpackBuy: backpackItem.buyOrder.value,
                    scrapBuy: scrapItem.price,
                    sellComm: backpackItem.sellOrder.comment,
                    buyComm: backpackItem.buyOrder.comment,
                });


            }
        }
    }
    combinedArray.sort(compareCombinedItems);
    let output = "";
    for(let item of combinedArray) {
        output += item.name + "\n";

        output += "ScrapSellBalance: " + item.scrapBackpackSellBalance + "\n";
        output += "ScrapBuyBalance: " + item.scrapBackpackBuyBalance + "\n";
        output += "Balance: " + item.balance + "\n";
        output += "Sell price: " + item.backpackSell + "\n";
        output += "Buy price: " + item.backpackBuy + "\n";
        output += "Scrap buy price: " + item.scrapBuy + "\n";
        output += "Sell comment: "  + item.sellComm + "\n";
        output += "Buy comment: " + item.buyComm + "\n\n";
    }

    cacheText(removeSpecialChars(output), "taunt_combine");
}