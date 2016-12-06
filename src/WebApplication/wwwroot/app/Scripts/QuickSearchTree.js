/*
渲染组织结构下拉列表
F_Key:字典key
defaultvalue:初始值
*/
(function ($) {
    $.addTree = function (t, p) {
        if (t.hsload) return false; //如果已经存在则返回
        p = $.extend({
            url: "/ElevatorFileManager/GetUnitTree/", //ajax url,ajax方式对应的url地址
            method: 'POST', // data sending method,数据发送方式
            clickFn: false, ///点击事件，参数：Fn(treeId, treeNode)
            isCheck: false,//是否显示复选框
            beforeClick:null,
            data: { action: "areatree"}//传输到后台的自定义数据
        }, p);
        var selectionSetting = {
            view: {
                dblClickExpand: true
            },
            callback: {
                onMouseDown: function (event, treeId, treeNode) {
                    if (treeNode != null) {
                        if (p.clickFn)
                            p.clickFn(treeId, treeNode);
                        else {
                            top.Dialog.alert("未配置点击事件");
                        } 
                    }
                },
                beforeClick: p.beforeClick
            },
            check: {
                enable: p.isCheck,
                nocheckInherit: true
            }
        };
        var nodes = [];
	//	{ id: "0", parentId: -1, name: "广西大学", open: true, icon: "/libs/icons/user_group.gif" }
	//];
        $.ajax({
            type: p.method,
            url: p.url,
            data: p.data,
            success: function (result) {
                nodes = nodes.concat(result.treeNodes);
                $.fn.zTree.init($(t), selectionSetting,nodes);
                t.hsload = true;
            },
            error: function (a) {
                top.Dialog.alert("访问服务器端出错！");
            },
            dataType: 'json'
        });
    }
    $.fn.RendQuickSearchTree = function (p) {
        return this.each(function () {
            var t = this;
            $(document).ready(function () {
                $.addTree(t, p);
            });
        });
    }
})(jQuery);