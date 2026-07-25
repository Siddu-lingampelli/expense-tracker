import { Link } from 'react-router-dom';
import { FiArrowRight, FiDollarSign, FiPieChart, FiTag, FiShield, FiSmartphone, FiBarChart2, FiCheck } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';

const features = [
  { icon: FiBarChart2, title: 'Dashboard at a glance', desc: 'Balance, income, expenses, and recent activity — all on one screen. No digging required.' },
  { icon: FiDollarSign, title: 'Log transactions fast', desc: 'Add income or expenses with description, amount, and category. Everything is searchable and filterable.' },
  { icon: FiPieChart, title: 'Analytics that matter', desc: 'Monthly trends, category breakdowns, and spending patterns visualized so you actually use them.' },
  { icon: FiTag, title: 'Categories, your way', desc: 'Create, edit, and color-code categories for income and expenses. Customize to match your life.' },
  { icon: FiShield, title: 'Your data stays yours', desc: 'Everything lives in your browser. No cloud, no servers, no accounts to compromise.' },
  { icon: FiSmartphone, title: 'Works on any screen', desc: 'Responsive from phone to ultrawide. Open the page and go — zero setup.' },
];

const steps = [
  { num: '01', title: 'Create an account', desc: 'Name, email, password — done in seconds. Everything stays local on your machine.' },
  { num: '02', title: 'Add your transactions', desc: 'Log income and expenses as they happen. Categorize them so patterns jump out.' },
  { num: '03', title: 'Watch your money click', desc: 'Dashboard and analytics update in real time. See exactly where you stand, always.' },
];

function FadeSection({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`${inView ? 'animate-fade-up' : 'opacity-0'} ${className}`}>
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

function DashboardMockup() {
  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <span className="text-xs font-semibold tracking-tight">$ monitor</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-2xs text-secondary-foreground">online</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-background rounded p-2.5">
          <p className="text-2xs text-secondary-foreground mb-0.5">Balance</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">$4,280</p>
        </div>
        <div className="bg-background rounded p-2.5">
          <p className="text-2xs text-secondary-foreground mb-0.5">Income</p>
          <p className="text-sm font-semibold text-success tabular-nums">$5,200</p>
        </div>
        <div className="bg-background rounded p-2.5">
          <p className="text-2xs text-secondary-foreground mb-0.5">Expenses</p>
          <p className="text-sm font-semibold text-destructive tabular-nums">$920</p>
        </div>
      </div>
      <div className="flex items-end gap-1.5 mb-4 h-16 px-1">
        {[40, 65, 35, 80, 55, 70, 45].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full bg-primary/10 rounded-sm" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
      {['Groceries', 'Salary', 'Coffee', 'Freelance'].map((item, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-destructive' : 'bg-success'}`} />
            <span className="text-xs text-foreground">{item}</span>
          </div>
          <span className={`text-xs tabular-nums ${i % 2 === 0 ? 'text-destructive' : 'text-success'}`}>
            {i % 2 === 0 ? '-' : '+'}${[120, 3200, 16, 850][i]}
          </span>
        </div>
      ))}
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
            <Link to="/register" className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-medium rounded-md px-4 py-1.5 hover:opacity-90 transition-opacity">
              Get started <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground leading-[1.1] mb-5">
              Track expenses{' '}
              <span className="relative whitespace-nowrap">
                without the
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary/20" />
              </span>
              <br />
              <span className="font-medium">overhead</span>
            </h1>
            <p className="text-secondary-foreground text-base md:text-lg leading-relaxed max-w-md mb-8">
              Drop the spreadsheets and the privacy concerns. A fast, private expense tracker that lives entirely in your browser.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/register" className="group inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm">
                Start tracking <FiArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground border border-border rounded-md px-6 py-2.5 hover:bg-secondary active:scale-[0.98] transition-all duration-150">
                Sign in
              </Link>
            </div>
          </div>
          <div className="hidden lg:block animate-fade-in stagger-2">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-full h-full border border-primary/10 rounded-lg" />
              <div className="absolute -bottom-3 -left-3 w-full h-full border border-primary/10 rounded-lg" />
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {[
              { stat: 'Zero servers', label: '100% in-browser' },
              { stat: 'No sign-up fees', label: 'Free, period' },
              { stat: 'Works offline', label: 'After first load' },
              { stat: 'Private by design', label: 'No data leaves' },
            ].map((item, i) => (
              <FadeSection key={item.stat}>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.stat}</p>
                    <p className="text-2xs text-secondary-foreground">{item.label}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <p className="text-xs font-medium text-secondary-foreground uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Everything you need, nothing you don&apos;t</h2>
            <p className="text-sm text-secondary-foreground mt-3 max-w-lg mx-auto">Built for people who want clarity — not complexity.</p>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <StaggerChild key={f.title} index={i}>
                <div className="bg-white border border-border rounded-md p-6 h-full group hover:border-primary/15 hover:shadow-sm transition-all duration-200">
                  <div className="w-9 h-9 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-200">
                    <f.icon className="h-4 w-4 text-primary" />
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
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Three minutes to clarity</h2>
          </FadeSection>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-border" />
            {steps.map((s, i) => (
              <StaggerChild key={s.num} index={i}>
                <div className="text-center relative md:px-6">
                  <div className="w-14 h-14 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center mx-auto mb-5 relative z-10">
                    <span className="text-xs font-semibold text-primary-foreground">{s.num}</span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-2">{s.title}</h3>
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
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mb-4">Be in control of your money</h2>
            <p className="text-sm text-secondary-foreground mb-8 max-w-sm mx-auto">No servers. No accounts to hack. No fine print. Just a simple page that works.</p>
            <Link to="/register" className="group inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm">
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
