const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process');

function createWindow () {
  const win = new BrowserWindow({
    //width: 800,
    //height: 600,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      devTools: false,
    }
  })

  win.loadFile('src/index.html')
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  ls.kill()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
// sudo /usr/bin/java -jar /opt/spocon/librespot-java-api-v1.5.3.jar
const ls = spawn('/usr/bin/java', ['-jar', '/opt/spocon/librespot-java-api-v1.5.3.jar'],{cwd: "/opt/spocon"});

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});