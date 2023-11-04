import Xray from 'x-ray';



import { checkForEssentialFiles } from './file.js';

import { Prompt, Bar } from './promt.js';

import { getKeyPrice } from './backpack.js';

export class ProgramMemory {
    constructor() {
        this.scrapingLinksList = [];
        this.scrapingOutput = [];
        this.scrapingItemCounter;
        this.currentLink;
        this.debug = false;
        this.keyPrice = 0;
        
        this.xray = new Xray();

        this.progressBar = Bar; 
        this.prompt = Prompt;
    }

    decrementCounter() {
        this.scrapingItemCounter -= 1;
        this.progressBar.increment();

        if(this.scrapingItemCounter == 0) {
            process.emit("scrapingFinished");
        }
    }

    prepareForScraping() {
        checkForEssentialFiles();
    }

}