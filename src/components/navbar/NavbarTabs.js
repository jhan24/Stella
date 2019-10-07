// @flow

import React from "react";
import { removeActiveNavbar } from "../../utils.js";
import type { RouteInfo } from "../../types.js";

type Props = {| onTabClicked: (string, RouteInfo) => void |};

export default class NavbarTabs extends React.Component<Props> {
    updateTabState = () => {};
    onHome = () => {
        this.props.onTabClicked("/", {
            child_type: "welcome",
            child_key: "welcome",
        });
    };
    onSongList = () => {
        const request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = {};
        this.props.onTabClicked("/songs", {
            child_type: "song-list",
            child_key: "song-list",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "title",
            child_total_size: -1,
        });
        removeActiveNavbar();
        const tab = document.getElementById("navbar-songs");
        if (tab != null) {
            tab.classList.add("active");
        }
    };
    onArtistList = () => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = { results: "artist" };
        this.props.onTabClicked("/artists", {
            child_type: "artist-list",
            child_key: "artist-list",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "album_artist",
            child_total_size: -1,
        });
        removeActiveNavbar();
        const tab = document.getElementById("navbar-artists");
        if (tab != null) {
            tab.classList.add("active");
        }
    };
    onAlbumList = () => {
        let request = {};
        request["base_url"] = "/api/search/songs";
        request["base_params"] = { results: "album" };
        this.props.onTabClicked("/albums", {
            child_type: "album-list",
            child_key: "album-list",
            child_request: request,
            child_page: 0,
            child_sort_type: "ASC",
            child_sort_column: "album",
            child_total_size: -1,
        });
        removeActiveNavbar();
        const tab = document.getElementById("navbar-albums");
        if (tab != null) {
            tab.classList.add("active");
        }
    };
    onAdvancedSearch = () => {
        // TODO: after refactoring search modal, use state instead of class
        const modal = document.getElementById("modal-cover");
        if (modal == null) {
            throw String("advanced search modal is missing");
        }
        modal.classList.add("modal-active");

        const modal_content = document.getElementById(
            "advanced-search-modal-content"
        );
        if (modal_content == null) {
            throw String("advanced search modal is missing");
        }
        modal_content.style.visibility = "visible";
        modal_content.classList.add("modal-active");

        const modal_submit = document.getElementById("advanced-search-submit");
        if (modal_submit == null) {
            throw String("advanced search modal is missing");
        }
        (modal_submit: any).disabled = false;
    };
    render() {
        return (
            <ul className="navbar-nav mr-auto">
                <li
                    id="navbar-home"
                    className="nav-item active main-navbar-item"
                >
                    <a onClick={this.onHome} className="nav-link">
                        Home
                    </a>
                </li>
                <li id="navbar-songs" className="nav-item main-navbar-item">
                    <a onClick={this.onSongList} className="nav-link">
                        Songs
                    </a>
                </li>
                <li id="navbar-artists" className="nav-item main-navbar-item">
                    <a onClick={this.onArtistList} className="nav-link">
                        Artists
                    </a>
                </li>
                <li id="navbar-albums" className="nav-item main-navbar-item">
                    <a onClick={this.onAlbumList} className="nav-link">
                        Albums
                    </a>
                </li>
                <li
                    id="navbar-advanced-search"
                    className="nav-item main-navbar-item"
                >
                    <a onClick={this.onAdvancedSearch} className="nav-link">
                        Advanced Search
                    </a>
                </li>
            </ul>
        );
    }
}
