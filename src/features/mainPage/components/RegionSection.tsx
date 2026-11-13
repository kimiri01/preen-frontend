export function RegionSection() {
  return (
    <section>
      <h2>어디로 떠나볼까요?</h2>
      <div className="grid-four regions">
        <article>
          <img
            loading="lazy"
            src="/images/generated.png"
            alt="제주 추천 숙소"
          />
          <div>
            <h3>제주</h3>
            <button type="button">숙소 보기 →</button>
          </div>
        </article>
        <article>
          <img
            loading="lazy"
            src="/images/generated-1.png"
            alt="강릉 추천 숙소"
          />
          <div>
            <h3>강릉</h3>
            <button type="button">숙소 보기 →</button>
          </div>
        </article>
        <article>
          <img
            loading="lazy"
            src="/images/generated-2.png"
            alt="경주 추천 숙소"
          />
          <div>
            <h3>경주</h3>
            <button type="button">숙소 보기 →</button>
          </div>
        </article>
        <article>
          <img
            loading="lazy"
            src="/images/generated-3.png"
            alt="양평 추천 숙소"
          />
          <div>
            <h3>양평</h3>
            <button type="button">숙소 보기 →</button>
          </div>
        </article>
      </div>
    </section>
  )
}
