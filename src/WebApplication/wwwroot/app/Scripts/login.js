eval(function (p, a, c, k, e, d) { e = function (c) { return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)) }; if (!''.replace(/^/, String)) { while (c--) { d[e(c)] = k[c] || e(c) } k = [function (e) { return d[e] } ]; e = function () { return '\\w+' }; c = 1 }; while (c--) { if (k[c]) { p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]) } } return p } ('$(6(){$("C:K").O(6(){$(k).A(6(a){3(7.D.M){u}3(a){$.v("注意：大写键开启了")}I{}})})});7.N.A=6(a){u k.L(6(f){j b=f.p?f.p:(f.w?f.w:-1);j d=f.o?f.o:(f.q?!!(f.q&4):P);j g=((b>=Q&&b<=F)&&!d)||((b>=E&&b<=H)&&d);a.G(k,g)})};3(7){(6(a){a.2={};a(B).J(6(b){3(a("#8").S==0){a("t").14(\'<s 13="8">&16;</s>\');a("#8").17()}a("t").R(6(c){a.2.r=c.19;a.2.z=c.18;3(a.2.h!=9){a.i()}})});a.11({v:6(c,b){3(b==9){b={}}3(b.n==9){b.n=5}3(b.m==9){b.m=5}3(b.e==9){b.e=T}a("#8").V(c).Y("y");3(7.2.l!=9){X(7.2.l)}3(b.e>0){7.2.l=15(a.x,b.e)}7.2.h=b;a.i()},x:6(){a("#8").Z("y")},i:6(){a("#8").W({U:(a.2.z+a.2.h.m)+"10",12:(a.2.r+a.2.h.n)})}})})(7)};', 62, 72, '||cursorMessageData|if|||function|jQuery|cursorMessageDiv|undefined|||||hideTimeout|||options|_showCursorMessage|var|this|hideTimeoutId|offsetY|offsetX|shiftKey|which|modifiers|mouseX|div|body|return|cursorMessage|keyCode|hideCursorMessage|slow|mouseY|caps|window|input|browser|97|90|call|122|else|ready|password|keypress|safari|fn|each|false|65|mousemove|length|1000|top|html|css|clearTimeout|fadeIn|fadeOut|px|extend|left|id|append|setTimeout|nbsp|hide|pageY|pageX'.split('|'), 0, {}))
$(function () {
    //居中
    $('.login_main').center();
    document.getElementById("username").focus();
    $("input","#loginForm").keydown(function (event) {
        if (event.keyCode == 13) {
            login()
        }
    })   

})

//登录
function login() {

    var errorMsg = "";
    var loginName = $("#username");
    var password = $("#password");
    if (!loginName.val()) {
        errorMsg += "&nbsp;&nbsp;用户名不能为空!";
    }
    if (!password.val()) {
        errorMsg += "&nbsp;&nbsp;密码不能为空!";
    }
    if (!$("#vercode").val()) {
        errorMsg += "&nbsp;&nbsp;验证码不能为空!";
    }
    if (errorMsg != "") {
        $(".login_info").html(errorMsg);
        $(".login_info").show();
    }
    else {
        //登录处理
        $.ajax({
            type: "POST",
            url: "/account/Login",
            dataType: "json",
            data: { "userLoginName": loginName.val(), "userPassword": password.val(), "vercode": $("#vercode").val() },
            beforeSend: function () {
                $(".login_info").show();
                $(".login_info").html("&nbsp;&nbsp;正在登录中...").attr("title", "正在登录中");
            },
            success: function (result) {
               
                if (result == null) {
                    $(".login_info").html("&nbsp;&nbsp;登陆失败！").attr("title", "登陆失败！");
                    return false;
                }
                if (result.Result) {
                    $(".login_info").html("&nbsp;&nbsp;登录成功，正在转到主页...");
                    if (result.Goto)
                        window.location = result.Goto;
                    else
                        window.location = '/Manager/Index';
                
                }
                else {
                    $(".login_info").html("&nbsp;&nbsp;" + result.Message).attr("title", result.Message);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                $(".login_info").html("&nbsp;&nbsp;登录失败," + textStatus + " " + errorThrown).attr("title", ("登录失败," + textStatus + " " + errorThrown));
            }

        }); 
    }
}