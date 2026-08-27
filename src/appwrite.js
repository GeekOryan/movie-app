import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    console.log('updateSearchCount called with:', searchTerm, movie);
    try {
        // 1. Checking if this search term already exists
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
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
        console.log('updateSearchCount SUCCESS');
    } catch (error) {
        console.error("Appwrite updateSearchCount Error:", error);
    }
};

export const getTrendingMovies = async () => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ]);
        return result.documents || [];
    } catch (error) {
        console.error("Appwrite getTrendingMovies Error:", error);
        return [];
    }
};