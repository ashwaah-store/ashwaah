"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  X, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EventItem {
  id: number;
  title: string;
  category: string;
  description: string | null;
  imageUrl: string | null; // JSON string array
  date: string;
  time: string;
  duration: string | null;
  ageLimit: string | null;
  language: string | null;
  genre: string | null;
  location: string;
  cost: string;
  bookingUrl: string | null;
  disclaimer: string | null;
  createdAt: string | null;
}

const CATEGORIES_MAP: Record<string, { label: string; type: "indoor" | "outdoor"; description: string }> = {
  // Indoor (Event Types)
  "meetups": { 
    label: "Meetups", 
    type: "indoor",
    description: "Connect, collaborate, and share ideas with like minded individuals. Every meetup sparks new conversations and lasting networks." 
  },
  "workshops": { 
    label: "Workshops", 
    type: "indoor",
    description: "Hands on learning sessions designed to inspire creativity and skill building. Practical knowledge meets real world application." 
  },
  "performances": { 
    label: "Performances", 
    type: "indoor",
    description: "Experience the energy of live acts that entertain, engage, and captivate audiences. Every performance leaves a lasting impression." 
  },
  "ramp-walks": { 
    label: "Ramp Walks", 
    type: "indoor",
    description: "Showcasing style, confidence, and creativity on the runway. A platform where fashion meets individuality." 
  },
  "fashion-expo": { 
    label: "Fashion Expo", 
    type: "indoor",
    description: "Discover trends, designs, and innovations from emerging and established creators. A celebration of fashion in its finest form." 
  },
  "screening": { 
    label: "Screening", 
    type: "indoor",
    description: "Curated film and media showcases that bring stories to life. Screenings designed to entertain, inform, and inspire." 
  },
  // Outdoor Events
  "carnivals-fairs": { 
    label: "Carnivals & Fairs", 
    type: "outdoor",
    description: "A vibrant mix of food, fun, and festivities under the open sky. Perfect for families, friends, and community bonding." 
  },
  "sports-fitness": { 
    label: "Sports & Fitness Events", 
    type: "outdoor",
    description: "From marathons to yoga retreats, outdoor fitness brings energy and wellness together. Push limits while enjoying nature." 
  },
  "concerts-music": { 
    label: "Concerts & Music Festivals", 
    type: "outdoor",
    description: "Live beats, open air, and electrifying vibes. Outdoor concerts create unforgettable nights of rhythm and connection." 
  },
  "cultural-gatherings": { 
    label: "Cultural Gatherings", 
    type: "outdoor",
    description: "Celebrate traditions, art, and heritage in lively outdoor settings. A showcase of diversity and community spirit." 
  },
  "picnics-social": { 
    label: "Picnics & Social Outings", 
    type: "outdoor",
    description: "Relax, unwind, and share moments in scenic outdoor spaces. Simple joys that turn into cherished memories." 
  },
  "adventure": { 
    label: "Adventure Activities", 
    type: "outdoor",
    description: "Thrill seekers unite with trekking, camping, and outdoor challenges. Every adventure sparks excitement and discovery." 
  }
};

