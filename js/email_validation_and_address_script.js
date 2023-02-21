var timer;
function stopWatch(TimeSet) {
    timer = setInterval(function () {
        sec = TimeSet % 60;
        document
            .getElementById("err-msg2")
            .innerHTML = "인증번호 유효시간은&nbsp;" + parseInt(TimeSet / 60) + "분" + sec + "초.<br><" +
                    "a href='javascript:;' id='resend' class='text-red' onclick=emailSend('EA')><u>" +
                    "인증번호 재전송</u></a>";
        TimeSet--;

        if (TimeSet < 0) {
            $.ajax({type: "POST", url: "/auth/mail_expire"})
            clearTimeout(timer);
            alert("인증번호 만료");
            document
                .getElementsByName("CEA")[0]
                .value = null;
            document
                .getElementsByName("EA")[0]
                .readOnly = false;
            document
                .getElementsByName("CEA")[0]
                .readOnly = false;
            document
                .getElementsByName("hideCK")[0]
                .value = null;
            document
                .getElementsByName("hideCNU")[0]
                .value = null;
            document
                .getElementById("CEA")
                .classList
                .add("d-none");
            document
                .getElementById("cerBtn")
                .classList
                .add("d-none");
            document
                .getElementById("sendBtn")
                .classList
                .remove("d-none");
            document
                .getElementById("err-msg2")
                .innerHTML = "인증번호 재전송";
        }
    }, 1000);
}
// 이메일 전송 기능
function emailSend(email) {
    var EA = document
        .getElementsByName(email)[0]
        .value;
    var validateEA = $("#" + email).parsley();
    if (validateEA.isValid() == true) {
        emailSendAjax(EA);
    } else {
        return alert("올바른 이메일 형식을 입력해 주세요.");
    }
}
//패스워드 변경시에 이메일 전송 기능
function password_emailSend(email) {
    var EA = document
        .getElementsByName(email)[0]
        .value;
    var validateEA = $("#" + email).parsley();
    if (validateEA.isValid() == true) {
        password_emailSendAjax(EA);
    } else {
        return alert("올바른 이메일 형식을 입력해 주세요.");
    }
}
function password_emailSendAjax(email) {
    $
        .ajax({
            type: "POST",
            url: "/auth/password_mail",
            dataType: "json",
            data: {
                EA: email
            }
        })
        .done(function (data) {
            if (data.result == "not_exist") {
                alert("존재하지 않는 이메일입니다.");
            } else if (data.result == "send") {
                alert("인증 번호를 전송했습니다.");
                document
                    .getElementsByName("EA")[0]
                    .readOnly = true;
                document
                    .getElementById("CEA")
                    .classList
                    .remove("d-none");
                document
                    .getElementById("cerBtn")
                    .classList
                    .remove("d-none");
                document
                    .getElementById("sendBtn")
                    .classList
                    .add("d-none");
                clearTimeout(timer);
                stopWatch(300);
            } else {
                alert("인증 번호 전송에 실패했습니다.");
            }
        });
}
// 이메일 인증 기능
function emailCer(cerNum) {
    var CEA = document
        .getElementsByName(cerNum)[0]
        .value;
    var validateCEA = $("#" + cerNum).parsley();

    if (validateCEA.isValid() == true) {
        emailCerAjax(CEA);
    } else {
        alert("인증번호를 입력하세요.");
    }
}
function emailSendAjax(email) {
    $
        .ajax({
            type: "POST",
            url: "/auth/mail",
            dataType: "json",
            data: {
                EA: email
            }
        })
        .done(function (data) {
            if (data.result == "exist") {
                alert("존재하는 이메일입니다.");
            } else if (data.result == "send") {
                alert("인증 번호를 전송했습니다.");
                document
                    .getElementsByName("EA")[0]
                    .readOnly = true;
                document
                    .getElementById("CEA")
                    .classList
                    .remove("d-none");
                document
                    .getElementById("cerBtn")
                    .classList
                    .remove("d-none");
                document
                    .getElementById("sendBtn")
                    .classList
                    .add("d-none");
                clearTimeout(timer);
                stopWatch(300);
            } else {
                alert("인증 번호 전송에 실패했습니다.");
            }
        });
}

