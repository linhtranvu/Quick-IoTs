const dev_mode = 0;
const production_server = "http://49.156.54.103"
const userAgent = navigator.userAgent.toLowerCase();
var fileLocation;

var fs = "";
var readline = "";
var api_host = "";
var config = "";
var { dialog } = "";
var parser;
var path;

if (userAgent.indexOf(' electron/') > -1) { //Electron code only
    fs = require('fs');
    readline = require('readline');
    var { dialog } = require('electron').remote;
    path = require('path');



}else{ //Browser code only
    $(".electron").remove();
}  


var app = {
    home:function(){

      (async function() {
        try {
            $.blockUI();   
          var url = api_host+"/iots/index.php?option=com_omg&view=omg&task=home&format=raw";
          console.log(url);
          var response = await axios.get(url);
            // console.log(response);
            $( ".tbl-devices tbody" ).html(_.template($("#tpl-datatable").html(),{rows:response.data["device"]}));  
            $.unblockUI();

        } catch (error) {
          console.error(error);
          $.unblockUI();
        }
      })();     


    },

    readConfig:function() {
    
        var json = "";

        if (userAgent.indexOf(' electron/') > -1) {

            $(".browser").remove();

            if (!fs.existsSync("./preference.json")){
                fs.copyFileSync('./resources/app/preference.json', 'preference.json', (err) => {
                    if (err) throw err;                    
                });
                swal('',"Welcome! This is your first time using OMG Editor. Config file created!");
            }            

            config = app.readJson('preference.json');
            
        }else{
            $(".electron").remove();
            json += `{"devMode":"${dev_mode}",`;
            json += `"productionServer":"${production_server}"}`;
            config = JSON.parse(json);
        }          

        
        api_host = (config.devMode == "1" )?"http://localhost": config.productionServer;
        return config;
        
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
            config = JSON.parse(json);
            return config;

        } catch(e) {
            swal({"type":"error","text":e}); // error in the above string (in this case, yes)!
        }
        

    },

	readInputToGenCode:function(currentButton){
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
						if(currentButton.hasClass("btn-save-overwrite")){
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
				module_config = module_div.find(".config_default_sourcecode").val()+"<br>\r\n";
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

						if(currentButton.hasClass("btn-save-overwrite")){
							app.saveFile(moduleFileName,"#"+id_code_container);
						}
					}					
				});
			}

		});	//END WRITING MODULE FILES
    },
    
    //Generate Code function
    generateCode:function(object) {

       
        command = typeof object.data("command") !== "undefined" ? object.data("command") : "#define"; 
        
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

	loadAllFile:function(fileLocation){
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
               
        if (fs.existsSync(fileName)) {  

        
            app.log(`Read file ${fileName}`);

            indexLine = 0;
            var field_json = "{";
            var rd = readline.createInterface({
                input: fs.createReadStream(fileName),
                output: process.stdout,
                console: false
            });
            
            rd.on('line', function(line) {

            try {    
                // console.log(line);
                if(line.startsWith('/*')){
                    throw "Config files in this project not generate by OMG Editor. You need to save first!";
                   
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
                            valueInQuote = line.match(/"([^']+)"/);
                            // value = valueInQuote[1].replace(/\"+/g, ' ');//remove quote in value
                            value = valueInQuote[1]//remove quote in value
                            // console.log(value);
                        }					
    
                        
                    }else if(line.indexOf('}') > 0){
                        valueInQuote = line.match(/{([^']+)}/);
                        value = "{"+valueInQuote[1]+"}";//remove quote in value
                        // console.log(value);					
                    }
                    else{
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
            swal("No OMG config files found!");
        }



    },
    

    drawFields:function(template,container,module_code){

        var current_row_field = 1;
        var total_field_row = 2; // x2 = number of TD for 1 field (1 for lable and 1 for field) 
        var prev_cat = 0;
        var field_html = "";
        
        query = 'select * from ? where template = "'+template+'" and parent_code = ""';
        if(template == "module"){
            query += ' and (module = "'+module_code+'" or module = "" )'
        }
    
        catInTemplate =  alasql(query,[cats]);
    
    
        catInTemplate.forEach(function(cat) {
    
            field_html = `
            <tr class="tr_cat " style="cursor: pointer;" data-cat-code="${cat.code}">
                <td colspan="${total_field_row*2}" class="widget-header ${cat.class} ">
                    <strong>${cat.name.toUpperCase()}</strong> <span style="float:right">[+ Click to expand +]</span>
                </td>
            </tr>`;
    
            (async () => {
                //console.log(cat.code);
                
                // var fields_in_cat = defiant.search(fields, '//*[cat="'+cat.code+'"]');
                var fields_in_cat = alasql('select * from ? where cat = "'+cat.code+'" and ((device = "" or device like "%'+device.code+'%" ) and exclude_device not like "%'+device.code+'%" )',[fields]);
    
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
    
                    field_html += "<td>"+field.label+"</td>";
    
                    field_html += "<td>";
    
                    if(field.checkbox_show == 1){
                        field_html += `<input type = "checkbox" class="checkbox_show inputbox" name="checkbox_${field.field_name}" value="1" >
                       `;
                    }
    
                    field_attrib = ' name="'+field.field_name+'"  '+ param_name+' '; 
                    field_attrib += ' data-quote="'+ field.value_quote+'" '+readonly+' ';
                    field_attrib += ' data-original-title="'+field.tooltip+'" ';
                    field_attrib += ' class = "hasTooltip field auto_field required '+field.class+'"  data-command="'+field.command+'" data-command-end="'+field.command_end+'"';
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
			});  


        })//end loop module 
                
    },//end drawModule function

    openProject:function(data){

       

        var config = "";

        try{
            var folderPath = dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            fileLocation = `${folderPath[0]}${path.sep}`;
            var editorJsonPath = fileLocation+"omg_editor.json";   
            // console.log(editorJsonPath);

            if (fs.existsSync(editorJsonPath)) {
                $.blockUI();
                config = app.readJson(editorJsonPath);
                   
                var api_url = api_host+"/iots/index.php?option=com_omg&view=omg&task=device&format=raw&id="+config.device_id;
                $("#api_url").val(api_url);       

                $.get("./device.html", function (data) {
                    // console.log(data["device"]);
                    $( "#div_main" ).html(data);
                    setTimeout(function(){
                         app.loadAllFile(fileLocation); 
                         $.unblockUI();
                    }, 3000);
                    // setTimeout(app.loadAllFile(fileLocation), 5000);               
                    // app.loadAllFile(fileLocation);
                    
                });                
    
            }else{ //NO Editor.json found. Load new layout
                swal("","No omg_editor.json, new project found. You need to choose your device to continue!")
                $.get("./new.html", function (data) {
                    $( "#div_main" ).html(data);
                     
                });          
            }    

        }catch(e){
            // swal(e.message);
            $.unblockUI();
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
        $("#div_log").append(msg+"<br>");
    }
    

};//end app





