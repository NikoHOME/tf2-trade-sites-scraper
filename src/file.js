import * as fs from "fs";


export function cacheText(text, path) {
    fs.writeFileSync("./cache/" + path, text);
}

export function checkForEssentialFiles() {
    if(!fs.existsSync("./cache"))
        fs.mkdirSync("./cache");
}