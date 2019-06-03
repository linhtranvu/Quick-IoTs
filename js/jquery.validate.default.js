(function($){	
	jQuery.extend(jQuery.validator.messages, {
		 required: "Please enter value.",
		 remote: "Hãy sửa cho đúng.",
		 email: "Hãy nhập email.",
		 url: "Hãy nhập URL.",
		 date: "Hãy nhập ngày.",
		 dateISO: "Hãy nhập ngày (ISO).",
		 number: "Hãy nhập số.",
		 digits: "Hãy nhập chữ số.",
		 creditcard: "Hãy nhập số thẻ tín dụng.",
		 equalTo: "Hãy nhập thêm lần nữa.",
		 accept: "Phần mở rộng không đúng.",
		 maxlength: jQuery.validator.format("Hãy nhập từ {0} kí tự trở xuống."),
		 minlength: jQuery.validator.format("Hãy nhập từ {0} kí tự trở lên."),
		 rangelength: jQuery.validator.format("Hãy nhập từ {0} đến {1} kí tự."),
		 range: jQuery.validator.format("Hãy nhập từ {0} đến {1}."),
		 max: jQuery.validator.format("Hãy nhập từ {0} trở xuống."),
		 min: jQuery.validator.format("Hãy nhập từ {1} trở lên.")
		});
	jQuery.validator.setDefaults({
		errorClass:'error',
		errorPlacement : function(error, element) {
			// if the input has a prepend or append element, put the validation msg after the parent div
			if (element.parent().hasClass('input-prepend')
					|| element.parent().hasClass('input-append')) {
				error.insertAfter(element.parent());
				// else just place the validation message immediatly after the input
			}else if(element.is('.chosen-select')) {
				error.insertAfter(element.siblings('[class*="chosen-container"]:eq(0)'));
			} else {
				error.insertAfter(element);
			}
		},
		errorElement : "small", // contain the error msg in a small tag
		wrapper : "div", // wrap the error message and small tag in a div
		highlight : function(element,errorClass, validClass) {
			$(element).closest('.control-group').addClass(errorClass).removeClass(validClass);			
		},
		unhighlight : function(element,errorClass, validClass) {
			$(element).closest('.control-group').addClass(validClass).removeClass(errorClass); 
		},
		success : function(element) {
			$(element).closest('.control-group').removeClass('error'); // remove the Boostrap error class from the control group
		}
	});
	var dtCh= "/";
	var minYear=1900;
	var maxYear=2100;
	function stripCharsInBag(s, bag){
		var i;
	    var returnString = "";
	    // Search through string's characters one by one.
	    // If character is not in bag, append to returnString.
	    for (i = 0; i < s.length; i++){   
	        var c = s.charAt(i);
	        if (bag.indexOf(c) == -1) returnString += c;
	    }
	    return returnString;
	}
	function isInteger(s){
		var i;
	    for (i = 0; i < s.length; i++){   
	        // Check that current character is number.
	        var c = s.charAt(i);
	        if (((c < "0") || (c > "9"))) return false;
	    }
	    // All characters are numbers.
	    return true;
	}
	function daysInFebruary (year){
		// February has 29 days in any year evenly divisible by four,
	    // EXCEPT for centurial years which are not also divisible by 400.
	    return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
	}
	function DaysArray(n) {
		for (var i = 1; i <= n; i++) {
			this[i] = 31
			if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
			if (i==2) {this[i] = 29}
	   } 
	   return this
	}
	$.validator.addMethod("dateVN", function(value, element) {
		var dtStr = value;
		var daysInMonth = DaysArray(12);
		var pos1=dtStr.indexOf(dtCh);
		var pos2=dtStr.indexOf(dtCh,pos1+1);
		var strDay=dtStr.substring(0,pos1);
		var strMonth=dtStr.substring(pos1+1,pos2);
		var strYear=dtStr.substring(pos2+1);
		strYr=strYear;
		if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1);
		if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1);
		for (var i = 1; i <= 3; i++) {
			if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1);
		}
		month=parseInt(strMonth);
		day=parseInt(strDay);
		year=parseInt(strYr);
		if (pos1==-1 || pos2==-1){		
			return false;
			
		}
		if (strMonth.length<1 || month<1 || month>12){
			return false;
		}
		if (strDay.length<1 || day<1 || day>31 || (month==2 && day>daysInFebruary(year)) || day > daysInMonth[month]){
			return false;
		}
		if (strYear.length != 4 || year==0 || year<minYear || year>maxYear){
			return false;
		}
		if (dtStr.indexOf(dtCh,pos2+1)!=-1 || isInteger(stripCharsInBag(dtStr, dtCh))==false){
			return false;
		}	
		return true;
	}, "Định dạng ngày không đúng");	
})(jQuery);