import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  Building2,
  Check,
  CircleCheckBig,
  CloudCog,
  DatabaseBackup,
  Facebook,
  FileClock,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MessageCircleMore,
  MessagesSquare,
  Play,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Header } from './components/Header';
import { DashboardDemo } from './components/DashboardDemo';
import { AnimatedCounter } from './components/AnimatedCounter';
import { AudienceCards } from './components/AudienceCards';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Workflow } from './components/Workflow';
import { Pricing } from './components/Pricing';
import { Faq } from './components/Faq';
import { Reveal, SectionHeading } from './components/Motion';

const appUrl = import.meta.env.VITE_FULL_SCHOOL_APP_URL || 'http://localhost:3000/login';

const stats = [
  ['Students supported', 240000, '+'],
  ['Educators connected', 18500, '+'],
  ['Daily school actions', 1200000, '+'],
  ['Countries represented', 28, ''],
];

const solutionLanes = [
  {
    icon: Building2,
    number: '01',
    title: 'Run school operations',
    copy: 'Bring attendance, scheduling, records, permissions, and reporting into one dependable operational core.',
    links: ['Student information', 'Attendance and timetable', 'Reports and compliance'],
    tone: 'navy',
  },
  {
    icon: BookOpenCheck,
    number: '02',
    title: 'Strengthen teaching',
    copy: 'Give teachers a coherent path from planning and homework to grading, feedback, and class insight.',
    links: ['Homework and assignments', 'Grades and feedback', 'Learning analytics'],
    tone: 'sky',
  },
  {
    icon: MessagesSquare,
    number: '03',
    title: 'Connect every family',
    copy: 'Deliver timely, role-aware communication without another disconnected inbox or missed paper notice.',
    links: ['Parent and student portals', 'Messages and alerts', 'Shared school calendar'],
    tone: 'coral',
  },
];

const security = [
  [LockKeyhole, 'Role-based permissions', 'Give each person the access they need, and nothing they do not.'],
  [ShieldCheck, 'Encrypted data', 'Protect information in transit and at rest with modern safeguards.'],
  [DatabaseBackup, 'Managed backups', 'Support continuity with resilient recovery and backup processes.'],
  [CloudCog, 'Secure authentication', 'Use strong identity controls with a clear path to SSO.'],
  [FileClock, 'Audit-ready activity', 'Understand important actions and changes across the platform.'],
  [CircleCheckBig, 'Compliance-minded', 'Build privacy and accountability into everyday school workflows.'],
];

const testimonials = [
  ['Principal', 'Dr. Elaine Morgan', 'We can finally see the whole school day without asking five teams for five different spreadsheets.'],
  ['Teacher', 'Marcus Reed', 'The routine work feels lighter. Attendance, homework, feedback, and updates follow one clear flow.'],
  ['Parent', 'Priya Shah', 'I get the information that matters, at the right time, without having to search across different portals.'],
  ['Student', 'Noah Williams', 'My timetable, deadlines, messages, and feedback all make sense in one place.'],
];

const resources = [
  ['Leadership guide', 'The connected school checklist', 'A practical framework for evaluating your current systems.'],
  ['Product tour', 'See one school day in Full School', 'Follow a task from the classroom to the home and leadership team.'],
  ['Implementation', 'Plan a confident rollout', 'A phased approach for data, people, training, and communication.'],
];

