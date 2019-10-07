// @flow

import type { Sort, SortableColumns } from "./column_types.js";

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

export type ChildType = "welcome" | "album-list" | "artist-list" | "song-list";

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
    | { child_type: "welcome", child_key: "welcome" };

export type EditType = "song" | "songs" | "card";
