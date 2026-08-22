let bookData;
let currentChapter = 0;
let currentPage = 0;

const chapterSelect = document.querySelector(".chapter-select");
const pageContent = document.querySelector(".page-content");
const pageNumber = document.querySelector(".page-number");

const previousPage = document.querySelector("#previous-page");
const nextPage = document.querySelector("#next-page");

const pageButtons = document.querySelector("#page-buttons");

fetch("data/book.json")
.then(response => response.json())
.then(data => {

    bookData = data["Alex Book"];

    loadChapters();
    loadPageButtons();
    displayPage();

})
.catch(error => {
    console.error("Error loading book:", error);
});


function loadChapters() {

    bookData.chapters.forEach((chapter, index) => {

        const option = document.createElement("option");

        option.value = index;
        option.textContent = chapter.title;

        chapterSelect.appendChild(option);
    });
}


function displayPage() {

    const chapter = bookData.chapters[currentChapter];

    const page = chapter.pages[currentPage];

    pageContent.innerHTML = "";

    page.content.forEach(line => {

        const paragraph = document.createElement("p");

        paragraph.textContent = line;

        pageContent.appendChild(paragraph);
    });

    pageNumber.textContent = page["page-number"];
}


chapterSelect.addEventListener("change", function() {

    currentChapter = Number(this.value);

    currentPage = 0;

    displayPage();

});

nextPage.addEventListener("click", function() {

    const chapter = bookData.chapters[currentChapter];

    // There is another page in this chapter
    if (currentPage < chapter.pages.length - 1) {

        currentPage++;

    // We're at the end of this chapter, move to the next chapter
    } else if (currentChapter < bookData.chapters.length - 1) {

        currentChapter++;
        currentPage = 0;

        // Update dropdown
        chapterSelect.value = currentChapter;
    }

    displayPage();
});

previousPage.addEventListener("click", function() {

    // There is a previous page in this chapter
    if (currentPage > 0) {

        currentPage--;

    // We're at the beginning of this chapter, move to previous chapter
    } else if (currentChapter > 0) {

        currentChapter--;

        const previousChapter = bookData.chapters[currentChapter];

        // Go to the last page of the previous chapter
        currentPage = previousChapter.pages.length - 1;

        // Update dropdown
        chapterSelect.value = currentChapter;
    }

    displayPage();
});

function loadPageButtons() {

    pageButtons.innerHTML = "";

    bookData.chapters.forEach((chapter, chapterIndex) => {

        chapter.pages.forEach((page, pageIndex) => {

            const button = document.createElement("button");

            button.classList.add("page-button");

            button.textContent = page["page-number"];

            button.addEventListener("click", function() {

                currentChapter = chapterIndex;
                currentPage = pageIndex;

                chapterSelect.value = currentChapter;

                displayPage();
            });

            pageButtons.appendChild(button);
        });
    });
}
