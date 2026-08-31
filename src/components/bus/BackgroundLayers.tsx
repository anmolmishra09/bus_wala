'use client';

export default function BackgroundLayers() {
  return (
    <>
      {/* ① Sky base — matches reference: rgb(19,10,7) → rgb(53,28,17) → rgb(125,73,46) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-50"
        style={{
          background: 'linear-gradient(rgb(38, 20, 12) 0%, rgb(82, 44, 24) 40%, rgb(158, 95, 55) 100%)',
        }}
      />

      {/* ② Cloud layer — top 75%, opacity 0.65, covers sky */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-40"
        style={{
          height: '75%',
          backgroundImage: 'url("https://cdn.busdriver.wtf/v1/clouds.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          opacity: 0.65,
        }}
      />

      {/* ③ Road strip — anchored just above player bar, with mask fade on edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 -z-30"
        style={{
          bottom: 'var(--player-h)',
          height: 'var(--road-h)',
          maskImage: 'linear-gradient(transparent 0%, rgb(0,0,0) 12%, rgb(0,0,0) 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(transparent 0%, rgb(0,0,0) 12%, rgb(0,0,0) 85%, transparent 100%)',
        }}
      >
        {/* Fallback image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.busdriver.wtf/v1/road.jpg"
          alt=""
          fetchPriority="high"
          className="size-full object-cover"
          style={{ objectPosition: 'center 55%' }}
        />
        {/* Looping road video on top */}
        <video
          autoPlay
          loop
          playsInline
          muted
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: 'center 55%' }}
        >
          <source src="https://cdn.busdriver.wtf/v1/road-wide.mp4" type="video/mp4" media="(min-width: 900px)" />
          <source src="https://cdn.busdriver.wtf/v1/road.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ④ Film grain overlay — soft-light blend, subtle noise texture */}
      <svg
        className="pointer-events-none fixed inset-0 -z-20 size-full mix-blend-soft-light"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ opacity: 0.35 }}
      >
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="15" stitchTiles="stitch" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feBlend in="SourceGraphic" in2="mono" mode="overlay" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>

      {/* ⑤ Left side vignette / shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 -z-10"
        style={{
          width: '20%',
          background: 'linear-gradient(to right, rgba(10, 4, 2, 0.6), transparent)',
        }}
      />

      {/* ⑥ Right side vignette / shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-0 -z-10"
        style={{
          width: '20%',
          background: 'linear-gradient(to left, rgba(10, 4, 2, 0.6), transparent)',
        }}
      />

      {/* ⑦ Top-edge darkening */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10"
        style={{
          height: '20%',
          background: 'linear-gradient(to bottom, rgba(8, 3, 1, 0.7), transparent)',
        }}
      />

      {/* ⑧ Bottom darkening just above the player */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 -z-10"
        style={{
          bottom: 0,
          height: '22%',
          background: 'linear-gradient(to top, rgba(6, 2, 0, 0.95), transparent)',
        }}
      />

      {/* ⑨ Radial corner vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 110% 80% at 50% 50%, transparent 35%, rgba(5, 2, 1, 0.6) 100%)',
        }}
      />
    </>
  );
}
