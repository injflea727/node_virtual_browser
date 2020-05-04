const randomNumber = (minimum, maximum) => {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

const randomString = (length) => {
    var s = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        s += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return s;
}

const randomItemInList = (list) => {
    return list[randomNumber(0, list.length - 1)];
}

const randomItemsInList = (list, length) => {
    if (length > list.length) {
        return [...list];
    }
    var result = [];
    while (result.length < length) {
        var item = randomItemInList(list);
        if (result.indexOf(item) == -1) {
            result.push(item);
        }
    }
    return result;
};

const randomBoolean = () => {
    return randomItemsInList([true, false]);
}

exports.randomNumber = randomNumber;
exports.randomString = randomString;
exports.randomItemInList = randomItemInList;
exports.randomItemsInList = randomItemsInList;
exports.randomBoolean = randomBoolean;