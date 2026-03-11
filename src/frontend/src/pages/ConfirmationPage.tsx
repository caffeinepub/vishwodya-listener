import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Clock,
  Copy,
  Gift,
  Home,
  Phone,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

interface ConfirmationState {
  sessionId: string;
  userReferralCode: string;
  name: string;
  phone: string;
  duration: number;
  category: string;
  finalPrice: number;
  language: string;
}

export default function ConfirmationPage() {
  const { sessionId } = useParams({ strict: false }) as { sessionId: string };
  const state = (() => {
    try {
      const raw = sessionStorage.getItem("vishwodya_confirmation");
      return raw
        ? (JSON.parse(raw) as ConfirmationState)
        : ({} as ConfirmationState);
    } catch {
      return {} as ConfirmationState;
    }
  })();

  const displaySessionId = sessionId || state.sessionId || "VS----";
  const referralCode = state.userReferralCode || "REF----";

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Session Requested!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your request has been received. A listener will contact you within
              1 hour.
            </p>

            <Card className="shadow-card mb-6">
              <CardContent className="py-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Your Session ID
                </p>
                <div
                  className="font-mono text-2xl font-bold text-primary tracking-widest mb-3"
                  data-ocid="confirmation.session_id"
                >
                  {displaySessionId}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(displaySessionId, "Session ID")
                  }
                  className="gap-2"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy ID
                </Button>
              </CardContent>
            </Card>

            {state.name && (
              <Card className="shadow-card mb-6 text-left">
                <CardContent className="py-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm">
                    Session Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Name</div>
                    <div className="font-medium">{state.name}</div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-medium">{state.category}</div>
                    <div className="text-muted-foreground">Duration</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {state.duration} minutes
                    </div>
                    <div className="text-muted-foreground">Language</div>
                    <div className="font-medium">{state.language}</div>
                    <div className="text-muted-foreground">Amount Due</div>
                    <div className="font-bold text-primary">
                      ₹{state.finalPrice}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-card mb-6 border-accent/30 bg-accent/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">
                      Payment via UPI / WhatsApp
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Our listener will collect payment via UPI or WhatsApp
                      before starting the call.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card mb-8 border-primary/20 bg-primary/5">
              <CardContent className="py-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Your Referral Code
                  </span>
                </div>
                <div
                  className="font-mono text-xl font-bold text-primary tracking-widest mb-2"
                  data-ocid="confirmation.referral_code"
                >
                  {referralCode}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Share this code with friends. For every friend who books, you
                  earn
                  <strong className="text-foreground">
                    {" "}
                    5 free listening minutes!
                  </strong>
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(referralCode, "Referral code")
                    }
                    className="gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = `Talk to a listener on Vishwodya! Use my code ${referralCode} to get a discount. Book at ${window.location.origin}`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        copyToClipboard(text, "Share message");
                      }
                    }}
                    className="gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              asChild
              size="lg"
              className="w-full"
              data-ocid="confirmation.home_button"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" /> Back to Home
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              <Badge variant="outline" className="text-xs">
                Status: Pending
              </Badge>{" "}
              Please keep your phone available.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
