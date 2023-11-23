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


function compareByScrapBuy(a, b) {
    if ( a.scrapBackpackBuyBalance < b.scrapBackpackBuyBalance ){
        return -1;
    }
    if ( a.scrapBackpackBuyBalance > b.scrapBackpackBuyBalance ){
        return 1;
    }
    return 0;
}

function compareByScrapSell(a, b) {
    if ( a.scrapBackpackSellBalance < b.scrapBackpackSellBalance ){
        return -1;
    }
    if ( a.scrapBackpackSellBalance > b.scrapBackpackSellBalance ){
        return 1;
    }
    return 0;
}


function compareByBackpackBallance(a, b) {
    if ( a.balance < b.balance ){
        return -1;
    }
    if ( a.balance > b.balance ){
        return 1;
    }
    return 0;
}


function itemListToString(list, balanceType) {
    let output = "";
    for(let item of list) {
        output += item.name + "\n";

        switch(balanceType) {
            case "balance":
                output += "Buy on backpack sell on backpack: "
                break;
            case "scrapBackpackBuyBalance":
                output += "Buy on scrap sell now: "
                break;
            case "scrapBackpackSellBalance":
                output += "Buy on scrap make a listing: "
                break;
        }

        output += item[balanceType] + "\n";

        // output += "ScrapSellBalance: " + item.scrapBackpackBuyBalance + "\n";
        // output += "ScrapBuyBalance: " + item.scrapBackpackSellBalance + "\n";
        // output += "Balance: " + item.balance + "\n";
        output += "Sell price: " + item.backpackSell + "\n";
        output += "Buy price: " + item.backpackBuy + "\n";
        output += "Scrap buy price: " + item.scrapBuy + "\n";
        output += "Sell comment: "  + item.sellComm + "\n";
        output += "Buy comment: " + item.buyComm + "\n\n";
    }
    return output;
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
                    scrapBackpackBuyBalance: getRefDifference(
                        programMemory,
                        parseItemPrice(scrapItem.price),
                        parseItemPrice(backpackItem.buyOrder.value), 
                        
                    ),
                    scrapBackpackSellBalance: getRefDifference(
                        programMemory,
                        parseItemPrice(scrapItem.price),
                        parseItemPrice(backpackItem.sellOrder.value), 
                        
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
    combinedArray.sort(compareByBackpackBallance);

    let output = itemListToString(combinedArray, "balance");

    cacheText(removeSpecialChars(output), "taunt_combine");

    
    output = itemListToString(combinedArray.slice(0,5), "balance");
    cacheText(removeSpecialChars(output), "taunt_backpack_easy_sell");

    output = itemListToString(combinedArray.slice(combinedArray.length-5,combinedArray.length), "balance");
    cacheText(removeSpecialChars(output), "taunt_backpack_invest");



    combinedArray.sort(compareByScrapBuy);
    output = itemListToString(combinedArray.slice(0,5), "scrapBackpackBuyBalance");
    cacheText(removeSpecialChars(output), "taunt_scrap_buy");

    combinedArray.sort(compareByScrapSell);
    output = itemListToString(combinedArray.slice(0,5), "scrapBackpackSellBalance");
    cacheText(removeSpecialChars(output), "taunt_scrap_sell");
}