
let basket = {
    totalCount: 0, 
    totalPrice: 0,
    totalPoint: 0,
    original_price : 0,
    count :0,
    Constructor : function() {
        var op = document.getElementById('point');
        op = Number(op.innerText.replaceAll(",", ""));
        this.original_price = op;
    },
    
        //체크한 장바구니 상품 비우기
    delCheckedItem: function(){
        document.querySelectorAll("input[name=buy]:checked").forEach(function (item) {
            item.parentElement.parentElement.remove();
        });
        //AJAX 서버 업데이트 전송
    
        //전송 처리 결과가 성공이면
        this.reCalc(this.original_price);
        this.updateUI();
    },
    //장바구니 전체 비우기
    delAllItem: function(){
        document.querySelectorAll('.cart__list__detail').forEach(function (item) {
            item.remove();
          });
          //AJAX 서버 업데이트 전송
        
          //전송 처리 결과가 성공이면
          this.totalCount = 0;
          this.totalPrice = 0;
          this.reCalc(this.original_price);
          this.updateUI();
    },
    //재계산
    reCalc: function(inital_point){
        if(this.count == 0) {
            this.original_price = inital_point;
            this.count++;
        }
        this.totalCount = 0;
        this.totalPrice = 0;
        this.totalPoint = inital_point;
        document.querySelectorAll(".p_num").forEach(function (item) {
            if(item.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild.checked == true){
                var use_point = item.parentElement.parentElement.parentElement.nextElementSibling.firstElementChild.getAttribute('value');
                if(use_point == null) use_point = 0;
                this.totalPoint = parseInt(this.totalPoint) -  parseInt(use_point);
                var count = parseInt(item.getAttribute('value'));
                if(isNaN(count)) count = 0;
                this.totalCount += count;
                var price = item.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.getAttribute('value');
                this.totalPrice += count * price - use_point;
            }
        }, this); 
    },
    //화면 업데이트
    updateUI: function () {
        document.querySelector('#sum_p_num').textContent = '총 강의 횟수 : ' + this.totalCount.formatNumber() + '번';
        document.querySelector('#sum_p_price').textContent = '총 합계금액 : ' + this.totalPrice.formatNumber() + '원';
        document.querySelector('#point').textContent = this.totalPoint.formatNumber();
    },
    //개별 수량 변경
    
    checkItem: function () {
        this.reCalc(this.original_price);
        this.updateUI();
    },
    delItem: function () {
        alert(event.target.parentElement.parentElement.parentElement)
        event.target.parentElement.parentElement.parentElement.remove();
        this.reCalc(this.original_price);
        this.updateUI();
    },
    Show : function() {
        this.reCalc();
        this.updateUI();
    },
    Point : function(point){
        var item = document.querySelector('input[name=p_point'+point+']');
        item.addEventListener("keyup", function (e) {
            e.target.value =  e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
            item.setAttribute('value',e.target.value);
        })
    },
    changePNum: function (pos) {
        var item = document.querySelector('input[name=p_num'+pos+']');
        item.addEventListener("keyup", function (e) {
            e.target.value =  e.target.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
            item.setAttribute('value',e.target.value);
        })
        var p_num = parseInt(item.getAttribute('value'));
        var newval = event.target.classList.contains('up') ? p_num+1 : event.target.classList.contains('down') ? p_num-1 : event.target.value;
        if (parseInt(newval) < 1 || parseInt(newval) > 99) { return false; }
        item.setAttribute('value', newval);
        item.value = newval;
        var price = item.parentElement.parentElement.previousElementSibling.firstElementChild.getAttribute('value');
        item.parentElement.parentElement.nextElementSibling.textContent = (newval * price).formatNumber()+"원";
        //AJAX 업데이트 전송

        //전송 처리 결과가 성공이면    
        this.reCalc(this.original_price);
        this.updateUI();
    },
    Point_use : function(point){
        var item = document.querySelector('input[name=p_point'+point+']');
        var item_button = document.getElementById('p_point_button'+point)
        var point = item.getAttribute('value');
        var item_point = document.getElementById('point');
        point = Number(point.replaceAll(",", ""));
        item_point = Number(item_point.innerText.replaceAll(",", ""));
        if(point > item_point) alert("포인트 초과");
        else{
            item_button.disabled=true;
            item_point -= point;
            document.querySelector('#point').textContent = item_point.toLocaleString("ko-KR");
            this.reCalc(this.original_price);
            this.updateUI();
        }
    }
}

// 숫자 3자리 콤마찍기
Number.prototype.formatNumber = function(){
    if(this==0) return 0;
    let regex = /(^[+-]?\d+)(\d{3})/;
    let nstr = (this + '');
    while (regex.test(nstr)) nstr = nstr.replace(regex, '$1' + ',' + '$2');
    return nstr;
};