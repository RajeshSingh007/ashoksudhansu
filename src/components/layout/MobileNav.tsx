import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  navItems: NavItem[];
  cta: NavItem;
}

export default function MobileNav({ navItems, cta }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-cloud bg-snow/70 text-graphite"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-paper">
          <div className="flex h-[72px] items-center justify-between px-6">
            <span className="text-[18px] font-semibold tracking-[-0.01em] text-obsidian">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-cloud bg-snow text-graphite"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-6 pt-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-cloud py-4 text-[28px] font-semibold tracking-[-0.02em] text-obsidian"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto px-6 pb-10 pt-8">
            <a
              href={cta.href}
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-[14px] border border-[#2c2e34] bg-obsidian px-6 py-3.5 text-[16px] font-medium text-snow"
            >
              {cta.label}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
