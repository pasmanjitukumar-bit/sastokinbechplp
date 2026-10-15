"use client";
import { useState } from "react";
import { products, money, delivery, faqs } from "../lib/catalog.mjs";
export default function Storefront() {
  const [index, setIndex] = useState(0),
    [slide, setSlide] = useState(0),
    [qty, setQty] = useState(1),
    [zone, setZone] = useState("valley");
  const p = products[index],
    link = "/checkout?product=" + p.id + "&quantity=" + qty + "&zone=" + zone;
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">THE SASTOKINBECH SAREE EDIT — 01</p>
          <h1>
            For the everyday.
            <br />
            And the <em>extraordinary.</em>
          </h1>
          <p className="intro">
            A little colour. A beautiful drape. A style that feels like you.
            Discover sarees for moments big and small.
          </p>
          <a className="button" href="#collection">
            Discover the collection <span>↗</span>
          </a>
          <a className="text-link hero-order" href={link}>
            Order Now ↗
          </a>
          <div className="hero-note">
            <span>✧ Made for your moments</span>
            <span>↗ Delivered across Nepal</span>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/products/gold.png"
            alt="Marigold gold festive saree"
            fetchPriority="high"
          />
          <div className="image-tag">
            THE GOLDEN HOUR EDIT <span>Rs. 1,999</span>
          </div>
          <span className="vertical-label">DRESS UP. FEEL YOURSELF.</span>
        </div>
      </section>
      <div className="trust">
        <span>◈ CASH ON DELIVERY</span>
        <span>↗ ALL OVER NEPAL</span>
        <span>✧ STYLES FOR YOUR OCCASIONS</span>
        <span>♡ A HUMAN TO HELP</span>
      </div>
      <section id="collection" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FIND YOUR NEXT FAVOURITE</p>
            <h2>
              One beautiful drape.
              <br />
              <em>So many possibilities.</em>
            </h2>
          </div>
          <p>
            Your celebrations, your colours, your style.
            <br />
            Explore our opening collection.
          </p>
        </div>
        <div className="tabs">
          {products.map((x, i) => (
            <button
              key={x.id}
              className={i === index ? "active" : ""}
              onClick={() => {
                setIndex(i);
                setSlide(0);
              }}
            >
              {x.name}
              <small>{money(x.price)}</small>
            </button>
          ))}
        </div>
        <div className="showcase">
          <div>
            <div className="main-photo">
              <img
                src={"/products/" + p.images[slide] + ".png"}
                alt={p.name + " view " + (slide + 1)}
              />
              <span className="count">
                {slide + 1} / {p.images.length}
              </span>
              <div className="arrows">
                <button
                  aria-label="Previous image"
                  onClick={() =>
                    setSlide((slide + p.images.length - 1) % p.images.length)
                  }
                >
                  ←
                </button>
                <button
                  aria-label="Next image"
                  onClick={() => setSlide((slide + 1) % p.images.length)}
                >
                  →
                </button>
              </div>
            </div>
            <div className="thumbnails">
              {p.images.map((src, i) => (
                <button
                  key={src}
                  aria-label={"View photo " + (i + 1)}
                  className={slide === i ? "chosen" : ""}
                  onClick={() => setSlide(i)}
                >
                  <img src={"/products/" + src + ".png"} alt="" />
                </button>
              ))}
            </div>
          </div>
          <div className="product-info">
            <p className="eyebrow">A STYLE FOR YOUR SPECIAL MOMENTS</p>
            <h2>{p.name}</h2>
            <div className="price">
              {money(p.price)} <del>{money(p.regular)}</del>
              <small>Save {money(p.regular - p.price)}</small>
            </div>
            <p>{p.description}</p>
            <ul>
              <li>✧ A distinctive look for your occasion</li>
              <li>✧ Mix with pieces you already love</li>
              <li>✧ Confirm product details with our team</li>
            </ul>
            <p className="colour">
              COLOUR <strong>{p.color}</strong>
            </p>
            <div className="controls">
              <div>
                <label>QUANTITY</label>
                <div className="quantity">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    −
                  </button>
                  <output>{qty}</output>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => setQty(Math.min(20, qty + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="zone">DELIVERY LOCATION</label>
                <select
                  id="zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  <option value="valley">Inside Valley · Rs. 100</option>
                  <option value="outside">Outside Valley · Rs. 150</option>
                </select>
              </div>
            </div>
            <div className="total">
              <span>Total, including delivery</span>
              <strong>{money(p.price * qty + delivery(zone))}</strong>
            </div>
            <a className="button full" href={link}>
              Order Now — Cash on Delivery <span>↗</span>
            </a>
            <p className="fine">
              No payment now. Our team will call to confirm your order.
            </p>
          </div>
        </div>
      </section>
      <section id="why" className="section benefits">
        <p className="eyebrow">A GOOD FIND SHOULD FEEL SIMPLE</p>
        <h2>
          A little less effort.
          <br />
          <em>A lot more you.</em>
        </h2>
        <div className="three">
          {[
            [
              "01",
              "For your kind of occasion",
              "From everyday plans to festive gatherings, explore styles that fit your life.",
            ],
            [
              "02",
              "Make it your own",
              "Mix colours and individual pieces with favourites already in your wardrobe.",
            ],
            [
              "03",
              "Shop from wherever you are",
              "Browse from home and order with Cash on Delivery, anywhere in Nepal.",
            ],
          ].map(([n, t, d]) => (
            <article key={n}>
              <span className="number">{n} /</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
        <a className="text-link" href={link}>
          Find your style & order ↗
        </a>
      </section>
      <section
        className="section shopping-steps"
        aria-labelledby="shopping-steps-title"
      >
        <p className="eyebrow">FROM YOUR FIRST CLICK TO YOUR DOOR</p>
        <h2 id="shopping-steps-title">
          Your style. <em>Three simple steps.</em>
        </h2>
        <div className="three">
          {[
            [
              "01",
              "Choose your saree",
              "Explore the collection, select your favourite style, and choose your quantity.",
            ],
            [
              "02",
              "We call to confirm",
              "Share your contact details and exact delivery address. Our team will call to confirm your order.",
            ],
            [
              "03",
              "Pay on delivery",
              "Receive your order in Nepal and pay cash on delivery. Delivery is Rs. 100 inside Kathmandu Valley and Rs. 150 outside.",
            ],
          ].map(([number, title, description]) => (
            <article key={number}>
              <span className="number">{number} /</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <a className="text-link" href={link}>
          Choose your saree &amp; order ↗
        </a>
      </section>
      <section id="faq" className="section faq">
        <div>
          <p className="eyebrow">A FEW THINGS YOU MIGHT WONDER</p>
          <h2>
            Before you
            <br />
            <em>make it yours.</em>
          </h2>
          <a className="text-link" href="mailto:pasmanjitukumar@gmail.com">
            Ask us a question ↗
          </a>
        </div>
        <div>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-cta">
        <p className="eyebrow">YOUR NEXT SPECIAL MOMENT STARTS HERE</p>
        <h2>
          Wear a little <em>joy.</em>
        </h2>
        <a className="button light" href={link}>
          Purchase Now <span>↗</span>
        </a>
        <p className="fine">Cash on Delivery · Throughout Nepal</p>
      </section>
    </main>
  );
}
