// @flow

import React from "react";
import { getSelectedRows } from "../../componentUtils.js";
import NavbarSearchTypeButton from "./NavbarSearchTypeButton.js";

import type { NavbarSearchTypeButtonID } from "./NavbarSearchTypeButton.js";

type Props = any;
type State = {| search: string, selected: NavbarSearchTypeButtonID |};

export default class Navbar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            search: "",
            selected: "song",
        };
    }
    handleSubmit = (event: SyntheticEvent<>) => {
        event.preventDefault();
        this.props.onSearchClick(this.state.search, this.state.selected);
    };
    handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
        (event.currentTarget: HTMLInputElement);
        this.setState({ search: event.currentTarget.value });
    };
    onSearchTypeClick = (type: NavbarSearchTypeButtonID) => {
        this.setState({ selected: type });
    };
    addNext = (event: SyntheticEvent<>) => {
        this.props.addToPlaylist(
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            1
        );
    };
    addQueue = (event: SyntheticEvent<>) => {
        this.props.addToPlaylist(
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            0
        );
    };
    editInfo = (event: SyntheticEvent<>) => {
        this.props.editInfo(
            "song",
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            )
        );
    };
    updateRating = (new_rating: number) => (event: SyntheticEvent<>) => {
        const selected: any = document.getElementsByClassName("table-selected");
        let list = this.props.current_playlist;
        if (selected.length > 0 && selected[0].classList.contains("song-row")) {
            list = this.props.child_data.data;
        }
        const song_ids = [];
        for (let i = 0; i < selected.length; i++) {
            song_ids.push(list[selected[i].rowIndex - 1].id);
        }
        this.props.updateRatings(new_rating, song_ids);

        // modify the navbar rating stars
        const rating_stars = document.getElementsByClassName("navbar-rating");
        const rating_tier = Math.floor((new_rating + 32) / 64) + 1;
        for (let i = 0; i < rating_stars.length; i++) {
            if (i < rating_tier) {
                rating_stars[i].innerHTML = "star";
            } else {
                rating_stars[i].innerHTML = "star_border";
            }
        }
    };
    onMouseEnterSearchOptions = (event: SyntheticEvent<>) => {
        const element = document.getElementById("search-button-group");
        if (element != null) {
            element.style.opacity = "100";
        }
    };
    onMouseLeaveSearchOptions = (event: SyntheticEvent<>) => {
        const element = document.getElementById("search-button-group");
        if (element != null) {
            element.style.opacity = "0";
        }
    };
    render() {
        return (
            <div>
                <nav
                    style={{
                        position: "fixed",
                        top: 0,
                        width: "100%",
                        zIndex: 10,
                    }}
                    id="main-navbar"
                    className="navbar navbar-expand-lg navbar-light bg-light"
                    onMouseEnter={this.onMouseEnterSearchOptions}
                    onMouseLeave={this.onMouseLeaveSearchOptions}
                >
                    <a className="navbar-brand">Stella</a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="navbarSupportedContent"
                    >
                        <ul className="navbar-nav mr-auto">
                            <li
                                id="navbar-home"
                                className="nav-item active main-navbar-item"
                            >
                                <a
                                    onClick={this.props.welcomeScreen}
                                    className="nav-link"
                                >
                                    Home
                                </a>
                            </li>
                            <li
                                id="navbar-songs"
                                className="nav-item main-navbar-item"
                            >
                                <a
                                    onClick={this.props.songList}
                                    className="nav-link"
                                >
                                    Songs
                                </a>
                            </li>
                            <li
                                id="navbar-artists"
                                className="nav-item main-navbar-item"
                            >
                                <a
                                    onClick={this.props.artistList}
                                    className="nav-link"
                                >
                                    Artists
                                </a>
                            </li>
                            <li
                                id="navbar-albums"
                                className="nav-item main-navbar-item"
                            >
                                <a
                                    onClick={this.props.albumList}
                                    className="nav-link"
                                >
                                    Albums
                                </a>
                            </li>
                            <li
                                id="navbar-advanced-search"
                                className="nav-item main-navbar-item"
                            >
                                <a
                                    onClick={this.props.openSearchModal}
                                    className="nav-link"
                                >
                                    Advanced Search
                                </a>
                            </li>
                        </ul>

                        <form
                            className="form-inline my-2 my-lg-0"
                            onSubmit={this.handleSubmit}
                        >
                            <div
                                id="search-button-group"
                                className="btn-group btn-group-toggle"
                                style={{ opacity: 0, paddingRight: 10 }}
                                data-toggle="buttons"
                            >
                                <NavbarSearchTypeButton
                                    id="song"
                                    onClick={this.onSearchTypeClick}
                                    activeId={this.state.selected}
                                />
                                <NavbarSearchTypeButton
                                    id="album"
                                    onClick={this.onSearchTypeClick}
                                    activeId={this.state.selected}
                                />
                                <NavbarSearchTypeButton
                                    id="album_artist"
                                    onClick={this.onSearchTypeClick}
                                    activeId={this.state.selected}
                                />
                                <NavbarSearchTypeButton
                                    id="artist"
                                    onClick={this.onSearchTypeClick}
                                    activeId={this.state.selected}
                                />
                            </div>
                            <input
                                id="generic-search-input"
                                className="form-control mr-sm-2"
                                type="search"
                                placeholder="Search"
                                autoComplete="off"
                                aria-label="Search"
                                value={this.state.search}
                                onChange={this.handleChange}
                            />
                            <button
                                className="btn btn-outline-success my-2 my-sm-0"
                                type="submit"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </nav>

                <nav
                    style={{
                        position: "fixed",
                        top: 0,
                        width: "100%",
                        zIndex: 11,
                        pointerEvents: "none",
                        opacity: 0,
                    }}
                    id="selected-navbar"
                    className="navbar navbar-expand-lg navbar-light bg-light"
                >
                    <a className="navbar-brand">Stella</a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="navbarSupportedContent"
                    >
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <a id="selected-counter" className="nav-link">
                                    # Selected
                                </a>
                            </li>
                            <li className="nav-item">
                                <a onClick={this.addNext} className="nav-link">
                                    Play Next
                                </a>
                            </li>
                            <li className="nav-item">
                                <a onClick={this.addQueue} className="nav-link">
                                    Add to Queue
                                </a>
                            </li>
                            <li className="nav-item">
                                <a onClick={this.editInfo} className="nav-link">
                                    Edit Info
                                </a>
                            </li>
                            <li className="nav-item">
                                <div style={{ position: "relative" }}>
                                    <i
                                        id="navbar-rating-1"
                                        onClick={this.updateRating(1)}
                                        className="navbar-rating material-icons song-icon-button"
                                        style={{
                                            color: "gray",
                                            top: 8,
                                            left: 5,
                                        }}
                                    >
                                        {"star_border"}
                                    </i>
                                    <i
                                        id="navbar-rating-2"
                                        onClick={this.updateRating(64)}
                                        className="navbar-rating material-icons song-icon-button"
                                        style={{
                                            color: "gray",
                                            top: 8,
                                            left: 25,
                                        }}
                                    >
                                        {"star_border"}
                                    </i>
                                    <i
                                        id="navbar-rating-3"
                                        onClick={this.updateRating(128)}
                                        className="navbar-rating material-icons song-icon-button"
                                        style={{
                                            color: "gray",
                                            top: 8,
                                            left: 45,
                                        }}
                                    >
                                        {"star_border"}
                                    </i>
                                    <i
                                        id="navbar-rating-4"
                                        onClick={this.updateRating(196)}
                                        className="navbar-rating material-icons song-icon-button"
                                        style={{
                                            color: "gray",
                                            top: 8,
                                            left: 65,
                                        }}
                                    >
                                        {"star_border"}
                                    </i>
                                    <i
                                        id="navbar-rating-5"
                                        onClick={this.updateRating(255)}
                                        className="navbar-rating material-icons song-icon-button"
                                        style={{
                                            color: "gray",
                                            top: 8,
                                            left: 85,
                                        }}
                                    >
                                        {"star_border"}
                                    </i>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        );
    }
}
