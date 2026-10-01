import { initializeMobileMenu } from "./ui.js";

import { searchBooks } from "./search.js";

import {
    renderBooks,
    initializeBookList,
} from "./book-list.js";

import {
    initializeBookDetails,
} from "./book-detail.js";

import {
    initializeShelf,
    renderShelf,
} from "./shelf.js";

const searchForm =
    document.querySelector("#search-form");

const searchInput =
    document.querySelector("#search-input");

const searchType =
    document.querySelector("#search-type");

const resultCount =
    document.querySelector(".result-count");

const subjectFilter =
    document.querySelector("#subject-filter");

const languageFilter =
    document.querySelector("#language-filter");

const yearFrom =
    document.querySelector("#year-from");

const yearTo =
    document.querySelector("#year-to");

const sortFilter =
    document.querySelector("#sort-filter");

const resetFilters =
    document.querySelector("#reset-filters");

const previousPage =
    document.querySelector("#previous-page");

const nextPage =
    document.querySelector("#next-page");

const pageIndicator =
    document.querySelector("#page-indicator");

const bookGrid =
    document.querySelector("#book-grid");

const RESULTS_PER_PAGE = 8;

let allBooks = [];

let filteredBooks = [];

let currentPage = 1;

let lastSearch = {
    query: "",
    type: "title",
};

//Loading State

