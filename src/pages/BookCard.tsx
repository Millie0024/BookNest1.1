import React from "react";
import "../styles/BookCard.css";
import { Book } from "../types/Book";

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onClick?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onEdit,
  onDelete,
  onClick,
}) => {
  // Format date for display with better handling
  const formatReadDate = (dateString: string) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Truncate text if too long
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Render stars for rating
  const renderRating = () => {
    return (
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
    );
  };

  const readDate = formatReadDate(book.dateRead);

  return (
    <div className="book-card" onClick={() => onClick?.(book)} role="listitem">
      {/* Cover Image Section */}
      <div className="book-cover-container">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="book-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.onerror = null;
              // Using a more book-themed placeholder with the book's title
              e.currentTarget.src = `https://via.placeholder.com/160x240/f9f7f5/6F4E37/?text=${encodeURIComponent(
                book.title
              )}`;
            }}
            loading="lazy"
          />
        ) : (
          <div className="book-cover-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6F4E37"
              strokeWidth="1.5"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{book.title}</span>
          </div>
        )}

        {book.genre && <span className="book-genre-badge">{book.genre}</span>}
      </div>

      {/* Book Details Section */}
      <div className="book-info">
        <h3 className="book-title" title={book.title}>
          {truncateText(book.title, 50)}
        </h3>

        <p className="book-author" title={book.author}>
          by {truncateText(book.author, 40)}
        </p>

        {/* Conditional Notes Preview */}
        {book.notes && (
          <div className="book-notes-preview">
            {truncateText(book.notes, 80)}
          </div>
        )}

        {/* Meta Information Row */}
        <div className="book-meta">
          {book.rating > 0 && renderRating()}
          {readDate && <span className="book-date">{readDate}</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="book-actions">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents triggering parent click (like opening a modal)
            onEdit(book); // Call the edit function
          }}
          className="edit-btn"
          aria-label={`Edit ${book.title}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Edit</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents triggering the card's onClick (e.g., opening modal)
            onDelete(book.id); // Executes the delete action
          }}
          className="delete-btn"
          aria-label={`Delete ${book.title}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default BookCard;
