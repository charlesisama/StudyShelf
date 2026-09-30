import {
    searchOpenLibrary,
    searchGoogleBooks,
} from "./api.js";

import {
    normalizeOpenLibraryBook,
    normalizeGoogleBook,
} from "./utils.js";

//Search both book APIs
export async function searchBooks(query, searchType) {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
        return [];
    }

    const results = await Promise.allSettled([
        searchOpenLibrary(cleanQuery, searchType),
        searchGoogleBooks(cleanQuery, searchType),
    ]);

    const books = [];

    const openLibraryResult = results[0];
    const googleBooksResult = results[1];


    // Process Open Library results.
    if (openLibraryResult.status === "fulfilled") {
        const openLibraryBooks = openLibraryResult.value.docs || [];

        openLibraryBooks.forEach((book) => {
            books.push(normalizeOpenLibraryBook(book));
        });
    }


    // Process Google Books results.
    if (googleBooksResult.status === "fulfilled") {
        const googleBooks = googleBooksResult.value.items || [];

        googleBooks.forEach((book) => {
            books.push(normalizeGoogleBook(book));
        });
    }


    if (books.length === 0) {
        throw new Error("No books were found.");
    }

    return books;
}