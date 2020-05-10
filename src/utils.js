// @flow

import type { Song } from "./Types.js";

// ---------- component helpers ----------

// remove active tab from navbar
export function removeActiveNavbar(): void {
    const navbarItems = document.getElementsByClassName(
        "main-navbar-item active"
    );
    for (let i = 0; i < navbarItems.length; i++) {
        navbarItems[i].classList.remove("active");
    }
}

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

// determine the index of the next song to be played
export function getNextIndex(
    playlist: Array<{ id: number }>,
    current_index: number
): ?number {
    let next_index = current_index + 1;
    if (next_index >= playlist.length) {
        // wrap around at end
        next_index = 0;
    }

    if (playlist.length > 0) {
        return playlist[next_index].id;
    } else {
        return null;
    }
}

// ---------- formatting ----------

// turn seconds into MM:SS
export function formatTime(t: number): string {
    t = Math.floor(t);
    const minutes = Math.floor(t / 60);
    const seconds = t - minutes * 60;
    return minutes + ":" + str_pad_left(seconds, "0", 2);
}

// convert raw rating value to stars (1-5)
export function ratingToTier(value: number) {
    return Math.floor((value + 32) / 64) + 1;
}

/**
 * Shuffles array in place using the Fisher-Yates algorithm.
 * @param {Array} a items An array containing the items.
 * @param {id} an element index to place at the beginning of the array
 */
export function shuffle(a: Array<mixed>, id: number): Array<mixed> {
    let j, x, i, c;
    c = 0;

    // if id was specified, move that to the beginning
    if (id != null && id < a.length) {
        c = 1;
        x = a[id];
        a[id] = a[0];
        a[0] = x;
    }

    for (i = a.length - 1; i > 0; i--) {
        // if an id was specified, don't allow switching with first element
        j = Math.floor(Math.random() * (i + (1 - c)) + c);
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}
