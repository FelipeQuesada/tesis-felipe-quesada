/** Formas decorativas de fondo (solo visual; no afectan la grilla de contenido). */
export function HomeAmbientBg() {
  return (
    <div className="home-ambient" aria-hidden>
      <span className="home-ambient-blob home-ambient-blob--tl" />
      <span className="home-ambient-blob home-ambient-blob--tr" />
      <span className="home-ambient-blob home-ambient-blob--ml" />
      <span className="home-ambient-blob home-ambient-blob--mr" />
      <span className="home-ambient-blob home-ambient-blob--bl" />
      <span className="home-ambient-blob home-ambient-blob--br" />
      <span className="home-ambient-wash" />
    </div>
  );
}
