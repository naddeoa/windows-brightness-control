// app.js
const { app, Tray, Menu, nativeImage } = require('electron')
const { exec } = require('child_process')
const path = require('path')

let tray = null

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  return
}

// Path to your winddcutil executable - assuming it's in the same directory
// const WINDDCUTIL_PATH = path.join(process.cwd(), 'winddcutil.exe')
const WINDDCUTIL_PATH = 'C:\\Users\\antho\\bin\\winddcutil.exe'

function setBrightness(value) {
  exec(`"${WINDDCUTIL_PATH}" setvcp 1 0x10 ${value}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`)
      return
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
      return
    }
    console.log(`Brightness set to ${value}%`)
  })
}

// Create a basic icon as a fallback if no icon file exists
function createFallbackIcon() {
  const icon = nativeImage.createEmpty()
  const size = 16
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  
  // Draw a simple brightness icon
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2)
  ctx.fill()
  
  icon.addRepresentation({
    width: size,
    height: size,
    buffer: canvas.toBuffer()
  })
  
  return icon
}

app.whenReady().then(() => {
  // Create tray icon with embedded icon data
  const iconData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAB9SURBVDiNY2AYBaNgGAHG/////2fAh0FqmBhIBEQbAPIPHPqYGBgYGP5D1TIwMDAwkmMAzABGJDlGBgYGBiYGBoZ/6IYwMTAw/GVgYPiH7lw2BgaG/+gG/GdgYGBnYGD4h24AEwMDw18GBob/2GIB2YD/uGIBwwB8YU8zAADoZw8hwVCPAwAAAABJRU5ErkJggg==`
  const icon = nativeImage.createFromDataURL(iconData)
  
  tray = new Tray(icon)
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: '100% Brightness', click: () => setBrightness(100) },
    { label: '75% Brightness', click: () => setBrightness(75) },
    { label: '50% Brightness', click: () => setBrightness(50) },
    { label: '25% Brightness', click: () => setBrightness(25) },
    { type: 'separator' },
    { label: 'Exit', click: () => app.quit() }
  ])

  tray.setToolTip('Monitor Brightness')
  tray.setContextMenu(contextMenu)
  
  // Make left-click show the menu too
  tray.on('click', () => {
    tray.popUpContextMenu()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})
