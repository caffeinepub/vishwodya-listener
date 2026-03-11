import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  EyeOff,
  FileText,
  Headphones,
  Heart,
  Lock,
  Phone,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const CATEGORIES = [
  { label: "Relationship", emoji: "💑" },
  { label: "Breakup", emoji: "💔" },
  { label: "Family Issues", emoji: "🏠" },
  { label: "Loneliness", emoji: "🌙" },
  { label: "Career Stress", emoji: "💼" },
  { label: "Study Pressure", emoji: "📚" },
  { label: "Overthinking", emoji: "🌀" },
  { label: "Friendship Issues", emoji: "🤝" },
  { label: "Work Stress", emoji: "⚡" },
  { label: "Just Need to Talk", emoji: "🗣️" },
];

const STEPS = [
  {
    icon: FileText,
    title: "Fill the Form",
    description:
      "Share what's on your mind in our simple, private form. No account needed.",
  },
  {
    icon: CheckCircle,
    title: "Get Your Session ID",
    description:
      "Receive a unique Session ID confirming your request instantly.",
  },
  {
    icon: Phone,
    title: "Listener Calls You",
    description:
      "A compassionate listener will call you on WhatsApp within 1 hour.",
  },
];

const PRIVACY = [
  {
    icon: EyeOff,
    title: "No Call Recording",
    desc: "Every conversation stays between you and your listener.",
  },
  {
    icon: Users,
    title: "Anonymous Support",
    desc: "Share using just a nickname. No real name required.",
  },
  {
    icon: Lock,
    title: "Data Protected",
    desc: "Your information is never shared or sold to anyone.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Headphones className="w-4 h-4" />
              Emotional Listening Support
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
              Vishwodya
              <br />
              <span className="text-accent">Listener</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-3 italic font-display">
              Someone who truly listens.
            </p>
            <p className="text-base text-muted-foreground max-w-lg mx-auto mb-10">
              A safe, private space to share what's weighing on your heart. Talk
              to a compassionate listener — no judgment, no advice unless you
              want it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-8 py-6 shadow-glow"
                data-ocid="hero.cta_button"
              >
                <Link to="/book">
                  <Heart className="w-5 h-5 mr-2" />
                  Talk to a Listener
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6"
                asChild
              >
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" /> No account needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" /> Calls within 1
              hour
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" /> Starting at ₹49
            </span>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 section-wave">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to feel heard
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {STEPS.map((step, i) => (
              <motion.div key={step.title} variants={itemVariants}>
                <Card className="text-center shadow-card border-border/50 h-full">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center mx-auto mb-3">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              We Listen to Everything
            </h2>
            <p className="text-muted-foreground">
              Whatever you're going through, we're here
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.label} variants={itemVariants}>
                <Card className="text-center shadow-xs hover:shadow-card transition-shadow border-border/50 cursor-default">
                  <CardContent className="py-4 px-3">
                    <div className="text-2xl mb-2">{cat.emoji}</div>
                    <p className="text-xs font-medium text-foreground leading-tight">
                      {cat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Privacy Promise */}
      <section className="py-20 section-wave">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Privacy Promise
            </h2>
            <p className="text-muted-foreground">
              Your trust is our foundation
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {PRIVACY.map((p) => (
              <motion.div key={p.title} variants={itemVariants}>
                <Card className="shadow-card border-border/50 h-full">
                  <CardContent className="pt-6 pb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <p.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              You don't have to face it alone.
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
              Take the first step. Someone is ready to listen — no judgment,
              just presence.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-base px-10 py-6"
              data-ocid="hero.cta_button"
            >
              <Link to="/book">
                <Heart className="w-5 h-5 mr-2" />
                Talk to a Listener
              </Link>
            </Button>
            <p className="mt-6 text-xs text-primary-foreground/40">
              For users 18 and above. This is not a substitute for professional
              therapy.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
