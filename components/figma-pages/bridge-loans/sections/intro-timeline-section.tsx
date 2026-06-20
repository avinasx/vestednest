import { BRIDGE_INTRO, BRIDGE_TIMELINE } from "../content";
import { SectionHeader } from "../section-header";

export function BridgeIntroTimelineSection() {
  return (
    <section className="bl-section bl-section--white">
      <div className="bl-inner bl-intro-grid">
        <div className="bl-intro-copy">
          <SectionHeader
            align="left"
            label={BRIDGE_INTRO.label}
            title={
              <>
                What is a <br />
                <em>bridge loan?</em>
              </>
            }
          />
          {BRIDGE_INTRO.paragraphs.map((p) => (
            <p key={p} className="bl-body">
              {p}
            </p>
          ))}
        </div>

        <div className="bl-timeline-panel">
          <h3 className="bl-timeline-heading">{BRIDGE_TIMELINE.label}</h3>
          <ol className="bl-steps">
            {BRIDGE_TIMELINE.steps.map((step, index) => (
              <li key={step.title} className={index === 0 ? "bl-step bl-step--active" : "bl-step"}>
                <span className="bl-step-num">{index + 1}</span>
                <div>
                  <p className="bl-step-time">{step.time}</p>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
