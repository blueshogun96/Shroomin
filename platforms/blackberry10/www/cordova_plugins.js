cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-game-center/www/gamecenter.js",
        "id": "cordova-plugin-game-center.GameCenter",
        "pluginId": "cordova-plugin-game-center",
        "clobbers": [
            "gamecenter"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-game-center": "0.4.2",
    "cordova-plugin-whitelist": "1.2.1"
}
// BOTTOM OF METADATA
});