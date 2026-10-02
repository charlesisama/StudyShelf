import {
    searchOpenLibrary,
    searchGoogleBooks,
} from "./api.js";

import {
    normalizeOpenLibraryBook,
    normalizeGoogleBook,
} from "./utils.js";

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

    // Open Library results
    if (openLibraryResult.status === "fulfilled") {
        const openLibraryBooks =
            openLibraryResult.value.docs || [];

        openLibraryBooks.forEach((book) => {
            books.push(normalizeOpenLibraryBook(book));
        });
    } else {
        console.warn(
            "Open Library search failed:",
            openLibraryResult.reason
        );
    }

    // Google Books results
    if (googleBooksResult.status === "fulfilled") {
        const googleBooks =
            googleBooksResult.value.items || [];

        googleBooks.forEach((book) => {
            books.push(normalizeGoogleBook(book));
        });
    } else {
        console.warn(
            "Google Books search failed:",
            googleBooksResult.reason
        );
    }

    // Only fail when BOTH APIs failed to return results.
    if (books.length === 0) {
        throw new Error(
            "Both book search services are currently unavailable."
        );
    }

    return books;
}