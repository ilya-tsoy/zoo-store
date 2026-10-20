import React from 'react';

export default function LizardIntro() {
  return (
    <section className="lizard-intro" aria-labelledby="lizard-title">
      <div>
        <p className="lizard-eyebrow">Little creatures. Big personalities.</p>
        <h1 id="lizard-title">A little more wild.<br />A lot more home.</h1>
        <p>Make room for basking, climbing, and quiet hideaways. Discover thoughtful goods for your lizard’s everyday world.</p>
        <a className="lizard-shop-link" href="#lizard-products">Shop lizard supplies <span aria-hidden="true">↗</span></a>
      </div>
      <div className="lizard-hero-art">
        <img src="/images/lizards/terrarium.svg" alt="Illustrated terrarium with a climbing branch, leafy plants, and a sandstone hide" />
        <span>A habitat with personality</span>
      </div>
    </section>
  );
}
