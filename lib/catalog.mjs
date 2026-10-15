export const products = [
  {
    id: "marigold",
    name: "Marigold Festive Saree",
    price: 1999,
    regular: 2999,
    color: "Marigold gold",
    images: ["gold", "gold-detail", "gold-2", "gold-3", "gold-4"],
    description:
      "A warm golden palette for the moments you want to dress up. An occasion-ready style for festivals, family gatherings, and celebrations.",
  },
  {
    id: "emerald",
    name: "Emerald Celebration Saree",
    price: 2999,
    regular: 3999,
    color: "Emerald & pink",
    images: ["green"],
    description:
      "Deep green, a striking pink border, and decorative details. A statement look for your next celebration.",
  },
  {
    id: "ivory",
    name: "Ivory Floral Saree",
    price: 1499,
    regular: 2499,
    color: "Ivory floral",
    images: ["ivory", "ivory-2", "ivory-detail"],
    description:
      "A soft ivory palette with colourful floral accents. A versatile look for daytime outings and family occasions.",
  },
];
export const money = (n) => "Rs. " + Number(n).toLocaleString("en-NP");
export const getProduct = (id) => products.find((p) => p.id === id);
export const delivery = (zone) => (zone === "valley" ? 100 : 150);
export const faqs = [
  [
    "Where do you deliver?",
    "We accept orders throughout Nepal. Delivery is Rs. 100 inside Kathmandu Valley and Rs. 150 outside the Valley. Our team will confirm availability for your exact address.",
  ],
  [
    "How do I pay?",
    "Pay cash when your order is delivered. No online payment is required.",
  ],
  [
    "What happens after I order?",
    "Our sales representative will call to confirm the style, availability, address, and delivery arrangements.",
  ],
  [
    "How do I confirm product details?",
    "Ask our representative about measurements, fabric, blouse inclusion, and care instructions during the confirmation call before dispatch.",
  ],
  [
    "Will colours look exactly like the photo?",
    "Screen settings and lighting can affect colours. Confirm the colour and available style with our team.",
  ],
  [
    "Can I change or cancel my order?",
    "Email pasmanjitukumar@gmail.com as soon as possible with your order ID. Our team will confirm whether changes are possible before dispatch.",
  ],
  [
    "What is the return or exchange policy?",
    "Ask our team about applicable return and exchange terms before confirming your order. For an issue on delivery, email your order ID and photos.",
  ],
];
