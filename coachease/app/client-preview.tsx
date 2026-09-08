"use client";

import { useState } from "react";
import s from "./home.module.css";

const views = ["Overview", "Nutrition", "Check-ins"] as const;
type View = typeof views[number];
const history = [
  { date: "07 Sep", weight: "76.8", energy: "8", sleep: "7", note: "Feeling stronger this week. Kept all three sessions in." },
  { date: "31 Aug", weight: "77.1", energy: "7", sleep: "7", note: "Busy week at work. Meal prep helped keep things consistent." },
  { date: "24 Aug", weight: "77.5", energy: "6", sleep: "6", note: "Back into a routine after a few days away." },
];

export default function ClientPreview() {
  const [view, setView] = useState<View>("Overview");
  return (
    <div className={s.preview} aria-label="Example client record">
      <div className={s.previewTop}><span className={s.miniBrand}>ce.</span><span>Client workspace</span><span className={s.sampleTag}>SAMPLE</span></div>
      <div className={s.clientIdentity}><span className={s.avatar} aria-hidden="true">JS</span><div><p className={s.clientName}>Jamie Sullivan</p><p className={s.clientSub}>Build strength. Find consistency.</p></div><span className={s.week}>Week 06</span></div>
      <div className={s.viewButtons} role="group" aria-label="Example client view">{views.map(item => <button key={item} type="button" aria-pressed={view === item} aria-controls="sample-client-content" onClick={() => setView(item)}>{item}</button>)}</div>
      <div className={s.previewContent} id="sample-client-content" aria-live="polite" aria-atomic="true">
        {view === "Overview" && <>
          <div className={s.previewSectionTitle}><h3>Small steps. Real progress.</h3><span>Last 6 weeks</span></div>
          <div className={s.weightHeadline}><strong>76.8 <small>kg</small></strong><span>−1.6 kg since first check-in</span></div>
          <svg className={s.chart} viewBox="0 0 450 155" role="img" aria-label="Example weight history: 78.4, 78.0, 78.1, 77.5, 77.1 and 76.8 kilograms over six weeks">
            <path d="M10 25H440 M10 75H440 M10 125H440" stroke="#e2e4dc" strokeWidth="1" />
            <path d="M14 23L98 50L182 43L266 85L350 113L434 133L434 145L14 145Z" fill="#e8eddb" />
            <path d="M14 23L98 50L182 43L266 85L350 113L434 133" fill="none" stroke="#4f622e" strokeWidth="2.5" strokeLinejoin="round" />
            {[[14,23],[98,50],[182,43],[266,85],[350,113],[434,133]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="4" fill="#fafbf7" stroke="#4f622e" strokeWidth="2" />)}
          </svg>
          <div className={s.chartLabels}><span>03 Aug</span><span>07 Sep</span></div>
          <div className={s.recovery}><div><span>Energy</span><strong>8<small>/10</small></strong></div><div><span>Sleep</span><strong>7<small>/10</small></strong></div><div><span>Adherence</span><strong>92<small>%</small></strong></div></div>
          <div className={s.checkNote}><span>Latest check-in</span><p>“Feeling stronger this week. Kept all three sessions in.”</p></div>
        </>}
        {view === "Nutrition" && <>
          <div className={s.previewSectionTitle}><h3>Daily nutrition targets</h3><span>Current plan</span></div>
          <div className={s.weightHeadline}><strong>2,200 <small>kcal</small></strong><span>Daily calorie target</span></div>
          <div className={s.macroBar} aria-hidden="true"><span /><span /><span /></div>
          <dl className={s.nutritionRows}>{[["Protein","160 g","640 kcal"],["Carbohydrates","255 g","1,020 kcal"],["Fat","60 g","540 kcal"]].map(([name, grams, calories])=><div key={name}><dt>{name}</dt><dd>{grams}</dd><dd>{calories}</dd></div>)}</dl>
          <div className={s.checkNote}><span>Coach note</span><p>Keep these targets consistent this week. Review alongside energy and training at the next check-in.</p></div>
        </>}
        {view === "Check-ins" && <>
          <div className={s.previewSectionTitle}><h3>The last three weeks</h3><span>Check-in history</span></div>
          <div className={s.history}>{history.map(row=><article key={row.date}><div><strong>{row.date}</strong><span>{row.weight} kg</span></div><p>{row.note}</p><small>Energy {row.energy}/10 <span aria-hidden="true">·</span> Sleep {row.sleep}/10</small></article>)}</div>
        </>}
      </div>
      <div className={s.previewBottom}><span>Client information, kept together.</span><span aria-hidden="true">CE / 001</span></div>
    </div>
  );
}
