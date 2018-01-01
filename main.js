const {app, BrowserWindow} = require("electron");
const path = require("path");
const url = require("url");

/*
 * Start in development mode
 */
process.env.NODE_ENV = "development"

/*
 * Window names enumerations
 */
const k_winNames = Object.freeze({
    main: "mainWindow"
});

/*
 * Paths to html files
 */
const k_viewPaths = Object.freeze({
    index: "src/html/index.html"
});

// keep global references to wins
let wins = {};

/*
 * Create the main window
 */
function createMainWindow() {
    wins[k_winNames.main] = new BrowserWindow({width: 800, height: 600});
    let win = wins[k_winNames.main];

    win.on("closed", () => {
        wins[k_winNames.main] = null;
    });

    win.loadURL(url.format(
        {
            pathname: path.join(__dirname, k_viewPaths.index),
            protocol: "file:",
            slashes: true
        }
    ));

    win.webContents.openDevTools();
}

app.on("ready", createMainWindow);

/*
 * Quit when all windows are closed.
 * But on macOS, let menu bar stay activ.
 */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
})

app.on("active", () => {
    if (wins[k_winNames.main] === null) {
        createMainWindow();
    }
});