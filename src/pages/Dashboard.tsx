import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import BookCard from "./BookCard";
import "../styles/Dashboard.css";
import { Book } from "../types/Book";
import { app } from "../firebase";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentBook, setCurrentBook] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
    genre: "",
    rating: 0,
    dateRead: "",
    notes: "",
    coverUrl: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("dateRead");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchBooks(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchBooks = async (user: any) => {
    const booksRef = collection(db, "users", user.uid, "books");
    onSnapshot(booksRef, (snapshot) => {
      const userBooks: Book[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Book, "id">),
      }));
      setBooks(userBooks);
      setLoading(false);
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCurrentBook({ ...currentBook, [name]: value });
  };

  const generateCover = (title: string) => {
    return `https://source.unsplash.com/featured/?book,${encodeURIComponent(
      title
    )}`;
  };

  const addBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("User not authenticated.");
      return;
    }

    const loadingToast = toast.loading("Adding your book...");

    try {
      const booksRef = collection(db, "users", user.uid, "books");
      const newBook = {
        ...currentBook,
        coverUrl: currentBook.coverUrl || generateCover(currentBook.title),
        dateRead:
          currentBook.dateRead || new Date().toISOString().split("T")[0],
      };

      const docRef = await addDoc(booksRef, newBook);

      toast.success("Book added successfully!", { id: loadingToast });

      resetForm();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add book. Please try again.", {
        id: loadingToast,
      });
    }
  };

  const updateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingId) return;

    const bookRef = doc(db, "users", user.uid, "books", editingId);
    await updateDoc(bookRef, currentBook);
    toast.success("Book updated!");
    resetForm();
  };

  const deleteBook = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    await deleteDoc(doc(db, "users", user.uid, "books", id));
    toast.success("Book deleted!");
  };

  const editBook = (book: Book) => {
    setCurrentBook({ ...book });
    setEditingId(book.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setCurrentBook({
      title: "",
      author: "",
      genre: "",
      rating: 0,
      dateRead: "",
      notes: "",
      coverUrl: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const filteredBooks = books.filter((book) => {
    const matchGenre = filter === "all" || book.genre === filter;
    const matchSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchGenre && matchSearch;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "author") return a.author.localeCompare(b.author);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime();
  });

  const genres = [
    "all",
    ...Array.from(new Set(books.map((book) => book.genre).filter(Boolean))),
  ];

  return (
    <div className="dashboard">
      <Toaster position="top-right" />
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">My Book Tracker</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="book-tracker-container">
        <div className="book-tracker-content">
          <div className="controls-container">
            <button
              onClick={() => setShowForm(!showForm)}
              className="add-book-btn"
            >
              {showForm ? "Cancel" : "+ Add New Book"}
            </button>

            <div className="search-filter-container">
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />

              <div className="filter-sort-container">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-dropdown"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre === "all" ? "All Genres" : genre}
                    </option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="sort-dropdown"
                >
                  <option value="dateRead">Date Read</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={editingId ? updateBook : addBook}
                className="book-form-container"
              >
                <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
                <div className="form-grid">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title*"
                    value={currentBook.title}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="author"
                    placeholder="Author*"
                    value={currentBook.author}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="genre"
                    placeholder="Genre"
                    value={currentBook.genre}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="date"
                    name="dateRead"
                    value={currentBook.dateRead}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="number"
                    name="rating"
                    placeholder="Rating (0-5)"
                    min="0"
                    max="5"
                    value={currentBook.rating}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <input
                    type="text"
                    name="coverUrl"
                    placeholder="Cover Image URL"
                    value={currentBook.coverUrl}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                  <textarea
                    name="notes"
                    placeholder="Notes"
                    value={currentBook.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingId ? "Update Book" : "Add Book"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {loading ? (
            <Loader />
          ) : books.length === 0 ? (
            <p className="empty-list">
              No books added yet. Start by adding one!
            </p>
          ) : (
            <>
              <p className="books-count">
                Showing {sortedBooks.length} of {books.length} books
              </p>
              <div className="books-grid">
                {sortedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onEdit={editBook}
                    onDelete={deleteBook}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