export default function AdminEventsPage() {
  const router = useRouter();

  // State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("meetups");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [language, setLanguage] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [customMediaUrl, setCustomMediaUrl] = useState("");

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, indoor, outdoor

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Registrations state
  const [selectedRegEvent, setSelectedRegEvent] = useState<EventItem | null>(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);

  const fetchAndShowRegistrations = async (event: EventItem) => {
    setSelectedRegEvent(event);
    setIsRegModalOpen(true);
    setIsLoadingRegs(true);
    try {
      const res = await fetch(`/api/admin/events/registrations?eventId=${event.id}`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      } else {
        showToast(data.error || "Failed to load registrations.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading registrations.");
    } finally {
      setIsLoadingRegs(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        showToast(data.error || "Failed to load events.");
      }
      if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      showToast("Failed to fetch events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [router]);

  const openAddModal = () => {
    setEditingEvent(null);
    setTitle("");
    setCategory("meetups");
    setDescription("");
    setDate("");
    setTime("");
    setDuration("");
    setAgeLimit("");
    setLanguage("");
    setGenre("");
    setLocation("");
    setCost("");
    setBookingUrl("");
    setDisclaimer("");
    setMediaList([]);
    setCustomMediaUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingEvent(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description || "");
    setDate(item.date);
    setTime(item.time);
    setDuration(item.duration || "");
    setAgeLimit(item.ageLimit || "");
    setLanguage(item.language || "");
    setGenre(item.genre || "");
    setLocation(item.location);
    setCost(item.cost);
    setBookingUrl(item.bookingUrl || "");
    setDisclaimer(item.disclaimer || "");
    
    // Parse media
    let urls: string[] = [];
    try {
      if (item.imageUrl) {
        urls = JSON.parse(item.imageUrl);
        if (!Array.isArray(urls)) urls = [item.imageUrl];
      }
    } catch (e) {
      urls = item.imageUrl ? [item.imageUrl] : [];
    }
    setMediaList(urls);
    setCustomMediaUrl("");
    setIsModalOpen(true);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let uploadErrors = 0;
    const newUrls: string[] = [];

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            newUrls.push(data.url);
          } else {
            uploadErrors++;
          }
        } catch (err) {
          uploadErrors++;
        }
      });

      await Promise.all(uploadPromises);

      if (newUrls.length > 0) {
        setMediaList((prev) => [...prev, ...newUrls]);
        showToast(
          uploadErrors > 0 
            ? `Uploaded ${newUrls.length} file(s), but ${uploadErrors} failed.` 
            : `Successfully uploaded ${newUrls.length} file(s)!`
        );
      } else {
        showToast("Upload failed.");
      }
    } catch (err) {
      showToast("Error during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const addCustomMediaUrl = () => {
    if (!customMediaUrl.trim()) return;
    setMediaList((prev) => [...prev, customMediaUrl.trim()]);
    setCustomMediaUrl("");
    showToast("Added custom media URL!");
  };

  const removeMediaItem = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
    showToast("Media item removed.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !date.trim() || !time.trim() || !location.trim() || !cost.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      id: editingEvent?.id,
      title: title.trim(),
      category,
      description: description.trim() || null,
      imageUrl: mediaList.length > 0 ? JSON.stringify(mediaList) : null,
      date: date.trim(),
      time: time.trim(),
      duration: duration.trim() || null,
      ageLimit: ageLimit.trim() || null,
      language: language.trim() || null,
      genre: genre.trim() || null,
      location: location.trim(),
      cost: cost.trim(),
      bookingUrl: bookingUrl.trim() || null,
      disclaimer: disclaimer.trim() || null,
    };

    try {
      const url = "/api/admin/events";
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingEvent ? "✓ Event updated!" : "✓ Event created successfully!");
        setIsModalOpen(false);
        fetchEvents();
      } else {
        showToast(data.error || "Failed to save event.");
      }
    } catch (err) {
      showToast("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Event deleted successfully.");
        fetchEvents();
      } else {
        showToast(data.error || "Failed to delete event.");
      }
    } catch (err) {
      showToast("Failed to delete event.");
    }
  };

  const isVideo = (url: string) => {
    return url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes("/uploads/video_") || url.includes("video");
  };

  const getFirstMediaPreview = (imageUrlStr: string | null) => {
    if (!imageUrlStr) return null;
    try {
      const urls = JSON.parse(imageUrlStr);
      if (Array.isArray(urls) && urls.length > 0) {
        return urls[0];
      }
      return imageUrlStr;
    } catch (e) {
      return imageUrlStr;
    }
  };

  // Filter & Search logic
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const catConfig = CATEGORIES_MAP[evt.category];
    if (!catConfig) return matchesSearch;

    if (filterType === "indoor") {
      return matchesSearch && catConfig.type === "indoor";
    } else if (filterType === "outdoor") {
      return matchesSearch && catConfig.type === "outdoor";
    }
    return matchesSearch;
  });

  const indoorCount = events.filter(e => CATEGORIES_MAP[e.category]?.type === "indoor").length;
  const outdoorCount = events.filter(e => CATEGORIES_MAP[e.category]?.type === "outdoor").length;

  return (
    <div className="p-10 min-h-screen bg-gray-50/50">
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1B3022] text-[#C5A059] px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 font-bold text-sm border border-[#C5A059]/20 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-4xl font-playfair font-bold text-brand flex items-center justify-center">
          <Calendar className="mr-3 text-[#C5A059]" size={36} />
          Manage Events
        </h1>
        <p className="mt-2 text-brand/60 font-medium tracking-tight flex items-center justify-center">
          <Sparkles size={16} className="text-[#C5A059] mr-2" />
          Create, edit, and publish company gatherings, workshops, and outdoor festivals.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={openAddModal}
          className="flex items-center justify-center bg-[#1B3022] hover:bg-[#1B3022]/90 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} className="mr-2" />
          Add New Event
        </button>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm">
          <span className="text-[10px] font-black text-brand/35 uppercase tracking-[0.2em] block mb-1">Total Events</span>
          <span className="text-3xl font-bold text-brand">{events.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm">
          <span className="text-[10px] font-black text-brand/35 uppercase tracking-[0.2em] block mb-1">Indoor Events</span>
          <span className="text-3xl font-bold text-brand">{indoorCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm">
          <span className="text-[10px] font-black text-brand/35 uppercase tracking-[0.2em] block mb-1">Outdoor Events</span>
          <span className="text-3xl font-bold text-brand">{outdoorCount}</span>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-brand/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by event title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3022]/10 focus:border-[#1B3022] text-sm text-brand"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-[#1B3022] text-white"
                : "bg-gray-100 text-brand/60 hover:bg-gray-200"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType("indoor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "indoor"
                ? "bg-[#1B3022] text-white"
                : "bg-gray-100 text-brand/60 hover:bg-gray-200"
            }`}
          >
            Indoor (Event Types)
          </button>
          <button
            onClick={() => setFilterType("outdoor")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === "outdoor"
                ? "bg-[#1B3022] text-white"
                : "bg-gray-100 text-brand/60 hover:bg-gray-200"
            }`}
          >
            Outdoor Events
          </button>
        </div>
      </div>

      {/* EVENTS TABLE/LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand/5 shadow-sm">
          <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin mb-4" />
          <p className="text-sm font-bold text-brand/40 uppercase tracking-widest">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand/5 shadow-sm text-center px-4">
          <Calendar className="w-16 h-16 text-[#C5A059]/30 mb-4" />
          <h3 className="text-xl font-playfair font-bold text-brand mb-1">No Events Found</h3>
          <p className="text-sm text-brand/60 max-w-sm">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search filters to find what you are looking for." 
              : "Click 'Add New Event' to publish your first company event."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-brand/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand/5 bg-brand/5 text-[10px] font-black text-brand/35 uppercase tracking-widest">
                  <th className="py-4 px-6">Media Preview</th>
                  <th className="py-4 px-6">Event Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Location & Date</th>
                  <th className="py-4 px-6">Pricing</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {filteredEvents.map((evt) => {
                  const mediaPreview = getFirstMediaPreview(evt.imageUrl);
                  const isVid = mediaPreview ? isVideo(mediaPreview) : false;
                  const categoryName = CATEGORIES_MAP[evt.category]?.label || evt.category;

                  return (
                    <tr key={evt.id} className="hover:bg-brand/[0.01] transition-colors group">
                      <td className="py-5 px-6">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-brand/5 bg-gray-100 relative">
                          {mediaPreview ? (
                            isVid ? (
                              <div className="w-full h-full flex items-center justify-center bg-brand text-white">
                                <Video size={20} className="text-[#C5A059]" />
                              </div>
                            ) : (
                              <img
                                src={mediaPreview}
                                alt={evt.title}
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand/20">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div>
                          <h4 className="font-bold text-brand group-hover:text-[#C5A059] transition-colors line-clamp-1">{evt.title}</h4>
                          {evt.duration && (
                            <p className="text-[10px] font-bold text-brand/40 uppercase tracking-widest mt-1">Duration: {evt.duration}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          CATEGORIES_MAP[evt.category]?.type === "indoor" 
                            ? "bg-[#1B3022]/10 text-[#1B3022]" 
                            : "bg-[#C5A059]/10 text-[#C5A059]"
                        }`}>
                          {categoryName}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-brand/80 flex items-center">
                            <Calendar size={12} className="mr-1.5 text-brand/40" />
                            {evt.date}
                          </p>
                          <p className="text-[10px] font-medium text-brand/50 flex items-center">
                            <MapPin size={10} className="mr-1.5 text-brand/40" />
                            {evt.location}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="font-bold text-brand text-sm">{evt.cost}</span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => fetchAndShowRegistrations(evt)}
                            className="p-2 hover:bg-brand/5 rounded-lg text-brand/70 hover:text-brand transition-all flex items-center justify-center"
                            title="View Registrations"
                          >
                            <Users size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(evt)}
                            className="p-2 hover:bg-brand/5 rounded-lg text-brand/70 hover:text-brand transition-all"
                            title="Edit Event"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-all"
                            title="Delete Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE/EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-brand/40 backdrop-blur-sm" 
            onClick={() => !isSubmitting && setIsModalOpen(false)} 
          />
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-brand/5 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <div>
                <h2 className="text-2xl font-playfair font-bold text-brand">
                  {editingEvent ? "Edit Event Details" : "Add New Event"}
                </h2>
                <p className="text-[10px] font-black text-brand/35 uppercase tracking-widest mt-1">
                  {editingEvent ? "Modify details of an existing event" : "Create a new calendar entry"}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 hover:bg-brand/10 rounded-xl transition-all"
                disabled={isSubmitting}
              >
                <X size={20} className="text-brand/40" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">
                
                {/* Section 1: Basic Information */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-brand/5 space-y-4">
                  <h3 className="text-xs font-black text-brand/35 uppercase tracking-wider mb-2">Basic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Event Title *</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Jamming Night"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand font-medium text-brand"
                      >
                        <optgroup label="Event Types (Indoor)">
                          <option value="meetups">Meetups</option>
                          <option value="workshops">Workshops</option>
                          <option value="performances">Performances</option>
                          <option value="ramp-walks">Ramp Walks</option>
                          <option value="fashion-expo">Fashion Expo</option>
                          <option value="screening">Screening</option>
                        </optgroup>
                        <optgroup label="Outdoor Events">
                          <option value="carnivals-fairs">Carnivals & Fairs</option>
                          <option value="sports-fitness">Sports & Fitness Events</option>
                          <option value="concerts-music">Concerts & Music Festivals</option>
                          <option value="cultural-gatherings">Cultural Gatherings</option>
                          <option value="picnics-social">Picnics & Social Outings</option>
                          <option value="adventure">Adventure Activities</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a detailed description about the event details..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Section 2: Date, Location & Pricing */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-brand/5 space-y-4">
                  <h3 className="text-xs font-black text-brand/35 uppercase tracking-wider mb-2">Schedule, Location & Cost</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Date *</label>
                      <input
                        type="text"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="e.g. Sat 20 Jun 2026 - Sat 27 Jun 2026"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Time *</label>
                      <input
                        type="text"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        placeholder="e.g. 7:00 PM"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Cost *</label>
                      <input
                        type="text"
                        required
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="e.g. ₹299 onwards or Free"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Location *</label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Mindspace Social: Hyderabad"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Booking / RSVP URL</label>
                      <input
                        type="url"
                        value={bookingUrl}
                        onChange={(e) => setBookingUrl(e.target.value)}
                        placeholder="e.g. https://insider.in/events/..."
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Event Specifications (Metadata) */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-brand/5 space-y-4">
                  <h3 className="text-xs font-black text-brand/35 uppercase tracking-wider mb-2">Event Specifications (Metadata)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-brand mb-1.5">Duration</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 1 Hour"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-brand mb-1.5">Age Limit</label>
                      <input
                        type="text"
                        value={ageLimit}
                        onChange={(e) => setAgeLimit(e.target.value)}
                        placeholder="e.g. 21yrs +"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-brand mb-1.5">Language</label>
                      <input
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="e.g. English, Hindi"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-brand mb-1.5">Genre</label>
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="e.g. Bollywood, Comedy, Rock"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Media Uploads */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-brand/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-brand/35 uppercase tracking-wider">Media Gallery (Images & Videos)</h3>
                    <span className="text-[10px] font-bold text-brand/40 uppercase tracking-wider">{mediaList.length} item(s)</span>
                  </div>

                  {/* Upload Field */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand mb-1.5">Upload Local Media (Images / Videos)</label>
                      <div className="relative border-2 border-dashed border-gray-200 hover:border-brand/40 bg-white rounded-2xl h-32 transition-all flex flex-col items-center justify-center cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleMediaUpload}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-2" />
                            <span className="text-[10px] font-black text-brand/40 uppercase tracking-widest">Uploading files...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center p-4">
                            <Upload className="w-6 h-6 text-brand/30 mb-2" />
                            <p className="text-xs font-bold text-brand/60">Click or Drag Files here</p>
                            <p className="text-[10px] text-brand/35 font-medium mt-1">Supports Images & MP4 Videos</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Direct URL input */}
                    <div className="flex flex-col justify-end">
                      <label className="block text-xs font-bold text-brand mb-1.5">Or Add Direct URL</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={customMediaUrl}
                          onChange={(e) => setCustomMediaUrl(e.target.value)}
                          placeholder="e.g. /uploads/my-event.mp4 or HTTP link"
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                        />
                        <button
                          type="button"
                          onClick={addCustomMediaUrl}
                          className="bg-[#1B3022] hover:bg-[#1B3022]/90 text-white font-bold px-4 rounded-xl text-sm transition-all"
                        >
                          Add URL
                        </button>
                      </div>
                      <p className="text-[10px] text-brand/35 font-medium mt-2">
                        Type path manually and click Add URL if uploading from external sources.
                      </p>
                    </div>
                  </div>

                  {/* List of current media */}
                  {mediaList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-brand/5">
                      <p className="text-xs font-bold text-brand/50 mb-3 uppercase tracking-wider">Current Media Items (Drag/Order list)</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {mediaList.map((url, index) => {
                          const isVid = isVideo(url);
                          return (
                            <div key={index} className="relative group/item aspect-square rounded-xl overflow-hidden border border-brand/10 bg-black/5 flex items-center justify-center">
                              {isVid ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#1B3022] p-2 text-center text-white">
                                  <Video size={24} className="text-[#C5A059] mb-1" />
                                  <span className="text-[8px] font-bold tracking-tight text-[#C5A059] truncate w-full">{url.split('/').pop()}</span>
                                </div>
                              ) : (
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              )}
                              
                              {/* Index tag */}
                              <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                                {index + 1}
                              </div>

                              {/* Hover actions */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => removeMediaItem(index)}
                                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                                  title="Delete Item"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                                  title="Open Link"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Disclaimer */}
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-brand/5 space-y-4">
                  <h3 className="text-xs font-black text-brand/35 uppercase tracking-wider mb-2">Disclaimer</h3>
                  <div>
                    <label className="block text-xs font-bold text-brand mb-1.5">Event Disclaimer / Notes</label>
                    <textarea
                      rows={2}
                      value={disclaimer}
                      onChange={(e) => setDisclaimer(e.target.value)}
                      placeholder="e.g. *Please note: Tickets once purchased are non-refundable. Audio or video recording at the venue is prohibited."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-6 border-t border-brand/5 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-brand font-bold rounded-2xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex items-center bg-[#1B3022] hover:bg-[#1B3022]/90 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingEvent ? "Update Event" : "Create Event"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATIONS VIEW MODAL */}
      {isRegModalOpen && selectedRegEvent && (
        <div 
          className="fixed inset-0 z-50 bg-[#1B3022]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsRegModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-brand/5 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-brand/5 flex items-center justify-between bg-brand/5">
              <div>
                <span className="bg-[#1B3022]/10 text-[#1B3022] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                  Registrations
                </span>
                <h3 className="text-2xl font-playfair font-black text-brand mt-2">
                  {selectedRegEvent.title}
                </h3>
                <p className="text-xs text-brand/50 font-medium mt-1">
                  List of customers registered for this event.
                </p>
              </div>
              <button
                onClick={() => setIsRegModalOpen(false)}
                className="p-3 bg-white hover:bg-gray-100 rounded-full border border-brand/5 shadow-sm text-brand transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoadingRegs ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin mb-4" />
                  <p className="text-xs font-bold text-brand/40 uppercase tracking-widest">Loading registrations...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="w-16 h-16 text-[#C5A059]/30 mb-4 animate-pulse" />
                  <h4 className="text-lg font-bold text-brand font-playfair mb-1">No Registrations Yet</h4>
                  <p className="text-xs text-brand/60 max-w-xs">
                    Once users start registering for this event, their details will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-brand/5 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-brand/5 border-b border-brand/5 text-[9px] font-black text-brand/35 uppercase tracking-widest">
                        <th className="py-3.5 px-5">Name</th>
                        <th className="py-3.5 px-5">Contact Details</th>
                        <th className="py-3.5 px-5 text-center">Tickets</th>
                        <th className="py-3.5 px-5">Additional Notes</th>
                        <th className="py-3.5 px-5">Registered On</th>
                        <th className="py-3.5 px-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand/5">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-brand/[0.005] transition-colors text-sm text-brand">
                          <td className="py-4 px-5 font-bold">{reg.name}</td>
                          <td className="py-4 px-5">
                            <div className="space-y-0.5">
                              <p className="font-semibold">{reg.phone}</p>
                              <p className="text-xs text-brand/50 font-normal">{reg.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className="inline-block px-2.5 py-1 bg-brand/5 rounded-lg font-black text-xs">
                              {reg.ticketsCount}
                            </span>
                          </td>
                          <td className="py-4 px-5 max-w-[200px] truncate text-xs text-brand/70" title={reg.additionalNotes || ""}>
                            {reg.additionalNotes || <span className="text-brand/20 italic">None</span>}
                          </td>
                          <td className="py-4 px-5 text-xs text-brand/60">
                            {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }) : "-"}
                          </td>
                          <td className="py-4 px-5 text-center">
                            <a
                              href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#20BA56] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                            >
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-brand/5 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsRegModalOpen(false)}
                className="px-6 py-2.5 bg-[#1B3022] hover:bg-[#1B3022]/90 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
