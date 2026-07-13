import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Reveal, SectionHeading } from './Motion';

const questions = [
  ['How long does implementation take?', 'Most single schools can be configured, migrated, and trained in four to eight weeks. Larger groups receive a phased implementation plan.'],
  ['Can Full School work with our existing systems?', 'Yes. Full School is designed for secure integrations with identity, finance, learning, and government reporting systems through documented APIs.'],
  ['Is there a separate experience for parents and students?', 'Yes. Each role has a focused portal and mobile-ready experience, while all information remains connected to one school record.'],
  ['Can permissions match our school structure?', 'Yes. Schools can define roles, scopes, approval paths, and access rules for staff, families, students, and external users.'],
  ['How is our data protected?', 'Full School is designed around role-based access, encryption, audit logs, secure authentication, managed backups, and privacy-first data controls.'],
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-layout">
        <SectionHeading eyebrow="Questions, answered" title="Everything you need to evaluate Full School." copy="Our team can also walk through your school’s current systems and implementation needs." />
        <Reveal className="faq-list">
          {questions.map(([question, answer], index) => {
            const expanded = open === index;
            return (
              <article className={expanded ? 'open' : ''} key={question}>
                <button onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}><span>{question}</span><Plus /></button>
                <AnimatePresence initial={false}>
                  {expanded && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}><p>{answer}</p></motion.div>}
                </AnimatePresence>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
