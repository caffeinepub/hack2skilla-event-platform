import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TechEvent, Testimonial } from "../backend.d";
import { EventCategory, EventStatus } from "../backend.d";
import {
  useCreateEvent,
  useCreateTestimonial,
  useDeleteEvent,
  useEvents,
  useIsCallerAdmin,
  usePublishEvent,
  useUpdateEvent,
} from "../hooks/useQueries";
import { clearAdminSession, isAdminSessionActive } from "../utils/auth";
import {
  CATEGORY_LABELS,
  SAMPLE_EVENTS,
  STATUS_CONFIG,
  bigintToDate,
  dateToBigint,
  formatDateTime,
} from "../utils/sampleData";

// ---- Blank event template ----
function blankEvent(): TechEvent {
  return {
    id: BigInt(0),
    name: "",
    category: EventCategory.hackathon,
    description: "",
    dateTime: BigInt(Date.now() * 1_000_000),
    endDateTime: undefined,
    location: "",
    onlineLink: undefined,
    isFree: true,
    price: 0,
    registrationLimit: BigInt(100),
    currentRegistrations: BigInt(0),
    status: EventStatus.upcoming,
    isPublished: false,
    bannerBlobId: undefined,
    specialInstructions: undefined,
    createdAt: BigInt(Date.now() * 1_000_000),
  };
}

