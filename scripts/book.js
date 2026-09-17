import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const languages = {
    en: {
        title: "The Holy Book of The Last Days",
        home: "Home",
        //pricing: "Pricing",
        contact: "Contact",
        page: "Page",

        siteName: "Apocalypse 2033",
        onePage: "One Page",
        allPages: "All Pages",
        contactTitle: "Contact (WIP)",
        name: "Name",
        email: "Email",
        message: "Message",
        send: "Send",
        footer: "GitHub Pages v1.0",
        copyright: "© 2026 All rights reserved",

        englishButton: "English",
        russianButton: "Russian",
        pdf: "books/english.pdf"
    },

    ru: {
        title: "Священная книга последних дней",
        home: "Главная",
        //pricing: "Цены",
        contact: "Связаться с нами",
        page: "Страница",

        siteName: "Апокалипсис 2033",
        onePage: "Одна страница",
        allPages: "Все страницы",
        contactTitle: "Контакты (WIP)",
        name: "Имя",
        email: "Электронная почта",
        message: "Сообщение",
        send: "Отправить",
        footer: "GitHub Pages v1.0",
        copyright: "© 2026 Все права защищены",

        englishButton: "Английский",
        russianButton: "Русский",
        pdf: "books/russian.pdf"
    }
};

let currentLanguage = "en";
let currentPage = 1;
let pdfDocument = null;
let pageElements = [];

const pdfContainer = document.getElementById("pdf-container");

const bookTitle = document.getElementById("book-title");
const siteName = document.getElementById("site-name");

const contactTitle = document.getElementById("contact-title");
const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const contactMessage = document.getElementById("contact-message");
const contactSubmit = document.getElementById("contact-submit");

const footerTitle = document.getElementById("footer-title");
const copyright = document.getElementById("copyright");
const homeButton = document.getElementById("home-button");
// const pricingButton = document.getElementById("pricing-button");
const contactButton = document.getElementById("contact-button");

const englishButton = document.getElementById("english-button");
const russianButton = document.getElementById("russian-button");

const pageLabel = document.getElementById("page-label");
const currentPageElement = document.getElementById("current-page");
const totalPagesElement = document.getElementById("total-pages");

const previousButton = document.getElementById("previous-page");
const nextButton = document.getElementById("next-page");

const singlePageButton = document.getElementById("single-page-view");
const allPageButton = document.getElementById("all-page-view");

let viewMode = "single";
let renderSession = 0;
let pdfLoadSession = 0;
let pdfLoading = false;

// --------------------------------------------------
// LOAD PDF
// --------------------------------------------------

async function loadPDF() {
    const loadSession = ++pdfLoadSession;
    pdfLoading = true;
    const session = ++renderSession;
    const language = languages[currentLanguage];

    // Remember the page we were viewing
    const savedPage = currentPage;

    let newPDF;

    try {
        const pdfPath = new URL(
            language.pdf,
            window.location.href
        ).href;

        newPDF = await pdfjsLib.getDocument(pdfPath).promise;
    } catch (error) {
        // A newer language load happened while loading
        if (loadSession !== pdfLoadSession) {
            return;
        }

        console.error("PDF failed to load:", language.pdf);
        console.error(error);
        return;
    }

    // A newer language/view change happened while loading
    if (loadSession !== pdfLoadSession) {
        return;
    }

    pdfDocument = newPDF;
    pdfLoading = false;

    // Keep the same page number if possible
    currentPage = Math.min(
        savedPage,
        pdfDocument.numPages
    );

    totalPagesElement.textContent =
        pdfDocument.numPages;

    // Build the new viewer
    pdfContainer.innerHTML = "";
    pageElements = [];

    if (viewMode === "single") {
        await renderPage(
            currentPage,
            null,
            session,
            "single"
        );

        if (session !== renderSession) {
            return;
        }

        updatePageDisplay();
        return;
    }

    // ALL PAGE MODE
    await buildAllPages(
        currentPage,
        session
    );
}


// --------------------------------------------------
// RENDER ONE PAGE
// --------------------------------------------------

