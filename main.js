const {
    app, // fungsi aplikasi, mungkin...
    BrowserWindow, // fungsi untuk membuat Browser Window
    ipcMain // untuk berkomunikasi antara frontend dan backend
} = require('electron'); // beberapa fungsi utama electron
const path = require('path'); // melakukan beberapa fungsi path
const url = require('url'); // untuk membuat path menuju view
const fs = require('fs'); // untuk mengakses file system
const xml2js = require('xml2js'); // XML parser

// mendefinisikan path game file
const gameProfilePath1 = getUserHome() + "\\Documents\\My Games\\";
const gameProfilePath2 = "\\GamerProfile.xml";

// mendefinisikan mainWindow
let mainWindow;

// fungsi untuk membuat mainWindow
function createWindow() {

    // membuat browser window
    mainWindow = new BrowserWindow({
        icon: __dirname + '/assets/images/icon.ico', // path icon
        width: 800, // lebar window
        height: 500, // tinggi window
        webPreferences: {
            devTools: false // menonaktifkan DEVELOPER TOOLS
        }
    });

    // load view
    // menghasilkan : file://<dir>/index.html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'), // path index.html
        protocol: 'file:', // protocol file "file:"
        slashes: true // menambahkan slash "file://"
    }));

    // merubah mainWindow menjadi NULL jika di tutup untuk menghemat memori
    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    // menonaktifkan semua menu di atas
    mainWindow.setMenu(null);
}

// jika aplikasi sudah siap, buat mainWindow
app.on("ready", createWindow);

// Menutup aplikasi jika semua jendela ditutup
app.on('window-all-closed', () => {
    app.quit()
})

// ketika aplikasi aktif, maka window tidak terduplikat
app.on('activate', () => {
    // jika mainWindow tidak aktif, maka buat window
    if (mainWindow === null) {
        createWindow()
    }
    // jika masih aktif, do nothing :)
})

// menangkap input dari ipcRenderer di view
ipcMain.on("cheat:data", (e, data) => {
    // Mendefinisikan path game file
    const gameProfilePath = gameProfilePath1 + data.game + gameProfilePath2;

    // check jika tidak ada file gameprofile
    if (!fs.existsSync(gameProfilePath)) {
        // jika file tidak ditemukan error muncul
        handleError("terjadi kesalahan!, tidak dapat menemukan file game");
    } else {
        // Jika file ditemukan, buka
        fs.readFile(gameProfilePath, "utf8", (err, res) => {
            if (err) handleError(err);
            // Mendefinisikan cheat yang aktif untuk ditampilkan ke UI
            let activeCheat = "";
            // merubah xml menjadi JSON
            xml2js.parseString(res, (er, result) => {
                if (er) handleError(er);

                // membuat object kosong, karena jika tidak ada attribute
                // xml2js tidak memberikan object '$'
                result.GamerProfile.GameProfile[0] = {
                    '$': {}
                };

                // loop semua data    
                data.cheat.forEach((d) => {
                    // value pertama (jika checkbox tidak dicheck)
                    let val = 0;
                    // Jika checkbox di check, maka aktifkan cheat
                    if (d.isChecked) {
                        // jika checkbox dicheck, ubah value menjadi 1 atau TRUE atau aktif
                        val = 1;
                        activeCheat += d.value + ' ';
                    }
                    // Mengaktifkan cheeat berdasarkan value input
                    result.GamerProfile.GameProfile[0]["$"][d.value] = val;
                });

                // Ubah JSON menjadi XML
                const xml = new xml2js.Builder().buildObject(result);

                // Proses save atau write di file yang sama
                fs.writeFile(gameProfilePath, xml, (error, dat) => {
                    if (error) handleError(error);
                    // alert yang akan di tampilkan ketika user menekan tombol CHEAT!
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

// Fungsi untuk alert ke mainWindow
function handleError(err) {
    console.log(err);
    mainWindow.webContents.send('cheat:error', err);
}