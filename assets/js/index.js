const belumDibacaBooks = document.querySelector("#belum-dibaca > #books");
const sudahDibacaBooks = document.querySelector("#sudah-dibaca > #books");

function insertStart(parent, elem) {
    parent.insertBefore(elem, parent.children[0]);
}

function closeModal() {
    const addBookModal = document.querySelector("#add-book-modal");
    addBookModal.classList.add("hide");
}

function submitBuku() {
    const addBookModal = document.querySelector("#add-book-modal");

    const judul = document.querySelector("#modal > #form #judul");
    const author = document.querySelector("#modal > #form #author");
    const tahun = document.querySelector("#modal > #form #tahun");

    if (!judul.value.trim() || !author.value.trim() || !tahun.value) {
        closeModal()
        alert("Invalid data");
        return;
    }

    const obj = {
        title: judul.value,
        author: author.value,
        year: Number(tahun.value),
        isComplete: tambahBukuType === "sudah",
    };

    addBook(obj);

    addBookModal.classList.add("hide");
    tambahBukuType = undefined;
}

var tambahBukuType;

function tambahBuku(type) {
    const addBookModal = document.querySelector("#add-book-modal");
    addBookModal.classList.remove("hide");
    
    tambahBukuType = type;

    const judul = document.querySelector("#modal > #form #judul");
    const author = document.querySelector("#modal > #form #author");
    const tahun = document.querySelector("#modal > #form #tahun");

    judul.focus();

    // reset the fields
    judul.value = "";
    author.value = "";
    tahun.value = "";
}

/* book trashing */

function dragOverTrash(e) {
    if (!e.dataTransfer.types.includes("book-id")) { return; }

    dragFeedback.style.filter = "hue-rotate(260deg)";
    dragFeedback.style.opacity = "0.75";
    dragFeedback.style.scale = "0.9";

    e.preventDefault();
}

function dragLeaveTrash(e) {
    if (!e.dataTransfer.types.includes("book-id")) { return; }

    dragFeedback.style.filter = "";
    dragFeedback.style.opacity = "";
    dragFeedback.style.scale = "1.25";
}

function dropTrash(e) {
    dragFeedback.style.filter = "";
    dragFeedback.style.opacity = "";
    dragFeedback.style.scale = "";

    const bookId = e.dataTransfer.getData("book-id");
    const sudahDibaca = e.dataTransfer.getData("sudah-dibaca");

    const bookElement = document.querySelector(
        `#${sudahDibaca ? "sudah" : "belum"}-dibaca > #books > .book[book-id="${bookId}"]`
    );

    removeBook(bookId);
    bookElement.remove();
}

/* drag shenanigans */

function dragLeave(e) {
    if (e.target.id !== "books") { return; }

    e.target.querySelector("#book-placeholder").style.display = "none";

    dragFeedback.style.scale = "";
    dragFeedback.style.opacity = "";

    e.preventDefault();
    e.stopPropagation();
}

function checkBook(e, type) {
    if (e.target.id !== "books") { return; }

    e.dataTransfer.dropEffect = "move";
    const sudahDibaca = Boolean(e.dataTransfer.types.includes("sudah-dibaca"));

    if (!e.dataTransfer.types.includes("book-id")) { return; }

    if ((type === "sudah" && !sudahDibaca) || (type === "belum" && sudahDibaca)) {
        e.target.querySelector("#book-placeholder").style.display = "inherit";
        dragFeedback.style.scale = 1.10;
        dragFeedback.style.opacity = 0.80;

        e.preventDefault();
    }

    e.stopPropagation();
}

function bookDrop(e, type) {
    const placeholder = e.target.querySelector("#book-placeholder");
    placeholder.style.display = "none";

    const bookId = e.dataTransfer.getData("book-id");
    const sudahDibaca = e.dataTransfer.getData("sudah-dibaca");

    const bookElement = document.querySelector(
        `#${type === "sudah" ? "belum" : "sudah"}-dibaca > #books > .book[book-id="${bookId}"]`
    );

    // we first clone the book

    const bookElementCloned = bookElement.cloneNode(true);
    bookElementCloned.classList.remove("dragged");

    // remove the book
    bookElement.remove();

    bookElementCloned.ondragstart = bookDragStart;
    bookElementCloned.ondrag = bookDrag;
    bookElementCloned.ondragend = bookDragEnd;
    
    bookElementCloned.onclick = (e) => {
        const content = bookElementCloned.querySelector("#content");
        if (content.classList.contains("show")) {
            content.classList.remove("show");
        } else {
            content.classList.add("show");
        }
    };

    // invert if we've read the book or not
    bookElementCloned.setAttribute("sudah-dibaca", !sudahDibaca);

    // and finally move the book to the destination
    e.target.insertBefore(bookElementCloned, placeholder);

    // then switch the rack on our storage
    switchRack(bookId);

    e.preventDefault();
}

const nothing = document.getElementById("nothing");
const dragFeedback = document.getElementById("drag-feedback");

const trash = document.getElementById("trash");

var dragOffset = [];

function bookDragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setDragImage(nothing, 0, 0);
    e.dataTransfer.setData("book-id", e.target.getAttribute("book-id"));

    const content = e.target.querySelector("#content");
    if (content.classList.contains("show")) {
        content.classList.remove("show");
    }
    
    if (e.target.getAttribute("sudah-dibaca") == "true") {
        e.dataTransfer.setData("sudah-dibaca", true);
    } else {
        e.dataTransfer.setData("belum-dibaca", true);
    }
    
    // create a shadow
    const shadow = e.target.cloneNode(true);
    shadow.style.height = `${e.target.clientHeight}px`;

    dragFeedback.classList.add("dragging");
    dragFeedback.append(shadow);

    dragOffset = [e.offsetX, e.offsetY];

    e.target.classList.add("dragged");
    trash.classList.add("show");
}

function bookDrag(e) {
    dragFeedback.style.translate = `${e.clientX - dragOffset[0]}px ${e.clientY - dragOffset[1]}px`;
}

function bookDragEnd(e) {
    dragFeedback.innerHTML = ""; // clear
    dragFeedback.classList.remove("dragging");

    dragFeedback.style.translate = "-9999px -9999px";

    e.target.classList.remove("dragged");
    trash.classList.remove("show");
}

function createBook(id, sudahDibaca, title, author, year) {
    const book = document.createElement("div");
    book.setAttribute("book-id", id);
    book.setAttribute("sudah-dibaca", sudahDibaca);
    book.setAttribute("draggable", true);

    book.ondragstart = bookDragStart;
    book.ondrag = bookDrag;
    book.ondragend = bookDragEnd;
    book.onclick = (e) => {
        const content = book.querySelector("#content");
        if (content.classList.contains("show")) {
            content.classList.remove("show");
        } else {
            content.classList.add("show");
        }
    };

    book.classList.add("book");

    const cover = document.createElement("div");
    cover.id = "cover";

    const eTitle = document.createElement("div");
    eTitle.innerText = title;
    eTitle.id = "title";

    cover.append(eTitle.cloneNode(true));

    const content = document.createElement("div");
    content.id = "content";
    
    const eAuthor = document.createElement("div");
    eAuthor.id = "author";
    eAuthor.innerText = author;

    const eYear = document.createElement("div");
    eYear.id = "year";
    eYear.innerText = year;

    content.append(eTitle, eAuthor, eYear);
    book.append(cover, content);

    return book;
}