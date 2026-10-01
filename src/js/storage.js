
const STORAGE_KEY = "studyshelf_shelf";


export function getShelf() {
    try {
        const storedShelf = localStorage.getItem(STORAGE_KEY);

        if (!storedShelf) {
            return [];
        }

        const shelf = JSON.parse(storedShelf);

        return Array.isArray(shelf) ? shelf : [];
    } catch (error) {
        console.error("Unable to read My Shelf:", error);
        return [];
    }
}

export function saveShelf(shelf) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shelf));
    } catch (error) {
        console.error("Unable to save My Shelf:", error);
    }
}

export function addToShelf(book) {
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

    return shelf.some((book) => book.id === bookId);
}