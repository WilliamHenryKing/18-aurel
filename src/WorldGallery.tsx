import { useState } from "react";

export function WorldGallery() {
  const [detail, setDetail] = useState(false);
  const src = detail ? "/images/aurel-timber-study" : "/images/aurel-world";
  return (
    <figure className="world-gallery">
      <div className="world-image">
        <picture>
          <source media="(max-width: 680px)" srcSet={`${src}-mobile.webp`} />
          <img
            src={`${src}.webp`}
            width="3200"
            height="2000"
            loading="lazy"
            decoding="async"
            alt={
              detail
                ? "Close view of deep timber flutes, honed stone and crafted joinery"
                : "A walnut-lined living room opens through bronze-framed glazing onto a layered garden"
            }
          />
        </picture>
        <div className="material-aperture" aria-hidden="true" />
      </div>
      <figcaption>
        <span>
          {detail ? "Timber, stone and the quiet between." : "A garden room, made for living."}
        </span>
        <fieldset className="world-view-controls" aria-label="Architectural render view">
          <button type="button" aria-pressed={!detail} onClick={() => setDetail(false)}>
            The space
          </button>
          <button type="button" aria-pressed={detail} onClick={() => setDetail(true)}>
            The detail
          </button>
        </fieldset>
      </figcaption>
    </figure>
  );
}
