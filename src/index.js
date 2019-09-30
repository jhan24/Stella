/*
 * FRONTEND MAJOR TODOS:
 *
 * 1. Preload songs (and strip them of metadata on back-end side)
 * 2. Allow advanced search results to be displayed as Albums/Artists
 *    (and add order by for albums, strict_artist for artist)
 *
 * Refactor/make code more efficient and readable overall
 *
 */

// Library imports
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Route, withRouter } from "react-router-dom";
import axios from "axios";
import "./styles.css";

// Project utility imports
import {
    column_objects,
    editable_columns,
    propagating_columns,
    searchable_columns,
} from "./columns.js";
import {
    formatTime,
    getNextIndex,
    removeActiveNavbar,
    shuffle,
} from "./utils.js";
import { getSelectedRows } from "./componentUtils.js";

// React components
import Navbar from "./Navbar.js";

let playlistCount = 0;
let playlistTicking = false;

axios.defaults.baseURL = "http://stella.test";
const activeColor = "#91BBFF";
const inactiveColor = "black";

const pageLength = 50;
const maxPlaylistSize = 500;

// SHARED SONG LIST FUNCTIONS ==============================================
const tableRowSelect = (event, table_type, row_class) => {
    if (
        document.getElementsByClassName(
            "table-selected pivot-selection " + row_class
        ).length > 0
    ) {
        if (!event.ctrlKey && !event.shiftKey) {
            // normal select = clear all selected, and select current and only current (also make it pivot)
            let selected = document.getElementsByClassName("table-selected");
            while (selected.length > 0) {
                selected[0].classList.remove("table-selected");
            }
            let pivot = document.getElementsByClassName("pivot-selection");
            while (pivot.length > 0) {
                pivot[0].classList.remove("pivot-selection");
            }
            event.currentTarget.classList.add("table-selected");
            event.currentTarget.classList.add("pivot-selection");
        } else if (event.ctrlKey) {
            // if control click, toggle the element's selected property
            event.currentTarget.classList.toggle("table-selected");
        } else if (event.shiftKey) {
            // if shift click, select all the elements from pivot to current inclusive
            let pivotIndex = document.getElementsByClassName(
                "pivot-selection"
            )[0].rowIndex;
            let currentIndex = event.currentTarget.rowIndex;
            let table = document.getElementById(table_type);
            let low = currentIndex;
            let high = pivotIndex;

            let selected = document.getElementsByClassName("table-selected");
            while (selected.length > 0) {
                selected[0].classList.remove("table-selected");
            }

            if (currentIndex > pivotIndex) {
                low = pivotIndex;
                high = currentIndex;
            }
            for (let i = low; i <= high; i++) {
                table.rows[i].classList.add("table-selected");
            }
        }
    } else {
        // first clear all (there could be things selected in other tables)
        let selected = document.getElementsByClassName("table-selected");
        while (selected.length > 0) {
            selected[0].classList.remove("table-selected");
        }
        let pivot = document.getElementsByClassName("pivot-selection");
        while (pivot.length > 0) {
            pivot[0].classList.remove("pivot-selection");
        }

        // nothing selected before, we select the current object and make it the pivot (for use on shift click)
        event.currentTarget.classList.add("table-selected");
        event.currentTarget.classList.add("pivot-selection");
    }

    // update nav-bar if necessary
    let selected = document.getElementsByClassName("table-selected");
    let selected_navbar = document.getElementById("selected-navbar");
    if (selected.length > 1) {
        document.getElementById("selected-counter").innerHTML =
            selected.length + " Selected";
        selected_navbar.style.pointerEvents = "auto";
        selected_navbar.style.opacity = 100;
    } else {
        selected_navbar.style.pointerEvents = "none";
        selected_navbar.style.opacity = 0;
    }

    // clear navbar rating stars
    let rating_stars = document.getElementsByClassName("navbar-rating");
    for (let i = 0; i < rating_stars.length; i++) {
        rating_stars[i].innerHTML = "star_border";
    }
};

const showSongDropdown = (event, target_id, top, left, position) => {
    // get status of dropdown in question
    let current = document.getElementById(target_id);
    if (current == null) {
        return;
    }

    let status = 0;
    if (current.classList.contains("show")) {
        status = 1;
    }

    if (top != null) {
        current.style.top = top;
        current.style.left = left;
        current.style.position = position;
    }

    // hide all dropdowns
    removeDropdowns();

    // toggle current one accordingly
    if (status === 0) {
        current.classList.toggle("show");
    }
};

const removeDropdowns = () => {
    let dropdowns = document.getElementsByClassName("dropdown-menu show");
    while (dropdowns.length > 0) {
        dropdowns[0].classList.remove("show");
    }
};

const renderContextMenu = (event, type, row_type) => {
    // hide other dropdowns before displaying context menu
    let dropdowns = document.getElementsByClassName("dropdown-menu show");
    while (dropdowns.length > 0) {
        dropdowns[0].classList.remove("show");
    }

    let contextMenu = null;
    // check if right-clicked target is table-selected. if so, use the current table-selections
    if (
        event.currentTarget != null &&
        event.currentTarget.classList.contains("table-selected")
    ) {
        // get number of selected items - if 0, display nothing. if 1, display single-menu options. if multiple, display multi-menu options
        let selected = document.getElementsByClassName(
            "table-selected " + row_type
        );
        if (selected.length === 1) {
            contextMenu = document.getElementById(
                type + "-single-context-menu"
            );
        } else {
            contextMenu = document.getElementById(type + "-multi-context-menu");
        }
    } else {
        // current target is not table-selected, thus, make it table-selected and clear all other selections
        let selected = document.getElementsByClassName("table-selected");
        while (selected.length > 0) {
            selected[0].classList.remove("table-selected");
        }
        event.currentTarget.classList.add("table-selected");
        contextMenu = document.getElementById(type + "-single-context-menu");
    }

    // move context menu to cursor position, then display
    contextMenu.style.left = event.clientX - 10 + "px";
    contextMenu.style.top = event.clientY + 10 + "px";
    contextMenu.classList.add("show");
};

// REACT COMPONENTS ========================================================================================
class WelcomeTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "Welcome",
        };
    }
    render() {
        const text = this.state.text;
        return <div style={{ margin: 5 }}>{text}</div>;
    }
}

class Song extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hovering: false,
        };
    }

    onMouseOver = event => {
        this.setState({ hovering: true });
    };
    onMouseOut = event => {
        this.setState({ hovering: false });
    };
    onPlayClick = event => {
        this.props.onSongPlay(this.props.position);
    };
    addNext = event => {
        this.props.addToPlaylist([this.props.song_info], 1);
    };
    addQueue = event => {
        this.props.addToPlaylist([this.props.song_info], 0);
    };
    editInfo = event => {
        this.props.editInfo("song", [this.props.song_info]);
    };
    showMenu = event => {
        showSongDropdown(
            event,
            "song-dropdown-menu-" + this.props.song_info.id
        );
    };
    onClick = event => {
        tableRowSelect(event, "song-table", "song-row");
    };
    updateRating = new_rating => event => {
        this.props.updateRatings(new_rating, [this.props.song_info.id]);
    };
    onAlbumLink = event => {
        if (this.props.album_view !== true) {
            this.props.albumClick(
                this.props.song_info.album,
                this.props.song_info.album_artist
            );
        }
    };
    onArtistLink = event => {
        this.props.artistClick(this.props.song_info.artist);
    };
    render() {
        const song_info = this.props.song_info;
        // first column shows either the position in the list or the play button
        const firstColumn = this.state.hovering ? (
            <i
                onClick={this.onPlayClick}
                className="material-icons song-icon-button"
            >
                play_arrow
            </i>
        ) : this.props.album_view ? (
            song_info.track_number
        ) : (
            this.props.position + 1 + this.props.page * pageLength
        );
        // menu with playlist options and jump-to options (NOT YET IMPLEMENTED)
        const menuColumn = this.state.hovering ? (
            <a role="button" id="dropdownMenuSong" onClick={this.showMenu}>
                <i className="material-icons song-icon-button dropdown-button">
                    more_vert
                </i>
            </a>
        ) : (
            <a role="button" id="dropdownMenuSong" style={{ display: "none" }}>
                <i className="material-icons song-icon-button dropdown-button">
                    more_vert
                </i>
            </a>
        );
        const stars = [
            "star_border",
            "star_border",
            "star_border",
            "star_border",
            "star_border",
        ];
        let rating = Math.floor((song_info.rating + 32) / 64) + 1;
        for (let i = 0; i < rating; i++) {
            stars[i] = "star";
        }
        return (
            <tr
                id={"song-item-" + song_info.id}
                className={"song-row song-id-" + song_info.id}
                style={{
                    backgroundColor: this.state.hovering
                        ? "rgba(0,0,0,.075)"
                        : "rgba(0,0,0,0)",
                }}
                onMouseEnter={this.onMouseOver}
                onMouseLeave={this.onMouseOut}
                onClick={this.onClick}
                onContextMenu={this.props.onContextMenu}
            >
                <td style={{ overflow: "hidden", position: "relative" }}>
                    {firstColumn}
                </td>
                <td style={{ overflow: "hidden" }}>{song_info.title}</td>
                <td className="dropdown">
                    <div
                        id={"song-dropdown-menu-" + song_info.id}
                        className="dropdown-menu"
                        style={{ top: "75%", zIndex: 2 }}
                        aria-labelledby="dropdownMenuSong"
                    >
                        <a onClick={this.addNext} className="dropdown-item">
                            Play Next
                        </a>
                        <a onClick={this.addQueue} className="dropdown-item">
                            Add to Queue
                        </a>
                        <a onClick={this.editInfo} className="dropdown-item">
                            Edit Info
                        </a>
                    </div>
                    {menuColumn}
                </td>
                <td style={{ overflow: "hidden" }}>
                    {formatTime(song_info.length)}
                </td>
                <td style={{ overflow: "hidden" }}>
                    <span
                        className="detail-page-link"
                        onClick={this.onArtistLink}
                    >
                        {song_info.artist}
                    </span>
                </td>
                <td style={{ overflow: "hidden" }}>
                    <span
                        className={
                            this.props.album_view ? "" : "detail-page-link"
                        }
                        onClick={this.onAlbumLink}
                    >
                        {song_info.album}
                    </span>
                </td>
                <td style={{ overflow: "hidden", position: "relative" }}>
                    <i
                        onClick={this.updateRating(1)}
                        className="material-icons song-icon-button"
                        style={{ left: 0 }}
                    >
                        {stars[0]}
                    </i>
                    <i
                        onClick={this.updateRating(64)}
                        className="material-icons song-icon-button"
                        style={{ left: 20 }}
                    >
                        {stars[1]}
                    </i>
                    <i
                        onClick={this.updateRating(128)}
                        className="material-icons song-icon-button"
                        style={{ left: 40 }}
                    >
                        {stars[2]}
                    </i>
                    <i
                        onClick={this.updateRating(196)}
                        className="material-icons song-icon-button"
                        style={{ left: 60 }}
                    >
                        {stars[3]}
                    </i>
                    <i
                        onClick={this.updateRating(255)}
                        className="material-icons song-icon-button"
                        style={{ left: 80 }}
                    >
                        {stars[4]}
                    </i>
                </td>
                <td style={{ overflow: "hidden" }}>{song_info.play_count}</td>
            </tr>
        );
    }
}

class AlbumDescription extends React.Component {
    artistClick = event => {
        this.props.artistClick(this.props.song.album_artist);
    };
    openImage = event => {
        if (this.props.song.image_id != null) {
            window.open(
                axios.defaults.baseURL +
                    "/api/song/" +
                    this.props.song.image_id +
                    "/picture?size=1000"
            );
        }
    };
    render() {
        let song = this.props.song;
        return (
            <div
                style={{
                    height: 250,
                    width: "100%",
                    position: "relative",
                    backgroundColor: "#F8F8F8",
                }}
            >
                <div
                    onClick={this.openImage}
                    style={{
                        cursor: "pointer",
                        position: "absolute",
                        height: 200,
                        width: 198,
                        top: 25,
                        left: 25,
                        overflow: "hidden",
                        border: "1px solid #D5D5D5",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                        backgroundImage:
                            song.image_id == null
                                ? "url('test.jpg')"
                                : "url('" +
                                  axios.defaults.baseURL +
                                  "/api/song/" +
                                  song.image_id +
                                  "/picture?size=200')",
                    }}
                />
                <div
                    style={{
                        width: "calc(100% - 300px)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 40,
                        left: 235,
                        fontSize: "1.8rem",
                    }}
                >
                    <span>{song.album}</span>
                    <span color="gray">
                        {song.album_alt ? " / " + song.album_alt : ""}
                    </span>
                </div>
                <div
                    style={{
                        width: "calc(100% - 300px)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 80,
                        left: 236,
                        fontSize: "1rem",
                    }}
                >
                    <span
                        className="detail-page-link"
                        onClick={this.artistClick}
                    >
                        {song.album_artist}
                    </span>
                    <span style={{ color: "gray" }}>
                        {song.album_artist_alt
                            ? " / " + song.album_artist_alt
                            : ""}
                    </span>
                </div>
                <div
                    style={{
                        width: "calc(100% - 300px)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 105,
                        left: 236,
                        fontSize: "1rem",
                        color: "gray",
                    }}
                >
                    <span>{this.props.total_size + " songs"}</span>
                    <span>
                        {this.props.total_size > pageLength
                            ? ""
                            : " • " + formatTime(this.props.total_length)}
                    </span>
                    <span>{song.year != null ? " • " + song.year : ""}</span>
                    <span>{song.genre !== "" ? " • " + song.genre : ""}</span>
                </div>
            </div>
        );
    }
}

