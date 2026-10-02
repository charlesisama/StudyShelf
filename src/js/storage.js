const STORAGE_KEY = "studyshelf_shelf";

function isValidShelfBook(book) {
    return (
        book &&
        typeof book === "object" &&
        typeof book.id === "string" &&
        book.id.trim() !== "" &&
        typeof book.title === "string" &&
        book.title.trim() !== ""
    );
}

export function getShelf() {
    try {
        const storedShelf =
            localStorage.getItem(STORAGE_KEY);

        if (!storedShelf) {
            return [];
        }

        const shelf = JSON.parse(storedShelf);

        if (!Array.isArray(shelf)) {
            return [];
        }

        return shelf.filter(isValidShelfBook);
    } catch (error) {
        console.error(
            "Unable to read My Shelf:",
            error
        );

        return [];
    }
}

export function saveShelf(shelf) {
    try {
        if (!Array.isArray(shelf)) {
            return;
        }

        const validShelf = shelf.filter(
            isValidShelfBook
        );

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(validShelf)
        );
    } catch (error) {
        console.error(
            "Unable to save My Shelf:",
            error
        );
    }
}

export function addToShelf(book) {
    if (!isValidShelfBook(book)) {
        return false;
    }

    const shelf = getShelf();

    const alreadyExists = shelf.some(
        (item) => item.id === book.id
    );

    if (alreadyExists) {
        return false;
    }

    shelf.push({
        ...book,
        added_at: new Date().toISOString(),
    });

    saveShelf(shelf);

    return true;
}

export function removeFromShelf(bookId) {
    const shelf = getShelf();

    const updatedShelf = shelf.filter(
        (book) => book.id !== bookId
    );

    saveShelf(updatedShelf);

    return updatedShelf;
}

export function isInShelf(bookId) {
    const shelf = getShelf();

    return shelf.some(
        (book) => book.id === bookId
    );
}