

function processScrape(programMemory, err, result, link) {
    if(err) {
        scrapeLink(programMemory,link);
        return;
    }
    
    console.log(result.content[6].items);
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
    await scrapeLink(programMemory, Links.scrapLinks[programMemory.scrapLinksList[0]])
}
