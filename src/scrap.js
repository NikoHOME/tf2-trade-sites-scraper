

function processScrape(programMemory, err, result, link) {
    console.log(result);
}

function scrapeLink(programMemory, link) {
    programMemory.xray(link, "div#category-8", [{
        title: "",
    }])
    ((err, result) => {
        processScrape(programMemory, err, result, link);
    });
}


import { Links } from "./links.js";

export function startScrapScraping(programMemory) {
    scrapeLink(programMemory, Links.scrapLinks[programMemory.scrapLinksList[0]])
}