// 이메일 인증 기능
function emailCerAjax(cerNum) {
    $
        .ajax({
            type: "POST",
            url: "/auth/mail_validation",
            dataType: "json",
            data: {
                CEA: cerNum
            }
        })
        .done(function (data) {
            if (data.result == "success") {
                clearTimeout(timer);
                document
                    .getElementsByName("EA")[0]
                    .readOnly = true;
                document
                    .getElementsByName("CEA")[0]
                    .readOnly = true;
                document
                    .getElementById("err-msg2")
                    .innerHTML = "인증 성공";
                document
                    .getElementsByName("hideCK")[0]
                    .value = "true";
            } else if (data.result == "expire") 
                alert("인증코드 만료(재전송 요청)");
            else {
                alert("인증 실패");
                document
                    .getElementsByName("CEA")[0]
                    .value = null;
                document
                    .getElementsByName("hideCK")[0]
                    .value = null;
            }
        });
}
function findAddr() {
    new daum
        .Postcode({
            oncomplete: function (data) {
                console.log(data);

                // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분. 도로명 주소의 노출 규칙에 따라 주소를 표시한다. 내려오는 변수가 값이
                // 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                var roadAddr = data.roadAddress; // 도로명 주소 변수
                var jibunAddr = data.jibunAddress; // 지번 주소 변수
                // 우편번호와 주소 정보를 해당 필드에 넣는다.
                document
                    .getElementById("member_post")
                    .value = data.zonecode;
                if (roadAddr !== "") {
                    document
                        .getElementById("member_addr")
                        .value = roadAddr;
                } else if (jibunAddr !== "") {
                    document
                        .getElementById("member_addr")
                        .value = jibunAddr;
                }
            }
        })
        .open();
}

const autoHyphen2 = (target) => {
	target.value = target.value
	  .replace(/[^0-9]/g, '')
	 .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
}
function chkPW() {
    var pw1 = $("#pwd").val();
	var id = $("#EA").val();
    var pw2 = $("#pwd2").val();
	var checkNumber = pw1.search(/[0-9]/g);
	var checkEnglish = pw1.search(/[a-z]/ig);
    if (pw1 === pw2) {
		if(!/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/.test(pw1)){            
	        alert('숫자+영문자+특수문자 조합으로 8자리 이상 사용해야 합니다.');
	        return false;
	    }else if(checkNumber <0 || checkEnglish <0){
	        alert("숫자와 영문자를 혼용하여야 합니다.");
	        return false;
	    }else if(/(\w)\1\1\1/.test(pw1)){
	        alert('같은 문자를 4번 이상 사용하실 수 없습니다.');
	        return false;
	    }else if(pw1.search(id) > -1){
	        alert("비밀번호에 아이디가 포함되었습니다.");
	        return false;
	    }else {
            $.ajax({
                type: "POST",
                url : "/auth/password_check_success"
            })
            document
                    .getElementById("err-msg3")
                    .innerHTML = "사용가능한 비밀번호입니다.";
            document
                .getElementsByName("pwd")[0]
                .readOnly = true;
            document
                .getElementsByName("pwd2")[0]
                .readOnly = true;
        }
	}
}
function password_chkPW(){
    var pw1 = $("#pwd").val();
    var pw2 = $("#pwd2").val();
	var checkNumber = pw1.search(/[0-9]/g);
	var checkEnglish = pw1.search(/[a-z]/ig);
    if (pw1 === pw2) {
		if(!/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/.test(pw1)){            
	        alert('숫자+영문자+특수문자 조합으로 8자리 이상 사용해야 합니다.');
	        return false;
	    }else if(checkNumber <0 || checkEnglish <0){
	        alert("숫자와 영문자를 혼용하여야 합니다.");
	        return false;
	    }else if(/(\w)\1\1\1/.test(pw1)){
	        alert('같은 문자를 4번 이상 사용하실 수 없습니다.');
	        return false;
        }else {
            $.ajax({
                type: "POST",
                url : "/auth/password_check_success"
            })
            document
                    .getElementById("err-msg3")
                    .innerHTML = "사용가능한 비밀번호입니다.";
            document
                .getElementsByName("pwd")[0]
                .readOnly = true;
            document
                .getElementsByName("pwd2")[0]
                .readOnly = true;
        }
	}
}

function Change(){
    $.ajax({
        type: "get",
        url: "/myinfo/update",
        
    })
}
function myinfo_change(){
    var email = document.getElementById('EA').value;
    var isOK = document.getElementById('hideCK').value;
    var username = document.getElementById('name').value;

    window.location.href="http://localhost:54213/myinfo/validate_Mypage_Email?Email=" + email + "&isOkay=" + isOK + "&username=" + username; 
}