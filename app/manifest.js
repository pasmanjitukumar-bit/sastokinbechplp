export default function manifest() {
  return {
    id: "/",
    name: "SastoKinBech Saree Collection",
    short_name: "SastoKinBech",
    description: "Shop sarees with Cash on Delivery across Nepal.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#183e36",
    icons: [
      {
        src: "/icons/app-192-v2.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app-512-v2.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
