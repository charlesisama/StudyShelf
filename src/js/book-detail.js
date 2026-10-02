import { addToShelf, isInShelf } from "./storage.js";
import { escapeHtml } from "./utils.js";

const modal = document.querySelector("#book-detail-modal");
const detailContent = document.querySelector("#book-detail-content");
const closeButton = document.querySelector("#close-detail-modal");

let previouslyFocusedElement = null;

export function openBookDetails(book) {
  if (!modal || !detailContent) return;

  previouslyFocusedElement =
    document.activeElement;

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
    : "/public/images/book-placeholder.svg";

  const saved = isInShelf(book.id);

  const sourceLabel =
    book.source === "open_library"
      ? "Open Library"
      : "Google Books";

  // Sanitize API-derived values before inserting them into HTML.
  const safeTitle = escapeHtml(book.title);
  const safeAuthors = escapeHtml(authors);
  const safeSubjects = escapeHtml(subjects);
  const safeIdentifiers = escapeHtml(identifiers);
  const safeCover = escapeHtml(cover);
  const safePublisher = escapeHtml(
    book.publisher || "Not available"
  );
  const safeFormat = escapeHtml(
    book.format?.join(", ") || "Not available"
  );
  const safeDescription = escapeHtml(
    book.description || ""
  );
  const safeSourceLabel = escapeHtml(sourceLabel);
  const safeExternalLink = escapeHtml(
    book.external_link || ""
  );

  detailContent.innerHTML = `
    <div class="detail-layout">

      <div class="detail-cover-wrapper">
        <img
          class="detail-cover"
          src="${safeCover}"
          alt="Cover of ${safeTitle}"
          loading="lazy"
        />
      </div>

      <div class="detail-information">

        <span class="book-source">
          ${safeSourceLabel}
        </span>

        <h2 id="book-detail-title">
          ${safeTitle}
        </h2>

        <p class="detail-authors">
          <strong>Author:</strong>
          ${safeAuthors}
        </p>

        <p>
          <strong>First published:</strong>
          ${escapeHtml(book.publish_year || "Not available")}
        </p>

        <p>
          <strong>Publisher:</strong>
          ${safePublisher}
        </p>

        <p>
          <strong>Format:</strong>
          ${safeFormat}
        </p>

        <p>
          <strong>Subjects:</strong>
          ${safeSubjects}
        </p>

        <p>
          <strong>ISBN:</strong>
          ${safeIdentifiers}
        </p>

        ${safeDescription
      ? `
              <div class="detail-description">
                <h3>Description</h3>
                <p>${safeDescription}</p>
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
                  href="${safeExternalLink}"
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

  // Fallback if the external cover image fails to load.
  const detailImage =
    detailContent.querySelector(".detail-cover");

  detailImage?.addEventListener("error", () => {
    detailImage.src =
      "/public/images/book-placeholder.svg";
  });

  const shelfButton =
    document.querySelector("#modal-shelf-button");

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
  closeButton?.addEventListener(
    "click",
    () => {
      modal.close();
    }
  );

  modal?.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) {
        modal.close();
      }
    }
  );

  modal?.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        modal.close();
      }
    }
  );

  modal?.addEventListener(
    "close",
    () => {
      previouslyFocusedElement?.focus();
    }
  );
}