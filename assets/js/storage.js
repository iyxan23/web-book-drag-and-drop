/* localStorage:
 * {"books":"[{ ... }, { ... }]"}
 */

// retrieve the books
onload = () => {
    if (localStorage["books"] === undefined) {
        localStorage["books"] = JSON.stringify([]);
    }

    const data = JSON.parse(localStorage["books"]);

    for (const book of data) {
        const elem = createBook(book.id, book.isComplete, book.title, book.author, book.year);

        if (book.isComplete) {
            insertStart(sudahDibacaBooks, elem);
        } else {
            insertStart(belumDibacaBooks, elem);
        }
    }
};

function addBook(obj) {
    obj.id = +new Date();

    const books = JSON.parse(localStorage["books"]);
    books.push(obj);
    localStorage["books"] = JSON.stringify(books);

    insertStart(
        obj.isComplete ? sudahDibacaBooks : belumDibacaBooks,
        createBook(obj.id, obj.isComplete, obj.title, obj.author, obj.year)
    );
}

function removeBook(id) {
    let books = JSON.parse(localStorage["books"]);
    books = books.filter(item => item.id != id);
    localStorage["books"] = JSON.stringify(books);
}

function switchRack(id) {
    let books = JSON.parse(localStorage["books"]);
    books = books.map(item => item.id == id ? { ...item, isComplete: !item.isComplete } : item);
    localStorage["books"] = JSON.stringify(books);
}