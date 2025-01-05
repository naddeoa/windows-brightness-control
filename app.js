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

// Get list of connected monitors
function getMonitors() {
  return new Promise((resolve, reject) => {
    exec(`"${WINDDCUTIL_PATH}" detect`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error detecting monitors:', error)
        reject(error)
        return
      }
      // Parse monitor numbers from output
      const monitors = []
      const lines = stdout.split('\n')
      for (const line of lines) {
        // Match lines like "1 Generic PnP Monitor"
        const match = line.match(/^(\d+)\s+Generic PnP Monitor/)
        if (match && match[1]) {
          monitors.push(match[1])
        }
      }
      resolve(monitors)
    })
  })
}

function getCurrentBrightness() {
  // Just read from monitor 1 for the menu state
  return new Promise((resolve, reject) => {
    exec(`"${WINDDCUTIL_PATH}" getvcp 1 0x10`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error getting brightness:', error)
        reject(error)
        return
      }
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

async function setBrightness(value) {
  try {
    // Get all monitors first
    const monitors = await getMonitors()
    
    // Set brightness for each monitor
    for (const monitor of monitors) {
      const command = `"${WINDDCUTIL_PATH}" setvcp ${monitor} 0x10 ${value}`
      showNotification('Executing command', command)
      
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            showNotification('Error', `Monitor ${monitor}: ${error.message}`)
            console.error(`Error on monitor ${monitor}:`, error)
            reject(error)
            return
          }
          if (stderr) {
            showNotification('Warning', `Monitor ${monitor}: ${stderr}`)
            console.error(`Warning on monitor ${monitor}:`, stderr)
          }
          showNotification('Success', `Monitor ${monitor} brightness set to ${value}%`)
          console.log(`Monitor ${monitor} brightness set to ${value}%`)
          resolve()
        })
      })
    }
    
    // Update last brightness and menu after setting all monitors
    lastBrightness = value
    updateMenu()
  } catch (error) {
    console.error('Failed to set brightness:', error)
  }
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
