import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Phone, Mail, MapPin, MessageCircle, Award, Truck, Sparkles, ShieldCheck,
  Factory, Leaf, Package, CheckCircle2, Star, ArrowRight, Menu, X, Download,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import heroMill from "@/assets/hero-mill.jpg";
import paddyField from "@/assets/paddy-field.jpg";
import warehouse from "@/assets/warehouse.jpg";
import machinery from "@/assets/machinery.jpg";
import riceSona from "@/assets/rice-sona.jpg";
import riceBasmati from "@/assets/rice-basmati.jpg";
import riceSteam from "@/assets/rice-steam.jpg";
import riceRaw from "@/assets/rice-raw.jpg";
import riceBroken from "@/assets/rice-broken.jpg";
import riceBran from "@/assets/rice-bran.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gayathri Modern Rice Mill — Premium Rice Manufacturer & Wholesale Supplier" },
      { name: "description", content: "Wholesale rice manufacturer & exporter. Sona Masoori, Basmati, Steam Rice, Raw Rice direct from our modern processing mill. Bulk supply for distributors, retailers, hotels." },
      { name: "keywords", content: "rice mill, rice manufacturer, wholesale rice supplier, premium rice exporter, sona masoori, basmati rice, steam rice, rice processing company" },
      { property: "og:title", content: "Gayathri Modern Rice Mill — Premium Rice Direct From Our Mill" },
      { property: "og:description", content: "Wholesale rice manufacturer & exporter. Bulk supply for distributors, retailers and hotels." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Gayathri Modern Rice Mill",
        description: "Premium rice manufacturer, processor and wholesale supplier.",
        sameAs: [],
      }),
    }],
  }),
  component: Index,
});

const WHATSAPP = "+919398553951";
const PHONE = "+91 93985 53951";
const EMAIL = "gunupuruchandu29@gmail.com";

const products = [
  { name: "Sona Masoori Rice", img: riceSona, grade: "Premium AAA", pack: "5 / 25 / 50 kg bags", stock: "In stock" },
  { name: "Basmati Rice", img: riceBasmati, grade: "Long Grain Premium", pack: "10 / 25 kg bags", stock: "In stock" },
  { name: "Steam Rice", img: riceSteam, grade: "Parboiled Grade A", pack: "25 / 50 kg bags", stock: "Bulk available" },
  { name: "Raw Rice", img: riceRaw, grade: "Grade A", pack: "25 / 50 kg bags", stock: "In stock" },
  { name: "Broken Rice", img: riceBroken, grade: "Industrial Grade", pack: "50 kg bags", stock: "Bulk available" },
  { name: "Rice Bran", img: riceBran, grade: "Solvent Grade", pack: "Bulk / 50 kg", stock: "On order" },
];

const whyUs = [
  { icon: Sparkles, t: "Premium Quality", d: "Strict multi-stage quality assurance on every batch." },
  { icon: Factory, t: "Advanced Machinery", d: "Modern Satake & Buhler-grade processing equipment." },
  { icon: ShieldCheck, t: "Lab Tested", d: "Moisture, grain length & purity tested in-house." },
  { icon: Truck, t: "Timely Delivery", d: "Pan-India logistics with export-ready dispatch." },
  { icon: Package, t: "Bulk Supply", d: "Container loads & customised private labelling." },
  { icon: Award, t: "Best Pricing", d: "Direct-from-mill rates with no middlemen." },
];

const process = [
  "Paddy Procurement", "Cleaning", "Milling", "Polishing", "Quality Testing", "Packaging", "Delivery",
];

const stats = [
  { v: "25+", l: "Years in Business" },
  { v: "50,000+", l: "Tons Processed Annually" },
  { v: "1,200+", l: "Happy Customers" },
  { v: "18", l: "States Served" },
];

const certs = ["FSSAI Certified", "ISO 22000:2018", "APEDA Export", "HACCP Standards"];

const testimonials = [
  { n: "Ramesh Traders", r: "Distributor, Hyderabad", q: "Consistent quality across every consignment — our retailers trust the Gayathri brand." },
  { n: "Golden Spoon Hotels", r: "Procurement Head", q: "Their Sona Masoori is the best we've sourced in years. Always on time, always graded right." },
  { n: "Al-Noor Exports", r: "Exporter, Dubai", q: "Export-grade packing and documentation — they made our shipments effortless." },
];

