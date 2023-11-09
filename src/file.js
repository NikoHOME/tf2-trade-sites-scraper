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
};

export const ObjectFileNames = {
    backpack_currency: '.backpack_currency',
    backpack_taunt: '.backpack_taunt',
    scrap_taunt: '.scrap_taunt',
};

export function removeSpecialChars(text) {
    const excludeList = ["\"", "\'"];
    for(let string of excludeList) {
        text = text.replaceAll(string, "");
    }
    return text;
}

export function combineTauntFiles() {
    
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

    let output = "";

    for(let scrapItem of scrap) {
        for(let backpackItem of backpack) {
            if(backpackItem.name == scrapItem.name)
            {
                output += backpackItem.name + "\n";

                output += "Balance: " + backpackItem.balance + "\n";
                output += "Sell price: " + backpackItem.sellOrder.value + "\n";
                output += "Buy price: " + backpackItem.buyOrder.value + "\n";
                output += "Scrap buy price: " + scrapItem.price + "\n";
                output += "Sell comment: "  + backpackItem.sellOrder.comment + "\n";
                output += "Buy comment: " + backpackItem.buyOrder.comment + "\n\n";
            }
        }
    }



    cacheText(removeSpecialChars(output), "taunt_combine");
}