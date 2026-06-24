"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  Hourglass,
  Users,
  Languages,
  Theater,
  Navigation,
  Maximize2,
  X
} from "lucide-react";
import Link from "next/link";

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

const INDOOR_CATEGORIES = [
  {
    key: "meetups",
    label: "Meetups",
    description: "Connect, collaborate, and share ideas with like minded individuals. Every meetup sparks new conversations and lasting networks."
  },
  {
    key: "workshops",
    label: "Workshops",
    description: "Hands on learning sessions designed to inspire creativity and skill building. Practical knowledge meets real world application."
  },
  {
    key: "performances",
    label: "Performances",
    description: "Experience the energy of live acts that entertain, engage, and captivate audiences. Every performance leaves a lasting impression."
  },
  {
    key: "ramp-walks",
    label: "Ramp Walks",
    description: "Showcasing style, confidence, and creativity on the runway. A platform where fashion meets individuality."
  },
  {
    key: "fashion-expo",
    label: "Fashion Expo",
    description: "Discover trends, designs, and innovations from emerging and established creators. A celebration of fashion in its finest form."
  },
  {
    key: "screening",
    label: "Screening",
    description: "Curated film and media showcases that bring stories to life. Screenings designed to entertain, inform, and inspire."
  }
];

const OUTDOOR_CATEGORIES = [
  {
    key: "carnivals-fairs",
    label: "Carnivals & Fairs",
    description: "A vibrant mix of food, fun, and festivities under the open sky. Perfect for families, friends, and community bonding."
  },
  {
    key: "sports-fitness",
    label: "Sports & Fitness Events",
    description: "From marathons to yoga retreats, outdoor fitness brings energy and wellness together. Push limits while enjoying nature."
  },
  {
    key: "concerts-music",
    label: "Concerts & Music Festivals",
    description: "Live beats, open air, and electrifying vibes. Outdoor concerts create unforgettable nights of rhythm and connection."
  },
  {
    key: "cultural-gatherings",
    label: "Cultural Gatherings",
    description: "Celebrate traditions, art, and heritage in lively outdoor settings. A showcase of diversity and community spirit."
  },
  {
    key: "picnics-social",
    label: "Picnics & Social Outings",
    description: "Relax, unwind, and share moments in scenic outdoor spaces. Simple joys that turn into cherished memories."
  },
  {
    key: "adventure",
    label: "Adventure Activities",
    description: "Thrill seekers unite with trekking, camping, and outdoor challenges. Every adventure sparks excitement and discovery."
  }
];

function isVideo(url: string) {
  return url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes("/uploads/video_") || url.includes("video");
}

