import { BASE_URL } from '@/constants/tmdb';

export async function fetchFromTMDB(endpoint: string) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from TMDB: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}
