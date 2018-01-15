const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const xml2js = require('xml2js');

const gameProfilePath1 = getUserHome() + "\\Documents\\My Games\\";
const gameProfilePath2 = "\\GamerProfile.xml";

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        icon: __dirname + '/assets/images/icon.ico',
        width: 800,
        height: 500,
        webPreferences: {
            devTools: false
        }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.setMenu(null);
}

app.on("ready", createWindow);

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

ipcMain.on("cheat:data", (e, data) => {
    const gameProfilePath = gameProfilePath1 + data.game + gameProfilePath2;

    if (!fs.existsSync(gameProfilePath)) {
        handleError("terjadi kesalahan!, tidak dapat menemukan file game");
    } else {
        fs.readFile(gameProfilePath, "utf8", (err, res) => {
            if (err) handleError(err);
            let activeCheat = "";

            xml2js.parseString(res, (er, result) => {
                if (er) handleError(er);

                result.GamerProfile.GameProfile[0] = {
                    '$': {}
                };

                data.cheat.forEach((d) => {
                    let val = 0;

                    if (d.isChecked) {
                        val = 1;
                        activeCheat += d.value + ' ';
                    }

                    result.GamerProfile.GameProfile[0]["$"][d.value] = val;
                });

                const xml = new xml2js.Builder().buildObject(result);

                fs.writeFile(gameProfilePath, xml, (error, dat) => {
                    if (error) handleError(error);

                    if (activeCheat) {
                        handleError("Berhasil!, cheat yang aktif : " + activeCheat);
                    } else {
                        handleError("Oops!, tidak ada cheat yang aktif ");
                    }
                });
            });
        });
    }
});

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function handleError(err) {
    console.log(err);
    mainWindow.webContents.send('cheat:error', err);
}