// ---- Helpers ----
function toDatetimeLocal(ns: bigint): string {
  const d = bigintToDate(ns);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function fromDatetimeLocal(val: string): bigint {
  return dateToBigint(new Date(val));
}

function exportCSV(rows: TechEvent[]) {
  const headers = [
    "ID",
    "Name",
    "Category",
    "Date",
    "Status",
    "Published",
    "Registrations",
    "Free",
    "Price",
  ];
  const lines = rows.map((e) =>
    [
      e.id.toString(),
      `"${e.name}"`,
      e.category,
      formatDateTime(e.dateTime),
      e.status,
      e.isPublished ? "Yes" : "No",
      e.currentRegistrations.toString(),
      e.isFree ? "Yes" : "No",
      e.price,
    ].join(","),
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "events.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Event Form ----
function EventForm({
  initial,
  onSave,
  isSaving,
}: {
  initial: TechEvent;
  onSave: (event: TechEvent, publish: boolean) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<TechEvent>(initial);

  const set = (patch: Partial<TechEvent>) =>
    setForm((p) => ({ ...p, ...patch }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form fields */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Event Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. HyderHack 2026"
            className="bg-muted/50 border-border/50"
            data-ocid="event_form.name.input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => set({ category: v as EventCategory })}
            >
              <SelectTrigger
                className="bg-muted/50 border-border/50"
                data-ocid="event_form.category.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set({ status: v as EventStatus })}
            >
              <SelectTrigger
                className="bg-muted/50 border-border/50"
                data-ocid="event_form.status.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EventStatus.upcoming}>Upcoming</SelectItem>
                <SelectItem value={EventStatus.live}>Live</SelectItem>
                <SelectItem value={EventStatus.completed}>Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description *</Label>
          <Textarea
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Describe the event..."
            rows={4}
            className="bg-muted/50 border-border/50 resize-none"
            data-ocid="event_form.description.textarea"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start Date &amp; Time *</Label>
            <Input
              type="datetime-local"
              value={toDatetimeLocal(form.dateTime)}
              onChange={(e) =>
                set({ dateTime: fromDatetimeLocal(e.target.value) })
              }
              className="bg-muted/50 border-border/50"
              data-ocid="event_form.datetime.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label>End Date &amp; Time</Label>
            <Input
              type="datetime-local"
              value={form.endDateTime ? toDatetimeLocal(form.endDateTime) : ""}
              onChange={(e) =>
                set({
                  endDateTime: e.target.value
                    ? fromDatetimeLocal(e.target.value)
                    : undefined,
                })
              }
              className="bg-muted/50 border-border/50"
              data-ocid="event_form.end_datetime.input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Location *</Label>
          <Input
            value={form.location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="e.g. HICC Convention Centre, Hyderabad"
            className="bg-muted/50 border-border/50"
            data-ocid="event_form.location.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Online Link{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            value={form.onlineLink ?? ""}
            onChange={(e) => set({ onlineLink: e.target.value || undefined })}
            placeholder="https://..."
            className="bg-muted/50 border-border/50"
            data-ocid="event_form.online_link.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Banner Image URL{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            value={form.bannerBlobId ?? ""}
            onChange={(e) => set({ bannerBlobId: e.target.value || undefined })}
            placeholder="https://... or /assets/generated/..."
            className="bg-muted/50 border-border/50"
            data-ocid="event_form.banner.input"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <Label className="text-sm">Payment</Label>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${form.isFree ? "text-green-400 font-semibold" : "text-muted-foreground"}`}
              >
                Free
              </span>
              <Switch
                checked={!form.isFree}
                onCheckedChange={(v) => set({ isFree: !v })}
                data-ocid="event_form.payment.switch"
              />
              <span
                className={`text-sm ${!form.isFree ? "text-neon-purple font-semibold" : "text-muted-foreground"}`}
              >
                Paid
              </span>
            </div>
          </div>

          {!form.isFree && (
            <div className="space-y-1 flex-1">
              <Label className="text-sm">Price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set({ price: Number(e.target.value) })}
                className="bg-muted/50 border-border/50 h-9"
                data-ocid="event_form.price.input"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-sm">Reg. Limit</Label>
            <Input
              type="number"
              min={0}
              value={Number(form.registrationLimit)}
              onChange={(e) =>
                set({ registrationLimit: BigInt(Number(e.target.value)) })
              }
              className="bg-muted/50 border-border/50 h-9 w-24"
              data-ocid="event_form.reg_limit.input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>
            Special Instructions{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            value={form.specialInstructions ?? ""}
            onChange={(e) =>
              set({ specialInstructions: e.target.value || undefined })
            }
            placeholder="Any special notes for attendees..."
            rows={2}
            className="bg-muted/50 border-border/50 resize-none"
            data-ocid="event_form.instructions.textarea"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onSave(form, false)}
            disabled={
              isSaving || !form.name || !form.description || !form.location
            }
            variant="outline"
            className="flex-1 border-border/50"
            data-ocid="event_form.save_draft.button"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Draft"
            )}
          </Button>
          <Button
            onClick={() => onSave(form, true)}
            disabled={
              isSaving || !form.name || !form.description || !form.location
            }
            className="flex-1 btn-gradient text-white border-0"
            data-ocid="event_form.publish.button"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:sticky lg:top-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Live Preview
        </p>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="h-36 bg-gradient-to-br from-[#0A1430] to-[#050A18] relative">
            {form.bannerBlobId ? (
              <img
                src={form.bannerBlobId}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-4xl opacity-20">🖼️</span>
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                Upcoming
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  form.isFree
                    ? "bg-green-500/80 text-white"
                    : "bg-neon-purple/80 text-white"
                }`}
              >
                {form.isFree ? "Free" : `₹${form.price}`}
              </span>
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm line-clamp-2">
              {form.name || "Event Name"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {form.description || "Event description will appear here."}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDateTime(form.dateTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <span>📍</span>
              <span className="truncate">{form.location || "Location"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main Dashboard ----
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const { data: backendEvents, isLoading: eventsLoading } = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const publishEvent = usePublishEvent();
  const createTestimonial = useCreateTestimonial();

  const [editingEvent, setEditingEvent] = useState<TechEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    content: "",
  });
  const [testimonialSaved, setTestimonialSaved] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isAdminSessionActive()) {
      void navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      clearAdminSession();
      void navigate({ to: "/admin/login" });
    }
  }, [adminLoading, isAdmin, navigate]);

  function handleLogout() {
    clearAdminSession();
    void navigate({ to: "/" });
  }

  const allEvents: TechEvent[] =
    backendEvents && backendEvents.length > 0 ? backendEvents : SAMPLE_EVENTS;

  // Analytics
  const totalRegistrations = allEvents.reduce(
    (sum, e) => sum + Number(e.currentRegistrations),
    0,
  );
  const publishedEvents = allEvents.filter((e) => e.isPublished).length;
  const upcomingCount = allEvents.filter(
    (e) => e.status === EventStatus.upcoming,
  ).length;
  const totalRevenue = allEvents
    .filter((e) => !e.isFree)
    .reduce((sum, e) => sum + e.price * Number(e.currentRegistrations), 0);

  async function handleSaveEvent(event: TechEvent, publish: boolean) {
    const toSave = { ...event, isPublished: publish };
    try {
      if (event.id === BigInt(0)) {
        const newId = await createEvent.mutateAsync(toSave);
        if (publish) await publishEvent.mutateAsync(newId);
        toast.success("Event created!");
      } else {
        await updateEvent.mutateAsync({ id: event.id, event: toSave });
        if (publish && !event.isPublished)
          await publishEvent.mutateAsync(event.id);
        toast.success("Event updated!");
      }
      setEditingEvent(null);
    } catch {
      toast.error("Failed to save event.");
    }
  }

  async function handleDelete(id: bigint) {
    try {
      await deleteEvent.mutateAsync(id);
      setDeleteConfirm(null);
      toast.success("Event deleted.");
    } catch {
      toast.error("Failed to delete event.");
    }
  }

  async function handleTogglePublish(event: TechEvent) {
    try {
      await publishEvent.mutateAsync(event.id);
      toast.success(
        event.isPublished ? "Event unpublished." : "Event published!",
      );
    } catch {
      toast.error("Failed to update publish status.");
    }
  }

  async function handleCreateTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.content) {
      toast.error("Name and content are required.");
      return;
    }
    const t: Testimonial = {
      id: BigInt(0),
      name: testimonialForm.name,
      role: testimonialForm.role,
      content: testimonialForm.content,
      isPublished: true,
      createdAt: BigInt(Date.now() * 1_000_000),
    };
    try {
      await createTestimonial.mutateAsync(t);
      setTestimonialSaved(true);
      setTestimonialForm({ name: "", role: "", content: "" });
      toast.success("Testimonial added!");
    } catch {
      toast.error("Failed to save testimonial.");
    }
  }

  const isMutating = createEvent.isPending || updateEvent.isPending;

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[rgba(5,10,24,0.95)] backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm gradient-text">
                Hack2Skilla
              </span>
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm text-muted-foreground font-medium">
              Admin Dashboard
            </span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            data-ocid="admin.logout.button"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList
            className="bg-muted/30 border border-border/30 p-1 rounded-xl"
            data-ocid="admin.tabs"
          >
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan rounded-lg"
              data-ocid="admin.events.tab"
            >
              <Calendar className="w-4 h-4 mr-1.5" />
              Events
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan rounded-lg"
              data-ocid="admin.create.tab"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create
            </TabsTrigger>
            <TabsTrigger
              value="registrations"
              className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan rounded-lg"
              data-ocid="admin.registrations.tab"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Registrations
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan rounded-lg"
              data-ocid="admin.analytics.tab"
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="testimonials"
              className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan rounded-lg"
              data-ocid="admin.testimonials.tab"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger
              value="newsletter"
              className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan rounded-lg"
              data-ocid="admin.newsletter.tab"
            >
              <Mail className="w-4 h-4 mr-1.5" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          {/* ===== EVENTS TAB ===== */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold gradient-text">All Events</h2>
              <Button
                onClick={() => exportCSV(allEvents)}
                variant="outline"
                size="sm"
                className="border-border/50 gap-1.5"
                data-ocid="admin.events.export.button"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            {eventsLoading ? (
              <div
                className="text-center py-16"
                data-ocid="admin.events.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan mx-auto" />
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">
                        Event
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Category
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Published
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Registrations
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEvents.map((event, i) => (
                      <TableRow
                        key={event.id.toString()}
                        className="border-border/20"
                        data-ocid={`admin.events.row.${i + 1}`}
                      >
                        <TableCell>
                          <div className="font-medium text-sm line-clamp-1 max-w-48">
                            {event.name}
                          </div>
                          {!event.isFree && (
                            <div className="text-xs text-muted-foreground">
                              ₹{event.price}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs border-neon-cyan/30 text-neon-cyan"
                          >
                            {CATEGORY_LABELS[event.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(event.dateTime)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_CONFIG[event.status]?.color}`}
                          >
                            {STATUS_CONFIG[event.status]?.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(event)}
                            className={`flex items-center gap-1 text-xs ${
                              event.isPublished
                                ? "text-green-400"
                                : "text-muted-foreground"
                            }`}
                            data-ocid={`admin.events.publish.toggle.${i + 1}`}
                          >
                            {event.isPublished ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                            {event.isPublished ? "Live" : "Draft"}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm">
                          {Number(event.currentRegistrations)}/
                          {Number(event.registrationLimit)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingEvent(event)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                              data-ocid={`admin.events.edit.button.${i + 1}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(event.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              data-ocid={`admin.events.delete.button.${i + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ===== CREATE TAB ===== */}
          <TabsContent value="create">
            <h2 className="text-xl font-bold gradient-text mb-6">
              Create New Event
            </h2>
            <EventForm
              initial={blankEvent()}
              onSave={handleSaveEvent}
              isSaving={isMutating}
            />
          </TabsContent>

          {/* ===== REGISTRATIONS TAB ===== */}
          <TabsContent value="registrations" className="space-y-4">
            <h2 className="text-xl font-bold gradient-text">
              Registrations Overview
            </h2>
            <div className="glass-card rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Event
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Registrations
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Limit
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Fill %
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEvents.map((event, i) => {
                    const pct =
                      event.registrationLimit > 0n
                        ? Math.min(
                            100,
                            Math.round(
                              Number(
                                (event.currentRegistrations * 100n) /
                                  event.registrationLimit,
                              ),
                            ),
                          )
                        : 0;
                    const rev = event.isFree
                      ? 0
                      : event.price * Number(event.currentRegistrations);
                    return (
                      <TableRow
                        key={event.id.toString()}
                        className="border-border/20"
                        data-ocid={`admin.registrations.row.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm line-clamp-1 max-w-52">
                          {event.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs border-neon-cyan/30 text-neon-cyan"
                          >
                            {CATEGORY_LABELS[event.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Number(event.currentRegistrations)}
                        </TableCell>
                        <TableCell>{Number(event.registrationLimit)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 90
                                    ? "bg-red-500"
                                    : pct >= 70
                                      ? "bg-yellow-500"
                                      : "bg-neon-cyan"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.isFree ? (
                            <span className="text-green-400 text-xs">Free</span>
                          ) : (
                            <span>₹{rev.toLocaleString()}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={() => exportCSV(allEvents)}
              variant="outline"
              className="border-border/50 gap-2"
              data-ocid="admin.registrations.export.button"
            >
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-bold gradient-text">Analytics</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Registrations",
                  value: totalRegistrations.toLocaleString(),
                  icon: Users,
                  color: "text-neon-cyan",
                  bg: "bg-neon-cyan/10",
                  ocid: "analytics.registrations.card",
                },
                {
                  label: "Published Events",
                  value: publishedEvents.toString(),
                  icon: Eye,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  ocid: "analytics.published.card",
                },
                {
                  label: "Total Revenue",
                  value: `₹${totalRevenue.toLocaleString()}`,
                  icon: DollarSign,
                  color: "text-neon-purple",
                  bg: "bg-neon-purple/10",
                  ocid: "analytics.revenue.card",
                },
                {
                  label: "Upcoming Events",
                  value: upcomingCount.toString(),
                  icon: TrendingUp,
                  color: "text-neon-blue",
                  bg: "bg-neon-blue/10",
                  ocid: "analytics.upcoming.card",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5"
                  data-ocid={stat.ocid}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Events by status */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Events by Status
              </h3>
              <div className="space-y-3">
                {(["upcoming", "live", "completed"] as EventStatus[]).map(
                  (status) => {
                    const count = allEvents.filter(
                      (e) => e.status === status,
                    ).length;
                    const pct =
                      allEvents.length > 0
                        ? Math.round((count / allEvents.length) * 100)
                        : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {status}
                          </span>
                          <span className="font-semibold">
                            {count} events ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${STATUS_CONFIG[status]?.color ?? "bg-muted"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Events by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => {
                  const count = allEvents.filter(
                    (e) => e.category === k,
                  ).length;
                  return (
                    <div
                      key={k}
                      className="p-3 rounded-xl bg-muted/30 text-center"
                    >
                      <p className="text-lg font-bold text-foreground">
                        {count}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {v}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ===== TESTIMONIALS TAB ===== */}
          <TabsContent value="testimonials" className="space-y-6">
            <h2 className="text-xl font-bold gradient-text">
              Manage Testimonials
            </h2>

            <div className="glass-card rounded-2xl p-6 max-w-xl">
              <h3 className="font-semibold text-foreground mb-4">
                Add Testimonial
              </h3>
              {testimonialSaved && (
                <div
                  className="flex items-center gap-2 text-green-400 text-sm mb-4"
                  data-ocid="testimonials.success_state"
                >
                  <CheckCircle className="w-4 h-4" />
                  Testimonial saved!
                </div>
              )}
              <form onSubmit={handleCreateTestimonial} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input
                    value={testimonialForm.name}
                    onChange={(e) =>
                      setTestimonialForm((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. Priya Sharma"
                    required
                    className="bg-muted/50 border-border/50"
                    data-ocid="testimonials.name.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role / Company</Label>
                  <Input
                    value={testimonialForm.role}
                    onChange={(e) =>
                      setTestimonialForm((p) => ({
                        ...p,
                        role: e.target.value,
                      }))
                    }
                    placeholder="e.g. Software Engineer at Google"
                    className="bg-muted/50 border-border/50"
                    data-ocid="testimonials.role.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Content *</Label>
                  <Textarea
                    value={testimonialForm.content}
                    onChange={(e) =>
                      setTestimonialForm((p) => ({
                        ...p,
                        content: e.target.value,
                      }))
                    }
                    placeholder="What did they say?"
                    rows={4}
                    required
                    className="bg-muted/50 border-border/50 resize-none"
                    data-ocid="testimonials.content.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  className="btn-gradient text-white border-0"
                  disabled={createTestimonial.isPending}
                  data-ocid="testimonials.add.button"
                >
                  {createTestimonial.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Testimonial"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* ===== NEWSLETTER TAB ===== */}
          <TabsContent value="newsletter" className="space-y-6">
            <h2 className="text-xl font-bold gradient-text">
              Newsletter Subscribers
            </h2>
            <div className="glass-card rounded-2xl p-8 text-center max-w-md">
              <Mail className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-60" />
              <h3 className="font-semibold text-foreground mb-2">
                Subscriber Management
              </h3>
              <p className="text-sm text-muted-foreground">
                Newsletter subscriptions are processed via the backend.
                Subscribers receive updates about new events and announcements.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Use the unsubscribe API to manage individual subscribers.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Event Dialog */}
      <Dialog
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
      >
        <DialogContent
          className="max-w-5xl bg-popover border-border/50 max-h-[90vh] overflow-y-auto"
          data-ocid="admin.edit_event.dialog"
        >
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <EventForm
              initial={editingEvent}
              onSave={handleSaveEvent}
              isSaving={isMutating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent
          className="max-w-sm bg-popover border-border/50"
          data-ocid="admin.delete_event.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Event?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All registrations for this event will
            also be removed.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="border-border/50"
              data-ocid="admin.delete_event.cancel.button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteEvent.isPending}
              data-ocid="admin.delete_event.confirm.button"
            >
              {deleteEvent.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
