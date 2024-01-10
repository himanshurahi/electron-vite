import { app, BrowserWindow, desktopCapturer, ipcMain  } from 'electron'
import path from 'node:path'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  //devtools
    win.webContents.openDevTools()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('ready', async () => {
    createWindow()

    //list of all active windows
    const sources = desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
      //send to renderer process
        win?.webContents.send('sources', sources)
    })

});
//tslint:disable-next-line:no-unused-expression
ipcMain.on('take-screenshot', (event, arg) => {
  desktopCapturer.getSources({ types: ['window'], thumbnailSize : { width: 1920, height: 1080} }).then(async sources => {
    sources.forEach(async source => {
      if(source.id === arg){
          const image = source.thumbnail.toPNG()
          //save image to pictures windows
          const fs = require('fs');
            const path = require('path');
            const os = require('os');

            //show dialog as image to save
            const {dialog} = require('electron')
            const options = {
                title: 'Save an Image',
                defaultPath: path.join(os.homedir(), 'screenshot.png'),
                buttonLabel: 'Save Image',
            }

            dialog.showSaveDialog(options).then((filename) => {
                if(filename.canceled){
                    console.log('User cancelled the save')
                    return
                }
                fs.writeFile(filename.filePath.toString(), image, (err) => {
                    if(err){
                        console.log('An error ocurred creating the file ' + err.message)
                    }
                })
            });
      }
    });

  });

});
