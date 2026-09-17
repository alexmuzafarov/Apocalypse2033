import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const languages = {
    en: {
        title: "The Holy Book of The Last Days",
        home: "Home",
        pricing: "Pricing",
        contact: "Contact",
        page: "Page",

        siteName: "Apocalypse 2033",
        onePage: "One Page",
        allPages: "All Pages",
        contactTitle: "Contact",
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
        pricing: "Цены",
        contact: "Связаться с нами",
        page: "Страница",

        siteName: "Апокалипсис 2033",
        onePage: "Одна страница",
        allPages: "Все страницы",
        contactTitle: "Контакты",
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
const pricingButton = document.getElementById("pricing-button");
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


async function loadPDF() {
    const language = languages[currentLanguage];

    pdfContainer.innerHTML = "";
    pageElements = [];

    try {
        pdfDocument = await pdfjsLib.getDocument(language.pdf).promise;
    } catch (error) {
        console.error("PDF failed to load:", language.pdf);
        console.error(error);
        return;
    }

    currentPage = 1;

    totalPagesElement.textContent = pdfDocument.numPages;

    if (viewMode === "single") {
        await renderPage(currentPage);
    } else {
        for (
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ) {
            await renderPage(pageNumber);
        }
    }

    updatePageDisplay();
}


async function renderPage(pageNumber) {
    const page = await pdfDocument.getPage(pageNumber);

    if (viewMode === "single") {
        pdfContainer.innerHTML = "";
        pageElements = [];
    }

    const pageWrapper = document.createElement("div");

    pageWrapper.className = "pdf-page";
    pageWrapper.dataset.page = pageNumber;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const containerWidth = pdfContainer.clientWidth;
    const baseViewport = page.getViewport({ scale: 1 });

    const availableWidth = Math.max(containerWidth - 16, 300);

    const scale = Math.min(
        availableWidth / baseViewport.width,
        1.5
    );

    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    pageWrapper.appendChild(canvas);
    pdfContainer.appendChild(pageWrapper);

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;

    pageElements.push(pageWrapper);
}

async function changeViewMode(mode) {
    viewMode = mode;

    pdfContainer.innerHTML = "";
    pageElements = [];

    if (viewMode === "single") {
        await renderPage(currentPage);
    } else {
        for (
            let pageNumber = 1;
            pageNumber <= pdfDocument.numPages;
            pageNumber++
        ) {
            await renderPage(pageNumber);
        }
    }

    updatePageDisplay();
}


function updatePageDisplay() {
    currentPageElement.textContent = currentPage;

    previousButton.disabled = currentPage <= 1;
    nextButton.disabled = !pdfDocument || currentPage >= pdfDocument.numPages;
}


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
    pricingButton.textContent = language.pricing;
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
    if (currentPage > 1) {
        currentPage--;

        if (viewMode === "single") {
            await renderPage(currentPage);
        } else {
            pageElements[currentPage - 1].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        updatePageDisplay();
    }
});

pdfContainer.addEventListener("wheel", (event) => {

    if (viewMode !== "single") {
        return;
    }

    if (event.deltaY > 0 && currentPage < pdfDocument.numPages) {
        event.preventDefault();

        currentPage++;
        renderPage(currentPage);
        updatePageDisplay();
    }

    if (event.deltaY < 0 && currentPage > 1) {
        event.preventDefault();

        currentPage--;
        renderPage(currentPage);
        updatePageDisplay();
    }
});


nextButton.addEventListener("click", async () => {
    if (
        pdfDocument &&
        currentPage < pdfDocument.numPages
    ) {
        currentPage++;

        if (viewMode === "single") {
            await renderPage(currentPage);
        } else {
            pageElements[currentPage - 1].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
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


updateLanguage();
loadPDF();