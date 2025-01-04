const { app, Tray, Menu, Notification } = require('electron')
const { exec } = require('child_process')
const path = require('path')

let tray = null
const DEBUG = false

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  return
}

const WINDDCUTIL_PATH = 'C:\\Users\\antho\\bin\\winddcutil.exe'

function showNotification(title, body) {
  if (DEBUG) {
    new Notification({
      title: title,
      body: body
    }).show()
  }
}

function setBrightness(value) {
  const command = `"${WINDDCUTIL_PATH}" setvcp 1 0x10 ${value}`
  showNotification('Executing command', command)
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      showNotification('Error', error.message)
      console.error(`Error: ${error}`)
      return
    }
    if (stderr) {
      showNotification('Warning', stderr)
      console.error(`stderr: ${stderr}`)
      return
    }
    showNotification('Success', `Brightness set to ${value}%`)
    console.log(`Brightness set to ${value}%`)
  })
}

function createBrightnessMenu() {
  const items = []
  
  // Add items from 100 down to 5 in steps of 5
  for (let i = 100; i >= 5; i -= 5) {
    items.push({
      label: `${i}%`,
      click: () => setBrightness(i)
    })
  }
  
  // Add 0-4 explicitly
  for (let i = 4; i >= 0; i--) {
    items.push({
      label: `${i}%`,
      click: () => setBrightness(i)
    })
  }
  
  return items
}

app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, 'icon.ico'))
  
  // Create context menu
  const menuItems = createBrightnessMenu()
  menuItems.push({ type: 'separator' })
  menuItems.push({ label: 'Exit', click: () => app.quit() })
  
  const contextMenu = Menu.buildFromTemplate(menuItems)

  tray.setToolTip('Monitor Brightness')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    tray.popUpContextMenu()
  })

  showNotification('Brightness Widget', 'Widget started successfully')
})

app.on('window-all-closed', () => {
  app.quit()
})
