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
  getDoc,
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
import GenreSelector, { GENRES } from "./GenreSelector";
import logo from "../assets/logo.jpg";
import Modal from "react-modal";

const Dashboard: React.FC = () => {
  console.log(getDocs);

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
  const [generatingCover, setGeneratingCover] = useState<boolean>(false);

  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchUserProfile = async (email: string) => {
    try {
      const userDocRef = doc(db, "users", email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data());
      } else {
        console.warn("User profile not found.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (user.email) {
          fetchUserProfile(user.email); // ✅ Safe call
        }
        fetchBooks(user);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

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

  const openModal = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCurrentBook({ ...currentBook, [name]: value });
  };

  const handleGenreChange = (value: string) => {
    setCurrentBook((prev) => ({ ...prev, genre: value }));
  };

  const generateCover = async () => {
    if (!currentBook.title) {
      toast.error("Please enter a book title.");
      return;
    }

    setGeneratingCover(true);

    try {
      const query = encodeURIComponent(currentBook.title);
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${query}`
      );
      const data = await response.json();

      if (data.docs && data.docs.length > 0) {
        const book = data.docs[0];
        if (book.cover_i) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;

          setCurrentBook({ ...currentBook, coverUrl });
          toast.success("Cover generated from Open Library!");
        } else {
          toast.error("No cover found for this book.");
        }
      } else {
        toast.error("Book not found on Open Library.");
      }
    } catch (error) {
      console.error("Error fetching from Open Library:", error);
      toast.error("Failed to fetch cover from Open Library.");
    } finally {
      setGeneratingCover(false);
    }
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
        dateRead:
          currentBook.dateRead || new Date().toISOString().split("T")[0],
      };

      const docRef = await addDoc(booksRef, newBook);
      console.log(docRef);
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

    const loadingToast = toast.loading("Updating your book...");

    try {
      const bookRef = doc(db, "users", user.uid, "books", editingId);
      await updateDoc(bookRef, currentBook);
      toast.success("Book updated successfully!", { id: loadingToast });
      resetForm();
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book. Please try again.", {
        id: loadingToast,
      });
    }
  };

  const deleteBook = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    const loadingToast = toast.loading("Deleting book...");
    try {
      await deleteDoc(doc(db, "users", user.uid, "books", id));
      toast.success("Book deleted successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book", { id: loadingToast });
    }
  };

  const editBook = (book: Book) => {
    setCurrentBook({ ...book });
    setEditingId(book.id);
    setShowForm(true);

    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector(".book-form-container");
      formElement?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
    auth.signOut().then(() => {
      navigate("/"); // redirects to the landing page
    });
  };

  const filteredBooks = books.filter((book) => {
    const matchGenre =
      !filterGenre || filterGenre === "all" || book.genre === filterGenre;

    const lowerSearchTerm = searchTerm.toLowerCase();

    const matchSearch =
      book.title.toLowerCase().includes(lowerSearchTerm) ||
      book.author.toLowerCase().includes(lowerSearchTerm) ||
      (book.notes && book.notes.toLowerCase().includes(lowerSearchTerm));

    return matchGenre && matchSearch;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "author") return a.author.localeCompare(b.author);
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime();
  });

  return (
    <div className="dashboard">
      <Toaster position="top-right" />
      <nav className="navbar">
        <div className="navbar-content">
          <div className="brand">
            <img src={logo} alt="BookNest Logo" className="brand-icon" />
            <h1 className="navbar-title">BookNest</h1>
          </div>
          <div className="user-controls">
            {user && userProfile && (
              <span className="user-greeting">
                Hello, {userProfile.firstName} {userProfile.lastName}.
              </span>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="book-tracker-container">
        <div className="book-tracker-content">
          <div className="dashboard-header">
            <h2 className="section-title">My Reading Collection</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="add-book-btn"
            >
              {showForm ? "Cancel" : "+ Add New Book"}
            </button>
          </div>

          <div className="search-filter-container">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6F4E37"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, author or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>
            <div className="filter-sort-container">
              <div className="select-wrapper">
                <label htmlFor="genre-filter">Genre:</label>
                <select
                  id="genre-filter"
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="all">All Genres</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-wrapper">
                <label htmlFor="sort-by">Sort by:</label>
                <select
                  id="sort-by"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="sort-dropdown"
                >
                  <option value="dateRead">Recent First</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>
          {books.length > 0 && filteredBooks.length === 0 && (
            <div className="no-books-message">
              No books found for the selected genre or search term.
            </div>
          )}
          <AnimatePresence>
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="book-form-container"
              >
                <h2 className="form-title">
                  {editingId ? "Edit Book" : "Add New Book"}
                </h2>
                <form
                  onSubmit={editingId ? updateBook : addBook}
                  className="book-form"
                >
                  <div className="form-grid">
                    <div className="form-column">
                      <div className="form-group">
                        <label htmlFor="title">Title*</label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={currentBook.title}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="author">Author*</label>
                        <input
                          type="text"
                          id="author"
                          name="author"
                          value={currentBook.author}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <GenreSelector
                          genre={currentBook.genre}
                          onChange={handleGenreChange}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group half">
                          <label htmlFor="dateRead">Date Read</label>
                          <input
                            type="date"
                            id="dateRead"
                            name="dateRead"
                            value={currentBook.dateRead}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group half">
                          <label htmlFor="rating">Rating (0-5)</label>
                          <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="0"
                            max="5"
                            value={currentBook.rating}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={currentBook.notes}
                          onChange={handleInputChange}
                          className="form-textarea"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="form-column cover-column">
                      <div className="form-group">
                        <label htmlFor="coverUrl">Cover Image</label>
                        <div className="cover-preview-container">
                          {currentBook.coverUrl ? (
                            <img
                              src={currentBook.coverUrl}
                              alt="Book cover preview"
                              className="cover-preview"
                            />
                          ) : (
                            <div className="cover-placeholder">
                              <svg
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#6F4E37"
                                strokeWidth="1"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <path d="M7 7h10M7 12h10M7 17h5" />
                              </svg>
                              <span>No cover</span>
                            </div>
                          )}
                        </div>

                        <div className="cover-actions">
                          <button
                            type="button"
                            onClick={generateCover}
                            className="generate-cover-btn"
                            disabled={generatingCover || !currentBook.title}
                          >
                            {generatingCover
                              ? "Generating..."
                              : "Generate Cover"}
                          </button>

                          <div className="url-input-container">
                            <input
                              type="text"
                              id="coverUrl"
                              name="coverUrl"
                              placeholder="Or paste image URL"
                              value={currentBook.coverUrl}
                              onChange={handleInputChange}
                              className="form-input"
                            />
                            {currentBook.coverUrl && (
                              <button
                                type="button"
                                className="clear-url"
                                onClick={() =>
                                  setCurrentBook({
                                    ...currentBook,
                                    coverUrl: "",
                                  })
                                }
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
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
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <Loader />
          ) : books.length === 0 && !showForm ? (
            <div className="empty-library">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6F4E37"
                strokeWidth="1"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="empty-list">
                Your BookNest is empty. Start by adding your first book!
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="add-first-book-btn"
                >
                  Add Your First Book
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="books-stats">
                <p className="books-count">
                  Showing <span>{sortedBooks.length}</span> of{" "}
                  <span>{books.length}</span> books
                </p>
                {filter !== "all" && (
                  <button
                    className="clear-filter"
                    onClick={() => setFilter("all")}
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="books-grid">
                <AnimatePresence>
                  {sortedBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      transition={{ duration: 0.2 }}
                    >
                      <BookCard
                        book={book}
                        onEdit={editBook}
                        onDelete={deleteBook}
                        onClick={openModal} // ✅ Makes book card clickable
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Book Details"
                className="book-modal"
                overlayClassName="book-modal-overlay"
              >
                {selectedBook && (
                  <div className="book-detail-content">
                    <button onClick={closeModal} className="close-modal-btn">
                      ×
                    </button>
                    <img
                      src={selectedBook.coverUrl}
                      alt={selectedBook.title}
                      className="modal-cover"
                    />
                    <h2>{selectedBook.title}</h2>
                    <p>
                      <strong>Author:</strong> {selectedBook.author}
                    </p>
                    <p>
                      <strong>Genre:</strong> {selectedBook.genre}
                    </p>
                    <p>
                      <strong>Rating:</strong> {selectedBook.rating} / 5
                    </p>
                    <p>
                      <strong>Notes:</strong> {selectedBook.notes}
                    </p>
                    <p>
                      <strong>Date Read:</strong> {selectedBook.dateRead}
                    </p>
                  </div>
                )}
              </Modal>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
