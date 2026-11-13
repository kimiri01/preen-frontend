export function CurationSection() {
  return (
    <section>
      <h2>필요한 조건부터 골라보세요</h2>
      <div className="curations">
        <article>
          <img loading="lazy" src="/images/generated.png" alt="" />
          <div>
            <h3>독채로 사용하는 숙소</h3>
            <small>다른 투숙객과 공간을 나누지 않는 숙소</small>
            <button type="button">숙소 확인 →</button>
          </div>
        </article>
        <article>
          <img loading="lazy" src="/images/generated-1.png" alt="" />
          <div>
            <h3>바다가 보이는 객실</h3>
            <small>객실에서 바다를 볼 수 있는 숙소</small>
            <button type="button">숙소 확인 →</button>
          </div>
        </article>
      </div>
    </section>
  )
}