async function renderPage(
    pageNumber,
    pageWrapper = null,
    session = renderSession,
    mode = viewMode
) {
    // Don't start an outdated render
    if (session !== renderSession) {
        return false;
    }

    const page = await pdfDocument.getPage(pageNumber);

    // Check again after the async operation
    if (session !== renderSession) {
        return false;
    }

    // Single Page mode gets one page only
    if (mode === "single") {
        pdfContainer.innerHTML = "";
        pageElements = [];

        pageWrapper = document.createElement("div");

        pageWrapper.className = "pdf-page";
        pageWrapper.dataset.page = pageNumber;

        pdfContainer.appendChild(pageWrapper);
        pageElements.push(pageWrapper);
    }

    // All Pages mode uses the placeholder that was already created
    if (!pageWrapper) {
        pageWrapper = document.createElement("div");

        pageWrapper.className = "pdf-page";
        pageWrapper.dataset.page = pageNumber;

        pdfContainer.appendChild(pageWrapper);
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const containerWidth = pdfContainer.clientWidth;

    const baseViewport = page.getViewport({
        scale: 1
    });

    const availableWidth = Math.max(
        containerWidth - 16,
        300
    );

    const scale = availableWidth / baseViewport.width;

    const viewport = page.getViewport({
        scale
    });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    pageWrapper.appendChild(canvas);

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    // Make sure this render is still current
    if (session !== renderSession) {
        return false;
    }

    return true;
}


// --------------------------------------------------
// BUILD ALL-PAGE VIEW
// --------------------------------------------------

async function buildAllPages(
    savedPage,
    session
) {
    pageElements = [];

    // Create all placeholders immediately
    for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
    ) {
        const pageWrapper =
            document.createElement("div");

        pageWrapper.className = "pdf-page";
        pageWrapper.dataset.page = pageNumber;

        pdfContainer.appendChild(pageWrapper);

        pageElements.push(pageWrapper);
    }

    // Render the page the user was already on FIRST
    const savedWrapper =
        pageElements[savedPage - 1];

    if (savedWrapper) {
        await renderPage(
            savedPage,
            savedWrapper,
            session,
            "all"
        );
    }

    // The user may have changed language/view
    if (session !== renderSession) {
        return;
    }

    currentPage = savedPage;
    updatePageDisplay();

    // Jump to the saved page
    requestAnimationFrame(() => {
        if (session !== renderSession) {
            return;
        }

        const page =
            pageElements[savedPage - 1];

        if (page) {
            pdfContainer.scrollTop =
                page.offsetTop -
                pdfContainer.offsetTop;
        }
    });

    // Load everything else in the background
    for (
        let pageNumber = 1;
        pageNumber <= pdfDocument.numPages;
        pageNumber++
    ) {
        if (session !== renderSession) {
            return;
        }

        if (pageNumber === savedPage) {
            continue;
        }

        await renderPage(
            pageNumber,
            pageElements[pageNumber - 1],
            session,
            "all"
        );

        if (session !== renderSession) {
            return;
        }
    }

    // Finished loading
    if (session === renderSession) {
        currentPage = savedPage;
        updatePageDisplay();

        pdfContainer.addEventListener(
            "scroll",
            updateCurrentPageFromScroll
        );
    }
}


// --------------------------------------------------
// CHANGE VIEW MODE
// --------------------------------------------------

async function changeViewMode(mode) {
    const session = ++renderSession;

    // Save the page BEFORE changing anything
    const savedPage = currentPage;

    viewMode = mode;

    pdfContainer.classList.toggle(
        "all-pages",
        viewMode === "all"
    );

    // Stop scroll tracking while rebuilding
    pdfContainer.removeEventListener(
        "scroll",
        updateCurrentPageFromScroll
    );

    // If switching to single page,
    // immediately clear the old all-page viewer
    if (viewMode === "single") {
        pdfContainer.innerHTML = "";
        pageElements = [];

        currentPage = Math.min(
            savedPage,
            pdfDocument.numPages
        );

        // Render the saved page
        await renderPage(
            currentPage,
            null,
            session,
            "single"
        );

        if (session !== renderSession) {
            return;
        }

        updatePageDisplay();
        return;
    }

    // Switching to all pages
    pdfContainer.innerHTML = "";
    pageElements = [];

    currentPage = Math.min(
        savedPage,
        pdfDocument.numPages
    );

    await buildAllPages(
        currentPage,
        session
    );
}


// --------------------------------------------------
// PAGE DISPLAY
// --------------------------------------------------

function updatePageDisplay() {
    currentPageElement.textContent =
        currentPage;

    previousButton.disabled =
        currentPage <= 1;

    nextButton.disabled =
        !pdfDocument ||
        currentPage >= pdfDocument.numPages;

    singlePageButton.classList.toggle(
        "active",
        viewMode === "single"
    );

    allPageButton.classList.toggle(
        "active",
        viewMode === "all"
    );
}


// --------------------------------------------------
// DETERMINE CURRENT PAGE WHILE SCROLLING
// --------------------------------------------------

function updateCurrentPageFromScroll() {
    if (viewMode !== "all") {
        return;
    }

    if (pageElements.length === 0) {
        return;
    }

    const containerRect = pdfContainer.getBoundingClientRect();

    let closestPage = 1;
    let closestDistance = Infinity;

    pageElements.forEach((pageElement, index) => {
        const rect = pageElement.getBoundingClientRect();

        const distance = Math.abs(
            rect.top - containerRect.top
        );

        if (distance < closestDistance) {
            closestDistance = distance;
            closestPage = index + 1;
        }
    });

    if (closestPage !== currentPage) {
        currentPage = closestPage;
        updatePageDisplay();
    }
}


