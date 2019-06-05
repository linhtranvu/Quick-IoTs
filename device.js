var device = "";
var cats = "";
var fields = "";

$(document).ready(function () {
		
	if (userAgent.indexOf(' electron/') > -1) {	
		$(".browser").remove();
	}else{
		$(".electron").remove();
	}  	

	$(".div_container_device").css("height", $(window).height()-70);	
	
   //Get all data from server (JSON) and processing data
	$.get($('#api_url').val(), function (data, textStatus, jqXHR) {
		device = data["device"];
		cats = data["cat"];
		modules = data["modules"];
		fields = data["field"];    
		
	$(".btn-device").html("<i>Device: "+data["device"].name+"</i>");				
	app.drawFields("device",$("#tbl_omg_config"),"");  //Draw main layout		
	app.drawModule(data); //Draw module field;


	}); //end get data

      
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
		}
		if($(this).val() == "true"){
			$("#div_device_wifi_setup").hide();
			$("#div_manual_network_setup").show();				
		}			
	})

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

		let div_module_chooser = $(this).closest("tr").find(".div_module_chooser");

		if($(this).prop("checked")){

			div_module_chooser.show();
			div_module_chooser.find(":input").attr("module-connect",1);

		}else{
			div_module_chooser.hide();
			div_module_chooser.find(":input").attr("module-connect",0);
		}

	}); //end module chooser

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
					html: `
You will go to change device layout. You have to resetup PIN to fit your device. All working <b>will be loss</b> if not saved!
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
	



	//Generate code button
	
	$(".btn-generate-config, .btn-save-overwrite").click(function(){
		let ret = $("#frm_omg").find(":input").not(':input[module-connect="0"]').valid();
		
		currentButton = $(this);

		if(ret == true){


			if(currentButton.hasClass("btn-save-overwrite")){

				swal({
					title: 'Are you sure to save?',
					html: `<ul>
						<li>All config files wil be overwrite by setting from this Editor</li>
						<li>Files are saved to "${fileLocation}"</li>
					</ul>`,
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#3085d6',
					cancelButtonColor: '#d33',
					confirmButtonText: 'Save and overwrite'
					}).then((result) => {
					if (result.value) {

						app.readInputToGenCode(currentButton);
										
					}
				});	
			}else{
				app.readInputToGenCode(currentButton);
			}				


		}else{
			swal("Please check required field!");
		}
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



	$('.hasTooltip').tooltip({"html": true,"container": "body"});

});//end document ready



