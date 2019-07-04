$(document).ready(function () {
		
	if (userAgent.indexOf(' electron/') > -1) {	
		$(".browser").remove();
	}else{
		$(".electron").remove();
	}  	

	$(".div_container_device").css("height", $(window).height()-70);	
	
   //Get all data from server (JSON) and processing data

		
	$(".btn-device").html("<i>"+currentDevice.name+"</i>");				
	app.drawFields("device",$("#tbl_omg_config"),"");  //Draw main layout		
	app.drawModule(apiData); //Draw module field;



      
	$("#div_device_wifi_setup, #mqtt_server_name").hide();
	$("#div_manual_network_setup").hide();
	$(".base_topic").html($("#Base_Topic").val());
	$(".gateway_name").html($("#Gateway_Name").val());

	//Generate id,tooltip for hard code field	
	$(":input").not(".auto_field").each(function(){
		$(this).attr("id",typeof $(this).attr("id") !== "undefined" ? $(this).attr("id") : $(this).attr("name"));
		if($(this).hasClass("hasTooltip")){
			$(this).attr("data-original-title",typeof $(this).attr("tooltip") !== "undefined" ? $(this).attr("tooltip") : "");
		}			
	})

	//Checkbox turn ON, OFF to show hidden attribute
	$( "body" ).undelegate( ".checkbox_show","change").delegate( ".checkbox_show", "change", function() {
		if($(this).prop('checked') == true){
			$(this).closest("td").find(".field").show().attr("data-hide-code","0");
		}else{
			$(this).closest("td").find(".field").hide().attr("data-hide-code","1");
		}		
	})



	
	//Choose network type
	$("#ESPWifiManualSetup").change(function(){
		if($(this).val() == "false"){
			$("#div_device_wifi_setup").show();
			$("#div_manual_network_setup").hide();
			$("#ESPWifiManualSetup").attr("data-hide-code",1); //#define ESPWifiManualSetup   false  CANNOT BE WRITE or error 
			$(".div_network_info").html(`<ul>
			
			<li> <span class="label label-success arrowed-in arrowed-in-right">Recommend!</span> This setting allows you to setup Network connection for Device after build and upload. 
			<li> Device will create a Wifi with the name of 'Device Wifi name' and password of 'Device Wifi password' </li>
			<li> Connect to Wifi of device, open browser and enter 192.168.4.1</li>			
			<li>Enter Wifi setting and MQTT setting. <a href="./img/wifi_setup.png" target="_blank">Example here</im></li>
			</ul>`)
		}
		if($(this).val() == "true"){ 
			$("#div_device_wifi_setup").hide();
			$("#div_manual_network_setup").show();	
			$("#ESPWifiManualSetup").attr("data-hide-code",0); //#define ESPWifiManualSetup   false  CANNOT BE WRITE or error 
			


			$(".div_network_info").html(`<ul>
			
			<li> You must enter value of Network connection for Device below. So you can't bring device out after build.
			<li> Enter name and password of Wifi that device connects to</li>
			<li> Enter IP, username & password of MQTT server that device connects to. If you install a fresh Mosquitto MQTT server, username and password are blank</li>			
			</ul>`)
								
		}			
	})

	if(currentDevice.code == "esp8266"){
		
		$("#ESPWifiManualSetup").val("false").change();
	}else if(currentDevice.code == "esp32"){
		$("#ESPWifiManualSetup").val("true").change();
		$("#ESPWifiManualSetup").hide();
	}else{
		$("#ESPWifiManualSetup").val("true").change();
		$("#ESPWifiManualSetup").hide();
		$("#div_manual_network_setup").show();
		$("#div_device_wifi_setup").hide();

		$(".div_network_info").html(`<ul>
			
		<li> Arduino will be automatically assigned IP by LAN's DHCP server. </li>
		<li>If no DHCP found, device will be assigned IP setting in "Advance network"</li>
		<li> Enter IP, username & password of MQTT server that device connects to. If you install a fresh Mosquitto MQTT server, username and password are blank</li>			
		</ul>`)		

	}	



	//Choose mqtt server
	$("#use_mqtt_host").change(function(){
		if($(this).val() == "1"){
			$("#mqtt_server_name").show();
		}
		if($(this).val() == "0"){
			$("#mqtt_server_name").hide();
		}			
	})

	//Category show/hide
	$( "body" ).undelegate( ".tr_cat","click").delegate( ".tr_cat", "click", function() {
		cat_code = $(this).data("cat-code");
		$("."+cat_code).toggle();
	})


	//Change base topic mqtt
	$("#Base_Topic").change(function(){
		$(".base_topic").html($("#Base_Topic").val());
	})
	$("#Gateway_Name").change(function(){
		$(".gateway_name").html($("#Gateway_Name").val());
	})

	//Module change
	
	$( "body" ).undelegate( ".module_chooser","change").delegate( ".module_chooser", "change", function() {

		currentModuleChooser = $(this);
		if(currentModuleChooser.attr("exclude-module") !== ""){
			excludeModule = currentModuleChooser.attr("exclude-module").split(",");
			// console.log(excludeModule);

			for(j=0;j<excludeModule.length;j++){

				if($(".module_chooser:checked[data-module-code='"+excludeModule[j]+"']").length > 0){
					swal("",`You need to turn off ${$(".module_chooser:checked[data-module-code='"+excludeModule[j]+"']").attr("data-module-code")} before using this module`);
					currentModuleChooser.prop("checked", false);
					return;
				}						
	
			}				
		}

		let div_module_chooser = $(this).closest("tr").find(".div_module_chooser");

		if(currentModuleChooser.prop("checked")){

			div_module_chooser.show();
			div_module_chooser.find(":input").attr("module-connect",1);

		}else{
			div_module_chooser.hide();
			div_module_chooser.find(":input").attr("module-connect",0);
		}

	}); //end module chooser

	$(".btn-help-browser").attr("href",currentDevice.link)

	$(".btn-create-user-app").click(function(){
		Swal("Work in progress!","We are working hard to add this this feature, so you could create app to view sensor data and control gateway in a click","warning");
	});

	
	$(".btn-device").click(function(){
		swal({
			showComfirmButton: false,
			html:`<div style="font-size: 14px">
    <table class="table table-bordered table-condensed table-striped table-hover">
        <tr>
            <td>Name</td>
            <td>${currentDevice.name}</td>
        </tr>
        <tr>
            <td>Image</td>
            <td><img style="width:85%;margin-bottom:10px;border-radius:8px;max-width:100px;border: 1px solid #ddd;" src="./img/${currentDevice.image}" ></td>
        </tr>
        <tr>
            <td>Desciption</td>
            <td>
                ${currentDevice.description}

            </td>
        </tr>     
        <tr>
            <td>Price</td>
                <td>
                    ${currentDevice.price}
    
                </td>
            </tr>        
            <td>Buy</td>
                <td>
                <a href="${currentDevice.buy_url}" target="_blank">
                        <img style="width:60%" src="./img/aliexpress.png" >
                    </a>
    
                </td>
            </tr>                        
    </table>
</div>`
		})
	})

	$(".btn-home").click(function(){

		Swal.fire({
			title: 'Back to Home?',
			text: "You will lose your work if not save, are you sure!",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, go back Home!'
		  }).then((result) => {
			if (result.value) {
				window.location.href = './index.html';			
			}
		  })


	});


	//Load config files
	$(".btn-load-file").click(function(){
		app.loadAllFile();
	});


	$(".btn-change-device	").click(function(){
			swal({
					title: 'Change device?',
					html: `<div style="text-align: left">
    <ul>
        <li>Save before continue or all changes will be lost!</li>
        <li>You have to re-setup PIN to fit your device.
        </li>        
    </ul>
</div>

	`,
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Change device'
					}).then((result) => {
					if (result.value) {

						$.get("./new.html", function (data) {
							$( "#div_main" ).html(data);
							 
						});   										
					}
			});	
							
	});
	
	$(".btn-generate-config").click(function(){

		app.save(0);

	});
	
	$(".btn-save-overwrite").click(function(){

		app.save(1);

	});



	//Copy code button 

	$( "body" ).undelegate( ".btn-copy","click").delegate( ".btn-copy", "click", function() {
		/* Get the text field */
		var copy_wrapper = $(".copy_wrapper");
		copy_wrapper.show();
		copy_wrapper.val($(this).closest(".div_file_wrapper").find(".well").text());

		/* Select the text field */
		copy_wrapper.select();

		/* Copy the text inside the text field */
		document.execCommand("copy");
		copy_wrapper.hide();
		swal("","Copy to clipboard success, paste to your file and upload to device!")
		// alert("Copied the text: " + copy_wrapper.val());
	});

	$(".btn-serial").click(function (e) { 
		// $("#div_modal_serial").modal('toggle');
			app.openSerial();

	});


	$(".btn-quick-build").click(function (e) { 

		if(serialWindow !== null){
			serialWindow.close();
		}
		

		if(fs.existsSync("./build_in_process")){ //Rom is being built, folder build exists
			$("#div_modal_build").modal({backdrop: 'static', keyboard: false});		
		}else{

			if( app.checkMainForm() == true){

				app.save(1); //save(1) mean save to file
				setTimeout(function(){					

					(async function(){

						portList = await app.checkPort();
						// portList.length = 3;
						if(portList.length > 0){
							await buildApp.buildUpload();
							$("#port_name").html(portList[0].comName+" | "+portList[0].manufacturer)
						}else{
							swal({
								type:"error",title:"No device found!",
								html:`<div style="text-align: left">
    <ul>
        <li>
            Plug device to USB of computer, <a href="./img/device_usb_plug.png" target="_blank">example picture</a>         

        </li>
        <li>Have plugged: Re-plug your device</li>
        <li>I just buy device: Driver for device need to be installed. Follow <a href="./help/driver.html" target="_blank">this guide to install driver</a> for each device</li>
    </ul>
</div>`
							})
						}			
					})()

				},2000);			
	
			}			

		}

	});	



	$(".btn-reset-build").click(function (e) { 
		Swal.fire({
			title: 'Are you sure to reset?',
			text: "Don't reset if build is running! You will mess the whole build flow",
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, reset!'
		}).then((result) => {
			if (result.value) {
				fs.rmdirSync("./build_in_process")
			}
		})		
		

	});		

	

	$(" .btn-browser-notwork").click(function(){
		swal({type:"error",html:`This feature only work with desktop version. Please download to use
		<br><b><a target='_blank' href='http://www.quickiots.com'>DOWNLOAD</a></b>`});
	})


	$(" .btn-mqtt").click(function(){
		app.openMQTT();
		// window.open('./mqtt.html', 'electron', 'frame=false,menubar=no ')
	});
	
	

	$('.hasTooltip').tooltip({"html": true,"container": "body"});

});//end document ready