const gallery = [machinery, warehouse, paddyField, heroMill];

function Index() {
  const [navOpen, setNavOpen] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", product: "Sona Masoori Rice", qty: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill in name, email and phone.");
      return;
    }
    const body = `New inquiry%0A%0AName: ${form.name}%0ACompany: ${form.company}%0AEmail: ${form.email}%0APhone: ${form.phone}%0AProduct: ${form.product}%0AQty: ${form.qty}%0AMessage: ${form.message}`;
    window.location.href = `mailto:${EMAIL}?subject=Quote Request — ${form.product}&body=${body}`;
    toast.success("Inquiry prepared. Your email client is opening.");
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-gradient-gold grid place-items-center shadow-gold">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-primary">Gayathri</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Modern Rice Mill</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {["About","Products","Process","Why Us","Contact"].map(i => (
              <a key={i} href={`#${i.toLowerCase().replace(" ","-")}`} className="text-foreground/80 hover:text-primary transition-colors">{i}</a>
            ))}
          </nav>
          <a href="#contact" className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition">
            Get a Quote <ArrowRight className="w-4 h-4" />
          </a>
          <button className="md:hidden" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
            {navOpen ? <X /> : <Menu />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-6 py-4 flex flex-col gap-3">
              {["About","Products","Process","Why Us","Contact"].map(i => (
                <a key={i} href={`#${i.toLowerCase().replace(" ","-")}`} onClick={() => setNavOpen(false)} className="text-foreground/80">{i}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <img src={heroMill} alt="Modern rice mill processing facility" width={1920} height={1080} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 backdrop-blur border border-gold/40 text-gold text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> FSSAI · ISO · Export Certified
            </span>
            <h1 className="mt-6 font-display font-bold text-5xl md:text-7xl text-white text-balance leading-[1.05]">
              Premium Quality Rice <span className="text-gold">Direct From Our Mill</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl">
              Two decades of milling excellence. Processing 50,000+ tons annually with modern machinery, lab-tested quality and reliable bulk supply for distributors, exporters, hotels & retailers across India.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#contact" className="inline-flex items-center gap-2 bg-gradient-gold text-primary px-7 py-3.5 rounded-md font-semibold shadow-gold hover:scale-[1.02] transition">
                Get a Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a href={`tel:${PHONE}`} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white px-7 py-3.5 rounded-md font-semibold hover:bg-white/20 transition">
                <Phone className="w-4 h-4" /> Contact Us
              </a>
            </div>
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
              {stats.slice(0,4).map(s => (
                <div key={s.l}>
                  <div className="font-display text-3xl md:text-4xl text-gold font-bold">{s.v}</div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <img src={paddyField} alt="Paddy field at sunrise" width={1024} height={1024} loading="lazy" className="rounded-2xl shadow-premium w-full aspect-[4/5] object-cover" />
          </motion.div>
          <div>
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">About Us</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">From Paddy Fields to Premium Plates — for 25 Years.</h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Founded in 1999, Gayathri Modern Rice Mill is one of South India's most trusted rice processing companies. We source premium paddy directly from farmers, process it through state-of-the-art Satake-grade machinery, and deliver consistent, lab-tested quality to wholesalers, exporters and HoReCa clients across 18 states.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { i: Factory, t: "Modern Facility" },
                { i: Leaf, t: "Farm to Mill" },
                { i: ShieldCheck, t: "Quality Assured" },
                { i: Award, t: "Award-winning" },
              ].map(({ i: Icon, t }) => (
                <div key={t} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Our Products</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">A Complete Range of Premium Rice</h2>
            <p className="mt-4 text-muted-foreground">Available in custom packaging, private labels and container-load quantities.</p>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((p, idx) => (
              <motion.article
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-premium transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-cream">
                  <img src={p.img} alt={p.name} width={1024} height={1024} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary">{p.name}</h3>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Grade</dt><dd className="font-medium">{p.grade}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Packaging</dt><dd className="font-medium">{p.pack}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="text-primary font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{p.stock}</dd></div>
                  </dl>
                  <a href="#contact" onClick={() => setForm(f => ({ ...f, product: p.name }))} className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md font-semibold hover:opacity-90 transition">
                    Inquire Now <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="#contact" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-gold transition">
              <Download className="w-4 h-4" /> Download Full Product Catalog (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why-us" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${machinery})`, backgroundSize: "cover" }} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Why Choose Us</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-balance">Built on Trust. Delivered with Precision.</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map(({ icon: Icon, t, d }, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-7 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:border-gold/50 transition"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-gold grid place-items-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{t}</h3>
                <p className="mt-2 text-primary-foreground/75 text-sm">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Our Process</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">Seven Steps. One Standard of Excellence.</h2>
          </div>
          <div className="mt-16 relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {process.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center"
                >
                  <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-gold text-primary grid place-items-center font-display text-xl font-bold shadow-gold">
                    {i + 1}
                  </div>
                  <div className="mt-4 font-semibold text-primary text-sm">{step}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-gradient-gold">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.l}>
              <div className="font-display text-5xl md:text-6xl font-bold text-primary">{s.v}</div>
              <div className="mt-2 text-primary/80 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Certifications</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-primary">Compliant. Certified. Trusted.</h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {certs.map(c => (
              <div key={c} className="p-8 rounded-xl border-2 border-border bg-card text-center hover:border-gold transition group">
                <Award className="w-10 h-10 mx-auto text-gold group-hover:scale-110 transition" />
                <div className="mt-4 font-semibold text-primary">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Testimonials</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">What Our Partners Say</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 bg-card rounded-2xl border border-border shadow-premium"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({length: 5}).map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="mt-4 text-foreground/85 italic">"{t.q}"</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="font-bold text-primary">{t.n}</div>
                  <div className="text-sm text-muted-foreground">{t.r}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Gallery</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-primary text-balance">Inside Our Mill</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((img, i) => (
              <div key={i} className={`overflow-hidden rounded-xl ${i === 0 ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"}`}>
                <img src={img} alt={`Rice mill facility ${i+1}`} width={1024} height={1024} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14">
          <div>
            <span className="text-gold font-semibold uppercase tracking-widest text-xs">Contact</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold text-balance">Get an Instant Wholesale Quote</h2>
            <p className="mt-4 text-primary-foreground/80">Tell us your product and quantity — our sales team responds within 2 business hours.</p>
            <div className="mt-10 space-y-5">
              <a href={`tel:${PHONE}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center group-hover:bg-gold group-hover:text-primary transition"><Phone className="w-5 h-5" /></div>
                <div><div className="text-xs text-primary-foreground/60">Call us</div><div className="font-semibold">{PHONE}</div></div>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center group-hover:bg-gold group-hover:text-primary transition"><Mail className="w-5 h-5" /></div>
                <div><div className="text-xs text-primary-foreground/60">Email</div><div className="font-semibold">{EMAIL}</div></div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 grid place-items-center"><MapPin className="w-5 h-5" /></div>
                <div><div className="text-xs text-primary-foreground/60">Address</div><div className="font-semibold">Industrial Area, Nellore, Andhra Pradesh 524004, India</div></div>
              </div>
            </div>
            <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
              <iframe
                title="Mill location"
                src="https://www.google.com/maps?q=Nellore,Andhra+Pradesh&output=embed"
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>
          </div>

          <form onSubmit={submit} className="bg-card text-foreground p-8 rounded-2xl shadow-premium space-y-4">
            <h3 className="text-2xl font-bold text-primary">Request a Quote</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <input required placeholder="Phone *" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
              <select value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none">
                {products.map(p => <option key={p.name}>{p.name}</option>)}
              </select>
              <input placeholder="Quantity (tons / bags)" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none" />
            </div>
            <textarea placeholder="Message / Specifications" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-md bg-secondary border border-border focus:border-primary outline-none resize-none" />
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-gradient-gold text-primary py-3.5 rounded-md font-bold shadow-gold hover:scale-[1.01] transition">
              Send Inquiry <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground text-center">Your details are kept confidential. Used only for quote response.</p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background/80 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-4 text-sm">
          <div>© {new Date().getFullYear()} Gayathri Modern Rice Mill. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#about" className="hover:text-gold">About</a>
            <a href="#products" className="hover:text-gold">Products</a>
            <a href="#contact" className="hover:text-gold">Contact</a>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOATING */}
      <a
        href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g,"")}?text=Hello%20Gayathri%20Rice%20Mill,%20I'd%20like%20a%20wholesale%20quote.`}
        target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white grid place-items-center shadow-2xl hover:scale-110 transition"
        aria-label="WhatsApp us"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
      </a>
    </div>
  );
}
