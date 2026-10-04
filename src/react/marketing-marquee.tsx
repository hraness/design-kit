import {
  MARKETING_MARQUEE_CONTROL_ICONS,
  resolveMarketingMarquee,
  type MarketingMarqueeInput,
  type ResolvedMarketingMarqueeItem,
} from "../marketing-marquee.js";

export type MarketingMarqueeProps = MarketingMarqueeInput;

const ROOT_CLASS = "hraness-marketing-marquee";

function MarqueeItem({ item }: Readonly<{ item: ResolvedMarketingMarqueeItem }>) {
  return (
    <li className={`${ROOT_CLASS}__item`}>
      {item.mark.kind === "glyph"
        ? <svg aria-hidden="true" className={`${ROOT_CLASS}__mark`} fill="currentColor" focusable="false" height="20" width="20"><use href={`#${item.mark.symbolId}`} /></svg>
        : <span aria-hidden="true" className={`${ROOT_CLASS}__monogram`}>{item.mark.monogram}</span>}
      <span className={`${ROOT_CLASS}__name`}>{item.name}</span>
    </li>
  );
}

function ControlIcon({ icon }: Readonly<{ icon: keyof typeof MARKETING_MARQUEE_CONTROL_ICONS }>) {
  return (
    <svg aria-hidden="true" className={`${ROOT_CLASS}__control-icon`} data-icon={icon} fill="currentColor" focusable="false" height="16" viewBox="0 0 16 16" width="16">
      <path d={MARKETING_MARQUEE_CONTROL_ICONS[icon]} />
    </svg>
  );
}

/**
 * A quiet, slowly scrolling band of provider marks and names under a label
 * that states how many there are. Server-safe; it emits the same markup as
 * `renderMarketingMarqueeHtml` and needs no client JavaScript.
 */
export function MarketingMarquee(props: MarketingMarqueeProps) {
  const marquee = resolveMarketingMarquee(props);
  const items = marquee.items.map((item) => <MarqueeItem item={item} key={item.name} />);
  return (
    <section aria-labelledby={marquee.labelId} className={marquee.className} data-align={marquee.align} data-hraness-marketing="marquee" id={marquee.id}>
      {marquee.symbols.length === 0 ? null : (
        <svg aria-hidden="true" className={`${ROOT_CLASS}__sprite`} focusable="false" height="0" width="0">
          {marquee.symbols.map((symbol) => (
            <symbol dangerouslySetInnerHTML={{ __html: symbol.body }} id={symbol.id} key={symbol.id} viewBox={symbol.viewBox} />
          ))}
        </svg>
      )}
      <div className={`${ROOT_CLASS}__header`}>
        <p className={`${ROOT_CLASS}__label`} id={marquee.labelId}>
          {marquee.label.before}<strong className={`${ROOT_CLASS}__count`}>{marquee.label.count}</strong>{marquee.label.after}
        </p>
        {marquee.action === null ? null : (
          <a className={`${ROOT_CLASS}__action hraness-text-link`} href={marquee.action.href}>{marquee.action.label}</a>
        )}
      </div>
      <input className={`${ROOT_CLASS}__toggle`} id={marquee.toggleId} type="checkbox" />
      <div className={`${ROOT_CLASS}__viewport`}>
        <div className={`${ROOT_CLASS}__track`}>
          {Array.from({ length: marquee.copies }, (_, index) => (
            <ul aria-hidden={index === 0 ? undefined : "true"} className={`${ROOT_CLASS}__list`} key={index}>{items}</ul>
          ))}
        </div>
      </div>
      <label className={`${ROOT_CLASS}__control`} htmlFor={marquee.toggleId}>
        <span className={`${ROOT_CLASS}__control-text`}>{marquee.pauseLabel}</span>
        <ControlIcon icon="pause" />
        <ControlIcon icon="play" />
      </label>
    </section>
  );
}
