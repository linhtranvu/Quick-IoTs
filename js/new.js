/*jshint esversion: 6 */
/*html*/


var new_project_condition = 1;

var newApp = {
  
  newProject:async function(){



		new_project_condition = await newApp.checkOmgVersion();
		if(new_project_condition == 0){
			return false;			
		}

		new_project_condition = await newApp.checkEditorVersion();
		if(new_project_condition == 0){
			return false;			
		}		

		if(new_project_condition == 1){
			swal({
				type:"success",title:"Note for New project",
				confirmButtonText: 'Select folder',
				allowOutsideClick: false,
				showCancelButton: true,
				html:/*html*/`
					<div style="text-align: left">
							<ul>
									<li>We use <a href="https://github.com/1technophile/OpenMQTTGateway" target="_blank">Open MQTT Gateway</a>, 
									an <a href="https://www.circuito.io/blog/arduino-code/" target="_blank">Arduino</a> project as source to build and upload to device. Build and Upload code to device need <a href="https://www.arduino.cc/en/Main/Software" target="_blank">Arduino IDE</a> installed</li> 
									<li>
										To begin, press <b class="label label-info arrowed-in-right arrowed">Select folder</b> to save your project files in
									</li>                                                                                                                        				
							</ul>
					</div>`
			}).then((result) => {
				if (result.value) {
					
					fileLocation = app.openFolder();
					console.log(`${pref.appSrc}/arduino/code/${pref.omg_version}`);
					fs.copySync(`${pref.appSrc}/arduino/code/${pref.omg_version}/src`, fileLocation);
					app.openProject(fileLocation);
				}

			})



		}else{
			swal({type:"error",title:"Something wrong happened! Can't create project!"})
		}
		

  },

  checkEditorVersion:async function(){
      
		if(server_config.editor_version !== pref.editor_version){
			
			swal({
				type:"error",
				title:`New App version found: ${server_config.editor_version} (Current ${pref.editor_version}). Press Update to continue!`,
				allowOutsideClick: false,
				confirmButtonText: `Update version ${server_config.editor_version}!`
			})
			.then((result) => {
				if (result.value) {

					newApp.updateEditorSource();
				}
			});
			return 0;
		}else{
			return 1;
		}    

  },  

  checkOmgVersion: async function(){
    // console.log(server_config+" "+pref);
		if(server_config.omg_version !== pref.omg_version ){
			
			swal({
				type:"error",title:`Source code for iots device changed (${server_config.omg_version}). Press Update to continue`,
				allowOutsideClick: false,
				confirmButtonText: 'Update Device source!'
				
			})
			.then((result) => {
				if (result.value) {

					newApp.updateOmgSource();
				}
			});
			return 0;
		}else{
			return 1;
		}
		

	},
	
	updateOmgSource:async function(){

			downloadPath = `${pref.appSrc}/arduino/code/${server_config.omg_version}`;
			swal({
				type:"warning",title:"Downloading...",
				allowOutsideClick: false,showConfirmButton:false,
				html:`Downloading to "${downloadPath}". Please wait until next message...`
			})
			downloadGitRepo_p = util.promisify(downloadGitRepo);
			await downloadGitRepo_p(`linhtranvu/open-mqtt-gateway/#${server_config.omg_version}`, downloadPath);

			if (fs.existsSync(downloadPath)) {

				swal({type:"success",title:"Source code update successfully! Create New Project again!"});

				if (fs.existsSync(downloadPath+"/lib")) {
					fs.renameSync(downloadPath+"/lib", downloadPath+"/libraries")
				}

				pref.omg_version = server_config.omg_version;
				fs.writeFileSync('./preference.ini', ini.stringify(pref));

			}else{
				swal({type:"error",title:"Update fail! Please update again!"});
			}


	},
	updateEditorSource:async function(){

		downloadPath = `${pref.appSrc}`;
		swal({
			type:"warning",title:"Downloading...",allowOutsideClick: false,showConfirmButton:false,
			html:`Updating... Please wait until next message...`
		})
		downloadGitRepo_p = util.promisify(downloadGitRepo);

		await downloadGitRepo_p(`linhtranvu/Quick-IoTs/#${server_config.editor_version}`, downloadPath);

		if (fs.existsSync(`${downloadPath}/version/version_${server_config.editor_version}.ini`)) {

			pref.editor_version = server_config.editor_version;
			fs.writeFileSync('./preference.ini', ini.stringify(pref));
			swal({
				type:"success",title:"Update successfully! Please restart app to work again!",
				allowOutsideClick: false,confirmButtonText:"Restart"
			}).then((result) => {
				if (result.value) {
			  
					electronApp.relaunch();
					electronApp.exit(0);
			  
				}
			});


		}else{
			swal({type:"error",title:"Update fail! Please update again!"});
		}

	}	

}//end newApp object


