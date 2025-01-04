const { app, Tray, Menu, Notification } = require('electron')
const { exec } = require('child_process')
const path = require('path')

let tray = null
const DEBUG = false
let lastBrightness = 100 // default value that will be immediately replaced

const WINDDCUTIL_PATH = 'C:\\Users\\antho\\bin\\winddcutil.exe'

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  return
}

function showNotification(title, body) {
  if (DEBUG) {
    new Notification({
      title: title,
      body: body
    }).show()
  }
}

function getCurrentBrightness() {
  return new Promise((resolve, reject) => {
    exec(`"${WINDDCUTIL_PATH}" getvcp 1 0x10`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error getting brightness:', error)
        reject(error)
        return
      }
      // Parse output like "VCP 0x10 10"
      const match = stdout.match(/VCP 0x10\s+(\d+)/)
      if (match && match[1]) {
        const brightness = parseInt(match[1])
        resolve(brightness)
      } else {
        console.error('Unexpected brightness output format:', stdout)
        reject(new Error('Failed to parse brightness'))
      }
    })
  })
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
    
    // Update last brightness and menu
    lastBrightness = value
    updateMenu()
  })
}

function createBrightnessMenu() {
  const items = []
  
  // Add items from 100 down to 5 in steps of 5
  for (let i = 100; i >= 5; i -= 5) {
    items.push({
      label: `${i === lastBrightness ? '> ' : ''}${i}%`,
      click: () => setBrightness(i)
    })
  }
  
  // Add 0-4 explicitly
  for (let i = 4; i >= 0; i--) {
    items.push({
      label: `${i === lastBrightness ? '> ' : ''}${i}%`,
      click: () => setBrightness(i)
    })
  }
  
  return items
}

function updateMenu() {
  const menuItems = createBrightnessMenu()
  menuItems.push({ type: 'separator' })
  menuItems.push({ label: 'Exit', click: () => app.quit() })
  
  const contextMenu = Menu.buildFromTemplate(menuItems)
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(async () => {
  try {
    // Get current brightness before creating menu
    lastBrightness = await getCurrentBrightness()
  } catch (error) {
    console.error('Failed to get initial brightness:', error)
  }
  
  tray = new Tray(path.join(__dirname, 'icon.ico'))
  
  // Create initial menu
  updateMenu()

  tray.setToolTip('Monitor Brightness')
  
  tray.on('click', () => {
    tray.popUpContextMenu()
  })

  showNotification('Brightness Widget', 'Widget started successfully')
})

app.on('window-all-closed', () => {
  app.quit()
})
