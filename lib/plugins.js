
const { randomNumber, randomString, randomItemInList, randomItemsInList, randomBoolean } = require('./randomness');


const plugins = [
    {
        name: 'WebEx64 General Plugin Container',
        filename: "webex-plugin",
        description: "",
        version: "",
    },
    {
        name: 'YouTube Plug-in',
        filename: "youtube-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Java Applet Plug-in',
        filename: "java-applet-plugin",
        description: "",
        version: "",
    },
    {
        name: 'iPhotoPhotocast',
        filename: "iPhotoPhotocast-plugin",
        description: "",
        version: "",
    },
    {
        name: 'SharePoint Browser Plug-in',
        filename: "SharePoint-Browser-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Chrome Remote Desktop Viewer',
        filename: "chrome-remote-destop-viewer",
        description: "",
        version: "",
    },
    {
        name: 'Chrome PDF Viewer',
        filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
        description: "",
        version: "",
    },
    {
        name: 'Chrome PDF Plugin',
        filename: "internal-pdf-viewer",
        description: "",
        version: "",
    },
    {
        name: 'Native Client',
        filename: "internal-nacl-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Unity Player',
        filename: "unity-player-plugin",
        description: "",
        version: "",
    },
    {
        name: 'WebKit-integrierte PDF',
        filename: "webkit-integrierte-pdf-plugin",
        description: "",
        version: "",
    },
    {
        name: 'QuickTime Plug-in',
        filename: "quickTime-plugin",
        description: "",
        version: "",
    },
    {
        name: 'RealPlayer Version Plugin',
        filename: "realplayer-plugin",
        description: "",
        version: "",
    },
    {
        name: 'RealPlayer(tm) G2 LiveConnect-Enabled Plug-In (32-bit)',
        filename: "realplayer-liveconnect-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Mozilla Default Plug-in',
        filename: "mozilla-default-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Adobe Acrobat',
        filename: "adobe-acrobat-plugin",
        description: "",
        version: "",
    },
    {
        name: 'AdobeAAMDetect',
        filename: "adobe-aam-detect-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Google Earth Plug-in',
        filename: "google-earth-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Java Plug-in 2 for NPAPI Browsers',
        filename: "java-npapi-browser-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Widevine Content Decryption Module',
        filename: "widevine-content-decyption-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Microsoft Office Live Plug-in',
        filename: "microsoft-office-live-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Windows Media Player Plug-in Dynamic Link Library',
        filename: "windows-media-player-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Google Talk Plugin Video Renderer',
        filename: "google-talk-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Edge PDF Viewer',
        filename: "edge-pdf-viewer",
        description: "",
        version: "",
    },
    {
        name: 'Shockwave for Director',
        filename: "sockwave-for_director-plugin",
        description: "",
        version: "",
    },
    {
        name: 'Default Browser Helper',
        filename: "default-browser-helper",
        description: "",
        version: "",
    },
    {
        name: 'Silverlight Plug-In',
        filename: "silverlight-plugin",
        description: "",
        version: "",
    },
   
];
const flashPlugin =  {
    name: 'Shockwave Flash',
    filename: "shockwave-flash-plugin",
    description: "",
    version: "",
};

function fakePlugins(enableFlashPlugin, addRandomPlugin = true) {
    var plugins = randomItemsInList(plugins, randomNumber(0, plugins.length - 1));
    if (enableFlashPlugin) {
        plugins.push(flashPlugin);
    }
    if (addRandomPlugin) {
        plugins.push({
            name: randomString(10) + " " + "Plug-In",
            filename: randomString(16),
            description: "",
            version: "",
        });
    }
    return plugins; 
}
 module.exports.fakePlugins = fakePlugins