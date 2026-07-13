import { motion } from 'framer-motion';
import { BarChart3, BellRing, ChevronRight, ClipboardPlus, GraduationCap } from 'lucide-react';
import { Reveal, SectionHeading } from './Motion';

const steps = [
  { icon: ClipboardPlus, role: 'Teacher', title: 'Creates homework', copy: 'Sets instructions, resources, due date, and class.' },
  { icon: GraduationCap, role: 'Student', title: 'Receives the task', copy: 'Sees it instantly in a prioritized homework inbox.' },
  { icon: BellRing, role: 'Parent', title: 'Gets the right update', copy: 'Receives a clear notification without another portal.' },
  { icon: BarChart3, role: 'Administrator', title: 'Sees completion', copy: 'Tracks progress and intervention needs school-wide.' },
];

export function Workflow() {
  return (
    <section className="section workflow-section">
      <div className="container">
        <SectionHeading eyebrow="One connected workflow" title="An action in one portal becomes clarity everywhere." copy="Full School keeps each role synchronized without duplicate entry, manual follow-up, or disconnected reporting." align="center" />
        <Reveal className="workflow-shell">
          <motion.div className="workflow-line" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article key={step.role} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + index * 0.14 }}>
                <span className="workflow-icon"><Icon /></span><small>{step.role}</small><h3>{step.title}</h3><p>{step.copy}</p>
                {index < steps.length - 1 && <ChevronRight className="workflow-chevron" aria-hidden="true" />}
              </motion.article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
