
const { randomString } = require('./randomness');

/**
 * Class Event
 * @param {} type 
 */
function Event(type) {

    this.type = type;


    // key event
    this.keyCode = 0;
    this.charCode = 0;
    this.shiftKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.altKey = false;
    this.isTrusted = true;

    // touch event/ mouse event
    this.pageX = 0;
    this.pageY = 0;
    this.clientX = 0;
    this.clientY = 0;

    // mouse event
    this.which = 0;
    this.target = null;
    this.toElement = null;

    // deviceorientation event
    this.alpha = -1;
    this.beta = -1;
    this.gamma = -1;

    // devicemotion
    this.acceleration = {
        x: -1,
        y: -1,
        x: -1,
    };
    this.accelerationIncludingGravity = {
        x: -1,
        y: -1,
        x: -1,
    }
    this.rotationRate = {
        alpha : -1,
        beta : -1,
        gamma : -1
    }
}


/**
 * Class PluginArray
 */
function PluginArray() {
    this.length = 0;
}
PluginArray.prototype.add = function(plugin) {
    this[this.length] = plugin;
    this[plugin.name] = plugin;
    this.length++;
}
PluginArray.prototype.item = function(index) {
    return this[index];
}
PluginArray.prototype.namedItem = function(name) {
    return this[name];
}
PluginArray.prototype.refresh = function() {
    // do nothing
}
function createPluginArray(plugins) {
    const pluginArray = new PluginArray();
    for (var key in plugins) {
        var plugin = plugins[key];
        pluginArray.add(plugin);
    }
    return pluginArray;
}

function HTMLCollection() {
    this.length = 0;
}
HTMLCollection.prototype.add = function(plugin) {
    this[this.length] = plugin;
    this[plugin.name] = plugin;
    this.length++;
}
HTMLCollection.prototype.item = function(index) {
    return this[index];
}
HTMLCollection.prototype.namedItem = function(name) {
    return this[name];
}

/**
 * Class Context2D of canvas
 */
function Context2D() {
    this.fillStyle = null;
    this.font = null;
    this.strokeStyle = null;
    this.font = null;
    this.rVal = null;

    this._text = "";
}
Context2D.prototype.fillRect = function (x, y, w, h) {
}
Context2D.prototype.fillText = function (text, x, y) {
    this._text = text;
}
Context2D.prototype.arc = function (x, y, w, h, r, b) {
}
Context2D.prototype.stroke = function () {
}

/**
 * Class DOMElement
 * @param {} tagName 
 */
function DOMElement(tagName) {
    this.tagName = tagName;

    this.width = 0;
    this.height = 0;
    this.offsetWidth = 0;
    this.offsetHeight = 0;
    this.clientWidth = 0;
    this.clientHeight = 0;

    this.style = {};
    this.childNodes = [];

    this.innerHTML = "";

    this.attributes = {
        id: null,
        name: null,
        required: false,
        type: null,
        autocomplete: false,
    };
    this.defaultValue = null;
    this.value = null;
    this._context2D = new Context2D();

    this.window = null;
    this.canvas = null;

    this._randomDataURLMap = {};

    this._domChangedListners = [];
}
DOMElement.prototype.getAttribute = function (key) {
    return typeof (this.attributes[key]) != "undefined" ? this.attributes[key] : null;
}
DOMElement.prototype.setAttribute = function (key, value) {
    this.attributes[key] = value;
}
DOMElement.prototype.getContext = function (type) {
    if (type == "2d") {
        return this._context2D;
    }
}
DOMElement.prototype.toDataURL = function () {
    // TODO: mock canvas's data URL
    var text = this._context2D._text;
    if (typeof(this._randomDataURLMap[text]) == "undefined") { 
        this._randomDataURLMap[text] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA" + randomString(100);;
    }
    console.log("toDataURL", text, this._randomDataURLMap[text]);
    return this._randomDataURLMap[text];
}
DOMElement.prototype.appendChild = function (child) {
    console.log("DOMElement", "appendChild", child);
    this.childNodes.push(child);
    this._notifyDOMChanged("appendChild", this, child);
}
DOMElement.prototype.removeChild = function (child) {
    console.log("DOMElement", "removeChild", child);
    // TODO: this.childNodes.remove(child);
    this._notifyDOMChanged("removeChild", this, child);
}
DOMElement.prototype.addDOMChangedListener = function (listener) {
    this._domChangedListners.push(listener);
}
DOMElement.prototype._notifyDOMChanged = function (event, parent, child) {
    for (var key in this._domChangedListners) {
        var listener = this._domChangedListners[key];
        if (typeof(listener) == "function") {
            listener(event, parent, child);
        }
    }
}

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

