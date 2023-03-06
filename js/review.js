let review_list = {
    recommand_change_num : function(point) {
        const reg = /[\{\}\[\]\/?,;:|\)*~`!^\-_+<>\#$%&\\\=\(\']/gi;
        var num = Number(document.getElementById('p_num'+point).innerText);
        var button = document.getElementById('p_button'+point)
        button.disabled = true;
        var new_num = num + 1;
        document.getElementById('p_num'+point).innerText = new_num;
        var order = document.getElementById('number'+point).getAttribute('value')
        
        $.ajax({
            type: "post", 
            url: "/review/increase_recommand",
            dataType: "json",
            data: {
                Order : order,
                New_num: new_num,
            },
        })
    },
    name : function(){
        var str = document.getElementById('name'+point).innerText;
		let originStr = str;
		let maskingStr;
		let strLength;
		if(this.checkNull(originStr) == true){
			return originStr;
		}
		strLength = originStr.length;
		if(strLength < 3){
			maskingStr = originStr.replace(/(?<=.{1})./gi, "*");
		}else {
			maskingStr = originStr.replace(/(?<=.{2})./gi, "*");
		}
        document.getElementById('name'+point).innerText = maskingStr;
	},
}
Number.prototype.formatNumber = function(){
    if(this==0) return 0;
    let regex = /(^[+-]?\d+)(\d{3})/;
    let nstr = (this + '');
    while (regex.test(nstr)) nstr = nstr.replace(regex, '$1' + ',' + '$2');
    return nstr;
  };
