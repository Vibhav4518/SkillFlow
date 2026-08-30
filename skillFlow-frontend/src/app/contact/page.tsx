"use client";

import { useState } from "react";
import { contactApi } from "@/services/contact.api";
import { useToast } from "@/context/ToastContext";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await contactApi.submitMessage(form);
      if (res?.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setForm({ name: "", email: "", subject: "", message: "" });
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
    <div className="min-h-screen py-16" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--color-text)" }}>Get in Touch</h1>
          <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "var(--color-text-muted)" }}>
            Have a question or feedback? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: "Email",
                value: "support@skillflow.io",
                color: "text-indigo-600",
                bg: "rgba(99,102,241,0.1)",
              },
              {
                icon: Phone,
                title: "Phone",
                value: "+91 800 123 4567",
                color: "text-cyan-600",
                bg: "rgba(6,182,212,0.1)",
              },
              {
                icon: MapPin,
                title: "Location",
                value: "Lucknow, Uttar Pradesh, India",
                color: "text-emerald-600",
                bg: "rgba(16,185,129,0.1)",
              },
            ].map(({ icon: Icon, title, value, color, bg }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border p-5 shadow-sm"
                style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
              >
                <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: bg }}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div
            className="lg:col-span-2 rounded-3xl border p-6 sm:p-8 shadow-sm"
            style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: "var(--color-text)" }}>Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
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
                    className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
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
                  placeholder="What is this about?"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5" style={{ color: "var(--color-text-muted)" }}>Message</label>
                <textarea
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={inputStyle}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Message</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
