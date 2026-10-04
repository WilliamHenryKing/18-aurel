import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Component, lazy, type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { type Project, process, projects } from "./content";
import Icon from "./Icon";
import { WorldGallery } from "./WorldGallery";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const LightStudy = lazy(() => import("./LightStudy"));
const Arrow = () => (
  <span className="icon-wrap">
    <Icon />
  </span>
);
const readRoute = () => window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "") || "home";

function Picture({
  name,
  alt,
  className = "",
  eager = false,
}: {
  name: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <picture className={className}>
      <source
        media="(max-width: 640px)"
        srcSet={`/images/${name === "aurel-hero" ? (eager ? "aurel-hero" : "aurel-hero-mobile") : `${name}-small`}.webp`}
      />
      <img
        src={`/images/${name}.webp`}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
      />
    </picture>
  );
}

function ProjectLink({ project, className = "" }: { project: Project; className?: string }) {
  return (
    <a className={`project-link ${className}`} href={`#/projects/${project.slug}`}>
      <div className="project-image">
        <Picture name={project.image} alt={project.alt} />
        <span className="image-open">
          <Arrow />
        </span>
      </div>
      <div className="project-caption">
        <div>
          <h3>{project.title}</h3>
          <p className="project-meta">
            {project.category} / {project.place}
          </p>
        </div>
        <Arrow />
      </div>
    </a>
  );
}

/** A failed late chunk (offline, or a replaced deployment) must not blank the whole page. */
class StudyBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function DeferredLightStudy({ motion, direct }: { motion: boolean; direct: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(direct);
  useEffect(() => {
    if (direct) {
      setActive(true);
      return;
    }
    if (active || !slot.current) return;
    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );
    observer.observe(slot.current);
    return () => observer.disconnect();
  }, [active, direct]);
  const placeholder = (
    <div className="study-loading">
      <div className="study-placeholder-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>Light, stone and proportion.</p>
      <span>
        {active
          ? "Preparing the interactive pavilion."
          : "An interactive study of light and material."}
      </span>
    </div>
  );
  const unavailable = (
    <div className="study-loading">
      <div className="study-placeholder-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>Light, stone and proportion.</p>
      <span>The interactive pavilion could not load. Refresh the page to try again.</span>
    </div>
  );
  return (
    <div className="study-deferred" ref={slot} data-loaded={active}>
      {active ? (
        <StudyBoundary fallback={unavailable}>
          <Suspense fallback={placeholder}>
            <LightStudy motion={motion} />
          </Suspense>
        </StudyBoundary>
      ) : (
        placeholder
      )}
    </div>
  );
}

function Home({ motion, directLight }: { motion: boolean; directLight: boolean }) {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <Picture
          className="hero-image"
          name="aurel-hero"
          alt={projects[0]?.alt ?? "Architecture at dusk"}
          eager
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <h1 id="hero-title">
            <span>Space, </span>
            <span className="hero-title-second">
              deeply <i>felt.</i>
            </span>
          </h1>
          <p className="hero-prelude">A dialogue between light, material and life.</p>
        </div>
        <div className="hero-bottom">
          <a className="text-link" href="#/projects">
            Explore the work <Arrow />
          </a>
          <p>
            Spaces to live in.
            <br />
            Places to feel.
          </p>
          <a
            className="scroll-link"
            href="#/light"
            aria-label="Explore the interactive light study"
          >
            <span>Discover below</span>
            <span className="icon-wrap">
              <Icon name="down" />
            </span>
          </a>
        </div>
      </section>
      <section className="introduction section-pad">
        <div className="introduction-main">
          <h2>
            Good spaces are seen.
            <br />
            <span>
              Great spaces are <i>felt.</i>
            </span>
          </h2>
          <div className="intro-bottom">
            <p>
              We explore architecture from the inside out. The way light falls. The warmth of a
              surface. The quiet balance of a room. Spaces with a lasting sense of belonging.
            </p>
            <a className="text-link" href="#/studio">
              Inside the studio <Arrow />
            </a>
          </div>
        </div>
      </section>
      <section className="selected section-pad" aria-labelledby="selected-title">
        <div className="section-heading">
          <div>
            <h2 id="selected-title">
              Places with <i>presence.</i>
            </h2>
          </div>
          <a className="text-link" href="#/projects">
            View all studies
            <Arrow />
          </a>
        </div>
        <div className="selected-grid">
          {projects.slice(0, 3).map((p, i) => (
            <ProjectLink key={p.slug} project={p} className={`project-${i}`} />
          ))}
        </div>
      </section>
      <section className="light-section" id="light-study" aria-labelledby="light-title">
        <div className="light-heading section-pad">
          <div>
            <h2 id="light-title">
              One space.
              <br />
              <i>Infinite feeling.</i>
            </h2>
            <p>
              Light changes everything. Step inside a small architectural study and explore how an
              hour, a surface, a shadow can transform a room.
            </p>
          </div>
        </div>
        <DeferredLightStudy motion={motion} direct={directLight} />
      </section>
      <section className="material-section" aria-labelledby="material-title">
        <div className="material-heading section-pad">
          <h2 id="material-title">
            The difference
            <br />
            is in the <i>detail.</i>
          </h2>
          <div>
            <p>
              The best details don’t ask for attention. You notice them in the way a door closes,
              how a hand meets a rail, or the soft edge of afternoon light.
            </p>
            <a className="text-link" href="#/studio">
              Our approach <Arrow />
            </a>
          </div>
        </div>
        <div className="material-figure section-pad">
          <WorldGallery />
        </div>
      </section>
      <Invitation />
    </>
  );
}

