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
        { message: 'currency (backpack.tf)', name: 'backpackCurrencyPrompt' },
        { message: 'taunts (backpack.tf)', name: 'backpackTauntPrompt' },
        { message: 'taunts (scrap.tf)', name: 'scrapTauntPrompt'},
        { message: 'weapons (scrap.tf)', name: 'scrapWeaponPrompt'},
        { message: 'refresh profit weapons (backpack.tf)', name: 'profitWeapons'},
        { message: 'combine taunt files', name: 'combine'},
    ],
}); 

export const Bar = new SingleBar({
    format: 'Scraping Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Links || Speed: {speed}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

import { Links } from './links.js';

import { startBackpackScraping, getKeyPrice } from './backpack.js';
import { startScrapScraping } from './scrap.js';
import { combineTauntFiles } from './file.js';
import { startScrapingWeapons } from './weapons.js';

export async function startPromt(programMemory) {
    

    programMemory.prompt.run()
        .then(answers => {
            //Filter backpack.tf queries

            

            for(let answer of answers) {
                if(Links.backpackLinks.hasOwnProperty(answer)) 
                    programMemory.backpackPromtsList.push(answer);
            }
            
            if(programMemory.backpackPromtsList.length > 0)
                startBackpackScraping(programMemory);

            //Filter scrap.tf queries
            for(let answer of answers) {
                if(Links.scrapLinks.hasOwnProperty(answer)) 
                    programMemory.scrapPromptsList.push(answer);
            }
            
            if(programMemory.scrapPromptsList.length > 0)
                startScrapScraping(programMemory);

            for(let answer of answers) {
                if(answer == "combine") 
                {
                    programMemory.currentPrompt = "combine";
                    combineTauntFiles(programMemory);
                }    
            }   

            for(let answer of answers) {
                if(answer == "profitWeapons") {
                    programMemory.currentPrompt = "profitWeapons";
                    startScrapingWeapons(programMemory);
                }
            }

            
        })
        .catch(console.error);
}

