import { Separator } from "@/components/ui/separator";
import { Headphones, Heart, Shield } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Headphones className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-display font-semibold text-lg">
                Vishwodya Listener
              </span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Someone who truly listens. A safe space to share what's on your
              mind.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 opacity-90">Privacy Promise</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> No call recording
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Anonymous support allowed
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Your data is protected
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 opacity-90">Disclaimer</h4>
            <p className="text-xs opacity-60 leading-relaxed">
              This platform provides emotional listening support only. It is not
              a substitute for professional therapy. Service available for users
              18 and above.
            </p>
          </div>
        </div>
        <Separator className="opacity-20 mb-4" />
        <p className="text-xs opacity-50 text-center">
          © {year}. Built with <Heart className="w-3 h-3 inline text-accent" />{" "}
          using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
