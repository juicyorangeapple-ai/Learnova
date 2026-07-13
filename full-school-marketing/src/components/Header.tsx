import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const navItems = [
  ['Platform', '#platform'],
  ['Solutions', '#solutions'],
  ['Roles', '#roles'],
  ['Resources', '#resources'],
  ['Company', '#about'],
];

export function Header({ appUrl }: { appUrl: string }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${solid ? 'site-header-solid' : ''}`}>
      <div className="utility-nav">
        <div className="wide-container utility-inner">
          <span>School management, connected.</span>
          <nav aria-label="Utility navigation">
            <a href="#roles">Families &amp; students</a>
            <a href="#faq">Support</a>
            <button type="button" aria-label="Search Full School"><Search size={14} /> Search</button>
            <a href={appUrl}>Login</a>
          </nav>
        </div>
      </div>

      <div className="wide-container primary-nav">
        <a className="brand" href="#top" aria-label="Full School home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Full School</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <a key={label} href={href}>{label}<ChevronDown size={13} aria-hidden="true" /></a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="header-demo desktop-only" href="#contact">Book a demo <ArrowRight size={15} /></a>
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              className="mobile-nav"
              initial={{ opacity: 0, y: reduceMotion ? 0 : -10, scale: reduceMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.98 }}
              aria-label="Mobile navigation"
            >
              {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={15} /></a>)}
              <a href="#faq" onClick={() => setOpen(false)}>Support <ArrowRight size={15} /></a>
              <a href={appUrl}>Login <ArrowRight size={15} /></a>
              <a className="button" href="#contact" onClick={() => setOpen(false)}>Book a demo <ArrowRight size={16} /></a>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
