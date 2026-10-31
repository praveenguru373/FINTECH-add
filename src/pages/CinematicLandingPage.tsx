import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeIndianRupee,
  ChartNoAxesCombined, CircleHelp, Goal, HeartPulse, Landmark, LockKeyhole,
  Menu, PiggyBank, ShieldCheck, Sparkles, Umbrella, Wallet, X,
} from "lucide-react";
import "./cinematic-landing.css";

const LandingScene = lazy(() => import("../components/LandingScene"));

const roadmap = [
  { title: "Understand", detail: "See your income, spending, savings, and commitments together.", icon: Wallet },
  { title: "Protect", detail: "Notice where a buffer or protection may need your attention.", icon: ShieldCheck },
  { title: "Prepare", detail: "Choose goals that fit your own life and responsibilities.", icon: Goal },
  { title: "Grow", detail: "Build steady habits and learn at a pace that feels right.", icon: ChartNoAxesCombined },
];

const financeAreas = [
  { title: "Emergency fund", description: "Money set aside for unexpected costs.", icon: PiggyBank },
  { title: "Insurance", description: "Cover that can help with certain unexpected losses.", icon: Umbrella },
  { title: "Debt", description: "Balances and repayments you need to manage.", icon: Landmark },
  { title: "Goals", description: "Things you want to prepare and save for.", icon: Goal },
  { title: "Investing", description: "Ways people put money toward longer-term goals.", icon: ChartNoAxesCombined },
];

const educationCards = [
  { title: "Start with your cash flow", image: "/story-finance.jpg", alt: "Illustrative financial planning scene", href: "/financial-education" },
  { title: "Build a savings habit", image: "/story-savings.jpg", alt: "Illustrative savings scene", href: "/financial-education" },
  { title: "Plan for your future", image: "/story-future.jpg", alt: "Illustrative future planning scene", href: "/financial-education" },
];

const sections = [
  { id: "home", label: "Home" },
  { id: "money-confusion", label: "The challenge" },
  { id: "roadmap", label: "Your path" },
  { id: "preview", label: "Preview" },
  { id: "financial-orbit", label: "Money topics" },
  { id: "how-it-works", label: "How it works" },
  { id: "learn", label: "Learn" },
  { id: "trust", label: "Privacy" },
];

