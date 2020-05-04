const { randomItemInList, randomNumber } = require('./randomness');

exports.fakeUserAgent = () => {
    let androidVersion = randomItemInList([ "2.3.3", "3.0", "4.1", "4.4.4", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0" ]);
    let modelName = randomItemInList([ "LG-L160L", "HTC Sensation", "HTC Vision", "LG-LU3000", "HTC_DesireS_S510e", "HTC Legend", "SonyEricssonX10i", "MI6", "MI7", "MI8", "MI9" ]);
    let buildVersion = randomItemInList([ "R2BA026", "2.0.A.0.504", "FRG83D", "FRF91", "GRI40", "GRJ90", "IML74K", "GRJ22" ]);
    let chromeVersion = randomItemInList([ "70.0.3538", "55.0.2919", "54.0.2866", "53.0.2820", "52.0.2762", "49.0.2656", "44.0.2403", "41.0.2228", "41.0.2227", "41.0.2227", "41.0.2226"]) + "." + randomNumber(0, 200)
    return `Mozilla/5.0 (Linux; Android ${androidVersion}; ${modelName} Build/${buildVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Mobile Safari/537.36`;
}

exports.getAppVersion = (userAgent) => {
    var index = userAgent.indexOf("/");
    return index != -1 ? userAgent.substring(index + 1, userAgent.length) : userAgent;
}