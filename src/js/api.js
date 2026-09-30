const OPEN_LIBRARY_URL = "https://openlibrary.org/search.json";
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

const OPEN_LIBRARY_FIELDS = [
    "key",
    "title",
    "author_name",
    "first_publish_year",
    "cover_i",
    "edition_count",
    "subject",
    "isbn",
    "publisher",
    "language",
    "format",
].join(",");

//Fetch JSON data from a URL
async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

//Search Open Library.
export async function searchOpenLibrary(query, searchType = "title") {
    const params = new URLSearchParams();

    params.set("limit", "12");
    params.set("fields", OPEN_LIBRARY_FIELDS);

    if (searchType === "isbn") {
        params.set("q", `isbn:${query}`);
    } else {
        params.set(searchType, query);
    }

    const url = `${OPEN_LIBRARY_URL}?${params.toString()}`;

    return fetchJson(url);
}

//Search Google Books
export async function searchGoogleBooks(query, searchType = "title") {
    const params = new URLSearchParams();

    params.set("maxResults", "12");
    params.set("printType", "books");

    let googleQuery = query;

    if (searchType === "title") {
        googleQuery = `intitle:${query}`;
    }

    if (searchType === "author") {
        googleQuery = `inauthor:${query}`;
    }

    if (searchType === "subject") {
        googleQuery = `subject:${query}`;
    }

    if (searchType === "isbn") {
        googleQuery = `isbn:${query}`;
    }

    params.set("q", googleQuery);

    const url = `${GOOGLE_BOOKS_URL}?${params.toString()}`;

    return fetchJson(url);
}