function MemoryLocalStorage(cache) {
    this._cache = cache;
}
MemoryLocalStorage.prototype.setItem = function (key, value) {
    this._cache[key] = value;
}
MemoryLocalStorage.prototype.getItem = function (key) {
    if (typeof(this._cache[key]) != "undefined") {
        return this._cache[key];
    }
    return null;
}
MemoryLocalStorage.prototype.removeItem = function (key) {
    if (typeof(this._cache[key]) != "undefined") {
        delete this._cache[key];
    }
}
MemoryLocalStorage.prototype.clear = function () {
    for (var key in Objects.keys(this._cache)) {
        delete this._cahche[key];
    }
}

function createVirtualWindow(props, state) {

    /**
     * window
     */
    var window = {};
    window.window = window; // self

    window.setInterval = setInterval;
    window.setTimeout = setTimeout;
    window.clearInterval = clearInterval;
    window.clearTimeout = clearTimeout

    const width = state.width; 
    const height = state.height;

    window.ActiveXObject = undefined;  // disable ActiveXObject
    window.openDatabase = undefined;   // disable Web Database

    window.outerWidth = width;
    window.innerWidth = width;
    window.innerHeight = height;

    window.sessionStorage = new MemoryLocalStorage(state.sessionStorage);
    window.localStorage = new MemoryLocalStorage(state.localStorage);
    window.indexedDB = {};

    window.XPathResult = function () { };

    var bodyElement = new DOMElement("body");
    bodyElement.addDOMChangedListener(props.onDOMChangedListener);
    bodyElement.clientWidth = window.innerWidth;
    bodyElement.clientHeight = window.innerHeight;

    var headElement = new DOMElement("head");
    headElement.addDOMChangedListener(props.onDOMChangedListener);

    var htmlElement = new DOMElement("html");
    htmlElement.addDOMChangedListener(props.onDOMChangedListener);
    htmlElement.appendChild(headElement);
    htmlElement.appendChild(bodyElement);

    window.performance = {
        now: function () {
            return new Date().getTime();
        }
    }

    window.document = {
        location: {
            URL: null, // same as document.URL, controlled by state
            protocol: null, // controlled by state
            hostname: null, // controlled by state
        },
        URL: null, // controlled by state
        documentURI: null, // same as document.URL, controlled by state
        readyState: state.readyState,
        referrer: state.referrer, 
        hidden: false,
        webkitHidden: false,
        cookie: state.cookieAsString,  
        body: bodyElement,
        documentElement: htmlElement,
        all: [ htmlElement ], // TODO: HTMLAllCollection
        activeElement: state.activeElement, 

        getElementsByTagName: function (tagName) {
            var elements = new HTMLCollection();
            walkDOMElement(this.documentElement, function (elem) {
                if (elem.tagName == tagName) {
                    elements.add(elem);
                }
                return false;
            });
            return elements;
        },
        getElementById: function (id) {
            var element = null;
            walkDOMElement(this.documentElement, function (elem) {
                if (elem.getAttribute("id") == id) {
                    element = elem;
                    return true; // break
                }
                return false;
            });
            return element;
        },
        getElementsByName: function (name) {
            var elements = [];
            walkDOMElement(this.documentElement, function (elem) {
                if (elem.getAttribute("name") == name) {
                    elements.push(elem);
                }
                return false;
            });
            return elements;
        },
        eventListeners: {},
        addEventListener: function (eventType, listener) {
            if (typeof (this.eventListeners[eventType]) == "undefined") {
                this.eventListeners[eventType] = [];
            }
            this.eventListeners[eventType].push(listener);
        },
        attachEvent: function (eventType, listener) { },
        _postEvent: function (event) {
            if (typeof (this.eventListeners[event.type]) != "undefined") {
                var listeners = this.eventListeners[event.type];
                for (var key in listeners) {
                    var listener = listeners[key];
                    listener(event);
                }
            } else if (event.type == "onfocus") {
                window.onfocus(event)
            } else if (event.type == "onblur") {
                window.onblur(event)
            }
        },

        createElement: function (tagName) {
            var elem = new DOMElement(tagName);
            elem.addDOMChangedListener(props.onDOMChangedListener);
            elem.window = window;
            return elem;
        }
    };

    window.screen = {
        availHeight: height,
        availLeft: 0,
        availTop: 0,
        availWidth: width,
        colorDepth: props.colorDepth,
        pixelDepth: props.colorDepth,
        height: height,
        width: width,
        orientation: {
            angle: 0,
            onchange: null,
            type: "portrait-primary",
        }
    };

    window.onblur = function (e) {};
    window.onfocus = function (e) {};

    window.navigator = {
        userAgent: props.userAgent,
        appVersion: "", 
        productSub: props.productSub,
        vendor: props.vendor,
        language: props.language,
        product: props.product,
        plugins: createPluginArray(state.plugins),
        credentials: {},
        bluetooth: {},
        storage: {},
        getGamepads: function() {},
        hardwareConcurrency: 8,
        mediaDevices: {},
        permissions: {
            query: function(permission) {
                return new Promise((resolve, reject) => {
                    var name = permission.name;
                    var permissionState = typeof(state.permissions[name]) != "undefined" ? state.permissions[name] : "";
                    resolve({
                        state: permissionState
                    })
                });
            },
            _allPermissions: state.permissions
        },  
        registerProtocolHandler: function() {},
        requestMediaKeySystemAccess: function() {},
        sendBeacon: function() {},
        serviceWorker: {},
        webkitTemporaryStorage: {},

        onLine: true,
        vibrate: function () { },
        getBattery: function () { },
        javaEnabled: function () { return false; },
        doNotTrack: null,
        cookieEnabled: true,
    };

    window.RTCPeerConnection = function () { };
    window.addEventListener = function (event, listener) {
        this.document.addEventListener(event, listener);
     };
    window.DeviceOrientationEvent = function () { };
    window.DeviceMotionEvent = function () { };
    window.TouchEvent = function () { };
    window.PointerEvent = function() {};
    window.HTMLElement = function() {};
    window.HTMLElement.prototype.toString = function() {
        return "function HTMLElement() { [native code] }";
    }
    window.RTCPeerConnection = function() {};
    window.webkitRTCPeerConnection = function() {};
    window.FileReader = function() {};

    window.chrome = {};

    window.AJAX = {
        listeners: [],
        addEventListener: function (listener) {
            this.listeners.push(listener);
        },
        postEvent(eventType, eventData) {
            for (var key in this.listeners) {
                this.listeners[key](eventType, eventData);
            }
        }
    };

    var requestId = 1;
    window.XMLHttpRequest = function () {
        this.onload = function () { };
        this.onreadystatechange = function () { };

        /**
         *  0	UNSENT 
         *  1	OPENED 
         *  2	HEADERS_RECEIVED 
         *  3	LOADING	 
         *  4	DONE 
         */
        this.readyState = 4; 
        this.response = null;
        this.responseText = null;
        this.responseType = null;
        this.responseURL = null;
        this.responseXML = null;
        this.responseState = 200;
        this.responseStateText = "200 OK";
        this.timeout = 0;

        this.withCredentials = true;

        this._method = null;
        this._url = null;
        this._async = false;
        this._data = null;
        this._headers = [];
        this._requestId = requestId++;

        window.AJAX.postEvent("<init>", this);
    }
    window.XMLHttpRequest.prototype.open = function (method, url, async) {
        this._method = method;
        this._url = url;
        this._async = async;
        window.AJAX.postEvent("open", this);
    }
    window.XMLHttpRequest.prototype.send = function (data) {
        this._data = data;
        window.AJAX.postEvent("send", this);
        // NOTE: call this.onreadystatechange(); function in callback
    }

    window.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        this._headers[header] = value;
        window.AJAX.postEvent("setRequestHeader", this);
    }

    return window;
}

exports.createVirtualWindow = createVirtualWindow;
exports.Event = Event;