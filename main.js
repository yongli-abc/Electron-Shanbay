const {app, BrowserWindow, Menu, Tray} = require("electron");
const path = require("path");
const url = require("url");

/*
 * Start in development mode
 */
process.env.NODE_ENV = "development"
if (process.env.NODE_ENV !== "development") {
    console.log = function() {}
}

/*
 * Window names enumerations
 */
const k_winNames = Object.freeze({
    main: "mainWindow",
    tray: "trayWindow"
});

/*
 * Paths to html files
 */
const k_viewPaths = Object.freeze({
    index: "src/html/index.html",
    tray: "src/html/tray.html"
});

/*
 * Global variables
 */
let wins = {}; // keep global references to windows
let forceQuit = false;

/*
 * Create the main window
 */
function createMainWindow() {
    wins[k_winNames.main] = new BrowserWindow({
        width: 800,
        height: 620,
        title: "",
        icon: path.join(__dirname, "icons/app/icon16.png"),
    });
    let win = wins[k_winNames.main];

    // don't close the window, unless it's forced to quit
    // e.g. cmd+q / ctrl+q
    win.on("close", (e) => {
        console.log("main window received close");
        if (!forceQuit) {
            e.preventDefault();
            win.hide();
        }
    })

    win.on("closed", () => {
        console.log("main window received closed");
        wins[k_winNames.main] = null;
        win = null;
    });

    // create the menu
    const menuTemplate = [
        {
            label: '编辑',
            submenu: [
                { label: "撤销", role: 'undo' },
                { label: "重做", role: 'redo' },
                { type: 'separator' },
                { label: "剪切", role: 'cut' },
                { label: "复制", role: 'copy' },
                { label: "粘贴", role: 'paste' },
                { label: "删除", role: 'delete' },
                { label: "全选", role: 'selectall' }
            ]
        },
        {
            label: "窗口",
            submenu: [
                { label: "最大化", role: "zoom" },
                { label: "最小化", role: "minimize" },
                { label: "窗口最前", role: "front" },
                { label: "关闭", role: "close" }
            ]
        },
        {
            label: "视图",
            submenu: [
                { label: "重载", role: "reload" },
                { label: "强制重载", role: "forcereload" },
                { label: "还原窗口大小", role: "resetzoom" },
                { label: "放大", role: "zoomin" },
                { label: "缩小", role: "zoomout" },
                { type: 'separator' },
                { label: "全屏/取消全屏", role: 'togglefullscreen' }
            ]
        }
    ];

    if (process.env.NODE_ENV === "development") {
        menuTemplate.push({
            label: "Dev",
            submenu: [
                { label: "DevTool", role: "toggledevtools" }
            ]
        })
    }

    if (process.platform
        
        === "darwin") {
        menuTemplate.unshift({
            label: app.getName(),
            submenu: [
              //   {role: 'about'},
                // {type: 'separator'},
                // {
                //     role: 'services', submenu: []
                // },
                {
                    label: "隐藏",
                    role: 'hide'
                },
                {
                    label: "隐藏其它",
                    role: 'hideothers'
                },
                {
                    label: "取消隐藏",
                    role: 'unhide'
                },
                {type: 'separator'},
                {
                    label: "退出",
                    role: 'quit'
                }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
    menu.on("click", function() {
        console.log("Menu clicked");
    });

    win.loadURL(url.format({
            pathname: path.join(__dirname, k_viewPaths.index),
            protocol: "file:",
            slashes: true
        }
    ));
}

/*
 * Create the tray popup window
 * 
 */
function createTrayWindow(bounds) {
    console.log(bounds);

    let option = {
        width: 280,
        height: 70,
        title: "",
        type: "textured",
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        frame: false,
        x: bounds.x,
        y: bounds.y + bounds.height
    };

    if (process.env.NODE_ENV === "development") {
        option.resizable = true;
        option.movable = true;
        // option.width = option.width * 3;
        // option.height = option.height * 3;
        option.x = 0;
    }

    wins[k_winNames.tray] = new BrowserWindow(option);
    let win = wins[k_winNames.tray];

    win.loadURL(url.format({
        pathname: path.join(__dirname, k_viewPaths.tray),
        protocol: "file:",
        slashes: true
    }));

    win.on("closed", () => {
        console.log("tray window received closed");
        wins[k_winNames.tray] = null;
        win = null;
    });

    // close popup window when it loses focus
    win.on("blur", () => {
        console.log("tray window received blur");
        win.hide();
    });

    win.on("ready-to-show", () => {
        console.log("tray window received ready-to-show");
        win.focus();
        win.setMenu(null);
    });

    win.hide();
}

let tray = null; // keep global reference
function createTray() {
    console.log("creating tray");
    tray = new Tray(path.join(__dirname, "icons/app/icon-bw16.png"));

    createTrayWindow(tray.getBounds());

    tray.setToolTip("扇贝桌面版");

    tray.on("click", function(e, bounds) {
        console.log(bounds);
        if (wins[k_winNames.tray].isVisible()) {
            wins[k_winNames.tray].hide();
        } else {
            let winBounds = wins[k_winNames.tray].getBounds();
            winBounds.x = bounds.x;
            winBounds.y = bounds.y + bounds.height;
            wins[k_winNames.tray].setBounds(winBounds, false);
            wins[k_winNames.tray].show();
        }
    });
}

app.on("ready", function() {
    console.log("app received ready");
    createMainWindow();
    createTray();
});

/*
 * Quit when all windows are closed.
 * But on macOS, let menu bar stay activ.
 */
app.on("window-all-closed", () => {
    console.log("app received window-all-closed");
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    console.log("app received activate");
    if (wins[k_winNames.main] === null) {
        createMainWindow();
    } else {
        wins[k_winNames.main].show();
    }
});

app.on('before-quit', () => {
    console.log("app received before-quit");
    forceQuit = true;
});