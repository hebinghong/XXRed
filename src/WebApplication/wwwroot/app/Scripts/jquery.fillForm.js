/**
**填充表单
**json格式的数据,回调函数fn(key,value).
** fn 回调函数中【this:当前正在操作的jquery对象,key:当前jquery对象的id,value:当前jquery对象的值】
*/
(function ($) {
    $.fillForm = function (jsons, fn) {
		$(document).fillForm(jsons, fn);
	}
	$.fn.fillForm = function (jsons, fn) {
		var $this=this;
        var setVal = function (j, fn) {
            var nodeName, type, cur, value, re = /^\/Date{1}\(\d+\)+/, reNum = /[^\d]*/;
            if (j && j.errmsg) {
                alert(j.errmsg);
                return;
            }
            for (var key in j) {
                try {
                    cur = $("#" + key,$this), type = cur.attr("type"), value = j[key], nodeName = cur[0].nodeName.toLowerCase(), defaultVal = cur[0].defaultValue;
                    if(value=="null")
                    	value="";
                    if (nodeName == 'input' && (type == 'checkbox' || type == 'radio') && !$.isArray(value)) {
                        var name = cur.attr("name");
                        $("input[type='" + type + "'][name='" + name + "']",$this).each(function () {
                            var curVal = $(this).val();
                            if (curVal.toLowerCase() == value.toString().toLowerCase()) {
                                $(this).attr("checked", "checked");
                                return false;
                            }
                        });
                        continue;
                    }
                    else if (value) {
                        if (re.test(value)) {
                            value = value.replace(reNum, "").replace(")/", "");
                            var date = new Date(parseInt(value, 10));
                            value = date.getFullYear() + "-" + (parseInt(date.getMonth(), 10) + 1) + "-" + date.getDate();
                        }
                        if (nodeName == 'select' && !$.isArray(value)) {
                            if (typeof value !== 'string') value += "";
                            if (value != "") {
                                if (!cur.find("option[value='" + value + "']").length) {
                                    $("<option value='" + value + "'>" + value + "</option>").appendTo(cur);
                                }
                            }
                        }
                        if (fn && $.isFunction(fn)) {
                            if (!fn.apply(cur, [key, value])) {
                                continue;
                            }
                        }
                    }
                    else {
                        value = "";
                    }
                    if (defaultVal != "" && value == "") {
                        continue;
                    }
                    cur.val(value);
                    defaultVal = nodeName = type = cur = null;
                }
                catch (ex) {
                }
            }
            j = null;
        }
        if ($.isArray(jsons)) {
            for (var i = 0, len = jsons.length; i < len; i++) {
                setVal(jsons[i], fn);
            }
        } else {
            setVal(jsons, fn);
        }
        jsons = fn = null;
        return this;
    }
})(jQuery);

(function($){  
    $.fn.serializeJson=function(){  
        var serializeObj={};  
        var array=this.serializeArray();  
        var str=this.serialize();  
        $(array).each(function(){  
            if(serializeObj[this.name]){  
                if($.isArray(serializeObj[this.name])){  
                    serializeObj[this.name].push(this.value);  
                }else{  
                    serializeObj[this.name]=[serializeObj[this.name],this.value];  
                }  
            }else{  
                serializeObj[this.name]=this.value;   
            }  
        });  
        return serializeObj;  
    };  
})(jQuery); 