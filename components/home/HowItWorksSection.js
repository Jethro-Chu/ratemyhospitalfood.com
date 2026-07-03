import { Search, BookOpenText, Star } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeader from './SectionHeader';

const STEPS = [
  {
    icon: Search,
    index: '01',
    title: 'Search your hospital',
    body: 'Look it up by name or city. Not listed yet? Adding one takes about 20 seconds.',
  },
  {
    icon: BookOpenText,
    index: '02',
    title: 'Read real reviews',
    body: 'Ratings, photos, and honest takes from people who actually ate there.',
  },
  {
    icon: Star,
    index: '03',
    title: 'Add your rating',
    body: 'Five stars and a sentence helps the next hungry visitor. No account needed.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          id="how-it-works-heading"
          eyebrow="( How it works )"
          title={
            <>
              Three steps, zero <span className="gradient-text">paperwork</span>.
            </>
          }
          sub="The whole point is speed: find the cafeteria, read the room, leave your take."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, index, title, body }, i) => (
            <Reveal key={index} delay={Math.min(i * 80, 300)} className="h-full">
              <div className="relative h-full rounded-3xl bg-cream-50 border border-ink-900/10 shadow-warm-sm p-6 sm:p-7 overflow-hidden">
                <span
                  className="absolute -top-3 right-4 font-display font-bold text-[64px] leading-none text-cream-200 select-none"
                  aria-hidden="true"
                >
                  {index}
                </span>
                <div className="relative w-12 h-12 rounded-2xl bg-brand-50 border border-brand-500/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-500" strokeWidth={2.25} aria-hidden="true" />
                </div>
                <h3 className="relative mt-5 font-display font-bold text-[19px] text-ink-900 tracking-tight">
                  {title}
                </h3>
                <p className="relative mt-2 text-[14px] text-ink-500 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
