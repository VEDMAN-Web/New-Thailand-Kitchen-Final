"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
  MessageSquare,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  deleteContact,
  listContacts,
  type ContactLead,
} from "@/services/adminAPI";
import {
  deleteVarsoviaContact,
  listVarsoviaContacts,
  type VarsoviaRecord,
} from "@/services/varsoviaAPI";
import AdminSkeleton from "@/components/AdminSkeleton";

function mapVarsoviaLead(row: VarsoviaRecord): ContactLead {
  return {
    _id: String(row._id || ""),
    fullName: String(row.name || ""),
    email: String(row.email || ""),
    phoneNumber: String(row.phone || ""),
    whatsappNumber: String(row.whatsapp || ""),
    cityName: String(row.city || ""),
    countryName: String(row.country || ""),
    message: String(row.message || ""),
    source: String(row.source || ""),
    projectType: String(row.projectType || ""),
    budget: String(row.budget || ""),
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : row.createdAt
          ? new Date(String(row.createdAt)).toISOString()
          : undefined,
  };
}

function sourceLabel(source?: string) {
  const value = String(source || "").trim();
  if (!value) return "—";
  if (value === "journal-contact" || value === "blog-contact") return "Journal · Get In Touch";
  if (value === "get-in-touch") return "Get In Touch";
  if (value === "catalogue") return "Catalogue";
  if (value === "contact") return "Contact page";
  return value;
}

export default function AdminContactsPage() {
  const { siteId } = useAdminAuth();
  const isVarsovia = siteId === "varsovia-kitchen";
  const [items, setItems] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ContactLead | null>(null);
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setLoading(true);
    try {
      if (isVarsovia) {
        const rows = await listVarsoviaContacts();
        if (seq !== loadSeqRef.current) return;
        setItems(rows.map(mapVarsoviaLead));
      } else {
        const res = await listContacts();
        if (seq !== loadSeqRef.current) return;
        setItems(res.data || []);
      }
    } catch (err: unknown) {
      if (seq !== loadSeqRef.current) return;
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      toast.error(
        status === 401
          ? "Session expired — please log in again"
          : isVarsovia
            ? "Failed to load Varsovia leads"
            : "Failed to load contacts (is API running on port 5000?)"
      );
      setItems([]);
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [isVarsovia]);

  useEffect(() => {
    load();
  }, [load, siteId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [
        item.fullName,
        item.email,
        item.phoneNumber,
        item.whatsappNumber,
        item.cityName,
        item.countryName,
        item.message,
        item.source,
        item.projectType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const onDelete = async (item: ContactLead) => {
    if (!confirm(`Delete enquiry from "${item.fullName}"?`)) return;
    try {
      if (isVarsovia) {
        await deleteVarsoviaContact(item._id);
      } else {
        await deleteContact(item._id);
      }
      toast.success("Deleted");
      if (selected?._id === item._id) setSelected(null);
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
    <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="relative flex-1 min-w-0 w-full sm:min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone, message…"
              className="w-full rounded-lg border border-[#E2E5EA] bg-white pl-10 pr-3 py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E5EA] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2332] hover:bg-[#F8FAFC] disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[#E8EAED] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Inbox className="w-4 h-4 text-[#6B7280] shrink-0" />
              <p className="text-sm text-[#6B7280]">
                {loading
                  ? "Loading…"
                  : `${filtered.length}${
                      query.trim() ? ` of ${items.length}` : ""
                    } enquiries`}
              </p>
            </div>
            <p className="text-xs text-[#9CA3AF] max-w-full sm:max-w-xs text-left sm:text-right">
              {isVarsovia
                ? "Live from Varsovia contact + Get In Touch forms"
                : "Live from website contact forms"}
            </p>
          </div>

          {loading ? (
            <AdminSkeleton variant="rows" count={5} />
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Inbox className="w-10 h-10 mx-auto text-[#D1D5DB] mb-3" />
              <p className="text-sm font-semibold text-[#1A2332]">
                {items.length === 0 ? "No enquiries yet." : "No matches."}
              </p>
              <p className="mt-1 text-xs text-[#6B7280] max-w-md mx-auto">
                {items.length === 0
                  ? isVarsovia
                    ? "When visitors submit Contact, Catalogue, or Get In Touch forms on Varsovia, they appear here automatically."
                    : "When visitors submit Contact, Free Consultation, or Catalogue forms on the Thailand Kitchen website, they appear here automatically."
                  : "Try a different search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-[#F8F9FB] text-left text-xs uppercase tracking-wide text-[#6B7280]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Message</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-[#EEF0F3] hover:bg-[#FAFBFC] cursor-pointer"
                      onClick={() => setSelected(item)}
                    >
                      <td className="px-4 py-3 font-medium text-[#1A1D26]">
                        {item.fullName}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563] whitespace-nowrap">
                        {sourceLabel(item.source)}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">{item.email || "—"}</td>
                      <td className="px-4 py-3 text-[#4B5563]">
                        {item.phoneNumber || item.whatsappNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563] whitespace-nowrap">
                        {[item.cityName, item.countryName]
                          .filter(
                            (v) => v && v !== "Not provided" && v !== "Catalogue Lead"
                          )
                          .join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#4B5563] max-w-[220px] truncate">
                        {item.message || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item);
                          }}
                          className="p-2 rounded-lg text-[#E11D48] hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <div
          className="tk-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="tk-sheet w-full max-w-lg bg-white border border-[#E8EAED] p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#1A2332]">
                  {selected.fullName}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-1">Enquiry detail</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-[#F3F4F6]"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <DetailRow
                icon={<Inbox className="w-4 h-4" />}
                label="Source"
                value={sourceLabel(selected.source)}
              />
              <DetailRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={selected.email || "—"}
              />
              <DetailRow
                icon={<Phone className="w-4 h-4" />}
                label="Phone"
                value={selected.phoneNumber || "—"}
              />
              <DetailRow
                icon={<Phone className="w-4 h-4" />}
                label="WhatsApp"
                value={selected.whatsappNumber || "—"}
              />
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="City"
                value={selected.cityName || "—"}
              />
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="Country"
                value={selected.countryName || "—"}
              />
              <DetailRow
                icon={<Calendar className="w-4 h-4" />}
                label="Submitted"
                value={
                  selected.createdAt
                    ? new Date(selected.createdAt).toLocaleString()
                    : "—"
                }
              />
              <div className="rounded-xl border border-[#E8EAED] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </div>
                <p className="text-[#1A2332] leading-6 whitespace-pre-wrap">
                  {selected.message || "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-[#E2E5EA] px-4 py-2 text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onDelete(selected)}
                className="rounded-lg bg-[#DC2626] text-white px-4 py-2 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#E8EAED] px-4 py-3">
      <span className="mt-0.5 text-[#6B7280]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          {label}
        </p>
        <p className="text-[#1A2332] break-words">{value}</p>
      </div>
    </div>
  );
}
