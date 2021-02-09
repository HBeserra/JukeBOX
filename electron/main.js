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
  backend_process.kill()
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
const backend_process = spawn('/usr/bin/java', ['-jar', '/opt/JukeBOX/librespot-java-api-v1.5.3.jar'],{cwd: "/opt/JukeBOX"});

backend_process.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

backend_process.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

backend_process.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});