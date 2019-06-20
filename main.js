// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu,dialog,globalShortcut } = require('electron');
const shell = require('electron').shell;



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
//  console.log(process.argv);

  mainWindow.loadFile('index.html')
  mainWindow.maximize();

  // globalShortcut.register('f5', function() {
  //   mainWindow.reload();
  // })  

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('close', function (e) {

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    var choice = dialog.showMessageBox(
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit? All working will be lost if not saved.'
     });
     if(choice == 1){
       e.preventDefault();
     }else{
      mainWindow = null;
     }
    
  })



  //Code for menu
  var menu = Menu.buildFromTemplate([
    {
      
        label: 'Menu',
        submenu: [
          {label:'New',
            click() { 
              // mainWindow.reload();
              mainWindow.webContents.send('newProject');
            }          
          },           
          {label:'Open',
            click() { 
              // mainWindow.reload();
              mainWindow.webContents.send('openProject');
            }          
          },            
          {label:'Home',
            click() { 
              // mainWindow.reload();
              mainWindow.loadFile('index.html')
            }          
          },   
          {label:'Preference',
            click() { 
              // mainWindow.loadFile('preference.html')
              mainWindow.webContents.send('openPreferenceIPC');
              // app.openPreference();
            }          
          },                          
          {label:'Open MQTT Gateway github',
            click() { 
              shell.openExternal('https://github.com/1technophile/OpenMQTTGateway')
            }          
          },
          {type:'separator'},  // Add this
            {label:'Exit',
              click() { 
                app.quit() 
              }          
            }
        ]
    },
    {
      label: 'Tool',  
          submenu: [
            {label:'Serial monitor (Devide Logging)',
            click() { 
              mainWindow.webContents.send('openSerial');
            }          
          },   
            {label:'MQTT Logging',
            click() { 
              mainWindow.webContents.send('openMQTT');
            }          
          },        
          {type:'separator'},  // Add this
          {label:'Debug mode',
          click() { 
            mainWindow.webContents.openDevTools();
            }          
          },
          {label:'Reload',
            click() { 
              mainWindow.reload();
            },
            accelerator: 'f5',          
          }          
      ]
    },
    {
      label: 'About',
      click() { 

        const options = {
          type: 'question',
          buttons: ['OK'],
          defaultId: 1,
          title: 'Open MQTT Gateway Editor',
          message: 'This tool is made in my freetime. Buy me a beer if you like (c) linhtranvu@gmail.com...',
          // detail: 'It does not really matter',
          // checkboxLabel: 'Remember my answer',
          // checkboxChecked: true,
        };        

        dialog.showMessageBox(null, options);
      }
    }         
  ])

  Menu.setApplicationMenu(menu);   

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
   
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

