import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle, Clock, Loader2, Tag } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { User } from "../backend";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useActor } from "../hooks/useActor";

const CATEGORIES = [
  "Relationship",
  "Breakup",
  "Family Issues",
  "Loneliness",
  "Career Stress",
  "Study Pressure",
  "Overthinking",
  "Friendship Issues",
  "Work Stress",
  "Just Need Someone to Talk",
];

const DURATIONS = [
  { minutes: 10, price: 49, label: "10 min" },
  { minutes: 20, price: 99, label: "20 min" },
  { minutes: 30, price: 149, label: "30 min" },
];

function getDateCode() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return dd + mm;
}

export default function BookPage() {
  const navigate = useNavigate();
  const { actor } = useActor();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [preferredListener, setPreferredListener] = useState("Any");
  const [language, setLanguage] = useState("English");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [duration, setDuration] = useState(10);
  const [couponCode, setCouponCode] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [useFreeMinutes, setUseFreeMinutes] = useState(false);

  const [couponStatus, setCouponStatus] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >("idle");
  const [couponData, setCouponData] = useState<{
    discountValue: bigint;
    discountType: string;
    message: string;
  } | null>(null);
  const [existingUser, setExistingUser] = useState<User | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!phone || phone.length < 10 || !actor) return;
    const t = setTimeout(async () => {
      const user = await actor.getUserByPhone(phone);
      setExistingUser(user);
    }, 600);
    return () => clearTimeout(t);
  }, [phone, actor]);

  const selectedDuration = DURATIONS.find((d) => d.minutes === duration)!;
  const basePrice = selectedDuration.price;

  let discount = 0;
  if (couponStatus === "valid" && couponData) {
    if (couponData.discountType === "Percent") {
      discount = Math.floor(
        (basePrice * Number(couponData.discountValue)) / 100,
      );
    } else {
      discount = Number(couponData.discountValue);
    }
  }

  let freeMinutesDiscount = 0;
  if (useFreeMinutes && existingUser) {
    const freeMin = Number(existingUser.freeMinutesBalance);
    const pricePerMin = basePrice / duration;
    freeMinutesDiscount = Math.min(freeMin * pricePerMin, basePrice - discount);
  }

  const finalPrice = Math.max(0, basePrice - discount - freeMinutesDiscount);

  async function handleApplyCoupon() {
    if (!actor || !couponCode.trim()) return;
    setCouponStatus("loading");
    try {
      const result = await actor.validateCoupon(
        couponCode.trim(),
        BigInt(duration),
      );
      if (result.valid) {
        setCouponStatus("valid");
        setCouponData(result);
      } else {
        setCouponStatus("invalid");
        setCouponData({
          discountValue: 0n,
          discountType: "",
          message: result.message,
        });
      }
    } catch {
      setCouponStatus("invalid");
      setCouponData({
        discountValue: 0n,
        discountType: "",
        message: "Failed to validate coupon",
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!name || !age || !gender || !category || !phone) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    if (Number(age) < 18) {
      setSubmitError("You must be 18 or above to use this service.");
      return;
    }
    if (!actor) {
      setSubmitError("Service unavailable. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await actor.submitSession(
        phone,
        name,
        age,
        gender,
        preferredListener,
        language,
        category,
        description,
        BigInt(duration),
        couponStatus === "valid" ? couponCode : "",
        referralCode,
        getDateCode(),
      );
      sessionStorage.setItem(
        "vishwodya_confirmation",
        JSON.stringify({
          sessionId: result.sessionId,
          userReferralCode: result.userReferralCode,
          name,
          phone,
          duration,
          category,
          finalPrice,
          language,
        }),
      );
      navigate({
        to: "/confirmation/$sessionId",
        params: { sessionId: result.sessionId },
      });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pricing Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex flex-wrap gap-4 justify-center">
              {DURATIONS.map((d) => (
                <div key={d.minutes} className="text-center">
                  <div className="font-display font-bold text-primary text-lg">
                    ₹{d.price}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {d.label}
                  </div>
                </div>
              ))}
            </div>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Request a Listening Session
            </h1>
            <p className="text-muted-foreground mb-8">
              Share what's on your mind. A listener will call you within 1 hour.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name or Nickname <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-ocid="book_form.name_input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">
                  Age <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="18+"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  data-ocid="book_form.age_input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select onValueChange={setGender} required>
                  <SelectTrigger data-ocid="book_form.gender_select">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Prefer not to say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Listener</Label>
                <RadioGroup
                  value={preferredListener}
                  onValueChange={setPreferredListener}
                  className="flex gap-4"
                  data-ocid="book_form.listener_radio"
                >
                  {["Male", "Female", "Any"].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`listener-${v}`} />
                      <Label
                        htmlFor={`listener-${v}`}
                        className="cursor-pointer"
                      >
                        {v}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Session Language</Label>
                <RadioGroup
                  value={language}
                  onValueChange={setLanguage}
                  className="flex gap-4"
                  data-ocid="book_form.language_radio"
                >
                  {["Hindi", "English"].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`lang-${v}`} />
                      <Label htmlFor={`lang-${v}`} className="cursor-pointer">
                        {v}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>
                  What's on your mind?{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select onValueChange={setCategory} required>
                  <SelectTrigger data-ocid="book_form.category_select">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tell us more (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Share a little about what's going on..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  data-ocid="book_form.description_textarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone / WhatsApp Number{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-ocid="book_form.phone_input"
                  required
                />
                {existingUser && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Welcome back, {existingUser.name}! You have{" "}
                    {String(existingUser.freeMinutesBalance)} free minutes.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>
                  Session Duration <span className="text-destructive">*</span>
                </Label>
                <div
                  className="grid grid-cols-3 gap-3"
                  data-ocid="book_form.duration_radio"
                >
                  {DURATIONS.map((d) => (
                    <button
                      key={d.minutes}
                      type="button"
                      onClick={() => {
                        setDuration(d.minutes);
                        setCouponStatus("idle");
                        setCouponData(null);
                      }}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        duration === d.minutes
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-display font-bold text-xl text-foreground">
                        ₹{d.price}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {d.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {existingUser && Number(existingUser.freeMinutesBalance) > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Use Free Minutes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You have {String(existingUser.freeMinutesBalance)} free
                      minutes available
                    </p>
                  </div>
                  <Switch
                    checked={useFreeMinutes}
                    onCheckedChange={setUseFreeMinutes}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="coupon">Coupon Code (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      if (couponStatus !== "idle") {
                        setCouponStatus("idle");
                        setCouponData(null);
                      }
                    }}
                    data-ocid="book_form.coupon_input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={couponStatus === "loading" || !couponCode.trim()}
                    data-ocid="book_form.coupon_button"
                  >
                    {couponStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Tag className="w-4 h-4 mr-1" />
                    )}
                    Apply
                  </Button>
                </div>
                {couponStatus === "valid" && couponData && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {couponData.message}{" "}
                    — saving ₹{discount}
                  </p>
                )}
                {couponStatus === "invalid" && couponData && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponData.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral">Referral Code (optional)</Label>
                <Input
                  id="referral"
                  placeholder="Friend's referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  data-ocid="book_form.referral_input"
                />
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Session ({duration} min)
                      </span>
                      <span>₹{basePrice}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    {freeMinutesDiscount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Free minutes</span>
                        <span>-₹{Math.round(freeMinutesDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-1 border-t border-primary/20">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{Math.round(finalPrice)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment collected via UPI/WhatsApp before the call.
                  </p>
                </CardContent>
              </Card>

              {submitError && (
                <Alert variant="destructive" data-ocid="book_form.error_state">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base py-6"
                disabled={isSubmitting}
                data-ocid="book_form.submit_button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="w-5 h-5 mr-2 animate-spin"
                      data-ocid="book_form.loading_state"
                    />
                    Submitting...
                  </>
                ) : (
                  "Request Session →"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting, you confirm you are 18+. This service is for
                emotional support only.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
