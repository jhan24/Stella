// @flow

import React from "react";
import { removeActiveNavbar } from "../../Utils.js";
import type { ChildType, RouteInfo } from "../../Types.js";

type Props = {|
    onTabClicked: (string, RouteInfo) => void,
    selected_tab: ChildType,
|};

export default class NavbarTabs extends React.Component<Props> {
    onHome = () => {
        this.props.onTabClicked("/", {
            child_type: "home",
            child_key: "home",
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
                <NavbarTab
                    id={"navbar-home"}
                    name={"Home"}
                    onClick={this.onHome}
                    selected={this.props.selected_tab}
                    type={"home"}
                />
                <NavbarTab
                    id={"navbar-songs"}
                    name={"Songs"}
                    onClick={this.onSongList}
                    selected={this.props.selected_tab}
                    type={"song-list"}
                />
                <NavbarTab
                    id={"navbar-artists"}
                    name={"Artists"}
                    onClick={this.onArtistList}
                    selected={this.props.selected_tab}
                    type={"artist-list"}
                />
                <NavbarTab
                    id={"navbar-albums"}
                    name={"Albums"}
                    onClick={this.onAlbumList}
                    selected={this.props.selected_tab}
                    type={"album-list"}
                />
                <NavbarTab
                    id={"navbar-advanced-search"}
                    name={"Advanced Search"}
                    onClick={this.onAdvancedSearch}
                    selected={this.props.selected_tab}
                    type={null}
                />
            </ul>
        );
    }
}

type TabProps = {|
    id: string,
    name: string,
    onClick: () => void,
    selected: ChildType,
    type: ?ChildType,
|};
class NavbarTab extends React.Component<TabProps> {
    onClick = () => {
        this.props.onClick();
    };
    render() {
        const active = this.props.type === this.props.selected ? "active" : "";
        return (
            <li
                id={this.props.id}
                className={"nav-item main-navbar-item " + active}
            >
                <a onClick={this.onClick} className="nav-link">
                    {this.props.name}
                </a>
            </li>
        );
    }
}
