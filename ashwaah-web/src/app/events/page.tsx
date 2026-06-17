"use client";

import { useState, useEffect } from "react";
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
  ArrowRight
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
    <div className="relative w-full h-full group bg-brand-light/20 overflow-hidden rounded-3xl border border-brand/10 shadow-lg">
      {isVid ? (
        <video 
          src={currentUrl} 
          controls 
          preload="metadata"
          className="w-full h-full object-cover" 
        />
      ) : (
        <img 
          src={currentUrl} 
          alt="Event Slide" 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
        />
      )}

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
  );
}

// Individual Event Card
function EventCard({ item }: { item: EventItem }) {
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
    <div className="flex flex-col bg-white border border-brand/10 rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 hover:border-brand-accent/30 hover:shadow-brand-accent/5 mb-10 group">
      
      {/* Upper Main Body: Slide Show and Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
        
        {/* Left Side: Slide Show (5 cols) */}
        <div className="lg:col-span-5 h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
          <EventMediaSlideshow mediaList={mediaList} />
        </div>

        {/* Right Side: Metadata / Ticket details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
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

            {/* Grid details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-brand/10">
              
              {/* Date */}
              <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Date</span>
                <span className="text-xs font-bold text-brand-dark">{item.date}</span>
              </div>

              {/* Time */}
              <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Time</span>
                <span className="text-xs font-bold text-brand-dark">{item.time}</span>
              </div>

              {/* Location */}
              <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
                <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Location</span>
                <span className="text-xs font-bold text-brand-accent flex items-center line-clamp-2">
                  <MapPin size={10} className="mr-1 inline-shrink-0" />
                  {item.location}
                </span>
              </div>

              {/* Optional Fields */}
              {item.duration && (
                <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Duration</span>
                  <span className="text-xs font-bold text-brand-dark">{item.duration}</span>
                </div>
              )}

              {item.ageLimit && (
                <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Age Limit</span>
                  <span className="text-xs font-bold text-brand-dark">{item.ageLimit}</span>
                </div>
              )}

              {item.language && (
                <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Language</span>
                  <span className="text-xs font-bold text-brand-dark line-clamp-1">{item.language}</span>
                </div>
              )}

              {item.genre && (
                <div className="bg-brand-light/50 border border-brand/5 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
                  <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Genre</span>
                  <span className="text-xs font-bold text-brand-dark line-clamp-1">{item.genre}</span>
                </div>
              )}

            </div>
          </div>

          {/* Pricing & Booking Button Row */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pt-6 mt-4 border-t border-brand/10">
            <div className="text-center sm:text-left">
              <span className="text-[9px] font-black text-brand/50 uppercase tracking-widest block mb-1">Price</span>
              <span className="text-2xl font-black text-brand tracking-tight">{item.cost}</span>
            </div>
            
            {item.bookingUrl ? (
              <a
                href={item.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-brand text-white font-bold uppercase text-xs tracking-widest rounded-2xl hover:bg-brand-hover transition-all duration-300 shadow-md hover:shadow-brand-hover/10 hover:-translate-y-0.5 active:translate-y-0 border border-transparent hover:border-brand-accent"
              >
                Book Now
                <ExternalLink size={12} className="ml-2" />
              </a>
            ) : (
              <div className="w-full sm:w-auto text-center px-8 py-4 bg-brand-light/70 text-brand/50 font-bold uppercase text-xs tracking-widest rounded-2xl border border-brand/5">
                Walk-In Entry
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lower footer: Disclaimer text */}
      {item.disclaimer && (
        <div className="bg-brand/5 px-8 py-3 border-t border-brand/10 flex items-start space-x-2">
          <Info size={12} className="text-brand/30 mt-0.5" />
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
  const [activeTab, setActiveTab] = useState<"indoor" | "outdoor">("indoor");

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
    fetchEvents();
  }, []);

  return (
    <div className="bg-brand-light text-brand-dark min-h-screen font-inter pb-24 selection:bg-brand-accent selection:text-white">
      
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden py-24 md:py-32 border-b border-brand/10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,78,59,0.15),rgba(0,0,0,0))]">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/hero-grid.svg')] bg-center opacity-5 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-4 py-2 rounded-full text-[10px] font-black uppercase text-brand tracking-[0.25em] shadow-sm animate-fade-in">
            <Sparkles size={12} className="animate-spin text-brand-accent" />
            <span>Exclusive Gatherings</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-playfair font-black text-brand tracking-tight leading-tight">
            Curated <span className="text-brand-accent">Ashwaah</span> Events
          </h1>
          <p className="max-w-2xl mx-auto text-brand-dark/70 text-base md:text-lg font-medium leading-relaxed">
            Experience fashion runways, masterclass workshops, screening events, and vibrant outdoor gatherings designed to inspire network connection and creativity.
          </p>
        </div>
      </section>

      {/* TAB NAVIGATION */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-center p-1.5 bg-white border border-brand/10 rounded-3xl max-w-md mx-auto shadow-md">
          <button
            onClick={() => setActiveTab("indoor")}
            className={`flex-1 flex items-center justify-center py-4 px-6 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${
              activeTab === "indoor"
                ? "bg-brand text-white shadow-lg"
                : "text-brand/60 hover:text-brand hover:bg-brand/5"
            }`}
          >
            Event Types
          </button>
          <button
            onClick={() => setActiveTab("outdoor")}
            className={`flex-1 flex items-center justify-center py-4 px-6 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${
              activeTab === "outdoor"
                ? "bg-brand text-white shadow-lg"
                : "text-brand/60 hover:text-brand hover:bg-brand/5"
            }`}
          >
            Outdoor Events
          </button>
        </div>
      </section>

      {/* EVENTS CATALOG */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
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
            
            {/* RENDER INDOOR TAB */}
            {activeTab === "indoor" && INDOOR_CATEGORIES.map((cat) => {
              const catEvents = events.filter((e) => e.category === cat.key);
              
              return (
                <div key={cat.key} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl md:text-3xl font-playfair font-black text-brand tracking-tight">
                      {cat.label}
                    </h2>
                    <div className="flex-grow h-[1px] bg-gradient-to-r from-brand/30 to-transparent" />
                  </div>

                  {/* Render events or fallback card */}
                  {catEvents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8">
                      {catEvents.map((item) => (
                        <EventCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    /* Fallback empty box containing the description precisely as requested */
                    <div className="bg-white border border-brand/10 p-8 md:p-12 rounded-[2rem] text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/5 to-transparent rounded-bl-full pointer-events-none" />
                      
                      <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-6">
                        <Calendar size={20} />
                      </div>
                      
                      <h4 className="text-base font-bold font-playfair text-brand uppercase tracking-wide mb-3">
                        About {cat.label}
                      </h4>
                      <p className="text-brand-dark/70 text-sm max-w-xl leading-relaxed italic">
                        "{cat.description}"
                      </p>
                      
                      <div className="mt-6 text-[9px] font-black text-brand-accent/60 uppercase tracking-[0.2em] flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/60 mr-2 animate-pulse" />
                        No events currently scheduled
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* RENDER OUTDOOR TAB */}
            {activeTab === "outdoor" && OUTDOOR_CATEGORIES.map((cat) => {
              const catEvents = events.filter((e) => e.category === cat.key);
              
              return (
                <div key={cat.key} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl md:text-3xl font-playfair font-black text-brand tracking-tight">
                      {cat.label}
                    </h2>
                    <div className="flex-grow h-[1px] bg-gradient-to-r from-brand/30 to-transparent" />
                  </div>

                  {/* Render events or fallback card */}
                  {catEvents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8">
                      {catEvents.map((item) => (
                        <EventCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    /* Fallback empty box containing the description precisely as requested */
                    <div className="bg-white border border-brand/10 p-8 md:p-12 rounded-[2rem] text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/5 to-transparent rounded-bl-full pointer-events-none" />
                      
                      <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-6">
                        <Calendar size={20} />
                      </div>
                      
                      <h4 className="text-base font-bold font-playfair text-brand uppercase tracking-wide mb-3">
                        About {cat.label}
                      </h4>
                      <p className="text-brand-dark/70 text-sm max-w-xl leading-relaxed italic">
                        "{cat.description}"
                      </p>
                      
                      <div className="mt-6 text-[9px] font-black text-brand-accent/60 uppercase tracking-[0.2em] flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/60 mr-2 animate-pulse" />
                        No events currently scheduled
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </section>

    </div>
  );
}
