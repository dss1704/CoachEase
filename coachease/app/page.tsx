import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ClientPreview from "./client-preview";
import s from "./home.module.css";

export const metadata: Metadata = {
  title: "CoachEase — For the work behind the progress",
  description:
    "A workspace for independent coaches. Bring client profiles, nutrition targets and weekly check-ins together, and make more room for coaching.",
};

export default function Home() {
  return (
    <main className={s.site} id="top">
      <a href="#main-content" className={s.skip}>Skip to content</a>
      <header className={s.header}>
        <Link href="/" className={s.smallBrand} aria-label="CoachEase home">
          CE<span className={s.brandDot} aria-hidden="true" />
        </Link>
        <nav aria-label="Main navigation" className={s.navigation}>
          <a href="#workspace">Workspace <sup>01</sup></a>
          <a href="#approach" className={s.desktopLink}>Approach <sup>02</sup></a>
        </nav>
        <Link href="/login" className={s.login}>
          Coach login <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className={s.hero} id="main-content" aria-labelledby="hero-title">
        <div className={s.masthead}>
          <h1 id="hero-title">COACHEASE</h1>
        </div>
        <div className={s.heroGrid}>
          <div className={s.heroCopy}>
            <p className={s.definition}>/kəʊtʃ iːz/ <span>noun</span><br />A little less admin.<br />A lot more coaching.</p>
            <div className={s.heroMessage}>
              <h2>For the work<br />behind the<br /><span>progress.</span></h2>
              <p>Client profiles, nutrition and check-ins.<br />One workspace. Yours.</p>
              <a href="#workspace" className={s.heroAction}>
                <span>Explore the workspace</span>
                <span className={s.actionArrow} aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
          <figure className={s.heroPhoto}>
            <Image
              src="/pt-training.jpeg"
              alt="Personal trainer spotting a client during a bench press in a gym"
              fill
              sizes="(max-width: 760px) 100vw, 69vw"
              preload
              className={s.trainingImage}
            />
            <figcaption className={s.photoCaption}>
              <span>THE HUMAN PART.<br />THAT&apos;S YOURS.</span>
              <span>We&apos;ll help with the rest.</span>
            </figcaption>
          </figure>
        </div>
        <div className={s.heroBaseline}>
          <span>Independent coaches. Individual attention.</span>
          <a href="#workspace">Scroll to explore <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="workspace" className={s.workspace} aria-labelledby="workspace-title">
        <div className={s.sectionHeading}>
          <p className={s.sectionIndex}>01 / THE WORKSPACE</p>
          <h2 id="workspace-title">All the detail.<br />A clearer picture.</h2>
        </div>
        <div className={s.workspaceGrid}>
          <div className={s.workspaceCopy}>
            <p className={s.workspaceLead}>Pick up where<br />you left off.</p>
            <p>Goals, coaching notes, nutrition targets and the latest check-in. Keep the context together, ready for your next conversation.</p>
            <div className={s.featureList}>
              <details open>
                <summary><span>01</span>Client profiles<span className={s.expand} aria-hidden="true" /></summary>
                <p>Contact information, goals and your notes. A useful record of the person you&apos;re coaching.</p>
              </details>
              <details>
                <summary><span>02</span>Nutrition targets<span className={s.expand} aria-hidden="true" /></summary>
                <p>Set calories, protein, carbs and fats alongside current and target weight. Adjust nutrition without rewriting the client profile.</p>
              </details>
              <details>
                <summary><span>03</span>Weekly check-ins<span className={s.expand} aria-hidden="true" /></summary>
                <p>Record weight, adherence, energy, hunger and sleep. Follow the history and keep the notes beside the numbers.</p>
              </details>
            </div>
            <Link href="/login" className={s.textLink}>Open your workspace <span aria-hidden="true">↗</span></Link>
          </div>
          <div className={s.demoStage}>
            <div className={s.demoCaption}><span>INSIDE A CLIENT RECORD</span><span>Try the views below ↓</span></div>
            <ClientPreview />
            <p className={s.demoFoot}>Interactive example. Fictional client data.</p>
          </div>
        </div>
      </section>

      <section id="approach" className={s.approach} aria-labelledby="approach-title">
        <p className={s.sectionIndex}>02 / THE APPROACH</p>
        <div className={s.approachGrid}>
          <h2 id="approach-title">The software<br />holds the detail.<br /><span>You see<br />the person.</span></h2>
          <div className={s.approachCopy}>
            <span className={s.bracket} aria-hidden="true">[ ce. ]</span>
            <p>A check-in only tells part of the story. You know the client, the difficult week and the work it took to get here.</p>
            <p>CoachEase brings the information together. The judgement, the conversation and the care stay with you.</p>
            <Link href="/login" className={s.textLink}>Back to coaching <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.footerTop}><span>YOUR CLIENTS.<br />YOUR CRAFT.</span><Link href="/login" aria-label="Open your CoachEase workspace">↗</Link></div>
        <div className={s.footerBottom}><Link href="/">CoachEase © 2026</Link><span>For the work behind the progress.</span><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