function isLowPowerDevice(): boolean {
  const browser = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return Boolean(browser.connection?.saveData)
    || (typeof browser.deviceMemory === "number" && browser.deviceMemory <= 4)
    || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
}

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navCompact, setNavCompact] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [activeStep, setActiveStep] = useState(0);
  const [showScene, setShowScene] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const updateSceneSupport = () => {
      const reduced = motionQuery.matches;
      setReducedMotion(reduced);
      setShowScene(!reduced && !mobileQuery.matches && !isLowPowerDevice());
    };
    updateSceneSupport();
    motionQuery.addEventListener("change", updateSceneSupport);
    mobileQuery.addEventListener("change", updateSceneSupport);

    const sectionNodes = sections
      .map(({ id }) => root.querySelector<HTMLElement>(`#${id}`))
      .filter((section): section is HTMLElement => section !== null);
    const sectionObserver = new IntersectionObserver((entries) => {
      const mostVisible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (mostVisible) setActiveSection((mostVisible.target as HTMLElement).id);
    }, { threshold: [0.2, 0.4, 0.65], rootMargin: "-15% 0px -35% 0px" });
    sectionNodes.forEach((section) => sectionObserver.observe(section));

    const roadmapSteps = [...root.querySelectorAll<HTMLElement>(".cinema-roadmap-step")];
    const roadmapFill = root.querySelector<HTMLElement>(".cinema-roadmap-fill");
    const roadmapObserver = new IntersectionObserver((entries) => {
      if (!mobileQuery.matches) return;
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      const index = roadmapSteps.indexOf(current.target as HTMLElement);
      if (index < 0) return;
      setActiveStep(index);
      if (roadmapFill) roadmapFill.style.height = `${((index + 1) / roadmapSteps.length) * 100}%`;
    }, { threshold: [0.35, 0.6], rootMargin: "-28% 0px -32% 0px" });
    roadmapSteps.forEach((step) => roadmapObserver.observe(step));

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      setNavCompact(window.scrollY > 24);
    };
    const scheduleProgress = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    scheduleProgress();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      motionQuery.removeEventListener("change", updateSceneSupport);
      mobileQuery.removeEventListener("change", updateSceneSupport);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      sectionObserver.disconnect();
      roadmapObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let revertAnimations: (() => void) | undefined;
    let destroySmoothScroll: (() => void) | undefined;
    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([gsapModule, triggerModule, lenisModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (!window.matchMedia("(max-width: 760px)").matches && !isLowPowerDevice()) {
        const lenis = new lenisModule.default({ autoRaf: false, smoothWheel: true, anchors: true });
        const tick = (time: number) => lenis.raf(time * 1000);
        const refresh = () => ScrollTrigger.update();
        gsap.ticker.add(tick);
        lenis.on("scroll", refresh);
        destroySmoothScroll = () => {
          lenis.off("scroll", refresh);
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      }

      const context = gsap.context(() => {
        root.querySelectorAll<HTMLElement>("[data-motion]").forEach((element) => {
          gsap.fromTo(element, { y: 28, opacity: 0.45 }, {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              end: "top 58%",
              scrub: 0.5,
            },
          });
          const line = element.querySelector<HTMLElement>(".cinema-how-line span");
          if (line) gsap.fromTo(line, { scaleX: 0 }, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: element, start: "top 82%", end: "top 48%", scrub: 0.6 },
          });
        });

        const roadmapElement = roadmapRef.current;
        if (roadmapElement && window.matchMedia("(min-width: 900px)").matches) {
          const steps = gsap.utils.toArray<HTMLElement>(".cinema-roadmap-step", roadmapElement);
          const fill = roadmapElement.querySelector<HTMLElement>(".cinema-roadmap-fill");
          ScrollTrigger.create({
            trigger: roadmapElement,
            start: "top top",
            end: "+=1500",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (trigger) => {
              const index = Math.min(steps.length - 1, Math.floor(trigger.progress * steps.length));
              setActiveStep((current) => current === index ? current : index);
              if (fill) fill.style.transform = `scaleX(${trigger.progress})`;
              steps.forEach((step, stepIndex) => step.classList.toggle("is-current", stepIndex === index));
            },
          });
        }
        ScrollTrigger.refresh();
      }, root);

      revertAnimations = () => context.revert();
    }).catch((error: unknown) => {
      console.error("Unable to initialize landing-page scroll animations.", error);
      root.classList.add("landing-motion-fallback");
    });

    return () => {
      cancelled = true;
      destroySmoothScroll?.();
      revertAnimations?.();
    };
  }, [reducedMotion]);

  const closeMenu = () => setMenuOpen(false);

  return <div className="cinema-landing" ref={rootRef}>
    <div className="cinema-scroll-progress" aria-hidden="true"><span ref={progressRef} /></div>
    <header className={`cinema-header${navCompact ? " is-compact" : ""}`}>
      <Link to="/" className="cinema-brand" aria-label="FinTech home" onClick={closeMenu}>
        <span className="cinema-brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>Fin<span>Tech</span></span>
      </Link>
      <button className="cinema-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav className={`cinema-navigation${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
        <a href="#money-confusion" onClick={closeMenu}>Why FinTech</a>
        <a href="#how-it-works" onClick={closeMenu}>How it works</a>
        <Link to="/financial-education" onClick={closeMenu}>Learn</Link>
        <Link className="cinema-nav-signin" to="/login" onClick={closeMenu}>Sign in</Link>
        <Link className="cinema-nav-cta" to="/register" onClick={closeMenu}>Start free <ArrowUpRight size={16} /></Link>
      </nav>
    </header>

    <nav className="cinema-section-dots" aria-label="Page sections">
      {sections.map((section) => <a
        key={section.id}
        className={activeSection === section.id ? "is-active" : ""}
        href={`#${section.id}`}
        aria-label={section.label}
        aria-current={activeSection === section.id ? "location" : undefined}
      ><span /></a>)}
    </nav>

    <main>
      <section className="cinema-hero" id="home" aria-labelledby="cinema-hero-title">
        <div className="cinema-hero-glow" aria-hidden="true" />
        <div className="cinema-hero-content" data-motion>
          <p className="cinema-eyebrow"><span /> FINANCIAL WELLNESS, MADE PERSONAL</p>
          <p className="cinema-wordmark">FINTECH <span>· INDIA</span></p>
          <h1 id="cinema-hero-title">Understand Your Money.<br /><em>Plan Your Future.</em></h1>
          <p className="cinema-hero-lede">A clearer view of your money, your priorities, and a next step that fits your life.</p>
          <div className="cinema-hero-actions">
            <Link className="cinema-button cinema-button-primary" to="/register">Start free <ArrowRight size={18} /></Link>
            <a className="cinema-button cinema-button-secondary" href="#how-it-works">See how it works <ArrowDown size={16} /></a>
          </div>
          <p className="cinema-hero-note"><LockKeyhole size={14} /> Your finances stay in this browser in this version.</p>
        </div>
        <div className="cinema-hero-scene" aria-hidden="true">
          {showScene ? <Suspense fallback={<div className="cinema-scene-fallback" />}>
            <LandingScene />
          </Suspense> : <div className="cinema-scene-fallback" />}
          <span className="cinema-rupee-mark">₹</span>
          <span className="cinema-scene-orbit orbit-a" />
          <span className="cinema-scene-orbit orbit-b" />
        </div>
        <a className="cinema-hero-scroll" href="#money-confusion"><span /> Scroll to explore</a>
      </section>

      <section className="cinema-section cinema-problem" id="money-confusion" aria-labelledby="problem-title">
        <div className="cinema-section-heading" data-motion>
          <p className="cinema-kicker">A LOT TO KEEP IN MIND</p>
          <h2 id="problem-title">Why money can feel <em>confusing.</em></h2>
          <p>Income, bills, savings, and goals can feel like separate pieces. It helps to see how they connect.</p>
        </div>
        <div className="cinema-problem-grid">
          <article className="cinema-problem-card" data-motion><span className="cinema-card-icon"><Wallet /></span><small>01 · EVERYDAY</small><h3>Many moving parts</h3><p>Monthly costs and changing income can make it hard to see what is left.</p></article>
          <article className="cinema-problem-card" data-motion><span className="cinema-card-icon"><CircleHelp /></span><small>02 · UNCERTAINTY</small><h3>Where to begin?</h3><p>When everything feels important, choosing one manageable next step is difficult.</p></article>
          <article className="cinema-problem-card" data-motion><span className="cinema-card-icon"><Sparkles /></span><small>03 · YOUR LIFE</small><h3>No one-size-fits-all</h3><p>Your plans should start with your own needs, not someone else’s milestones.</p></article>
        </div>
      </section>

      <section className="cinema-roadmap-section" id="roadmap" ref={roadmapRef} aria-labelledby="roadmap-heading">
        <div className="cinema-section-heading" data-motion>
          <p className="cinema-kicker">A SIMPLE WAY FORWARD</p>
          <h2 id="roadmap-heading">One step at a <em>time.</em></h2>
          <p>Move through the journey at your own pace. You choose what to do next.</p>
        </div>
        <div className="cinema-roadmap-track">
          <div className="cinema-roadmap-line" aria-hidden="true"><span className="cinema-roadmap-fill" /></div>
          {roadmap.map(({ title, detail, icon: Icon }, index) => <article
            className={`cinema-roadmap-step${activeStep === index ? " is-current" : ""}`}
            key={title}
            data-motion
          >
            <span className="cinema-roadmap-index">0{index + 1}</span>
            <span className="cinema-roadmap-icon"><Icon size={22} /></span>
            <h3>{title}</h3>
            <p className="cinema-roadmap-detail">{detail}</p>
          </article>)}
        </div>
      </section>

      <section className="cinema-section cinema-preview-section" id="preview" aria-labelledby="preview-heading">
        <div className="cinema-preview-copy" data-motion>
          <p className="cinema-kicker">A CLEARER FINANCIAL PICTURE</p>
          <h2 id="preview-heading">Understand the whole, not just the <em>numbers.</em></h2>
          <p>Explore a sample view of the cash flow, savings, and goals you can assess. Your own dashboard uses only the information you enter.</p>
          <Link className="cinema-inline-link" to="/how-it-works">See how it works <ArrowRight size={16} /></Link>
        </div>
        <div className="cinema-dashboard-wrap" data-motion>
          <div className="cinema-dashboard-float cinema-dashboard-float-top"><span><PiggyBank size={17} /> SAVINGS BUFFER</span><strong>Build at your pace</strong><small>Example information only</small></div>
          <article className="cinema-dashboard" aria-label="Sample financial snapshot using illustrative sample data">
            <div className="cinema-dashboard-heading"><span><i /> YOUR FINANCIAL SNAPSHOT</span><small>SAMPLE DATA</small></div>
            <div className="cinema-dashboard-intro"><div><span>Monthly cash flow</span><strong>₹ 18,500</strong></div><span className="cinema-dashboard-positive">Illustrative</span></div>
            <div className="cinema-chart" aria-hidden="true">
              <span className="cinema-chart-grid grid-one" /><span className="cinema-chart-grid grid-two" />
              <svg viewBox="0 0 500 170" preserveAspectRatio="none"><path className="cinema-chart-area" d="M0 130 C50 126 60 88 112 102 S185 80 227 91 S295 52 340 66 S418 45 500 20 L500 170 L0 170Z" /><path className="cinema-chart-line" d="M0 130 C50 126 60 88 112 102 S185 80 227 91 S295 52 340 66 S418 45 500 20" /></svg>
              <div className="cinema-chart-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div>
            </div>
            <div className="cinema-dashboard-bottom"><span><i /> Income</span><span><i /> Expenses</span><span><i /> Goals</span></div>
          </article>
          <div className="cinema-dashboard-float cinema-dashboard-float-bottom"><span><Goal size={17} /> NEXT GOAL</span><strong>One small step counts</strong></div>
        </div>
      </section>

      <section className="cinema-section cinema-orbit-section" id="financial-orbit" aria-labelledby="orbit-heading">
        <div className="cinema-section-heading" data-motion>
          <p className="cinema-kicker">CONNECTED PARTS OF YOUR FINANCIAL LIFE</p>
          <h2 id="orbit-heading">Your money, in <em>context.</em></h2>
          <p>Explore a topic to see what it means. This is general education, not a personal recommendation.</p>
        </div>
        <div className="cinema-orbit-map" data-motion>
          <div className="cinema-orbit-ring orbit-ring-one" aria-hidden="true" />
          <div className="cinema-orbit-ring orbit-ring-two" aria-hidden="true" />
          <div className="cinema-orbit-center"><BadgeIndianRupee size={32} /><span>Your financial life</span></div>
          {financeAreas.map(({ title, description, icon: Icon }, index) => <div className={`cinema-orbit-item orbit-item-${index + 1}`} key={title} tabIndex={0} aria-label={title} aria-describedby={`orbit-tooltip-${index}`}>
            <span className="cinema-orbit-icon"><Icon size={19} /></span>
            <span className="cinema-orbit-label">{title}</span>
            <span className="cinema-orbit-tooltip" id={`orbit-tooltip-${index}`} role="tooltip">{description}</span>
          </div>)}
        </div>
      </section>

      <section className="cinema-section cinema-steps-section" id="how-it-works" aria-labelledby="steps-heading">
        <div className="cinema-section-heading" data-motion>
          <p className="cinema-kicker">GETTING STARTED IS SIMPLE</p>
          <h2 id="steps-heading">A check-in, built around <em>you.</em></h2>
        </div>
        <div className="cinema-how-grid">
          <article data-motion><span className="cinema-how-number">01</span>          <div className="cinema-how-line" aria-hidden="true"><span /></div><h3>Share what you know</h3><p>Enter estimates about your monthly money and priorities.</p></article>
          <article data-motion><span className="cinema-how-number">02</span><div className="cinema-how-line" aria-hidden="true" /><h3>See the picture</h3><p>Review clear calculations based on the details you provided.</p></article>
          <article data-motion><span className="cinema-how-number">03</span><div className="cinema-how-line" aria-hidden="true" /><h3>Choose a next step</h3><p>Use the educational prompts to decide what feels useful.</p></article>
        </div>
      </section>

      <section className="cinema-section cinema-learn-section" id="learn" aria-labelledby="learn-heading">
        <div className="cinema-section-heading cinema-learn-heading" data-motion>
          <div><p className="cinema-kicker">LEARN AT YOUR OWN PACE</p><h2 id="learn-heading">A little more <em>clarity.</em></h2></div>
          <Link className="cinema-inline-link" to="/financial-education">Visit the education center <ArrowUpRight size={16} /></Link>
        </div>
        <div className="cinema-education-grid">
          {educationCards.map((card) => <Link className="cinema-education-card" to={card.href} key={card.title} data-motion>
            <span className="cinema-education-image"><img src={card.image} alt={card.alt} width="640" height="420" loading="lazy" /></span>
            <span className="cinema-education-title">{card.title}<ArrowUpRight size={16} /></span>
          </Link>)}
        </div>
      </section>

      <section className="cinema-trust-section" id="trust" aria-labelledby="trust-heading">
        <div className="cinema-trust-art" data-motion aria-hidden="true">
          <div className="cinema-trust-halo"><ShieldCheck size={68} strokeWidth={1.2} /><LockKeyhole size={24} /></div>
        </div>
        <div className="cinema-trust-copy" data-motion>
          <p className="cinema-kicker">PRIVACY, IN PLAIN WORDS</p>
          <h2 id="trust-heading">Your data stays <em>yours.</em></h2>
          <p>This version stores your financial assessment and transactions in this browser. You can export or delete local data in Settings. It does not connect to your bank.</p>
          <p className="cinema-disclaimer">Educational guidance only, not registered investment advice.</p>
          <Link className="cinema-inline-link" to="/privacy">Read the privacy details <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="cinema-impact-section" aria-labelledby="impact-heading">
        <div className="cinema-impact-content" data-motion>
          <span className="cinema-impact-icon"><HeartPulse size={21} /></span>
          <p className="cinema-kicker">NO PROMISES. JUST A CLEARER START.</p>
          <h2 id="impact-heading">Your next step can be <em>small.</em></h2>
          <p>No invented success stories or promised results—just space to understand your money and plan at your own pace.</p>
        </div>
      </section>

      <section className="cinema-final-section" id="start" aria-labelledby="final-heading">
        <div className="cinema-final-particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="cinema-final-copy" data-motion>
          <p className="cinema-kicker">BEGIN WHERE YOU ARE</p>
          <h2 id="final-heading">Understand your money.<br /><em>Plan your future.</em></h2>
          <p>A private, educational starting point. No bank connection required.</p>
          <Link className="cinema-button cinema-button-light" to="/register">Start free <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>

    <footer className="cinema-footer">
      <Link to="/" className="cinema-brand" aria-label="FinTech home"><span className="cinema-brand-mark" aria-hidden="true"><i /><i /><i /></span><span>Fin<span>Tech</span></span></Link>
      <p>Understand your money. Plan your future.</p>
      <nav aria-label="Footer navigation"><Link to="/about">About</Link><Link to="/how-it-works">How it works</Link><Link to="/financial-education">Learn</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></nav>
      <small>Educational guidance only, not registered investment advice.</small>
      <small>© {new Date().getFullYear()} FinTech</small>
    </footer>
    {reducedMotion && <span className="cinema-motion-note" aria-live="polite">Reduced motion is enabled.</span>}
  </div>;
}
