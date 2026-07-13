import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, SectionHeading } from './Motion';

const plans = [
  { name: 'Starter', price: 'From $4', suffix: 'per student / year', copy: 'Core operations for growing schools.', features: ['Attendance and timetable', 'Homework and grades', 'Parent and student portals', 'Standard reports'] },
  { name: 'Professional', price: 'From $7', suffix: 'per student / year', copy: 'The complete connected school experience.', popular: true, features: ['Everything in Starter', 'Advanced analytics', 'Automated communications', 'Custom roles and workflows', 'Branded PDF reports'] },
  { name: 'Enterprise', price: 'Let’s talk', suffix: 'tailored to your group', copy: 'Control, support, and scale for school groups.', features: ['Everything in Professional', 'Multi-school management', 'Priority onboarding', 'SLA and dedicated support', 'Custom integrations'] },
];

export function Pricing() {
  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <SectionHeading eyebrow="Simple pricing" title="A platform that grows with your school." copy="Clear plans, thoughtful onboarding, and no surprise modules for the basics your school depends on." align="center" />
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 0.08}>
              <motion.article className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`} whileHover={{ y: -6 }}>
                {plan.popular && <span className="popular-label"><Sparkles size={14} /> Most popular</span>}
                <small>{plan.name}</small><h3>{plan.price}</h3><span className="price-suffix">{plan.suffix}</span><p>{plan.copy}</p>
                <a className={`button ${plan.popular ? '' : 'button-secondary'}`} href="#contact">{plan.name === 'Enterprise' ? 'Contact sales' : 'Book a demo'}</a>
                <ul>{plan.features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
