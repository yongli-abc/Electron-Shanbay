const {app, BrowserWindow, Menu, Tray} = require("electron");
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
    main: "mainWindow",
    tray: "trayWindow"
});

/*
 * Paths to html files
 */
const k_viewPaths = Object.freeze({
    index: "src/html/index.html"
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

    win.onbeforeunload = (e) => {
        console.log("main window received onbeforeunload")
        e.returnValue = false;
        e.preventDefault();
        return false;
    };

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

    win.loadURL(url.format(
        {
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
function createTrayWindow(e, bounds) {
    console.log(bounds);
    wins[k_winNames.tray] = new BrowserWindow({
        width: 300,
        height: 100,
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
    });
    let win = wins[k_winNames.tray];

    win.on("closed", () => {
        console.log("tray window received closed");
        wins[k_winNames.tray] = null;
        win = null;
    });

    // close popup window when it loses focus
    win.on("blur", () => {
        console.log("tray window received blur");
        win.close();
    });

    win.on("ready-to-show", () => {
        console.log("tray window received ready-to-show");
        win.focus();
        win.setMenu(null);
    });
}

let tray = null; // keep global reference
function createTray() {
    console.log("creating tray");
    tray = new Tray(path.join(__dirname, "icons/app/icon-bw16.png"));

    tray.setToolTip("扇贝桌面版");

    tray.on("click", function(e, bounds) {
        if (wins[k_winNames.tray] === undefined ||
            wins[k_winNames.tray] === null) {
            createTrayWindow(e, bounds);
        
        } else {
            wins[k_winNames.tray].close();
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