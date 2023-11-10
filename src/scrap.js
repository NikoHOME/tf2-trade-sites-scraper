

function convertScrapingOutput(scrapingOutput) {

    let output = "";
    for(let item of scrapingOutput) {
        output += item.name + "\n";
        output += "Buy price: " + item.price + "\n\n";
    }
    const excludeList = ["\"", "\'"];
    for(let string of excludeList) {
        output = output.replaceAll(string, "");
    }

    return output;
}

import { cacheText, cacheObject, FileNames, ObjectFileNames, readCacheObject } from "./file.js";


function filterArrayByValues(array, key, valuesToKeep) {
    return array.filter(obj => obj.hasOwnProperty(key) && valuesToKeep.includes(obj[key]));
}
  

const SearchedWeapons = [
    "Quick-Fix",
    "Rocket Jumper",
    "Sticky Jumper",
    "Vaccinator",
];

function processScrape(programMemory, err, result, link) {
    if(err) {
        scrapeLink(programMemory,link);
        return;
    }

    let output;

    switch(link) {
        case Links.scrapLinks.scrapTauntLink:
            output = result.content[6].items;
            break;
        case Links.scrapLinks.scrapWeaponLink:
            output = result.content[0].items;
            output = filterArrayByValues(output, "name", SearchedWeapons);
            if(output.length == 0)
                console.log("<::> No relevant weapons found.")
            break;
    }
    
    cacheText(convertScrapingOutput(output), FileNames[programMemory.currentLink]);
    cacheObject(output, ObjectFileNames[FileNames[programMemory.currentLink]]);

    console.log(readCacheObject(ObjectFileNames[FileNames[programMemory.currentLink]]));
}


async function scrapeLink(programMemory, link) {
    //Add a xray driver with a login cookie
    programMemory.xray.driver(programMemory.scrapDriver);	

    programMemory.xray(link, ".rev-items-container", {
    titles: programMemory.xray(".items-category-header",[""]),
    content: programMemory.xray(".banking-category",[{
        items: programMemory.xray(".item",[{
            name: "@data-title",
            price: ".item-value-indicator",
            amount: "@data-num-available",
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
