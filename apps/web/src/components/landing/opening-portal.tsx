'use client';

import React, { useState, useEffect } from 'react';

interface OpeningPortalProps {
  onComplete: () => void;
}

export function OpeningPortal({ onComplete }: OpeningPortalProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    // Show welcome screen after portal animation
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  const handleExplore = () => {
    onComplete();
  };

  if (isSkipped) return null;

  return (
    <>
      {/* OPENING PORTAL */}
      {!showWelcome && (
        <div
          className="fixed inset-0 z-[9999] flex bg-black animate-fade-out-portal cursor-pointer"
          onClick={handleSkip}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 animate-grid-pulse"
            style={{
              backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
            `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* LEFT SIDE - Blockchain */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden border-r border-slate-700/30 bg-gradient-to-br from-slate-950/50 to-slate-900/50">
            {/* Floating Orb - Cyan */}
            <div
              className="absolute top-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-slate-400/10 blur-[100px] animate-orb-float"
              style={{ animationDelay: '0s' }}
            />
            {/* Floating Orb - Purple */}
            <div
              className="absolute bottom-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-slate-500/10 blur-[100px] animate-orb-float"
              style={{ animationDelay: '1s' }}
            />

            <div className="relative z-10 text-center">
              <div className="mb-6 animate-float text-[6rem] text-slate-300 drop-shadow-2xl">
                ₿
              </div>
              <div className="mb-2 text-3xl font-extrabold uppercase tracking-[3px] text-slate-300">
                Blockchain
              </div>
              <div className="text-sm uppercase tracking-[2px] text-slate-500">
                Decentralized • Transparent • Secure
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Traditional */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden border-l border-slate-700/30 bg-gradient-to-bl from-slate-950/50 to-slate-900/50">
            {/* Floating Orb - Orange/Gray */}
            <div
              className="absolute bottom-[15%] left-[15%] h-[400px] w-[400px] rounded-full bg-slate-400/10 blur-[100px] animate-orb-float"
              style={{ animationDelay: '0.5s' }}
            />

            <div className="relative z-10 text-center">
              <div
                className="mb-6 text-[6rem] text-slate-300 drop-shadow-2xl animate-float"
                style={{ animationDelay: '0.5s' }}
              >
                $
              </div>
              <div className="mb-2 text-3xl font-extrabold uppercase tracking-[3px] text-slate-300">
                Traditional
              </div>
              <div className="text-sm uppercase tracking-[2px] text-slate-500">
                Fiat • Familiar • Trusted
              </div>
            </div>
          </div>

          {/* CENTER - DOORS & LOGO */}
          <div className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center">
            <div className="relative flex h-1/2 w-full max-w-[600px] gap-0">
              {/* Door Left */}
              <div
                className="flex flex-1 items-center justify-center overflow-hidden rounded-l-[20px] border-2 border-slate-700/40 border-r border-slate-700/20 bg-gradient-to-br from-slate-800/20 to-slate-700/20 backdrop-blur-sm animate-door-open-left"
                style={{ perspective: '1000px' }}
              >
                <div className="text-4xl font-extrabold uppercase tracking-[4px] text-slate-300 animate-door-text-glow">
                  Crowd
                </div>
              </div>

              {/* Door Right */}
              <div
                className="flex flex-1 items-center justify-center overflow-hidden rounded-r-[20px] border-2 border-slate-700/40 border-l border-slate-700/20 bg-gradient-to-bl from-slate-800/20 to-slate-700/20 backdrop-blur-sm animate-door-open-right"
                style={{ perspective: '1000px' }}
              >
                <div className="text-4xl font-extrabold uppercase tracking-[4px] text-slate-300 animate-door-text-glow">
                  VC
                </div>
              </div>
            </div>

            {/* CENTER LOGO */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2">
              <div className="text-center text-5xl font-extrabold tracking-[2px]">
                <div className="opacity-0 animate-slide-in-left bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent animate-pulse-logo">
                  CROWD
                </div>
                <div className="opacity-0 animate-slide-in-right bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent animate-pulse-logo">
                  VC
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* WELCOME SCREEN */}
      {showWelcome && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black opacity-0 pointer-events-none animate-fade-in-welcome">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-30 animate-grid-move"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Floating Orbs */}
          <div className="pointer-events-none absolute top-[10%] right-[10%] h-[500px] w-[500px] rounded-full bg-slate-400/10 blur-[120px] animate-orb-float" />
          <div
            className="pointer-events-none absolute bottom-[10%] left-[5%] h-[600px] w-[600px] rounded-full bg-slate-500/8 blur-[120px] animate-orb-float"
            style={{ animationDelay: '2s' }}
          />

          {/* Welcome Content */}
          <div className="relative z-10 max-w-[800px] px-8 text-center">
            <h1 className="text-slate-400 mb-4 text-6xl font-extrabold animate-[slideInDown_0.8s_ease-out]">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent">
                Crowd
              </span>
              <span className="bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">
                VC
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-[600px] text-xl leading-relaxed text-slate-400 animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
              Where blockchain innovation meets venture capital. Ready to
              explore opportunities?
            </p>

            <div className="animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
              <button
                onClick={handleExplore}
                className="group relative overflow-hidden rounded-2xl border-2 border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 px-12 py-6 text-xl font-extrabold uppercase tracking-[2px] text-white transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-600 hover:shadow-[0_0_40px_rgba(148,163,184,0.2)]"
              >
                <span className="relative z-10">Explore →</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



