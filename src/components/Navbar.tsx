"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, X } from "lucide-react";
import { requests, BASE_URL, API_KEY, IMAGE_BASE_URL } from "@/constants/tmdb";
import { Movie } from "@/types/movie";

// Add a helper component for the countdown
const CountdownTimer = ({ releaseDate }: { releaseDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(releaseDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60)
                });
            } else {
                setTimeLeft(null); // Movie has released
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [releaseDate]);

    if (!timeLeft) return <span className="text-[#00ADFF] text-xs font-semibold mt-0.5">Available Now</span>;

    // Glowing Neon Cyan Style
    return (
        <span className="text-[#00ffff] font-mono text-[11px] md:text-xs font-bold mt-1 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] tracking-wider">
            {timeLeft.days}d : {timeLeft.hours.toString().padStart(2, '0')}h : {timeLeft.minutes.toString().padStart(2, '0')}m
        </span>
    );
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLElement | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "TV Shows", path: "/tv-shows" },
        { name: "Movies", path: "/movies" },
        { name: "New & Popular", path: "/new-popular" },
        { name: "My List", path: "/my-list" },
    ];

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const response = await fetch(`${BASE_URL}${requests.fetchUpcomingMovies}`);
                const data = await response.json();

                if (data.results) {
                    // Filter movies that are genuinely upcoming in the future
                    const futureMovies = data.results.filter((movie: Movie) => {
                        return movie.release_date && new Date(movie.release_date) > new Date();
                    });

                    // Sort by release date closest to today
                    futureMovies.sort((a: Movie, b: Movie) => {
                        return new Date(a.release_date!).getTime() - new Date(b.release_date!).getTime();
                    });

                    setUpcomingMovies(futureMovies.slice(0, 3)); // Keep top 3 for notification dropdown
                }
            } catch (error) {
                console.error("Failed to fetch upcoming movies:", error);
            }
        };
        fetchUpcoming();
    }, []);

    // Check if any movie is releasing tomorrow to show the red badge
    const hasReleasingTomorrow = upcomingMovies.some(movie => {
        const diff = +new Date(movie.release_date!) - +new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 || days === 1; // less than 48 hours technically
    });

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const updateNavbarHeight = () => {
            const height = headerRef.current?.offsetHeight;
            if (!height) return;
            document.documentElement.style.setProperty("--navbar-height", `${height}px`);
        };

        updateNavbarHeight();
        window.addEventListener("resize", updateNavbarHeight, { passive: true });

        return () => {
            window.removeEventListener("resize", updateNavbarHeight);
        };
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim() && isSearchExpanded) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, isSearchExpanded, router]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const toggleSearch = () => {
        if (!isSearchExpanded) {
            setIsSearchExpanded(true);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const clearAndCloseSearch = () => {
        setSearchQuery("");
        setIsSearchExpanded(false);
    };

    return (
        <header
            ref={headerRef}
            className={`sticky top-0 w-full z-50 transition-all duration-500 ease-in-out flex items-center p-4 md:px-12 md:py-6 ${isScrolled ? "bg-black/60 backdrop-blur-md shadow-lg shadow-black/20" : "bg-black/60 backdrop-blur-md"
                }`}
        >
            <div className="flex items-center space-x-2 md:space-x-10 flex-grow">
                <Link href="/">
                    <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-[#00ADFF] tracking-tighter cursor-pointer drop-shadow-md pb-1">KYI MAL</h1>
                </Link>

                {/* Desktop Links */}
                <ul className="hidden md:flex space-x-6 text-sm font-light text-[#e5e5e5]">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        return (
                            <li
                                key={link.name}
                                className={`cursor-pointer transition hover:text-gray-300 ${isActive ? "text-[#00ADFF] font-semibold" : ""
                                    }`}
                            >
                                <Link href={link.path}>{link.name}</Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6 text-white text-sm font-light h-10">
                <div
                    className={`flex items-center h-full rounded-md
                        ${isSearchExpanded
                            ? 'bg-black/80 border border-[#00ADFF] shadow-[0_0_15px_rgba(0,173,255,0.3)] px-3 w-[260px] md:w-[320px] transition-all duration-500 ease-out'
                            : 'bg-transparent border-transparent px-0 w-6 transition-all duration-300 ease-in'
                        }
                    `}
                >
                    <Search
                        className={`w-5 h-5 md:w-6 md:h-6 cursor-pointer shrink-0 transition-colors ${isSearchExpanded ? 'text-[#00ADFF]' : 'text-white hover:text-[#00ADFF]'
                            }`}
                        onClick={toggleSearch}
                    />

                    <form
                        onSubmit={handleSearchSubmit}
                        className={`flex items-center transition-all duration-500 overflow-hidden h-full ${isSearchExpanded ? 'w-full opacity-100 ml-2' : 'w-0 opacity-0 ml-0'
                            }`}
                    >
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Titles, people, genres"
                            className="bg-transparent text-white w-full outline-none placeholder:text-gray-400 text-sm h-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => {
                                if (!searchQuery) setIsSearchExpanded(false);
                            }}
                        />
                        {searchQuery && isSearchExpanded && (
                            <X
                                className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white shrink-0 ml-1"
                                onClick={clearAndCloseSearch}
                            />
                        )}
                        {!searchQuery && isSearchExpanded && (
                            <X
                                className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white shrink-0 ml-1"
                                onClick={() => setIsSearchExpanded(false)}
                            />
                        )}
                    </form>
                </div>

                <Link href="/kids" className="hidden md:flex items-center space-x-2 cursor-pointer group">
                    <img
                        src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Kids&backgroundColor=ffdfbf"
                        alt="Kids"
                        className="w-7 h-7 md:w-8 md:h-8 rounded-md object-contain border-2 border-transparent group-hover:border-orange-400 transition-all shadow-sm"
                    />
                    <span className="text-orange-400 font-extrabold text-sm md:text-base tracking-wide font-[Comic_Sans_MS,cursive,sans-serif] group-hover:text-orange-300 transition-colors drop-shadow-sm">
                        Kids
                    </span>
                </Link>
                {/* Notification Bell */}
                <div className="relative group flex items-center">
                    <div className="relative cursor-pointer py-2">
                        <Bell className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-gray-300 transition" />
                        {/* Red Dot Badge - Only show if there's a movie releasing soon or recently added */}
                        {hasReleasingTomorrow && (
                            <span className="absolute top-1 right-0 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border-2 border-[#141414]"></span>
                            </span>
                        )}
                    </div>

                    {/* Notification Dropdown */}
                    <div className="hidden group-hover:block absolute top-full right-[-50px] md:right-0 mt-2 w-72 md:w-80 bg-black/95 border border-zinc-800 rounded-md shadow-2xl overflow-hidden z-[100]">
                        <div className="p-3 border-b border-zinc-800">
                            <h3 className="text-white font-semibold text-sm">Notifications</h3>
                        </div>
                        <div className="flex flex-col max-h-[60vh] overflow-y-auto scrollbar-hide py-1">
                            {upcomingMovies.length > 0 ? (
                                upcomingMovies.map((movie) => {
                                    const diff = +new Date(movie.release_date!) - +new Date();
                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                    const isTomorrow = days === 0 || days === 1;

                                    return (
                                        <div key={movie.id} className="flex gap-3 p-3 border-b border-zinc-800/50 hover:bg-zinc-900 transition cursor-pointer">
                                            <img
                                                src={movie.backdrop_path || movie.poster_path ? `${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}` : 'https://via.placeholder.com/200'}
                                                alt={movie.title}
                                                className="w-20 h-12 object-cover rounded border border-zinc-700"
                                            />
                                            <div className="flex flex-col justify-center">
                                                <span className="text-gray-200 text-sm font-medium">
                                                    {isTomorrow ? "Coming Tomorrow" : "Upcoming Movie"}
                                                </span>
                                                <span className="text-[#00ADFF] text-xs font-semibold mt-0.5">{movie.title}</span>
                                                <CountdownTimer releaseDate={movie.release_date!} />
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    No new notifications
                                </div>
                            )}

                            {/* Standard Notification Log */}
                            <div className="flex gap-3 p-3 border-t border-zinc-800/50 hover:bg-zinc-900 transition cursor-pointer">
                                <img
                                    src="https://image.tmdb.org/t/p/w200/kZ1hQkK46XvP3oUuG9iM0RzF8fR.jpg"
                                    alt="Frieren"
                                    className="w-20 h-12 object-cover rounded border border-zinc-700 mx-auto"
                                />
                                <div className="flex flex-col justify-center w-full">
                                    <span className="text-gray-200 text-sm font-medium">Continue watching</span>
                                    <span className="text-gray-400 text-xs font-semibold mt-0.5">Frieren: Beyond Journey's End</span>
                                    <span className="text-gray-600 text-[10px] mt-1">Yesterday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
