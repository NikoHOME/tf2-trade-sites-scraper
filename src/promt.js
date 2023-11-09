import pkg_enq from 'enquirer';
const {MultiSelect} = pkg_enq;

import pkg_bar from 'cli-progress';
const {SingleBar} = pkg_bar;

import pkg_ansi from 'ansi-colors';
const colors = pkg_ansi;

export const Prompt = new MultiSelect({
    name: 'value',
    message: 'Pick items to fetch, space to select, enter to confirm',
    limit: 7,
    choices: [
        { message: 'currency (backpack.tf)', name: 'backpackCurrencyLinks' },
        { message: 'taunts (backpack.tf)', name: 'backpackTauntLinks' },
        { message: 'taunts (scrap.tf)', name: 'scrapTauntLink'}
    ],
}); 

export const Bar = new SingleBar({
    format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

import { Links } from './links.js';

import { startBackpackScraping } from './backpack.js';
import { startScrapScraping } from './scrap.js';

export async function startPromt(programMemory) {
    programMemory.prompt.run()
        .then(answers => {

            for(let answer of answers) {
                if(Links.backpackLinks.hasOwnProperty(answer)) 
                    programMemory.backpackLinksList.push(answer);
            }
            
            if(programMemory.backpackLinksList.length > 0)
                startBackpackScraping(programMemory);
            
            for(let answer of answers) {
                if(Links.scrapLinks.hasOwnProperty(answer)) 
                    programMemory.scrapLinksList.push(answer);
            }
            
            if(programMemory.scrapLinksList.length > 0)
                startScrapScraping(programMemory);

            
        })
        .catch(console.error);
}

