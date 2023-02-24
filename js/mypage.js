let mypage_list = {
    button_validation : function(){
        const reg = /[\{\}\[\]\/?,;:|\)*~"`!^\-_+<>\#$%&\\\=\(\']/gi;
        $.ajax({
            type: "post", 
            url:"/myinfo/button_change_validation",
            dataType: "json",
        }).done(function(data){
            if(JSON.stringify(data.result).replaceAll(reg,"") == 1){
                document.getElementById('change_button').disabled = false;
                document.location.href="https://coding-nara.com/myinfo/update";
            }
            else if(JSON.stringify(data.result).replaceAll(reg,"") == 2){
                document.getElementById('change_button').disabled = false;
                document.location.href="https://coding-nara.com/myinfo/update";
            }
            else{
                document.getElementById('change_button').disabled = true;
                alert("이메일 인증을 진행해 주세요.")
            }
        })
    },
    refund_button : function(number) {
        var item = document.querySelector('button[id=refund_button'+number+']');
        var subject = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild.textContent;
        var str = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild.textContent;
        var count = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild.textContent;
        var teacher = item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.textContent;
        var str_split = str.split(' ');
        var time = str_split[0];
        var day = str_split[1];
        document.location.href="/myinfo/refund_page?Subject="+subject+"&Time=" + time + "&Day=" + day + "&Teacher=" + teacher;
    },
    copy :function copy(number){
          // div 내부 텍스트 취득
          const valOfDIV = document.getElementById("div"+number).innerText;
  
          // textarea 생성
          const textArea = document.createElement('textarea');
  
          // textarea 추가
          document.body.appendChild(textArea);
          
          // textara의 value값으로 div내부 텍스트값 설정
          textArea.value = valOfDIV;
  
          // textarea 선택 및 복사
          textArea.select();
          document.execCommand('copy');
  
          // textarea 제거
          document.body.removeChild(textArea);
          alert('강의 코드가 복사되었습니다.');
    },
}
