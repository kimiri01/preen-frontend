export function SearchSection() {
  return (
    <section className="search-section" aria-label="검색과 카테고리">
      <div className="search">
        <button type="button" className="search-field">
          <small>여행 지역</small>
          <span>지역 또는 숙소명</span>
        </button>
        <button type="button" className="search-field">
          <small>체크인 · 체크아웃</small>
          <span>11.20 (금) — 11.21 (토)</span>
        </button>
        <button type="button" className="search-field">
          <small>인원 · 객실</small>
          <span>성인 2명 · 객실 1개</span>
        </button>
        <button type="button" className="search-submit">
          검색하기
        </button>
      </div>
      <nav className="categories" aria-label="숙박 유형">
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-1.png" alt="" />
          </span>
          전체 숙소
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-2.png" alt="" />
          </span>
          호텔·리조트
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-3.png" alt="" />
          </span>
          독채·풀빌라
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-4.png" alt="" />
          </span>
          한옥
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-5.png" alt="" />
          </span>
          감성 스테이
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-6.png" alt="" />
          </span>
          게스트하우스
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-7.png" alt="" />
          </span>
          이번 주말
        </button>
        <button type="button">
          <span className="category-image">
            <img src="/images/category-signature-8.png" alt="" />
          </span>
          지역으로 찾기
        </button>
      </nav>
    </section>
  )
}
