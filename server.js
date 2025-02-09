const express = require("express") //using express module
const app = express() //import express module into app
const fs = require("node:fs") //node file module
app.use(express.json()) //express module to parse JSON badies
 
//define port
const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

//define database file
const filePath = "book.json"

// read data from file
const readData = () => {
    const jsonData = fs.readFileSync(filePath)
    return JSON.parse(jsonData)
}

// write data to file
const writeData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// no empty fields
const isEmpty = (newBook) => {
    if (!newBook.title || !newBook.author || !newBook.year || !newBook.genre || !newBook.pages) {
        return true
    }
    return false
}

// read
app.get("/", (req, res) => {
    const data = readData()
    if (data) {
        res.json(data)
    }
    else {
        res.json([])
    }
})

// read by categories
app.get("/books", (req, res) => {
    const { genre, year } = req.query
    let books = readData()

    // Get books by genre
    if (genre) {
        books = books.filter((book) => book.genre.toLowerCase() === genre.toLowerCase())
    }

    // Get books by year
    if (year) {
        books = books.filter((book) => book.year === Number(year))
    }

    if (books.length === 0) {
        res.status(404).send("Books not found!")
    }

    res.json(books)
})

// create
app.post("/", (req, res) => {
    const newBook = req.body
    let books = readData()

    const duplicateBook = books.find((book) => book.title === newBook.title)
    if (duplicateBook) {
        return res.status(400).json({ message: "Please do not duplicate book title!" })
    }

    if (isEmpty(newBook)) {
        return res.status(400).json({
            message: "Please complete all fields: title, author, year, genre, pages."
        })
    }

    newBook.id = books.length > 0 ? books.length + 1 : 1
    books = [...books, newBook]
    fs.writeFileSync(filePath, JSON.stringify(books, null, 2))
    res.json(books)
})

// update - param
app.put("/:bookId", (req, res) => {
    const { bookId } = req.params
    const { title, author, year, genre, pages } = req.body
    let books = readData()

    const findBook = books.find((book) => book.id === Number(bookId))
    if (findBook) {
        if (!title || !author || !year || !genre || !pages) {
            return res.status(400).json({
                message: "Please complete all fields: title, author, year, genre, pages."
            })
        }
        else {
            books = books.map((book) => {
                if (book.id === Number(bookId)) {
                    return { ...book, title, author, year, genre, pages }
                }
                return book
            })
            writeData(books)
            res.json({ success: true, books })
        }
    } else {
        return res.status(404).send("Book not found!")
    }
})

// delete - params
app.delete("/:bookId", (req, res) => {
    const { bookId } = req.params
    let books = readData()

    const findBook = books.find((book) => book.id === Number(bookId))
    if (findBook) {
        books = books.filter((book) => book.id !== Number(bookId))
        writeData(books)
        res.status(204).json(books)
    } else {
        res.status(404).send("Book not found!")
    }
})