class SongList extends React.Component {
    onSongPlay = position => {
        this.props.generatePlaylist(
            position,
            this.props.page,
            this.props.total_size,
            this.props.request,
            this.props.data.data
        );
    };
    addNext = event => {
        this.props.addToPlaylist(getSelectedRows(this.props.data.data), 1);
    };
    addQueue = event => {
        this.props.addToPlaylist(getSelectedRows(this.props.data.data), 0);
    };
    editInfo = event => {
        this.props.editInfo("song", getSelectedRows(this.props.data.data));
    };
    addAllToPlaylist = method => event => {
        if (
            this.props.total_size > pageLength &&
            this.props.data.data.length > 0
        ) {
            this.props.addAllToPlaylist(method);
        } else {
            this.props.addToPlaylist(this.props.data.data, method);
        }
    };
    editAllInfo = event => {
        this.props.editInfo("songs", null);
    };
    onContextMenu = event => {
        event.preventDefault();
        renderContextMenu(event, "song", "song-row");
    };
    updateRatings = (new_rating, ids) => {
        this.props.updateRatings(new_rating, ids);
    };
    showMenu = event => {
        showSongDropdown(event, "full-dropdown-menu");
    };
    render() {
        const songs = this.props.data.data;

        // create the song elements
        let trs = [];
        let total_length = 0;
        for (let i = 0; i < songs.length; i++) {
            trs.push(
                <Song
                    key={songs[i].id}
                    song_info={songs[i]}
                    position={i}
                    onSongPlay={this.onSongPlay}
                    page={this.props.page}
                    album_view={this.props.album_view}
                    addToPlaylist={this.props.addToPlaylist}
                    onContextMenu={this.onContextMenu}
                    updateRatings={this.updateRatings}
                    albumClick={this.props.albumClick}
                    artistClick={this.props.artistClick}
                    editInfo={this.props.editInfo}
                />
            );
            total_length = total_length + songs[i].length;
        }

        // create the pagination elements
        let lis = [];
        for (let i = 0; i < this.props.total_size; i = i + pageLength) {
            let current_page = Math.floor(i / pageLength);
            let classes = "page-item";
            if (this.props.page === current_page) {
                classes = classes + " active";
            }
            lis.push(
                <li key={current_page} className={classes}>
                    <a
                        className="page-link"
                        style={{ cursor: "pointer" }}
                        onClick={this.props.onPageUpdate(current_page, false)}
                    >
                        {current_page + 1}
                    </a>
                </li>
            );
        }

        let album_description = null;
        if (this.props.album_view === true && songs.length > 0) {
            album_description = (
                <AlbumDescription
                    song={songs[0]}
                    total_length={total_length}
                    total_size={this.props.total_size}
                    addAllToPlaylist={this.addAllToPlaylist}
                    artistClick={this.props.artistClick}
                />
            );
        }

        // add bar for artist description if this is an artist detail page
        let artist_description = null;
        if (this.props.artistDetails != null) {
            artist_description = (
                <ArtistDescription
                    artistDetails={this.props.artistDetails}
                    addAllToPlaylist={this.props.addAllToPlaylist}
                    artistSongs={this.props.artistSongs}
                    albums={this.props.albums}
                />
            );
        }

        let edit_info = null;
        if (this.props.total_size < 100) {
            edit_info = (
                <a onClick={this.editAllInfo} className="dropdown-item">
                    Edit All Info
                </a>
            );
        }

        return (
            <div>
                <div
                    id="song-multi-context-menu"
                    className="dropdown-menu"
                    style={{ position: "fixed", zIndex: 2 }}
                >
                    <a onClick={this.addNext} className="dropdown-item">
                        Play Next
                    </a>
                    <a onClick={this.addQueue} className="dropdown-item">
                        Add to Queue
                    </a>
                    <a onClick={this.editInfo} className="dropdown-item">
                        Edit Info
                    </a>
                </div>
                <div
                    id="song-single-context-menu"
                    className="dropdown-menu"
                    style={{ position: "fixed", zIndex: 2 }}
                >
                    <a onClick={this.addNext} className="dropdown-item">
                        Play Next
                    </a>
                    <a onClick={this.addQueue} className="dropdown-item">
                        Add to Queue
                    </a>
                    <a onClick={this.editInfo} className="dropdown-item">
                        Edit Info
                    </a>
                </div>
                {album_description}
                {artist_description}
                <table
                    id="song-table"
                    className="table"
                    style={{
                        whiteSpace: "nowrap",
                        tableLayout: "fixed",
                        minWidth: 100,
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ width: 80 }} scope="col">
                                #
                            </th>
                            <th
                                onClick={this.props.onSort("title")}
                                style={{
                                    overflow: "hidden",
                                    cursor: "pointer",
                                }}
                                scope="col"
                            >
                                Title
                            </th>
                            <th style={{ width: 40 }} scope="col">
                                <div
                                    style={{
                                        position: "relative",
                                        top: -25,
                                        left: -11,
                                    }}
                                >
                                    <a
                                        role="button"
                                        id="dropdownMenuSong"
                                        onClick={this.showMenu}
                                    >
                                        <i className="material-icons song-icon-button dropdown-button">
                                            more_vert
                                        </i>
                                    </a>
                                    <div
                                        id={"full-dropdown-menu"}
                                        className="dropdown-menu"
                                        style={{
                                            position: "absolute",
                                            top: 25,
                                            zIndex: 2,
                                        }}
                                        aria-labelledby="dropdownMenuSong"
                                    >
                                        <a
                                            onClick={this.addAllToPlaylist(1)}
                                            className="dropdown-item"
                                        >
                                            Play all Next
                                        </a>
                                        <a
                                            onClick={this.addAllToPlaylist(0)}
                                            className="dropdown-item"
                                        >
                                            Add all to Queue
                                        </a>
                                        {edit_info}
                                    </div>
                                </div>
                            </th>
                            <th
                                onClick={this.props.onSort("length")}
                                style={{
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    width: 50,
                                    paddingBottom: "0.45em",
                                    paddingLeft: "1em",
                                }}
                                scope="col"
                            >
                                <i
                                    className="material-icons"
                                    style={{ fontSize: 24, top: 5 }}
                                >
                                    schedule
                                </i>
                            </th>
                            <th
                                onClick={this.props.onSort("artist")}
                                style={{
                                    overflow: "hidden",
                                    cursor: "pointer",
                                }}
                                scope="col"
                            >
                                Artist
                            </th>
                            <th
                                onClick={this.props.onSort("album")}
                                style={{
                                    overflow: "hidden",
                                    cursor: "pointer",
                                }}
                                scope="col"
                            >
                                Album
                            </th>
                            <th
                                onClick={this.props.onSort("rating")}
                                style={{
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    width: 130,
                                    paddingBottom: "0.45em",
                                    paddingLeft: "2.6em",
                                }}
                                scope="col"
                            >
                                <i
                                    className="material-icons"
                                    style={{ fontSize: 20 }}
                                >
                                    star
                                </i>
                            </th>
                            <th
                                onClick={this.props.onSort("play_count")}
                                style={{
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    width: 60,
                                    paddingBottom: "0.45em",
                                    paddingLeft: "0.5em",
                                }}
                                scope="col"
                            >
                                <i
                                    className="material-icons"
                                    style={{ fontSize: 20 }}
                                >
                                    audiotrack
                                </i>
                            </th>
                        </tr>
                    </thead>
                    <tbody>{trs}</tbody>
                </table>

                <ul className="pagination" style={{ paddingLeft: 10 }}>
                    {lis}
                </ul>
            </div>
        );
    }
    componentDidMount() {
        this.props.updatePlaying();
    }
    componentDidUpdate() {
        this.props.updatePlaying();
    }
}

class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hovering: false,
        };
    }

    onMouseOver = event => {
        this.setState({ hovering: true });
    };
    onMouseOut = event => {
        this.setState({ hovering: false });
    };
    onContextMenu = event => {
        event.preventDefault();
        showSongDropdown(
            event,
            "card-dropdown-menu-" + this.props.index,
            event.clientY + 10 + "px",
            event.clientX + "px",
            "fixed"
        );
    };
    showMenu = event => {
        event.stopPropagation();
        showSongDropdown(
            event,
            "card-dropdown-menu-" + this.props.index,
            "120px",
            "32px",
            "absolute"
        );
    };
    addToPlaylist = type => event => {
        event.stopPropagation();
        removeDropdowns();

        if (this.props.albums === true) {
            axios
                .get("/api/search/songs", {
                    params: {
                        specific: 1,
                        album_artist: "EQ:::" + this.props.info.album_artist,
                        album: "EQ:::" + this.props.info.album,
                        first_result: 0,
                        max_results: maxPlaylistSize,
                        order_by: "album",
                    },
                })
                .then(response => {
                    this.props.addToPlaylist(response.data.data, type);
                })
                .catch(function(error) {
                    console.log(error);
                });
        } else {
            axios
                .get("/api/search/songs", {
                    params: {
                        specific: 1,
                        artist: "EQ:::" + this.props.info.artist,
                        album_artist_grouped: 1,
                        composer_grouped: 1,
                        publisher_grouped: 1,
                        first_result: 0,
                        max_results: maxPlaylistSize,
                        order_by: "album_artist",
                    },
                })
                .then(response => {
                    this.props.addToPlaylist(response.data.data, type);
                })
                .catch(function(error) {
                    console.log(error);
                });
        }
    };
    editInfo = event => {
        event.stopPropagation();
        removeDropdowns();
        if (this.props.albums === true) {
            this.props.editInfo("card", {
                specific: 1,
                album_artist: "EQ:::" + this.props.info.album_artist,
                album: "EQ:::" + this.props.info.album,
            });
        } else {
            this.props.editInfo("card", {
                specific: 1,
                artist: "EQ:::" + this.props.info.artist,
                album_artist_grouped: 1,
                composer_grouped: 1,
                publisher_grouped: 1,
            });
        }
    };
    cardClick = event => {
        if (this.props.albums === true) {
            this.props.albumClick(
                this.props.info.album,
                this.props.info.album_artist
            );
        } else {
            this.props.artistClick(this.props.info.artist);
        }
    };

    artistLabelClick = event => {
        event.stopPropagation();
        this.props.artistClick(this.props.info.album_artist);
    };

    render() {
        let info = this.props.info;
        let image_id = this.props.info.image_id;
        let dropdown_button = this.state.hovering ? (
            <a
                style={{ position: "absolute", left: 160, top: 10 }}
                role="button"
                id="dropdownMenuSong"
                onClick={this.showMenu}
            >
                <i className="material-icons song-icon-button dropdown-button">
                    more_vert
                </i>
            </a>
        ) : null;

        let labels = (
            <div style={{ position: "absolute", top: 201, left: 5 }}>
                <div
                    style={{
                        width: 160,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 6,
                        fontSize: "0.75rem",
                    }}
                >
                    {info.album}
                </div>
                <div
                    style={{
                        width: 160,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 23,
                        fontSize: "0.65rem",
                    }}
                >
                    <span
                        className="detail-page-link"
                        onClick={this.artistLabelClick}
                    >
                        {info.album_artist}
                    </span>
                </div>
                {dropdown_button}
            </div>
        );
        if (this.props.albums === false) {
            labels = (
                <div style={{ position: "absolute", top: 201, left: 5 }}>
                    <div
                        style={{
                            width: 160,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            position: "absolute",
                            top: 6,
                            fontSize: "0.75rem",
                        }}
                    >
                        {info.artist}
                    </div>
                    <div
                        style={{
                            width: 160,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            position: "absolute",
                            top: 23,
                            fontSize: "0.65rem",
                        }}
                    >
                        {info.artist_alt}
                    </div>
                    {dropdown_button}
                </div>
            );
        }

        return (
            <div
                className="card"
                style={{
                    transition: "0.3s",
                    position: "relative",
                    height: 250,
                    width: 200,
                    cursor: "pointer",
                    border: "1px solid #D5D5D5",
                    boxShadow: this.state.hovering
                        ? "2px 2px 5px #777777"
                        : "1px 1px 1px #D5D5D5",
                    margin: 5,
                }}
                onMouseEnter={this.onMouseOver}
                onMouseLeave={this.onMouseOut}
                onContextMenu={this.onContextMenu}
                onClick={this.cardClick}
            >
                <div
                    id={"card-dropdown-menu-" + this.props.index}
                    className="dropdown-menu"
                    style={{ position: "absolute", zIndex: 2 }}
                    aria-labelledby="dropdownMenuSong"
                >
                    <a
                        onClick={this.addToPlaylist(1)}
                        className="dropdown-item"
                    >
                        Play Next
                    </a>
                    <a
                        onClick={this.addToPlaylist(0)}
                        className="dropdown-item"
                    >
                        Add to Queue
                    </a>
                    <a onClick={this.editInfo} className="dropdown-item">
                        Edit Info
                    </a>
                </div>
                <div
                    style={{
                        position: "absolute",
                        height: 200,
                        width: 198,
                        overflow: "hidden",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                        backgroundImage:
                            image_id == null
                                ? "url('test.jpg')"
                                : "url('" +
                                  axios.defaults.baseURL +
                                  "/api/song/" +
                                  image_id +
                                  "/picture?size=200')",
                    }}
                />
                {labels}
            </div>
        );
    }
}

