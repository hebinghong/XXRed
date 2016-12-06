/// <reference path="../intellisense/jquery-1.2.6-vsdoc-cn.js" />
/// <reference path="../lib/blackbird.js" />
function setCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function clearCookie(name) {
    setCookie(name, "", -1);
}
(function ($) {
    $.addFlex = function (t, p) {
        if (t.grid) return false; //如果Grid已经存在则返回
        // 引用默认属性
        p = $.extend({
            height: 200, //flexigrid插件的高度，单位为px
            width: 'auto', //宽度值，auto表示根据每列的宽度自动计算
            striped: true, //是否显示斑纹效果，默认是奇偶交互的形式
            novstripe: false,
            minwidth: 30, //列的最小宽度
            minheight: 80, //列的最小高度
            resizable: false, //resizable table是否可伸缩
            url: false, //ajax url,ajax方式对应的url地址
            method: 'POST', // data sending method,数据发送方式
            dataType: 'json', // type of data loaded,数据加载的类型，xml,json
            errormsg: '发生错误', //错误提升信息
            usepager: true, //是否分页
            nowrap: true, //是否不换行
            page: 1, //current page,默认当前页
            total: 1, //total pages,总页面数
            useRp: true, //use the results per page select box,是否可以动态设置每页显示的结果数
            rp: 20, // results per page,每页默认的结果数
            rpOptions: [15, 20, 25, 30, 35, 50, 100, 150, 200, 300], //可选择设定的每页结果数
            title: false, //是否包含标题
            pagestat: '显示记录从{from}到{to}，总数 {total} 条。', //显示当前页和总页面的样式
            procmsg: '正在处理数据，请稍候 ...', //正在处理的提示信息
            query: '', //搜索查询的条件
            qtype: '', //搜索查询的类别
            qop: "Eq", //搜索的操作符
            dataKey: "Id", //数据主键
            nomsg: '没有符合条件的记录存在', //无结果的提示信息
            minColToggle: 1, //minimum allowed column to be hidden
            showToggleBtn: true, //show or hide column toggle popup
            hideOnSubmit: true, //显示遮盖
            showTableToggleBtn: true, //显示隐藏Grid 
            autoload: true, //自动加载
            blockOpacity: 0.5, //透明度设置
            onToggleCol: false, //当在行之间转换时
            onChangeSort: false, //当改变排序时
            onSuccess: false, //成功后执行
            onSubmit: false, // using a custom populate function,调用自定义的计算函数
            showcheckbox: false, //是否显示checkbox       
            rowhandler: false, //是否启用行的扩展事情功能
            rowbinddata: false,
            rowdbclickhandler:false,
            singleSelect: true, //是否单选
            saveColChange: true, //是否记录列状态
            saveColCookieName: false, //记录此列表信息的Cookie名称（如果不设置，则自动取当前文件名和请求的文件名做Cookie名）。
            //Style
            gridClass: "bbit-grid",
            onrowchecked: false,
            rowcheckedHandler: false,
            onChangePage: false,  //页索引变更时触发事件  onChangePage(pageIndex)
            datas: null, //记录保存的数据
            cacheData: false//是否缓存返回的数据（如果保存，在选中时可以取到对应的对象）
        }, p);

        $(t)
		.show() //show if hidden
		.attr({ cellPadding: 0, cellSpacing: 0, border: 0 })  //remove padding and spacing
		.removeAttr('width') //remove width properties	
		;

        //create grid class
        var g = {
            hset: {},
            rePosDrag: function () {
                var cdleft = 0 - this.hDiv.scrollLeft;
                if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
                $(g.cDrag).css({ top: g.hDiv.offsetTop + 1 });
                var cdpad = this.cdpad;
                $('div', g.cDrag).hide();
                //update by xuanye ,避免jQuery :visible 无效的bug
                var i = 0;
                $('thead tr:first th:visible', this.hDiv).each(function () {
                    if ($(this).css("display") == "none") {
                        return;
                    }
                    var n = i;
                    //var n = $('thead tr:first th:visible', g.hDiv).index(this);			 	  
                    var cdpos = parseInt($('div', this).width());
                    var ppos = cdpos;
                    if (cdleft == 0)
                        cdleft -= Math.floor(p.cgwidth / 2);
                    cdpos = cdpos + cdleft + cdpad;
                    $('div:eq(' + n + ')', g.cDrag).css({ 'left': cdpos + 'px' }).show();
                    cdleft = cdpos;
                    i++;
                }
				);
            },
            fixHeight: function (newH) {
                newH = false;
                if (!newH) newH = $(g.bDiv).height();
                var hdHeight = $(this.hDiv).height();
                $('div', this.cDrag).each(
						function () {
						    $(this).height(newH + hdHeight);
						}
					);

                var nd = parseInt($(g.nDiv).height());

                if (nd > newH)
                    $(g.nDiv).height(newH).width(200);
                else
                    $(g.nDiv).height('auto').width('auto');

                $(g.block).css({ height: newH, marginBottom: (newH * -1) });

                var hrH = g.bDiv.offsetTop + newH;
                if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
                $(g.rDiv).css({ height: hrH });

            },
            dragStart: function (dragtype, e, obj) { //default drag function start

                if (dragtype == 'colresize') //column resize
                {
                    $(g.nDiv).hide(); $(g.nBtn).hide();
                    var n = $('div', this.cDrag).index(obj);
                    //var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
                    var ow = $('th:visible:eq(' + n + ') div', this.hDiv).width();
                    $(obj).addClass('dragging').siblings().hide();
                    $(obj).prev().addClass('dragging').show();

                    this.colresize = { startX: e.pageX, ol: parseInt(obj.style.left), ow: ow, n: n };
                    $('body').css('cursor', 'col-resize');
                }
                else if (dragtype == 'vresize') //table resize
                {
                    var hgo = false;
                    $('body').css('cursor', 'row-resize');
                    if (obj) {
                        hgo = true;
                        $('body').css('cursor', 'col-resize');
                    }
                    this.vresize = { h: p.height, sy: e.pageY, w: p.width, sx: e.pageX, hgo: hgo };

                }

                else if (dragtype == 'colMove') //column header drag
                {
                    $(g.nDiv).hide(); $(g.nBtn).hide();
                    this.hset = $(this.hDiv).offset();
                    this.hset.right = this.hset.left + $('table', this.hDiv).width();
                    this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
                    this.dcol = obj;
                    this.dcoln = $('th', this.hDiv).index(obj);

                    this.colCopy = document.createElement("div");
                    this.colCopy.className = "colCopy";
                    this.colCopy.innerHTML = obj.innerHTML;
                    if ($.browser.msie) {
                        this.colCopy.className = "colCopy ie";
                    }


                    $(this.colCopy).css({ position: 'absolute', float: 'left', display: 'none', textAlign: obj.align });
                    $('body').append(this.colCopy);
                    $(this.cDrag).hide();

                }

                $('body').noSelect();

            },
            reSize: function () {
                this.gDiv.style.width = p.width;
                this.bDiv.style.height = p.height;
            },
            dragMove: function (e) {
                if (this.colresize) //column resize
                {
                    var n = this.colresize.n;
                    var diff = e.pageX - this.colresize.startX;
                    var nleft = this.colresize.ol + diff;
                    var nw = this.colresize.ow + diff;
                    if (nw > p.minwidth) {
                        $('div:eq(' + n + ')', this.cDrag).css('left', nleft);
                        this.colresize.nw = nw;
                    }
                }
                else if (this.vresize) //table resize
                {
                    var v = this.vresize;
                    var y = e.pageY;
                    var diff = y - v.sy;
                    if (!p.defwidth) p.defwidth = p.width;
                    if (p.width != 'auto' && !p.nohresize && v.hgo) {
                        var x = e.pageX;
                        var xdiff = x - v.sx;
                        var newW = v.w + xdiff;
                        if (newW > p.defwidth) {
                            this.gDiv.style.width = newW + 'px';
                            p.width = newW;
                        }
                    }
                    var newH = v.h + diff;
                    if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
                        this.bDiv.style.height = newH + 'px';
                        p.height = newH;
                        this.fixHeight(newH);
                    }
                    v = null;
                }
                else if (this.colCopy) {
                    $(this.dcol).addClass('thMove').removeClass('thOver');
                    if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
                        //this.dragEnd();
                        $('body').css('cursor', 'move');
                    }
                    else
                        $('body').css('cursor', 'pointer');

                    $(this.colCopy).css({ top: e.pageY + 10, left: e.pageX + 20, display: 'block' });
                }

            },
            saveColChanges: function () {//记录列状态
                if (p.saveColChange) {
                    var newCols = "[";
                    $('thead th', g.hDiv).each(function () {
                        if (!$(this).attr("isch")) {
                            var myindex = $(this).attr("axis");                           
                            myindex = myindex.replace("col", "");
                            var mywidth = parseInt($(this).children("div").css("width"));
                            // p.colModel[parseInt(myindex, 10)].width = mywidth;
                            if($(this).is(":hidden"))
                            mywidth=0;
                            var temp = "{index:" + myindex + ",width:" + mywidth;
                            temp += "}";
                            if (newCols != "[")
                                newCols += ",";
                            newCols += temp;
                        }
                    });
                    newCols += "]";
                    var strPage = "";
                    if (p.saveColCookieName) {
                        strPage = p.saveColCookieName
                    }
                    else {
                        var arrUrl = window.location.href.split("/");
                        strPage = arrUrl[arrUrl.length - 1];
                        strPage = strPage.split(".")[0];
                        if (p.url) {
                            var strUrl = p.url.split("/");
                            strPage += strUrl[strUrl.length - 1].split(".")[0];
                        }
                    }
                    //$("#RealName").val(newCols);
                    setCookie(strPage, newCols, 360);
                }
            },
            dragEnd: function () {
                if (this.colresize) {//改变列宽时触发
                    var n = this.colresize.n;
                    var nw = this.colresize.nw;
                    //$('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
                    $('th:visible:eq(' + n + ') div', this.hDiv).css('width', nw);

                    $('tr', this.bDiv).each(
									function () {
									    //$('td:visible div:eq(' + n + ')', this).css('width', nw);
									    $('td:visible:eq(' + n + ') div', this).css('width', nw);
									}
								);
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                    $('div:eq(' + n + ')', this.cDrag).siblings().show();
                    $('.dragging', this.cDrag).removeClass('dragging');
                    this.rePosDrag();
                    this.fixHeight();
                    this.colresize = false;
                    this.saveColChanges();
                }
                else if (this.vresize) {
                    this.vresize = false;
                }
                else if (this.colCopy) {
                    $(this.colCopy).remove();
                    if (this.dcolt != null) {//改变列位置时触发
                        if (this.dcoln > this.dcolt)
                        { $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol); }
                        else
                        { $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol); }
                        this.switchCol(this.dcoln, this.dcolt);
                        $(this.cdropleft).remove();
                        $(this.cdropright).remove();
                        this.rePosDrag();
                        this.saveColChanges();
                    }
                    this.dcol = null;
                    this.hset = null;
                    this.dcoln = null;
                    this.dcolt = null;
                    this.colCopy = null;
                    $('.thMove', this.hDiv).removeClass('thMove');
                    $(this.cDrag).show();
                }
                $('body').css('cursor', 'default');
                $('body').noSelect(false);
            },
            toggleCol: function (cid, visible) {
                var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
                var n = $('thead th', g.hDiv).index(ncol);
                var cb = $('input[value=' + cid + ']', g.nDiv)[0];
                if (visible == null) {
                    visible = ncol.hide;
                }
                if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) return false;
                if (visible) {
                    ncol.hide = false;
                    $(ncol).show();
                    cb.checked = true;
                }
                else {
                    ncol.hide = true;
                    $(ncol).hide();
                    cb.checked = false;
                }
                $('tbody tr', t).each
							(
								function () {
								    if (visible)
								        $('td:eq(' + n + ')', this).show();
								    else
								        $('td:eq(' + n + ')', this).hide();
								}
							);
                this.rePosDrag();
                if (p.onToggleCol) p.onToggleCol(cid, visible);
                this.saveColChanges();
                return visible;
            },
            switchCol: function (cdrag, cdrop) { //switch columns
                $('tbody tr', t).each
					(
						function () {
						    if (cdrag > cdrop)
						        $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
						    else
						        $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
						}
					);
                //switch order in nDiv
                if (cdrag > cdrop)
                    $('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
                else
                    $('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
                if ($.browser.msie && $.browser.version < 7.0) $('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
            },
            scroll: function () {
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                this.rePosDrag();
            },
            hideLoading: function () {
                $('.pReload', this.pDiv).removeClass('loading');
                if (p.hideOnSubmit) $(g.block).remove();
                $('.pPageStat', this.pDiv).html(p.errormsg);
                this.loading = false;
            }
            ,
            addData: function (data) { //parse data     
                p.datas = [];
                if (p.preProcess)
                { data = p.preProcess(data); }
                $('.pReload', this.pDiv).removeClass('loading');
                this.loading = false;

                if (!data) {
                    $('.pPageStat', this.pDiv).html(p.errormsg);
                    return false;
                }
                var temp = p.total;
                if (p.dataType == 'xml') {
                    p.total = +$('rows total', data).text();
                }
                else {
                    p.total = data.total;
                }
                if (p.total < 0) {
                    p.total = temp;
                }
                if (p.total == 0) {
                    $('tr, a, td, div', t).unbind();
                    $(t).empty();
                    p.pages = 1;
                    p.page = 1;
                    this.buildpager();
                    $('.pPageStat', this.pDiv).html(p.nomsg);
                    if (p.hideOnSubmit) {
                        $(g.block).remove();
                    }
                    return false;
                }
                p.pages = Math.ceil(p.total / p.rp);
                if (p.dataType == 'xml') {
                    p.page = +$('rows page', data).text();
                    if (p.cacheData)
                        p.datas = $('rows', data);
                }
                else {
                    p.page = data.page;
                    if (p.cacheData)
                        p.datas = data.rows;
                }
                this.buildpager();
                var ths = $('thead tr:first th', g.hDiv);
                var thsdivs = $('thead tr:first th div', g.hDiv);
                var tbhtml = [];
                tbhtml.push("<tbody>");
                if (p.dataType == 'json') {
                    if (data.rows != null) {
                        $.each(data.rows, function (i, row) {
                            tbhtml.push("<tr");
                            var key = row[p.dataKey];
                            var keyval = "";
                            if (key) {
                                keyval = key;
                                tbhtml.push(" id='", "row", key, "'");
                            }
                            tbhtml.push(" index='", i, "'");
                            if (i % 2 && p.striped) {
                                tbhtml.push(" class='erow'");
                            }
                            if (p.rowbinddata) {
                                tbhtml.push(" ch='", row.cell.join("_FG$SP_"), "'");
                            }
                            tbhtml.push(">");
                            //var trid = row.id;
                            $(ths).each(function (j) {
                                var tddata = "";
                                var tdclass = "";
                                tbhtml.push("<td align='", this.align, "'");
                                var idx = $(this).attr('axis').substr(3);
                                var abbr = $(this).attr('abbr');
                                if (p.sortname && p.sortname == $(this).attr('abbr')) {
                                    tdclass = 'sorted';
                                }
                                var heigth = thsdivs[j].style.height;
                                var linkurl = false;
                                if ($(this).attr("linkurl"))
                                    linkurl = true;
                                tbhtml.push(" style='line-height:", heigth, ";");
                                if (this.hide) {
                                    tbhtml.push(" display:none;");
                                }
                                tbhtml.push("'");
                                var width = thsdivs[j].style.width;
                                var div = [];
                                div.push("<div style='text-align:", this.align, ";width:", width, ";line-height:", heigth, ";");
                                if (p.nowrap == false) {
                                    div.push("white-space:normal");
                                }
                                div.push("'");
                                div.push(" abbr='", abbr, "'");
                                var tddata = row[abbr];
                                if (idx != "-1") {
                                    if (abbr.indexOf(".") > -1) {
                                        var arrabbr = abbr.split(".");
                                        var arr = [];
                                        for (var k = 0, len = arrabbr.length; k < len; k++) {
                                            var subKey = arrabbr[k];
                                            if (arr.length) {
                                                var curObj = arr[arr.length - 1];
                                                if (curObj) {
                                                    arr.push(curObj[subKey]);
                                                }
                                                continue;
                                            }
                                            arr.push(row[subKey]);
                                        }
                                        try {
                                            tddata = arr.pop().toString();
                                        }
                                        catch (e) {
                                            tddata = "";
                                        }
                                        arrabbr = arr = null;
                                    }
                                    //验证是否是Date对象
                                    var re = /^\/Date?\(\d+\)+/;
                                    if (re.test(tddata)) {
                                        re = /[^\d]*/;
                                        tddata = tddata.replace(re, "").replace(")/", "");
                                        tddata = new Date(parseInt(tddata, 10));
                                        tddata = tddata.getFullYear() + "年" + (parseInt(tddata.getMonth(), 10) + 1) + "月" + tddata.getDate() + '日';
                                    }
                                    if (tddata && !this.process) {
                                        div.push(" title='" + tddata + "'");
                                    }
                                }
                                div.push(">");
                                if (idx == "-1") { //checkbox
                                    var checked = "";
                                    if (row["checked"]) {
                                        checked = "checked='checked'";
                                    }
                                    div.push("<input type='checkbox' id='chk_", key, "' class='itemchk' ", checked, " value='", key, "'/>");
                                    if (tdclass != "") {
                                        tdclass += " chboxtd";
                                    } else {
                                        tdclass += "chboxtd";
                                    }
                                }
                                else if ($(this).attr("index")) { //index
                                    div.push((parseInt(p.page) - 1) * parseInt(p.rp) + i + 1);
                                }
                                else {

                                    var divInner = tddata;
                                    if (divInner == null) {
                                        divInner = "&nbsp;";
                                    }
                                    if (this.process) {
                                        divInner = this.process(divInner, key,row);
                                    }
                                    if (linkurl) {
                                        divInner = "<span class='linkurl' key='" + keyval + "' abbr='" + abbr + "'>" + divInner + "</span>";
                                    }
                                    div.push(divInner);
                                }
                                div.push("</div>");
                                if (tdclass != "") {
                                    tbhtml.push(" class='", tdclass, "'");
                                }
                                tbhtml.push(">", div.join(""), "</td>");
                            });
                            tbhtml.push("</tr>");
                        }
					    );
                    }

                } else if (p.dataType == 'xml') {
                    i = 1;
                    $("rows row", data).each
				(
				 	function () {
				 	    i++;
				 	    var robj = this;
				 	    var arrdata = new Array();
				 	    $("cell", robj).each(function () {
				 	        arrdata.push($(this).text());
				 	    });
				 	    var nid = $(this).attr('id');
				 	    tbhtml.push("<tr id='", "row", nid, "'");
				 	    if (i % 2 && p.striped) {
				 	        tbhtml.push(" class='erow'");
				 	    }
				 	    if (p.rowbinddata) {
				 	        tbhtml.push("ch='", arrdata.join("_FG$SP_"), "'");
				 	    }
				 	    tbhtml.push(">");
				 	    var trid = nid;
				 	    $(ths).each(function (j) {
				 	        tbhtml.push("<td align='", this.align, "'");
				 	        if (this.hide) {
				 	            tbhtml.push(" style='display:none;'");
				 	        }
				 	        var tdclass = "";
				 	        var tddata = "";
				 	        var idx = $(this).attr('axis').substr(3);

				 	        if (p.sortname && p.sortname == $(this).attr('abbr')) {
				 	            tdclass = 'sorted';
				 	        }
				 	        var width = thsdivs[j].style.width;

				 	        var div = [];
				 	        div.push("<div style='text-align:", this.align, ";width:", width, ";");
				 	        if (p.nowrap == false) {
				 	            div.push("white-space:normal");
				 	        }
				 	        div.push("'>");

				 	        if (idx == "-1") { //checkbox
				 	            div.push("<input type='checkbox' id='chk_", nid, "' class='itemchk' value='", nid, "'/>");
				 	            if (tdclass != "") {
				 	                tdclass += " chboxtd";
				 	            } else {
				 	                tdclass += "chboxtd";
				 	            }
				 	        }
				 	        else {
				 	            var divInner = arrdata[idx] || "&nbsp;";
				 	            if (divInner == "null") {
				 	                divInner = "&nbsp;";
				 	            }
				 	            if (p.rowbinddata) {
				 	                tddata = arrdata[idx] || "";
				 	            }
				 	            if (this.process) {
				 	                divInner = this.process(divInner, trid);
				 	            }
				 	            div.push(divInner);
				 	        }
				 	        div.push("</div>");
				 	        if (tdclass != "") {
				 	            tbhtml.push(" class='", tdclass, "'");
				 	        }
				 	        tbhtml.push(" axis='", tddata, "'", ">", div.join(""), "</td>");
				 	    });
				 	    tbhtml.push("</tr>");
				 	}
				);
                }
                tbhtml.push("</tbody>");
                $(t).html(tbhtml.join(""));
                $(".itemchk:checked", t).each(function () {
                    $(this).parents("tr").addClass("trSelected");
                });
                //this.rePosDrag();
                this.addRowProp();
                if (p.onSuccess) p.onSuccess();
                if (p.hideOnSubmit) $(g.block).remove(); //$(t).show();
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                if ($.browser.opera) $(t).css('visibility', 'visible');

            },
            changeSort: function (th) { //change sortorder
                if (this.loading) return true;
                $(g.nDiv).hide(); $(g.nBtn).hide();
                if (p.sortname == $(th).attr('abbr')) {
                    if (p.sortorder == 'asc') p.sortorder = 'desc';
                    else p.sortorder = 'asc';
                }
                $(th).addClass('sorted').siblings().removeClass('sorted');
                $('.sdesc', this.hDiv).removeClass('sdesc');
                $('.sasc', this.hDiv).removeClass('sasc');
                $('div', th).addClass('s' + p.sortorder);
                p.sortname = $(th).attr('abbr');
                if (p.onChangeSort)
                    p.onChangeSort(p.sortname, p.sortorder);
                else
                    this.populate();
            },
            buildpager: function () { //rebuild pager based on new properties
                $('.pcontrol input', this.pDiv).val(p.page);
                $('.pcontrol span', this.pDiv).html(p.pages);
                var r1 = (p.page - 1) * p.rp + 1;
                var r2 = r1 + p.rp - 1;
                if (p.total < r2) r2 = p.total;
                var stat = p.pagestat;
                stat = stat.replace(/{from}/, r1);
                stat = stat.replace(/{to}/, r2);
                stat = stat.replace(/{total}/, p.total);
                $('.pPageStat', this.pDiv).html(stat);
            },
            populate: function () { //get latest data 
                //log.trace("开始访问数据源");
                if (this.loading) return true;
                if (p.onSubmit) {
                    var gh = p.onSubmit();
                    if (!gh) return false;
                }
                this.loading = true;
                if (!p.url) return false;
                $('.pPageStat', this.pDiv).html(p.procmsg);
                $('.pReload', this.pDiv).addClass('loading');
                $(g.block).css({ top: g.bDiv.offsetTop });
                if (p.hideOnSubmit) $(this.gDiv).prepend(g.block); //$(t).hide();
                if ($.browser.opera) $(t).css('visibility', 'hidden');
                if (!p.newp) p.newp = 1;
                if (p.page > p.pages) p.page = p.pages;
                var param = [
					 { name: 'page', value: p.newp }
					, { name: 'pagesize', value: p.rp }
					, { name: 'sortname', value: p.sortname }
					, { name: 'sortorder', value: p.sortorder }
					, { name: 'query', value: p.query }
					, { name: 'qtype', value: p.qtype }
					, { name: 'qop', value: p.qop }
				];
                if (p.params) {
                    $.each(p.params, function () {
                        if (this.name == "curparms") {
                            if ($.isArray(this.value)) {
                                var newformVals = $.grep(this.value, function (n, i) {
                                    if (n.value && (n.name != "rp" ||n.name != "pagesize" || n.name != "page" || n.name != "sortname"
                                        || n.name != "sortorder" || n.name != "query" || n.name != "qtype" || n.name != "qop")) {
                                        return true;
                                    }
                                    return false;
                                });
                                $.merge(param, newformVals);
                                newformVals = formVals = null;
                            }
                        }
                        else
                            param[param.length] = this; // nparam[this.name] = $("#" + this.value + "").val();
                    });
                }
                //静态参数
                if (p.staticparams) {
                    for (var pi = 0; pi < p.staticparams.length; pi++) param[param.length] = p.staticparams[pi];
                }
                $.ajax({
                    type: p.method,
                    url: p.url,
                    data: param,
                    dataType: p.dataType,
                    success: function (data) {
                        if (data) {
                            if (data != null && data.error != null && data == "undefined") {
                                if (p.onError) {
                                    p.onError(data);
                                    g.hideLoading();
                                }
                            }
                            else if (data.errMsgs) {
                                if (typeof top.Dialog == "function")
                                    top.Dialog.alert(data.errMsgs.join(""));
                                else
                                    alert(data.errMsgs.join(""));
                                g.hideLoading();
                            }
                             else if (data.Message) {
                                if (typeof top.Dialog == "function")
                                    top.Dialog.alert(data.Message);
                                else
                                    alert(data.Message);
                                g.hideLoading();
                            }
                            else {
                                g.addData(data);
                            }
                        }
                        else {
                            //  alert("没有相关数据;");
                            g.hideLoading();
                        }
                    },
                    error: function (data, textStatus, errorThrown) {
                        try {
                            if (p.onError) {
                                p.onError(data);
                            }
                            else {
                              //  if (typeof Dialog == "function") {
                                    //Dialog.alert("获取数据发生异常;");
                             //   }
                              //  else
                                    alert("获取数据发生异常;");
                            }
                            g.hideLoading();
                        }
                        catch (e) {
                        }
                    }
                });
            },
            doSearch: function () {
                var queryType = $('select[name=qtype]', g.sDiv).val();
                var qArrType = queryType.split("$");
                var index = -1;
                if (qArrType.length != 3) {
                    p.qop = "Eq";
                    p.qtype = queryType;
                }
                else {
                    p.qop = qArrType[1];
                    p.qtype = qArrType[0];
                    index = parseInt(qArrType[2]);
                }
                p.query = $('input[name=q]', g.sDiv).val();
                //添加验证代码
                if (p.query != "" && p.searchitems && index >= 0 && p.searchitems.length > index) {
                    if (p.searchitems[index].reg) {
                        if (!p.searchitems[index].reg.test(p.query)) {
                            alert("你的输入不符合要求!");
                            return;
                        }
                    }
                }
                p.newp = 1;
                this.populate();
            },
            changePage: function (ctype) { //change page

                if (this.loading) return true;

                switch (ctype) {
                    case 'first': p.newp = 1; break;
                    case 'prev': if (p.page > 1) p.newp = parseInt(p.page) - 1; break;
                    case 'next': if (p.page < p.pages) p.newp = parseInt(p.page) + 1; break;
                    case 'last': p.newp = p.pages; break;
                    case 'input':
                        var nv = parseInt($('.pcontrol input', this.pDiv).val());
                        if (isNaN(nv)) nv = 1;
                        if (nv < 1) nv = 1;
                        else if (nv > p.pages) nv = p.pages;
                        $('.pcontrol input', this.pDiv).val(nv);
                        p.newp = nv;
                        break;
                }

                if (p.newp == p.page) return false;

                if (p.onChangePage)
                    p.onChangePage(p.newp);
                else
                    this.populate();

            },
            cellProp: function (n, ptr, pth) {
                var tdDiv = document.createElement('div');
                if (pth != null) {
                    if (p.sortname == $(pth).attr('abbr') && p.sortname) {
                        this.className = 'sorted';
                    }
                    $(tdDiv).css({ textAlign: pth.align, width: $('div:first', pth)[0].style.width });
                    if (pth.hide) $(this).css('display', 'none');
                }
                if (p.nowrap == false) $(tdDiv).css('white-space', 'normal');

                if (this.innerHTML == '') this.innerHTML = '&nbsp;';

                //tdDiv.value = this.innerHTML; //store preprocess value
                tdDiv.innerHTML = this.innerHTML;

                var prnt = $(this).parent()[0];
                var pid = false;
                if (prnt.id) pid = prnt.id.substr(3);
                if (pth != null) {
                    if (pth.process)
                    { pth.process(tdDiv, pid); }
                }
                $("input.itemchk", tdDiv).each(function () {
                    $(this).click(function () {
                        if (this.checked) {
                            $(ptr).addClass("trSelected");
                            if (p.rowcheckedHandler) {
                                p.rowcheckedHandler(this);
                            }
                        }
                        else {
                            $(ptr).removeClass("trSelected");
                        }
                        if (p.onrowchecked) {
                            p.onrowchecked.call(this);
                        }
                    });
                });
                $(this).empty().append(tdDiv).removeAttr('width'); //wrap content
                //add editable event here 'dblclick',如果需要可编辑在这里添加可编辑代码 
            },
            addCellProp: function () {
                var $gF = this.cellProp;

                $('tbody tr td', g.bDiv).each
					(
						function () {
						    var n = $('td', $(this).parent()).index(this);
						    var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
						    var ptr = $(this).parent();
						    $gF.call(this, n, ptr, pth);
						}
					);
                $gF = null;
            },
            /*
            ** 获取选中行
            **返回选中的 jQuery(tr)行对象
            */
            getCheckedRows: function () {
                var trs = [];
                $(":checkbox:checked", g.bDiv).each(function () {
                    var tr = $(this).parents("tr");
                    if (tr.attr("nodeName") == "TR")
                        trs.push(tr);
                });
                return trs;
            },
            /*
            ** 获取选中行
            **返回选中的 jQuery(tr)行对象
            */
            getSelectRows: function () {
                var trs = [];
                var $selectTr = $(".trSelected", g.bDiv);
                if ($selectTr.length) {
                    $selectTr.each(function (i, tr) {
                        var index = $(tr).attr("index");
                        if (p.cacheData)
                            trs.push(p.datas[index]);
                        else
                            trs.push(tr);
                    });
                }
                return trs;
            },
            /*
            ** 获取选中行的主键
            ** 参数 jQuery<tr> 用于限制查询范围,如未null则查询插件中所有选中行的主键,
            ** 否则之查询传入参数那一行的主键信息
            ** 返回主键数组 [dataKey]
            */
            getDataKeys: function (tr) {
                var ids = [];
                if (tr && tr.length) {
                    $(":checkbox:checked", tr).each(function () {
                        ids.push($(this).val());
                    });
                } else {
                    $(":checkbox:checked", g.bDiv).each(function () {
                        ids.push($(this).val());
                    });
                }
                return ids;
            },
            getCellDim: function (obj) // get cell prop for editable event
            {
                var ht = parseInt($(obj).height());
                var pht = parseInt($(obj).parent().height());
                var wt = parseInt(obj.style.width);
                var pwt = parseInt($(obj).parent().width());
                var top = obj.offsetParent.offsetTop;
                var left = obj.offsetParent.offsetLeft;
                var pdl = parseInt($(obj).css('paddingLeft'));
                var pdt = parseInt($(obj).css('paddingTop'));
                return { ht: ht, wt: wt, top: top, left: left, pdl: pdl, pdt: pdt, pht: pht, pwt: pwt };
            },
            rowProp: function () {
                if (p.rowhandler) {              
					var cur = $(this);					
                    var index =cur.attr("index");
                    var curdata={};
                    if (p.cacheData)
                           curdata=(p.datas[index]);  
                    p.rowhandler(this,curdata);
                }
                if ($.browser.msie && $.browser.version < 7.0) {
                    $(this).hover(function () { $(this).addClass('trOver'); }, function () { $(this).removeClass('trOver'); });
                }
                if(p.rowdbclickhandler){
                 $(this).dblclick(function(){
                 var cur = $(this);					
                    var index =cur.attr("index");
                    var curdata={};
                    if (p.cacheData)
                           curdata=(p.datas[index]);  
                    p.rowdbclickhandler(this,curdata);
                 });
                }
            },
            addRowProp: function () {
                var $gF = this.rowProp;
                $('tbody tr', g.bDiv).each(
                    function () {
                        if (p.showcheckbox) {
                            $("input.itemchk", this).each(function () {
                                var ptr = $(this).parent().parent().parent();
                                $(this).click(function () {
                                    if (this.checked) {
                                        ptr.addClass("trSelected");
                                        if (p.rowcheckedHandler) {
                                            p.rowcheckedHandler(this);
                                        }
                                    }
                                    else {
                                        ptr.removeClass("trSelected");
                                    }
                                    if (p.onrowchecked) {
                                        p.onrowchecked.call(this);
                                    }
                                });
                            });
                            $(this)
							.click(
								function (e) {
								    var obj = (e.target || e.srcElement); if (obj.href || obj.type) return true;
								    $(this).toggleClass('trSelected');
								    $("input.itemchk").each(function () {
								        if (p.singleSelect)
								            $(this).attr("checked", false);
								        else {
								            if (!$(this).parent().parent().parent().hasClass("trSelected")) {
								                $(this).attr("checked", false);
								            }
								        }
								    });
								    if ($(this).hasClass("trSelected")) {
								        if (p.rowcheckedHandler) {
								            p.rowcheckedHandler(this);
								        }
								        $("input.itemchk", this).each(function () {
								            $(this).attr("checked", true);
								        });
								    }
								    if (p.singleSelect) $(this).siblings().removeClass('trSelected');
								});

                        }
                        else {
                            $(this)
							.click(
								function (e) {
								    var obj = (e.target || e.srcElement); if (obj.href || obj.type) return true;
								    $(this).toggleClass('trSelected');
								    // $(this).addClass("trSelected");
								    if (p.singleSelect) $(this).siblings().removeClass('trSelected');
								});
                        }
                        $gF.call(this);
                    }
                );
                $gF = null;
            },
            checkAllOrNot: function (parent) {
                var ischeck = $(this).attr("checked");
                $('tbody tr', g.bDiv).each(function () {
                    if (ischeck) {
                        $(this).addClass("trSelected");
                    }
                    else {
                        $(this).removeClass("trSelected");
                    }
                });
                $("input.itemchk", g.bDiv).each(function () {
                    this.checked = ischeck;
                    //Raise Event
                    if (p.onrowchecked) {
                        p.onrowchecked.call(this);
                    }
                });
            },
            pager: 0
        };

        //create model if any
        if (p.colModel) {
            if (p.saveColChange) {
                var strPage = "";
                if (p.saveColCookieName) {
                    strPage = p.saveColCookieName
                }
                else {
                    var arrUrl = window.location.href.split("/");
                    strPage = arrUrl[arrUrl.length - 1];
                    strPage = strPage.split(".")[0];
                    if (p.url) {
                        var strUrl = p.url.split("/");
                        strPage += strUrl[strUrl.length - 1].split(".")[0];
                    }
                }
                var mynewcols = getCookie(strPage);
                var tempCols = [];
                if (mynewcols) {
                    try {
                        mynewcols = eval(mynewcols);  // $.parseJSON(mynewcols);
                        if (mynewcols.length == p.colModel.length) {
                            $.each(mynewcols, function (i, n) {
                                if (n.index < p.colModel.length) {
                                    if (n.width) {
                                        p.colModel[n.index].width = n.width;
                                        if (p.colModel[n.index].hide) {
                                            p.colModel[n.index].hide = false;
                                        }
                                    }
                                    else {
                                        p.colModel[n.index].hide = true;
                                    }
                                    tempCols.push(p.colModel[n.index]);
                                }
                            });
                        }
                        mynewcols = null;
                    }
                    catch (e) {
                        tempCols = [];
                        mynewcols = null;
                    }
                    //  val = "\"" + encodeURI(n.toString()).replace(/;/g, "；") + "\"";
                    if (tempCols.length > 0) {
                        p.colModel = tempCols;
                        tempCols = null;
                    }
                }
            }
            thead = document.createElement('thead');
            tr = document.createElement('tr');
            //p.showcheckbox ==true;
            if (p.showcheckbox) {
                var cth = jQuery('<th/>');
                var cthch = jQuery('<input type="checkbox"/>');
                cthch.addClass("noborder")
                cth.addClass("cth").attr({ 'axis': "col-1", width: "22", "isch": true }).append(cthch);
                $(tr).append(cth);
            }
            for (i = 0; i < p.colModel.length; i++) {
                var cm = p.colModel[i];
                var th = document.createElement('th');

                th.innerHTML = cm.display;

                if (cm.name)
                    $(th).attr('abbr', cm.name);
                if (cm.sortable)
                    $(th).attr('sort', cm.name);
                if (cm.index)
                    $(th).attr('index', cm.index);
                //th.idx = i;
                $(th).attr('axis', 'col' + i);

                if (cm.align)
                    th.align = cm.align;

                if (cm.width)
                    $(th).attr('width', cm.width);
                if (cm.height)
                    $(th).attr('height', cm.height);
                if (cm.linkurl)
                    $(th).attr('linkurl', cm.linkurl);
                if (cm.hide) {
                    th.hide = true;
                }
                if (cm.toggle != undefined) {
                    th.toggle = cm.toggle
                }
                if (cm.process) {
                    th.process = cm.process;
                }

                $(tr).append(th);
            }
            $(thead).append(tr);
            $(t).prepend(thead);
        } // end if p.colmodel	

        //init divs
        g.gDiv = document.createElement('div'); //create global container
        g.mDiv = document.createElement('div'); //create title container
        g.hDiv = document.createElement('div'); //create header container
        g.bDiv = document.createElement('div'); //create body container
        g.vDiv = document.createElement('div'); //create grip
        g.rDiv = document.createElement('div'); //create horizontal resizer
        g.cDrag = document.createElement('div'); //create column drag
        g.block = document.createElement('div'); //creat blocker
        g.nDiv = document.createElement('div'); //create column show/hide popup
        g.nBtn = document.createElement('div'); //create column show/hide button
        g.iDiv = document.createElement('div'); //create editable layer
        g.tDiv = document.createElement('div'); //create toolbar
        g.sDiv = document.createElement('div');

        if (p.usepager) g.pDiv = document.createElement('div'); //create pager container
        g.hTable = document.createElement('table');

        //set gDiv
        g.gDiv.className = p.gridClass;
        if (p.width != 'auto') g.gDiv.style.width = p.width + 'px';

        //add conditional classes
        if ($.browser.msie)
            $(g.gDiv).addClass('ie');

        if (p.novstripe)
            $(g.gDiv).addClass('novstripe');

        $(t).before(g.gDiv);
        $(g.gDiv)
		.append(t)
		;

        //set toolbar
        if (p.buttons) {
            g.tDiv.className = 'tDiv';
            var tDiv2 = document.createElement('div');
            tDiv2.className = 'tDiv2';

            for (i = 0; i < p.buttons.length; i++) {
                var btn = p.buttons[i];
                if (!btn.hide) {
                    if (!btn.separator && btn.displayname) {
                        var btnDiv = document.createElement('div');
                        btnDiv.className = 'fbutton';
                        btnDiv.innerHTML = "<div title='"+(btn.tips?btn.tips:btn.displayname)+"'><span>" + btn.displayname + "</span></div>";
                        if (btn.title) {
                            btnDiv.title = btn.title;
                        }
                        if (btn.bclass)
                            $('span', btnDiv)
							.addClass(btn.bclass);
                        btnDiv.onpress = btn.onpress;
                        btnDiv.name = btn.name;
                        if (btn.onpress) {
                            $(btnDiv).click
							(
								function () {                        
								    var selectTr = $(".trSelected", g.gDiv), ids = [], trs = [];
								    selectTr.each(function () {
								        var cur = $(this);
								        ids.push(cur.attr("id").substr(3));
                                         var index =cur.attr("index");
                        if (p.cacheData)
                            trs.push(p.datas[index]);                      
								    });
								    this.onpress(this.name, selectTr, ids,trs);
								}
							);
                        }
                        $(tDiv2).append(btnDiv);
                        if ($.browser.msie && $.browser.version < 7.0) {
                            $(btnDiv).hover(function () { $(this).addClass('fbOver'); }, function () { $(this).removeClass('fbOver'); });
                        }

                    } else {
                        $(tDiv2).append("<div class='btnseparator'></div>");
                    }
                }
            }
            $(g.tDiv).append(tDiv2);
            $(g.tDiv).append("<div style='clear:both'></div>");
            $(g.gDiv).prepend(g.tDiv);
        }

        //set hDiv
        g.hDiv.className = 'hDiv';

        $(t).before(g.hDiv);

        //set hTable
        g.hTable.cellPadding = 0;
        g.hTable.cellSpacing = 0;
        $(g.hDiv).append('<div class="hDivBox"></div>');
        $('div', g.hDiv).append(g.hTable);
        var thead = $("thead:first", t).get(0);
        if (thead) $(g.hTable).append(thead);
        thead = null;

        if (!p.colmodel) var ci = 0;

        //setup thead			
        $('thead tr:first th', g.hDiv).each
			(
			 	function () {
			 	    var thdiv = document.createElement('div');
			 	    if ($(this).attr('sort')) {
			 	        $(this).click(
								function (e) {
								    if (!$(this).hasClass('thOver')) return false;
								    var obj = (e.target || e.srcElement);
								    if (obj.href || obj.type) return true;
								    g.changeSort(this);
								}
							);

			 	        if ($(this).attr('abbr') == p.sortname) {
			 	            this.className = 'sorted';
			 	            thdiv.className = 's' + p.sortorder;
			 	        }
			 	    }

			 	    if (this.hide) $(this).hide();

			 	    if (!p.colmodel && !$(this).attr("isch")) {
			 	        $(this).attr('axis', 'col' + ci++);
			 	    }

			 	    if (this.height) {
			 	        $(thdiv).css({ height: this.height + 'px' });
			 	        $(this).removeAttr('height');
			 	    }
			 	    $(thdiv).css({ textAlign: this.align, width: this.width + 'px' });
			 	    thdiv.innerHTML = this.innerHTML;
			 	    $(this).empty().append(thdiv).removeAttr('width');
			 	    if (!$(this).attr("isch")) {
			 	        $(this).mousedown(function (e) {
			 	            g.dragStart('colMove', e, this);
			 	        })
						.hover(
							function () {

							    if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy) $(this).addClass('thOver');

							    if ($(this).attr('abbr') != p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) $('div', this).addClass('s' + p.sortorder);
							    else if ($(this).attr('abbr') == p.sortname && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
							        var no = '';
							        if (p.sortorder == 'asc') no = 'desc';
							        else no = 'asc';
							        $('div', this).removeClass('s' + p.sortorder).addClass('s' + no);
							    }

							    if (g.colCopy) {

							        var n = $('th', g.hDiv).index(this);

							        if (n == g.dcoln) return false;



							        if (n < g.dcoln) $(this).append(g.cdropleft);
							        else $(this).append(g.cdropright);

							        g.dcolt = n;

							    } else if (!g.colresize) {
							        var thsa = $('th:visible', g.hDiv);
							        var nv = -1;
							        for (var i = 0, j = 0, l = thsa.length; i < l; i++) {
							            if ($(thsa[i]).css("display") != "none") {
							                if (thsa[i] == this) {
							                    nv = j;
							                    break;
							                }
							                j++;
							            }
							        }
							        try {
							            // var nv = $('th:visible', g.hDiv).index(this);
							            var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'));
							            var nw = parseInt($(g.nBtn).width()) + parseInt($(g.nBtn).css('borderLeftWidth'));
							            nl = onl - nw + Math.floor(p.cgwidth / 2);

							            $(g.nDiv).hide(); $(g.nBtn).hide();

							            $(g.nBtn).css({ 'left': nl, top: g.hDiv.offsetTop }).show();

							            var ndw = parseInt($(g.nDiv).width());

							            $(g.nDiv).css({ top: g.bDiv.offsetTop });

							            if ((nl + ndw) > $(g.gDiv).width())
							                $(g.nDiv).css('left', onl - ndw + 1);
							            else
							                $(g.nDiv).css('left', nl);


							            if ($(this).hasClass('sorted'))
							                $(g.nBtn).addClass('srtd');
							            else
							                $(g.nBtn).removeClass('srtd');
							        }
							        catch (e) {
							        }

							    }

							},
							function () {
							    $(this).removeClass('thOver');
							    if ($(this).attr('abbr') != p.sortname) $('div', this).removeClass('s' + p.sortorder);
							    else if ($(this).attr('abbr') == p.sortname) {
							        var no = '';
							        if (p.sortorder == 'asc') no = 'desc';
							        else no = 'asc';

							        $('div', this).addClass('s' + p.sortorder).removeClass('s' + no);
							    }
							    if (g.colCopy) {
							        $(g.cdropleft).remove();
							        $(g.cdropright).remove();
							        g.dcolt = null;
							    }
							})
						; //wrap content
			 	    }
			 	}
			);

        //set bDiv
        g.bDiv.className = 'bDiv';
        $(t).before(g.bDiv);
        $(g.bDiv)
		.css({ height: (p.height == 'auto') ? 'auto' : p.height + "px" })
		.scroll(function (e) { g.scroll() })
		.append(t)
		;

        if (p.height == 'auto') {
            $('table', g.bDiv).addClass('autoht');
        }

        //add td properties
        if (p.url == false || p.url == "") {
            g.addCellProp();
            //add row properties
            g.addRowProp();
        }

        //set cDrag

        var cdcol = $('thead tr:first th:first', g.hDiv).get(0);

        if (cdcol != null) {
            g.cDrag.className = 'cDrag';
            g.cdpad = 0;

            g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'))) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth')));
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'))) ? 0 : parseInt($('div', cdcol).css('borderRightWidth')));
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'))) ? 0 : parseInt($('div', cdcol).css('paddingLeft')));
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'))) ? 0 : parseInt($('div', cdcol).css('paddingRight')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'))) ? 0 : parseInt($(cdcol).css('borderLeftWidth')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'))) ? 0 : parseInt($(cdcol).css('borderRightWidth')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'))) ? 0 : parseInt($(cdcol).css('paddingLeft')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'))) ? 0 : parseInt($(cdcol).css('paddingRight')));

            $(g.bDiv).before(g.cDrag);

            var cdheight = $(g.bDiv).height();
            var hdheight = $(g.hDiv).height();

            $(g.cDrag).css({ top: -hdheight + 'px' });

            $('thead tr:first th', g.hDiv).each
			(
			 	function () {
			 	    var cgDiv = document.createElement('div');
			 	    $(g.cDrag).append(cgDiv);
			 	    if (!p.cgwidth) p.cgwidth = $(cgDiv).width();
			 	    $(cgDiv).css({ height: cdheight + hdheight })
						.mousedown(function (e) { g.dragStart('colresize', e, this); })
						;
			 	    if ($.browser.msie && $.browser.version < 7.0) {
			 	        g.fixHeight($(g.gDiv).height());
			 	        $(cgDiv).hover(
								function () {
								    g.fixHeight();
								    $(this).addClass('dragging')
								},
								function () { if (!g.colresize) $(this).removeClass('dragging') }
							);
			 	    }
			 	}
			);

            //g.rePosDrag();

        }


        //add strip		
        if (p.striped)
            $('tbody tr:odd', g.bDiv).addClass('erow');


        if (p.resizable && p.height != 'auto') {
            g.vDiv.className = 'vGrip';
            $(g.vDiv)
		.mousedown(function (e) { g.dragStart('vresize', e) })
		.html('<span></span>');
            $(g.bDiv).after(g.vDiv);
        }

        if (p.resizable && p.width != 'auto' && !p.nohresize) {
            g.rDiv.className = 'hGrip';
            $(g.rDiv)
		.mousedown(function (e) { g.dragStart('vresize', e, true); })
		.html('<span></span>')
		.css('height', $(g.gDiv).height())
		;
            if ($.browser.msie && $.browser.version < 7.0) {
                $(g.rDiv).hover(function () { $(this).addClass('hgOver'); }, function () { $(this).removeClass('hgOver'); });
            }
            $(g.gDiv).append(g.rDiv);
        }

        // add pager
        if (p.usepager) {
            g.pDiv.className = 'pDiv';
            g.pDiv.innerHTML = '<div class="pDiv2"></div>';
            $(g.bDiv).after(g.pDiv);
            var html = '<div class="pGroup"><div class="pFirst pButton" title="转到第一页"><span></span></div><div class="pPrev pButton" title="转到上一页"><span></span></div> </div><div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">当前 <input type="text" size="1" value="1" />页 ,总页数 <span> 1 </span>页。</span></div><div class="btnseparator"></div><div class="pGroup"> <div class="pNext pButton" title="转到下一页"><span></span></div><div class="pLast pButton" title="转到最后一页"><span></span></div></div><div class="btnseparator"></div><div class="pGroup"> <div class="pReload pButton" title="刷新"><span></span></div> </div> <div class="btnseparator"></div><div class="pGroup"><span class="pPageStat"></span></div>';
            $('div', g.pDiv).html(html);

            $('.pReload', g.pDiv).click(function () { g.populate() });
            $('.pFirst', g.pDiv).click(function () { g.changePage('first') });
            $('.pPrev', g.pDiv).click(function () { g.changePage('prev') });
            $('.pNext', g.pDiv).click(function () { g.changePage('next') });
            $('.pLast', g.pDiv).click(function () { g.changePage('last') });
            $('.pcontrol input', g.pDiv).keydown(function (e) { if (e.keyCode == 13) g.changePage('input') });
            if ($.browser.msie && $.browser.version < 7) $('.pButton', g.pDiv).hover(function () { $(this).addClass('pBtnOver'); }, function () { $(this).removeClass('pBtnOver'); });

            if (p.useRp) {
                var opt = "";
                for (var nx = 0; nx < p.rpOptions.length; nx++) {
                    if (p.rp == p.rpOptions[nx]) sel = 'selected="selected"'; else sel = '';
                    opt += "<option value='" + p.rpOptions[nx] + "' " + sel + " >" + p.rpOptions[nx] + "&nbsp;&nbsp;</option>";
                };
                $('.pDiv2', g.pDiv).prepend("<div class='pGroup'>每页 <select name='rp'>" + opt + "</select>条</div> <div class='btnseparator'></div>");
                $('select', g.pDiv).change(
					function () {
					    if (p.onRpChange)
					        p.onRpChange(+this.value);
					    else {
					        p.newp = 1;
					        p.rp = +this.value;
					        g.populate();
					    }
					}
				);
            }

            //add search button
            if (p.searchitems) {
                $('.pDiv2', g.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
                $('.pSearch', g.pDiv).click(function () { $(g.sDiv).slideToggle('fast', function () { $('.sDiv:visible input:first', g.gDiv).trigger('focus'); }); });
                //add search box
                g.sDiv.className = 'sDiv';

                sitems = p.searchitems;

                var sopt = "";
                var op = "Eq";
                for (var s = 0; s < sitems.length; s++) {
                    if (p.qtype == '' && sitems[s].isdefault == true) {
                        p.qtype = sitems[s].name;
                        sel = 'selected="selected"';
                    } else sel = '';
                    if (sitems[s].operater == "Like") {
                        op = "Like";
                    }
                    else {
                        op = "Eq";
                    }
                    sopt += "<option value='" + sitems[s].name + "$" + op + "$" + s + "' " + sel + " >" + sitems[s].display + "&nbsp;&nbsp;</option>";
                }

                if (p.qtype == '') p.qtype = sitems[0].name;

                $(g.sDiv).append("<div class='sDiv2'>快速检索：<input type='text' size='30' name='q' class='qsbox' /> <select name='qtype'>" + sopt + "</select> <input type='button' name='qclearbtn' value='清空' /></div>");

                $('input[name=q],select[name=qtype]', g.sDiv).keydown(function (e) { if (e.keyCode == 13) g.doSearch() });
                $('input[name=qclearbtn]', g.sDiv).click(function () { $('input[name=q]', g.sDiv).val(''); p.query = ''; g.doSearch(); });
                $(g.bDiv).after(g.sDiv);

            }

        }
        $(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");

        // add title
        if (p.title) {
            g.mDiv.className = 'mDiv';
            g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
            $(g.gDiv).prepend(g.mDiv);
            if (p.showTableToggleBtn) {
                $(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
                $('div.ptogtitle', g.mDiv).click
					(
					 	function () {
					 	    $(g.gDiv).toggleClass('hideBody');
					 	    $(this).toggleClass('vsble');
					 	}
					);
            }
            //g.rePosDrag();
        }

        //setup cdrops
        g.cdropleft = document.createElement('span');
        g.cdropleft.className = 'cdropleft';
        g.cdropright = document.createElement('span');
        g.cdropright.className = 'cdropright';

        //add block
        g.block.className = 'gBlock';
        var blockloading = $("<div/>");
        blockloading.addClass("loading");
        $(g.block).append(blockloading);
        var gh = $(g.bDiv).height();
        var gtop = g.bDiv.offsetTop;
        $(g.block).css(
		{
		    width: g.bDiv.style.width,
		    height: gh,
		    position: 'relative',
		    marginBottom: (gh * -1),
		    zIndex: 1,
		    top: gtop,
		    left: '0px'
		}
		);
        $(g.block).fadeTo(0, p.blockOpacity);

        // add column control
        if ($('th', g.hDiv).length) {
            g.nDiv.className = 'nDiv';
            g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
            $(g.nDiv).css(
			{
			    marginBottom: (gh * -1),
			    display: 'none',
			    top: gtop
			}
			).noSelect()
			;

            var cn = 0;


            $('th div', g.hDiv).each
			(
			 	function () {
			 	    var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
			 	    if (kcol == null) return;
			 	    var chkall = $("input[type='checkbox']", this);
			 	    if (chkall.length > 0) {
			 	        chkall[0].onclick = g.checkAllOrNot;
			 	        return;
			 	    }
			 	    if (kcol.toggle == false || this.innerHTML == "") {
			 	        cn++;
			 	        return;
			 	    }
			 	    var chk = 'checked="checked"';
			 	    if (kcol.style.display == 'none') chk = '';

			 	    $('tbody', g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol noborder" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
			 	    cn++;
			 	}
			);

            if ($.browser.msie && $.browser.version < 7.0)
                $('tr', g.nDiv).hover
				(
				 	function () { $(this).addClass('ndcolover'); },
					function () { $(this).removeClass('ndcolover'); }
				);

            $('td.ndcol2', g.nDiv).click
			(
			 	function () {
			 	    if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
			 	    return g.toggleCol($(this).prev().find('input').val());
			 	}
			);

            $('input.togCol', g.nDiv).click
			(
			 	function () {

			 	    if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked == false) return false;
			 	    $(this).parent().next().trigger('click');
			 	    //return false;
			 	}
			);


            $(g.gDiv).prepend(g.nDiv);

            $(g.nBtn).addClass('nBtn')
			.html('<div></div>')
            //.attr('title', 'Hide/Show Columns')
			.click
			(
			 	function () {
			 	    $(g.nDiv).toggle(); return true;
			 	}
			);

            if (p.showToggleBtn)
                $(g.gDiv).prepend(g.nBtn);

        }

        // add date edit layer
        $(g.iDiv)
		.addClass('iDiv')
		.css({ display: 'none' })
		;
        $(g.bDiv).append(g.iDiv);

        // add flexigrid events
        $(g.bDiv)
		.hover(function () { $(g.nDiv).hide(); $(g.nBtn).hide(); }, function () { if (g.multisel) g.multisel = false; })
		;
        $(g.gDiv)
		.hover(function () { }, function () { $(g.nDiv).hide(); $(g.nBtn).hide(); })
		;

        //add document events
        $(document)
		.mousemove(function (e) { g.dragMove(e) })
		.mouseup(function (e) { g.dragEnd() })
		.hover(function () { }, function () { g.dragEnd() })
		;

        //browser adjustments
        if ($.browser.msie && $.browser.version < 7.0) {
            $('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv)
			.css({ width: '100%' });
            $(g.gDiv).addClass('ie6');
            if (p.width != 'auto') $(g.gDiv).addClass('ie6fullwidthbug');
        }

        g.rePosDrag();
        g.fixHeight();

        //make grid functions accessible
        t.p = p;
        t.grid = g;

        // load data
        if (p.url && p.autoload) {
            g.populate();
        }

        return t;

    };

    var docloaded = false;

    $(document).ready(function () { docloaded = true });

    $.fn.flexigrid = function (p) {

        return this.each(function () {
            if (!docloaded) {
                $(this).hide();
                var t = this;
                $(document).ready
					(
						function () {
						    $.addFlex(t, p);
						}
					);
            } else {
                $.addFlex(this, p);
            }
        });

    }; //end flexigrid

    $.fn.flexReload = function (p) { // function to reload grid

        return this.each(function () {
            if (this.grid && this.p.url) this.grid.populate();
        });

    }; //end flexReload

    $.fn.setParams = function (params) {
        return this.each(function () {
            if (this.grid) {
                if (!$.isArray(params)) {
                    params = [params];
                }
                this.p.params = [];

                this.p.params.push({ name: 'curparms', value: params });
                this.p.newp = 1;
                this.grid.populate();
            }
        });
    }

    //重新指定宽度和高度
    $.fn.flexResize = function (w, h) {
        var p = { width: w, height: h };
        return this.each(function () {
            if (this.grid) {
                $.extend(this.p, p);
                this.grid.reSize();
            }
        });
    }
    $.fn.changePage = function (type) {
        return this.each(function () {
            if (this.grid) {
                this.grid.changePage(type);
            }
        })
    }
    $.fn.flexOptions = function (p) { //function to update general options

        return this.each(function () {
            if (this.grid) $.extend(this.p, p);
        });

    }; //end flexOptions
    $.fn.GetOptions = function () {
        if (this[0].grid) {
            return this[0].p;
        }
        return null;
    }
    /*
    ** 获取选中行
    **返回选中的 jQuery(tr)行对象
    */
    $.fn.getCheckedRows = function () {
        if (this[0].grid) {
            return this[0].grid.getCheckedRows();
        }
        return [];
    }
    /*
    ** 获取选中行的主键
    ** 参数 jQuery<tr> 用于限制查询范围,如未null则查询插件中所有选中行的主键,
    ** 否则之查询传入参数那一行的主键信息
    ** 返回主键数组 [dataKey]
    */
    $.fn.getDataKeys = function (tr) {
        if (this[0].grid) {
            return this[0].grid.getDataKeys(tr);
        }
        return [];
    }
    //getSelectRows
    $.fn.getSelectRows = function () {
        if (this[0].grid) {
            return this[0].grid.getSelectRows();
        }
        return [];
    }
    $.fn.flexToggleCol = function (cid, visible) { // function to reload grid

        return this.each(function () {
            if (this.grid) this.grid.toggleCol(cid, visible);
        });

    }; //end flexToggleCol

    $.fn.flexAddData = function (data) { // function to add data to grid

        return this.each(function () {
            if (this.grid) this.grid.addData(data);
        });

    };

    $.fn.noSelect = function (p) { //no select plugin by me :-)
        if (p == null)
            prevent = true;
        else
            prevent = p;

        if (prevent) {

            return this.each(function () {
                if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function () { return false; });
                else if ($.browser.mozilla) {
                    $(this).css('MozUserSelect', 'none');
                    $('body').trigger('focus');
                }
                else if ($.browser.opera) $(this).bind('mousedown', function () { return false; });
                else $(this).attr('unselectable', 'on');
            });

        } else {


            return this.each(function () {
                if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
                else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
                else if ($.browser.opera) $(this).unbind('mousedown');
                else $(this).removeAttr('unselectable', 'on');
            });

        }

    }; //end noSelect

})(jQuery);