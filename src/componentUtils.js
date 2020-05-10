// @flow

import type { Song } from "./types.js";

// given a list of songs, only return the subset of rows that are selected in the UI.
export function getSelectedSongs(list: Array<Song>): Array<Song> {
    const selected: any = document.getElementsByClassName("table-selected");
    const songs = [];
    for (let i = 0; i < selected.length; i++) {
        const index = selected[i].rowIndex - 1;
        songs.push(list[index]);
    }
    return songs;
}