class ArtistDescription extends React.Component {
    artistSongs = event => {
        if (this.props.albums === true) {
            this.props.artistSongs(this.props.artistDetails.artist);
        }
    };
    openImage = event => {
        if (this.props.artistDetails.image_id != null) {
            window.open(
                axios.defaults.baseURL +
                    "/api/song/" +
                    this.props.artistDetails.image_id +
                    "/picture?size=1000"
            );
        }
    };
    render() {
        let offset = 0;
        if (this.props.artistDetails.artist_alt === "") {
            offset = -25;
        }
        return (
            <div
                style={{
                    height: 250,
                    width: "100%",
                    position: "relative",
                    backgroundColor: "#F8F8F8",
                }}
            >
                <div
                    onClick={this.openImage}
                    style={{
                        cursor: "pointer",
                        position: "absolute",
                        height: 200,
                        width: 198,
                        top: 25,
                        left: 25,
                        overflow: "hidden",
                        border: "1px solid #D5D5D5",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                        backgroundImage:
                            this.props.artistDetails.image_id == null
                                ? "url('test.jpg')"
                                : "url('" +
                                  axios.defaults.baseURL +
                                  "/api/song/" +
                                  this.props.artistDetails.image_id +
                                  "/picture?size=200')",
                    }}
                />
                <div
                    style={{
                        width: "calc(100% - 300px)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 40,
                        left: 235,
                        fontSize: "1.8rem",
                    }}
                >
                    <span>{this.props.artistDetails.artist}</span>
                </div>
                <div
                    style={{
                        width: "calc(100% - 300px)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 80,
                        left: 236,
                        fontSize: "1rem",
                    }}
                >
                    <span>{this.props.artistDetails.artist_alt}</span>
                </div>
                <div
                    style={{
                        width: "calc(100% - 300px)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        position: "absolute",
                        top: 105 + offset,
                        left: 236,
                        fontSize: "1rem",
                        color: "gray",
                    }}
                >
                    <span
                        className={
                            this.props.albums === true ? "detail-page-link" : ""
                        }
                        onClick={this.artistSongs}
                    >
                        {this.props.artistDetails.count + " songs"}
                    </span>
                </div>
            </div>
        );
    }
}

class CardList extends React.Component {
    render() {
        let list = this.props.data.data;
        let cards = [];
        if (this.props.albums === true) {
            for (let i = 0; i < list.length; i++) {
                cards.push(
                    <Card
                        key={list[i].album + " " + list[i].album_artist}
                        info={list[i]}
                        addToPlaylist={this.props.addToPlaylist}
                        artistClick={this.props.artistClick}
                        albumClick={this.props.albumClick}
                        albums={this.props.albums}
                        index={i}
                        editInfo={this.props.editInfo}
                    />
                );
            }
        } else {
            for (let i = 0; i < list.length; i++) {
                cards.push(
                    <Card
                        key={list[i].artist}
                        info={list[i]}
                        addToPlaylist={this.props.addToPlaylist}
                        artistClick={this.props.artistClick}
                        albumClick={this.props.albumClick}
                        albums={this.props.albums}
                        index={i}
                        editInfo={this.props.editInfo}
                    />
                );
            }
        }

        // create the pagination elements
        let lis = [];
        for (let i = 0; i < this.props.total_size; i = i + pageLength) {
            let current_page = Math.floor(i / pageLength);
            let classes = "page-item";
            if (this.props.page === current_page) {
                classes = classes + " active";
            }
            lis.push(
                <li key={current_page} className={classes}>
                    <a
                        className="page-link"
                        style={{ cursor: "pointer" }}
                        onClick={this.props.onPageUpdate(current_page, false)}
                    >
                        {current_page + 1}
                    </a>
                </li>
            );
        }

        // add bar for artist description if this is an artist detail page
        let artist_description = null;
        if (this.props.artistDetails != null) {
            artist_description = (
                <ArtistDescription
                    artistDetails={this.props.artistDetails}
                    addAllToPlaylist={this.props.addAllToPlaylist}
                    artistSongs={this.props.artistSongs}
                    albums={this.props.albums}
                />
            );
        }

        return (
            <div>
                {artist_description}
                <div style={{ display: "flex", flexWrap: "wrap" }}>{cards}</div>
                <ul className="pagination" style={{ paddingLeft: 10 }}>
                    {lis}
                </ul>
            </div>
        );
    }
}

// for songs in the current playlist of songs being played
class PlaylistSong extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hovering: false,
        };
    }
    onPlayClick = event => {
        let position =
            document.getElementById(
                "playlist-song-item-" + this.props.song_info.playlist_id
            ).rowIndex - 1;
        this.props.changeCurrentIndex(position);
    };
    onMouseOver = event => {
        if (
            !document
                .getElementById("playlist-table")
                .classList.contains("dragging")
        ) {
            this.setState({ hovering: true });
        }
    };
    onMouseOut = event => {
        if (
            !document
                .getElementById("playlist-table")
                .classList.contains("dragging")
        ) {
            this.setState({ hovering: false });
        }
    };
    addNext = event => {
        this.props.addToPlaylist([this.props.song_info], 1);
    };
    addQueue = event => {
        this.props.addToPlaylist([this.props.song_info], 0);
    };
    editInfo = event => {
        this.props.editInfo("song", [this.props.song_info]);
    };
    onDragStart = event => {
        let position = event.currentTarget.rowIndex - 1;
        event.dataTransfer.setData("text/plain", position);
        document.getElementById("playlist-table").classList.add("dragging");

        // if dragged element isn't selected, clear all selections and select the current element
        if (
            event.currentTarget == null ||
            !event.currentTarget.classList.contains("table-selected")
        ) {
            let selected = document.getElementsByClassName("table-selected");
            while (selected.length > 0) {
                selected[0].classList.remove("table-selected");
            }
            event.currentTarget.classList.add("table-selected");
        }

        let selected_navbar = document.getElementById("selected-navbar");
        selected_navbar.style.pointerEvents = "none";
        selected_navbar.style.opacity = 0;
    };
    onDragEnd = event => {
        document.getElementById("playlist-table").classList.remove("dragging");
    };
    // drag and drop events to allow reordering of playlist
    allowDrop = event => {
        event.preventDefault();
    };
    onDragEnter = event => {
        event.currentTarget.style.borderTop = "2px solid " + activeColor;
    };
    onDragLeave = event => {
        event.currentTarget.style.borderTop = "1px solid gray";
    };
    onDrop = event => {
        event.preventDefault();
        event.currentTarget.style.borderTop = "1px solid gray";
        let new_position = event.currentTarget.rowIndex - 1;
        let selected = document.getElementsByClassName("table-selected");
        let list = [];
        for (let i = selected.length - 1; i >= 0; i--) {
            list.push(selected[i].rowIndex - 1);
        }
        this.props.onDrop(new_position, list);
    };
    showMenu = event => {
        showSongDropdown(
            event,
            "playlist-dropdown-menu-" + this.props.song_info.playlist_id
        );
    };
    onClick = event => {
        tableRowSelect(event, "playlist-table", "playlist-row");
    };
    updateRating = new_rating => event => {
        this.props.updateRatings(new_rating, [this.props.song_info.id]);
    };
    albumClick = event => {
        this.props.albumClick(
            this.props.song_info.album,
            this.props.song_info.album_artist
        );
    };
    artistClick = event => {
        this.props.artistClick(this.props.song_info.artist);
    };
    render() {
        const song_info = this.props.song_info;
        const firstColumn = this.state.hovering ? (
            <i
                onClick={this.onPlayClick}
                className="material-icons song-icon-button"
            >
                play_arrow
            </i>
        ) : (
            formatTime(song_info.length)
        );
        if (this.props.notVisible === true) {
            return (
                <tr
                    id={"playlist-song-item-" + song_info.playlist_id}
                    className={"playlist-row playlist-song-id-" + song_info.id}
                >
                    <td style={{ overflow: "hidden" }}>
                        <span style={{ position: "relative" }}>
                            {firstColumn}
                        </span>
                    </td>
                </tr>
            );
        }

        const menuColumn = this.state.hovering ? (
            <a role="button" id="dropdownMenuSong" onClick={this.showMenu}>
                <i className="material-icons song-icon-button dropdown-button">
                    more_vert
                </i>
            </a>
        ) : (
            <a role="button" id="dropdownMenuSong" style={{ display: "none" }}>
                <i className="material-icons song-icon-button dropdown-button">
                    more_vert
                </i>
            </a>
        );
        const stars = [
            "star_border",
            "star_border",
            "star_border",
            "star_border",
            "star_border",
        ];
        let rating = Math.floor((song_info.rating + 32) / 64) + 1;
        for (let i = 0; i < rating; i++) {
            stars[i] = "star";
        }
        return (
            <tr
                id={"playlist-song-item-" + song_info.playlist_id}
                className={"playlist-row playlist-song-id-" + song_info.id}
                onMouseEnter={this.onMouseOver}
                onMouseLeave={this.onMouseOut}
                style={{
                    backgroundColor: this.state.hovering
                        ? "rgba(0,0,0,.075)"
                        : "rgba(0,0,0,0)",
                }}
                draggable="true"
                onDragStart={this.onDragStart}
                onDragOver={this.onDragEnter}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}
                onDragEnd={this.onDragEnd}
                onClick={this.onClick}
                onContextMenu={this.props.onContextMenu}
            >
                <td style={{ overflow: "hidden" }}>
                    <span style={{ position: "relative" }}>{firstColumn}</span>
                </td>
                <td style={{ overflow: "hidden", position: "relative" }}>
                    <div
                        style={{
                            position: "absolute",
                            top: 6,
                            fontSize: "0.75rem",
                        }}
                    >
                        {song_info.title}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            top: 23,
                            fontSize: "0.65rem",
                            zIndex: 6,
                        }}
                    >
                        <span
                            className="detail-page-link"
                            onClick={this.artistClick}
                        >
                            {song_info.artist}
                        </span>
                        <span> - </span>
                        <span
                            className="detail-page-link"
                            onClick={this.albumClick}
                        >
                            {song_info.album}
                        </span>
                    </div>
                    <div
                        positionreference={this.props.position}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "110%",
                            top: -5,
                        }}
                        onDragOver={this.allowDrop}
                    />
                </td>
                <td className="dropdown">
                    <div
                        id={"playlist-dropdown-menu-" + song_info.playlist_id}
                        className="dropdown-menu"
                        style={{ top: "75%", left: "-320%", zIndex: 2 }}
                        aria-labelledby="dropdownMenuSong"
                    >
                        <a onClick={this.addNext} className="dropdown-item">
                            Play Next
                        </a>
                        <a onClick={this.addQueue} className="dropdown-item">
                            Add to Queue
                        </a>
                        <a onClick={this.editInfo} className="dropdown-item">
                            Edit Info
                        </a>
                    </div>
                    {menuColumn}
                </td>
                <td style={{ overflow: "hidden", position: "relative" }}>
                    <i
                        onClick={this.updateRating(1)}
                        className="material-icons song-icon-button"
                        style={{ fontSize: 21, left: 0 }}
                    >
                        {stars[0]}
                    </i>
                    <i
                        onClick={this.updateRating(64)}
                        className="material-icons song-icon-button"
                        style={{ fontSize: 21, left: 18 }}
                    >
                        {stars[1]}
                    </i>
                    <i
                        onClick={this.updateRating(128)}
                        className="material-icons song-icon-button"
                        style={{ fontSize: 21, left: 36 }}
                    >
                        {stars[2]}
                    </i>
                    <i
                        onClick={this.updateRating(196)}
                        className="material-icons song-icon-button"
                        style={{ fontSize: 21, left: 54 }}
                    >
                        {stars[3]}
                    </i>
                    <i
                        onClick={this.updateRating(255)}
                        className="material-icons song-icon-button"
                        style={{ fontSize: 21, left: 72 }}
                    >
                        {stars[4]}
                    </i>
                </td>
                <td style={{ overflow: "hidden" }}>{song_info.play_count}</td>
            </tr>
        );
    }
}

class SearchFormRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    operatorChange = type => event => {
        this.props.updateFilter(
            this.props.data["col"],
            this.props.data["value1"],
            this.props.data["value2"],
            type,
            this.props.index
        );
    };
    valueChange1 = event => {
        this.props.updateFilter(
            this.props.data["col"],
            event.target.value,
            this.props.data["value2"],
            this.props.data["op"],
            this.props.index
        );
    };
    valueChange2 = event => {
        this.props.updateFilter(
            this.props.data["col"],
            this.props.data["value1"],
            event.target.value,
            this.props.data["op"],
            this.props.index
        );
    };
    uploadFile = event => {
        this.props.updateFilter(
            this.props.data["col"],
            event.target.files,
            this.props.data["value2"],
            this.props.data["op"],
            this.props.index
        );
    };
    render() {
        if (this.props.data["col"] === "image") {
            return (
                <div
                    className="form-group form-row"
                    style={{ marginBottom: "1.0rem" }}
                >
                    <div className="col-1" style={{ top: 10, left: -5 }}>
                        <a
                            role="button"
                            id="dropdownMenuSong"
                            onClick={this.props.removeFilter(this.props.index)}
                        >
                            <i className="material-icons modal-icon-button dropdown-button">
                                close
                            </i>
                        </a>
                    </div>
                    <div className="col-11">
                        <input
                            style={{ boxShadow: "none" }}
                            type="file"
                            className="form-control"
                            id={"upload-image"}
                            accept="image/x-png,image/jpeg"
                            onChange={this.uploadFile}
                        />
                    </div>
                </div>
            );
        }
        if (column_objects[this.props.data["col"]]["type"] === 0) {
            return (
                <div
                    className="form-group form-row"
                    style={{ marginBottom: "0.0rem" }}
                >
                    <div className="col-1" style={{ top: 20, left: -5 }}>
                        <a
                            role="button"
                            id="dropdownMenuSong"
                            onClick={this.props.removeFilter(this.props.index)}
                        >
                            <i className="material-icons modal-icon-button dropdown-button">
                                close
                            </i>
                        </a>
                    </div>
                    <div className="col-11 mui-textfield mui-textfield--float-label">
                        <input
                            style={{ boxShadow: "none" }}
                            type="text"
                            className="form-control"
                            id={"input-search-" + this.props.data["col"]}
                            onChange={this.valueChange1}
                            value={this.props.data["value1"]}
                        />
                        <label
                            htmlFor={
                                "input-search-" +
                                column_objects[this.props.data["col"]]
                            }
                        >
                            {column_objects[this.props.data["col"]]["name"]}
                        </label>
                    </div>
                </div>
            );
        } else {
            let col_size = "col-11";

            let additional_field = null;
            let op_selection = null;

            let col_type = "number";
            if (column_objects[this.props.data["col"]]["type"] === 2) {
                col_type = "date";
            }
            if (this.props.type !== "edit") {
                col_size = "col-8";
                op_selection = (
                    <div
                        id="search-button-group"
                        className="btn-group btn-group-toggle col-3"
                        style={{
                            opacity: 1,
                            paddingRight: 10,
                            height: "50%",
                            top: 16,
                        }}
                        data-toggle="buttons"
                    >
                        <label
                            className="btn btn-outline-secondary btn-sm"
                            onClick={this.operatorChange("LE")}
                        >
                            <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                            />
                            ≤
                        </label>
                        <label
                            className="btn btn-outline-secondary btn-sm active"
                            onClick={this.operatorChange("EQ")}
                        >
                            <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                            />
                            =
                        </label>
                        <label
                            className="btn btn-outline-secondary btn-sm"
                            onClick={this.operatorChange("GE")}
                        >
                            <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                            />
                            ≥
                        </label>
                        <label
                            className="btn btn-outline-secondary btn-sm"
                            onClick={this.operatorChange("BT")}
                        >
                            <input
                                type="radio"
                                name="options"
                                autoComplete="off"
                            />
                            B
                        </label>
                    </div>
                );
                if (this.props.data["op"] === "BT") {
                    col_size = "col-4";
                    additional_field = (
                        <div className="col-4 mui-textfield">
                            <input
                                style={{ boxShadow: "none" }}
                                type={col_type}
                                className="form-control"
                                id={
                                    "input-search-2-" +
                                    column_objects[this.props.data["col"]]
                                }
                                onChange={this.valueChange2}
                                value={this.props.data["value2"]}
                                autoComplete="off"
                                required
                            />
                            <label
                                htmlFor={
                                    "input-search-2-" + this.props.data["col"]
                                }
                            >
                                {column_objects[this.props.data["col"]]["name"]}
                            </label>
                        </div>
                    );
                }
            } else {
                col_size = "col-11";
            }

            return (
                <div className="form-group form-row">
                    <div className="col-1" style={{ top: 20, left: -5 }}>
                        <a
                            role="button"
                            id="dropdownMenuSong"
                            onClick={this.props.removeFilter(this.props.index)}
                        >
                            <i className="material-icons modal-icon-button dropdown-button">
                                close
                            </i>
                        </a>
                    </div>
                    {op_selection}
                    <div className={col_size + " mui-textfield"}>
                        <input
                            style={{ boxShadow: "none" }}
                            type={col_type}
                            className="form-control"
                            id={
                                "input-search-" +
                                column_objects[this.props.data["col"]]
                            }
                            onChange={this.valueChange1}
                            value={this.props.data["value1"]}
                            autoComplete="off"
                            required
                        />
                        <label
                            htmlFor={"input-search-" + this.props.data["col"]}
                        >
                            {column_objects[this.props.data["col"]]["name"]}
                        </label>
                    </div>
                    {additional_field}
                </div>
            );
        }
    }
}

