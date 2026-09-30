import { initializeMobileMenu } from "./ui.js";

import { searchBooks } from "./search.js";

import { renderBooks } from "./book-list.js";


const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchType = document.querySelector("#search-type");
const resultCount = document.querySelector(".result-count");

//Handle book search
async function handleSearch(event) {
    event.preventDefault();

    const query = searchInput.value;
    const type = searchType.value;

    if (!query.trim()) {
        searchInput.focus();
        return;
    }


    resultCount.textContent = "Searching...";

    try {
        const books = await searchBooks(query, type);

        renderBooks(books);

        resultCount.textContent = `${books.length} books found`;

    } catch (error) {
        console.error(error);

        renderBooks([]);

        resultCount.textContent =
            "Unable to load books. Please try again.";
    }
}


searchForm.addEventListener("submit", handleSearch);

initializeMobileMenu();

console.log("StudyShelf application started.");