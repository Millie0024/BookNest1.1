import React from "react";
import "../styles/BookCard.css";
import { Book } from "../types/Book"; // Prefer importing Book type from a shared type file

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  return (
    <div className="book-card" role="listitem">
      <div className="book-cover-container">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="book-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/api/placeholder/160/240";
            }}
          />
        ) : (
          <div className="book-cover-placeholder">
            <span>No Cover Image</span>
          </div>
        )}
      </div>

      <div className="book-details">
        <div className="book-header">
          <h3 className="book-title">{book.title}</h3>
          <div
            className="book-rating"
            aria-label={`Rating: ${book.rating} out of 5 stars`}
          >
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={i < book.rating ? "star-filled" : "star-empty"}
                aria-hidden="true"
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <p className="book-author">by {book.author}</p>

        {book.genre && <span className="book-genre">{book.genre}</span>}

        {book.dateRead && (
          <p className="book-date">
            Read on: {new Date(book.dateRead).toLocaleDateString()}
          </p>
        )}

        {book.notes && (
          <div className="book-notes">
            <p>{book.notes}</p>
          </div>
        )}

        <div className="book-actions">
          <button
            onClick={() => onEdit(book)}
            className="edit-btn"
            aria-label={`Edit ${book.title}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="delete-btn"
            aria-label={`Delete ${book.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