function updateLanguage() {
    const language = languages[currentLanguage];

    document.documentElement.lang = currentLanguage;

    bookTitle.textContent = language.title;
    homeButton.textContent = language.home;
    //pricingButton.textContent = language.pricing;
    contactButton.textContent = language.contact;
    pageLabel.textContent = language.page;

    englishButton.textContent = language.englishButton;
    russianButton.textContent = language.russianButton;

    englishButton.classList.toggle("active", currentLanguage === "en");
    russianButton.classList.toggle("active", currentLanguage === "ru");
    siteName.textContent = language.siteName;

    singlePageButton.textContent = language.onePage;
    allPageButton.textContent = language.allPages;

    contactTitle.textContent = language.contactTitle;

    contactName.placeholder = language.name;
    contactEmail.placeholder = language.email;
    contactMessage.placeholder = language.message;

    contactSubmit.textContent = language.send;

    footerTitle.textContent = language.footer;
    copyright.textContent = language.copyright;
}


async function changeLanguage(language) {
    currentLanguage = language;

    updateLanguage();

    await loadPDF();
}


previousButton.addEventListener("click", async () => {
    if (!pdfLoading && currentPage > 1) {
        currentPage--;

        if (viewMode === "single") {
            const session = ++renderSession;

            await renderPage(
                currentPage,
                null,
                session,
                "single"
            );
        } else {
            const page = pageElements[currentPage - 1];

            if (page) {
                requestAnimationFrame(() => {
                    pdfContainer.scrollTop =
                        page.offsetTop - pdfContainer.offsetTop;
                });
            }
        }

        updatePageDisplay();
    }
});

pdfContainer.addEventListener("wheel", async (event) => {
    if (viewMode !== "single" || !pdfDocument) {
        return;
    }

    const atTop =
        pdfContainer.scrollTop <= 0;

    const atBottom =
        pdfContainer.scrollTop +
        pdfContainer.clientHeight >=
        pdfContainer.scrollHeight - 2;

    // Scroll down
    if (event.deltaY > 0) {

        // Still room to scroll down this page
        if (!atBottom) {
            return;
        }

        // At the bottom, go to next page
        if (currentPage < pdfDocument.numPages) {
            event.preventDefault();

            currentPage++;

            const session = ++renderSession;

            await renderPage(
                currentPage,
                null,
                session,
                "single"
            );

            if (session === renderSession) {
                pdfContainer.scrollTop = 0;
                updatePageDisplay();
            }
        }
    }

    // Scroll up
    if (event.deltaY < 0) {

        // Still room to scroll up this page
        if (!atTop) {
            return;
        }

        // At the top, go to previous page
        if (currentPage > 1) {
            event.preventDefault();

            currentPage--;

            const session = ++renderSession;

            await renderPage(
                currentPage,
                null,
                session,
                "single"
            );

            if (session === renderSession) {
                pdfContainer.scrollTop =
                    pdfContainer.scrollHeight;

                updatePageDisplay();
            }
        }
    }
});


nextButton.addEventListener("click", async () => {
    if (
        !pdfLoading &&
        pdfDocument &&
        currentPage < pdfDocument.numPages
    ) {
        currentPage++;

        if (viewMode === "single") {
            const session = ++renderSession;

            await renderPage(
                currentPage,
                null,
                session,
                "single"
            );
        } else {
            const page = pageElements[currentPage - 1];

            if (page) {
                pdfContainer.scrollTo({
                    top: page.offsetTop - pdfContainer.offsetTop,
                    behavior: "smooth"
                });
            }
        }

        updatePageDisplay();
    }
});

singlePageButton.addEventListener("click", () => {
    changeViewMode("single");
});

allPageButton.addEventListener("click", () => {
    changeViewMode("all");
});


pdfContainer.addEventListener("scroll", updateCurrentPageFromScroll);


englishButton.addEventListener("click", () => {
    if (currentLanguage !== "en") {
        changeLanguage("en");
    }
});


russianButton.addEventListener("click", () => {
    if (currentLanguage !== "ru") {
        changeLanguage("ru");
    }
});


singlePageButton.addEventListener("click", () => {
    changeViewMode("single");
});

allPageButton.addEventListener("click", () => {
    changeViewMode("all");
});

pdfContainer.addEventListener("scroll", updateCurrentPageFromScroll);

englishButton.addEventListener("click", () => {
    if (currentLanguage !== "en") {
        changeLanguage("en");
    }
});

russianButton.addEventListener("click", () => {
    if (currentLanguage !== "ru") {
        changeLanguage("ru");
    }
});


homeButton.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

contactButton.addEventListener("click", () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth"
    });
});


updateLanguage();
loadPDF();