/**
 * javascript tien ich phuc vu he thong
 */
/**
* @param object A form element
* @param string The name of the element to find
*/
function getElementByName( f, name ) {
	if (f.elements) {
		for (i=0, n=f.elements.length; i < n; i++) {
			if (f.elements[i].name == name) {
				return f.elements[i];
			}
		}
	}
	return null;
}
function SelectAll(selobj,childobj){
	var arr = document.getElementsByName(childobj+"[]");
	for(var i=0;i<arr.length;i++){
		arr[i].checked = selobj.checked;
	}
}
function FillDataToCombo(objg,objd,obju,arruser,exparr,idu){
//	alert(arruser);
	
	for (var i=obju.length-1;i>=0;i--) {
		var objuo = obju.options[i];
		if(objuo.selected){
			obju.removeChild(obju.options[i]);
		}
	}	
	for(var i =0;i<arruser.length;i++)
	{
//		alert(arruser.length);
		if(objg.value == arruser[i][0] && objd.value == arruser[i][1])
		{
			var ok=true;
//			alert(arrusaer[0][0]);
			if(exparr!=null){
				for(var j=0;j<exparr.length;j++){
					//alert(exparr[j].length);
					if(exparr[j][0]==arruser[i][2]){
						ok=false;
						break;
					}
				}
			}
			if(ok){
				var OptNew = document.createElement('option');
//				alert(arruser[0][3]);
				OptNew.text = arruser[i][3];
				OptNew.value = arruser[i][2];
				if(idu==arruser[i][2]){
					OptNew.selected ='selected';
				}
				//alert(arr[i][2]+' '+arr[i][3]);
				try {
	//				alert(arruser[i][0]);
					obju.add(OptNew, null); // standards compliant; doesn't work in IE
				}
				catch(ex) {
					obju.add(OptNew); // IE only
				}
			}
		}
	}
}
function FillDataToComboFromDep(objd,obju,arruser,exparr){
//	alert(objd);
	for (i = obju.length - 1; i>=0; i--) {
		obju.removeChild(obju.options[i]);
	}	
	for(var i =0;i<arruser.length;i++)
	{
		var ok=true;
//		alert(arruser[i][0]);
		if(objd.value==arruser[i][0])
		{
			if(exparr!=null){
				for(var j=0;j<exparr.length;j++){
					//alert(exparr[j].length);
					if(exparr[j][0]==arr[i][2]){
						ok=false;
						
						break;
					}
				}
			}
			if(ok){
	//			alert(arruser[0][2]);
				var OptNew = document.createElement('option');
	//			alert(arruser[0][3]);
				OptNew.text = arruser[i][2];
				OptNew.value = arruser[i][1];
				//alert(arr[i][2]+' '+arr[i][3]);
				
				try {
	//				alert(arruser[i][0]);
					obju.add(OptNew, null); // standards compliant; doesn't work in IE
				}
				catch(ex) {
					obju.add(OptNew); // IE only
				}
			}	//			alert('ss');
		}
	}
}
function FillComboBy2Combo(obj1,obj2,objdesc,arr,exparr){
	for (i = objdesc.length - 1; i>=0; i--) {
		objdesc.removeChild(objdesc.options[i]);
	}	
	
	for(var i=0;i<arr.length;i++){		
		if(arr[i][0]==obj1.value && arr[i][1]==obj2.value){
			var ok=true;
			
			if(exparr!=null){
				for(var j=0;j<exparr.length;j++){
					//alert(exparr[j].length);
					if(exparr[j][0]==arr[i][2]){
						ok=false;
						
						break;
					}
				}
			}
			if(ok){
				var elOptNew = document.createElement('option');
				elOptNew.text = arr[i][3];
				elOptNew.value = arr[i][2];
				//alert(arr[i][2]+' '+arr[i][3]);
				try {
				  objdesc.add(elOptNew, null); // standards compliant; doesn't work in IE
				}
				catch(ex) {
				  objdesc.add(elOptNew); // IE only
				}
			}
		}
	}
}
function convertDateVNtoMySQL(datevn){
	datevn = trim(datevn);
	var arr = datevn.split("/");
	var day = arr[0];
	var month = arr[1];
	var year = arr[2];
	return year+'-'+month+'-'+day;   
}
function convertDateMySQLtoVN(datemysql){
	datemysql = trim(datemysql);
	var arr = datemysql.split("-");
	var day = arr[2];
	var month = arr[1];
	var year = arr[0];
	return day+'/'+month+'/'+year;   
}
function loadDivFromUrl(iddiv,url){
	jQuery("#"+iddiv).load(url);
}
function FillComboByComboWithSel(obj,objdesc,arr,sel){
	for (i = objdesc.length - 1; i>=0; i--) {
		objdesc.removeChild(objdesc.options[i]);
		}
		for(var i=0;i<arr.length;i++){
		if(arr[i][0]==obj.value || obj.value==0){
		var elOptNew = document.createElement('option');
		elOptNew.text = arr[i][2];
		elOptNew.value = arr[i][1];
		try {
		objdesc.add(elOptNew, null); // standards compliant; doesn't work in IE
		}
		catch(ex) {
		objdesc.add(elOptNew); // IE only
		}
		}
		}
		objdesc.value = sel;
		}
//	function loadjscssfile(filename, filetype){
//	 if (filetype=="js"){ //if filename is a external JavaScript file
//	  var fileref=document.createElement('script');
//	  fileref.setAttribute("type","text/javascript");
//	  fileref.setAttribute("src", filename);
//	 }
//	 else if (filetype=="css"){ //if filename is an external CSS file
//	  var fileref=document.createElement("link");
//	  fileref.setAttribute("rel", "stylesheet");
//	  fileref.setAttribute("type", "text/css");
//	  fileref.setAttribute("href", filename);
//	 }
//	 if (typeof fileref!="undefined")
//	  document.getElementsByTagName("head")[0].appendChild(fileref);
//	}
//	var filesadded="";//list of files already added

//	function checkloadjscssfile(filename, filetype){
//		 if (filesadded.indexOf("["+filename+"]")==-1){
//		  loadjscssfile(filename, filetype);
//		  filesadded+="["+filename+"]"; //List of files added in the form "[filename1],[filename2],etc"
//		 }
//		 else{
//			  //alert("file already added!");
//		 }
//	}
	function showOrHideAllDropDowns(newState) {
		var is_ie6 = (
				window.external &&
				typeof window.XMLHttpRequest == "undefined"
			);
		if (is_ie6)
		{
			var elements = document.getElementsByTagName('select');
			 
		    for (var i=0; i<elements.length; i++) {
		        elements[i].style.visibility = newState;
		        elements[i].style.border = "1px solid";
		    }
		}
	}
	function cancelEvent(evt){
		if(!evt) evt=window.event;
		if (evt.stopPropagation) evt.stopPropagation(); // DOM Level 2
		else evt.cancelBubble = true;
//		alert(evt);
}
