import {
    addToShelf,
    isInShelf,
} from "./storage.js";

const modal = document.querySelector(
    "#book-detail-modal"
);

const detailContent = document.querySelector(
    "#book-detail-content"
);

const closeButton = document.querySelector(
    "#close-detail-modal"
);

export function openBookDetails(book) {
    if (!modal || !detailContent) return;

    const authors =
        book.authors?.length > 0
            ? book.authors.join(", ")
            : "Unknown author";

    const subjects =
        book.subjects?.length > 0
            ? book.subjects.slice(0, 8).join(", ")
            : "Not available";

    const identifiers =
        book.identifiers?.isbn?.length > 0
            ? book.identifiers.isbn.slice(0, 5).join(", ")
            : "Not available";

    const cover = book.cover_url
        ? book.cover_url
        : "/src/images/book-placeholder.svg";

    const saved = isInShelf(book.id);

    detailContent.innerHTML = `
    <div class="detail-layout">

      <div class="detail-cover-wrapper">
        <img
          class="detail-cover"
          src="${cover}"
          alt="Cover of ${book.title}"
        />
      </div>

      <div class="detail-information">

        <span class="book-source">
          ${book.source === "open_library"
            ? "Open Library"
            : "Google Books"
        }
        </span>

        <h2>${book.title}</h2>

        <p class="detail-authors">
          <strong>Author:</strong>
          ${authors}
        </p>

        <p>
          <strong>First published:</strong>
          ${book.publish_year || "Not available"}
        </p>

        <p>
          <strong>Publisher:</strong>
          ${book.publisher || "Not available"}
        </p>

        <p>
          <strong>Format:</strong>
          ${book.format?.join(", ") || "Not available"}
        </p>

        <p>
          <strong>Subjects:</strong>
          ${subjects}
        </p>

        <p>
          <strong>ISBN:</strong>
          ${identifiers}
        </p>

        ${book.description
            ? `
              <div class="detail-description">
                <h3>Description</h3>
                <p>${book.description}</p>
              </div>
            `
            : ""
        }

        <div class="detail-actions">

          ${saved
            ? `
                <button
                  class="button button-secondary"
                  type="button"
                  disabled
                >
                  Already on My Shelf
                </button>
              `
            : `
                <button
                  id="modal-shelf-button"
                  class="button button-primary"
                  type="button"
                >
                  Add to My Shelf
                </button>
              `
        }

          ${book.external_link
            ? `
                <a
                  class="button button-secondary"
                  href="${book.external_link}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Source
                </a>
              `
            : ""
        }

        </div>
      </div>
    </div>
  `;

    const shelfButton = document.querySelector(
        "#modal-shelf-button"
    );

    shelfButton?.addEventListener("click", () => {
        const added = addToShelf(book);

        if (added) {
            shelfButton.textContent = "Added to My Shelf";
            shelfButton.disabled = true;

            document.dispatchEvent(
                new CustomEvent("shelfUpdated")
            );
        }
    });

    modal.showModal();

    closeButton?.focus();
}

export function initializeBookDetails() {
    closeButton?.addEventListener("click", () => {
        modal.close();
    });

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.close();
        }
    });

    modal?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.close();
        }
    });
}