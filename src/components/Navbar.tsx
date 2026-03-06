"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, X } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLElement | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "TV Shows", path: "/tv-shows" },
        { name: "Movies", path: "/movies" },
        { name: "New & Popular", path: "/new-popular" },
        ...(user ? [{ name: "My List", path: "/my-list" }] : []),
    ];

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
    }, [user]);

    // Listen to Supabase Auth State
    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out flex items-center p-4 md:px-12 md:py-6 ${isScrolled ? "bg-black/70 backdrop-blur-md shadow-lg shadow-black/20" : "bg-transparent"
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

                <p className="hidden md:inline cursor-pointer hover:text-gray-300">Kids</p>
                <Bell className="w-5 h-5 md:w-6 md:h-6 cursor-pointer" />
                {user ? (
                    <div className="relative group flex items-center">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                            alt="User Profile"
                            className="w-8 h-8 rounded cursor-pointer object-contain"
                        />
                        <div className="hidden group-hover:flex absolute top-full right-0 mt-2 bg-black/90 border border-zinc-800 rounded flex-col items-start min-w-[150px] shadow-lg shadow-black p-2">
                            <span className="text-xs text-gray-400 px-3 py-2 w-full truncate border-b border-zinc-700/50 mb-1">{user.email}</span>
                            <button
                                onClick={handleSignOut}
                                className="w-full text-left text-sm text-white px-3 py-2 hover:bg-zinc-800 hover:text-[#00ADFF] rounded transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link href="/login" className="bg-[#00ADFF] hover:bg-[#008FCC] text-white px-4 py-1.5 rounded text-sm transition-colors cursor-pointer block">
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Navbar;
