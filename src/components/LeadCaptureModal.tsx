"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Building2, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  monthlySavings: number;
  shareId: string;
}

export function LeadCaptureModal({ open, onClose, monthlySavings, shareId }: LeadCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState(""); // abuse prevention
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot check — bots fill hidden field
    if (honeypot) return;
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, role, shareId, monthlySavings }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f0f1a] shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header gradient bar */}
              <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {submitted ? "You're on the list! 🎉" : "Get Your Full Report"}
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                      {submitted
                        ? "Check your email for your detailed audit report"
                        : monthlySavings > 0
                        ? `Save ${formatCurrency(monthlySavings)}/month — we'll send implementation steps`
                        : "Get personalized AI tooling recommendations"}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer ml-4"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {submitted ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                    <p className="text-white/60 text-sm">
                      We&apos;ll be in touch within 24 hours with your personalized savings plan.
                    </p>
                    <Button variant="outline" onClick={onClose} className="mt-6">
                      Close
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Honeypot — visually hidden */}
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      style={{ display: "none" }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div className="space-y-1.5">
                      <Label htmlFor="lead-email">
                        Work Email <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <Input
                          id="lead-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="lead-company">Company</Label>
                        <div className="relative">
                          <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                          <Input
                            id="lead-company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Acme Inc"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lead-role">Role</Label>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                          <Input
                            id="lead-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="CTO, EM, etc."
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle size={14} />
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Get Free Report →"
                      )}
                    </Button>

                    <p className="text-xs text-center text-white/30">
                      No spam. Unsubscribe anytime. Your data stays private.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
