const assert = require('assert');
const VirtualBrowser = require("../lib/virtual_browser");

describe('VirtualBrowser', function () {
    it('custom user agent', function () {
        const props = {
            userAgent: "Chrome"
        };
        const state = {};
        const browser = new VirtualBrowser(props, state);
        const window = browser.window;
        assert.equal(props.userAgent, window.navigator.userAgent);
    });

    it('random user agent', function () {
        const props = {};
        const state = {};

        var browser;
        var usedUserAgentList = [];
        for (var i = 0; i < 100; i++) {
            browser = new VirtualBrowser(props, state);
            var userAgent = browser.window.navigator.userAgent;
            //console.log(userAgent);
            assert.equal(usedUserAgentList.indexOf(userAgent), -1); // random user-agent
            usedUserAgentList.push(userAgent);
        }
    });

    it('browser props not empty', function () {
        const props = {};
        const state = {};
        const browser = new VirtualBrowser(props, state);
        const window = browser.window;
        assert.ok(!!window.navigator.userAgent);
        assert.ok(!!window.screen.colorDepth);
        assert.ok(!!window.screen.pixelDepth);
        assert.ok(!!window.navigator.productSub);
        assert.ok(window.navigator.vendor != null); // maybe ""
        assert.ok(!!window.navigator.language);
        assert.ok(!!window.navigator.product);
    });

    it('set url and referrer', function () {
        const props = {
        };
        const state = {
            url: "http://www.google.com",
            referrer: "http://www.baidu.com"
        };
        const browser = new VirtualBrowser(props, state);
        const window = browser.window;
        assert.equal("http://www.google.com/", window.document.URL);
        assert.equal("http://www.google.com/", window.document.documentURI);
        assert.equal("http://www.google.com/", window.document.location.URL);
        assert.equal("http:", window.document.location.protocol);
        assert.equal("www.google.com", window.document.location.hostname);
        assert.equal(state.referrer, window.document.referrer);
    });

    it('simulate DOMContentLoaded', function () {
        const props = {
        };
        const state = {
            url: "http://www.google.com",
        };
        const browser = new VirtualBrowser(props, state);
        var count = 0;
        browser.window.addEventListener("DOMContentLoaded", (event) => {
            console.log(`loaded completed ${count}`);
            assert.equal(browser.window.document.readyState, "complete");
            count++;
        });
        browser.setUrl("http://www.baidu.com");
    });

    it("set cookies", function () {
        const props = {
        };
        const state = {
        };
        const browser = new VirtualBrowser(props, state);
        const window = browser.window;

        browser.addCookie({ key: "ck1key",  value: "ck1value" });
        assert.ok(window.document.cookie.indexOf("ck1key=ck1value;") != -1);

        browser.addCookie({ key: "ck2key",  value: "ck2value" });
        assert.ok(window.document.cookie.indexOf("ck2key=ck2value;") != -1);

        browser.setCookies([{ key: "newck1key", value: "newck1value"}]);
        assert.ok(window.document.cookie.indexOf("newck1key=newck1value;") != -1);
        assert.equal(window.document.cookie.indexOf("ck1key=ck1value;"), -1);
        assert.equal(window.document.cookie.indexOf("ck2key=ck2value;"), -1);
    });
});