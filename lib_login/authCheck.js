module.exports = {
    isOwner: function (request, response) {
      if (request.session.is_logined) {
        return true;
      } else {
        return false;
      }
    },
    statusUI: function (request, response) {
      var authStatusUI = '<div class="auth_item-login" align="center"><a class="nav-link" href="/auth/login">로그인</a></div>';
      if (this.isOwner(request, response)) {
        authStatusUI = `<div class="auth_item" align="center">
        <a class="nav-link" href="/auth/logout">로그아웃 &nbsp; </a>
        <a class="nav-link" href="/myinfo">마이페이지 &nbsp; </a>
        <a class="nav-link" href="/enroll/cart">장바구니</a>
        </div>
        `;
      }
      return authStatusUI;
    },
    kakao_statusUI: function (request, response) {
      var authStatusUI = `<div align="right"><a href="/auth/login"
      >로그인</a></div>`;
      if (this.isOwner(request, response)) {
        authStatusUI = `
        <div align="right">${request.session.nickname}님 환영합니다 
        <a id="kakao-logout-btn" href="/auth/kakao/logout">
        로그아웃
        </a>
        <a href="/myinfo"
        >마이페이지</a>
        </div>
        `;
      }
      return authStatusUI;
    }
  }