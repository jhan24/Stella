// @flow

export type Sort = "ASC" | "DESC";
export type SortableColumns =
    | "album"
    | "album_artist"
    | "artist"
    | "disc_number"
    | "length"
    | "play_count"
    | "rating"
    | "title"
    | "track_number";

export type ColumnObject = {
    type: number,
    availability: 0 | 1 | 2,
    name: string,
};

export type Column =
    | "search"
    | "title"
    | "title_alt"
    | "artist"
    | "artist_alt"
    | "album_artist"
    | "album_artist_alt"
    | "album"
    | "album_alt"
    | "composer"
    | "composer_alt"
    | "publisher"
    | "publisher_alt"
    | "track_number"
    | "track_total"
    | "disc_number"
    | "disc_total"
    | "year"
    | "genre"
    | "rating"
    | "created_at"
    | "updated_at"
    | "play_count"
    | "image";

// type 0: string, 1: int, 2: date
// availability 0: always, 1: alt_specific
export const column_objects: { [Column]: ColumnObject } = {
    search: {
        type: 0,
        availability: 0,
        name: "General Search",
    },
    title: {
        type: 0,
        availability: 0,
        name: "Title",
    },
    title_alt: {
        type: 0,
        availability: 1,
        name: "Alternate Title",
    },
    artist: {
        type: 0,
        availability: 0,
        name: "Artist",
    },
    artist_alt: {
        type: 0,
        availability: 1,
        name: "Alternate Artist",
    },
    album_artist: {
        type: 0,
        availability: 0,
        name: "Album Artist",
    },
    album_artist_alt: {
        type: 0,
        availability: 1,
        name: "Alternate Album Artist",
    },
    album: {
        type: 0,
        availability: 0,
        name: "Album",
    },
    album_alt: {
        type: 0,
        availability: 1,
        name: "Alternate Album",
    },
    composer: {
        type: 0,
        availability: 0,
        name: "Composer",
    },
    composer_alt: {
        type: 0,
        availability: 1,
        name: "Alternate Composer",
    },
    publisher: {
        type: 0,
        availability: 0,
        name: "Publisher",
    },
    publisher_alt: {
        type: 0,
        availability: 1,
        name: "Alternate Publisher",
    },
    track_number: {
        type: 1,
        availability: 0,
        name: "Track Number",
    },
    track_total: {
        type: 1,
        availability: 0,
        name: "Track Total",
    },
    disc_number: {
        type: 1,
        availability: 0,
        name: "Disc Number",
    },
    disc_total: {
        type: 1,
        availability: 0,
        name: "Disc Total",
    },
    year: {
        type: 1,
        availability: 0,
        name: "Year",
    },
    genre: {
        type: 0,
        availability: 0,
        name: "Genre",
    },
    rating: {
        type: 1,
        availability: 0,
        name: "Rating",
    },
    created_at: {
        type: 2,
        availability: 0,
        name: "Created At",
    },
    updated_at: {
        type: 2,
        availability: 0,
        name: "Updated At",
    },
    play_count: {
        type: 1,
        availability: 0,
        name: "Play Count",
    },
    image: {
        type: 5,
        availability: 2,
        name: "Album Artwork",
    },
};

export const editable_columns: Array<Column> = [
    "title",
    "title_alt",
    "artist",
    "artist_alt",
    "album_artist",
    "album_artist_alt",
    "album",
    "album_alt",
    "composer",
    "composer_alt",
    "publisher",
    "publisher_alt",
    "track_number",
    "track_total",
    "disc_number",
    "disc_total",
    "year",
    "genre",
    "rating",
    "image",
];

export const propagating_columns: Array<Column> = [
    "title",
    "artist",
    "album",
    "rating",
];

export const searchable_columns: Array<Column> = [
    "search",
    "title",
    "title_alt",
    "artist",
    "artist_alt",
    "album_artist",
    "album_artist_alt",
    "album",
    "album_alt",
    "composer",
    "composer_alt",
    "publisher",
    "publisher_alt",
    "year",
    "genre",
    "rating",
    "created_at",
    "updated_at",
    "play_count",
];
