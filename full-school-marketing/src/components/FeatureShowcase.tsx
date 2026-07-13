import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  GraduationCap,
  LockKeyhole,
  MessageSquareText,
  NotebookPen,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal, SectionHeading } from './Motion';

type Feature = {
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
  tone: 'navy' | 'blue' | 'aqua' | 'coral' | 'cream';
  signal: string;
};

const features: Feature[] = [
  { title: 'Attendance', description: 'Mark once, follow up intelligently, and understand patterns while they can still shape outcomes.', bullets: ['Live registers', 'Absence workflows'], icon: ClipboardList, tone: 'navy', signal: '94.6% present today' },
  { title: 'Homework', description: 'Create, distribute, collect, and review work through one clear class workflow.', bullets: ['Submission tracking', 'Family visibility'], icon: NotebookPen, tone: 'aqua', signal: '846 submitted' },
  { title: 'Grades', description: 'Turn marks and feedback into an understandable picture of student progress.', bullets: ['Flexible grading', 'Progress history'], icon: GraduationCap, tone: 'coral', signal: '+3.4 this term' },
  { title: 'Timetable', description: 'Keep rooms, classes, staff, and changes synchronized across the school.', bullets: ['Personal schedules', 'Change alerts'], icon: Clock3, tone: 'cream', signal: '98.2% conflict free' },
  { title: 'Messaging', description: 'Reach the right role or group with structured, searchable communication.', bullets: ['Targeted channels', 'Delivery status'], icon: MessageSquareText, tone: 'blue', signal: '98% delivered' },
  { title: 'Reports', description: 'Build consistent academic and operational reports without spreadsheet assembly.', bullets: ['Reusable templates', 'Scheduled summaries'], icon: BarChart3, tone: 'navy', signal: '124 ready this week' },
  { title: 'Calendar', description: 'Bring lessons, events, meetings, and deadlines into one shared rhythm.', bullets: ['Role-specific views', 'Smart reminders'], icon: CalendarDays, tone: 'aqua', signal: '12 events today' },
  { title: 'Role management', description: 'Give each person appropriate access without making administration complicated.', bullets: ['Custom role groups', 'Access history'], icon: LockKeyhole, tone: 'cream', signal: '41 roles active' },
  { title: 'PDF reports', description: 'Generate polished documents for families, boards, and school records.', bullets: ['School branding', 'Batch generation'], icon: FileText, tone: 'coral', signal: '1-click generation' },
  { title: 'Analytics', description: 'Connect attendance, engagement, learning, and operations into actionable insight.', bullets: ['Cohort comparisons', 'Early signals'], icon: UsersRound, tone: 'blue', signal: '87% engagement' },
];

function SignalVisual({ index }: { index: number }) {
  const values = [42 + index * 3, 70 - index, 55 + index * 2, 82 - index, 66 + index];
  return (
    <div className="solution-card-visual" aria-hidden="true">
      <span className="visual-line"><i /><i /></span>
      <div>{values.map((value, barIndex) => <motion.i key={barIndex} initial={{ height: 0 }} whileInView={{ height: `${value}%` }} viewport={{ once: true }} transition={{ delay: barIndex * 0.05, duration: 0.48 }} />)}</div>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section className="section feature-section" id="features">
      <div className="container">
        <div className="feature-heading-row">
          <SectionHeading eyebrow="Explore the platform" title="A connected suite, not another collection of tools." copy="Start with the workflow your school needs now. Every part is designed to become more useful when connected to the rest." />
          <a className="text-arrow" href="#contact">Explore every capability <ArrowRight /></a>
        </div>

        <div className="solution-map">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const wide = index === 0 || index === 5;
            return (
              <Reveal key={feature.title} delay={(index % 4) * 0.05} className={wide ? 'solution-map-wide' : ''}>
                <motion.article className={`solution-card solution-${feature.tone}`} whileHover={{ y: -6 }}>
                  <header><span><Icon /></span><small>0{index + 1}</small></header>
                  <div className="solution-card-copy"><h3>{feature.title}</h3><p>{feature.description}</p></div>
                  {wide && <SignalVisual index={index} />}
                  <footer><strong>{feature.signal}</strong><span>{feature.bullets.map((bullet) => <small key={bullet}>{bullet}</small>)}</span></footer>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
