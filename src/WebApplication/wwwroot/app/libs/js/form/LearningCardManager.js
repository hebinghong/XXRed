/**
**添加表单样式
*/
(function ($) {
    $.formsheet = function () {
        $("input[type='text'],textarea,select", ".form_table").each(function () {
            var cur = $(this), nodeName = cur[0].nodeName;
            cur.addClass("search_input");
            if (nodeName == "SELECT") cur.addClass("search_select");
        });
        var trs = $(".form_table>tbody>tr");
        trs.each(function () {
            var tds = $(this).children("td");
            tds.each(function (index) {
                var td = $(this), colSpan = parseInt(td.attr("colspan"), 10);
                if (index % 2 == 0 && colSpan == 1) {
                    td.css("background-color", "#CADEE8");
                }
            });
        });
        trs = $(".sub_form_table>tbody>tr");
        trs.each(function () {
            var tds = $(this).children("td");
            tds.each(function (index) {
                var td = $(this), colSpan = parseInt(td.attr("colspan"), 10);
                if (index % 2 == 0 && colSpan == 1) {
                    td.css("background-color", "#CADEE8");
                }
            });
        });
        return this;
    }
    /*
    **表单json序列化
    **调用方式： $("查询表达式").jsonSerialize 
    **返回值：json字符串
    */
    $.fn.jsonSerialize = function () {
        var jsonArr = [];
        this.each(function () {
            try {
                var cur = $(this), operator = cur.attr("operator"), queryEntity = [], name = cur.attr("name"), val = cur.val().replace(",", "，");
                if (val && name) {
                    queryEntity.push("{\"Name\":\"", name.replace("-", "."), "\",\"Value\":\"", val, "\",\"Operator\":\"", (operator ? operator : "Eq"), "\"}");
                    jsonArr.push(queryEntity.join(""));
                }
            } catch (ex) { }
        });
        return "[" + jsonArr.join(",") + "]";
    }
})(jQuery);
/*
**填充表单
**json格式的数据,回调函数fn(key,value).
** fn 回调函数中【this:当前正在操作的jquery对象,key:当前jquery对象的id,value:当前jquery对象的值】
*/
$.fillForm = function (jsons, fn) {
    var setVal = function (j, fn) {
        var nodeName, type, defaultVal, cur, value, re = /^\/Date{1}\(\d+\)+/, reNum = /[^\d]*/;
        if (j && j.errmsg) {
            alert(j.errmsg);
            return;
        }
        for (var key in j) {
            try {
                cur = $("#" + key);
                if (!cur.length)
                    cur = $("." + key);
                if (!cur.length)
                    cur = $("input[name=" + key + "]");
                type = cur.attr("type"), value = j[key],
                    nodeName = cur.length ? cur[0].nodeName.toLowerCase() : "",
                    defaultVal = cur.length ? cur[0].defaultValue : "";
                if (nodeName == 'input' && (type == 'checkbox' || type == 'radio') && !$.isArray(value)) {
                    var name = cur.attr("name");
                    $("input[type='" + type + "'][name='" + name + "']").each(function () {
                        var curVal = $(this).val();
                        if (curVal == value.toString() || (curVal == "true" && value.toString() == "是") || (curVal == "false" && value.toString() == "否")) {
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
                    if (fn && $.isFunction(fn)) {
                        if (!fn.apply(cur, [key, value])) {
                            /*
                            **返回false跳出当前循环进入下一个循环
                            **返回true继续往下执行
                            */
                            continue;
                        }
                    }
                }
                else {
                    value = "";
                }
                if (defaultVal && !value) {
                    continue;
                }
                cur.val(value);
                defaultVal = nodeName = type = cur = null;
            }
            catch (ex) { }
        }
        j = null;
    },
        setVals = function (jsons) {
            var i = jsons.length;
            while (i--) {
                setVal(jsons[i], fn);
            }
        }
    if ($.isArray(jsons)) {
        setVals(jsons);
    } else {
        setVal(jsons, fn);
    }
    jsons = fn = null;
    return this;
}
var issend = false;
$(document).ready(function () {
    $("#loading").ajaxStart(function () {
        $(this).show();
        issend = true;
    });
    $("#loading").ajaxStop(function () {
        $(this).hide();
        issend = false;
    });
    $.formsheet();
    SetCardListHandle();
    $("#save").click(function () {
        save();
    });
    $("input[name='Num']").focus(function () {
        $(this).select();
    });
    if ($.browser.msie) {
        $('input[name="BuyMode"]').click(function () {
            this.blur();
            this.focus();
        });
    }
    $('input[name="BuyMode"]').change(function () {
        if ($(this).val() == "销售点预售") {
            $("#xiaoshou").show();
            $("#zhengjian").hide();
            $("input[name='PaymentMode'][value='挂账']").attr("checked", true);
            $("input[name='InvoiceIF'][value='false']").attr("checked", true);
            $("input[name='PaymentMode']").attr("disabled", true);
            $("input[name='InvoiceIF']").attr("disabled", true);
        }
        else {
            $("#xiaoshou").hide();
            $("#zhengjian").show();
            $("input[name='PaymentMode']").attr("disabled", false);
            $("input[name='InvoiceIF']").attr("disabled", false);
        }
    });
    $("#search").click(function () {
        var parms = $("select,input", ".form_table").jsonSerialize();
        $("#flex1").setParams({ "name": "dymcquery", "value": parms });
    })
});

function SetCardListHandle() {
    $("input[name='EndCardNo']").blur(function () {
        if ($(this).val() == "" || $(this).val() == "0")
            return;
        var p = $(this).parent().parent();
        GetCardData(3, p);
//        var s = $("input[name='StartCardNo']", p);
//        if (s.val() == "" || s.val() == "0") {
//            s.select();
//            return;
//        }
//        if (parseFloat(s.val()) > parseFloat($(this).val())) {
//            alert("开始卡号大于结束卡号，请确认是否输入有误。");
//            return;
//        }
//        $("input[name='Num']", p).val(parseFloat($(this).val()) - parseFloat(s.val()) + 1);
//        TotalCount();
    });
    $("input[name='StartCardNo']").blur(function () {
        var p = $(this).parent().parent();
        GetCardData(1, p);
//        var s = $("input[name='EndCardNo']", p);
//        if (s.val() == "" || s.val() == "0") {
//            //s.select();
//            return;
//        }
//        if (parseFloat(s.val()) < parseFloat($(this).val())) {
//            alert("开始卡号大于结束卡号，请确认是否输入有误。");
//            return;
//        }
//        $("input[name='Num']", p).val(parseFloat(s.val()) - parseFloat($(this).val()) + 1);
//        TotalCount();
    });
    $("input[name='Num']").keyup(function () {
        if ($(this).val() != "") {
            var p = $(this).parent().parent();
            GetCardData(2, p);
        }
        //        var s = $("input[name='StartCardNo']", p);
        //        var e = $("input[name='EndCardNo']", p);
        //        if (s.val() == "" || s.val() == "0") {
        //            if (e.val() == "" || e.val() == "0") {
        //                s.select();
        //                return;
        //            }
        //            else {
        //                s.val(parseInt(e.val()) - parseInt($(this).val()) + 1);
        //            }

        //        }
        //        else {
        //            var snum = parseInt(s.val()) + parseInt($(this).val()) - 1;
        //            e.val(snum);
        //        }

    });
    $("#LinkUserCardNo").change(function () {
        $.post("/ajaxpage/LearningCardsManagerHandler.ashx?action=getuser", { "useridcard": $(this).val() }, function (msg) {
            if (msg) {
                if (msg.successMsgs) {
                    $("#LinkUserName").val(msg.RealName);
                    $("#UnitFullName").val(msg.UnitFullName);
                    $("#Department").val(msg.UnitName);
                    $("#LinkTel").val(msg.LinkTel);
                }
            }
        });
    });
}
function GetCardData(gettype, p) {
    var s = $("input[name='StartCardNo']", p);
    var e = $("input[name='EndCardNo']", p);
    var n = $("input[name='Num']", p);
    var p = $("input[name='Price']", p);
    var t = $(".curtotal", p);
    $.post("/LearningCardManage/AddOutWareroom.aspx?action=count", { start: s.val(), end: e.val(), num: n.val(), type: gettype, price: p.val() }, function (data) {
        if (data.num) {
            s.val(data.start);
            e.val(data.end);
            n.val(data.num);
            t.val(data.total);
            TotalCount();
        }
    });
}
function TotalCount() {
    var nums = 0, totals = 0;
    $("tr", ".cardlist").each(function (i, p) {
        //  var s = $("input[name='StartCardNo']", p).val();
        //  var e = $("input[name='EndCardNo']", p).val();
        var allnum = $("input[name='Num']", p).val();
        var myprice = $("input[name='Price']", p).val();
        // s = parseFloat(s);
        //  e = parseFloat(e);
        allnum = parseInt(allnum);
        myprice = allnum * parseInt(myprice);

        if (!isNaN(allnum)) {
            $(".curtotal", p).val(myprice);
            nums += allnum;
            totals += myprice;
        }

    });
    $("#TotalNum").val(nums);
    $("#TotalMoney").val(totals);
}
function CreatRukuPrintData(data) {
    LODOP.PRINT_INITA(0, "15mm", "210.0mm", "93.0mm", "广西专业技术人员继续教育激活卡-入库单打印");
    LODOP.SET_PRINT_PAGESIZE(3, 0, 0, "A4");
    LODOP.SET_PRINT_STYLE("FontSize", 12);
    LODOP.SET_PRINT_STYLE("Alignment", 2);
    LODOP.ADD_PRINT_TEXT(25, 213, 324, 28, "广西专业技术人员继续教育激活卡入库单");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(56, 74, 182, 25, "入库日期：" + data.CreateDate);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(56, 452, 209, 25, "单号：" + data.SingleNumber);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_RECT(79, 71, 640, 206, 0, 1);
    LODOP.ADD_PRINT_LINE(114, 71, 113, 711, 0, 1);
    LODOP.ADD_PRINT_TEXT(89, 77, 90, 24, "收卡方式");
    LODOP.ADD_PRINT_LINE(148, 71, 147, 711, 0, 1);
    LODOP.ADD_PRINT_LINE(80, 170, 147, 171, 0, 1);
    LODOP.ADD_PRINT_TEXT(121, 77, 90, 24, "签收人");
    LODOP.ADD_PRINT_TEXT(89, 175, 509, 24, "" + data.ReceiveMode);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(121, 175, 503, 25, "" + data.SignUser);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_LINE(176, 71, 175, 711, 0, 1);
    LODOP.ADD_PRINT_LINE(204, 71, 203, 711, 0, 1);
    LODOP.ADD_PRINT_LINE(232, 71, 231, 711, 0, 1);
    LODOP.ADD_PRINT_LINE(147, 332, 259, 333, 0, 1);
    LODOP.ADD_PRINT_LINE(148, 381, 260, 382, 0, 1);
    LODOP.ADD_PRINT_LINE(148, 446, 260, 447, 0, 1);
    LODOP.ADD_PRINT_LINE(149, 493, 285, 494, 0, 1);
    LODOP.ADD_PRINT_TEXT(152, 132, 100, 24, "激活卡卡号");
    LODOP.ADD_PRINT_TEXT(152, 335, 44, 24, "单位");
    LODOP.ADD_PRINT_TEXT(152, 384, 60, 24, "数量");
    LODOP.ADD_PRINT_TEXT(152, 448, 43, 24, "单价");
    LODOP.ADD_PRINT_LINE(148, 581, 260, 582, 0, 1);
    LODOP.ADD_PRINT_TEXT(152, 496, 82, 24, "金额");
    LODOP.ADD_PRINT_TEXT(152, 587, 100, 24, "备注");
    LODOP.ADD_PRINT_LINE(260, 71, 259, 711, 0, 1);
    LODOP.ADD_PRINT_TEXT(263, 168, 317, 24, "合计：人民币 " + data.TotalMoneyCN);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(263, 496, 195, 24, "￥" + data.TotalMoney);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(288, 71, 100, 24, "经办人：");
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(288, 318, 100, 24, "部门领导：");
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(288, 528, 100, 24, "分管领导：");
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(25, 737, 330, 21, "一式三联：白单（经办）\\红单（签收）\\黄单（财务）");
    LODOP.SET_PRINT_STYLEA(0, "Angle", 270);
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    var dh = 180;
    $(data.InWareroomInfoLists).each(function (i, item) {
        LODOP.ADD_PRINT_TEXT(dh + 3, 60, 280, 22, item.StartCardNo + "-" + item.EndCardNo);
        LODOP.SET_PRINT_STYLEA(0, "FontSize", 10);
        LODOP.ADD_PRINT_TEXT(dh, 335, 44, 22, "" + item.Unit);
        LODOP.ADD_PRINT_TEXT(dh, 377, 67, 22, "" + item.Num);
        LODOP.ADD_PRINT_TEXT(dh, 440, 51, 22, "" + item.Price);
        LODOP.ADD_PRINT_TEXT(dh, 496, 82, 22, "" + item.total);
        LODOP.ADD_PRINT_TEXT(dh, 584, 125, 22, "" + item.Remark);
        dh += 31;
    });
}
function CreatTuikaPrintData(data) {
    LODOP.PRINT_INITA(0, 0, "210.1mm", "92.9mm", "打印控件功能演示_Lodop功能_自定义纸张12");
    LODOP.SET_PRINT_PAGESIZE(3, 0, 0, "A4");
    LODOP.SET_PRINT_STYLE("FontSize", 10);
    LODOP.SET_PRINT_STYLE("Alignment", 2);
    LODOP.ADD_PRINT_TEXT(27, 187, 411, 28, "广西专业技术人员继续教育激活卡退卡确认单");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(52, 74, 182, 20, "开单日期：" + data.CreateDate);
    LODOP.ADD_PRINT_TEXT(52, 452, 209, 20, "单号：" + data.SingleNumber);
    LODOP.ADD_PRINT_RECT(68, 59, 656, 225, 0, 1);
    LODOP.ADD_PRINT_LINE(93, 134, 92, 714, 0, 1);
    LODOP.ADD_PRINT_LINE(118, 59, 117, 714, 0, 1);
    LODOP.ADD_PRINT_LINE(144, 134, 143, 714, 0, 1);
    LODOP.ADD_PRINT_LINE(166, 59, 165, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(70, 133, 165, 134, 0, 1);
    LODOP.ADD_PRINT_LINE(69, 202, 165, 203, 0, 1);
    LODOP.ADD_PRINT_LINE(190, 59, 189, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(216, 59, 215, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(242, 59, 241, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(144, 307, 268, 308, 0, 1);
    LODOP.ADD_PRINT_LINE(167, 352, 268, 353, 0, 1);
    LODOP.ADD_PRINT_LINE(166, 416, 268, 417, 0, 1);
    LODOP.ADD_PRINT_LINE(166, 464, 292, 465, 0, 1);
    LODOP.ADD_PRINT_LINE(144, 561, 268, 562, 0, 1);
    LODOP.ADD_PRINT_TEXT(126, 70, 52, 34, "接收\n单位");
    LODOP.ADD_PRINT_TEXT(123, 137, 61, 20, "名称");
    LODOP.ADD_PRINT_TEXT(148, 136, 63, 20, "联系人");
    LODOP.ADD_PRINT_TEXT(123, 208, 427, 20, "" + data.UnitFullName);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(148, 208, 100, 20, "" + data.LinkUserName);
    LODOP.ADD_PRINT_TEXT(148, 309, 75, 20, "所在部门");
    LODOP.ADD_PRINT_TEXT(148, 384, 180, 20, "" + data.Department);
    LODOP.ADD_PRINT_TEXT(147, 562, 41, 20, "电话");
    LODOP.ADD_PRINT_LINE(144, 604, 165, 605, 0, 1);
    LODOP.ADD_PRINT_TEXT(148, 599, 124, 50, "" + data.LinkTel.replace(",", "\n"));
    LODOP.ADD_PRINT_TEXT(171, 130, 100, 20, "激活卡号");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(171, 309, 41, 20, "单位");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(171, 354, 61, 20, "数量");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(171, 416, 49, 20, "单价");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(171, 469, 89, 20, "金额");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(171, 586, 100, 20, "备注");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    var dh = 196;
    $(data.ItemList).each(function (i, item) {
        if (item.StartCardNo == item.EndCardNo)
            LODOP.ADD_PRINT_TEXT(dh, 56, 260, 20, item.StartCardNo);
        else
            LODOP.ADD_PRINT_TEXT(dh, 56, 260, 20, item.StartCardNo + "-" + item.EndCardNo);
        LODOP.ADD_PRINT_TEXT(dh, 309, 40, 20, "" + item.Unit);
        LODOP.ADD_PRINT_TEXT(dh, 354, 60, 20, "" + item.Num);
        LODOP.ADD_PRINT_TEXT(dh, 416, 49, 20, "" + item.Price);
        LODOP.ADD_PRINT_TEXT(dh, 465, 94, 20, "" + item.total);
        LODOP.ADD_PRINT_TEXT(dh, 562, 153, 20, "" + item.Remark);
        dh += 26;
    });    
    LODOP.ADD_PRINT_LINE(268, 59, 267, 715, 0, 1);
    LODOP.ADD_PRINT_TEXT(273, 169, 285, 20, "合计：人民币 " + data.TotalMoneyCN);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(298, 62, 148, 20, "退卡单位经办人：");
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(298, 464, 137, 20, "接收单位经办人：");    
    LODOP.ADD_PRINT_TEXT(273, 467, 149, 20, "￥" + data.TotalMoney);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_LINE(144, 383, 166, 384, 0, 1);
    LODOP.ADD_PRINT_TEXT(76, 70, 54, 35, "退卡\n单位");
    LODOP.ADD_PRINT_TEXT(73, 133, 69, 20, "名称");
    LODOP.ADD_PRINT_TEXT(98, 137, 64, 20, "联系人");
    LODOP.ADD_PRINT_TEXT(73, 208, 463, 20, "" + data.OldUnitFullName);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_LINE(93, 307, 117, 308, 0, 1);
    LODOP.ADD_PRINT_LINE(93, 383, 117, 384, 0, 1);
    LODOP.ADD_PRINT_LINE(93, 561, 117, 562, 0, 1);
    LODOP.ADD_PRINT_LINE(93, 604, 117, 605, 0, 1);
    LODOP.ADD_PRINT_TEXT(98, 208, 100, 20, "" + data.OldLinkUserName);
    LODOP.ADD_PRINT_TEXT(98, 309, 75, 20, "所在部门");
    LODOP.ADD_PRINT_TEXT(98, 384, 180, 20, "" + data.OldDepartment);
    LODOP.ADD_PRINT_TEXT(98, 562, 47, 20, "电话");
    LODOP.ADD_PRINT_TEXT(98, 599, 124, 50, "" + data.OldLinkTel.replace(",", "\n"));
}
function CreatChukuPrintData(data) {
    LODOP.PRINT_INITA(0, "15mm", "210.0mm", "93.0mm", "广西专业技术人员继续教育激活卡-出库单打印");
    LODOP.SET_PRINT_PAGESIZE(3, 0, 0, "A4");
    LODOP.SET_PRINT_STYLE("FontSize", 10);
    LODOP.SET_PRINT_STYLE("Alignment", 2);
    LODOP.ADD_PRINT_TEXT(27, 213, 324, 28, "广西专业技术人员继续教育激活卡出库单");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 12);
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(52, 74, 182, 20, "开单日期：" + data.CreateDate);
    LODOP.ADD_PRINT_TEXT(52, 452, 209, 20, "单号：" + data.SingleNumber);
    LODOP.ADD_PRINT_RECT(68, 59, 656, 229, 0, 1);
    LODOP.ADD_PRINT_LINE(93, 59, 92, 604, 0, 1);
    LODOP.ADD_PRINT_LINE(118, 59, 117, 604, 0, 1);
    LODOP.ADD_PRINT_LINE(142, 59, 141, 604, 0, 1);
    LODOP.ADD_PRINT_LINE(168, 134, 167, 714, 0, 1);
    LODOP.ADD_PRINT_LINE(190, 59, 189, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(141, 133, 190, 134, 0, 1);
    LODOP.ADD_PRINT_LINE(69, 202, 189, 203, 0, 1);
    LODOP.ADD_PRINT_LINE(69, 604, 167, 605, 0, 1);
    LODOP.ADD_PRINT_LINE(212, 59, 211, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(235, 59, 234, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(256, 59, 255, 715, 0, 1);
    LODOP.ADD_PRINT_LINE(167, 307, 278, 308, 0, 1);
    LODOP.ADD_PRINT_LINE(193, 352, 278, 353, 0, 1);
    LODOP.ADD_PRINT_LINE(190, 416, 277, 417, 0, 1);
    LODOP.ADD_PRINT_LINE(193, 464, 297, 465, 0, 1);
    LODOP.ADD_PRINT_LINE(168, 561, 277, 562, 0, 1);
    LODOP.ADD_PRINT_TEXT(73, 80, 100, 20, "购卡方式");
    LODOP.ADD_PRINT_TEXT(73, 208, 355, 20, "" + data.BuyMode);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(99, 80, 100, 20, "付款方式");
    LODOP.ADD_PRINT_TEXT(99, 208, 355, 20, "" + data.PaymentMode);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(123, 80, 100, 20, "出具发票");
    LODOP.ADD_PRINT_TEXT(123, 208, 353, 20, "" + data.InvoiceIF);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(150, 70, 52, 34, "购卡\n单位");
    LODOP.ADD_PRINT_TEXT(147, 137, 61, 20, "名称");
    LODOP.ADD_PRINT_TEXT(172, 136, 63, 20, "联系人");
    LODOP.ADD_PRINT_TEXT(147, 208, 392, 20, "" + data.UnitFullName);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(172, 208, 100, 20, "" + data.LinkUserName);
    LODOP.ADD_PRINT_TEXT(172, 309, 75, 20, "所在部门");
    LODOP.ADD_PRINT_TEXT(172, 384, 180, 20, "" + data.Department);
    LODOP.ADD_PRINT_TEXT(171, 562, 41, 20, "电话");
    LODOP.ADD_PRINT_LINE(168, 604, 189, 605, 0, 1);
    LODOP.ADD_PRINT_TEXT(172, 599, 124, 20, "" + data.LinkTel.replace(",","\n"));
    LODOP.ADD_PRINT_TEXT(193, 130, 100, 20, "激活卡卡号");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(193, 309, 41, 20, "单位");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(193, 354, 61, 20, "数量");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(193, 416, 49, 20, "单价");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(193, 469, 89, 20, "金额");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    LODOP.ADD_PRINT_TEXT(193, 586, 100, 20, "备注");
    LODOP.SET_PRINT_STYLEA(0, "Bold", 1);
    var dh = 216;
    $(data.OutWareroomInfoLists).each(function (i, item) {
        if (item.StartCardNo == item.EndCardNo)
            LODOP.ADD_PRINT_TEXT(dh, 56, 260, 20, item.StartCardNo);
        else
            LODOP.ADD_PRINT_TEXT(dh, 56, 260, 20, item.StartCardNo + "-" + item.EndCardNo);
        LODOP.ADD_PRINT_TEXT(dh, 309, 40, 20, "" + item.Unit);
        LODOP.ADD_PRINT_TEXT(dh, 354, 60, 20, "" + item.Num);
        LODOP.ADD_PRINT_TEXT(dh, 416, 49, 20, "" + item.Price);
        LODOP.ADD_PRINT_TEXT(dh, 465, 94, 20, "" + item.total);
        LODOP.ADD_PRINT_TEXT(dh, 562, 153, 20, "" + item.Remark);
        dh += 22;
    });
    LODOP.ADD_PRINT_LINE(278, 59, 277, 715, 0, 1);
    LODOP.ADD_PRINT_TEXT(280, 169, 285, 20, "合计：人民币 " + data.TotalMoneyCN);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(298, 62, 148, 20, "开单人：");
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_TEXT(298, 310, 100, 20, "审核：");
    LODOP.ADD_PRINT_TEXT(298, 524, 100, 20, "客户签字：");
    LODOP.ADD_PRINT_TEXT(25, 737, 330, 21, "一式三联：白单（经办）\\红单（签收）\\黄单（财务）");
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 8);
    LODOP.SET_PRINT_STYLEA(0, "Angle", 270);
  //  if (data.CodingImg != "") {
      //  LODOP.ADD_PRINT_IMAGE(71, 608, 94, 94, "<img src='" + data.CodingImg + "' />");
     //   LODOP.SET_PRINT_STYLEA(0, "Stretch", 2);
  //  }
    LODOP.ADD_PRINT_TEXT(280, 467, 149, 20, "￥" + data.TotalMoney);
    LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
    LODOP.ADD_PRINT_LINE(167, 383, 189, 384, 0, 1);
}
function UpdatePrintChukuState(id) {
    $.post("/ajaxpage/LearningCardsManagerHandler.ashx?action=printchuku", { id: id }, function (data) {
    });
}
function UpdatePrintTuikaState(id) {
    $.post("/ajaxpage/LearningCardsManagerHandler.ashx?action=printtuika", { id: id }, function (data) {
    });
}
function UpdateRukuPrintState(id) {
    $.post("/ajaxpage/LearningCardsManagerHandler.ashx?action=printruku", { id: id }, function (data) {
    });
}