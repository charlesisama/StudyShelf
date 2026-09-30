//Create a safe array from a possible API value
function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (value) {
        return [value];
    }

    return [];
}

//Normalize an Open Library book.
export function normalizeOpenLibraryBook(book) {
    return {
        id: `open_library:${book.key || crypto.randomUUID()}`,
        source: "open_library",

        title: book.title || "Unknown title",

        authors: toArray(book.author_name),

        description: "",

        cover_url: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "",

        publish_year: book.first_publish_year || null,

        publisher: toArray(book.publisher)[0] || "",

        subjects: toArray(book.subject).slice(0, 10),

        language: toArray(book.language),

        format: toArray(book.format),

        identifiers: {
            isbn: toArray(book.isbn).slice(0, 10),
        },

        external_link: book.key
            ? `https://openlibrary.org${book.key}`
            : "",

        edition_count: book.edition_count || 0,
    };
}

//Normalize a Google Books volume.
export function normalizeGoogleBook(book) {
    const info = book.volumeInfo || {};

    const identifiers = {};

    if (Array.isArray(info.industryIdentifiers)) {
        info.industryIdentifiers.forEach((identifier) => {
            identifiers[identifier.type.toLowerCase()] = identifier.identifier;
        });
    }

    return {
        id: `google_books:${book.id || crypto.randomUUID()}`,
        source: "google_books",

        title: info.title || "Unknown title",

        authors: toArray(info.authors),

        description: info.description || "",

        cover_url:
            info.imageLinks?.thumbnail ||
            info.imageLinks?.smallThumbnail ||
            "",

        publish_year: info.publishedDate
            ? Number.parseInt(info.publishedDate, 10) || null
            : null,

        publisher: info.publisher || "",

        subjects: toArray(info.categories),

        language: info.language ? [info.language] : [],

        format: info.printType ? [info.printType] : [],

        identifiers,

        external_link:
            info.infoLink ||
            info.previewLink ||
            "",

        page_count: info.pageCount || null,
    };
}