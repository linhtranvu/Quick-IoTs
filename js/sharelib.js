const userAgent = navigator.userAgent.toLowerCase();
var fileLocation;
var arduinoPath;
var pref_browser = {
    devMode: 0, //Use localhost. If devMode = 0. Use productionServer
    productionServer:"http://www.quickiots.com"
}

var fs = "";
var readline = "";
var api_host = "";
var config = "";
var { dialog } = "";
var parser;
var path;
var SerialPort;
var ReadSerialLine;
var port;
var ipcMain;
var { ipcRenderer } = "";
var mqtt;
var ini;
var { shell } = "";
var saveFileFinish;
var unzip;

var arduinoAppName;
var cmd;
var operatingSystem;
var pref;
var currentOs;
var currentDevice;
var remote;
var electronApp;

var apiData;
var device;
var cats;
var fields;
var os_all;
var portList;
var downloadGitRepo;
var util;
var serialWindow = null;
var mqttWindow = null;
var server_config;

if (userAgent.indexOf(' electron/') > -1) { //Electron code only
  util = require('util');
  fs = require('fs-extra');
  readline = require('readline');
  downloadGitRepo = require("download-git-repo") ; 
  unzip = require('unzip');

  var { dialog } = require('electron').remote;
  var { shell } = require('electron').remote;

  
  remote = require('electron').remote;
  electronApp = remote.app;  



  path = require('path');
  ini = require('ini');
  var { ipcRenderer } = require('electron');
  
  var shell = require('electron').shell;
  //open links externally by default
  $(document).on('click', 'a[href^="http"]', function(event) {
      event.preventDefault();
      shell.openExternal(this.href);
  });    
  
  /////////////////TEST CODE/////////////////

  /////////////////TEST CODE/////////////////
	fs.removeSync("./build_in_process")
  //Open COM serial port of device and CMD tool
  SerialPort = require('serialport');
  ReadSerialLine = require('@serialport/parser-readline');
  
  cmd = require('node-cmd');

  //OS define
  operatingSystem = require("os");

  ipcRenderer.on('openPreferenceIPC', function() {
    app.openPreference();  
  })     

  //Main menu to Client
  mqtt = require('mqtt');
  ipcRenderer.on('openMQTT', function() {
    app.openMQTT();  
  })       

  ipcRenderer.on('openSerial', function() {
    app.openSerial();  
  })    

  ipcRenderer.on('openProject', function() {
    app.openProject();  
  })  
  
  ipcRenderer.on('newProject', async function() {
    await newApp.newProject();  
  })  

}else{ //Browser code only
    $(".electron").remove();
}  


