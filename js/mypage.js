let mypage_list = {
    button_validation : function(){
        const reg = /[\{\}\[\]\/?,;:|\)*~"`!^\-_+<>\#$%&\\\=\(\']/gi;
        $.ajax({
            type: "post", 
            url:"/myinfo/button_change_validation",
            dataType: "json",
        }).done(function(data){
            if(JSON.stringify(data.result).replaceAll(reg,"")  == 1){
                document.getElementById('change_button').disabled = false;
                document.location.href="http://localhost:54213/myinfo/update";
            }else{
                document.getElementById('change_button').disabled = true;
                alert("이메일 인증을 진행해 주세요.")
            }
        })
    },
    refund_button : function() {
        $.ajax({
            type: "post", 
            url:"/myinfo/refund_page",
            dataType: "json",
            data: {
                CEA: cerNum
            }
        })
    }
}