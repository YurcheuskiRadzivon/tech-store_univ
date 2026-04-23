const PRODUCTS = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Audio",
    price: 299.99,
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1760708368699-69cb9ed56f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aXJlbGVzcyUyMGhlYWRwaG9uZXMlMjBibGFja3xlbnwxfHx8fDE3NzExODE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Experience immersive audio with our premium wireless headphones. Featuring advanced noise cancellation, 40-hour battery life, and studio-quality sound. Perfect for music enthusiasts and professionals who demand the best audio experience.",
    highlights: [
      { label: "Battery Life", value: "40 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Noise Cancellation", value: "Active ANC" },
    ],
    specs: [
      { label: "Driver Size", value: "40mm" },
      { label: "Frequency Response", value: "20Hz - 20kHz" },
      { label: "Impedance", value: "32 Ohm" },
      { label: "Battery", value: "40 hours (ANC off)" },
      { label: "Weight", value: "250g" },
      { label: "Warranty", value: "2 years" },
    ],
    relatedId: 5,
  },
  {
    id: 2,
    name: "Professional Laptop Pro",
    category: "Computers",
    price: 1899.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1673431738089-c4fc9c2e96a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMGRlc2slMjBzZXR1cHxlbnwxfHx8fDE3NzExODE4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Powerful performance meets sleek design in this professional laptop. Equipped with the latest processor, stunning display, and all-day battery life. Ideal for creative professionals and power users.",
    highlights: [
      { label: "Processor", value: "Intel Core i9" },
      { label: "RAM", value: "32GB DDR5" },
      { label: "Storage", value: "1TB SSD" },
    ],
    specs: [
      { label: "Display", value: '16" 4K IPS' },
      { label: "Processor", value: "Intel Core i9" },
      { label: "Memory", value: "32GB DDR5" },
      { label: "Storage", value: "1TB NVMe SSD" },
      { label: "Graphics", value: "Dedicated 8GB" },
      { label: "Battery", value: "Up to 12 hours" },
    ],
    relatedId: null,
  },
  {
    id: 3,
    name: "Smart Fitness Watch Ultra",
    category: "Wearables",
    price: 449.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1665860455418-017fa50d29bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHdhdGNoJTIwZml0bmVzcyUyMHRyYWNrZXJ8ZW58MXx8fHwxNzcxMTUyOTc0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Track your fitness goals with precision and style. Features advanced health monitoring, GPS tracking, and a vibrant always-on display. Water-resistant and built for active lifestyles.",
    highlights: [
      { label: "Display", value: '1.9" AMOLED' },
      { label: "Battery Life", value: "7 days" },
      { label: "Water Resistance", value: "50m" },
    ],
    specs: [
      { label: "Display", value: '1.9" AMOLED' },
      { label: "GPS", value: "Dual-frequency" },
      { label: "Sensors", value: "Heart rate, SpO2" },
      { label: "Battery", value: "7 days typical use" },
      { label: "Water Rating", value: "5 ATM" },
      { label: "Compatibility", value: "iOS & Android" },
    ],
    relatedId: null,
  },
  {
    id: 4,
    name: "Professional DSLR Camera",
    category: "Photography",
    price: 2499.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1532272278764-53cd1fe53f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBwaG90b2dyYXBoeSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzExNDIxODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Capture stunning images with this professional-grade DSLR camera. Features a full-frame sensor, 4K video recording, and exceptional low-light performance. Perfect for serious photographers and videographers.",
    highlights: [
      { label: "Sensor", value: "45MP Full-Frame" },
      { label: "Video", value: "4K 60fps" },
      { label: "ISO Range", value: "100-51200" },
    ],
    specs: [
      { label: "Sensor", value: "45MP Full-Frame CMOS" },
      { label: "Video", value: "4K 60fps, 10-bit" },
      { label: "ISO Range", value: "100-51200 (expandable)" },
      { label: "Mount", value: "EF / RF compatible" },
      { label: "Storage", value: "Dual SD UHS-II" },
      { label: "Weight", value: "650g (body only)" },
    ],
    relatedId: null,
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    category: "Audio",
    price: 129.99,
    rating: 3.5,
    image:
      "https://images.unsplash.com/photo-1674303324806-7018a739ed11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBzcGVha2VyJTIwcG9ydGFibGV8ZW58MXx8fHwxNzcxMTE2NTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      "Take your music anywhere with this powerful portable speaker. Delivers rich, immersive sound with deep bass. Waterproof design perfect for outdoor adventures and pool parties.",
    highlights: [
      { label: "Output Power", value: "20W" },
      { label: "Battery Life", value: "15 hours" },
      { label: "Water Rating", value: "IPX7" },
    ],
    specs: [
      { label: "Output Power", value: "20W" },
      { label: "Battery Life", value: "15 hours" },
      { label: "Water Rating", value: "IPX7" },
      { label: "Bluetooth", value: "5.2" },
      { label: "Range", value: "30 meters" },
      { label: "Charging", value: "USB-C" },
    ],
    relatedId: 1,
  },
  {
    id: 6,
    name: "Ultra-Thin Tablet Pro",
    category: "Tablets",
    price: 799.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1740637977676-c8040b41dc7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWJsZXQlMjBkZXZpY2UlMjBzY3JlZW58ZW58MXx8fHwxNzcxMTEwNDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    description:
      'Experience productivity and entertainment on a stunning display. This ultra-thin tablet features powerful performance, all-day battery, and support for stylus input. Perfect for work and play.',
    highlights: [
      { label: "Display", value: '12.9" Liquid Retina' },
      { label: "Processor", value: "M2 Chip" },
      { label: "Storage", value: "256GB" },
    ],
    specs: [
      { label: "Display", value: '12.9" Liquid Retina' },
      { label: "Processor", value: "M2 Chip" },
      { label: "Storage", value: "256GB" },
      { label: "RAM", value: "8GB" },
      { label: "Battery", value: "10 hours" },
      { label: "Stylus Support", value: "Yes" },
    ],
    relatedId: null,
  },
];
