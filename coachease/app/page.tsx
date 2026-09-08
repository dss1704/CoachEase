import type { Metadata } from "next";
import Link from "next/link";
import ClientPreview from "./client-preview";
import s from "./home.module.css";

export const metadata: Metadata = {
  title: "CoachEase — Make room for better coaching",
  description: "Client information, nutrition targets and weekly check-ins in one coaching workspace. Keep the details together. Give your clients your attention.",
};

export default function Home() {
  return (
    <main className={s.site} id="top">
      <a href="#main-content" className={s.skip}>Skip to content</a>
      <header className={s.header}>
        <Link href="/" className={s.brand} aria-label="CoachEase home"><span className={s.brandMark} aria-hidden="true">ce.</span>CoachEase</Link>
        <nav aria-label="Main navigation" className={s.navigation}>
          <a href="#workspace" className={s.desktopLink}>The workspace</a>
          <a href="#approach" className={s.desktopLink}>Our approach</a>
          <Link href="/login" className={s.login}>Coach login <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>
      <section className={s.hero} id="main-content" aria-labelledby="hero-title">
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>The independent coach&apos;s workspace</p>
          <h1 id="hero-title">Make room<br />for better<br /><em>coaching.</em></h1>
          <p className={s.intro}>You know your clients.<br />Keep everything else in order.</p>
          <p className={s.description}>Their goals, nutrition and weekly check-ins.<br className={s.desktopBreak} /> Together, so you can focus on what comes next.</p>
          <a href="#workspace" className={s.primary}>Explore the workspace <span aria-hidden="true">↓</span></a>
          <div className={s.heroFoot}><span>Built around the coach.</span><span>And the person behind every plan.</span></div>
        </div>
        <div className={s.heroVisual}>
          <div className={s.visualHeading}><span>A little more perspective.</span><span>01 / Client overview</span></div>
          <ClientPreview />
          <div className={s.visualFoot}><span>One client. The whole picture.</span><span className={s.demoLabel}>Interactive example · fictional data</span></div>
        </div>
      </section>
      <div className={s.indexBar} aria-label="Workspace features"><span>Less searching.<br />More understanding.</span><a href="#workspace">01 <b>Client profiles</b></a><a href="#nutrition">02 <b>Nutrition targets</b></a><a href="#checkins">03 <b>Weekly check-ins</b></a></div>
      <section id="workspace" className={s.workspace} aria-labelledby="workspace-title">
        <div className={s.sectionIntro}><p className={s.eyebrow}>Inside the workspace</p><h2 id="workspace-title">The details matter.<br /><em>Keep them close.</em></h2><p>A useful record of each client, from their first goal to their latest check-in. Ready when you sit down to coach.</p></div>
        <div className={s.featureList}>
          <article className={s.feature}><span className={s.featureNumber}>01</span><div><h3>Remember the person.<br />Not just the numbers.</h3><p>Contact details, goals and your coaching notes in one profile. Pick up the conversation with the context already there.</p><span className={s.featureDetail}>Client information / Goals / Coach notes</span></div></article>
          <article className={s.feature} id="nutrition"><span className={s.featureNumber}>02</span><div><h3>A clear target.<br />Room to adjust.</h3><p>Set calorie and macro targets alongside current and target weight. Update nutrition separately, without rewriting the rest of the client record.</p><span className={s.featureDetail}>Calories / Protein / Carbs / Fats</span></div></article>
          <article className={s.feature} id="checkins"><span className={s.featureNumber}>03</span><div><h3>See the week.<br />Understand the pattern.</h3><p>Record weight, adherence, energy, hunger and sleep. Keep the notes beside the numbers and look back through check-in history.</p><span className={s.featureDetail}>Weekly check-ins / Weight history / Recovery</span></div></article>
        </div>
      </section>
      <section className={s.approach} id="approach" aria-labelledby="approach-title"><p className={s.eyebrow}>Our approach</p><div className={s.approachBody}><h2 id="approach-title">Good coaching<br />is <em>personal.</em><br />Your tools should<br />make time for it.</h2><div><span className={s.approachMark} aria-hidden="true">ce.</span><p>There is a person behind every check-in. A difficult week behind a missed target. A small win behind a number.</p><p>CoachEase keeps that context together. You bring the judgement, the conversation and the care.</p><Link href="/login" className={s.textLink}>Open your workspace <span aria-hidden="true">↗</span></Link></div></div></section>
      <footer className={s.footer}><Link href="/" className={s.footerBrand}>CoachEase<span>© 2026</span></Link><p>For the work behind the progress.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
