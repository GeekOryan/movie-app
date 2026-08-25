import { Client, Databases, ID, Query } from 'appwrite';

// Hardcoded IDs (Verified from your logs)
const PROJECT_ID = '6a8c4647003a11fa9d9b';
const DATABASE_ID = '6a8c48cd000035d93b37';
const TABLE_ID = 'metrics'; // This is your Table ID

console.log('Appwrite Init:', { PROJECT_ID, DATABASE_ID, TABLE_ID });

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    console.log('updateSearchCount called with:', searchTerm, movie);
    try {
        const normalizedTerm = searchTerm.toLowerCase();
        // 1. Check if this search term already exists
        const result = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.equal('searchTerm', searchTerm)
        ]);

        console.log('listDocuments result:', result);

        if (result.documents && result.documents.length > 0) {
            const doc = result.documents[0];
            console.log('Updating existing doc:', doc.$id);
            await databases.updateDocument(DATABASE_ID, TABLE_ID, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            console.log('Creating new document');
            await databases.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
                searchTerm: normalizedTerm, // Save the lowercase version
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
        console.log('updateSearchCount SUCCESS');
    } catch (error) {
        console.error("Appwrite updateSearchCount Error:", error);
        // Use console.error instead of alert - alerts can be blocked in async contexts
    }
};

export const getTrendingMovies = async () => {
    console.log('getTrendingMovies called');
    try {
        const result = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);
        console.log('getTrendingMovies result:', result);
        return result.documents || [];
    } catch (error) {
        console.error("Appwrite getTrendingMovies Error:", error);
        return [];
    }
};