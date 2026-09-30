const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

export function initializeMobileMenu() {
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu",
        );
    });
}