class EditModal extends React.Component {
    constructor(props) {
        super(props);
        let value = null;
        if (this.props.edit_data.length <= 50) {
            for (let i = 0; i < this.props.edit_data.length; i++) {
                let temp = this.props.edit_data[i]["image_id"];
                if (temp == null) {
                    break;
                } else {
                    if (value === null) {
                        value = temp;
                    } else {
                        if (value !== temp) {
                            value = null;
                            break;
                        }
                    }
                }
            }
        }
        this.state = {
            data: [],
            image_id: value,
            size:
                this.props.edit_data.length <= 50
                    ? this.props.edit_data.length
                    : ">50",
        };
    }
    handleSubmit = event => {
        event.preventDefault();
        document.getElementById("edit-save").disabled = true;
        let editParams = new FormData();
        let propagating_changes = {};

        let data = this.state.data;
        if (data.length === 0) {
            this.props.closeModals();
            return;
        }

        for (let i = 0; i < data.length; i++) {
            let col = data[i]["col"];
            let value1 = data[i]["value1"];

            if (col === "image") {
                if (value1 != null && value1.length > 0) {
                    editParams.append(col, value1[0]);
                } else if (data.length === 1) {
                    this.props.closeModals();
                    return;
                }
            }

            if (column_objects[col]["type"] === 1) {
                // int type
                value1 = parseInt(value1, 10);
                if (isNaN(value1)) {
                    continue;
                }
            }

            editParams.append(col, value1);

            if (propagating_columns.indexOf(col) >= 0) {
                propagating_changes[col] = value1;
            }
        }

        axios
            .post("/api/songs", editParams, {
                params: this.props.edit_info,
            })
            .then(response => {
                this.props.onEditSuccess(propagating_changes, response);
            })
            .catch(function(error) {
                console.log(error);
            });
    };
    addFilter = type => event => {
        let data = this.state.data;
        let value = "";
        if (this.props.edit_data.length <= 50) {
            for (let i = 0; i < this.props.edit_data.length; i++) {
                let temp = this.props.edit_data[i][type];
                if (temp == null || temp.toString().length === 0) {
                    break;
                } else {
                    if (value === "") {
                        value = temp.toString();
                    } else {
                        if (value !== temp.toString()) {
                            value = "";
                            break;
                        }
                    }
                }
            }
        }
        data.push({
            col: type,
            value1: value,
            value2: "",
            op: "",
        });
        this.setState({ data: data });
    };
    updateFilter = (col, value1, value2, op, index) => {
        let data = this.state.data;
        data[index]["col"] = col;
        data[index]["value1"] = value1;
        data[index]["value2"] = value2;
        data[index]["op"] = op;
        this.setState({ data: data });
    };
    removeFilter = index => event => {
        let data = this.state.data;
        data.splice(index, 1);
        this.setState({ data: data });
    };
    componentDidMount() {
        document.getElementById("edit-modal-loading").style.display = "none";
    }
    openImage = event => {
        window.open(
            axios.defaults.baseURL +
                "/api/song/" +
                this.state.image_id +
                "/picture?size=1000"
        );
    };
    render() {
        let data = this.state.data;

        let dropdown_items = [];
        for (let i = 0; i < editable_columns.length; i++) {
            let found = false;
            for (let j = 0; j < data.length; j++) {
                if (data[j]["col"] === editable_columns[i]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                dropdown_items.push(
                    <a
                        key={editable_columns[i]}
                        className="dropdown-item"
                        onClick={this.addFilter(editable_columns[i])}
                    >
                        {column_objects[editable_columns[i]]["name"]}
                    </a>
                );
            }
        }

        let form_rows = [];
        for (let i = 0; i < this.state.data.length; i++) {
            form_rows.push(
                <SearchFormRow
                    key={data[i]["col"]}
                    data={data[i]}
                    index={i}
                    removeFilter={this.removeFilter}
                    updateFilter={this.updateFilter}
                    type="edit"
                />
            );
        }

        let artwork = null;
        if (this.state.image_id != null) {
            artwork = (
                <div
                    onClick={this.openImage}
                    style={{
                        cursor: "pointer",
                        position: "absolute",
                        height: 100,
                        width: 100,
                        overflow: "hidden",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                        backgroundImage:
                            "url('" +
                            axios.defaults.baseURL +
                            "/api/song/" +
                            this.state.image_id +
                            "/picture?size=100')",
                    }}
                />
            );
        }

        return (
            <div>
                <div
                    style={{
                        width: "100%",
                        position: "relative",
                        height: 100,
                        backgroundColor: "#F2F2F2",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            width: "100%",
                            position: "absolute",
                            top: 40,
                            left: -5,
                        }}
                    >
                        Editing{" "}
                        {this.state.size +
                            (this.state.size === 1 ? " Song" : " Songs")}
                    </div>
                    {artwork}
                </div>
                <form
                    className="form"
                    onSubmit={this.handleSubmit}
                    style={{ padding: 20 }}
                >
                    {form_rows}

                    <div className="form-group form-row">
                        <div className="col-2">
                            <button
                                type="submit"
                                id="edit-save"
                                className="btn btn-success"
                            >
                                Save
                            </button>
                        </div>
                        <div
                            className="dropdown col-4"
                            style={{ paddingLeft: 15 }}
                        >
                            <button
                                className="btn btn-secondary dropdown-toggle"
                                type="button"
                                id="dropdownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                Add a Field...
                            </button>
                            <div
                                className="dropdown-menu"
                                id="search-dropdown-menu"
                                aria-labelledby="dropdownMenuButton"
                            >
                                {dropdown_items}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class SearchModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            alt_specific: false,
            album_artist_grouped: false,
            composer_grouped: false,
            publisher_grouped: false,
        };
    }
    onCheck = type => event => {
        if (type === 0) {
            this.setState({ alt_specific: !this.state.alt_specific });
        } else if (type === 1) {
            this.setState({
                album_artist_grouped: !this.state.album_artist_grouped,
            });
        } else if (type === 2) {
            this.setState({ composer_grouped: !this.state.composer_grouped });
        } else if (type === 3) {
            this.setState({ publisher_grouped: !this.state.publisher_grouped });
        }
    };
    addFilter = type => event => {
        let data = this.state.data;
        data.push({
            col: type,
            value1: "",
            value2: "",
            op: column_objects[type]["type"] === 0 ? "LK" : "EQ",
        });
        this.setState({ data: data });
    };
    updateFilter = (col, value1, value2, op, index) => {
        let data = this.state.data;
        data[index]["col"] = col;
        data[index]["value1"] = value1;
        data[index]["value2"] = value2;
        data[index]["op"] = op;
        this.setState({ data: data });
    };
    removeFilter = index => event => {
        console.log(index);
        let data = this.state.data;
        data.splice(index, 1);
        this.setState({ data: data });
    };
    handleSubmit = event => {
        event.preventDefault();
        removeActiveNavbar();
        document.getElementById("advanced-search-submit").disabled = true;
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {};
        request["base_params"]["specific"] = 1;
        request["base_params"]["alt_specific"] =
            this.state.alt_specific === true ? 1 : 0;
        request["base_params"]["album_artist_grouped"] =
            this.state.album_artist_grouped === true ? 1 : 0;
        request["base_params"]["composer_grouped"] =
            this.state.composer_grouped === true ? 1 : 0;
        request["base_params"]["publisher_grouped"] =
            this.state.publisher_grouped === true ? 1 : 0;

        let data = this.state.data;
        for (let i = 0; i < data.length; i++) {
            let col = data[i]["col"];
            let op = data[i]["op"];
            let value1 = data[i]["value1"];
            let value2 = data[i]["value2"];

            if (column_objects[col]["type"] === 1) {
                // int type
                value1 = parseInt(value1, 10);
                if (isNaN(value1)) {
                    continue;
                }
                if (op === "BT") {
                    value2 = parseInt(value2, 10);
                    if (isNaN(value2)) {
                        continue;
                    }
                }
            } else if (column_objects[col]["type"] === 2) {
                // date type
                console.log(value1);
                value1 = Date.now() - Date.parse(value1);
                if (isNaN(value1)) {
                    continue;
                }
                if (op === "BT") {
                    value2 = Date.now() - Date.parse(value2);
                    if (isNaN(value2)) {
                        continue;
                    }
                }
            }

            if (op === "BT") {
                request["base_params"][col] =
                    op + ":::" + value1 + ":::" + value2;
            } else {
                request["base_params"][col] = op + ":::" + value1;
            }
        }

        this.props.handleAdvancedSearch(request);
    };
    render() {
        let availability = 0;
        let data = this.state.data;
        let dropdown_items = [];
        if (this.state.alt_specific === true) {
            availability = 1;
        }

        for (let i = 0; i < searchable_columns.length; i++) {
            if (
                column_objects[searchable_columns[i]]["availability"] <=
                availability
            ) {
                let found = false;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]["col"] === searchable_columns[i]) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    dropdown_items.push(
                        <a
                            key={searchable_columns[i]}
                            className="dropdown-item"
                            onClick={this.addFilter(searchable_columns[i])}
                        >
                            {column_objects[searchable_columns[i]]["name"]}
                        </a>
                    );
                }
            }
        }

        let form_rows = [];
        for (let i = 0; i < this.state.data.length; i++) {
            form_rows.push(
                <SearchFormRow
                    key={data[i]["col"]}
                    data={data[i]}
                    index={i}
                    removeFilter={this.removeFilter}
                    updateFilter={this.updateFilter}
                />
            );
        }

        return (
            <div>
                <div
                    style={{
                        width: "100%",
                        position: "relative",
                        height: 50,
                        backgroundColor: "#F2F2F2",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            width: "100%",
                            position: "absolute",
                            top: 13,
                            left: -5,
                        }}
                    >
                        Advanced Search
                    </div>
                </div>
                <form
                    className="form"
                    onSubmit={this.handleSubmit}
                    style={{ padding: 20 }}
                >
                    <div className="form-group row">
                        <div className="col-12">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="alt_specific_check"
                                    style={{ left: 20 }}
                                    onChange={this.onCheck(0)}
                                    checked={this.state.alt_specific}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="alt_specific_check"
                                >
                                    Alt Specific
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="album_artist_grouped"
                                    style={{ left: 20 }}
                                    onChange={this.onCheck(1)}
                                    checked={this.state.album_artist_grouped}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="album_artist_grouped"
                                >
                                    Album Artist Grouped
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="composer_grouped"
                                    style={{ left: 20 }}
                                    onChange={this.onCheck(2)}
                                    checked={this.state.composer_grouped}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="composer_grouped"
                                >
                                    Composer Grouped
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="publisher_grouped"
                                    style={{ left: 20 }}
                                    onChange={this.onCheck(3)}
                                    checked={this.state.publisher_grouped}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="publisher_grouped"
                                >
                                    Publisher Grouped
                                </label>
                            </div>
                        </div>
                    </div>

                    {form_rows}

                    <div className="form-group form-row">
                        <div className="col-2">
                            <button
                                type="submit"
                                id="advanced-search-submit"
                                className="btn btn-success"
                            >
                                Search
                            </button>
                        </div>
                        <div
                            className="dropdown col-4"
                            style={{ paddingLeft: 15 }}
                        >
                            <button
                                className="btn btn-secondary dropdown-toggle"
                                type="button"
                                id="dropdownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                Add a Filter...
                            </button>
                            <div
                                className="dropdown-menu"
                                id="search-dropdown-menu"
                                aria-labelledby="dropdownMenuButton"
                            >
                                {dropdown_items}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class AudioApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            child_type: "welcome",
            child_key: null,
            child_data: null,
            child_request: null,
            child_total_size: 0,
            child_page: 0,
            child_sort_column: null,
            child_sort_type: "ASC",
            child_extra: null,
            current_playlist: [],
            current_index: 0,
            playStatus: "pause",
            shuffle: false,
            playlistScroll: 0,
            edit_type: null,
            edit_info: null,
            active_audio: "audio",
            next_id: null,
        };
    }

    // creates a playlist based on given information from the songlist - there are a few cases here
    // also shuffles the list if shuffle is turned on
    generatePlaylist = (index_position, page, total_size, request, data) => {
        request = this.state.child_request;
        // first check if we need to make an additional api call to get all the songs for the playlist
        if (total_size <= pageLength) {
            data = JSON.parse(JSON.stringify(data)); // deepcopy to avoid accidentally modifying the songlist
            if (this.state.shuffle === true) {
                this.setPlaylist(shuffle(data, index_position), 0);
            } else {
                this.setPlaylist(data, index_position);
            }
        } else {
            let position = index_position + page * pageLength; // get position in the TOTAL list of songs
            if (total_size <= maxPlaylistSize) {
                // total size is less than playlist size, so get all songs and place into playlist accordingly
                let requestNew = {};
                requestNew["base_url"] = request["base_url"];
                requestNew["base_params"] = JSON.parse(
                    JSON.stringify(request["base_params"])
                ); // deep copy
                if (this.state.shuffle === true) {
                    requestNew["base_params"]["shuffle"] = 1;
                    requestNew["base_params"]["exclude"] =
                        data[index_position].id;
                }
                axios
                    .get(requestNew["base_url"], {
                        params: requestNew["base_params"],
                    })
                    .then(response => {
                        if (this.state.shuffle === true) {
                            response.data.data.unshift(data[index_position]);
                            position = 0;
                        }
                        this.setPlaylist(response.data.data, position);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            } else {
                // if current position to end is less than the max playlist size, then we need to
                // get from current position to end, then combine with remaining results from beginning
                // if shuffle is turned on though, we can just use the next case instead as order doesn't matter
                if (
                    position + maxPlaylistSize > total_size &&
                    this.state.shuffle === false
                ) {
                    let requestEnd = {};
                    requestEnd["base_url"] = request["base_url"];
                    requestEnd["base_params"] = JSON.parse(
                        JSON.stringify(request["base_params"])
                    ); // deep copy
                    requestEnd["base_params"]["first_result"] = position;
                    requestEnd["base_params"]["max_results"] =
                        total_size - position;
                    let requestFront = {};
                    requestFront["base_url"] = request["base_url"];
                    requestFront["base_params"] = JSON.parse(
                        JSON.stringify(request["base_params"])
                    ); // deep copy
                    requestFront["base_params"]["first_result"] = 0;
                    requestFront["base_params"]["max_results"] =
                        position + maxPlaylistSize - total_size;
                    console.log(requestFront);
                    console.log(requestEnd);
                    axios
                        .all([
                            axios.get(requestEnd["base_url"], {
                                params: requestEnd["base_params"],
                            }),
                            axios.get(requestFront["base_url"], {
                                params: requestFront["base_params"],
                            }),
                        ])
                        .then(
                            axios.spread((responseEnd, responseFront) => {
                                let playlist = responseEnd.data.data.concat(
                                    responseFront.data.data
                                );
                                this.setPlaylist(playlist, 0);
                            })
                        )
                        .catch(function(error) {
                            console.log(error);
                        });
                } else {
                    // get from current position with maxPlaylistSize results
                    let requestNew = {};
                    requestNew["base_url"] = request["base_url"];
                    requestNew["base_params"] = JSON.parse(
                        JSON.stringify(request["base_params"])
                    ); // deep copy
                    requestNew["base_params"]["first_result"] = position;
                    requestNew["base_params"]["max_results"] = maxPlaylistSize;
                    if (this.state.shuffle === true) {
                        requestNew["base_params"]["shuffle"] = 1;
                        requestNew["base_params"]["exclude"] =
                            data[index_position].id;
                        requestNew["base_params"]["first_result"] = 0;
                        requestNew["base_params"]["max_results"] =
                            maxPlaylistSize - 1;
                    }
                    axios
                        .get(requestNew["base_url"], {
                            params: requestNew["base_params"],
                        })
                        .then(response => {
                            if (this.state.shuffle === true) {
                                response.data.data.unshift(
                                    JSON.parse(
                                        JSON.stringify(data[index_position])
                                    )
                                );
                            }
                            this.setPlaylist(response.data.data, 0);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                }
            }
        }
    };
    setPlaylist = (playlist, position) => {
        this.updatePlaycount();
        // assigns each element a unique playlist id - we don't use db id because there can be duplicate songs in the same playlist
        // but this still prevents unnecessary rerenders for react
        for (let i = 0; i < playlist.length; i++) {
            playlist[i].playlist_id = playlistCount++;
        }

        this.setState(
            {
                current_playlist: playlist,
                current_index: position,
                next_id: getNextIndex(playlist, position),
            },
            () => {
                let audio = document.getElementById(this.state.active_audio);
                audio.src =
                    "http://stella.test/api/song/" +
                    this.state.current_playlist[this.state.current_index].id +
                    "/audio?bitrate=320&remove_metadata=1";
                audio.load();
                audio.play();
                this.setState({ playStatus: "play", playcountUpdated: false });
            }
        );
    };

    addNext = event => {
        this.addToPlaylist(getSelectedRows(this.state.current_playlist), 1);
    };
    addQueue = event => {
        this.addToPlaylist(getSelectedRows(this.state.current_playlist), 0);
    };
    getPlaylistEditData = event => {
        this.editInfo("song", getSelectedRows(this.state.current_playlist));
    };
    addToPlaylist = (data, next) => {
        // TODO: maybe try to make more efficient? it is pretty fast already though
        data = JSON.parse(JSON.stringify(data));
        let new_playlist = this.state.current_playlist;
        let prev_size = new_playlist.length;
        let current_index = this.state.current_index;

        if (prev_size !== 0 && next === 0 && this.state.shuffle === false) {
            data.reverse();
        }

        for (let i = data.length - 1; i >= 0; i--) {
            // loops through all the songs to add
            // if playlist size is too large, try removing from the beginning (if there are at least 10 elements before current)
            // else, pop off end
            data[i].playlist_id = playlistCount++;
            if (new_playlist.length + 1 > maxPlaylistSize) {
                if (current_index > 10) {
                    new_playlist.shift();
                    current_index = current_index - 1;
                } else {
                    new_playlist.pop();
                }
            }

            // TODO: maybe do all the splices and unshifts at once for speed
            // if we are adding next and not at the end of the playlist, add at the index after the current
            if (
                next === 1 &&
                current_index + 1 < new_playlist.length &&
                prev_size > 0
            ) {
                new_playlist.splice(current_index + 1, 0, data[i]);
            } else if (prev_size === 0) {
                // else if the playlist is currently empty, just add them all at the front
                new_playlist.unshift(data[i]);
            } else {
                // else, add at end
                new_playlist.push(data[i]);
            }

            // if adding to queue, shuffle the new entry if necessary (between current_index+1 and end)
            if (next === 0 && this.state.shuffle === true) {
                let swap_index = Math.floor(
                    Math.random() *
                        (new_playlist.length - (current_index + 2)) +
                        (current_index + 1)
                );
                let x = new_playlist[new_playlist.length - 1];
                new_playlist[new_playlist.length - 1] =
                    new_playlist[swap_index];
                new_playlist[swap_index] = x;
            }
        }
        this.setState({
            current_playlist: new_playlist,
            current_index: current_index,
            next_id: getNextIndex(new_playlist, current_index),
        });
    };
    addAllToPlaylist = method => {
        let request = JSON.parse(JSON.stringify(this.state.child_request));
        request["base_params"]["first_result"] = 0;
        request["base_params"]["max_results"] = maxPlaylistSize;
        request["base_params"]["order_by"] = this.state.child_sort_column;
        request["base_params"]["order_by_order"] = this.state.child_sort_type;
        request["base_params"]["results"] = 0;
        axios
            .get(request["base_url"], {
                params: request["base_params"],
            })
            .then(response => {
                this.addToPlaylist(response.data.data, method);
            })
            .catch(function(error) {
                console.log(error);
            });
    };
    updatePlaying = () => {
        // removes any elements with the now_playing class
        let previously_playing = document.getElementsByClassName("now_playing");
        while (previously_playing.length > 0) {
            previously_playing[0].classList.remove("now_playing");
        }

        // adds the now_playing class to any instance of the song on the screen
        if (this.state.current_playlist.length > 0) {
            let now_playing = document.getElementById(
                "song-item-" +
                    this.state.current_playlist[this.state.current_index].id
            );
            if (now_playing != null) {
                now_playing.classList.add("now_playing");
            }
            now_playing = document.getElementById(
                "playlist-song-item-" +
                    this.state.current_playlist[this.state.current_index]
                        .playlist_id
            );
            if (now_playing != null) {
                now_playing.classList.add("now_playing");
            }
        }
    };

    songList = event => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {};
        this.props.history.push("/songs", {
            child_type: "song-list",
            child_key: "song-list",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "title",
            child_total_size: -1,
        });
        removeActiveNavbar();
        document.getElementById("navbar-songs").classList.add("active");
    };
    // makes a call for the search results (including the total number of results) to pass to the song list
    onSearchClick = (search, type) => {
        let child_type = "song-list";
        let sort = "title";
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {};

        if (type === 0) {
            child_type = "song-list";
            request["base_params"]["results"] = "song";
            request["base_params"]["search"] = search;
            sort = "title";
        } else if (type === 1) {
            child_type = "album-list";
            request["base_params"]["results"] = "album";
            request["base_params"]["specific"] = 1;
            request["base_params"]["album"] = "LK:::" + search;
            sort = "album";
        } else if (type === 2) {
            child_type = "artist-list";
            request["base_params"]["results"] = "artist";
            request["base_params"]["specific"] = 1;
            request["base_params"]["album_artist"] = "LK:::" + search;
            sort = "album_artist";
        } else {
            child_type = "artist-list";
            request["base_params"]["results"] = "all_artists";
            request["base_params"]["strict_artist"] = search;
            request["base_params"]["artist"] = "LK:::" + search;
            request["base_params"]["album_artist_grouped"] = 1;
            request["base_params"]["composer_grouped"] = 1;
            request["base_params"]["publisher_grouped"] = 1;
            request["base_params"]["specific"] = 1;
            sort = "artist";
        }

        this.props.history.push("/genericsearch/" + search, {
            child_type: child_type,
            child_key: search,
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: sort,
            child_total_size: -1,
        });
        removeActiveNavbar();
    };
    onPageUpdate = (new_page, force) => e => {
        // makes a request to get the results of the selected page of the child element
        // only update if the page clicked is a new page (not the current)
        if (new_page !== this.state.child_page || force === true) {
            this.props.history.push(this.props.location.pathname, {
                child_type: this.state.child_type,
                child_key: this.state.child_key,
                child_request: this.state.child_request,
                child_page: new_page,
                child_sort_type: this.state.child_sort_type,
                child_sort_column: this.state.child_sort_column,
                child_total_size: this.state.child_total_size,
                close_search_modal: force === true ? true : false,
            });
        }
    };
    onSort = sort_column => e => {
        let sort_type = this.state.child_sort_type;

        if (sort_column === this.state.child_sort_column) {
            if (sort_type === "ASC") {
                sort_type = "DESC";
            } else {
                sort_type = "ASC";
            }
        }

        this.props.history.push(this.props.location.pathname, {
            child_type: this.state.child_type,
            child_key: this.state.child_key,
            child_request: this.state.child_request,
            child_page: 0,
            child_sort_type: sort_type,
            child_sort_column: sort_column,
            child_total_size: this.state.child_total_size,
        });
    };
    forceUpdate = () => {
        this.onPageUpdate(this.state.child_page, true)(null);
    };

    togglePlay() {
        let status = this.state.playStatus;
        let audio = document.getElementById(this.state.active_audio);
        if (status === "play") {
            status = "pause";
            audio.pause();
        } else if (this.state.current_playlist.length > 0) {
            status = "play";
            if (audio.src == null || audio.src.length < 1) {
                audio.src =
                    "http://stella.test/api/song/" +
                    this.state.current_playlist[this.state.current_index].id +
                    "/audio?bitrate=320&remove_metadata=1";
                audio.load();
            }
            audio.play();
        }
        this.setState({ playStatus: status });
    }
    toggleShuffle() {
        if (this.state.shuffle === false) {
            this.setState({ shuffle: true });
            let new_playlist = shuffle(
                this.state.current_playlist,
                this.state.current_index
            );
            this.setState({ current_playlist: new_playlist, current_index: 0 });
        } else {
            this.setState({ shuffle: false });
        }
    }
    getPrevious() {
        let current_index = this.state.current_index - 1;
        let status = this.state.playStatus;
        let audio = document.getElementById(this.state.active_audio);
        if (audio.currentTime < 5 && this.state.current_index > 0) {
            if (status === "play") {
                audio.pause();
                audio.src =
                    "http://stella.test/api/song/" +
                    this.state.current_playlist[current_index].id +
                    "/audio?bitrate=320&remove_metadata=1";
                audio.load();
                audio.play();
            }
            this.setState({
                current_index: current_index,
                next_id: getNextIndex(
                    this.state.current_playlist,
                    current_index
                ),
            });
        } else {
            audio.currentTime = 0;
        }
    }
    getNext() {
        // TODO: currently involves two updates to setstate - try reducing later
        this.updatePlaycount();
        let current_index = this.state.current_index + 1;
        if (current_index >= this.state.current_playlist.length) {
            // wrap around at end
            current_index = 0;
        }
        let status = this.state.playStatus;
        let next_audio_label =
            this.state.active_audio === "audio" ? "audio2" : "audio";

        let audio = document.getElementById(this.state.active_audio);
        let next_audio = document.getElementById(next_audio_label);
        if (status === "play") {
            audio.pause();
            next_audio.src =
                "http://stella.test/api/song/" +
                this.state.current_playlist[current_index].id +
                "/audio?bitrate=320&remove_metadata=1";
            next_audio.load();
            next_audio.play();
        }
        this.setState({
            current_index: current_index,
            active_audio: next_audio_label,
            next_id: getNextIndex(this.state.current_playlist, current_index),
        });
    }
    updatePlaycount = () => {
        let audio = document.getElementById(this.state.active_audio);
        // at ten seconds, increment playcount
        if (audio.currentTime > 10) {
            axios
                .post(
                    "/api/song/" +
                        this.state.current_playlist[this.state.current_index]
                            .id +
                        "/played",
                    {}
                )
                .catch(function(error) {
                    console.log(error);
                });
            let playlist = this.state.current_playlist;
            let new_count = playlist[this.state.current_index].play_count + 1;
            playlist[this.state.current_index].play_count = new_count;

            let elements = document.getElementsByClassName(
                "song-id-" +
                    this.state.current_playlist[this.state.current_index].id
            );
            if (elements.length > 0) {
                let temp = this.state.child_data;
                for (let i = 0; i < elements.length; i++) {
                    temp.data[elements[i].rowIndex - 1].play_count = new_count;
                }
                this.setState({ current_playlist: playlist, child_data: temp });
            } else {
                this.setState({ current_playlist: playlist });
            }
        }
    };

    // seek-bar updating
    timeUpdate = event => {
        let audio = document.getElementById(this.state.active_audio);
        let progress = document.getElementById("audio-seeker-progress");
        let playPercent =
            100 *
            (audio.currentTime /
                (this.state.current_playlist[this.state.current_index].length *
                    100));
        progress.style.width = "calc((100% - 69px) *" + playPercent + ")";
    };
    // jump to song position when user clicks on the seekbar
    seek = event => {
        let audio = document.getElementById(this.state.active_audio);
        let totalWidth = window.innerWidth - 120.0;
        let clickX = event.clientX - 100.0;
        let percent = clickX / totalWidth;
        audio.currentTime =
            this.state.current_playlist[this.state.current_index].length *
            percent;
    };

    // playlist pane - toggle display
    togglePlaylistPane = event => {
        let playlist_popup = document.getElementById("playlist-popup");
        if (playlist_popup.classList.contains("collapsed")) {
            playlist_popup.classList.remove("collapsed");

            // scroll to the currently playing song upon popup open
            if (this.state.current_playlist.length > 0) {
                let active = document.getElementById(
                    "playlist-song-item-" +
                        this.state.current_playlist[this.state.current_index]
                            .playlist_id
                );
                if (active != null) {
                    let playlist_pane = document.getElementById(
                        "playlist-pane"
                    );
                    playlist_pane.scrollTop = active.offsetTop;
                }
            }
        } else {
            playlist_popup.classList.add("collapsed");
        }
    };
    // if user pressed play on a song in the playlist, jump to that song
    changeCurrentIndex = position => {
        this.updatePlaycount();
        if (position === this.state.current_index) {
            return;
        }
        this.setState(
            {
                current_index: position,
                next_id: getNextIndex(this.state.current_playlist, position),
            },
            () => {
                let audio = document.getElementById(this.state.active_audio);
                audio.src =
                    "http://stella.test/api/song/" +
                    this.state.current_playlist[this.state.current_index].id +
                    "/audio?bitrate=320&remove_metadata=1";
                audio.load();
                audio.play();
                this.setState({ playStatus: "play" });
            }
        );
    };
    // drag-and-drop of songs in the playlist - moves the dragged song and shifts remaining elements accordingly
    onPlaylistSongDrop = (new_position, old_positions) => {
        let new_playlist = this.state.current_playlist;
        let current_index = this.state.current_index;
        for (let i = 0; i < old_positions.length; i++) {
            let old_position = old_positions[i];
            if (new_position > old_position) {
                new_position--;
            }
            if (old_position >= new_position) {
                old_position = old_position + i;
            }
            if (current_index === old_position) {
                current_index = new_position;
            } else if (
                new_position <= current_index &&
                old_position > current_index
            ) {
                current_index++;
            } else if (
                new_position >= current_index &&
                old_position < current_index
            ) {
                current_index--;
            }
            new_playlist.splice(
                new_position,
                0,
                new_playlist.splice(old_position, 1)[0]
            );
        }
        this.setState({
            current_playlist: new_playlist,
            current_index: current_index,
            next_id: getNextIndex(new_playlist, current_index),
        });
    };
    onContextMenu = event => {
        event.preventDefault();
        renderContextMenu(event, "playlist", "playlist-row");
    };
    updateRatings = (new_rating, ids) => {
        // encode new rating and list of ids to update as form data, then update in db
        let ratingUpdate = new FormData();
        ratingUpdate.append("rating", new_rating);
        axios
            .post("/api/songs", ratingUpdate, {
                params: {
                    id: JSON.stringify(ids),
                },
            })
            .catch(function(error) {
                console.log(error);
            });

        // in the meantime, set the modified ids on frontend to the respective ratings
        let temp = this.state.child_data;
        let playlist = this.state.current_playlist;
        for (let i = 0; i < ids.length; i++) {
            let listElements = document.getElementsByClassName(
                "song-id-" + ids[i]
            );
            if (listElements.length > 0) {
                for (let i = 0; i < listElements.length; i++) {
                    temp.data[listElements[i].rowIndex - 1].rating = new_rating;
                }
            }
            let playlistElements = document.getElementsByClassName(
                "playlist-song-id-" + ids[i]
            );
            if (playlistElements.length > 0) {
                for (let i = 0; i < playlistElements.length; i++) {
                    playlist[
                        playlistElements[i].rowIndex - 1
                    ].rating = new_rating;
                }
            }
        }
        this.setState({ child_data: temp, current_playlist: playlist });
    };
    onScroll = event => {
        let scrollY = event.currentTarget.scrollTop;
        if (!playlistTicking) {
            playlistTicking = true;
            this.setState({ playlistScroll: scrollY }, function() {
                playlistTicking = false;
            });
        }
    };
    welcomeScreen = () => {
        this.props.history.push("/");
    };
    albumList = () => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = { results: "album" };
        this.props.history.push("/albums", {
            child_type: "album-list",
            child_key: "album-list",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "album",
            child_total_size: -1,
        });
        removeActiveNavbar();
        document.getElementById("navbar-albums").classList.add("active");
    };
    albumClick = (album, album_artist) => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {
            specific: 1,
            album: "EQ:::" + album,
            album_artist: "EQ:::" + album_artist,
            album_detail: 1,
        };
        this.props.history.push("/album/" + album_artist + "/" + album, {
            child_type: "song-list-album",
            child_key: album + " " + album_artist,
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "album",
            child_total_size: -1,
        });
        removeActiveNavbar();
        let selected_navbar = document.getElementById("selected-navbar");
        selected_navbar.style.pointerEvents = "none";
        selected_navbar.style.opacity = 0;
    };
    albumClickPassthrough = event => {
        if (this.state.current_playlist.length > 0) {
            this.albumClick(
                this.state.current_playlist[this.state.current_index].album,
                this.state.current_playlist[this.state.current_index]
                    .album_artist
            );
        }
    };
    artistClick = artist => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {
            specific: 1,
            results: "album",
            artist: "EQ:::" + artist,
            album_artist_grouped: 1,
            composer_grouped: 1,
            publisher_grouped: 1,
        };
        this.props.history.push("/artists/" + artist, {
            child_type: "album-list-artist",
            child_key: artist,
            child_request: request,
            child_page: 0,
            child_sort_type: "DESC",
            child_sort_column: "year",
            child_total_size: -1,
            artist_detail: 1,
        });
        removeActiveNavbar();
        let selected_navbar = document.getElementById("selected-navbar");
        selected_navbar.style.pointerEvents = "none";
        selected_navbar.style.opacity = 0;
    };
    artistClickPassthrough = event => {
        if (this.state.current_playlist.length > 0) {
            this.artistClick(
                this.state.current_playlist[this.state.current_index].artist
            );
        }
    };
    artistSongs = artist => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {
            specific: 1,
            results: "songs",
            artist: "EQ:::" + artist,
            album_artist_grouped: 1,
            composer_grouped: 1,
            publisher_grouped: 1,
        };
        this.props.history.push("/artists/" + artist, {
            child_type: "song-list-artist",
            child_key: artist,
            child_request: request,
            child_page: 0,
            child_sort_type: "DESC",
            child_sort_column: "year",
            child_total_size: -1,
            artist_detail: 1,
        });
        removeActiveNavbar();
    };
    artistList = () => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = { results: "artist" };
        this.props.history.push("/artists", {
            child_type: "artist-list",
            child_key: "artist-list",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "album_artist",
            child_total_size: -1,
        });
        removeActiveNavbar();
        document.getElementById("navbar-artists").classList.add("active");
    };
    updateNavigation = location => {
        if (location.pathname === "/" || location.state == null) {
            this.setState({
                child_type: "welcome",
                child_key: null,
                child_data: null,
                child_request: null,
                child_total_size: 0,
                child_page: 0,
                child_sort_column: null,
                child_sort_type: "ASC",
            });
            removeActiveNavbar();
            document.getElementById("navbar-home").classList.add("active");
        } else {
            let state = JSON.parse(JSON.stringify(location.state));
            let request = JSON.parse(JSON.stringify(state.child_request));
            request["base_params"]["first_result"] =
                pageLength * state.child_page;
            request["base_params"]["max_results"] = pageLength;
            request["base_params"]["order_by"] = state.child_sort_column;
            request["base_params"]["order_by_order"] = state.child_sort_type;
            if (state.child_total_size === -1) {
                request["base_params"]["get_total"] = 1;
            }

            if (
                state.child_type === "song-list-artist" ||
                state.child_type === "album-list-artist"
            ) {
                // for artist detail page, need to make a second request to get artist description information
                axios
                    .all([
                        axios.get(request["base_url"], {
                            params: request["base_params"],
                        }),
                        axios.get(
                            "/api/artist/" + encodeURIComponent(state.child_key)
                        ),
                    ])
                    .then(
                        axios.spread((response, artistresponse) => {
                            this.setState(
                                {
                                    child_type: state.child_type,
                                    child_key: state.child_key,
                                    child_request: state.child_request,
                                    child_data: response.data,
                                    child_total_size:
                                        state.child_total_size === -1
                                            ? response.data.total_size
                                            : state.child_total_size,
                                    child_page: state.child_page,
                                    child_sort_type: state.child_sort_type,
                                    child_sort_column: state.child_sort_column,
                                    child_extra: artistresponse.data,
                                },
                                () => {
                                    if (state.close_search_modal === true) {
                                        this.closeModals(null);
                                    }
                                }
                            );
                        })
                    )
                    .catch(error => {
                        if (state.close_search_modal === true) {
                            this.closeModals(null);
                        }
                        this.props.history.push("/", {});
                        console.log(error);
                    });
            } else {
                axios
                    .get(request["base_url"], {
                        params: request["base_params"],
                    })
                    .then(response => {
                        this.setState(
                            {
                                child_type: state.child_type,
                                child_key: state.child_key,
                                child_request: state.child_request,
                                child_data: response.data,
                                child_total_size:
                                    state.child_total_size === -1
                                        ? response.data.total_size
                                        : state.child_total_size,
                                child_page: state.child_page,
                                child_sort_type: state.child_sort_type,
                                child_sort_column: state.child_sort_column,
                                child_extra: null,
                            },
                            () => {
                                if (state.close_search_modal === true) {
                                    this.closeModals(null);
                                }
                            }
                        );
                    })
                    .catch(error => {
                        if (state.close_search_modal === true) {
                            this.closeModals(null);
                        }
                        this.props.history.push("/", {});
                        console.log(error);
                    });
            }
        }
    };
    openSearchModal = event => {
        document.getElementById("modal-cover").classList.add("modal-active");
        document.getElementById(
            "advanced-search-modal-content"
        ).style.visibility = "visible";
        document
            .getElementById("advanced-search-modal-content")
            .classList.add("modal-active");
        document.getElementById("advanced-search-submit").disabled = false;
    };
    closeModals = event => {
        if (
            document
                .getElementById("advanced-search-modal-content")
                .classList.contains("modal-active")
        ) {
            // search modal close
            document.getElementById(
                "advanced-search-modal-content"
            ).style.visibility = "hidden";
            document
                .getElementById("advanced-search-modal-content")
                .classList.remove("modal-active");
        } else {
            // edit modal close
            document.getElementById("edit-modal-content").style.visibility =
                "hidden";
            document
                .getElementById("edit-modal-content")
                .classList.remove("modal-active");
            setTimeout(() => {
                this.setState({ edit_type: null, edit_info: null });
            }, 1000);
        }
        document.getElementById("modal-cover").classList.remove("modal-active"); // remove opacity cover
    };
    handleAdvancedSearch = request => {
        this.props.history.push("/advancedsearch", {
            child_type: "song-list",
            child_key: "advanced-search",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "title",
            child_total_size: -1,
            close_search_modal: true,
        });
    };

    // song editing goes here
    editInfo = (type, info) => {
        this.openEditModal();
        let params = {};

        if (type === "song") {
            for (let i = 0; i < info.length; i++) {
                info[i] = info[i].id;
            }
            params["id"] = JSON.stringify(info);
        } else if (type === "songs") {
            let request = JSON.parse(JSON.stringify(this.state.child_request));
            params = request["base_params"];
        } else if (type === "card") {
            params = info;
        }

        params["first_result"] = 0;
        params["max_results"] = 100;
        params["results"] = 0;
        params["song_detail"] = 1;
        axios
            .get("/api/search/songs", {
                params: params,
            })
            .then(response => {
                this.setState({
                    edit_type: type,
                    edit_info: params,
                    edit_data: response.data.data,
                });
            })
            .catch(function(error) {
                console.log(error);
            });
    };
    openEditModal = event => {
        document.getElementById("edit-modal-loading").style.display = "block";
        document.getElementById("modal-cover").classList.add("modal-active");
        document.getElementById("edit-modal-content").style.visibility =
            "visible";
        document
            .getElementById("edit-modal-content")
            .classList.add("modal-active");
    };
    onEditSuccess = (propagating_changes, response) => {
        this.forceUpdate();
        let playlist = this.state.current_playlist;
        let image_id = response.data.image_id;
        for (let i = 0; i < response.data.data.length; i++) {
            let playlist_songs = document.getElementsByClassName(
                "playlist-song-id-" + response.data.data[i].id
            );
            if (playlist_songs.length > 0) {
                let rowIndex = playlist_songs[0].rowIndex;
                for (let j = 0; j < propagating_columns.length; j++) {
                    if (propagating_changes[propagating_columns[j]] != null) {
                        playlist[rowIndex - 1][propagating_columns[j]] =
                            propagating_changes[propagating_columns[j]];
                    }
                }
                if (image_id != null) {
                    playlist[rowIndex - 1]["image_id"] = image_id;
                }
            }
        }
        this.setState({
            current_playlist: playlist,
            next_id: getNextIndex(playlist, this.state.current_index),
        });
    };
    openImage = image_id => event => {
        if (image_id != null) {
            window.open(
                axios.defaults.baseURL +
                    "/api/song/" +
                    image_id +
                    "/picture?size=1000"
            );
        }
    };
    render() {
        const subcomponent_type = this.state.child_type;
        const shuffle = this.state.shuffle;
        let song_info = null;
        let image_id = null;
        let playlist_songs = [];
        // create the subcomponent
        let subcomponent = null;
        if (
            subcomponent_type === "song-list" ||
            subcomponent_type === "song-list-album" ||
            subcomponent_type === "song-list-artist"
        ) {
            subcomponent = (
                <SongList
                    key={this.state.child_key}
                    album_view={
                        subcomponent_type === "song-list-album" ? true : false
                    }
                    data={this.state.child_data}
                    total_size={this.state.child_total_size}
                    page={this.state.child_page}
                    setPlaylist={this.setPlaylist}
                    generatePlaylist={this.generatePlaylist}
                    onPageUpdate={this.onPageUpdate}
                    onSort={this.onSort}
                    addToPlaylist={this.addToPlaylist}
                    addAllToPlaylist={this.addAllToPlaylist}
                    updatePlaying={this.updatePlaying}
                    updateRatings={this.updateRatings}
                    albumClick={this.albumClick}
                    artistClick={this.artistClick}
                    artistDetails={this.state.child_extra}
                    artistSongs={this.artistSongs}
                    editInfo={this.editInfo}
                />
            );
        } else if (
            subcomponent_type === "album-list" ||
            subcomponent_type === "artist-list" ||
            subcomponent_type === "album-list-artist"
        ) {
            subcomponent = (
                <CardList
                    data={this.state.child_data}
                    total_size={this.state.child_total_size}
                    page={this.state.child_page}
                    setPlaylist={this.setPlaylist}
                    generatePlaylist={this.generatePlaylist}
                    onPageUpdate={this.onPageUpdate}
                    onSort={this.onSort}
                    addToPlaylist={this.addToPlaylist}
                    addAllToPlaylist={this.addAllToPlaylist}
                    albumClick={this.albumClick}
                    artistClick={this.artistClick}
                    albums={subcomponent_type === "artist-list" ? false : true}
                    artistDetails={this.state.child_extra}
                    artistSongs={this.artistSongs}
                    editInfo={this.editInfo}
                />
            );
        } else {
            subcomponent = <WelcomeTest />;
        }

        let edit_modal = null;
        if (this.state.edit_type != null) {
            edit_modal = (
                <EditModal
                    edit_type={this.state.edit_type}
                    edit_info={this.state.edit_info}
                    edit_data={this.state.edit_data}
                    onEditSuccess={this.onEditSuccess}
                    closeModals={this.closeModals}
                />
            );
        }

        // creates the playlistsong elements for the playlist
        if (this.state.current_playlist.length > 0) {
            song_info = this.state.current_playlist[this.state.current_index];
            document.title = song_info.title; // set title of page to the currently playing song's title
            image_id = song_info.image_id;
            let focus = this.state.playlistScroll / 46;
            for (let i = 0; i < this.state.current_playlist.length; i++) {
                // use the playlist_id as the key - this prevents us from having to rerender the playlistsong each time
                // we shuffle or add more songs to the queue, but it also technically makes the object immutable from the parent
                // the speed gains from this tradeoff is noticeable though
                playlist_songs.push(
                    <PlaylistSong
                        key={this.state.current_playlist[i].playlist_id}
                        type="active-playlist"
                        changeCurrentIndex={this.changeCurrentIndex}
                        song_info={this.state.current_playlist[i]}
                        updateRatings={this.updateRatings}
                        addToPlaylist={this.addToPlaylist}
                        onDrop={this.onPlaylistSongDrop}
                        onContextMenu={this.onContextMenu}
                        notVisible={
                            (i > focus - 20 && i < focus + 20) ||
                            i === this.state.current_index
                                ? false
                                : true
                        }
                        albumClick={this.albumClick}
                        artistClick={this.artistClick}
                        editInfo={this.editInfo}
                        getPlaylistEditData={this.getPlaylistEditData}
                    />
                );
            }
        } else {
            document.title = "React App";
        }

        const RoutingDummyWithProps = props => {
            return (
                <RoutingDummy
                    updateNavigation={this.updateNavigation}
                    {...props}
                />
            );
        };
        return (
            <div>
                {/* Link navigation */}
                <Route
                    path="/"
                    render={RoutingDummyWithProps}
                    updateNavigation={this.updateNavigation}
                />

                {/* The custom context menu goes here*/}
                <div
                    id="playlist-multi-context-menu"
                    className="dropdown-menu"
                    style={{ position: "fixed", zIndex: 6 }}
                >
                    <a onClick={this.addNext} className="dropdown-item">
                        Play Next
                    </a>
                    <a onClick={this.addQueue} className="dropdown-item">
                        Add to Queue
                    </a>
                    <a
                        onClick={this.getPlaylistEditData}
                        className="dropdown-item"
                    >
                        Edit Info
                    </a>
                </div>
                <div
                    id="playlist-single-context-menu"
                    className="dropdown-menu"
                    style={{ position: "fixed", zIndex: 6 }}
                >
                    <a onClick={this.addNext} className="dropdown-item">
                        Play Next
                    </a>
                    <a onClick={this.addQueue} className="dropdown-item">
                        Add to Queue
                    </a>
                    <a
                        onClick={this.getPlaylistEditData}
                        className="dropdown-item"
                    >
                        Edit Info
                    </a>
                </div>

                {/* The subcomponent pane - ex: a song list, the home page, etc. */}
                <div className="app" changed={this.state.changeCount}>
                    <Navbar
                        child_data={this.state.child_data}
                        current_playlist={this.state.current_playlist}
                        onSearchClick={this.onSearchClick}
                        addToPlaylist={this.addToPlaylist}
                        updateRatings={this.updateRatings}
                        welcomeScreen={this.welcomeScreen}
                        albumList={this.albumList}
                        songList={this.songList}
                        artistList={this.artistList}
                        openSearchModal={this.openSearchModal}
                        editInfo={this.editInfo}
                    />
                    {subcomponent}
                    <div
                        style={{
                            width: "100%",
                            textAlign: "center",
                            fontSize: 10,
                            color: "gray",
                        }}
                    >
                        Created by Erina, for personal use. Powered by React.
                    </div>
                </div>

                {/* The advanced search modal window and edit modal window goes here */}
                <div
                    id="modal-cover"
                    className="mymodal"
                    onClick={this.closeModals}
                />
                <div
                    id="advanced-search-modal-content"
                    className="mymodal-content"
                    style={{ overflow: "auto" }}
                >
                    <SearchModal
                        handleAdvancedSearch={this.handleAdvancedSearch}
                    />
                </div>
                <div
                    id="edit-modal-content"
                    className="mymodal-content"
                    style={{ overflow: "auto" }}
                >
                    <div id="edit-modal-loading" style={{ padding: 20 }}>
                        Loading...
                    </div>
                    {edit_modal}
                </div>

                {/* Playlist Pane Window */}
                <div
                    id="playlist-popup"
                    className="collapsed"
                    style={{
                        zIndex: 5,
                        pointerEvents: "none",
                        position: "fixed",
                        bottom: 100,
                        height: "100%",
                        width: "100%",
                    }}
                >
                    <div
                        id="playlist-pane"
                        style={{
                            position: "absolute",
                            right: 40,
                            bottom: 15,
                            overflow: "auto",
                            pointerEvents: "auto",
                            boxShadow: "3px 3px 10px " + activeColor,
                            width: 700,
                            height: "calc(100% - 200px)",
                            borderRadius: 0,
                            backgroundColor: "white",
                            border: "1px solid " + activeColor,
                            fontSize: "0.9rem",
                        }}
                        onScroll={this.onScroll}
                    >
                        {/* The table of songs is created here, and the playlistsong elements are populated here too */}
                        <table
                            id="playlist-table"
                            className="table"
                            style={{
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                tableLayout: "fixed",
                                minWidth: 100,
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            width: 60,
                                            paddingBottom: "0.45em",
                                            paddingLeft: "1em",
                                        }}
                                        scope="col"
                                    >
                                        <i
                                            className="material-icons"
                                            style={{ fontSize: 20 }}
                                        >
                                            schedule
                                        </i>
                                    </th>
                                    <th scope="col">Song</th>
                                    <th style={{ width: 40 }} scope="col" />
                                    <th
                                        style={{
                                            width: 100,
                                            paddingBottom: "0.45em",
                                            paddingLeft: "2.5em",
                                        }}
                                        scope="col"
                                    >
                                        <i
                                            className="material-icons"
                                            style={{ fontSize: 20 }}
                                        >
                                            star
                                        </i>
                                    </th>
                                    <th
                                        style={{
                                            width: 60,
                                            paddingBottom: "0.45em",
                                            paddingLeft: "0.5em",
                                        }}
                                        scope="col"
                                    >
                                        <i
                                            className="material-icons"
                                            style={{ fontSize: 20 }}
                                        >
                                            audiotrack
                                        </i>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>{playlist_songs}</tbody>
                        </table>
                    </div>
                    {/* The little arrow for the playlist pane popup */}
                    <div
                        id="arrow-down"
                        style={{
                            position: "absolute",
                            right: 60,
                            bottom: 5,
                            width: 0,
                            height: 0,
                            borderLeft: "10px solid transparent",
                            borderRight: "10px solid transparent",
                            borderTop: "10px solid" + activeColor,
                        }}
                    />
                </div>

                {/* The bottom navbar - the fixed audioplayer */}
                <nav
                    style={{
                        position: "fixed",
                        bottom: 0,
                        width: "100%",
                        height: "10%",
                        minHeight: 100,
                        maxHeight: 100,
                        zIndex: 10,
                    }}
                    className="navbar navbar-expand-lg navbar-light bg-light"
                >
                    <audio
                        id="audio"
                        onTimeUpdate={this.timeUpdate}
                        onEnded={() => this.getNext()}
                    />
                    <audio
                        id="audio2"
                        onTimeUpdate={this.timeUpdate}
                        onEnded={() => this.getNext()}
                    />
                    <div style={{ position: "relative", width: "100%" }}>
                        <div
                            style={{
                                position: "absolute",
                                left: "43%",
                                top: -28,
                                userSelect: "none",
                            }}
                        >
                            <a onClick={() => this.toggleShuffle()}>
                                <i
                                    className="material-icons"
                                    style={{
                                        fontSize: 24,
                                        top: -5,
                                        position: "relative",
                                        cursor: "pointer",
                                        paddingRight: 30,
                                        color: shuffle
                                            ? activeColor
                                            : inactiveColor,
                                    }}
                                >
                                    shuffle
                                </i>
                            </a>

                            <a
                                className="player-previous"
                                onClick={() => this.getPrevious()}
                            >
                                <i
                                    className="material-icons"
                                    style={{ fontSize: 36, cursor: "pointer" }}
                                >
                                    skip_previous
                                </i>
                            </a>
                            <a
                                className={
                                    "player-play-pause " +
                                    (this.state.playStatus === "play"
                                        ? "playing"
                                        : "paused")
                                }
                                onClick={() => this.togglePlay()}
                            >
                                <i
                                    className="material-icons"
                                    style={{
                                        fontSize: 48,
                                        top: 5,
                                        position: "relative",
                                        paddingLeft: 5,
                                        paddingRight: 5,
                                        cursor: "pointer",
                                    }}
                                >
                                    {this.state.playStatus === "play"
                                        ? "pause"
                                        : "play_arrow"}
                                </i>
                            </a>
                            <a
                                className="player-next"
                                onClick={() => this.getNext()}
                            >
                                <i
                                    className="material-icons"
                                    style={{ fontSize: 36, cursor: "pointer" }}
                                >
                                    skip_next
                                </i>
                            </a>

                            <a>
                                <i
                                    className="material-icons"
                                    style={{
                                        fontSize: 24,
                                        top: -5,
                                        position: "relative",
                                        cursor: "pointer",
                                        paddingLeft: 30,
                                        color: activeColor,
                                    }}
                                >
                                    repeat
                                </i>
                            </a>
                        </div>

                        <div
                            onClick={this.openImage(image_id)}
                            style={{
                                cursor: "pointer",
                                position: "absolute",
                                left: -16,
                                top: -50,
                                height: 100,
                                width: 100,
                                overflow: "hidden",
                                backgroundPosition: "center center",
                                backgroundRepeat: "no-repeat",
                                backgroundImage:
                                    image_id == null
                                        ? "url('test.jpg')"
                                        : "url('" +
                                          axios.defaults.baseURL +
                                          "/api/song/" +
                                          image_id +
                                          "/picture?size=100')",
                            }}
                        />
                        <div
                            id="player-now-playing-title"
                            style={{
                                position: "absolute",
                                left: 100,
                                top: -20,
                            }}
                        >
                            {song_info == null ? "" : song_info.title}
                        </div>
                        <div
                            id="player-now-playing-artist"
                            style={{
                                position: "absolute",
                                left: 100,
                                top: 5,
                                fontSize: 12,
                            }}
                        >
                            {song_info == null ? (
                                ""
                            ) : (
                                <div>
                                    <span
                                        className="detail-page-link"
                                        onClick={this.artistClickPassthrough}
                                    >
                                        {song_info.artist}
                                    </span>
                                    <span> - </span>
                                    <span
                                        className="detail-page-link"
                                        onClick={this.albumClickPassthrough}
                                    >
                                        {song_info.album}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div
                            onClick={this.seek}
                            style={{
                                position: "absolute",
                                left: 84,
                                top: -50,
                                width: "calc(100% - 69px)",
                                height: 5,
                                backgroundColor: "#E0E0E0",
                            }}
                        />
                        <div
                            id="audio-seeker-progress"
                            className="seeker"
                            style={{
                                position: "absolute",
                                left: 84,
                                top: -50,
                                width: "0",
                                height: 5,
                                backgroundColor: activeColor,
                                pointerEvents: "none",
                            }}
                        />

                        <div
                            onClick={this.togglePlaylistPane}
                            style={{
                                position: "absolute",
                                right: 40,
                                top: -14,
                                userSelect: "none",
                            }}
                        >
                            <a>
                                <i
                                    className="material-icons"
                                    style={{ fontSize: 32, cursor: "pointer" }}
                                >
                                    queue_music
                                </i>
                            </a>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
    componentDidUpdate(prevProps, prevState) {
        // update the currently playing songs whenever this component updates (since that means the playlist likely changed somehow)
        this.updatePlaying();

        // updates the second audio object
        if (
            this.state.current_playlist.length > 0 &&
            prevState.next_id !== this.state.next_id &&
            this.state.next_id != null
        ) {
            let next_id = this.state.next_id;
            setTimeout(() => {
                if (next_id !== this.state.next_id) {
                    return;
                }
                let next_audio =
                    this.state.active_audio === "audio" ? "audio2" : "audio";
                let audio = document.getElementById(next_audio);
                audio.pause();
                audio.src =
                    "http://stella.test/api/song/" +
                    this.state.next_id +
                    "/audio?bitrate=320&remove_metadata=1";
                audio.load();
            }, 1000);
        }
    }
}

class RoutingDummy extends React.Component {
    render() {
        return null;
    }
    componentDidUpdate(prevProps) {
        if (this.props.location.key !== prevProps.location.key) {
            this.props.updateNavigation(this.props.location);
        }
    }
    componentDidMount() {
        this.props.updateNavigation(this.props.location);
    }
}

// upon any window click, remove all currently active dropdowns
window.addEventListener("click", event => {
    if (!event.target.matches(".dropdown-button")) {
        let dropdowns = document.getElementsByClassName("dropdown-menu show");
        while (dropdowns.length > 0) {
            dropdowns[0].classList.remove("show");
        }
    }
});

window.addEventListener("scroll", event => {
    let dropdowns = document.getElementsByClassName("dropdown-menu show");
    while (dropdowns.length > 0) {
        dropdowns[0].classList.remove("show");
    }
});

// REACT ========================================

const AudioAppRouter = withRouter(AudioApp);
ReactDOM.render(
    <BrowserRouter>
        <AudioAppRouter />
    </BrowserRouter>,
    document.getElementById("root")
);
