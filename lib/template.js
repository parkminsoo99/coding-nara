var sanitizeHtml = require('sanitize-html');
module.exports = {
  list:function(topics){
    var list = '';
    var i = 0;
    console.log(topics)
    while(i < topics.length){
      list = list + `<tr>
                    <td><a href="/review/page/${topics[i].Review_ID}">${i+1}</a></td>
                    <th>
                    <a href="/review/page/${topics[i].Review_ID}">
                    ${topics[i].Title}
                    </a>
                    </th>
                    <td>${topics[i].Create_at}</a></td>
                    </tr>`;
      i = i + 1;
    }
    list = list+'';
    return list;
  },authorSelect:function(authors, author_id, nickname){
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
    var list = '<ol class="mylist">';
    var i = 0;
    console.log('topics', topics);
    while(i < topics.length){
      list = list + `
      <li>
        <a href="/enroll/${sanitizeHtml(topics[i].Teacher_ID)}/${sanitizeHtml(topics[i].Course_ID)}/${sanitizeHtml(topics[i].DATE_ID)}/${sanitizeHtml(topics[i].TIME_ID)}"> 
            <div>
            <p>Name :  ${sanitizeHtml(topics[i].Name)} </p>
            </div>
            <div align="center"> Course_ID : ${sanitizeHtml(topics[i].Subject)}</div>
            <div align="right"><p>Time_ID : ${sanitizeHtml(topics[i].Available_Start_Time)} Date_ID : ${sanitizeHtml(topics[i].Available_DATE)} </p></div>
          </a>
       </li>
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
  }

}