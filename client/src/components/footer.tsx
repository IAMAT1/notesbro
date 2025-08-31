import { GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="text-2xl" />
              <span className="text-2xl font-bold">Notes Bro</span>
            </div>
            <p className="text-primary-foreground/80">Your trusted study companion for academic success.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-links-title">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link href="/" className="hover:text-accent transition-colors" data-testid="link-footer-home">Home</Link></li>
              <li><a href="#subjects" className="hover:text-accent transition-colors" data-testid="link-footer-subjects">Subjects</a></li>
              <li><a href="#" className="hover:text-accent transition-colors" data-testid="link-footer-premium">Premium Notes</a></li>
              <li><a href="#" className="hover:text-accent transition-colors" data-testid="link-footer-onepager">One Pagers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © 2025 <span className="text-accent">Notes Bro</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
