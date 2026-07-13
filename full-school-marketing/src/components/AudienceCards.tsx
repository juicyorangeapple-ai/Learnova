import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BookOpenCheck, GraduationCap, School, UserRoundCheck, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal, SectionHeading } from './Motion';

type Audience = {
  title: string;
  eyebrow: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  color: string;
};

const audiences: Audience[] = [
  { title: 'Student', eyebrow: 'Learn with clarity', description: 'One calm home for lessons, deadlines, feedback, and progress.', features: ['Personal timetable', 'Homework inbox', 'Grades and feedback'], icon: GraduationCap, color: 'blue' },
  { title: 'Teacher', eyebrow: 'Teach without busywork', description: 'Plan classes, mark work, record attendance, and keep families informed.', features: ['Fast attendance', 'Smart marking views', 'Class communication'], icon: BookOpenCheck, color: 'mint' },
  { title: 'Parent', eyebrow: 'Stay meaningfully informed', description: 'See what matters without chasing emails, portals, or paper notices.', features: ['Progress snapshots', 'Absence alerts', 'School messages'], icon: UserRoundCheck, color: 'coral' },
  { title: 'School Administrator', eyebrow: 'Run the whole school', description: 'A live operational picture across people, performance, and reporting.', features: ['Role controls', 'Whole-school analytics', 'Audit-ready reporting'], icon: School, color: 'ink' },
];

export function AudienceCards() {
  const [active, setActive] = useState<Audience | null>(null);
  const ActiveIcon = active?.icon;
  return (
    <section className="section audience-section" id="roles">
      <div className="container">
        <SectionHeading eyebrow="Designed for every role" title="One platform. A more useful view for everyone." copy="Each person sees the decisions, tasks, and information that belong to their day, all connected to the same trusted record." align="center" />
        <div className="audience-grid">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <Reveal key={audience.title} delay={index * 0.07}>
                <motion.button className={`audience-card audience-${audience.color}`} onClick={() => setActive(audience)} whileHover={{ y: -6 }} whileTap={{ scale: 0.99 }}>
                  <span className="audience-icon"><Icon /></span>
                  <small>{audience.eyebrow}</small>
                  <h3>{audience.title}</h3>
                  <p>{audience.description}</p>
                  <span className="card-link">Preview portal <ArrowUpRight size={16} /></span>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div className="portal-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <motion.div className="portal-modal" role="dialog" aria-modal="true" aria-label={`${active.title} portal preview`} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} onClick={(event) => event.stopPropagation()}>
              <button className="modal-close" onClick={() => setActive(null)} aria-label="Close portal preview"><X /></button>
              <div className="portal-modal-copy">
                <span className={`audience-icon audience-${active.color}`}>{ActiveIcon && <ActiveIcon />}</span>
                <small>{active.eyebrow}</small><h3>{active.title} portal</h3><p>{active.description}</p>
                <ul>{active.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </div>
              <div className="portal-mini-ui">
                <header><i /><span /><span /></header>
                <div className="portal-mini-stats"><span /><span /><span /></div>
                <div className="portal-mini-chart">{[42, 68, 56, 82, 72, 91].map((height, index) => <motion.i key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: index * 0.06 }} />)}</div>
                <div className="portal-mini-rows"><span /><span /><span /></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
