import { MusicWaves } from "./MusicWaves";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-earth text-cream py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              <MusicWaves className="[&>div]:bg-primary" barCount={4} />
              <span className="font-display font-bold text-xl">
                Tune<span className="text-primary">trails</span>
              </span>
            </a>
            <p className="text-cream/70 text-sm leading-relaxed mb-6">
              Africa's music ecosystem. Learn, teach, perform, and connect with the music community.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream/70 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Find Teachers</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Hire Musicians</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Become a Teacher</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">List Your Band</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Safety Guidelines</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Trust & Safety</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-cream/70 hover:text-cream transition-colors text-sm">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-cream/70 text-sm">
                <Mail className="h-4 w-4" />
                hello@tunetrails.co.ke
              </li>
              <li className="flex items-center gap-2 text-cream/70 text-sm">
                <Phone className="h-4 w-4" />
                +254 700 123 456
              </li>
              <li className="flex items-start gap-2 text-cream/70 text-sm">
                <MapPin className="h-4 w-4 mt-0.5" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 text-sm">
            © 2024 Tunetrails. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-cream/50 text-sm">Payments powered by</span>
            <span className="font-semibold text-cream">M-Pesa</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
