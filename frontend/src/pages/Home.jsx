import { Link } from 'react-router-dom';
import { FiArrowRight, FiDollarSign, FiPieChart, FiTag, FiShield, FiSmartphone, FiBarChart2 } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';

const features = [
  { icon: FiDollarSign, title: 'Track income & expenses', desc: 'Log every transaction with a description, amount, category, and date. Income or expense — it\'s all in one place.' },
  { icon: FiBarChart2, title: 'Visual dashboard', desc: 'See your balance, income, and expenses at a glance. Bar charts and category donuts make patterns obvious.' },
  { icon: FiPieChart, title: 'Analytics & insights', desc: 'Break down spending by category, compare monthly trends, and understand where your money actually goes.' },
  { icon: FiTag, title: 'Custom categories', desc: 'Organize transactions your way. Create, edit, and color-code categories for income and expenses.' },
  { icon: FiShield, title: '100% private', desc: 'Everything stays in your browser\'s localStorage. No accounts, no cloud, no data leaves your machine.' },
  { icon: FiSmartphone, title: 'Works everywhere', desc: 'Responsive design works on desktop, tablet, and phone. Open the page and go — no install needed.' },
];

const steps = [
  { num: '01', title: 'Create an account', desc: 'Takes about 10 seconds. Just a name, email, and password — all stored locally.' },
  { num: '02', title: 'Add transactions', desc: 'Log your income and expenses as they happen. Categorize them so patterns emerge.' },
  { num: '03', title: 'Understand your money', desc: 'Check the dashboard and analytics to see where you stand, in real time.' },
];

function FadeSection({ children, className = '', delay = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`${inView ? `animate-fade-up ${delay}` : 'opacity-0'} ${className}`}>
      {children}
    </div>
  );
}

function StaggerChild({ children, index }) {
  const [ref, inView] = useInView();
  const delays = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5', 'stagger-6'];
  return (
    <div ref={ref} className={`${inView ? `animate-fade-up ${delays[index] || ''}` : 'opacity-0'}`}>
      {children}
    </div>
  );
}

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <span className="text-sm font-semibold tracking-tight">$ monitor</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-secondary-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="inline-flex items-center gap-1 bg-foreground text-background text-sm font-medium rounded-md px-4 py-1.5 hover:opacity-90 transition-opacity">
              Get started <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-24">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="mb-6">
            <span className="text-6xl md:text-7xl font-light tracking-tighter">$</span>
            <span className="text-6xl md:text-7xl font-light tracking-tighter ml-1">monitor</span>
          </div>
          <p className="text-secondary-foreground text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
            Track your expenses without handing your data to anyone.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="group inline-flex items-center gap-1.5 bg-foreground text-background text-sm font-medium rounded-md px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all duration-150">
              Start tracking <FiArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground border border-border rounded-md px-6 py-2.5 hover:bg-secondary active:scale-[0.98] transition-all duration-150">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <p className="text-xs font-medium text-secondary-foreground uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">Everything you need to manage your money</h2>
            <p className="text-sm text-secondary-foreground mt-3 max-w-lg mx-auto">No bells, no whistles. Just the tools that actually help you understand your spending.</p>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-md overflow-hidden">
            {features.map((f, i) => (
              <StaggerChild key={f.title} index={i}>
                <div className="bg-background p-6 md:p-8 group hover:bg-secondary/30 transition-colors duration-300">
                  <div className="w-9 h-9 rounded-md border border-border flex items-center justify-center mb-4 group-hover:border-foreground/30 transition-colors duration-300">
                    <f.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1.5">{f.title}</h3>
                  <p className="text-xs text-secondary-foreground leading-relaxed">{f.desc}</p>
                </div>
              </StaggerChild>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <p className="text-xs font-medium text-secondary-foreground uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">Three steps to clarity</h2>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((s, i) => (
              <StaggerChild key={s.num} index={i}>
                <div className="text-center group">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mx-auto mb-4 group-hover:border-foreground/40 transition-colors duration-300">
                    <span className="text-xs font-mono text-secondary-foreground">{s.num}</span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1.5">{s.title}</h3>
                  <p className="text-xs text-secondary-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </StaggerChild>
            ))}
          </div>
        </div>
      </section>

      <FadeSection>
        <section className="border-y border-border py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">Ready to take control?</h2>
            <p className="text-sm text-secondary-foreground mb-8 max-w-sm mx-auto">No sign-up fees. No servers. No fine print. Just a simple page that respects your privacy.</p>
            <Link to="/register" className="group inline-flex items-center gap-1.5 bg-foreground text-background text-sm font-medium rounded-md px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all duration-150">
              Get started for free <FiArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </section>
      </FadeSection>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">&copy; 2024 $ monitor</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs text-secondary-foreground hover:text-foreground transition-colors">Sign in</Link>
          <Link to="/register" className="text-xs text-secondary-foreground hover:text-foreground transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
