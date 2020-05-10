// @flow

import React from "react";

import { getSelectedSongs } from "../../Utils.js";
import NavbarRatingStar from "./NavbarRatingStar.js";

import type { EditType, Id, Song } from "../../Types.js";

type Props = {|
    +child_data: any,
    +current_playlist: Array<Song>,
    +onAddToPlaylist: (Array<Song>, number) => void,
    +onEditInfo: (EditType, Array<Song>) => void,
    +onUpdateRatings: (number, Array<Id>) => void,
|};

type State = {| display_value: number |};

export default class NavbarForSelectedItems extends React.Component<
    Props,
    State
> {
    state: State = { display_value: 0 };

    onAddNext = (event: SyntheticEvent<>) => {
        this.props.onAddToPlaylist(
            getSelectedSongsFromSource(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            1
        );
    };

    onAddToQueue = (event: SyntheticEvent<>) => {
        this.props.onAddToPlaylist(
            getSelectedSongsFromSource(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            0
        );
    };

    onEditInfo = (event: SyntheticEvent<>) => {
        this.props.onEditInfo(
            "song",
            getSelectedSongsFromSource(
                this.props.current_playlist,
                this.props.child_data.data
            )
        );
    };

    onUpdateRating = (new_rating: number) => {
        // get the selected elements
        const selected: any = document.getElementsByClassName("table-selected");
        let list = this.props.current_playlist;
        if (selected.length > 0 && selected[0].classList.contains("song-row")) {
            list = this.props.child_data.data;
        }

        // map the selected elements to the data
        const song_ids: Array<Id> = [];
        for (let i = 0; i < selected.length; i++) {
            song_ids.push(list[selected[i].rowIndex - 1].id);
        }

        // parent processing
        this.props.onUpdateRatings(new_rating, song_ids);

        // modify the navbar rating stars
        this.setState({ display_value: new_rating });
    };

    render() {
        const rating_tiers = [1, 64, 128, 196, 256];
        const rating_star_components = rating_tiers.map((rating) => {
            return (
                <NavbarRatingStar
                    key={rating}
                    onUpdateRating={this.onUpdateRating}
                    value={rating}
                    value_to_display={this.state.display_value}
                />
            );
        });

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
                                {rating_star_components}
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

// if play next / add to queue are selected from navbar, we need to figure
// out which song list the selection came from (playlist or song table)
function getSelectedSongsFromSource(
    playlist: Array<Song>,
    song_list: Array<Song>
): Array<Song> {
    const selected: any = document.getElementsByClassName("table-selected");
    if (selected.length === 0) {
        return [];
    }

    if (selected[0].classList.contains("song-row")) {
        return getSelectedSongs(song_list);
    } else {
        return getSelectedSongs(playlist);
    }
}