// Subcomponent for handling slideshow inside the card
function EventMediaSlideshow({ mediaList }: { mediaList: string[] }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mediaList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-brand/5 text-brand-accent/60 border border-brand/10 rounded-3xl">
        <Sparkles size={48} className="animate-pulse" />
      </div>
    );
  }

  const currentUrl = mediaList[slideIndex];
  const isVid = isVideo(currentUrl);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  return (
    <>
      <div 
        onClick={() => setIsLightboxOpen(true)}
        className="relative w-full h-full group bg-white overflow-hidden rounded-3xl border border-brand/10 shadow-lg cursor-pointer"
      >
        {isVid ? (
          <video 
            src={currentUrl} 
            preload="metadata"
            className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-103" 
          />
        ) : (
          <img 
            src={currentUrl} 
            alt="Event Slide" 
            className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-103" 
          />
        )}

        {/* Hover Zoom overlay button */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/70 backdrop-blur-md border border-brand/10 rounded-xl text-brand hover:bg-brand hover:text-white hover:scale-105 transition-all shadow-md opacity-0 group-hover:opacity-100 duration-300 flex items-center justify-center cursor-pointer"
          title="View Enlarged"
        >
          <Maximize2 size={14} className="font-bold" />
        </div>

        {/* Navigation arrows (only if multiple slides) */}
        {mediaList.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10 hover:bg-brand-accent hover:text-brand-dark opacity-0 group-hover:opacity-100 transition-all duration-300 animate-in fade-in"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10 hover:bg-brand-accent hover:text-brand-dark opacity-0 group-hover:opacity-100 transition-all duration-300 animate-in fade-in"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {mediaList.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10 bg-brand-dark/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-brand/5">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === slideIndex ? "bg-brand-accent w-3" : "bg-brand-light/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* LIGHT-THEMED LIGHTBOX MODAL */}
      {isLightboxOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[150] bg-[#FAF6F0]/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Panel Controls */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-brand z-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand/60">
              Media Gallery ({slideIndex + 1} / {mediaList.length})
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-3 bg-white hover:bg-brand/5 text-brand rounded-full border border-brand/10 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              title="Close Gallery"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Stage Media Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center pt-20 pb-20 px-4 sm:px-20"
            onClick={(e) => e.stopPropagation()}
          >
            {isVid ? (
              <video 
                src={currentUrl} 
                controls 
                autoPlay
                preload="metadata"
                className="w-full h-full object-contain" 
              />
            ) : (
              <img 
                src={currentUrl} 
                alt="Enlarged Slide" 
                className="w-full h-full object-contain" 
              />
            )}

            {/* Lightbox navigation arrows */}
            {mediaList.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute -left-4 sm:left-4 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-brand/5 text-brand rounded-full border border-brand/10 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title="Previous Media"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute -right-4 sm:right-4 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-brand/5 text-brand rounded-full border border-brand/10 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  title="Next Media"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom indicators */}
          {mediaList.length > 1 && (
            <div className="absolute bottom-8 flex items-center space-x-2.5 z-10 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-brand/10 shadow-sm">
              {mediaList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === slideIndex ? "bg-brand w-4" : "bg-brand/35"
                  }`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// Individual Event Card
function EventCard({ item, onRegisterClick }: { item: EventItem; onRegisterClick: (item: EventItem) => void }) {
  // Parse media
  let mediaList: string[] = [];
  try {
    if (item.imageUrl) {
      mediaList = JSON.parse(item.imageUrl);
      if (!Array.isArray(mediaList)) mediaList = [item.imageUrl];
    }
  } catch (e) {
    mediaList = item.imageUrl ? [item.imageUrl] : [];
  }

  return (
    <div className="flex flex-col bg-[#FAF6F0] border border-brand/10 rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-[0_25px_50px_-12px_rgba(6,78,59,0.2)] hover:-translate-y-2 hover:scale-[1.01] hover:border-brand/25 transition-all duration-500 ease-out mb-12 group">
      
      {/* Upper Main Body: Slide Show and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6">
        
        {/* Left Side: Slide Show (7 cols) */}
        <div className="lg:col-span-7 h-[280px] sm:h-[350px] md:h-[400px] lg:h-[430px]">
          <EventMediaSlideshow mediaList={mediaList} />
        </div>

        {/* Right Side: Metadata / Ticket details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
            
            {/* Header / Category Badge */}
            <div className="flex items-center justify-between">
              <span className="bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                {item.category.replace(/-/g, " ")}
              </span>
              <span className="text-[10px] font-bold text-brand/40 uppercase tracking-[0.15em] flex items-center">
                <Sparkles size={10} className="text-brand-accent mr-1" />
                Featured Event
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl sm:text-4xl font-playfair font-black text-brand leading-tight tracking-tight">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-brand-dark/70 text-sm leading-relaxed font-normal">
                {item.description}
              </p>
            )}

            {/* Mockup-style Details Card Container */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 text-brand-dark max-w-sm hover:-translate-y-1.5 hover:shadow-md hover:border-brand/20 transition-all duration-300">
              <div className="space-y-3">
                {/* Date */}
                <div className="flex items-center space-x-3.5 text-xs font-semibold text-gray-700">
                  <Calendar size={16} className="text-gray-500 shrink-0" />
                  <span>{item.date}</span>
                </div>

                {/* Time */}
                <div className="flex items-center space-x-3.5 text-xs font-semibold text-gray-700">
                  <Clock size={16} className="text-gray-500 shrink-0" />
                  <span>{item.time}</span>
                </div>

                {/* Duration */}
                {item.duration && (
                  <div className="flex items-center space-x-3.5 text-xs font-semibold text-gray-700">
                    <Hourglass size={16} className="text-gray-500 shrink-0" />
                    <span>{item.duration}</span>
                  </div>
                )}


                {/* Location */}
                <div className="flex items-start space-x-3.5 text-xs font-semibold text-gray-700">
                  <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
                  <span>{item.location}</span>
                </div>
              </div>

              {/* Separator line & Bottom action row */}
              <div className="border-t border-gray-200 pt-4 mt-2 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Available</span>
                </div>

                <button
                  onClick={() => onRegisterClick(item)}
                  className="flex items-center justify-center px-6 py-3 bg-[#064e3b] hover:bg-[#043d2e] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-[#064e3b]/20 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            </div>
          </div>

      </div>

      {/* Lower footer: Disclaimer text */}
      {item.disclaimer && (
        <div className="bg-brand/5 px-8 py-3 border-t border-brand/10 flex items-start space-x-2">
          <Info size={12} className="text-brand/30 mt-0.5 shrink-0" />
          <p className="text-[10px] font-medium text-brand/60 uppercase tracking-wider leading-relaxed">
            {item.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "indoor" | "outdoor">("all");

  const [currentUser, setCurrentUser] = useState<{ fullName: string | null; phoneNumber: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regTickets, setRegTickets] = useState(1);
  const [regNotes, setRegNotes] = useState("");
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.data);
        } else {
          setError("Failed to load events.");
        }
      } catch (err) {
        setError("Something went wrong while fetching events.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      } catch (e) {
        console.error("Fetch session error:", e);
      }
    };

    fetchEvents();
    fetchSession();
  }, []);

  // Autofill details when selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      setRegName(currentUser?.fullName || "");
      setRegPhone(currentUser?.phoneNumber || "");
      setRegEmail("");
      setRegTickets(1);
      setRegNotes("");
    }
  }, [selectedEvent, currentUser]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmittingReg(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          name: regName,
          email: regEmail,
          phone: regPhone,
          ticketsCount: regTickets,
          additionalNotes: regNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("✓ Registered! Opening WhatsApp...");
        
        // Formulate WhatsApp message to send to 9611526047
        const formattedMsg = `Hello Ashwaah! I have registered for the event:
*Event:* ${selectedEvent.title}
*Date:* ${selectedEvent.date}
*Time:* ${selectedEvent.time}
*Location:* ${selectedEvent.location}

*My Details:*
*Name:* ${regName}
*Phone:* ${regPhone}
*Email:* ${regEmail}
*Tickets:* ${regTickets}
${regNotes ? `*Notes:* ${regNotes}` : ""}`;

        const encodedMsg = encodeURIComponent(formattedMsg);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=919611526047&text=${encodedMsg}`;
        window.open(whatsappUrl, "_blank");

        setSelectedEvent(null);
      } else {
        showToast(data.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      console.error(err);
      showToast("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingReg(false);
    }
  };

  return (
    <div className="bg-brand-light text-brand-dark min-h-screen font-inter pb-24 selection:bg-brand-accent selection:text-white">
      
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden pt-12 pb-2 md:pt-16 md:pb-4 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,78,59,0.15),rgba(0,0,0,0))]">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/hero-grid.svg')] bg-center opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-2 rounded-full text-[10px] font-black uppercase text-brand tracking-[0.25em] shadow-sm animate-fade-in">
            <Sparkles size={12} className="animate-spin text-brand-accent" />
            <span>Exclusive Gatherings</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-playfair font-black text-brand tracking-tight leading-tight">
            <span className="text-brand-accent">Ashwaah</span> Events
          </h1>
          <p className="max-w-2xl mx-auto text-brand-dark/70 text-base md:text-lg font-medium leading-relaxed">
            Experience fashion runways, masterclass workshops, screening events, and vibrant outdoor gatherings designed to inspire network connection and creativity.
          </p>
        </div>
      </section>

      {/* TAB NAVIGATION */}
      <section className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-center p-1 bg-white border border-brand/10 rounded-2xl max-w-md mx-auto shadow-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
              activeTab === "all"
                ? "bg-brand text-white shadow-md"
                : "text-brand/60 hover:text-brand hover:bg-brand/5"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab("indoor")}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
              activeTab === "indoor"
                ? "bg-brand text-white shadow-md"
                : "text-brand/60 hover:text-brand hover:bg-brand/5"
            }`}
          >
            Indoor Events
          </button>
          <button
            onClick={() => setActiveTab("outdoor")}
            className={`flex-1 flex items-center justify-center py-2.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
              activeTab === "outdoor"
                ? "bg-brand text-white shadow-md"
                : "text-brand/60 hover:text-brand hover:bg-brand/5"
            }`}
          >
            Outdoor Events
          </button>
        </div>
      </section>

      {/* EVENTS CATALOG */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-accent animate-spin mb-4" />
            <p className="text-xs font-bold text-brand/40 uppercase tracking-[0.2em]">Assembling events gallery...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-brand/10 rounded-[2rem] text-center p-8 shadow-md">
            <AlertCircle className="w-12 h-12 text-brand-accent mb-4" />
            <h3 className="text-xl font-bold font-playfair mb-2">Error Loading Events</h3>
            <p className="text-brand-dark/70 text-sm max-w-md">{error}</p>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* If no events match the active tab view, render a premium general empty state */}
            {activeTab === "all" && events.length === 0 && (
              <div className="bg-white border border-brand/10 p-12 rounded-[2rem] text-center flex flex-col items-center justify-center shadow-lg py-20">
                <Calendar className="w-16 h-16 text-brand/35 mb-6" />
                <h3 className="text-xl font-bold font-playfair text-brand mb-2">No Scheduled Events</h3>
                <p className="text-brand-dark/70 text-sm max-w-md">
                  There are no company events or outdoor activities scheduled at this moment. Please check back later.
                </p>
              </div>
            )}

            {activeTab === "indoor" && events.filter(e => INDOOR_CATEGORIES.some(c => c.key === e.category)).length === 0 && (
              <div className="bg-white border border-brand/10 p-12 rounded-[2rem] text-center flex flex-col items-center justify-center shadow-lg py-20">
                <Calendar className="w-16 h-16 text-brand/35 mb-6" />
                <h3 className="text-xl font-bold font-playfair text-brand mb-2">No Scheduled Indoor Events</h3>
                <p className="text-brand-dark/70 text-sm max-w-md">
                  There are no indoor events or workshops scheduled at this moment. Please check back later or browse Outdoor Events.
                </p>
              </div>
            )}

            {activeTab === "outdoor" && events.filter(e => OUTDOOR_CATEGORIES.some(c => c.key === e.category)).length === 0 && (
              <div className="bg-white border border-brand/10 p-12 rounded-[2rem] text-center flex flex-col items-center justify-center shadow-lg py-20">
                <Calendar className="w-16 h-16 text-brand/35 mb-6" />
                <h3 className="text-xl font-bold font-playfair text-brand mb-2">No Scheduled Outdoor Events</h3>
                <p className="text-brand-dark/70 text-sm max-w-md">
                  There are no outdoor festivals or adventure activities scheduled at this moment. Please check back later or browse Indoor Events.
                </p>
              </div>
            )}
            
            {/* RENDER INDOOR CATEGORIES */}
            {(activeTab === "all" || activeTab === "indoor") && INDOOR_CATEGORIES.map((cat) => {
              const catEvents = events.filter((e) => e.category === cat.key);
              
              if (catEvents.length === 0) return null;
              
              return (
                <div key={cat.key} className="space-y-6">
                  {/* Category Header */}
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-playfair font-black text-brand tracking-tight">
                      {cat.label}
                    </h2>
                    {cat.description && (
                      <p className="text-brand-dark/60 text-lg md:text-xl font-medium max-w-none leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Render events */}
                  <div className="grid grid-cols-1 gap-8">
                    {catEvents.map((item) => (
                      <EventCard key={item.id} item={item} onRegisterClick={setSelectedEvent} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* RENDER OUTDOOR CATEGORIES */}
            {(activeTab === "all" || activeTab === "outdoor") && OUTDOOR_CATEGORIES.map((cat) => {
              const catEvents = events.filter((e) => e.category === cat.key);
              
              if (catEvents.length === 0) return null;
              
              return (
                <div key={cat.key} className="space-y-6">
                  {/* Category Header */}
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-playfair font-black text-brand tracking-tight">
                      {cat.label}
                    </h2>
                    {cat.description && (
                      <p className="text-brand-dark/60 text-lg md:text-xl font-medium max-w-none leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* Render events */}
                  <div className="grid grid-cols-1 gap-8">
                    {catEvents.map((item) => (
                      <EventCard key={item.id} item={item} onRegisterClick={setSelectedEvent} />
                    ))}
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </section>

      {/* REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="bg-[#FAF6F0] border border-brand/10 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-brand-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 bg-white/60 hover:bg-white text-brand rounded-full border border-brand/5 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full">
                {selectedEvent.category.replace(/-/g, " ")}
              </span>
              <h3 className="text-2xl font-playfair font-black text-brand leading-tight mt-3">
                Register for {selectedEvent.title}
              </h3>
              <p className="text-xs text-brand-dark/60 mt-1">
                Fill in your details below to register for this event.
              </p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand/60 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand/10 rounded-2xl text-sm focus:outline-none focus:border-brand text-brand font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand/60 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-brand/10 rounded-2xl text-sm focus:outline-none focus:border-brand text-brand font-medium"
                    placeholder="9611526047"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-brand/60 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-brand/10 rounded-2xl text-sm focus:outline-none focus:border-brand text-brand font-medium"
                    placeholder="johndoe@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand/60 mb-1.5">
                  Number of Tickets / Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={regTickets}
                  onChange={(e) => setRegTickets(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-brand/10 rounded-2xl text-sm focus:outline-none focus:border-brand text-brand font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-brand/60 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand/10 rounded-2xl text-sm focus:outline-none focus:border-brand text-brand font-medium h-20 resize-none"
                  placeholder="Any comments, dietary needs, or preferences..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-3 border border-brand/10 text-brand/60 hover:bg-brand/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="px-6 py-3 bg-[#EE4B5E] hover:bg-[#D43F4F] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md shadow-[#EE4B5E]/20"
                >
                  {isSubmittingReg ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    "Confirm & Share on WhatsApp"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] bg-brand text-white border border-brand-accent/25 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3.5 animate-in fade-in slide-in-from-bottom-5 duration-350">
          <Sparkles size={16} className="text-brand-accent animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{toast}</span>
        </div>
      )}

    </div>
  );
}