function showLoading() {
    bookGrid.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>

      <h3>Searching for books...</h3>

      <p>
        StudyShelf is checking its book sources.
      </p>
    </div>
  `;

    resultCount.textContent = "Searching...";
}

//Error State
function showError() {
    bookGrid.innerHTML = `
    <div class="error-state">

      <h3>Unable to load books</h3>

      <p>
        Something went wrong while contacting
        the book services.
      </p>

      <button
        id="retry-search"
        class="button button-primary"
        type="button"
      >
        Try Again
      </button>

    </div>
  `;

    resultCount.textContent =
        "Search failed";

    document
        .querySelector("#retry-search")
        ?.addEventListener(
            "click",
            performSearch
        );
}

// No Results State
function showNoResults() {
    bookGrid.innerHTML = `
    <div class="empty-state">

      <h3>No books match your filters</h3>

      <p>
        Try changing your search or removing
        some filters.
      </p>

    </div>
  `;
}

//Build Filter Options
function populateFilterOptions(books) {
    const subjects = new Set();
    const languages = new Set();

    books.forEach((book) => {

        book.subjects?.forEach((subject) => {
            if (subject) {
                subjects.add(subject);
            }
        });

        book.language?.forEach((language) => {
            if (language) {
                languages.add(language);
            }
        });

    });

    const currentSubject =
        subjectFilter.value;

    const currentLanguage =
        languageFilter.value;

    subjectFilter.innerHTML = `
    <option value="all">
      All subjects
    </option>
  `;

    languageFilter.innerHTML = `
    <option value="all">
      All languages
    </option>
  `;

    [...subjects]
        .sort()
        .slice(0, 50)
        .forEach((subject) => {

            const option =
                document.createElement("option");

            option.value = subject;
            option.textContent = subject;

            subjectFilter.appendChild(option);

        });

    [...languages]
        .sort()
        .forEach((language) => {

            const option =
                document.createElement("option");

            option.value = language;
            option.textContent = language;

            languageFilter.appendChild(option);

        });

    if (
        [...subjectFilter.options]
            .some(
                (option) =>
                    option.value === currentSubject
            )
    ) {
        subjectFilter.value = currentSubject;
    }

    if (
        [...languageFilter.options]
            .some(
                (option) =>
                    option.value === currentLanguage
            )
    ) {
        languageFilter.value = currentLanguage;
    }
}

//Filter Books
function applyFilters() {

    const selectedSubject =
        subjectFilter.value;

    const selectedLanguage =
        languageFilter.value;

    const fromYear =
        Number(yearFrom.value) || null;

    const toYear =
        Number(yearTo.value) || null;

    filteredBooks =
        allBooks.filter((book) => {

            const matchesSubject =
                selectedSubject === "all" ||
                book.subjects?.some(
                    (subject) =>
                        subject === selectedSubject
                );

            const matchesLanguage =
                selectedLanguage === "all" ||
                book.language?.includes(
                    selectedLanguage
                );

            const matchesFromYear =
                !fromYear ||
                (
                    book.publish_year &&
                    book.publish_year >= fromYear
                );

            const matchesToYear =
                !toYear ||
                (
                    book.publish_year &&
                    book.publish_year <= toYear
                );

            return (
                matchesSubject &&
                matchesLanguage &&
                matchesFromYear &&
                matchesToYear
            );
        });

    applySorting();

    currentPage = 1;

    renderCurrentPage();
}

//Sorting
function applySorting() {

    const sortValue =
        sortFilter.value;

    if (sortValue === "year-desc") {

        filteredBooks.sort(
            (a, b) =>
                (b.publish_year || 0) -
                (a.publish_year || 0)
        );

    }

    if (sortValue === "year-asc") {

        filteredBooks.sort(
            (a, b) =>
                (a.publish_year || Infinity) -
                (b.publish_year || Infinity)
        );

    }

}

//Pagination
function getTotalPages() {

    return Math.max(
        1,
        Math.ceil(
            filteredBooks.length /
            RESULTS_PER_PAGE
        )
    );

}


function renderCurrentPage() {

    const totalPages =
        getTotalPages();

    if (
        currentPage > totalPages
    ) {
        currentPage = totalPages;
    }

    const startIndex =
        (currentPage - 1) *
        RESULTS_PER_PAGE;

    const endIndex =
        startIndex +
        RESULTS_PER_PAGE;

    const booksForPage =
        filteredBooks.slice(
            startIndex,
            endIndex
        );

    if (
        filteredBooks.length === 0
    ) {
        showNoResults();
    } else {
        renderBooks(booksForPage);
    }

    resultCount.textContent =
        `${filteredBooks.length} books found`;

    pageIndicator.textContent =
        `Page ${currentPage} of ${totalPages}`;

    previousPage.disabled =
        currentPage === 1;

    nextPage.disabled =
        currentPage === totalPages;
}

//Search
async function performSearch() {

    const query =
        lastSearch.query;

    const type =
        lastSearch.type;

    if (!query.trim()) {
        return;
    }

    showLoading();

    try {

        const books =
            await searchBooks(
                query,
                type
            );

        allBooks = books;

        populateFilterOptions(
            allBooks
        );

        filteredBooks =
            [...allBooks];

        currentPage = 1;

        renderCurrentPage();

    } catch (error) {

        console.error(error);

        showError();

    }

}


async function handleSearch(event) {

    event.preventDefault();

    const query =
        searchInput.value.trim();

    const type =
        searchType.value;

    if (!query) {
        searchInput.focus();
        return;
    }

    lastSearch = {
        query,
        type,
    };

    await performSearch();

}

//Filter Events
function handleFilterChange() {
    applyFilters();
}

subjectFilter?.addEventListener(
    "change",
    handleFilterChange
);

languageFilter?.addEventListener(
    "change",
    handleFilterChange
);

yearFrom?.addEventListener(
    "input",
    handleFilterChange
);

yearTo?.addEventListener(
    "input",
    handleFilterChange
);

sortFilter?.addEventListener(
    "change",
    handleFilterChange
);

//Reset Filters
resetFilters?.addEventListener(
    "click",
    () => {

        subjectFilter.value = "all";

        languageFilter.value = "all";

        yearFrom.value = "";

        yearTo.value = "";

        sortFilter.value = "relevance";

        filteredBooks =
            [...allBooks];

        currentPage = 1;

        renderCurrentPage();

    }
);

//Pagination Events
previousPage?.addEventListener(
    "click",
    () => {

        if (currentPage > 1) {

            currentPage--;

            renderCurrentPage();

            bookGrid.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

        }

    }
);


nextPage?.addEventListener(
    "click",
    () => {

        const totalPages =
            getTotalPages();

        if (
            currentPage < totalPages
        ) {

            currentPage++;

            renderCurrentPage();

            bookGrid.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

        }

    }
);

// Application Initialization

searchForm?.addEventListener(
    "submit",
    handleSearch
);

document.addEventListener(
    "shelfUpdated",
    () => {
        renderShelf();
    }
);

initializeMobileMenu();

initializeBookList();

initializeBookDetails();

initializeShelf();

console.log(
    "StudyShelf application started."
);