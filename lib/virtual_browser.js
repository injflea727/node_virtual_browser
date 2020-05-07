
const virtual_window = require("./virtual_window");
const createVirtualWindow = virtual_window.createVirtualWindow;
const Event = virtual_window.Event;
const URL = require('url');
const vm = require('vm');
const fs = require("fs");
const { performance } = require('perf_hooks');
const { randomNumber, randomString, randomItemInList, randomItemsInList, randomBoolean } = require('./randomness');
const { fakeUserAgent, getAppVersion } = require("./user_agent");
const { fakePlugins } = require("./plugins");

function walkDOMElement(node, walker) {
    if (walker(node)) {
        return;
    }
    if (node.childNodes) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
            walkDOMElement(child, walker);
        }
    }
}

function removeItem(arr, value) { 
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}


class VirtualBrowser {

    constructor(props, state, loaders = {}) {
        // browser props (unchangeable)
        const colorDepth = randomItemInList([24, 16]);

        const userAgent = typeof(props.userAgent) != "undefined" ? props.userAgent : fakeUserAgent();
        this.props = {
            userAgent: userAgent,
            appVersion: getAppVersion(userAgent),
            acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.8",
            colorDepth: colorDepth,
            productSub: randomNumber(2003, 2020) + "" + randomNumber(10, 12) + "" + randomNumber(10, 30),
            vendor: randomItemInList(["Google Inc.", ""]),
            language: randomItemInList(["zh-CN", "en-US"]),
            product: "Gecko",
            appName: "Netscape",
            platform: "Win32",
            enableFlash: false,
            onDOMChangedListener: this._onDOMChangedListener.bind(this),
            ...props
        };

        // browser state (changeable)
        const screenResolution = randomItemInList([ [1366, 768], [1600, 900], [1920, 1080], [3840, 2160], [1440, 900], [2560, 1600], [2880, 1800] ]);
        var subPlugins = fakePlugins(this.props.enableFlash, true)

        var permissionStateList = ["prompt", "granted", "denied"];
        var allPermissions = {
            'geolocation': randomItemInList(permissionStateList),
            'notifications': randomItemInList(permissionStateList),
            'push': randomItemInList(permissionStateList),
            'midi': randomItemInList(permissionStateList),
            'camera': randomItemInList(permissionStateList),
            'microphone': randomItemInList(permissionStateList),
            'speaker': randomItemInList(permissionStateList),
            'device-info': randomItemInList(permissionStateList),
            'background-sync': randomItemInList(permissionStateList),
            'bluetooth': randomItemInList(permissionStateList),
            'persistent-storage': randomItemInList(permissionStateList),
            'ambient-light-sensor': randomItemInList(permissionStateList),
            'accelerometer': randomItemInList(permissionStateList),
            'gyroscope': randomItemInList(permissionStateList),
            'magnetometer': randomItemInList(permissionStateList),
            'clipboard': randomItemInList(permissionStateList),
            'accessibility-events': randomItemInList(permissionStateList),
            'clipboard-read': randomItemInList(permissionStateList),
            'clipboard-write': randomItemInList(permissionStateList),
            'payment-handler': randomItemInList(permissionStateList),
        };
        this.state = {
            url: null,
            referrer: null,
            cookies: [],
            activeElement: null, // TODO
            width: screenResolution[0],
            height: screenResolution[1],
            plugins: subPlugins,
            permissions: allPermissions,
            sessionStorage: {},
            localStorage: {},
            readyState: "complete", //  [ "loaded", "complete", "interactive" ]
            ...state
        };

        this._loaders = {
            //"text/javascript": new JavascriptResourceLoader(),
            ...loaders
        }

        this._init();
    }

    reset() {
        this._init();
    }

    _init() {
        this.window = createVirtualWindow(this.props, this.state);
        this.window.performance.now = performance.now;
        //this.window.createCanvas = createCanvas;
        this.performance = this.window.performance;
        this.document = this.window.document;
        this.screen = this.window.screen;
        this.navigator = this.window.navigator;
        this.XMLHttpRequest = this.window.XMLHttpRequest;

        vm.createContext(this.window);

        this._pendingResources = [];

        this._initWithProps(this.props);
        this._initWithState(this.state);
    }

    _initWithProps(props) {
        this._setWindowUserAgent(props.userAgent);
    }

    _initWithState(state) {
        this.setUrl(state.url);
    }

    setState(newState) {
        for (var key in newState) {
            var value = newState[key];
            if (key == "url") {
                if (value) {
                    var parsedUrl = URL.parse(value);
                    this.document.URL = parsedUrl.href;
                    this.document.documentURI = parsedUrl.href;
                    this.document.location.URL = parsedUrl.href;
                    this.document.location.protocol = parsedUrl.protocol;
                    this.document.location.hostname = parsedUrl.hostname;
                    setTimeout(() => {
                        this.setState({readyState: "complete"});
                    }, 100);
                }
            } else if (key == "referrer") {
                this.document.referrer = value;
            } else if (key == "cookies") {
                this.document.cookie = this._getCookiesAsString(value);
            } else if (key == "readyState") {
                this.document.readyState = value;
                if (value == "loaded" || value == "complete") {
                    this.simulateDOMContentLoadedEvent();
                }
            }
        }
        var oldState = this.state;
        this.state = {
            ...oldState,
            ...newState
        };
    }

