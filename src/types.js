// @flow

import type { Sort, SortableColumns } from "./ColumnUtils.js";

// Entities
export type Id = number;
export type Song = {
    album: string,
    album_artist: string,
    artist: string,
    disc_number: ?number,
    id: Id,
    length: number,
    play_count: number,
    rating: number,
    title: string,
    track_number: ?number,
};

// Network and Routing
export type RequestParams = {
    [string]: mixed,
};
export type Request = {
    base_url: string,
    base_params: RequestParams,
};
export type RouteInfo =
    | {
          child_type: ChildType,
          child_key: ChildType,
          child_request: Request,
          child_page: number,
          child_sort_type: Sort,
          child_sort_column: SortableColumns,
          child_total_size: number,
      }
    | { child_type: "home", child_key: "home" };

// Other
export type ChildType = "home" | "album-list" | "artist-list" | "song-list";

export type EditType = "song" | "songs" | "card";