function App() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.16], [0, reduceMotion ? 0 : 68]);
  const heroCopyY = useTransform(scrollYProgress, [0, 0.14], [0, reduceMotion ? 0 : -24]);

  return (
    <div id="top">
      <Header appUrl={appUrl} />

      <main>
        <section className="hero">
          <motion.div className="hero-photo" style={{ y: heroImageY }} aria-hidden="true" />
          <div className="hero-wash" aria-hidden="true" />
          <div className="wide-container hero-content">
            <motion.div
              className="hero-copy"
              style={{ y: heroCopyY }}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="hero-kicker"><Sparkles size={15} /> One connected platform for every school day</span>
              <h1>A better school day starts with <em>everything connected.</em></h1>
              <p>Full School brings administration, learning, communication, attendance, grading, and reporting together so every person can focus on what moves students forward.</p>
              <div className="hero-actions">
                <a className="button button-coral" href="#contact">Book a demo <ArrowRight size={17} /></a>
                <a className="button button-glass" href="#platform"><Play size={16} /> Explore the platform</a>
              </div>
              <div className="hero-proof">
                <span><Check /> Built for every role</span>
                <span><Check /> Guided implementation</span>
                <span><Check /> Secure by design</span>
              </div>
            </motion.div>
          </div>

          <motion.div className="hero-signal wide-container" initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.62 }}>
            <span className="hero-signal-label">Today in Full School</span>
            <div><BellRing /><span><small>Attendance</small><strong>94.6% present</strong></span></div>
            <div><BookOpenCheck /><span><small>Homework</small><strong>846 submitted</strong></span></div>
            <div><MessagesSquare /><span><small>Communication</small><strong>98% delivered</strong></span></div>
          </motion.div>
        </section>

        <section className="trust-strip" aria-label="School types supported">
          <div className="wide-container">
            <span>Designed for</span>
            <strong>Independent schools</strong><i />
            <strong>International schools</strong><i />
            <strong>School groups</strong><i />
            <strong>K-12 districts</strong><i />
            <strong>Colleges</strong>
          </div>
        </section>

        <section className="section manifesto-section">
          <div className="container manifesto-grid">
            <Reveal className="manifesto-number"><span>01</span><small>The connected school</small></Reveal>
            <Reveal className="manifesto-copy" direction="right">
              <h2>Schools should not have to choose between powerful systems and a simple day.</h2>
              <p>Full School creates one shared operational picture from the central office to the classroom to the home. Information moves once, reaches the right person, and becomes useful immediately.</p>
              <a className="text-arrow" href="#solutions">Explore connected solutions <ArrowRight /></a>
            </Reveal>
          </div>
        </section>

        <section className="section solutions-section" id="solutions">
          <div className="container">
            <SectionHeading eyebrow="One platform, three outcomes" title="Built around how a school actually moves." copy="Every workflow starts somewhere different. Full School keeps the result connected for everyone." />
            <div className="solution-lanes">
              {solutionLanes.map((lane, index) => {
                const Icon = lane.icon;
                return (
                  <Reveal key={lane.title} delay={index * 0.08}>
                    <motion.article className={`solution-lane solution-lane-${lane.tone}`} whileHover={{ y: -7 }}>
                      <header><span>{lane.number}</span><Icon /></header>
                      <h3>{lane.title}</h3>
                      <p>{lane.copy}</p>
                      <ul>{lane.links.map((link) => <li key={link}>{link}<ArrowRight /></li>)}</ul>
                    </motion.article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section scale-section" id="impact">
          <div className="container scale-layout">
            <Reveal className="scale-copy">
              <span className="eyebrow">Clarity at school scale</span>
              <h2>Every small action adds up to a better view of every student.</h2>
            </Reveal>
            <div className="scale-stats">
              {stats.map(([label, value, suffix], index) => (
                <Reveal key={String(label)} delay={index * 0.06} className="scale-stat">
                  <strong><AnimatedCounter value={Number(value)} suffix={String(suffix)} /></strong>
                  <span>{String(label)}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section platform-section" id="platform">
          <div className="container platform-layout">
            <div className="platform-copy">
              <SectionHeading eyebrow="The Full School platform" title="See the school day as it happens." copy="A live operational view brings student information, attendance, work, communication, and upcoming events into one decision-ready experience." />
              <div className="platform-points">
                <span><i>1</i><strong>Know what needs attention</strong><small>Important changes surface without another manual report.</small></span>
                <span><i>2</i><strong>Move from insight to action</strong><small>Every view connects directly to the next useful workflow.</small></span>
                <span><i>3</i><strong>Keep each role in context</strong><small>Students, staff, and families see a focused experience.</small></span>
              </div>
              <a className="button button-ink" href="#contact">See Full School in action <ArrowRight size={17} /></a>
            </div>
            <Reveal className="platform-visual" direction="right">
              <div className="platform-window-bar"><span /><span /><span /><small>app.fullschool.com/overview</small></div>
              <DashboardDemo compact />
              <motion.div className="platform-float platform-float-one" animate={reduceMotion ? {} : { y: [0, -7, 0] }} transition={{ duration: 4.5, repeat: Infinity }}><ShieldCheck /><span><small>Data health</small><strong>All systems connected</strong></span></motion.div>
              <motion.div className="platform-float platform-float-two" animate={reduceMotion ? {} : { y: [0, 7, 0] }} transition={{ duration: 5, repeat: Infinity }}><UsersRound /><span><small>Today</small><strong>1,248 students active</strong></span></motion.div>
            </Reveal>
          </div>
        </section>

        <AudienceCards />
        <FeatureShowcase />

        <section className="section impact-story" id="about">
          <div className="container impact-story-grid">
            <Reveal className="impact-photo-wrap" direction="left">
              <img src="/images/full-school-classroom.jpg" alt="A teacher and two students working together in a modern classroom" loading="lazy" width="1600" height="1067" />
              <div className="impact-quote"><MessageCircleMore /><p>“The technology should support the conversation, not become the conversation.”</p><span>Full School product principle</span></div>
            </Reveal>
            <Reveal className="impact-story-copy" direction="right">
              <span className="eyebrow">Designed for the human work</span>
              <h2>Give educators more time to notice what matters.</h2>
              <p>Connected data is useful only when it makes the next decision clearer. Full School reduces repeated entry, manual follow-up, and information hunting so school teams can stay close to students.</p>
              <div className="impact-checks"><span><Check /> Fewer disconnected systems</span><span><Check /> Faster family follow-up</span><span><Check /> Clearer student support</span></div>
              <a className="text-arrow" href="#contact">Talk through your school’s workflow <ArrowRight /></a>
            </Reveal>
          </div>
        </section>

        <Workflow />

        <section className="section security-section">
          <div className="container">
            <div className="security-heading">
              <SectionHeading eyebrow="Security and trust" title="Built for the responsibility schools carry." copy="Layered security, accountable access, and privacy-minded controls form the foundation of the platform." />
              <Reveal className="security-promise"><ShieldCheck /><span><small>Our commitment</small><strong>Every role. Every record. Every action.</strong></span></Reveal>
            </div>
            <div className="security-grid">
              {security.map(([Icon, title, copy], index) => {
                const SecurityIcon = Icon as typeof LockKeyhole;
                return <Reveal key={String(title)} delay={index * 0.05}><article><span><SecurityIcon /></span><div><h3>{String(title)}</h3><p>{String(copy)}</p></div></article></Reveal>;
              })}
            </div>
          </div>
        </section>

        <section className="section community-section">
          <div className="container">
            <SectionHeading eyebrow="One platform, many perspectives" title="The difference is felt across the whole community." copy="Illustrative demo feedback showing the outcomes Full School is designed to create." align="center" />
            <div className="testimonial-track">
              {testimonials.map(([role, name, quote], index) => (
                <Reveal key={role} delay={index * 0.07}>
                  <motion.blockquote whileHover={{ y: -5 }}>
                    <MessageCircleMore />
                    <p>“{quote}”</p>
                    <footer><span>{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>{name}</strong><small>{role}</small></div></footer>
                  </motion.blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section resources-section" id="resources">
          <div className="container">
            <div className="resources-heading"><SectionHeading eyebrow="Resources for school leaders" title="Start with the question your school is asking now." copy="Practical ways to evaluate your systems, plan implementation, and see the platform in context." /><a className="text-arrow" href="#contact">View all resources <ArrowRight /></a></div>
            <div className="resource-grid">
              {resources.map(([type, title, copy], index) => (
                <Reveal key={title} delay={index * 0.07}>
                  <a href={index === 1 ? '#platform' : '#contact'}><span>0{index + 1}</span><small>{type}</small><h3>{title}</h3><p>{copy}</p><strong>Explore <ArrowRight /></strong></a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Pricing />
        <Faq />

        <section className="section final-cta" id="contact">
          <div className="container final-cta-inner">
            <Reveal className="final-cta-copy">
              <span className="eyebrow">Move your school forward</span>
              <h2>See what one connected school day could feel like.</h2>
              <p>Tell us what your school uses today. We’ll build a focused walkthrough around the workflows that matter most.</p>
              <div><a className="button button-coral" href="mailto:demo@fullschool.example?subject=Full%20School%20demo">Book a demo <ArrowRight /></a><a className="button button-outline-light" href="mailto:sales@fullschool.example">Contact sales</a></div>
            </Reveal>
            <Reveal className="cta-contact" direction="right"><Mail /><small>Talk to our school team</small><strong>Within one school day</strong><p>A tailored conversation, not a generic sales presentation.</p></Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-top">
          <div><a className="brand" href="#top"><span className="brand-mark"><i /><i /><i /></span><span>Full School</span></a><p>One connected platform for a clearer school day.</p></div>
          <a className="footer-login" href={appUrl}>Login to Full School <ArrowRight /></a>
        </div>
        <div className="container footer-grid">
          {[
            ['Platform', ['Overview', 'Student information', 'Teaching and learning', 'Communication']],
            ['Solutions', ['Attendance', 'Homework', 'Reporting', 'Analytics']],
            ['Roles', ['School leaders', 'Teachers', 'Families', 'Students']],
            ['Resources', ['Implementation', 'Help center', 'Security', 'System status']],
            ['Company', ['About', 'Careers', 'Partners', 'Contact']],
          ].map(([title, links]) => <div className="footer-column" key={title as string}><strong>{title as string}</strong>{(links as string[]).map((link) => <a href={`#${link.toLowerCase().replaceAll(' ', '-')}`} key={link}>{link}</a>)}</div>)}
        </div>
        <div className="container footer-bottom"><span>© 2026 Full School. Demo marketing website.</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#accessibility">Accessibility</a><a href="#linkedin" aria-label="LinkedIn"><Linkedin /></a><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="#facebook" aria-label="Facebook"><Facebook /></a></div></div>
      </footer>
    </div>
  );
}

export default App;
