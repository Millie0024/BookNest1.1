// src/components/GenreSelector.tsx
import "../styles/GenreSelector.css";
import React from "react";

export const GENRES = [
  "Romance",
  "Action",
  "Adventure",
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Thriller",
  "Horror",
  "Historical Fiction",
  "Drama",
  "Biography",
  "Memoir",
  "Self-help",
  "Philosophy",
  "Poetry",
  "Classic",
  "Young Adult",
  "Children",
  "Comics",
  "Graphic Novel",
];

interface GenreSelectorProps {
  genre: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
  genre,
  onChange,
  required = false,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="genre">Genre</label>
      <select
        id="genre"
        value={genre}
        onChange={(e) => onChange(e.target.value)}
        className="genre-dropdown"
        required={required}
      >
        <option value="">Select a genre</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenreSelector;
