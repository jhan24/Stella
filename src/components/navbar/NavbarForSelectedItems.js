// @flow

import React from "react";
import { getSelectedRows } from "../../componentUtils.js";

import type { EditType, Song } from "../../types.js";

type Props = {|
    child_data: any,
    current_playlist: Array<Song>,
    onAddToPlaylist: (Array<Song>, number) => void,
    onEditInfo: (EditType, Array<Song>) => void,
    onUpdateRatings: (number, Array<number>) => void,
|};

export default class NavbarForSelectedItems extends React.Component<Props> {
    onAddNext = (event: SyntheticEvent<>) => {
        this.props.onAddToPlaylist(
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            1
        );
    };

    onAddToQueue = (event: SyntheticEvent<>) => {
        this.props.onAddToPlaylist(
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            0
        );
    };

    onEditInfo = (event: SyntheticEvent<>) => {
        this.props.onEditInfo(
            "song",
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            )
        );
    };

    onUpdateRating = (new_rating: number) => (event: SyntheticEvent<>) => {
        // get the selected elements
        const selected: any = document.getElementsByClassName("table-selected");
        let list = this.props.current_playlist;
        if (selected.length > 0 && selected[0].classList.contains("song-row")) {
            list = this.props.child_data.data;
        }

        // map the selected elements to the data
        const song_ids = [];
        for (let i = 0; i < selected.length; i++) {
            song_ids.push(list[selected[i].rowIndex - 1].id);
        }

        // parent processing
        this.props.onUpdateRatings(new_rating, song_ids);

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

    render() {
        return (
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
                            <a onClick={this.onAddNext} className="nav-link">
                                Play Next
                            </a>
                        </li>
                        <li className="nav-item">
                            <a onClick={this.onAddToQueue} className="nav-link">
                                Add to Queue
                            </a>
                        </li>
                        <li className="nav-item">
                            <a onClick={this.onEditInfo} className="nav-link">
                                Edit Info
                            </a>
                        </li>
                        <li className="nav-item">
                            <div style={{ position: "relative" }}>
                                <i
                                    id="navbar-rating-1"
                                    onClick={this.onUpdateRating(1)}
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
                                    onClick={this.onUpdateRating(64)}
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
                                    onClick={this.onUpdateRating(128)}
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
                                    onClick={this.onUpdateRating(196)}
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
                                    onClick={this.onUpdateRating(255)}
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
        );
    }
}
