export const tf2Weapons = {
    scout: {
        primary: ["Force-A-Nature", "Shortstop", "Soda Popper", "Baby Face's Blaster", "Back Scatter"],
        secondary: ["Winger", "Pretty Boy's Pocket Pistol", "Flying Guillotine", "Bonk! Atomic Punch", "Crit-a-Cola", "Mad Milk"],
        melee: ["Holy Mackerel", "Unarmed Combat", "Sandman", "Candy Cane", "Boston Basher", "Sun-on-a-Stick", "Fan O'War", "Atomizer", "Wrap Assassin"]
    },
    soldier: {
        primary: ["Original", "Direct Hit", "Black Box", "Rocket Jumper", "Liberty Launcher", "Cow Mangler 5000", "Beggar's Bazooka", "Air Strike"],
        secondary: [ "Buff Banner", "Gunboats", "Battalion's Backup", "Concheror", "Mantreads", "Righteous Bison"],
        melee: ["Equalizer", "Disciplinary Action", "Market Gardener", "Escape Plan"]
    },
    pyro: {
        primary: ["Rainblower", "Backburner", "Degreaser", "Phlogistinator"],
        secondary: ["Flare Gun", "Detonator", "Manmelter", "Scorch Shot"],
        melee: ["Lollichop", "Axtinguisher", "Postal Pummeler", "Homewrecker", "Powerjack", "Back Scratcher", "Sharpened Volcano Fragment", "Third Degree", "Neon Annihilator"]
    },
    demoman: {
        primary: ["Loch-n-Load", "Ali Baba's Wee Booties", "Bootlegger", "Loose Cannon"],
        secondary: ["Scottish Resistance", "Chargin' Targe", "Sticky Jumper", "Splendid Screen", "Tide Turner", "Quickiebomb Launcher"],
        melee: ["Scottish Handshake", "Eyelander", "Nessie's Nine Iron", "Scotsman's Skullcutter", "Ullapool Caber", "Claidheamh Mòr", "Persian Persuader"]
    },
    heavy: {
        primary: ["Iron Curtain", "Natascha", "Brass Beast", "Tomislav", "Huo-Long Heater"],
        secondary: ["Family Business", "Sandvich", "Robo-Sandvich", "Dalokohs Bar", "Buffalo Steak Sandvich"],
        melee: ["Killing Gloves of Boxing", "Gloves of Running Urgently", "Warrior's Spirit", "Fists of Steel", "Eviction Notice", "Holiday Punch"]
    },
    engineer: {
        primary: ["Frontier Justice", "Widowmaker", "Pomson 6000", "Rescue Ranger"],
        secondary: ["Wrangler", "Short Circuit"],
        melee: ["Gunslinger", "Southern Hospitality", "Jag", "Eureka Effect"]
    },
    medic: {
        primary: ["Blutsauger", "Crusader's Crossbow", "Overdose"],
        secondary: ["Kritzkrieg", "Quick-Fix", "Vaccinator"],
        melee: ["Ubersaw", "Vita-Saw", "Amputator", "Solemn Vow"]
    },
    sniper: {
        primary: ["Huntsman", "Fortified Compound", "Sydney Sleeper", "Bazaar Bargain", "Machina", "Hitman's Heatmaker", "Classic"],
        secondary: ["Cleaner's Carbine", "Jarate","Razorback", "Darwin's Danger Shield", "Cozy Camper"],
        melee: ["Tribalman's Shiv", "Bushwacka", "Shahanshah", ]
    },
    spy: {
        primary: ["Revolver", "Big Kill", "Ambassador", "L'Etranger", "Enforcer", "Diamondback"],
        melee: ["Your Eternal Reward", "Wanga Prick", "Conniver's Kunai", "Big Earner", "Spy-cicle"],
        disguiseKit: ["Cloak and Dagger", "Dead Ringer"],
        sapper: ["Sapper", "Red-Tape Recorder"]
    },
    multiClass: {
        mixed: ["Reserve Shooter", "Pain Train", "Half-Zatoichi", "B.A.S.E. Jumper"]
    },
};

