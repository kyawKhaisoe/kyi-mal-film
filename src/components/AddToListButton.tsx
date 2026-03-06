"use client";

import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Movie } from "@/types/movie";

interface AddToListButtonProps {
    movie: Movie;
}

export default function AddToListButton({ movie }: AddToListButtonProps) {
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("favorites")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("movie_id", movie.id)
                    .single();

                if (data) {
                    setIsAdded(true);
                }
            } catch (error) {
                console.error("Error checking favorite status:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkFavoriteStatus();
    }, [movie.id]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the modal from closing or opening if it's placed over a clickable area

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please log in to add movies to your list.");
                return;
            }

            if (isAdded) {
                // Remove from favorites
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("movie_id", movie.id);

                if (error) throw error;
                setIsAdded(false);
            } else {
                // Add to favorites
                const { error } = await supabase
                    .from("favorites")
                    .insert({
                        user_id: user.id,
                        movie_id: movie.id,
                        title: movie.title || movie.name || movie.original_name,
                        poster_path: movie.backdrop_path || movie.poster_path, // use whatever exists
                    });

                if (error) throw error;
                setIsAdded(true);
            }
        } catch (error: any) {
            console.error("Error toggling favorite. Raw error:", error);
            console.error("Stringified error:", JSON.stringify(error, null, 2));
            if (error?.message) console.error("Error message:", error.message);
            if (error?.details) console.error("Error details:", error.details);
            if (error?.hint) console.error("Error hint:", error.hint);
            if (error?.code) console.error("Error code:", error.code);

            console.error("Data that was being sent:", {
                movie_id: movie.id,
                title: movie.title || movie.name || movie.original_name,
                poster_path: movie.backdrop_path || movie.poster_path
            });

            alert(`An error occurred while updating your list: ${error?.message || 'Unknown error'}`);
        }
    };

    if (isLoading) {
        return (
            <button className="flex items-center justify-center border-2 border-gray-400 bg-[#2a2a2a]/60 text-white w-10 h-10 md:w-12 md:h-12 rounded-full cursor-not-allowed">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleFavorite}
            className={`flex items-center justify-center border-2 bg-[#2a2a2a]/60 text-white w-10 h-10 md:w-12 md:h-12 rounded-full transition group ${isAdded
                ? 'border-[#00ADFF] bg-[#00ADFF]/20 hover:bg-[#00ADFF]/30'
                : 'border-gray-400 hover:border-[#00ADFF] hover:bg-[#00ADFF]/20'
                }`}
        >
            {isAdded ? (
                <Check size={24} className="text-[#00ADFF] group-hover:scale-110 transition-transform" />
            ) : (
                <Plus size={24} className="group-hover:text-[#00ADFF] group-hover:scale-110 transition-transform" />
            )}
        </button>
    );
}
