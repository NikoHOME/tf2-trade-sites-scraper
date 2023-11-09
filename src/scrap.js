

function convertScrapingOutput(scrapingOutput) {

    let output = "";
    for(let item of scrapingOutput.content[6].items) {
        output += item.name + "\n";
        output += "Buy price: " + item.price + "\n\n";
    }
    const excludeList = ["\"", "\'"];
    for(let string of excludeList) {
        console.log(string);
        output = output.replaceAll(string, "");
    }

    return output;
}

import { cacheText, cacheObject, FileNames, ObjectFileNames, readCacheObject } from "./file.js";

function processScrape(programMemory, err, result, link) {
    if(err) {
        scrapeLink(programMemory,link);
        return;
    }
    
    cacheText(convertScrapingOutput(result), FileNames[programMemory.currentLink]);
    cacheObject(result.content[6].items, ObjectFileNames[FileNames[programMemory.currentLink]]);

    console.log(readCacheObject(ObjectFileNames[FileNames[programMemory.currentLink]]));
}


async function scrapeLink(programMemory, link) {
    //Add a xray driver with a login cookie
    programMemory.xray.driver(programMemory.scrapDriver);	

    programMemory.xray("https://scrap.tf/buy/items", ".rev-items-container", {
    titles: programMemory.xray(".items-category-header",[""]),
    content: programMemory.xray(".banking-category",[{
        items: programMemory.xray(".item",[{
            name: "@data-title",
            price: ".item-value-indicator",
        }])
    }]),
    })
    ((err, result) => {
        processScrape(programMemory, err, result, link);
    });
}


import { Links } from "./links.js";

export async function startScrapScraping(programMemory) {
    programMemory.currentLink = programMemory.scrapLinksList[0];
    await scrapeLink(programMemory, Links.scrapLinks[programMemory.currentLink])
}
