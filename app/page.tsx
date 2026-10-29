"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Heart,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  MapPin,
  Menu,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

type Size = number | string;
type Product = {
  id: number;
  name: string;
  category: "Sneakers" | "Slides" | "Jerseys";
  price: number;
  description: string;
  image: string;
  sizes: Size[];
  stock: Record<string, number>;
  tag?: string;
};
type Line = {
  productId: number;
  size: Size;
  quantity: number;
  customName?: string;
  customNumber?: string;
};
type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: Line[];
  total: number;
  payment: "Paid" | "Pending" | "Failed";
  status: "Paid" | "Sourcing" | "Ready" | "Delivered";
  created: string;
};
type Screen =
  | "shop"
  | "product"
  | "cart"
  | "checkout"
  | "payment"
  | "confirmation"
  | "login"
  | "admin";
const catalog: Product[] = [
  {
    id: 1,
    name: "Cloudfoam Everyday",
    category: "Sneakers",
    price: 480,
    description:
      "A soft, versatile everyday sneaker with all-day cushioning and a clean finish.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
    sizes: [36, 37, 38, 39, 40, 41, 42, 43],
    stock: { 36: 2, 37: 3, 38: 4, 39: 2, 40: 3, 41: 1, 42: 2, 43: 2 },
    tag: "Best seller",
  },
  {
    id: 2,
    name: "Air Max Pulse",
    category: "Sneakers",
    price: 620,
    description:
      "Lightweight daily comfort with a plush profile made for long city days.",
    image:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85",
    sizes: [37, 38, 39, 40, 41, 42, 43, 44],
    stock: { 37: 2, 38: 3, 39: 2, 40: 4, 41: 3, 42: 2, 43: 1, 44: 2 },
    tag: "New in",
  },
  {
    id: 3,
    name: "Cushion Slide Sand",
    category: "Slides",
    price: 220,
    description:
      "An easy, cushioned slide for off-duty moments, errands and sunny weekends.",
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1000&q=85",
    sizes: [36, 37, 38, 39, 40, 41, 42],
    stock: { 36: 1, 37: 2, 38: 3, 39: 3, 40: 2, 41: 1, 42: 2 },
    tag: "Low stock",
  },
  {
    id: 4,
    name: "Retro Court White",
    category: "Sneakers",
    price: 550,
    description:
      "A timeless court silhouette with a crisp upper and easy-to-style neutral palette.",
    image:
      "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1000&q=85",
    sizes: [36, 37, 38, 39, 40, 41, 42],
    stock: { 36: 3, 37: 2, 38: 3, 39: 1, 40: 2, 41: 3, 42: 2 },
  },
  {
    id: 5,
    name: "Bongo Matchday Jersey",
    category: "Jerseys",
    price: 350,
    description:
      "A lightweight matchday jersey made for your team colours, weekend football and everyday pride. Add your name and number for a personal finish.",
    image: "/images/bongo-matchday-jersey.png",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: { S: 4, M: 4, L: 5, XL: 3, XXL: 2 },
    tag: "Customisable",
  },
];
const seedOrders: Order[] = [
  {
    id: "BG-1048",
    customer: "Ama Mensah",
    phone: "024 000 0000",
    address: "East Legon, Accra",
    items: [{ productId: 1, size: 39, quantity: 1 }],
    total: 480,
    payment: "Paid",
    status: "Paid",
    created: "12 min ago",
  },
  {
    id: "BG-1047",
    customer: "Kojo Owusu",
    phone: "055 000 0000",
    address: "Osu, Accra",
    items: [{ productId: 3, size: 42, quantity: 1 }],
    total: 220,
    payment: "Paid",
    status: "Sourcing",
    created: "48 min ago",
  },
  {
    id: "BG-1046",
    customer: "Esi Boateng",
    phone: "020 000 0000",
    address: "Adenta, Accra",
    items: [{ productId: 2, size: 38, quantity: 1 }],
    total: 620,
    payment: "Paid",
    status: "Delivered",
    created: "Yesterday",
  },
];
const money = (n: number) => `GH₵${n.toLocaleString()}`;
const sizeText = (product: Product, size: Size) =>
  product.category === "Jerseys" ? `Size ${size}` : `UK ${size}`;