    _onDOMChangedListener(event, parentElem, childElem) {
        if (event == "appendChild") {
            walkDOMElement(childElem, (node) => {
                if (node.tagName == "script") {
                    var resource = { "type" : "script", "src": node.getAttribute("src")};
                    this._pendingResources.push(resource);
                    this._loadResource(resource).then(result => { 
                        console.log("load resource result", result) 
                        if (result) {
                            const js = result;
                            this.evalJavascriptCode(js);
                        }
                        removeItem(this._pendingResources, resource);
                    }).catch(error => { 
                        console.error("load resoure error", error);
                        removeItem(this._pendingResources, resource);
                     });
                }
            });
        } else if (event == "removeChild") {
            // TODO:
        }
    }

    isLoadResourcesCompleted() {
        return this._pendingResources.length == 0;
    }

    async _loadResource(resource) {
        const loader = typeof(this._loaders[resource.type]) != "undefined" ? this._loaders[resource.type] : null;
        if (loader) {
            return loader.load(this, resource);
        } else {
            return Promise.reject("no loader for resource type " + resource.type);
        }
    }

    storeToJSON() {
        return {
            props: { ...this.props},
            state: { ...this.state}
        }
    }

    addCookie(cookie) {
        var newCookies = [
            ...this.state.cookies,
            cookie
        ];
        this.setState({cookies: newCookies});
    }

    setCookies(newCookies) {
        this.setState({cookies: newCookies});
    }

    _getCookiesAsString(cookies) {
        var cookie = "";
        for (var key in cookies) {
            var c = cookies[key];
            cookie += c.key + "=" + c.value + "; ";
        }
        return cookie;
    }

    _setWindowUserAgent(userAgent) {
        this.window.navigator.userAgent = userAgent;
    }

    setUrl(url) {
        this.setState({url: url});
    }

    setReferrer(referrer) {
        this.setState({referrer: referrer});
    }

    evalJavascriptCode(javascriptCode) {
        return vm.runInContext(javascriptCode, this.window);
    }

    evalJavascriptFile(filename) {
        const javascriptCode = fs.readFileSync(filename, {encoding: "utf-8"});
        return vm.runInContext(javascriptCode, this.window, {filename: filename});
    }

    _createKeyEvent(type, keyCode) {
        var event = new Event(type);
        event.which = event.keyCode = keyCode;
        return event;
    }

    _createMouseEvent(type, x, y, target) {
        var event = new Event(type);
        event.pageX = event.clientX = x;
        event.pageY = event.clientY = y;
        event.target = event.toElement = target;
        event.which = null;
        return event;
    }

    _createClickEvent(type, x, y, target) {
        var event = new Event(type);
        event.pageX = event.clientX = x;
        event.pageY = event.clientY = y;
        event.target = event.toElement = target;
        event.which = null;
        return event;
    }

    _createTouchEvent(type, x, y, target) {
        var event = new Event(type);
        event.pageX = event.clientX = x;
        event.pageY = event.clientY = y;
        event.target = event.toElement = target;
        event.which = null;
        return event;
    }

    _postEvents(events) {
        for (var key in events) {
            var event = events[key];
            this.document._postEvent(event);
        }
    }

    simulateDOMContentLoadedEvent() {
        var event = new Event("DOMContentLoaded");
        this._postEvents([event]);
    }
    
    simulateKeyEvent(keyCode, activeElement) {
        this.document.activeElement = activeElement;
        var events = [
            this._createKeyEvent("keydown", keyCode),
            this._createKeyEvent("keypress", keyCode),
            this._createKeyEvent("keyup", keyCode)
        ];

        this._postEvents(events);
        this.document.activeElement = null;
    }

    simulateClickEvent(x, y, target) {
        this.document.activeElement = target;
        var events = [
            this._createClickEvent("click", x, y, target),
        ];

        this._postEvents(events);
        this.document.activeElement = null;
    }

    simulateMouseEvent(x, y, target) {
        this.document.activeElement = target;
        var events = [];
        events.push(this._createMouseEvent("mousedown", x, y, target));
        for (var i = 0; i < 20; i++) {
            x += Math.random() * 10;
            y += Math.random() * 10;
            events.push(this._createMouseEvent("mousemove", x, y, target));
        }
        events.push(this._createMouseEvent("mouseup", x, y, target));
        this._postEvents(events);
        this.document.activeElement = null;
    }

    simulateTouchEvent(x, y, target) {
        this.document.activeElement = target;
        var events = [
            this._createTouchEvent("touchstart", x, y, target),
            //this._createTouchEvent("touchmove", x, y, target),
            this._createTouchEvent("touchend", x, y, target),
            //this._createTouchEvent("touchcancel", x, y, target)
        ];
        this._postEvents(events);
        this.document.activeElement = null;
    }

    simulateDeviceorientationEvent(alpha, beta, gamma) {
        var event = new Event("deviceorientation");
        event.alpha = alpha;
        event.beta = beta;
        event.gamma = gamma;
        this._postEvents([event]);
    }

    simulateDevicemotionEvent(acceleration, accelerationIncludingGravity, rotationRate) {
        var event = new Event("devicemotion");
        event.acceleration = acceleration;
        event.accelerationIncludingGravity = accelerationIncludingGravity;
        event.rotationRate = rotationRate;
        this._postEvents([event]);
    }

    simulateOnfocusEvent() {
        var events = [
            new Event("onblur"),
            new Event("onfocus")
        ];
        this._postEvents(events);
    }

    addDOMElements(elements) {
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];

            var elem = this.document.createElement(element.tagName);
            for (var key in element.attribute) {
                elem.setAttribute(key, element.attribute[key]);
            }
            elem.value = element.value;
            elem.defaultValue = element.defaultValue;
            this.document.body.appendChild(elem);
        }
    }

    addAjaxEventListener(listener) {
        this.window.AJAX.addEventListener(listener);
    }
}

module.exports = VirtualBrowser;





