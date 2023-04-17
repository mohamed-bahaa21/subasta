const convertBase64ToBuffer = (base64Image) => {
    let buffer;

    if (base64Image.startsWith("data")) {
        // the prefix needs to be chunked.
        let cleanBase46 = base64Image.split("base64,")[1];
        buffer = Buffer.from(cleanBase46, "base64");
    } else {
        // it is chunked
        buffer = Buffer.from(base64Image, "base64");
    }
    return buffer;
};

const convertBufferToBase64 = (buffer, withPrefix = true) => {
    let base64 = buffer.toString("base64");

    // need the prefix
    if (withPrefix) {
        let prefixedBase46 = "data:image/png;base64," + base64;
        return prefixedBase46;
    }

    return base64;
};

const removePrefixFromBase64 = (base64Image) => {
    let newBase46 = base64Image.split("base64,")[1];
    return newBase46;
};

const addPrefixToBase64 = (nonPrefixedBase64) => {
    let prefixedBase46 = "data:image/png;base64," + nonPrefixedBase64;

    return prefixedBase46;
};

const checkIsBase64AndNotUrl = (string) => {
    if (string.startsWith("http")) {
        // its url, return false.
        return false;
    } else {
        return true;
    }
};

module.exports.convertBase64ToBuffer = convertBase64ToBuffer;
module.exports.convertBufferToBase64 = convertBufferToBase64;
module.exports.removePrefixFromBase64 = removePrefixFromBase64;
module.exports.addPrefixToBase64 = addPrefixToBase64;
module.exports.checkIsBase64AndNotUrl = checkIsBase64AndNotUrl;