async function scrapeLink(programMemory, weaponName) {

    let link = "https://backpack.tf/stats/Unique/" +
    weaponName.replaceAll(/ /g, '%20') + 
    "/Tradable/Craftable";
    try {
        if(programMemory.debugLevel >= 4) 
            console.log("<::> Current Weapon link: "+ link);
        await programMemory.xray(link, ".col-md-6", [{
            title: "h4",
            list: programMemory.xray( ".listing", [{
                name: '.item@title',
                value: '.item@data-listing_price',
                comment: '.item@data-listing_comment',
                //Check if specific elements exists to determine prefered trade type
                friend_to_trade: programMemory.xray(".btn-primary", "i.fa-user-plus@class"), //blue icon + user
                hagle_trade: programMemory.xray(".btn-primary", "i.fa-exchange@class"),      //blue icon + arrows
                friend_to_trade_buyout: programMemory.xray(".btn-success", "i.fa-user-plus@class"), //green icon + user
                buyout_trade: programMemory.xray(".btn-success", "i.fa-exchange@class"),     //green icon + arrows
                instant_trade: programMemory.xray(".btn-success", "i.fa-flash@class"),       //green icon + flash

                //Check if has any special modifiers
                spell: '.item@data-spell_1',
                effect: '.item@data-effect_name',

            }])
        }])
        (async (err, result) => {
            await processScrape(programMemory, err, result, weaponName);
        });
    }
    catch (err) {
        if(programMemory.debugLevel >= 4) 
            console.log("<!!> Scraping failed: "+ err);
    }
}


import * as func from "./func.js";
import * as file from "./file.js";

async function processScrape(programMemory, err, result, weaponName) {


    if(err) {
        if(programMemory.debugLevel >= 4) console.log("<!!> Error for " + weaponName);
        return;
    }

    if(result.length != 4) {
        if(programMemory.debugLevel >= 4) console.log("<!!> Scrape failed for " + weaponName);
        if(programMemory.debugLevel >= 4) console.log("<||> Retrying " + weaponName);
        await scrapeLink(programMemory, weaponName);
        return;
    }

    //Remove "Suggestion" section 
    result = result.slice(0,2);
    const filteredFields = [
        "friend_to_trade", 
        "friend_to_trade_buyout",
        "spell",
        "effect",
    ];
    for(let column of result) {
        for(let item of column.list) {
            // Remove friend to trade trades (can't automate them)
            for(let field of filteredFields) {
                if(Object.keys(item).indexOf(field) != -1) {

                    column.list = column.list.filter( e => e !== item);
                    continue;
                }
            }
            //Check if the item has normal currency listed otherwise remove it
            if(Object.keys(item).indexOf("value") == -1) {
                column.list = column.list.filter( e => e !== item);
                continue;
            }
            
        }
    }
    
    if(result[0].list.length == 0 || result[1].list.length == 0) {
        if(programMemory.debugLevel >= 4) console.log("<!!> Not enough items found, scrape failed for " + weaponName);
        return;
    }



    //Pick the top offers (best prices)
    
    let bestBuy = result[1].list[0];
    
    let buyPrice = func.parseItemPrice(bestBuy.value);
    
    if(buyPrice.ref >= 0.11 && bestBuy.name == weaponName && buyPrice.keys == 0) {
        programMemory.scrapingOutput.push(bestBuy.name);
    }

    if(programMemory.debugLevel >= 4) console.log("<++> Scrape finished for " + weaponName);
}



export async function startScrapingWeapons(programMemory) {
    //Couting items;
    let weaponAmmount = 0;
    for(const tf2Class in tf2Weapons) {
        for(const slot in tf2Weapons[tf2Class]) {
                weaponAmmount += slot.length;
        }
    }

    programMemory.scrapingItemCounter = weaponAmmount;
    //Start progress bar
    programMemory.progressBar.start(weaponAmmount, 0, {
        speed: programMemory.progressSpeed
    });

    let classToStart = "scout";
    let classfound = false;
    if(file.cacheExists(file.FileNames.lastWeaponClass))
        classToStart = file.readCacheText(
            file.FileNames.lastWeaponClass
        );

    if(classToStart == "scout")
        file.deleteCache(file.FileNames.profitWeapons);

    for(const tf2Class in tf2Weapons) {

        if(!classfound) {
            if(tf2Class == classToStart) {
                classfound = true;
            }
            else {
                if(programMemory.debugLevel >= 4)
                    console.log("\n <::> Skipping class: " + tf2Class); 
                for(const slot in tf2Weapons[tf2Class]) {
                    programMemory.decrementCounter(slot.length);
                }
                continue;
            }    
        }   

        file.cacheText(tf2Class, file.FileNames.lastWeaponClass);
        for(const slot in tf2Weapons[tf2Class]) {
            for(const weapon of tf2Weapons[tf2Class][slot]) {
                
                let startTime = performance.now();
                await scrapeLink(programMemory, weapon);
                let endTime = performance.now();
                await func.wait(100);
                programMemory.decrementCounter(1, endTime - startTime);            
            }
            
        }
        if(programMemory.debugLevel >= 4)
            console.log("\n <::> Scraping output: " + programMemory.scrapingOutput); 
        
        for(const weaponName of programMemory.scrapingOutput) {
            file.cacheAppendText(
                weaponName + "\n",
                file.FileNames.profitWeapons
            );
        }
    }

    file.deleteCache(file.FileNames.lastWeaponClass);
    programMemory.progressBar.stop();

    
}