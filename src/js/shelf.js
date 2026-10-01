import {getShelf,removeFromShelf} from "./storage.js";

const shelfContent = document.querySelector("#shelf-content");

export function renderShelf() {
    if (!shelfContent) return;

    const shelf = getShelf();

    if (shelf.length === 0) {
        shelfContent.innerHTML = `
      <div class="empty-state">
        <h3>Your shelf is empty</h3>
        <p>
          Search for books and add the ones you want to keep here.
        </p>
      </div>
    `;

        return;
    }

    shelfContent.innerHTML = "";

    shelf.forEach((book) => {
        const card = document.createElement("article");

        card.className = "shelf-card";

        const cover = book.cover_url
            ? book.cover_url
            : "/src/images/book-placeholder.svg";

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
        >
          Remove
        </button>
      </div>
    `;

        shelfContent.appendChild(card);
    });
}

export function initializeShelf() {
    renderShelf();

    shelfContent?.addEventListener("click", (event) => {
        const button = event.target.closest(
            ".remove-shelf-button"
        );

        if (!button) return;

        const bookId = button.dataset.bookId;

        removeFromShelf(bookId);

        renderShelf();

        document.dispatchEvent(
            new CustomEvent("shelfUpdated")
        );
    });
}