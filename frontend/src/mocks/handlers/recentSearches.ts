import { http, HttpResponse, delay } from 'msw';
import { recentSearchesDb } from '../data/recentSearches';
import type { RecentSearch } from '../../types/api';

const colors = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-purple-500 to-purple-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-indigo-500 to-indigo-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
];

export const recentSearchHandlers = [
  // Get recent searches
  http.get('/api/recent-searches', async () => {
    await delay(300);
    return HttpResponse.json(recentSearchesDb);
  }),

  // Add recent search
  http.post('/api/recent-searches', async ({ request }) => {
    await delay(300);
    const searchData = await request.json() as { name: string; vat: string };
    
    // Check if this search already exists
    const existingIndex = recentSearchesDb.findIndex(
      search => search.vat === searchData.vat
    );
    
    if (existingIndex !== -1) {
      // Move existing search to the top
      const existingSearch = recentSearchesDb.splice(existingIndex, 1)[0];
      existingSearch.time = 'À l\'instant';
      recentSearchesDb.unshift(existingSearch);
    } else {
      // Add new search
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        name: searchData.name,
        vat: searchData.vat,
        time: 'À l\'instant',
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      
      recentSearchesDb.unshift(newSearch);
      
      // Keep only the last 10 searches
      if (recentSearchesDb.length > 10) {
        recentSearchesDb.pop();
      }
    }
    
    // Update times for other searches
    recentSearchesDb.forEach((search, index) => {
      if (index === 0) return;
      if (index === 1) search.time = 'Il y a 1 minute';
      else if (index === 2) search.time = 'Il y a 5 minutes';
      else if (index === 3) search.time = 'Il y a 1 heure';
      else if (index === 4) search.time = 'Il y a 2 heures';
      else search.time = `Il y a ${index} heures`;
    });
    
    return HttpResponse.json({ message: 'Search recorded successfully' }, { status: 201 });
  }),

  // Clear recent searches
  http.delete('/api/recent-searches', async () => {
    await delay(300);
    recentSearchesDb.length = 0;
    return HttpResponse.json({ message: 'Recent searches cleared successfully' });
  }),
];