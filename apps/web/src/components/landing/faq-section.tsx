'use client';

import { useState } from 'react';
import { faqs } from '@/data/landing-data';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative overflow-hidden py-28 lg:py-36">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div
          className="h-full w-full animate-grid-move bg-repeat"
          style={{
            backgroundImage:
              'linear-gradient(rgba(251, 146, 60, 0.15) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(251, 146, 60, 0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-10">
        <div className="mx-auto mb-16 max-w-[900px] text-center">
          <h2 className="mb-6 text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]">
            Frequently Asked Questions
          </h2>
          <p className="text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]">
            Everything you need to know before your first investment
          </p>
        </div>

        {/* FAQ Animation Graphics */}
        <div className="relative mx-auto mb-12 flex h-32 items-center justify-center gap-8">
          {/* Apple */}
          <div className="h-16 w-16 animate-float">
            <svg
              viewBox="0 0 50 50"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full drop-shadow-lg"
            >
              <circle cx="25" cy="30" r="12" fill="#dc2626" />
              <circle cx="18" cy="22" r="10" fill="#ef4444" />
              <circle cx="32" cy="25" r="9" fill="#dc2626" />
              <rect x="23.5" y="15" width="2" height="11" fill="#654321" />
              <ellipse
                cx="29"
                cy="17"
                rx="4"
                ry="3"
                fill="#22c55e"
                transform="rotate(45 29 17)"
              />
              <circle cx="22" cy="25" r="3" fill="#fca5a5" opacity="0.7" />
            </svg>
          </div>

          {/* Lightbulb */}
          <div className="h-20 w-20 animate-float animation-delay-200">
            <svg
              viewBox="0 0 60 60"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full drop-shadow-lg"
            >
              <circle
                cx="30"
                cy="20"
                r="10"
                fill="#fbbf24"
                stroke="#fb923c"
                strokeWidth="1.5"
              />
              <circle cx="30" cy="20" r="8" fill="#fef08a" opacity="0.8" />
              <path
                d="M22 30 Q22 35 25 38 L35 38 Q38 35 38 30"
                fill="#fbbf24"
                stroke="#fb923c"
                strokeWidth="1.5"
              />
              <rect x="26" y="38" width="8" height="3" fill="#8b4513" />
              <rect x="24" y="42" width="12" height="2" fill="#654321" />
              <circle
                cx="30"
                cy="20"
                r="15"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1"
                opacity="0.4"
              />
              <circle
                cx="30"
                cy="20"
                r="20"
                fill="none"
                stroke="#f97316"
                strokeWidth="1"
                opacity="0.2"
              />
              <circle cx="30" cy="20" r="11" fill="#fef08a" opacity="0.3" />
            </svg>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-[800px] space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-card/70"
              >
                <span className="pr-4 font-semibold text-foreground">
                  {faq.question}
                </span>
                <span
                  className={`flex-shrink-0 text-xl text-orange-400 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="border-t border-border p-6 pt-4 text-sm leading-[1.65] text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



