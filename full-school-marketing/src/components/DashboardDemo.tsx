import { motion, useReducedMotion } from 'framer-motion';
import { Bell, CalendarDays, Check, ChevronRight, ClipboardCheck, MessageSquareText, Users } from 'lucide-react';

const bars = [48, 72, 61, 88, 76, 93, 84];

export function DashboardDemo({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.85;
  return (
    <motion.div
      className={`dashboard-demo ${compact ? 'dashboard-demo-compact' : ''}`}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.7, delay: 0.18 }}
      aria-label="Animated Full School dashboard preview"
    >
      <aside className="demo-sidebar">
        <span className="demo-logo"><i /><i /></span>
        {['Overview', 'Students', 'Attendance', 'Homework', 'Reports'].map((item, index) => (
          <span className={index === 0 ? 'active' : ''} key={item}><i />{!compact && item}</span>
        ))}
      </aside>
      <div className="demo-main">
        <header className="demo-header">
          <div><small>Good morning, Dr. Morgan</small><strong>School overview</strong></div>
          <div className="demo-header-actions"><span><Bell size={15} /><b /></span><em>DM</em></div>
        </header>
        <div className="demo-metrics">
          {[
            [Users, '1,248', 'Students', '+4.8%'],
            [ClipboardCheck, '94.6%', 'Attendance', '+1.2%'],
            [MessageSquareText, '32', 'New messages', '8 unread'],
          ].map(([Icon, value, label, change], index) => {
            const MetricIcon = Icon as typeof Users;
            return (
              <motion.article key={String(label)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 + index * 0.09, duration: 0.45 }}>
                <span><MetricIcon size={16} /></span><small>{String(label)}</small><strong>{String(value)}</strong><em>{String(change)}</em>
              </motion.article>
            );
          })}
        </div>
        <div className="demo-grid">
          <article className="demo-chart-card">
            <div className="demo-card-title"><div><small>Attendance</small><strong>This week</strong></div><span>94.6%</span></div>
            <div className="demo-bars">
              {bars.map((height, index) => (
                <div key={index}><motion.i initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration, delay: 0.48 + index * 0.06 }} /><small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small></div>
              ))}
            </div>
          </article>
          <article className="demo-today-card">
            <div className="demo-card-title"><div><small>Today</small><strong>Upcoming</strong></div><CalendarDays size={17} /></div>
            {[
              ['09:00', 'Year 9 assembly', 'Main hall'],
              ['11:30', 'Science assessment', 'Lab 2'],
              ['14:15', 'Parent meeting', 'Online'],
            ].map(([time, title, place], index) => (
              <motion.div className="demo-event" key={title} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + index * 0.12 }}>
                <time>{time}</time><span><strong>{title}</strong><small>{place}</small></span>
              </motion.div>
            ))}
          </article>
          <article className="demo-homework-card">
            <div className="demo-card-title"><div><small>Homework</small><strong>Latest activity</strong></div><span>View all <ChevronRight size={13} /></span></div>
            {[
              ['Algebra worksheet', 'Year 10 Mathematics', '86%'],
              ['Cell biology report', 'Year 9 Science', '72%'],
              ['Poetry analysis', 'Year 11 English', '91%'],
            ].map(([title, detail, progress], index) => (
              <motion.div className="demo-homework-row" key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 + index * 0.1 }}>
                <span><Check size={13} /></span><div><strong>{title}</strong><small>{detail}</small></div><em>{progress}</em>
              </motion.div>
            ))}
          </article>
        </div>
      </div>
      <motion.div className="demo-toast" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.15, duration: 0.45 }}>
        <span><MessageSquareText size={16} /></span><div><strong>New parent message</strong><small>Year 8 trip permission confirmed</small></div>
      </motion.div>
    </motion.div>
  );
}
