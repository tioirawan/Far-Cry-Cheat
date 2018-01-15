"use strict";

var _electron3 = require("electron");

var _electron4 = _interopRequireDefault2(_electron3);

var _path3 = require("path");

var _path4 = _interopRequireDefault2(_path3);

var _url3 = require("url");

var _url4 = _interopRequireDefault2(_url3);

var _fs3 = require("fs");

var _fs4 = _interopRequireDefault2(_fs3);

var _xml2js3 = require("xml2js");

var _xml2js4 = _interopRequireDefault2(_xml2js3);

function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}

var _electron2 = _interopRequireDefault(_electron4.default);

var _path2 = _interopRequireDefault(_path4.default);

var _url2 = _interopRequireDefault(_url4.default);

var _fs2 = _interopRequireDefault(_fs4.default);

var _xml2js2 = _interopRequireDefault(_xml2js4.default);
/**
 * @param {string} url
 * @return {?}
 */
function _interopRequireDefault(url) {
    return url && url.__esModule ? url : {
        default: url
    };
}
var app = _electron2.default.app;
var BrowserWindow = _electron2.default.BrowserWindow;
var ipcMain = _electron2.default.ipcMain;
/** @type {string} */
var gameProfilePath1 = getUserHome() + "\\Documents\\My Games\\";
/** @type {string} */
var gameProfilePath2 = "\\GamerProfile.xml";
var mainWindow = void 0;
/**
 * @return {undefined}
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        icon: __dirname + "/assets/images/icon.ico",
        width: 800,
        height: 500,
        webPreferences: {
            devTools: false
        }
    });
    mainWindow.loadURL(_url2.default.format({
        pathname: _path2.default.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));
    mainWindow.on("closed", function () {
        /** @type {null} */
        mainWindow = null;
    });
    mainWindow.setMenu(null);
}
app.on("ready", createWindow);
app.on("window-all-closed", function () {
    app.quit();
});
app.on("activate", function () {
    if (null === mainWindow) {
        createWindow();
    }
});
ipcMain.on("cheat:data", function (dataAndEvents, e) {
    var baseDir = gameProfilePath1 + e.game + gameProfilePath2;
    if (_fs2.default.existsSync(baseDir)) {
        _fs2.default.readFile(baseDir, "utf8", function (err, data) {
            if (err) {
                handleError(err);
            }
            /** @type {string} */
            var optsData = "";
            _xml2js2.default.parseString(data, function (err, _) {
                if (err) {
                    handleError(err);
                }
                _.GamerProfile.GameProfile[0] = {
                    $: {}
                };
                e.cheat.forEach(function (field) {
                    /** @type {number} */
                    var b = 0;
                    if (field.isChecked) {
                        /** @type {number} */
                        b = 1;
                        optsData += field.value + " ";
                    }
                    /** @type {number} */
                    _.GamerProfile.GameProfile[0].$[field.value] = b;
                });
                var buf = new _xml2js2.default.Builder().buildObject(_);
                _fs2.default.writeFile(baseDir, buf, function (err, dataAndEvents) {
                    if (err) {
                        handleError(err);
                    }
                    if (optsData) {
                        handleError("Berhasil!, cheat yang aktif : " + optsData);
                    } else {
                        handleError("Oops!, tidak ada cheat yang aktif ");
                    }
                });
            });
        });
    } else {
        handleError("terjadi kesalahan!, tidak dapat menemukan file game");
    }
});
/**
 * @return {?}
 */
function getUserHome() {
    return process.env["win32" == process.platform ? "USERPROFILE" : "HOME"];
}
/**
 * @param {string} err
 * @return {undefined}
 */
function handleError(err) {
    console.log(err);
    mainWindow.webContents.send("cheat:error", err);
}
