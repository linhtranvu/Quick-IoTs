var boardPath;
var buildCondition = 0;
var ptyProcess;
var xterm;

var buildApp = {


  terminal:function(){
    const os = require('os');
    const pty = require('node-pty');
    const Terminal = require('xterm').Terminal;
    
    // Initialize node-pty with an appropriate shell
    const shellCmd = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
    ptyProcess = pty.spawn(shellCmd, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env
    });
    
    // Initialize xterm.js and attach it to the DOM
    xterm = new Terminal();
    xterm.open(document.getElementById('xterm'));
    
    // Setup communication between xterm.js and node-pty
    xterm.on('data', (data) => {
      ptyProcess.write(data);
    });
    ptyProcess.on('data', function (data) {
      xterm.write(data);
    });   
    
    xterm.clear();
    xterm.write('RUN BUILD & UPLOAD TO START BUILD & UPLOAD CODE TO DEVICE\r');
  },

  cancelBuild:function(){
    ptyProcess.write("\x13");
  },
  
  buildUpload:async function(){
      
    if(!$(".btn-build").hasClass("disabled")){

      buildCondition = buildApp.checkAdruinoIDE();

      if(currentDevice.board_path !== ""){ //ESP8266, ESP32
        buildCondition = await buildApp.checkBoardCode();
        
      }
      
      if(buildCondition == 0){
        // swal({type:"error",title:"Something wrong happened!"})
        return false;
      }else{
        // swal({type:"success",title:"Arduino IDE, Device lib found. Ready to build & upload!"})
      }
      ///////////////////START BUILD////////////////////////////////////////

      var sketchPath = fileLocation.substring(0, fileLocation.length-1);
      command = `"${pref.arduinoPath}${currentOs.arduino_name}"  ${currentDevice.board_command}  --pref sketchbook.path="${sketchPath}"  --port ${portList[0].comName}  --upload "${fileLocation}OpenMQTTGateway.ino"\r\n` ;
      // command += "\r\n pause"
      
      // fs.writeFileSync(`${pref.appSrc}/arduino/win.bat`, command);
      // shell.openItem(`${pref.appSrc}/arduino/win.bat`);


      ptyProcess.write("mkdir build_in_process\r");
      xterm.clear();
      ptyProcess.write(command);
      removeBuildFolderCmd = currentOs.name === 'Windows_NT' ? 'rmdir /q build_in_process\r' : 'rm -r mydir\r'
      ptyProcess.write(removeBuildFolderCmd);
      
      // END TERMINAL

      app.log(command);
      $("#frm_build_upload tbody").html(`
          <tr>
              <td>${getTime()} </td>
              <td><b>Command:</b> ${nl2br(command)}</td>
          </tr>
          <tr>
              <td>${getTime()} </td>
              <td>Status<b></b>: Compiling & Build. Please wait until build finish in Terminal!</td>
          </tr>            
      `);         

  
   
    }//end if

  },

  checkAdruinoIDE:function(){
      //Check Arduino IDE
      if(pref.arduinoPath == ""){
        swal({
          type: 'warning',
          title: 'No Arduido IDE found!',
          html: `
          <div style='text-align:left'>
          <ul>
          
            <li>Config path to your Arduino IDE in Menu->Preference</li>
            <li>Not install! Go to Arduino website to download and install. <a href="https://www.arduino.cc/en/Main/Software" target="_blank">Click here to go to download page</li>
          <ul/>
          </div>
            <img src="./img/ide_download.JPG" width="50%"> 
        
          `
        });
        return 0;
      }else{
        return 1;
      }
  },

  checkBoardCode:async function(){
    arduinoSettingPath = currentOs.user_path.split("<USERNAME>");

    boardPath = `${arduinoSettingPath[0]}${currentOs.username}${arduinoSettingPath[1]}${currentDevice.board_path}`;
    //If  board exists
    if (fs.existsSync(`${boardPath}/${currentDevice.board_version}`)) {
      app.log(`Board found: ${boardPath}/${currentDevice.board_version}`);
      return 1;
    }else{
      swal({
        type: "warning",
        title: "Libraries need to compile for device not found!Choose one:",
        html:`
        <div style="text-align: left"><ul>
          <li>Automatic install: <a href="#c" onclick="buildApp.boardInstall()"><b>Click here</b></a>.</li>
          <li> Manual install: Follow <a href="${currentDevice.lib_install_guide}" target="_blank"><b>this guide</b></a>. <b style='color:red'>Must install board version ${currentDevice.board_version}<b></li>
          </ul>
        <div>
        `
      });
      return 0;
    }   
  },

  boardInstall:async function(){
    swal({
      type:"warning",title:"Downloading...",
      allowOutsideClick: false,
      showConfirmButton: false,      
      html:`Downloading to "${boardPath}". Please wait until next message...`
    })

    packagePath = `${arduinoSettingPath[0]}${currentOs.username}${arduinoSettingPath[1]}/packages`;
    fs.emptyDirSync(`${packagePath}/${currentDevice.code}`)

    downloadGitRepo_p = util.promisify(downloadGitRepo);
    await downloadGitRepo_p(currentDevice.board_download_url, packagePath);
    fs.createReadStream(`${packagePath}/${currentDevice.code}.zip`).pipe(unzip.Extract({ path: `${packagePath}` }));

    boardExist = await buildApp.checkBoardCode();
    if(boardExist == 1){
      swal({type:"success",title:"Download device library successfully! Press 'Build & Upload' again."})
    }
    
  }


}


