class ItemPrice {
    constructor() {
        this.keys = 0;
        this.ref = 0;
    }
}

export function parseItemPrice(priceString) {
    // 3 Cases
    // 2 keys, 34.55 ref
    // 2 keys
    // 34.55 ref
    //Remove commas and split by spaces

    let splitPriceString = priceString.replace(",","").split(" ");
    let itemPrice = new ItemPrice();
    //Case 1
    if(splitPriceString.length > 2) {
        itemPrice.keys = splitPriceString[0];
        itemPrice.ref = splitPriceString[2];
        return itemPrice;
    }
    //Case 2 & 3
    itemPrice[splitPriceString[1]] = splitPriceString[0];
    return itemPrice;
    
}

export function getRefDifference(programMemory, price1, price2) {
    return parseFloat(
        (price1.ref - price2.ref + (price1.keys - price2.keys) * programMemory.keyPrice)
        .toFixed(2)
    );
}