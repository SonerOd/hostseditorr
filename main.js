const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const readline = require('readline')
const fss = require('sudo-fs-promise');

const { app, BrowserWindow, Menu, ipcMain, WebContents } = electron;

let mainWindow;

app.on('ready', () => {
    
    mainWindow = new BrowserWindow({
        titleBarStyle: 'hidden',
        resizable: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'template/index.html'),
            protocol: 'file',
            slashes: true
        })
    );

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);

    ipcMain.on('key:saveRows', (err, data) => {
        let string = '127.0.0.1       localhost #loopback\n255.255.255.255 broadcasthost #loopback\n::1             localhost #loopback\n';
        for(i = 0; i < data.ip.length; i++){
            string += data.ip[i]+'	'+data.domain[i]+'\n';
        }
        try {
            fs.writeFileSync('/etc/hosts', string, 'utf-8');
            mainWindow.webContents.send('key:UpdateSuccess', true);
        } catch(e) { 
            console.log('Failed to save the file !'); 
        }
    })
    mainWindow.webContents.on('dom-ready', () => {
        readHostsLineByLine('/etc/hosts').then(r => {
            mainWindow.webContents.send('key:getRows', r)
        });
    })
    mainWindow.on('close', () => {
        app.quit();
    })
});

const mainMenuTemplate = [
    {
        label: 'App',
        submenu : [
            {
                label : 'Save File',
                accelerator : process.platform == 'darwin' ? "Command+S":'Ctrl+S',
                role : 'quit'
            },
            {
                label : 'Edit Config',
                role : 'quit'
            }
        ]
    }
]

if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({
        label : app.getName(),
        submenu : [
            {
                label : 'Quit',
                role : 'quit'
            }
        ]
    })
}
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push(
    {
        label: 'Dev Tools',
        submenu : [
            {
                label : 'Open Inspector',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label : 'Reload',
                role: 'reload'
            }
        ]
    }
    )
}
async function readHostsLineByLine(file) {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const returnArr = [];
    for await (const line of rl) {
        if(line.includes("	") && !line.includes("#loopback")){
            returnArr.push(line.split('	'));
        }
    }
    return returnArr;
}