function Invitation() {
  return (
    <section className="invitation section-pad">
      <a href="#/enquiry" className="invitation-link">
        <span>
          What could
          <br />
          your space <i>be?</i>
        </span>
        <span className="invitation-arrow" aria-hidden="true">
          <Icon />
        </span>
      </a>
      <p className="invitation-note">A little thought. A new possibility.</p>
    </section>
  );
}

function Work() {
  const [filter, setFilter] = useState("All");
  const visible = projects.filter((p) => filter === "All" || p.category === filter);
  return (
    <>
      <section className="page-heading section-pad">
        <h1>
          Considered spaces.
          <br />
          <i>Lasting impressions.</i>
        </h1>
        <div className="page-intro">
          <p>
            A collection of speculative studies in architecture, interiors and the details that
            bring them together.
          </p>
          <span className="collection-count">Four concept studies</span>
        </div>
      </section>
      <section className="work-section section-pad" aria-label="Project studies">
        <fieldset className="filter-row" aria-label="Filter studies">
          {["All", "Architecture", "Interiors", "Finishing"].map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={filter === item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </fieldset>
        <p className="sr-only" aria-live="polite">
          {visible.length} studies shown
        </p>
        <div className="work-grid">
          {visible.map((p) => (
            <ProjectLink key={p.slug} project={p} />
          ))}
        </div>
      </section>
      <Invitation />
    </>
  );
}

function Detail({ project }: { project: Project }) {
  const next = projects[(projects.indexOf(project) + 1) % projects.length] ?? projects[0];
  return (
    <>
      <section className="detail-heading section-pad">
        <a className="back-link" href="#/projects">
          <Icon name="left" /> All studies
        </a>
        <div>
          <h1>{project.title}</h1>
          <p className="detail-idea">{project.idea}</p>
        </div>
        <span className="meta-label">Concept / {project.year}</span>
      </section>
      <div className="detail-hero">
        <Picture name={project.image} alt={project.alt} eager />
      </div>
      <section className="detail-body section-pad">
        <div className="detail-facts">
          <div>
            <span className="meta-label">Discipline</span>
            <p>{project.category}</p>
          </div>
          <div>
            <span className="meta-label">Exploration</span>
            <p>{project.place}</p>
          </div>
          <div>
            <span className="meta-label">Palette</span>
            <p>{project.material}</p>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <p>Speculative concept study</p>
          </div>
        </div>
        <div>
          <h2>
            A feeling,
            <br />
            <i>made tangible.</i>
          </h2>
          <p className="detail-description">{project.description}</p>
          <p className="image-disclosure">{project.imageNote}</p>
          <a className="text-link" href="#/enquiry">
            Explore your own brief <Arrow />
          </a>
        </div>
      </section>
      {next && (
        <a className="next-project section-pad" href={`#/projects/${next.slug}`}>
          <span className="meta-label">Next study</span>
          <span>{next.title}</span>
          <Arrow />
        </a>
      )}
    </>
  );
}

function Studio() {
  return (
    <>
      <section className="page-heading studio-heading section-pad">
        <h1>
          Less noise.
          <br />
          <i>More meaning.</i>
        </h1>
        <div className="page-intro">
          <p>
            AUREL is a fictional design practice exploring a simple idea: the most memorable spaces
            make us feel something.
          </p>
        </div>
      </section>
      <div className="studio-image">
        <Picture
          name="stair-hall"
          alt="A sculptural travertine staircase under a slender skylight"
          eager
        />
        <p>
          Between structure and feeling,
          <br />
          there is a world of possibility.
        </p>
      </div>
      <section className="studio-belief section-pad">
        <h2>
          We believe in spaces
          <br />
          that grow <i>closer</i>
          <br />
          with time.
        </h2>
        <p>
          A surface that becomes more beautiful with use. A room that changes with the seasons. A
          plan that understands how life unfolds. Our studies begin with these everyday,
          extraordinary things.
        </p>
      </section>
      <section className="process-section section-pad">
        <div className="section-heading">
          <div>
            <h2>
              A considered <i>process.</i>
            </h2>
          </div>
        </div>
        {process.map((item) => (
          <article className="process-row" key={item.number}>
            <div>
              <h3>{item.title}</h3>
              <p className="meta-label">{item.subtitle}</p>
            </div>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>
      <Invitation />
    </>
  );
}

function Enquiry() {
  const [space, setSpace] = useState("A new home");
  const [feeling, setFeeling] = useState("Calm & grounded");
  const [notes, setNotes] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const download = (event: React.FormEvent) => {
    event.preventDefault();
    const text = `AUREL — A first thought\n\nYOUR SPACE\n${space}\n\nYOUR ATMOSPHERE\n${feeling}\n\nYOUR NOTES\n${notes.trim() || "Still taking shape."}\n\nNEXT THOUGHTS\nWhat should everyday life feel like here?\nWhere does the best natural light enter?\nWhich materials do you love to touch?\n\nCreated locally in the AUREL concept website. Nothing was sent or stored. This is a personal starting brief, not a service enquiry or professional specification.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "aurel-first-thought.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  };
  return (
    <section className="enquiry section-pad">
      <div className="enquiry-intro">
        <h1>
          Begin with
          <br />a <i>feeling.</i>
        </h1>
        <p>
          You don’t need all the answers.
          <br />
          Just an idea of what could be.
        </p>
        <div className="enquiry-note">
          <p>
            This is an interactive concept studio. Build a brief to keep for yourself. It downloads
            to your device; nothing is sent, stored or submitted.
          </p>
        </div>
      </div>
      <form className="brief-form" onSubmit={download}>
        <fieldset>
          <legend>What are you imagining?</legend>
          <div className="choice-grid">
            {["A new home", "A renewed interior", "The finishing details", "Something else"].map(
              (item) => (
                <label key={item} className={space === item ? "selected" : ""}>
                  <input
                    type="radio"
                    name="space"
                    value={item}
                    checked={space === item}
                    onChange={() => {
                      setSpace(item);
                      setDownloaded(false);
                    }}
                  />
                  {item}
                </label>
              ),
            )}
          </div>
        </fieldset>
        <div className="form-field">
          <label htmlFor="feeling">How should it feel?</label>
          <select
            id="feeling"
            value={feeling}
            onChange={(e) => {
              setFeeling(e.target.value);
              setDownloaded(false);
            }}
          >
            {["Calm & grounded", "Warm & welcoming", "Open & luminous", "Bold & expressive"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="notes">
            Anything on your mind? <small>(Optional)</small>
          </label>
          <textarea
            id="notes"
            maxLength={2000}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setDownloaded(false);
            }}
            placeholder="A favourite material, a daily ritual, a possibility…"
            rows={4}
          />
          <p className="form-help">Keep this about the space. No personal details needed.</p>
        </div>
        <button type="submit" className="brief-submit">
          Save my first thought{" "}
          <span className="icon-wrap">
            <Icon name="down" />
          </span>
        </button>
        <p className="download-status" role="status">
          {downloaded
            ? "Your brief is ready in your downloads. Nothing was sent."
            : "A small text file. Yours to keep and build on."}
        </p>
      </form>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(() => {
    try {
      return (
        localStorage.getItem("aurel-motion") !== "off" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch {
      return false;
    }
  });
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const project = route.startsWith("projects/")
    ? projects.find((p) => p.slug === route.split("/")[1])
    : undefined;
  const known =
    ["home", "projects", "studio", "enquiry", "light"].includes(route) || Boolean(project);
  const home = route === "home" || route === "light";

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      setMenu(false);
    };
    const onNavigationClick = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>(".site-header a")
          : null;
      if (link) {
        setMenu(false);
        if (link.hash === location.hash) document.querySelector<HTMLElement>("main")?.focus();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuButton.current?.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduce = () => {
      if (media.matches) setMotion(false);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onNavigationClick);
    window.addEventListener("keydown", onKey);
    media.addEventListener("change", onReduce);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onNavigationClick);
      window.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onReduce);
    };
  }, []);

  useEffect(() => {
    document.title = project
      ? `${project.title} — AUREL`
      : `${route === "home" || route === "light" ? "Space, deeply felt." : route === "projects" ? "Selected studies" : route === "studio" ? "The studio" : route === "enquiry" ? "A first thought" : "Page not found"} — AUREL`;
    const timeout = window.setTimeout(() => {
      if (route === "light")
        document.getElementById("light-study")?.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
      document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
      ScrollTrigger.refresh();
    }, 30);
    return () => window.clearTimeout(timeout);
  }, [route, project]);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  useGSAP(
    () => {
      if (!motion) return;
      if (home && route !== "light") {
        gsap.from(".hero-image", { scale: 1.025, duration: 1.25, ease: "power2.out" });
        const material = root.current?.querySelector(".world-image");
        if (material) {
          const sequence = gsap.timeline({
            scrollTrigger: { trigger: material, start: "top 82%", once: true },
            defaults: { ease: "expo.out" },
          });
          sequence
            .fromTo(".material-aperture", { scaleX: 1 }, { scaleX: 0, duration: 0.85 })
            .from(".world-image img", { scale: 1.045, duration: 1.2 }, 0)
            .from(".world-gallery figcaption", { opacity: 0.35, duration: 0.45 }, 0.5);
        }
      }
    },
    { scope: root, dependencies: [route, motion], revertOnUpdate: true },
  );

  const toggleMotion = () => {
    setMotion((value) => {
      try {
        localStorage.setItem("aurel-motion", value ? "off" : "on");
      } catch {}
      return !value;
    });
  };
  return (
    <div ref={root} className={`app ${home ? "is-home" : "is-inner"}`}>
      <button
        type="button"
        className="skip-link"
        onClick={() => {
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </button>
      <header className={`site-header ${menu ? "menu-open" : ""}`}>
        <a href="#/" className="wordmark" aria-label="Aurel home">
          AUREL
        </a>
        <span className="header-description">Spaces with soul.</span>
        <button
          className="menu-toggle"
          ref={menuButton}
          type="button"
          aria-expanded={menu}
          aria-controls="primary-nav"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close" : "Menu"}
          <Icon name={menu ? "close" : "menu"} />
        </button>
        <nav id="primary-nav" className={menu ? "open" : ""} aria-label="Primary navigation">
          <a href="#/projects" aria-current={route.startsWith("projects") ? "page" : undefined}>
            The work
          </a>
          <a href="#/studio" aria-current={route === "studio" ? "page" : undefined}>
            The studio
          </a>
          <a
            href="#/enquiry"
            className="nav-enquiry"
            aria-current={route === "enquiry" ? "page" : undefined}
          >
            Begin a conversation <Arrow />
          </a>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        {home ? (
          <Home motion={motion} directLight={route === "light"} />
        ) : project ? (
          <Detail project={project} />
        ) : route === "projects" ? (
          <Work />
        ) : route === "studio" ? (
          <Studio />
        ) : route === "enquiry" ? (
          <Enquiry />
        ) : !known ? (
          <section className="not-found section-pad">
            <h1>
              This space is
              <br />
              <i>still unwritten.</i>
            </h1>
            <a className="text-link" href="#/">
              Return home <Arrow />
            </a>
          </section>
        ) : null}
      </main>
      <footer className="site-footer section-pad">
        <div className="footer-top">
          <a href="#/" className="wordmark">
            AUREL
          </a>
          <p>
            Architecture. Interiors. Finishing.
            <br />A considered perspective on living.
          </p>
          <a href="#/enquiry" className="text-link">
            Start with a thought <Arrow />
          </a>
        </div>
        <div className="footer-bottom">
          <p>© 2026 AUREL · An independent portfolio concept.</p>
          <p>
            Fictional practice & speculative studies.
            <br />
            Imagery includes licensed references and generated concepts.
          </p>
          <button
            type="button"
            className="motion-toggle"
            aria-pressed={motion}
            onClick={toggleMotion}
          >
            <span className={motion ? "motion-dot on" : "motion-dot"} />
            <span>
              Motion <span aria-hidden="true">{motion ? "on" : "off"}</span>
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
