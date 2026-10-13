import React, { useRef } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardFooter() {
  return (
    <footer className="dashboard-footer mt-6 w-full bg-transparent p-3 text-slate-500 dark:text-zinc-400">
      <div className="footer-shell relative flex min-h-[430px] overflow-hidden rounded-xl bg-white/45 px-7 pb-24 pt-8 dark:bg-[#090909]/70 sm:px-12 sm:py-10 lg:px-16">
        <div className="relative z-10 grid w-full content-center gap-8 py-6 md:grid-cols-[1.7fr_1fr_1fr_1fr] lg:gap-14">
          <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">Auth<span className="text-primary">Flow</span></span>
          </Link>
            <p className="mt-4 max-w-xs text-xs leading-5">Simple, secure identity and account management in one place.</p>
            <p className="mt-5 text-[10px]">© {new Date().getFullYear()} AuthFlow Platform.<br />All rights reserved.</p>
          </div>

          <FooterColumn title="Workspace" links={[["Overview", "/dashboard"], ["Profile", "/profile"], ["Addresses", "/addresses"]]} />
          <FooterColumn title="Account" links={[["Edit profile", "/profile/edit"], ["Security", "/dashboard"], ["Saved locations", "/addresses"]]} />
          <div>
            <h3 className="text-xs font-semibold text-slate-950 dark:text-white">Security</h3>
            <ul className="mt-4 space-y-3 text-xs">
              <li className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>Systems operational</li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" />Encrypted session</li>
              <li>Privacy protected</li>
            </ul>
          </div>
        </div>
        <SpotlightWordmark />
      </div>
    </footer>
  );
}

function SpotlightWordmark() {
  const wordmarkRef = useRef(null);

  const moveSpotlight = (event) => {
    const bounds = wordmarkRef.current?.getBoundingClientRect();
    if (!bounds) return;
    wordmarkRef.current.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    wordmarkRef.current.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <div ref={wordmarkRef} onPointerMove={moveSpotlight} className="footer-wordmark absolute inset-x-0 bottom-[-1rem] select-none whitespace-nowrap text-center font-extrabold leading-none" aria-hidden="true">
      <span className="footer-wordmark-base">Auth Flow</span>
      <span className="footer-wordmark-light" aria-hidden="true">Auth Flow</span>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-950 dark:text-white">{title}</h3>
      <ul className="mt-4 space-y-3 text-xs">
        {links.map(([label, path]) => <li key={label}><Link className="transition-colors hover:text-primary" to={path}>{label}</Link></li>)}
      </ul>
    </div>
  );
}

export default DashboardFooter;
