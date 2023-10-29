const Xray = require('x-ray');
const fs = require('fs');
const { title } = require('process');
const x = Xray()



const links = [
    "https://backpack.tf/stats/Unique/Taunt%3A%20Conga/Tradable/Craftable",
    "https://backpack.tf/stats/Unique/Taunt%3A%20Square%20Dance/Tradable/Craftable",
    "https://backpack.tf/stats/Unique/Taunt%3A%20Skullcracker/Tradable/Craftable",
];


fs.unlinkSync("./data.csv");


for(let link of links) {
    x(link, ".col-md-6", [{
        name: '.item@title',
        value: '.item@data-listing_price',
        comment: '.item@data-listing_comment',
    }])
    ((err, result) => {
        result = result.slice(0,2);

        for(let titles of result) {
            
            

            console.log(titles.name);
            console.log(titles.value);
            if(titles.comment)
            {
                console.log(titles.comment);
                titles.comment = Buffer.from(titles.comment, 'ascii').toString('utf-8');
            }
            else
                titles.comment = "";
            fs.appendFileSync("./data.csv", titles.name + ";" + titles.value + ";" + titles.comment + "\n");

        }
    });
}