export default function Page() {
  const [screen, setScreen] = useState<Screen>("shop"),
    [products, setProducts] = useState(catalog),
    [orders, setOrders] = useState(seedOrders),
    [cart, setCart] = useState<Line[]>([]),
    [chosen, setChosen] = useState<Product | null>(null),
    [filter, setFilter] = useState("All"),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(""),
    [last, setLast] = useState<Order | null>(null);
  useEffect(() => {
    const v = localStorage.getItem("bongo-store");
    if (v)
      try {
        const x = JSON.parse(v);
        setProducts(x.products || catalog);
        setOrders(x.orders || seedOrders);
        setCart(x.cart || []);
      } catch {}
  }, []);
  useEffect(
    () =>
      localStorage.setItem(
        "bongo-store",
        JSON.stringify({ products, orders, cart }),
      ),
    [products, orders, cart],
  );
  useEffect(() => {
    const firestore = db;
    if (!firestore) return;
    const unsubscribe = onSnapshot(
      collection(firestore, "products"),
      (snapshot) => {
        if (!snapshot.empty)
          setProducts(snapshot.docs.map((item) => item.data() as Product));
      },
      () => {},
    );
    return unsubscribe;
  }, []);
  const lines = cart
    .map((l) => ({
      ...l,
      product: products.find((p) => p.id === l.productId)!,
    }))
    .filter((l) => l.product);
  const total = lines.reduce((n, l) => n + l.product.price * l.quantity, 0),
    count = cart.reduce((n, l) => n + l.quantity, 0);
  const toast = (s: string) => {
    setNotice(s);
    setTimeout(() => setNotice(""), 2200);
  };
  const saveProduct = async (product: Product) => {
    const response = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok)
      throw new Error("Could not save product. Please sign in again.");
    setProducts((items) =>
      items.some((item) => item.id === product.id)
        ? items.map((item) => (item.id === product.id ? product : item))
        : [...items, product],
    );
  };
  const removeProduct = async (id: number) => {
    const response = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error("Could not remove product. Please sign in again.");
    setProducts((items) => items.filter((item) => item.id !== id));
  };
  const updateOrder = async (id: string, status: Order["status"]) => {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok)
      throw new Error("Could not update order. Please sign in again.");
    setOrders((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };
  const loadOrders = async () => {
    const response = await fetch("/api/admin/orders");
    if (!response.ok)
      throw new Error("Could not load orders. Please sign in again.");
    const data = await response.json();
    setOrders(data.orders || []);
  };
  const add = (
    productId: number,
    size: Size,
    custom?: Pick<Line, "customName" | "customNumber">,
  ) => {
    setCart((x) => {
      const e = x.find(
        (l) =>
          l.productId === productId &&
          l.size === size &&
          l.customName === custom?.customName &&
          l.customNumber === custom?.customNumber,
      );
      return e
        ? x.map((l) => (l === e ? { ...l, quantity: l.quantity + 1 } : l))
        : [...x, { productId, size, quantity: 1, ...custom }];
    });
    toast("Added to your bag");
    setScreen("cart");
  };
  const quantity = (target: Line, d: number) =>
    setCart((x) =>
      x.flatMap((l) =>
        l.productId === target.productId &&
        l.size === target.size &&
        l.customName === target.customName &&
        l.customNumber === target.customNumber
          ? l.quantity + d > 0
            ? [{ ...l, quantity: l.quantity + d }]
            : []
          : [l],
      ),
    );
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) {
      const saved = localStorage.getItem(`bongo-order-${reference}`);
      if (saved)
        try {
          setLast(JSON.parse(saved) as Order);
          setScreen("payment");
        } catch {}
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (params.get("admin") === "1") setScreen("login");
  }, []);
  const order = async (d: {
    name: string;
    phone: string;
    address: string;
    email: string;
    method: string;
  }) => {
    const id = `BG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const o: Order = {
      id,
      customer: d.name,
      phone: d.phone,
      address: d.address,
      items: cart,
      total,
      payment: "Pending",
      status: "Paid",
      created: "Just now",
    };
    setLast(o);
    localStorage.setItem(`bongo-order-${id}`, JSON.stringify(o));
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: d.email,
          amount: Math.round(total * 100),
          reference: id,
          callbackUrl: `${window.location.origin}/?reference=${id}`,
          metadata: { order: o, paymentMethod: d.method },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.status || !payload.data?.authorization_url)
        throw new Error(
          payload.error || payload.message || "Unable to start payment.",
        );
      window.location.assign(payload.data.authorization_url);
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Unable to start payment.",
      );
      setScreen("checkout");
    }
  };
  if (screen === "login")
    return (
      <Login
        back={() => setScreen("shop")}
        success={async () => {
          try {
            await loadOrders();
            setScreen("admin");
          } catch {
            toast("Could not open the dashboard. Please sign in again.");
          }
        }}
      />
    );
  if (screen === "admin")
    return (
      <Admin
        products={products}
        saveProduct={saveProduct}
        removeProduct={removeProduct}
        orders={orders}
        updateOrder={updateOrder}
        refreshOrders={loadOrders}
        store={() => setScreen("shop")}
      />
    );
  if (screen === "product" && chosen)
    return (
      <ProductPage
        product={products.find((p) => p.id === chosen.id) || chosen}
        back={() => setScreen("shop")}
        add={add}
      />
    );
  if (screen === "cart")
    return (
      <Cart
        lines={lines}
        total={total}
        back={() => setScreen("shop")}
        quantity={quantity}
        checkout={() => setScreen("checkout")}
      />
    );
  if (screen === "checkout")
    return (
      <Checkout total={total} back={() => setScreen("cart")} submit={order} />
    );
  if (screen === "payment")
    return (
      <Payment
        order={last}
        total={last?.total || total}
        success={(paid) => {
          setLast(paid);
          setOrders((x) => [
            paid,
            ...x.filter((order) => order.id !== paid.id),
          ]);
          setCart([]);
          localStorage.removeItem(`bongo-order-${paid.id}`);
          setScreen("confirmation");
        }}
        back={() => setScreen("checkout")}
      />
    );
  if (screen === "confirmation" && last)
    return (
      <Confirmation
        order={last}
        products={products}
        shop={() => setScreen("shop")}
      />
    );
  const visible = products.filter(
    (p) =>
      (filter === "All" || p.category === filter) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Header
        count={count}
        query={query}
        queryChange={setQuery}
        cart={() => setScreen("cart")}
      />
      <main className="bg-[#fbfaf7] text-[#20221f]">
        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 pt-5 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:pt-9">
          <div className="relative min-h-[400px] overflow-hidden rounded-[30px] bg-[#dce7dc] p-7 sm:min-h-[510px] sm:p-12">
            <div className="relative z-10 max-w-md">
              <p className="inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#35604b]">
                Curated for your everyday
              </p>
              <h1 className="mt-5 font-serif text-5xl leading-[.93] tracking-tight text-[#1f4d3b] sm:text-7xl">
                Good shoes.
                <br />
                <em className="font-normal text-[#e58d54]">Good energy.</em>
              </h1>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#547062] sm:text-base">
                Thoughtfully sourced sneakers, slides and jerseys for every
                move, mood and moment.
              </p>
              <a
                href="#shop"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1f4d3b] px-5 py-3 text-sm font-bold text-white"
              >
                Shop the drop <ArrowRight size={17} />
              </a>
            </div>
            <img
              src={catalog[0].image}
              alt="Red sneaker"
              className="absolute -bottom-4 -right-12 hidden w-[430px] rotate-[-18deg] mix-blend-multiply sm:block"
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex min-h-[185px] flex-col justify-between rounded-[30px] bg-[#f4e6d8] p-7 sm:min-h-[245px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a36843]">
                  The Bongo edit
                </p>
                <h2 className="mt-2 font-serif text-3xl text-[#75472d] sm:text-4xl">
                  Made for the
                  <br />
                  long way home.
                </h2>
              </div>
              <a href="#shop" className="text-sm font-bold text-[#75472d]">
                Explore edit <ArrowRight className="inline" size={17} />
              </a>
            </div>
            <Tile
              icon={<Truck />}
              title="Saturday"
              text="Accra delivery, every weekend."
              tone="bg-[#e8e5ee] text-[#4f4a72]"
            />
            <Tile
              icon={<Heart />}
              title="Feel good"
              text="Styles you will reach for."
              tone="bg-[#f1d9d5] text-[#88534d]"
            />
          </div>
        </section>
        <section id="shop" className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
            Freshly sourced
          </p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">
            Shop the drop
          </h2>
          <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
            {["All", "Sneakers", "Slides", "Jerseys"].map((x) => (
              <button
                key={x}
                onClick={() => setFilter(x)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${filter === x ? "bg-[#1f4d3b] text-white" : "bg-white text-[#697069] ring-1 ring-[#e6e3dc]"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {visible.map((p) => (
              <Card
                key={p.id}
                product={p}
                open={() => {
                  setChosen(p);
                  setScreen("product");
                  scrollTo(0, 0);
                }}
              />
            ))}
          </div>
        </section>
      </main>
      {notice && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1f4d3b] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {notice}
        </div>
      )}
    </>
  );
}
function Header({
  count,
  query,
  queryChange,
  cart,
}: {
  count: number;
  query: string;
  queryChange: (v: string) => void;
  cart: () => void;
}) {
  const [s, setS] = useState(false);
  return (
    <>
      <div className="bg-[#1f4d3b] px-4 py-2 text-center text-[11px] font-medium text-white">
        Saturday delivery across Accra · Free delivery on orders over GH₵500
      </div>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <button className="p-2 lg:hidden">
          <Menu />
        </button>
        <button className="font-serif text-3xl font-semibold">
          bongo<span className="text-[#e58d54]">.</span>
        </button>
        <nav className="hidden gap-8 text-sm font-medium lg:flex">
          <a href="#shop">Shop</a>
          <a href="#shop" className="text-[#6d746d]">
            Our story
          </a>
        </nav>
        <div className="flex">
          <button onClick={() => setS(!s)} className="p-2.5">
            <Search />
          </button>
          <button onClick={cart} className="relative p-2.5">
            <ShoppingBag />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-[#e58d54] text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>
      {s && (
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-8">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Search className="text-[#7d817b]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => queryChange(e.target.value)}
              placeholder="Search sneakers or slides"
              className="w-full bg-transparent outline-none"
            />
            <button onClick={() => setS(false)}>
              <X />
            </button>
          </label>
        </div>
      )}
    </>
  );
}
function Tile({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <div
      className={`flex min-h-[170px] flex-col justify-between rounded-[30px] p-5 sm:min-h-[245px] sm:p-7 ${tone}`}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-white/70">
        {icon}
      </div>
      <div>
        <p className="font-serif text-2xl">{title}</p>
        <p className="mt-1 text-xs leading-relaxed opacity-75">{text}</p>
      </div>
    </div>
  );
}
function Card({ product, open }: { product: Product; open: () => void }) {
  return (
    <article className="group cursor-pointer" onClick={open}>
      <div className="relative aspect-[.86] overflow-hidden rounded-[22px] bg-[#eeeae3]">
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase">
            {product.tag}
          </span>
        )}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 rounded-full bg-white/85 p-2"
          aria-label="Save item"
        >
          <Heart size={16} />
        </button>
      </div>
      <h3 className="mt-3 text-sm font-semibold sm:text-base">
        {product.name}
      </h3>
      <p className="mt-1 text-xs text-[#858982]">
        {product.category} · Sizes {product.sizes[0]}–{product.sizes.at(-1)}
      </p>
      <p className="mt-2 font-bold">{money(product.price)}</p>
    </article>
  );
}
function ProductPage({
  product,
  back,
  add,
}: {
  product: Product;
  back: () => void;
  add: (
    id: number,
    size: Size,
    custom?: Pick<Line, "customName" | "customNumber">,
  ) => void;
}) {
  const [size, setSize] = useState<Size | null>(null);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const isJersey = product.category === "Jerseys";
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-5 text-[#20221f] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={back}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#1f4d3b]"
        >
          <ArrowLeft size={17} /> Back to shop
        </button>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[30px] bg-[#eeeae3]">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square size-full object-cover mix-blend-multiply"
            />
          </div>
          <div className="max-w-xl py-2">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
              {product.category}
            </p>
            <h1 className="mt-3 font-serif text-5xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-bold">{money(product.price)}</p>
            <p className="mt-6 leading-relaxed text-[#667067]">
              {product.description}
            </p>
            <div className="mt-8">
              <div className="flex justify-between">
                <h2 className="font-semibold">Select your size</h2>
                <span className="text-sm text-[#687068]">
                  {
                    product.sizes.filter((value) => product.stock[value] > 0)
                      .length
                  }{" "}
                  available
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((value) => (
                  <button
                    key={value}
                    disabled={!product.stock[value]}
                    onClick={() => setSize(value)}
                    className={`size-12 rounded-xl border text-sm font-semibold disabled:opacity-30 ${size === value ? "border-[#1f4d3b] bg-[#1f4d3b] text-white" : "border-[#ddd9d0] bg-white"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            {isJersey && (
              <section className="mt-6 rounded-2xl border border-[#ead6c2] bg-[#fff8ed] p-4">
                <p className="font-semibold text-[#75472d]">Make it yours</p>
                <p className="mt-1 text-xs text-[#8b6a4e]">
                  Optional personalisation is printed on your jersey.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-xs font-semibold text-[#75472d]">
                    Name
                    <input
                      maxLength={12}
                      value={customName}
                      onChange={(event) =>
                        setCustomName(event.target.value.toUpperCase())
                      }
                      placeholder="e.g. MENSAH"
                      className="rounded-xl border border-[#e2caae] bg-white px-3 py-2 text-sm font-normal outline-none"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-[#75472d]">
                    Number
                    <input
                      inputMode="numeric"
                      maxLength={2}
                      value={customNumber}
                      onChange={(event) =>
                        setCustomNumber(event.target.value.replace(/\D/g, ""))
                      }
                      placeholder="e.g. 10"
                      className="rounded-xl border border-[#e2caae] bg-white px-3 py-2 text-sm font-normal outline-none"
                    />
                  </label>
                </div>
              </section>
            )}
            <div className="mt-8 rounded-2xl bg-[#e9f0e9] p-4 text-sm text-[#315e45]">
              <Truck className="mr-2 inline" size={18} />
              <strong>Saturday Accra delivery.</strong> Order by Thursday for
              this weekend’s route.
            </div>
            <button
              disabled={!size}
              onClick={() =>
                size &&
                add(
                  product.id,
                  size,
                  isJersey
                    ? {
                        customName: customName || undefined,
                        customNumber: customNumber || undefined,
                      }
                    : undefined,
                )
              }
              className="mt-5 w-full rounded-full bg-[#1f4d3b] py-4 font-bold text-white disabled:opacity-40"
            >
              Add to bag <ShoppingBag className="ml-1 inline" size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
function Cart({
  lines,
  total,
  back,
  quantity,
  checkout,
}: {
  lines: (Line & { product: Product })[];
  total: number;
  back: () => void;
  quantity: (line: Line, d: number) => void;
  checkout: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={back}
          className="flex items-center gap-2 text-sm font-semibold text-[#1f4d3b]"
        >
          <ArrowLeft size={17} /> Continue shopping
        </button>
        <h1 className="mt-7 font-serif text-5xl">Your bag</h1>
        {!lines.length ? (
          <div className="mt-12 rounded-3xl bg-white p-12 text-center">
            <ShoppingBag className="mx-auto text-[#9ca29b]" size={40} />
            <p className="mt-4 text-[#737a72]">
              Your bag is waiting for a good pair.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
            <div className="space-y-3">
              {lines.map((l) => (
                <div
                  key={`${l.productId}-${l.size}-${l.customName || ""}-${l.customNumber || ""}`}
                  className="flex gap-4 rounded-2xl bg-white p-4"
                >
                  <img
                    src={l.product.image}
                    alt=""
                    className="size-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold">{l.product.name}</h2>
                    <p className="mt-1 text-sm text-[#777d75]">
                      {sizeText(l.product, l.size)}
                    </p>
                    {(l.customName || l.customNumber) && (
                      <p className="mt-1 text-xs font-semibold text-[#a36843]">
                        Custom: {l.customName || "—"}{" "}
                        {l.customNumber ? "#" + l.customNumber : ""}
                      </p>
                    )}
                    <p className="mt-2 font-bold">{money(l.product.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => quantity(l, -l.quantity)}
                      className="text-[#8b514b]"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-3 rounded-full border border-[#e3e0d9] px-2 py-1">
                      <button onClick={() => quantity(l, -1)}>
                        <Minus size={15} />
                      </button>
                      <span className="text-sm font-bold">{l.quantity}</span>
                      <button onClick={() => quantity(l, 1)}>
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-3xl bg-[#1f4d3b] p-6 text-white">
              <p className="text-sm font-semibold">Order summary</p>
              <div className="mt-5 flex justify-between border-b border-white/15 pb-4">
                <span className="text-[#c6d5cb]">Subtotal</span>
                <span>{money(total)}</span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <p className="mt-4 text-xs text-[#c6d5cb]">
                Delivery is scheduled for Saturday across Accra.
              </p>
              <button
                onClick={checkout}
                className="mt-6 w-full rounded-full bg-[#e58d54] py-3 font-bold"
              >
                Continue to checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
function Checkout({
  total,
  back,
  submit,
}: {
  total: number;
  back: () => void;
  submit: (d: {
    name: string;
    phone: string;
    address: string;
    email: string;
    method: string;
  }) => Promise<void>;
}) {
  const [method, setMethod] = useState("Mobile Money");
  const [busy, setBusy] = useState(false);
  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const x = new FormData(e.currentTarget);
    await submit({
      name: String(x.get("name")),
      phone: String(x.get("phone")),
      email: String(x.get("email")),
      address: String(x.get("address")),
      method,
    });
    setBusy(false);
  };
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={back}
          className="flex items-center gap-2 text-sm font-semibold text-[#1f4d3b]"
        >
          <ArrowLeft size={17} /> Back to bag
        </button>
        <h1 className="mt-7 font-serif text-5xl">Checkout</h1>
        <form
          onSubmit={send}
          className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]"
        >
          <div className="space-y-5">
            <section className="rounded-3xl bg-white p-5 sm:p-7">
              <h2 className="font-serif text-2xl">Delivery details</h2>
              <p className="mt-2 text-sm text-[#737a72]">
                We deliver across Accra every Saturday.
              </p>
              <div className="mt-5 grid gap-4">
                <Field
                  label="Full name"
                  name="name"
                  placeholder="Your full name"
                />
                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
                <Field
                  label="Phone number"
                  name="phone"
                  type="tel"
                  placeholder="024 000 0000"
                />
                <Field
                  label="Delivery address"
                  name="address"
                  placeholder="Area, landmark and house number"
                />
              </div>
              <div className="mt-5 flex gap-3 rounded-2xl bg-[#e9f0e9] p-4 text-sm text-[#315e45]">
                <MapPin className="shrink-0" size={19} />
                <span>
                  <strong>Saturday Accra delivery.</strong> Place your order by
                  Thursday for the upcoming route.
                </span>
              </div>
            </section>
            <section className="rounded-3xl bg-white p-5 sm:p-7">
              <h2 className="font-serif text-2xl">Payment method</h2>
              <div className="mt-4 grid gap-3">
                {[
                  ["Mobile Money", <Smartphone key="m" />],
                  ["Card payment", <CreditCard key="c" />],
                ].map(([label, icon]) => (
                  <button
                    type="button"
                    key={String(label)}
                    onClick={() => setMethod(String(label))}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${method === label ? "border-[#1f4d3b] bg-[#f0f5f0]" : "border-[#e4e1db]"}`}
                  >
                    {icon as React.ReactNode}
                    <span className="flex-1 font-semibold">
                      {String(label)}
                    </span>
                    {method === label && <Check className="text-[#1f4d3b]" />}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <aside className="h-fit rounded-3xl bg-[#1f4d3b] p-6 text-white">
            <p className="text-sm font-semibold">Total due</p>
            <p className="mt-2 font-serif text-4xl">{money(total)}</p>
            <button
              disabled={busy}
              className="mt-6 w-full rounded-full bg-[#e58d54] py-3 font-bold disabled:opacity-60"
            >
              {busy ? "Opening payment…" : "Pay securely"}{" "}
              <ArrowRight className="ml-1 inline" size={17} />
            </button>
            <p className="mt-4 text-xs text-[#c6d5cb]">
              By paying, you confirm delivery details and Saturday delivery
              request.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="rounded-xl border border-[#dedbd4] bg-[#fbfaf7] px-4 py-3 font-normal outline-none focus:border-[#1f4d3b]"
      />
    </label>
  );
}
function Payment({
  order,
  total,
  success,
  back,
}: {
  order: Order | null;
  total: number;
  success: (order: Order) => void;
  back: () => void;
}) {
  const [failed, setFailed] = useState("");
  useEffect(() => {
    if (!order) return;
    let live = true;
    fetch(`/api/payments/verify?reference=${encodeURIComponent(order.id)}`)
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!live) return;
        if (response.ok && data.order) success(data.order as Order);
        else setFailed(data.error || "We could not confirm this payment yet.");
      })
      .catch(() => live && setFailed("We could not confirm this payment yet."));
    return () => {
      live = false;
    };
  }, [order, success]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="max-w-sm text-center">
        {failed ? (
          <>
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#fae5e1] text-[#b74c43]">
              <CircleAlert size={35} />
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
              Payment not completed
            </p>
            <h1 className="mt-3 font-serif text-4xl">We couldn’t verify it.</h1>
            <p className="mt-4 text-[#70786f]">{failed}</p>
            <button
              onClick={back}
              className="mt-6 rounded-full bg-[#1f4d3b] px-5 py-3 font-bold text-white"
            >
              Return to checkout
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#e9f0e9] text-[#1f4d3b]">
              <Loader2 className="animate-spin" size={35} />
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
              Secure payment
            </p>
            <h1 className="mt-3 font-serif text-4xl">
              Confirming your payment
            </h1>
            <p className="mt-4 text-[#70786f]">
              We’re verifying {money(total)} with your payment provider. Please
              keep this page open.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e2e6df]">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-[#1f4d3b]" />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
function Confirmation({
  order,
  products,
  shop,
}: {
  order: Order;
  products: Product[];
  shop: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#dcebdd] text-[#237653]">
          <Check size={38} />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
          Payment successful
        </p>
        <h1 className="mt-3 font-serif text-5xl">You’re on the list.</h1>
        <p className="mt-4 text-[#70786f]">
          Your order is confirmed. We’ll prepare it for Saturday delivery.
        </p>
        <div className="mt-8 rounded-3xl bg-white p-6 text-left shadow-sm">
          <div className="flex justify-between border-b border-[#ebe8e1] pb-4">
            <span className="text-[#737a72]">Order reference</span>
            <strong>{order.id}</strong>
          </div>
          {order.items.map((l) => {
            const p = products.find((x) => x.id === l.productId);
            return (
              p && (
                <div
                  className="mt-4 flex justify-between"
                  key={`${l.productId}-${l.size}`}
                >
                  <span>
                    {p.name} · {sizeText(p, l.size)} × {l.quantity}
                  </span>
                  <strong>{money(p.price * l.quantity)}</strong>
                </div>
              )
            );
          })}
          <div className="mt-5 flex justify-between border-t border-[#ebe8e1] pt-4 text-lg">
            <strong>Total paid</strong>
            <strong>{money(order.total)}</strong>
          </div>
          <div className="mt-5 rounded-2xl bg-[#e9f0e9] p-4 text-sm text-[#315e45]">
            <Truck className="mr-2 inline" size={17} />
            <strong>Saturday delivery:</strong> {order.address}
          </div>
        </div>
        <button
          onClick={shop}
          className="mt-7 rounded-full bg-[#1f4d3b] px-6 py-3 font-bold text-white"
        >
          Continue shopping
        </button>
      </div>
    </main>
  );
}
function Login({ back, success }: { back: () => void; success: () => void }) {
  const [error, setError] = useState("");
  const sign = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const password = String(
      new FormData(e.currentTarget).get("password") || "",
    );
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) success();
    else setError("That password is not correct.");
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f5f1] px-4">
      <form
        onSubmit={sign}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"
      >
        <button
          type="button"
          onClick={back}
          className="mb-9 flex items-center gap-2 text-sm font-semibold text-[#1f4d3b]"
        >
          <ArrowLeft size={17} /> Storefront
        </button>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1f4d3b] text-white">
          <LockKeyhole />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
          Owner access
        </p>
        <h1 className="mt-2 font-serif text-4xl">Bongo dashboard</h1>
        <p className="mt-3 text-sm text-[#737a72]">
          Sign in to manage products, orders and customer updates.
        </p>
        <label className="mt-7 grid gap-2 text-sm font-semibold">
          Password
          <input
            required
            name="password"
            type="password"
            className="rounded-xl border border-[#dedbd4] px-4 py-3 font-normal outline-none"
            placeholder="Enter your password"
          />
        </label>
        {error && (
          <p className="mt-3 flex gap-2 text-sm text-[#b74c43]">
            <CircleAlert size={18} />
            {error}
          </p>
        )}
        <button className="mt-6 w-full rounded-full bg-[#1f4d3b] py-3 font-bold text-white">
          Sign in
        </button>
      </form>
    </main>
  );
}
function Admin({
  products,
  saveProduct,
  removeProduct,
  orders,
  updateOrder,
  refreshOrders,
  store,
}: {
  products: Product[];
  saveProduct: (p: Product) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
  orders: Order[];
  updateOrder: (id: string, status: Order["status"]) => Promise<void>;
  refreshOrders: () => Promise<void>;
  store: () => void;
}) {
  const [tab, setTab] = useState<
      "Dashboard" | "Products" | "Orders" | "Notifications"
    >("Dashboard"),
    [editing, setEditing] = useState<Product | null>(null),
    [chosen, setChosen] = useState<Order | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const timer = window.setInterval(
      () => void refreshOrders().catch(() => {}),
      30000,
    );
    return () => window.clearInterval(timer);
  }, [refreshOrders]);
  const nav = ["Dashboard", "Products", "Orders", "Notifications"] as const;
  const save = async (p: Product) => {
    try {
      setError("");
      await saveProduct(p);
      setEditing(null);
    } catch {
      setError("Product could not be saved. Sign in again and retry.");
    }
  };
  const remove = async (id: number) => {
    try {
      setError("");
      await removeProduct(id);
    } catch {
      setError("Product could not be removed. Sign in again and retry.");
    }
  };
  const status = async (s: Order["status"]) => {
    if (!chosen) return;
    try {
      setError("");
      await updateOrder(chosen.id, s);
      setChosen({ ...chosen, status: s });
    } catch {
      setError("Order status could not be updated. Sign in again and retry.");
    }
  };
  return (
    <main className="min-h-screen bg-[#f5f5f1] text-[#20221f]">
      <header className="flex items-center justify-between border-b border-[#e4e4de] bg-white px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3b] font-serif text-xl text-white">
            b
          </div>
          <div>
            <p className="font-semibold">bongo stores</p>
            <p className="text-[11px] text-[#888d86]">Owner dashboard</p>
          </div>
        </div>
        <button
          onClick={store}
          className="rounded-full border border-[#e2e2dc] px-4 py-2 text-xs font-semibold"
        >
          View store
        </button>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-6 sm:px-8 lg:flex-row">
        <aside className="flex gap-2 overflow-x-auto lg:w-52 lg:flex-col">
          {nav.map((x) => (
            <button
              key={x}
              onClick={() => {
                setTab(x);
                setEditing(null);
                setChosen(null);
              }}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${tab === x ? "bg-[#1f4d3b] text-white" : "text-[#737970] hover:bg-white"}`}
            >
              {x === "Dashboard" ? (
                <LayoutDashboard size={18} />
              ) : x === "Products" ? (
                <Package size={18} />
              ) : x === "Orders" ? (
                <ShoppingBag size={18} />
              ) : (
                <Bell size={18} />
              )}{" "}
              {x}
            </button>
          ))}
        </aside>
        <section className="min-w-0 flex-1">
          {error && (
            <p className="mb-4 rounded-xl bg-[#fae5e1] p-3 text-sm text-[#a33f37]">
              {error}
            </p>
          )}
          {tab === "Dashboard" && (
            <Dashboard
              products={products}
              orders={orders}
              ordersTab={() => setTab("Orders")}
              productsTab={() => setTab("Products")}
            />
          )}{" "}
          {tab === "Products" &&
            (editing ? (
              <ProductForm
                product={editing}
                cancel={() => setEditing(null)}
                save={save}
              />
            ) : (
              <Products
                products={products}
                add={() =>
                  setEditing({
                    id: 0,
                    name: "",
                    category: "Sneakers",
                    price: 0,
                    description: "",
                    image: "",
                    sizes: [36, 37, 38, 39, 40],
                    stock: {},
                  })
                }
                edit={setEditing}
                remove={remove}
              />
            ))}{" "}
          {tab === "Orders" &&
            (chosen ? (
              <OrderDetails
                order={chosen}
                products={products}
                back={() => setChosen(null)}
                status={status}
              />
            ) : (
              <Orders orders={orders} open={setChosen} />
            ))}{" "}
          {tab === "Notifications" && <Notifications orders={orders} />}
        </section>
      </div>
    </main>
  );
}
function Dashboard({
  products,
  orders,
  ordersTab,
  productsTab,
}: {
  products: Product[];
  orders: Order[];
  ordersTab: () => void;
  productsTab: () => void;
}) {
  return (
    <>
      <p className="text-sm text-[#838980]">Store operations</p>
      <h1 className="mt-1 font-serif text-4xl">Good morning, Bongo.</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Metric
          label="New orders"
          value={String(orders.length)}
          detail="View and action new requests"
        />
        <Metric
          label="Paid orders"
          value={String(orders.filter((o) => o.payment === "Paid").length)}
          detail="Payments successfully confirmed"
        />
        <Metric
          label="Products live"
          value={String(products.length)}
          detail="Keep your shop fresh"
        />
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl bg-white p-5">
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold">Order activity</h2>
              <p className="mt-1 text-xs text-[#888d86]">
                Latest paid and sourcing updates.
              </p>
            </div>
            <button
              onClick={ordersTab}
              className="text-sm font-bold text-[#1f4d3b]"
            >
              View all
            </button>
          </div>
          <div className="mt-5 space-y-1">
            {orders.slice(0, 4).map((o) => (
              <button
                onClick={ordersTab}
                className="flex w-full items-center gap-3 border-t border-[#efefe9] py-4 text-left"
                key={o.id}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[#f0eee8] text-xs font-bold">
                  {o.customer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{o.customer}</p>
                  <p className="text-xs text-[#8a8e87]">
                    {o.id} · {o.created}
                  </p>
                </div>
                <Status status={o.status} />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-[#1f4d3b] p-6 text-white">
          <Bell className="text-[#e58d54]" />
          <h2 className="mt-5 font-serif text-3xl">Stay in the loop.</h2>
          <p className="mt-2 text-sm text-[#c4d3ca]">
            New paid orders appear in Notifications, ready for you to source.
          </p>
          <button
            onClick={productsTab}
            className="mt-6 w-full rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold"
          >
            Manage catalogue <ChevronRight className="float-right" size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e5df] bg-white p-5">
      <p className="text-xs text-[#858982]">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      <p className="mt-2 text-xs font-medium text-[#4c8b67]">{detail}</p>
    </div>
  );
}
function Products({
  products,
  add,
  edit,
  remove,
}: {
  products: Product[];
  add: () => void;
  edit: (p: Product) => void;
  remove: (id: number) => void;
}) {
  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
            Catalogue
          </p>
          <h1 className="mt-2 font-serif text-4xl">Products</h1>
        </div>
        <button
          onClick={add}
          className="rounded-full bg-[#1f4d3b] px-4 py-3 text-sm font-bold text-white"
        >
          <Plus className="mr-1 inline" size={16} /> Add product
        </button>
      </div>
      <div className="mt-7 overflow-hidden rounded-2xl bg-white">
        {products.map((p) => (
          <div
            className="flex items-center gap-3 border-b border-[#efefe9] p-4 last:border-0"
            key={p.id}
          >
            <img
              src={p.image || "https://placehold.co/80x80"}
              alt=""
              className="size-14 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name || "Untitled product"}</p>
              <p className="text-xs text-[#858982]">
                {p.category} · {money(p.price)} · {p.sizes.length} sizes
              </p>
            </div>
            <button onClick={() => edit(p)} className="p-2 text-[#1f4d3b]">
              <Pencil size={18} />
            </button>
            <button onClick={() => remove(p.id)} className="p-2 text-[#9a564e]">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
function ProductForm({
  product,
  cancel,
  save,
}: {
  product: Product;
  cancel: () => void;
  save: (p: Product) => void;
}) {
  const [d, setD] = useState(product);
  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setD((current) => ({ ...current, [key]: value }));
  const upload = async (file?: File) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const payload = await response.json();
    if (!response.ok || !payload.url)
      throw new Error(payload.error || "Could not upload image.");
    set("image", payload.url);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    save({
      ...d,
      id: d.id || Date.now(),
      stock: Object.fromEntries(
        d.sizes.map((size) => [size, d.stock[size] ?? 1]),
      ),
    });
  };
  return (
    <form onSubmit={submit}>
      <button
        type="button"
        onClick={cancel}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#1f4d3b]"
      >
        <ArrowLeft size={17} /> Back to products
      </button>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
        Catalogue
      </p>
      <h1 className="mt-2 font-serif text-4xl">
        {product.id ? "Edit product" : "Add a new item"}
      </h1>
      <div className="mt-7 grid gap-5 rounded-3xl bg-white p-5 sm:grid-cols-2 sm:p-8">
        <AField
          label="Product name"
          value={d.name}
          change={(value) => set("name", value)}
        />
        <label className="grid gap-2 text-sm font-semibold">
          Category
          <select
            value={d.category}
            onChange={(event) =>
              set("category", event.target.value as Product["category"])
            }
            className="rounded-xl border border-[#dedbd4] px-4 py-3 font-normal"
          >
            <option>Sneakers</option>
            <option>Slides</option>
            <option>Jerseys</option>
          </select>
        </label>
        <AField
          label="Price (GH₵)"
          type="number"
          value={String(d.price)}
          change={(value) => set("price", Number(value))}
        />
        <label className="grid gap-2 text-sm font-semibold">
          Product photo
          <input
            type="file"
            accept="image/*"
            onChange={(event) => upload(event.target.files?.[0])}
            className="rounded-xl border border-[#dedbd4] px-4 py-2 font-normal"
          />
          <span className="text-xs font-normal text-[#777d75]">
            Or use a URL below.
          </span>
        </label>
        <AField
          label="Photo URL"
          value={d.image}
          change={(value) => set("image", value)}
        />
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
          Description
          <textarea
            value={d.description}
            onChange={(event) => set("description", event.target.value)}
            className="min-h-24 rounded-xl border border-[#dedbd4] px-4 py-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
          Available sizes
          <span className="text-xs font-normal text-[#777d75]">
            Use UK numbers for footwear, or professional apparel sizes such as
            S, M, L, XL and XXL for jerseys.
          </span>
          <input
            value={d.sizes.join(", ")}
            onChange={(event) => {
              const values = event.target.value
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean);
              set(
                "sizes",
                d.category === "Jerseys"
                  ? values.map((value) => value.toUpperCase())
                  : values.map(Number).filter(Boolean),
              );
            }}
            className="rounded-xl border border-[#dedbd4] px-4 py-3 font-normal"
          />
        </label>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-4">
          {d.sizes.map((size) => (
            <label key={size} className="grid gap-1 text-xs font-semibold">
              {d.category === "Jerseys" ? `Size ${size}` : `UK ${size}`} stock
              <input
                type="number"
                min="0"
                value={d.stock[size] ?? 1}
                onChange={(event) =>
                  set("stock", {
                    ...d.stock,
                    [size]: Number(event.target.value),
                  })
                }
                className="rounded-lg border border-[#dedbd4] px-3 py-2 font-normal"
              />
            </label>
          ))}
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={cancel}
            className="px-5 py-3 font-semibold text-[#6e746d]"
          >
            Cancel
          </button>
          <button className="rounded-full bg-[#1f4d3b] px-6 py-3 font-bold text-white">
            Save product
          </button>
        </div>
      </div>
    </form>
  );
}
function AField({
  label,
  value,
  change,
  type = "text",
}: {
  label: string;
  value: string;
  change: (x: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        type={type}
        required
        value={value}
        onChange={(e) => change(e.target.value)}
        className="rounded-xl border border-[#dedbd4] px-4 py-3 font-normal"
      />
    </label>
  );
}
function Orders({
  orders,
  open,
}: {
  orders: Order[];
  open: (o: Order) => void;
}) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
        Operations
      </p>
      <h1 className="mt-2 font-serif text-4xl">Orders</h1>
      <div className="mt-7 overflow-hidden rounded-2xl bg-white">
        {orders.map((o) => (
          <button
            onClick={() => open(o)}
            className="flex w-full items-center gap-3 border-b border-[#efefe9] p-4 text-left last:border-0"
            key={o.id}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-[#f0eee8] text-xs font-bold">
              {o.customer
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{o.customer}</p>
              <p className="truncate text-xs text-[#858982]">
                {o.id} · {o.phone} · {o.address}
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold">{money(o.total)}</p>
              <p className="text-xs text-[#858982]">{o.payment}</p>
            </div>
            <Status status={o.status} />
            <ChevronRight className="text-[#8d938d]" size={18} />
          </button>
        ))}
      </div>
    </>
  );
}
function Status({ status }: { status: Order["status"] }) {
  const c = {
    Paid: "bg-[#e5f1eb] text-[#237653]",
    Sourcing: "bg-[#fff2dc] text-[#a5660b]",
    Ready: "bg-[#e8edf8] text-[#4a61a0]",
    Delivered: "bg-[#e8edf8] text-[#4a61a0]",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-bold ${c[status]}`}
    >
      {status}
    </span>
  );
}
function OrderDetails({
  order,
  products,
  back,
  status,
}: {
  order: Order;
  products: Product[];
  back: () => void;
  status: (s: Order["status"]) => void;
}) {
  const steps: Order["status"][] = ["Paid", "Sourcing", "Ready", "Delivered"];
  return (
    <>
      <button
        onClick={back}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#1f4d3b]"
      >
        <ArrowLeft size={17} /> All orders
      </button>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
        Order {order.id}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{order.customer}</h1>
      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_.75fr]">
        <div className="rounded-3xl bg-white p-6">
          <h2 className="font-semibold">Order items</h2>
          {order.items.map((l) => {
            const p = products.find((x) => x.id === l.productId);
            return (
              <div
                className="mt-4 flex justify-between border-t border-[#efefe9] pt-4"
                key={`${l.productId}-${l.size}`}
              >
                <span>
                  {p?.name || "Product"} · {p ? sizeText(p, l.size) : l.size} ×{" "}
                  {l.quantity}
                </span>
                <strong>{p && money(p.price * l.quantity)}</strong>
              </div>
            );
          })}
          <div className="mt-5 flex justify-between border-t pt-4 text-lg">
            <strong>Total</strong>
            <strong>{money(order.total)}</strong>
          </div>
        </div>
        <div className="rounded-3xl bg-[#1f4d3b] p-6 text-white">
          <p className="text-sm font-semibold">Fulfilment status</p>
          <div className="mt-5 grid gap-2">
            {steps.map((s) => (
              <button
                onClick={() => status(s)}
                key={s}
                className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ${order.status === s ? "bg-[#e58d54]" : "bg-white/10"}`}
              >
                <Check className="mr-2 inline" size={16} />
                {s}
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-white/15 pt-5 text-sm text-[#c5d4ca]">
            <p>
              <strong className="text-white">Payment:</strong> {order.payment}
            </p>
            <p className="mt-2">
              <strong className="text-white">Phone:</strong> {order.phone}
            </p>
            <p className="mt-2">
              <strong className="text-white">Delivery:</strong> {order.address}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
function Notifications({ orders }: { orders: Order[] }) {
  const list = orders.filter((o) => o.created === "Just now");
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#e58d54]">
        Updates
      </p>
      <h1 className="mt-2 font-serif text-4xl">Notifications</h1>
      <div className="mt-7 space-y-3">
        {(list.length ? list : orders).map((o) => (
          <div key={o.id} className="flex gap-4 rounded-2xl bg-white p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e5f1eb] text-[#237653]">
              <Check size={18} />
            </div>
            <div>
              <p className="font-semibold">Successful payment received</p>
              <p className="mt-1 text-sm text-[#737a72]">
                {o.customer} paid {money(o.total)} for order {o.id}. It is ready
                to source.
              </p>
              <p className="mt-2 text-xs text-[#8a9089]">{o.created}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

