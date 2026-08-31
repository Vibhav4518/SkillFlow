"use client";

import { useState } from "react";
import { contactApi } from "@/services/contact.api";
import { useToast } from "@/context/ToastContext";
import { Mail, Phone, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, MessageSquare, Clock, ShieldCheck, Zap } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "How do I apply for jobs on SkillFlow?",
    answer: "Browse available positions under Job Search, click 'Apply for this Position', and choose to submit your uploaded resume or your generated SkillFlow profile summary.",
  },
  {
    question: "How long does company verification take for Employers?",
    answer: "Our administrative team reviews company verification submissions within 24 to 48 business hours. You will receive an automated notification once approved.",
  },
  {
    question: "Can I update or withdraw my application after submitting?",
    answer: "Yes, candidates can view, track, and withdraw active applications anytime from their Candidate Dashboard under the Applications tab.",
  },
  {
    question: "How do I bookmark candidate applications or job openings?",
    answer: "Simply click the bookmark icon on any job card or candidate application to save it to your Bookmarks tab for quick evaluation.",
  },
];

const CATEGORIES = [
  "General Inquiry",
  "Technical Support",
  "Employer & Hiring Help",
  "Account & Billing",
];

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General Inquiry",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await contactApi.submitMessage({
        name: form.name,
        email: form.email,
        subject: `[${form.category}] ${form.subject}`,
        message: form.message,
      });
      if (res?.success) {
        toast.success("Inquiry submitted! Our support team will respond within 24 hours.");
        setForm({ name: "", email: "", category: "General Inquiry", subject: "", message: "" });
      } else {
        toast.error(res?.message || "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--color-bg-input)",
    borderColor: "var(--color-border)",
    color: "var(--color-text)",
  };

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <HelpCircle className="h-3.5 w-3.5" /> Support &amp; Inquiries Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--color-text)" }}>
            How can we assist you today?
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Have a question about job applications, employer verification, or account settings? Our dedicated support team is here to help.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Mail,
              title: "Email Support",
              subtitle: "24/7 Response Desk",
              value: "support@skillflow.io",
              color: "text-indigo-600 dark:text-indigo-400",
              bg: "bg-indigo-50 dark:bg-indigo-950/50",
            },
            {
              icon: Phone,
              title: "Phone Assistance",
              subtitle: "Mon - Fri, 9am - 6pm IST",
              value: "+91 800 123 4567",
              color: "text-cyan-600 dark:text-cyan-400",
              bg: "bg-cyan-50 dark:bg-cyan-950/50",
            },
            {
              icon: MapPin,
              title: "Headquarters",
              subtitle: "Uttar Pradesh Tech Park",
              value: "Lucknow, UP, India",
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/50",
            },
            {
              icon: Clock,
              title: "Average SLA",
              subtitle: "Response Guarantee",
              value: "< 2 Business Hours",
              color: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950/50",
            },
          ].map(({ icon: Icon, title, subtitle, value, color, bg }) => (
            <div
              key={title}
              className="rounded-3xl border p-6 shadow-sm flex flex-col justify-between space-y-3 transition hover:shadow-md"
              style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl shrink-0 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--color-text)" }}>{title}</h3>
                  <p className="text-[11px]" style={{ color: "var(--color-text-subtle)" }}>{subtitle}</p>
                </div>
              </div>
              <p className="text-xs font-semibold pt-2 border-t" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Grid: Form + FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Support Form */}
          <div
            className="lg:col-span-7 rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Submit an Inquiry
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Fill out the details below and an agent will review your inquiry.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2" style={{ color: "var(--color-text-muted)" }}>Inquiry Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        form.category === cat ? "bg-indigo-600 text-white shadow-sm" : "border hover:opacity-80"
                      }`}
                      style={form.category !== cat ? { borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-muted)", color: "var(--color-text-muted)" } : {}}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border px-4 py-2.5 text-xs font-medium focus:outline-none shadow-xs"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full rounded-xl border px-4 py-2.5 text-xs font-medium focus:outline-none shadow-xs"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief summary of your inquiry..."
                  className="w-full rounded-xl border px-4 py-2.5 text-xs font-medium focus:outline-none shadow-xs"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Message Details</label>
                <textarea
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue or feedback in detail..."
                  className="w-full rounded-xl border px-4 py-2.5 text-xs font-medium focus:outline-none resize-none shadow-xs"
                  style={inputStyle}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] flex items-center gap-1" style={{ color: "var(--color-text-subtle)" }}>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Encrypted &amp; confidential
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending...</>
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Submit Message</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border p-6 shadow-sm space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-lg" style={{ color: "var(--color-text)" }}>Frequently Asked Questions</h3>
              </div>

              <div className="space-y-3">
                {FAQ_ITEMS.map((faq, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border transition overflow-hidden"
                      style={{ borderColor: "var(--color-border)", backgroundColor: isOpen ? "var(--color-bg-muted)" : "transparent" }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left text-xs font-bold transition"
                        style={{ color: "var(--color-text)" }}
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-indigo-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs leading-relaxed border-t pt-2" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
