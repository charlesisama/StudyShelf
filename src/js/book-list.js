import { addToShelf } from "./storage.js";
import { escapeHtml } from "./utils.js";
import { openBookDetails } from "./book-detail.js";

const bookGrid = document.querySelector("#book-grid");

let currentBooks = [];

function createBookCard(book) {
  const card = document.createElement("article");

  card.className = "book-card";

  const cover = book.cover_url
    ? book.cover_url
    : "/src/images/book-placeholder.svg";

  const authors =
    book.authors?.length > 0
      ? book.authors.join(", ")
      : "Unknown author";

  const year = book.publish_year || "Year unknown";

  const safeTitle = escapeHtml(book.title);
  const safeAuthors = escapeHtml(authors);
  const safeYear = escapeHtml(year);
  const safeCover = escapeHtml(cover);
  const safeBookId = escapeHtml(book.id);

  const sourceLabel =
    book.source === "open_library"
      ? "Open Library"
      : "Google Books";

  card.innerHTML = `
    <div class="book-cover-wrapper">
      <img
        class="book-cover"
        src="${safeCover}"
        alt="Cover of ${safeTitle}"
        loading="lazy"
      />
    </div>

    <div class="book-card-content">

      <span class="book-source">
        ${sourceLabel}
      </span>

      <h3 class="book-title">
        ${safeTitle}
      </h3>

      <p class="book-author">
        ${safeAuthors}
      </p>

      <p class="book-year">
        First published: ${safeYear}
      </p>

      <div class="book-actions">

        <button
          class="button button-secondary details-button"
          type="button"
          data-book-id="${safeBookId}"
        >
          Details
        </button>

        <button
          class="button button-primary shelf-button"
          type="button"
          data-book-id="${safeBookId}"
        >
          Add to Shelf
        </button>

      </div>
    </div>
  `;

  const image = card.querySelector(".book-cover");

  image?.addEventListener("error", () => {
    image.src = "/src/images/book-placeholder.svg";
  });

  return card;
}

export function renderBooks(books) {
  if (!bookGrid) return;

  currentBooks = books;

  bookGrid.innerHTML = "";

  if (books.length === 0) {
    bookGrid.innerHTML = `
      <div class="empty-state">
        <h3>No books found</h3>
        <p>
          Try another title, author, subject, or ISBN.
        </p>
      </div>
    `;

    return;
  }

  books.forEach((book) => {
    bookGrid.appendChild(
      createBookCard(book)
    );
  });
}

export function initializeBookList() {
  bookGrid?.addEventListener("click", (event) => {

    // Details button
    const detailsButton =
      event.target.closest(".details-button");

    if (detailsButton) {
      const bookId =
        detailsButton.dataset.bookId;

      const book = currentBooks.find(
        (item) => item.id === bookId
      );

      if (book) {
        openBookDetails(book);
      }

      return;
    }

    // Add to Shelf button
    const shelfButton =
      event.target.closest(".shelf-button");

    if (shelfButton) {
      const bookId =
        shelfButton.dataset.bookId;

      const book = currentBooks.find(
        (item) => item.id === bookId
      );

      if (!book) return;

      const added = addToShelf(book);

      if (added) {
        shelfButton.textContent =
          "Added to Shelf";

        shelfButton.disabled = true;

        document.dispatchEvent(
          new CustomEvent("shelfUpdated")
        );
      } else {
        shelfButton.textContent =
          "Already on Shelf";
      }
    }
  });
}