var app = {

    loadOS:function(){
      query = `select * from ? where name = "${operatingSystem.type()}" ` ;   
      currentOs =  alasql(query,[os_all])[0];
      currentOs.username = operatingSystem.userInfo().username;
      currentOs.release = operatingSystem.release();
      console.log(currentOs);
    },

    openMQTT:function () { 

			if(mqttWindow == null){

				const { BrowserWindow } = require('electron').remote;
				mqttWindow = new BrowserWindow({
					 width: 800, height: 600, frame: true,
					 webPreferences: {
						nodeIntegration: true
					}          
				});
	
				mqttWindow.on('closed', () => {
					mqttWindow = null
				})		
				
				mqttWindow.setMenu(null);
				mqttWindow.show();
				// win.webContents.openDevTools();
			 
				mqttWindow.loadFile('mqtt.html');
				// win.maximize();					

			}
  

      

    },

    openUrl:function (url) {
        


            const { BrowserWindow } = require('electron').remote;
        
            win = new BrowserWindow({
                    width: 800, height: 600, frame: true,
                    webPreferences: {
                    nodeIntegration: true
                }          
            });
	
            
            win.setMenu(null);
            win.show();
            // win.webContents.openDevTools();
            console.log(url)

            if(url.indexOf("http") >= 0 ){
                win.loadURL(url);	
            }else{
                win.loadFile(url);	
            }
            
            // win.maximize();


    }, 

    openSerial:function () {
        
			if(fs.existsSync("./build_in_process")){ 

				swal({type:"error",title:"Build in process, cannot open serial!"})
				return false;

			}

			if(serialWindow == null){

				const { BrowserWindow } = require('electron').remote;
			
				serialWindow = new BrowserWindow({
						width: 800, height: 600, frame: true,
						webPreferences: {
						nodeIntegration: true
					}          
				});
 
				serialWindow.on('closed', () => {
					serialWindow = null;
					port.close();
				})		
				
				serialWindow.setMenu(null);
				serialWindow.show();
				// serialWindow.webContents.openDevTools();
				
				serialWindow.loadFile('serial_monitor.html');	
				// win.maximize();
			}
   

    },    



    loadApiData:async function(){

        try {
          $.blockUI();   
          var url = api_host+"/iots/index.php?option=com_omg&view=omg&task=device&format=raw&callback=";
          apiData = await axios.get(url);
          apiData = apiData.data
          device = apiData["device"];
          cats = apiData["cat"];
          modules = apiData["modules"];
          fields = apiData["field"];   
          device_pin = apiData["device_pin"];  
          os_all = apiData["os"];  

          var json = "{";
          var contents = (apiData["config"]);
          for(i=0;i<contents.length;i++){
                  json += `"${contents[i].name}":"${contents[i].value}"`;
                  if(i < (contents.length - 1)){
                          json += ",";
                  }
          }
          json += "}";
          server_config = JSON.parse(json);          
                        

          $.unblockUI();

        } catch (error) {
          console.log(error);
          $.unblockUI();
        }

    },    

    home:function(){

      (async function() {
        try {
            $.blockUI();   
          var url = api_host+"/iots/index.php?option=com_omg&view=omg&task=home&format=raw&callback=";
          var response = await axios.get(url);
            // console.log(response);
            $( ".tbl-devices tbody" ).html(_.template($("#tpl-datatable").html(),{rows:response.data["device"]}));  
            $.unblockUI();

        } catch (error) {
          console.log(error);
          $.unblockUI();
        }
      })();     


    },

    readPref:function() {
    
        var json = "";

        if (userAgent.indexOf(' electron/') > -1) {

            $(".browser").remove();

            if (!fs.existsSync("./preference.ini")){
                fs.copyFileSync('./resources/app/preference.default.ini', 'preference.ini', (err) => {
                    if (err) throw err;                    
                });
                swal('',"Welcome! This is your first time using OMG Editor. Config file created!");
            }            

            // pref = app.readJson('preference.json');
            pref = ini.parse(fs.readFileSync('./preference.ini', 'utf-8'));
            pref.appPath = electronApp.getAppPath();  

            if (fs.existsSync("./resources")) { //Running in build mode
            //   pref.appSrc = pref.appPath+"/resources/app";  
              pref.appSrc = pref.appPath;
            }else{
              pref.appSrc = pref.appPath;
            }

            
            



        }else{ //Browser!
            $(".electron").remove();
            pref = pref_browser;
        }          

        
        api_host = (pref.devMode == "1" )?"http://localhost": pref.productionServer;
        
    },

    readJson:function(filePath){

        try {

            var json = "{";
            var contents = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            for(i=0;i<contents.length;i++){
                json += `"${contents[i].name}":"${contents[i].value}"`;
                if(i < (contents.length - 1)){
                    json += ",";
                }
            }
            json += "}";
            jsonObject = JSON.parse(json);
            // console.log(jsonObject);
            return jsonObject;

        } catch(e) {
            swal({"type":"error","text":e}); // error in the above string (in this case, yes)!
        }
        

    },

	readInputToGenCode:function(writeFile){
        // input:checkbox:not(:checked)
		// WRITING USER_CONFIG.H FILE
		var main_config = "";
		mainInput = $("#frm_omg").find(":input").not("#tbl_module :input").not(":input[data-hide-code='1'],.checkbox_show:not(:checked)");
		length = mainInput.length;
		mainInput.each(function(i,el){
			main_config += app.generateCode($(this));
			if(i == (length-1)){//end of loop input
				length = $(".module_chooser").length;
				
				$(".module_chooser").each(function(i,el){

					if($(this).prop("checked")){
						main_config += `#define ${$(this).attr("name")} "${$(this).data("module-code")}" <br>\r\n`;
					}
					if(i == (length-1)){
																		
						// main_config += ` <%= echo $this->device->config_default_sourcecode %> `;
						$("#div_user_config").html(main_config);
						if(writeFile == 1){
							app.saveFile("User_config.h","#div_user_config");								
						}	
						
					}					
	
				});


			}
		});

		//END WRITING USER_CONFIG.H FILE

		//WRITING MODULE FILES
		$("#div_module_config").html("");

		$(".module_chooser").each(function(){
			if($(this).prop("checked")){
				
				module_div = $(this).closest("tr").find(".div_module_chooser");
				module_config = nl2br(module_div.find(".config_default_sourcecode").val())+"<br>\r\n";
				module_input = module_div.find(":input").not(":input[data-hide-code='1'],.checkbox_show:not(:checked),:input[module-connect='0']");
				
				numModuleInput = module_input.length;
				id_code_container = $(this).attr("data-filename").split(".")[0];
				moduleFileName = $(this).attr("data-filename");
				
				module_input.each(function(i,el){
					module_config += app.generateCode($(this));	

					if(i == (numModuleInput-1)){
						
						$("#div_module_config").append(`
						<div class="div_file_wrapper">
							<h3 class="header smaller red">${moduleFileName}  
                                <span class="btn btn-mini btn-success btn-copy"><i class="icon-document"></i> Copy to Clipboard</span> 
                            </h3>
							<div class="well code-container" id="${id_code_container}">${module_config}</div>
						</div>					
						`);

						if(writeFile == 1){
							app.saveFile(moduleFileName,"#"+id_code_container);
						}
					}					
				});
			}

		});	//END WRITING MODULE FILES
    },


    
    //Generate Code function
    generateCode:function(object) {

       if(typeof object.data("command") !== "undefined" ){
            if(object.data("command") !== ""){
                command = object.data("command");
            }else{
                command = "#define";
            }               
       }else{
            command = "#define";
       }
        // command = typeof object.data("command") !== "undefined" ? object.data("command") : "#define"; 
        // command = object.data("command") !== "" ?  object.data("command") : "#define"; 
        
        attribute_name = typeof  object.data("param-name") !== "undefined" ? object.data("param-name") : object.attr("name")
        
        // VALUE_QUOTE = object.attr("type") == "number" ? '' :  '"'; //If type = number then no quote
        // VALUE_QUOTE = (object.val() == "true" ||  object.val() == "false")  ? '' :  VALUE_QUOTE ; //If boolean (true,false) no quote
        // VALUE_QUOTE = typeof object.data("quote") !== "undefined" ? object.data("quote") : VALUE_QUOTE; //If defined data-quote attribute, use this


        if(typeof object.data("quote") !== "undefined"){
            VALUE_QUOTE = object.data("quote") == "1" ? '"' : "";
            
        }else{
            VALUE_QUOTE = '"';
        }
        VALUE_QUOTE = object.attr("type") == "number" ? '' :  VALUE_QUOTE; //If type = number then no quote
       

        EQUAL_SIGN = command.includes("#") ? ' ' :  '=';

        attribute_value = object.val();
        END_COMMAND = command.includes("#") ? '' :  ';';
        COMMENT = object.data("original-title") == "" ? '' :  `// ${object.data("original-title")}`; //If type = number then no quote
                                                
        return `${command} ${attribute_name} ${EQUAL_SIGN} ${VALUE_QUOTE}${attribute_value}${VALUE_QUOTE} ${END_COMMAND} <br>\r\n`;			

    },


	saveFile:function(fileName, selector){
        // console.log($(""+selector));
		fs.writeFile(fileLocation+""+fileName,$(""+selector).text(), function (err) {
			if(err){
				alert("An error ocurred creating the file "+ err.message)
			}			
			swal({
				type: 'success',
				title: 'Save successfully',
				text: 'Config files has been saved',				
            });
            app.log(`Save ${fileLocation}${fileName}`)
		});			
    },

	loadAllFile:function(){
		// $.blockUI();
        app.loadFile(fileLocation+'User_config.h');
		setTimeout(function() {

			$(".module_chooser").each(function(i,el){
				if($(this).prop("checked")){
					fileName = $(this).attr("data-filename");
					app.loadFile(fileLocation+""+fileName);
				}
			});

		}, 1000);	
	},    
    
	loadFile:function(fileName){

        var error = 0;

        console.log(fileName);
               
        if (fs.existsSync(fileName)) {  

        
            app.log(`Read file ${fileName}`);
            var command_list = alasql('SELECT command FROM ? where command <> "" GROUP BY command',[fields]);


            indexLine = 0;
            var field_json = "{";
            var rd = readline.createInterface({
                input: fs.createReadStream(fileName),
                output: process.stdout,
                console: false
            });
            
            rd.on('line', function(line) {

            try {
                
                line = line.trim(); //Remove space                
                line_is_right = 0;
                for(i = 0;i<command_list.length;i++){ //If start word equal to command word (defined, const...)
                    if(line.startsWith(command_list[i].command)){
                        line_is_right = 1;
                    }
                }

                if(line_is_right == 0){
                    line = "//";
                }

                // console.log(line);
                if(line.startsWith('/*')    ){
                    // throw "Config files in this project not generate by OMG Editor. You need to save first!";
                   
                }               
                if(line.startsWith("//")){
                    //comment line
                }else{
    
                    //PROCESS LINE TO REMOVE DUPLICATE SPACE AND NOT NEEDED CHAR
                    line = line.replace(/\=/g, ' '); //remove "="
                    line = line.replace(/\;/g, ' '); //remove ";"
                    line = line.replace(/\t+/g, ' '); //remove tab (\t)
                    
                    lineArr = line.split("//");
                    process_line = lineArr[0];	//Get line for process after remove char and comment
    
                    line_no_multiple_space = "";
                    for(i=0;i<process_line.length;i++){
                        // if(i>0){
                            if((process_line.charAt(i) == " " && process_line.charAt(i-1) !== " ") 
                            ||  process_line.charAt(i) !== " "){
                                line_no_multiple_space += process_line.charAt(i);
                            }
                        // }
                    }
    
                    //END PROCESS LINE TO REMOVE DUPLICATE SPACE AND NOT NEEDED CHAR
                    
                    // console.log(line_no_multiple_space);
                    field_line = line_no_multiple_space.trim().split(" "); //create line array for calculate name & val
                    // console.log(field_line);
    
                    //process name data
                    if(field_line.length > 1){
                        name = field_line[1].trim();
                    }				
    
                    if(field_line[0] == "const" ){
                        name = field_line[2];					
                    }
                    
                    if(field_line[0] == "char" ){
                        name = field_line[1];					
                    }				
                    
                    if (name.indexOf('[') > 0){
                        valueInQuote = name.match(/\[([^']+)\]/);
                        if(Array.isArray(valueInQuote)){
                            if(valueInQuote.length > 1){
                                name = name.replace(valueInQuote[1], "");
                            }
                            
                        }
                        
                        name = name.replace("[", "");
                        name = name.replace("]", "");
                        // console.log(name);
                    }				
                    //end process name data	
    
                    //Process value data if has quote
                    if (line.indexOf('"') > 0){
    
                        if (line.indexOf('""') > 0){
                            value = '';
                        }else{
                            valueInQuote = line.match(/"([^']+)"/); //Match word inside Quote "
                            // value = valueInQuote[1].replace(/\"+/g, ' ');//remove quote in value
                            value = valueInQuote[1]//remove quote in value
                            // console.log(value);
                        }					
    
                        
                    }else if(line.indexOf('}') > 0){
                        valueInQuote = line.match(/{([^']+)}/);
                        value = "{"+valueInQuote[1]+"}";//remove quote in value
                        // console.log(value);					
                    }else if(field_line.length == 2){ //Command line with NO VALUE, only 2 words
                        value = '';
                    }else{
                        value = field_line[field_line.length - 1].trim();
                    } //End Process value data if has quote	
                    
                    
                    field_json += '"'+name+'":"'+value+'",';
    
                }
            
            }catch(e) {
                // console.error(e);
                    error = 1;
                    swal({
                        type:"error",
                        title:"Error reading .h config files",
                        html:"Error when reading .h config files. You need to save from Editor first to prevent errors. Files saved from Editor will work perfectly next time when opening project."
                    });
            }//end of try catch   
            })
            .on('close', function(line) {
                field_json = field_json.substring(0, field_json.length-1);
                field_json += "}";
                field_json = JSON.parse(field_json);
                console.log(field_json);
                if(error == 0){
                    $("#frm_omg").autofill( field_json );
                }               
    
                $.unblockUI();
                
                
            });	
         	
        }else{
            swal({type:"error",text:"No OMG config files found! Set your settings and Save."});
            $.unblockUI();
        }



    },
    

    drawFields:function(template,container,module_code){

        var current_row_field = 1;
        var total_field_row = 2; // x2 = number of TD for 1 field (1 for lable and 1 for field) 
        var prev_cat = 0;
        var field_html = "";
        
        query = 'select * from ? where template = "'+template+'" and parent_code = ""';
        if(template == "module"){
            query += ` and ("${module_code}" in module  )`;
        }
    
        catInTemplate =  alasql(query,[cats]);
    
    
        catInTemplate.forEach(function(cat) {
    
            field_html = `
            <tr class="tr_cat "  style="" data-cat-code="${cat.code}">
                <td colspan="${total_field_row*2}" class="widget-header ${cat.class} " >
                    <span style="cursor: pointer;line-height:25px;padding 0px 8px">
                        <strong >${cat.name.toUpperCase()}</strong> 
                    </span>
                    <span style="float:right">[+ Click to expand +]</span>
                </td>
            </tr>`;
    
            (async () => {
                //console.log(cat.code);
                
                // var fields_in_cat = defiant.search(fields, '//*[cat="'+cat.code+'"]');
                var fields_in_cat = alasql('select * from ? where cat = "'+cat.code+'" and ((device = "" or device like "%'+currentDevice.code+'%" ) and exclude_device not like "%'+currentDevice.code+'%" )',[fields]);
    
                fields_in_cat.forEach(function(field) {
                    current_row_field = field.cat !== prev_cat ? 1 : current_row_field;  
                    current_row_field = field.new_line == 1 ? 1 : current_row_field;          
                    prev_cat = field.cat;
    
                    // command = field.command !== "" ? 'data-command="'+field.command+'"' : "#define";
                    param_name = field.param_name !== "" ? 'data-param-name="'+field.param_name+'"' : 'data-param-name="'+field.field_name+'"';
                    readonly = field.readonly == 1 ? 'readonly=' : '';
                    // quote = field.value_quote !== "" ? 'data-param-name="'+field.field_name+'"' : "";
    
                    
                    is_hide = field.is_hide == 1 ? "none" : "";
                    is_hide_in_code = (field.is_hide == 1 && field.checkbox_show == 1) ? "1" : "";
    
                    field_html += (current_row_field == 1)  ? "<tr class='"+cat.code+"' style='display:"+cat.display+"' >" : ""; //NEW ROW if current field = 1
                    
                    label = field.label == "" ? field.field_name : field.label;
                    field_html += '<td class="hasTooltip" data-original-title="'+field.tooltip+'">'+label+'</td>';
    
                    field_html += "<td>";
    
                    if(field.checkbox_show == 1){
                        field_html += `<input type = "checkbox" class="checkbox_show inputbox" name="checkbox_${field.field_name}" value="1" >
                       `;
                    }
    
                    field_attrib = ' name="'+field.field_name+'"  '+ param_name+' '; 
                    field_attrib += ' data-quote="'+ field.value_quote+'" '+readonly+' ';
                    field_attrib += ' data-original-title="'+field.tooltip+'" ';
                    required = field.required == 0 ? "" : " required ";
                    field_attrib += ' class = "hasTooltip field auto_field '+required+' '+field.class+'"  data-command="'+field.command+'" data-command-end="'+field.command_end+'"';
                    field_attrib += ' style = "display:'+is_hide+'"  data-hide-code="'+ is_hide_in_code+'" '; 
    
                    switch(field.field_type){
                        case "select":
                            field_options = field.value.split(",");
                            field_html += '<select '+field_attrib+' >';
                            for (var i = 0; i < field_options.length; i++) {
                                field_html += '<option value="'+field_options[i]+'">'+field_options[i]+'</option>';
                            }                        
                            field_html += '</select>';
                            break;
                        default:
                            field_html += '<input value="'+ field.value+'" type = "'+field.field_type+'" '+field_attrib+'>';               
                            break;
                    }
                    field_html += "</td>";
                    if( current_row_field <  total_field_row){
                        current_row_field++;
                    }else{
                        field_html += "</tr>";
                        current_row_field = 1;
                    }
    
                })//end foreach fields
    
    
    
            })();    
            
            container.append(field_html);
            // console.log(field_html);
    
        });//end foreach cats
    
    },//end draw field function    
	
    drawModule:function(data){

        $("#tbl_module tbody" ).html(_.template($("#tpl-module").html(),{rows:data["modules"]})); //Draw modules list		
		var numModule = $(".module_chooser").length;
		$(".module_chooser").each(function (i,el) { 
			

			let div_module_chooser = $(this).closest("tr").find(".div_module_chooser");

			let task = $(this).attr('id');
			let module_id = $(this).data('module-id');
			let module_code = $(this).data('module-code');

			url = "./module.html";
			$.get(url,function(data){
				div_module_chooser.html(data);				
				app.drawFields("module",div_module_chooser.find("table"),module_code);
				div_module_chooser.hide().find(":input").attr("module-connect",0); //Hide not write
		
				currentModule =  alasql('select * from ? where id = "'+module_id+'" ',[modules]);				
                div_module_chooser.find(".config_default_sourcecode").val(currentModule[0].config_default_sourcecode); //Load preset souce code
                //Set PIN label
                div_module_chooser.find(':input[name*="PIN"]').each(function(){
                    $(this).closest("td").css("background-color","#df6868");
                    $(this).find("option").each(function () {  
                        sql = 'select * from ? where pin_num = "'+$(this).val()+'" and device_id =  "'+currentDevice.id+'"';
                        pinData =  alasql(sql,[device_pin]);
                        pinLabel = pinData[0].pin_code !== "" ? ` (${pinData[0].pin_code} - ${pinData[0].other_function})`: "";
                        $(this).text($(this).text()+pinLabel);
                    });

                }); 
			});  


        })//end loop module 
                
    },//end drawModule function

    checkMainForm:function(){
        let ret = $("#frm_omg").find(":input").not(':input[module-connect="0"]').valid();
        
        if(ret == false){
            swal({type:"error",title:"Please check required field!"});
        }        

		let pinArr= [];
		pin = $(":input[name*='PIN']").not(':input[module-connect="0"]');
		
		for(i=0;i<pin.length;i++){		
			pinArr[i] = pin.eq(i).val();
        }
        
		
		if(hasDuplicates(pinArr)){

			swal({
				type: "error",
				text: "Duplicate PIN found. Please check your PIN on board and fix"
			});
			ret = false;
        }
        


        return ret;
    },

    save:function(writeFile = 0){


        ret = app.checkMainForm();
		
		if(ret == true){


			// if(currentButton.hasClass("btn-save-overwrite")){

			// 	swal({
			// 		title: 'Are you sure to save?',
			// 		html: `<ul>
			// 			<li>All config files wil be overwrite by setting from this Editor</li>
			// 			<li>Files are saved to "${fileLocation}"</li>
			// 		</ul>`,
			// 		type: 'warning',
			// 		showCancelButton: true,
			// 		confirmButtonColor: '#3085d6',
			// 		cancelButtonColor: '#d33',
			// 		confirmButtonText: 'Save and overwrite'
			// 		}).then((result) => {
			// 		if (result.value) {

			// 			app.readInputToGenCode(currentButton);
										
			// 		}
			// 	});	
			// }else{
			// 	app.readInputToGenCode(currentButton);
            // }		
            
            app.readInputToGenCode(writeFile);


		}
    },

    openFolder:function(){
      var folderPath = dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      return `${folderPath[0]}${path.sep}`;      
    },

    openProject:function(folder = 0){

      var config = "";

      if(folder == 0){
        fileLocation = app.openFolder();
      }else{
        fileLocation = folder;
      }

      if (fs.existsSync(fileLocation+"lib")) {
        fs.renameSync(fileLocation+"lib", fileLocation+"libraries")
      }


      var editorJsonPath = fileLocation+"omg_editor.json";   
      // console.log(editorJsonPath);

      if (fs.existsSync(editorJsonPath)) {
          $.blockUI();
          config = app.readJson(editorJsonPath);
          query = `select * from ? where id = "${config.device_id}" ` ;   
          currentDevice =  alasql(query,[device])[0];          

          $.get("./device.html", function (data) {
              // console.log(data["device"]);
              $( "#div_main" ).html(data);
              setTimeout(function(){
              app.loadAllFile(); 
                    $.unblockUI();
              }, 3000); //Wait 3 second for finish layout setting before load project file

              setTimeout(function(){

                    if($("#OMG_VERSION").val() !== pref.omg_version ){
                        $("#div_older_omg").html(`<div class='alert alert-danger'>Current project code is <b>${pref.omg_version}</b>. You should update project or create new project</div>`)

                        swal({
                            type:"error",
                            title:`Project code is out of date`,
                            html:`Press Update to advoid error! <br><b style="color:red">Note: You must re-setup module after update</b>`,
                            allowOutsideClick: false,showCancelButton: true,
                            confirmButtonText: `Update project code!`                            
                        }).then((result) => {
                            if (result.value) {
                                
                                fs.renameSync(fileLocation+"User_config.h", fileLocation+"User_config.h.bak")
                                fs.copySync(`${pref.appSrc}/arduino/code/${pref.omg_version}/src`, fileLocation);
                                fs.removeSync(fileLocation+"User_config.h");
                                fs.renameSync(fileLocation+"User_config.h.bak", fileLocation+"User_config.h");
                                userConfigFile = fs.readFileSync(fileLocation+"User_config.h", 'utf8')
                                userConfigFile = userConfigFile.replace($("#OMG_VERSION").val(), pref.omg_version);
                                fs.writeFileSync(fileLocation+"User_config.h", userConfigFile, 'utf8');
                                                                
                                
                                swal({
                                    type:"success",
                                    title:`Project code updates successfully. You must re-setup module`,
                                }).then((result) => {
                                    if (result.value) {
                                  
                                        app.openProject(fileLocation);
                                  
                                    }
                                })
                          
                          
                            }
                        })
                    }
              

                }, 5000); //Wait 5 second to update project
              
          });                

      }else{ //NO Editor.json found. Load new layout
          swal("","New project or Open existed OMG source code. Choose your device to continue!")
          $.get("./new.html", function (data) {
              $( "#div_main" ).html(data);
                
          });          
      }    





        

                
    },//end drawModule function   


    saveProjectEditorJson:function(device_id,device_code){

        try{

            json = `[{"name":"device_id","value":"${device_id}"},{"name":"device_code","value":"${device_code}"}]`;

            fs.writeFile(fileLocation+"omg_editor.json",json, function (err) {
                if(err){
                    swal("","An error ocurred creating the file "+ err.message)
                }else{
                    swal({
                        type: 'success',
                        title: 'Device for project saved successfully!',
                        text: '',				
                    });
                    app.log(`Save ${fileLocation}/omg_editor.json` )
    
                }			
    
            });	            

        }catch(e){

        }

	

    },

    log:function (msg) {  
        $("#div_log").prepend(`<tr><td><b>${getTime()}</b>:${nl2br(msg)}</td></tr><br>`);
    },

    openPreference:function(){
      (async function() {
          $('#div_modal').modal('toggle');
          try {
            var response = await axios.get("./preference.html");
            $("#div_modal").html(response.data)
            // console.log(response);
        } catch (error) {
            console.error(error);
        }
      })();     
    },

    serialPlotter:function(){
 


      // port.open(function (err) {
      // if (err) {
      //   $("#frm_serial tbody").append(`
      //     <tr>
      //         <td>${getTime()}</td>
      //         <td style="color:red">'Error opening port: '${err.message}. Check if you are running Serial Plotter (Arduino IDE) or any COM listener tool</td>
      //     </tr>`);      
      //   }

      // Because there's no callback to write, write errors will be emitted on the port:
        // port.write('main screen turn on')
      // })

     
    },

    checkPort:async function(){
      portList = await SerialPort.list(); 
      //  console.log(portList);
      return portList;
    },
    
    mqttHelp:function(){
      swal({
        type:"warning",
        title: "MQTT server receives and sends data to and from device. Try this:",
        html:`<div style="text-align:left">
        <ul>
          <li><b>MQTT sever installed:</b> Double check server IP, username and password</li>
          <li><b>Don't have MQTT server: </b> Download <a href="https://mosquitto.org/download/" target="_blank">MOSQUITTO</a>, install. Set host to "localhost" or IP of machine Mosquitto installed. Port 1883</li>
        </ul>
        </div>`
      })
    },

  
    

};//end app



function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function checkTime(i) {
  return (i < 10) ? "0" + i : i;
}

function getTime() {
  var today = new Date(),
  h = checkTime(today.getHours()),
  m = checkTime(today.getMinutes()),
  s = checkTime(today.getSeconds());
  return h + ":" + m + ":" + s
}   


//Generate code button
function hasDuplicates(array) {
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (value in valuesSoFar) {
            return true;
        }
        valuesSoFar[value] = true;
    }
    return false;
}