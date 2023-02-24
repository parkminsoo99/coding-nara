var sanitizeHtml = require('sanitize-html');
module.exports = {
  list:function(topics){
    var list = '';
    var i = 0;
    while(i < topics.length){
      list = list + `<tr>
                    <td><span id="number${i}" href="/review/page/${topics[i].Review_ID}">${topics[i].Review_ID}</span></td>
                    <td>
                      ${topics[i].Order_subject}
                    </td>
                    <td>
                      <a href="/review/page/${topics[i].Review_ID}">
                      ${topics[i].Title}
                      </a>
                    </td>
                    <td>${topics[i].Create_at}</td>
                    <td id="name${i}" >${topics[i].Name}</td>
                    <td>
                      <div style="display:flex;justify-content : center;flex-direction: column;">
                        <button id="p_button${i}" style="border: none; background-color:transparent;"onclick="javascript:review_list.recommand_change_num(${i});"><i class="bi bi-heart fs-3 text-primary"></i></button>
                        <span name="p_num${i}" id="p_num${i}" class="p_num">${topics[i].Recommand_Count}</span>
                      </div>
                    </td>
                    </tr>
                    `
                    ;
      i = i + 1;
    }
    list = list+'';
    return list;
  },page_list:function(Count){
    var list = '';
    var i = 0;
    var length = Number((Count[0].c) / 10);
    while(i < length){
      list = list + `
                    <li class="page-item"><a href="/review/${i+1}" class="page-link">${i+1}</a></li>
                    `
                    ;
      i = i + 1;
    }
    list = list+'';
    return list;
  },
  lecture_list:function(lecture){
    var list = '';
    var i = 0;
    while(i < lecture.length){
      list = list + `
                    <tr>
                    <td>${lecture[i].Subject}</td>
                    <td>${lecture[i].Available_Start_Time} ${lecture[i].Available_DATE}</td>
                    <td>${lecture[i].Decrease_Count} </td>
                    <td>${lecture[i].Name}</td>
                    <td>
                      <a href="/review/create"><i class="bi bi-pencil fs-3 text-primary"></a></i>
                    </td>
                    <td>
                      <a href="/room"><i class="bi bi-tv fs-2 text-primary"></a></i>
                    </td>
                    <td>
                    <div id="div${i}" style="display:none;">${lecture[i].Course_Code}</div>
                    <div id="btn_div_copy${i}" onclick="javascript:mypage_list.copy(${i})"><i class="bi bi-clipboard fs-3 text-primary"></i></div>
                    </td>
                    </tr>
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  },payment_list:function(lecture){
    var list = '';
    var i = 0;
    while(i < lecture.length){
      list = list + `
                    <tr>
                    <td><span>${lecture[i].Subject}</span></td>
                    <td><span>${lecture[i].Available_Start_Time} ${lecture[i].Available_DATE}</span></td>
                    <td><span>${lecture[i].Count}</span> </td>
                    <td><span>${lecture[i].Name}</span></td>
                    <td>
                      <span>${lecture[i].Payment_Time}</span>
                    </td>
                    <td>
                      <button formmethod="get" id="refund_button${i}" class="btn btn-danger" onclick="javascript:mypage_list.refund_button(${i})">환불</button> 
                    </td>
                    </tr>
                    
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  },
  cart_list:function(lecture){
    var list = '';
    var i = 0;
    while(i < lecture.length){
      list = list + `
                      <tr class="cart__list__detail">
                        <td class="checkBox">
                          <input type="checkbox" name="buy" value="260" checked="" onclick="javascript:basket.checkItem();"/>
                        </td>

                        <td>
                          <img src="../image/logo_mini.png" style="height:30px;width:30px;"alt="${lecture[i].Subject}"> 
                        </td>
                        
                        <td>
                          <div class="information">
                            <span class="cart__list__smartstore" id="subject"><p>${lecture[i].Subject}</p></span>
                            <p id="instructor">${lecture[i].Name}</p>
                            <span class="class_time"><span>${lecture[i].Available_Start_Time} ${lecture[i].Available_DATE}</span>
                          </div>
                        </td>

                        <td class="Count_Check">
                          <div class="basketprice"><input type="hidden" name="p_price" id="p_price1" class="p_price" value="${lecture[i].Price}"></div>
                            <div class="num">
                              <div class="updown">
                                <span onclick="javascript:basket.changePNum(${i});"><i class="bi bi-arrow-left-short fs-6 text-primary down"></i></span>
                                <input type="text" name="p_num${i}" id="p_num${i}" min="1" max="999" size="3" maxlength="3" class="p_num" value="${lecture[i].Count}" onkeyup="javascript:basket.changePNum(${i});"/>
                                <span onclick="javascript:basket.changePNum(${i});"><i class="bi bi-arrow-right-short fs-6 text-primary up"></i></span>
                              </div>
                            </div>
                          <div class="sum">${(lecture[i].Price * lecture[i].Count).toLocaleString("ko-KR")}<span>원</span></div>
                        </td>

                        <td>
                          <input type="text" name="p_point${i}" id="p_point${i}" class="p_point" size="7" maxlength="7" onkeyup="javascript:basket.Point(${i});"/>
                          <button name="p_point_button${i}" id="p_point_button${i}" onClick="javascript:basket.updateUI(); basket.Point_use(${i});">포인트 적용</button>
                        </td>
                      </tr>
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  },
  authorSelect:function(authors, author_id, nickname){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(authors[i].Student_ID === author_id) {
        selected = ' selected';
      }
      if(authors[i].Login_ID === nickname){
      tag += `<option value="${authors[i].Student_ID}"${sanitizeHtml(selected)}>${authors[i].Login_ID}</option>`;
      }
      i++;
    }
    return `
      <select name="author_id">
        ${tag}
      </select>
    `
  },Enroll_list : function(topics){
    var list = '';
    var i = 0;
    while(i < topics.length){
      list = list + `
      <tr>
      <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">${i+1}</a></td> 
            <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">
            ${sanitizeHtml(topics[i].Name)}
            </a>
            </td>
            
            <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">
            ${sanitizeHtml(topics[i].Subject)}
            </a>
            </td>
            <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">
            ${sanitizeHtml(topics[i].Available_Start_Time)}${sanitizeHtml(topics[i].Available_DATE)}
            </a></td>
        </tr>
       `;
      i = i + 1;
    }
    list = list+'</ol>';
    return list;
  }
  ,create_auth:function(authors, author_id, nickname){
      var i = author_id;
      if(authors[i-1].Login_ID === nickname ) {
        return``
      }
    return `
    <script type="text/javascript">alert("권한이 없습니다.");
    document.location.href="/review";
    </script>
    `
  },authorSelect_create:function(authors, nickname){
    var tag = '';
    var i = 0;
    while(i < authors.length){
      var selected = '';
      if(authors[i].Login_ID === nickname) {
        selected = ' selected';
      }
      if(authors[i].Login_ID === nickname){
      tag += `<option value="${authors[i].Student_ID}"${selected}>${authors[i].Login_ID}</option>`;
      }
      i++;
    }
    return `
      <select  name="author_id">
        ${tag}
      </select>
    `
  },Update_list : function(topics){
    var list = '';
    var i = 0;
    while(i < topics.length){
      list = list + `
      <tr>
      <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">${i+1}</a></td> 
            <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">
            ${sanitizeHtml(topics[i].Name)}
            </a>
            </td>
            
            <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">
            ${sanitizeHtml(topics[i].Phone_Number)}
            </a>
            </td>
            <td><a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}">
            ${sanitizeHtml(topics[i].Email_Address)}${sanitizeHtml(topics[i].Available_DATE)}
            </a></td>
        </tr>
       `;
      i = i + 1;
    }
    list = list+'</ol>';
    return list;
  },lecture_list_instructor:function(lecture){
    var list = '';
    var i = 0;
    while(i < lecture.length){
      list = list + `
                    <tr>
                    <td>${lecture[i].Subject}</td>
                    <td>${lecture[i].Available_DATE}</td>
                    <td>${lecture[i].Available_Start_Time} </td>
                    <td>${lecture[i].Name} </td>
                    <td>${lecture[i].Increase_Count}</td>
                    <td>${lecture[i].Decrease_Count}</td>
                    <td>${lecture[i].Max_Count}</td>
                    <td>
                    <form action="/myinfo/instructor/increase" method="post">
                    <input type="hidden" name="course" value="${lecture[i].Course_ID}" />
                    <input type="hidden" name="date" value="${lecture[i].DATE_ID}" />
                    <input type="hidden" name="time" value="${lecture[i].TIME_ID}" />
                    <input type="hidden" name="Teacher_ID" value="${lecture[i].Teacher_ID}" />
                    <input type="hidden" name="Student_ID" value="${lecture[i].Student_ID}" />

                    <input type="hidden" name="Course_Active" value="${lecture[i].Course_Active}" />
                    <input type="hidden" name="Max" value="${lecture[i].Max_Count}" />
                    <input type="hidden" name="Decrease" value="${lecture[i].Decrease_Count}" />
                    <input type="hidden" name="Increase" value="${lecture[i].Increase_Count}" />
                    <button type="submit" id="lecture" class="btn btn-dark">강의완료</button>
                  </form>
                    </td>
                    <td>
                      <a href="/room"><i class="bi bi-tv fs-2 text-primary"></a></i>
                    </td>
                    <td>
                    <div id="div" style="display:none;">${lecture[i].Course_Code}</div>
                    <div id="btn_div_copy"><i class="bi bi-clipboard fs-3 text-primary"></i></div>
                    </td>
                    </tr>
                    <script>
                    if(${lecture[i].Increase_Count} == ${lecture[i].Max_Count})
                    {
                     document.getElementById("lecture").innerHTML = "<b>" + "강의삭제" + "</b>";

                      

                    }
                    window.onload = function () {

                      var el = document.getElementById("my-div");
                
                      el.onclick = copy;
                
                    }
                    document.getElementById("btn_div_copy").onclick = function copy(){
                      // div 내부 텍스트 취득
                      const valOfDIV = document.getElementById("div").innerText;
              
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
                    }
                    </script>
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  },lecture_list_history:function(lecture){
    var list = '';
    var i = 0;
    const c='C언어'
    while(i < lecture.length){
      list = list + `
                    <tr>
                    <td>${i+1}</td>
                    <td>${lecture[i].Name}</td>
                    <td>${lecture[i].Subject}</td>
                    <td>${lecture[i].Available_DATE} </td>
                    <td>${lecture[i].Available_Start_Time}</td>
                    <td>${lecture[i].Complete_time}</td>
                    </tr>
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  },lecture_list_history_instructor:function(lecture){
    var list = '';
    var i = 0;
    const c='C언어'
    while(i < lecture.length){
      list = list + `
                    <tr>
                    <td>${i+1}</td>
                    <td>${lecture[i].Name}</td>
                    <td>${lecture[i].Subject}</td>
                    <td>${lecture[i].Available_DATE} </td>
                    <td>${lecture[i].Available_Start_Time}</td>
                    <td>${lecture[i].Complete_time}</td>
                    </tr>
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  },lecture_list_instructor_update:function(lecture){
    var list = '';
    var i = 0;
    const c='C언어'
    while(i < lecture.length){
      list = list + `
                    <tr>
                    <td><a href="/myinfo/instructor/update/${lecture[i].Course_ID}/${lecture[i].DATE_ID}/${lecture[i].TIME_ID}">${i+1}</a></td>
                    <td>${lecture[i].Subject}</td>
                    <td>${lecture[i].Available_DATE}</td>
                    <td>${lecture[i].Available_Start_Time} </td>
                    <td>${lecture[i].Course_Active}</td>
                    <td>
                    <form action="/myinfo/instructor/update/delete" method="post">
                      <input type="hidden" name="course" value="${lecture[i].Course_ID}" />
                      <input type="hidden" name="date" value="${lecture[i].DATE_ID}" />
                      <input type="hidden" name="time" value="${lecture[i].TIME_ID}" />
                      <input type="hidden" name="Teacher_ID" value="${lecture[i].Teacher_ID}" />
                      <input type="submit" value="삭제" />
                    </form>
                    </td>
                    </tr>
                    `;
      i = i + 1;
    }
    list = list+'';
    return list;
  }

}
