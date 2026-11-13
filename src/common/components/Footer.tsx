export function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-links">
            <strong>PREEN</strong>
            <nav aria-label="회사 안내">
              <button type="button">회사 소개</button>
              <button type="button">이용약관</button>
              <button type="button">개인정보처리방침</button>
              <button type="button">고객센터</button>
              <button type="button">입점 문의</button>
            </nav>
          </div>
          <small className="company">
            주식회사 프린 · 대표 김프린 · 서울특별시 성동구 프린로 24 (예시)
            <br />
            사업자등록번호 000-00-00000 · hello@preen.example
          </small>
        </div>
        <div className="contact">
          <p>고객센터 1544-0000</p>
          <small>평일 09:00–18:00 · 주말 및 공휴일 휴무</small>
        </div>
      </div>
      <small className="copyright">
        © 2026 PREEN. 숙소·요금·사업자·예약 정보는 디자인 시안을 위한
        예시입니다.
      </small>
    </footer>
  )
}
