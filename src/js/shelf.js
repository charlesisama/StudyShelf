import {
  getShelf,
  removeFromShelf,
  addToShelf,
} from "./storage.js";

const shelfContent =
  document.querySelector("#shelf-content");

const shelfCount =
  document.querySelector("#shelf-count");

const shelfFeedback =
  document.querySelector("#shelf-feedback");

let removedBook = null;
let undoTimeout = null;

function showUndoFeedback(book) {
  if (!shelfFeedback) return;

  shelfFeedback.innerHTML = `
    <div class="shelf-feedback-content">
      <span>
        "${book.title}" was removed from My Shelf.
      </span>

      <button
        class="button button-secondary undo-shelf-button"
        type="button"
      >
        Undo
      </button>
    </div>
  `;

  const undoButton =
    shelfFeedback.querySelector(
      ".undo-shelf-button"
    );

  undoButton?.focus();

  undoTimeout = setTimeout(() => {
    removedBook = null;
    shelfFeedback.innerHTML = "";
  }, 6000);
}

function clearFeedback() {
  if (undoTimeout) {
    clearTimeout(undoTimeout);
    undoTimeout = null;
  }

  if (shelfFeedback) {
    shelfFeedback.innerHTML = "";
  }
}

export function renderShelf() {
  if (!shelfContent) return;

  const shelf = getShelf();

  if (shelfCount) {
    shelfCount.textContent = `(${shelf.length})`;
  }

  if (shelf.length === 0) {
    shelfContent.innerHTML = `
      <div class="empty-state">
        <h3>Your shelf is empty</h3>
        <p>
          Search for books and add the ones
          you want to keep here.
        </p>
      </div>
    `;

    return;
  }

  shelfContent.innerHTML = "";

  shelf.forEach((book) => {
    const card =
      document.createElement("article");

    card.className = "shelf-card";

    const cover = book.cover_url
      ? book.cover_url
      : "/public/images/book-placeholder.svg";

    const authors =
      book.authors?.length > 0
        ? book.authors.join(", ")
        : "Unknown author";

    card.innerHTML = `
      <img
        class="shelf-cover"
        src="${cover}"
        alt="Cover of ${book.title}"
        loading="lazy"
      />

      <div class="shelf-card-content">
        <h3>${book.title}</h3>

        <p>${authors}</p>

        <button
          class="button button-danger remove-shelf-button"
          type="button"
          data-book-id="${book.id}"
          aria-label="Remove ${book.title} from My Shelf"
        >
          Remove
        </button>
      </div>
    `;

    const image =
      card.querySelector(".shelf-cover");

    image?.addEventListener("error", () => {
      image.src =
        "/public/images/book-placeholder.svg";
    });

    shelfContent.appendChild(card);
  });
}

export function initializeShelf() {
  renderShelf();

  // Handle Remove buttons
  shelfContent?.addEventListener(
    "click",
    (event) => {
      const removeButton =
        event.target.closest(
          ".remove-shelf-button"
        );

      if (!removeButton) return;

      const bookId =
        removeButton.dataset.bookId;

      const shelf = getShelf();

      const book = shelf.find(
        (item) => item.id === bookId
      );

      if (!book) return;

      const confirmed = window.confirm(
        `Remove "${book.title}" from My Shelf?`
      );

      if (!confirmed) {
        return;
      }

      removedBook = book;

      removeFromShelf(bookId);

      renderShelf();

      showUndoFeedback(book);

      document.dispatchEvent(
        new CustomEvent("shelfUpdated")
      );
    }
  );

  // Handle Undo button
  shelfFeedback?.addEventListener(
    "click",
    (event) => {
      const undoButton =
        event.target.closest(
          ".undo-shelf-button"
        );

      if (!undoButton || !removedBook) {
        return;
      }

      const bookToRestore = removedBook;

      const restored =
        addToShelf(bookToRestore);

      if (restored) {
        removedBook = null;

        clearFeedback();

        renderShelf();

        document.dispatchEvent(
          new CustomEvent("shelfUpdated")
        );
      }
    }
  );
}