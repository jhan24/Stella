// @flow

import React from "react";
import NavbarSearchTypeButton, {
    search_type,
} from "./NavbarSearchTypeButton.js";
import NavbarForSelectedItems from "./NavbarForSelectedItems.js";

import type { SearchType } from "./NavbarSearchTypeButton.js";
import type { Id } from "../../types.js";

type Props = { updateRatings: (number, Array<Id>) => void } & any;
type State = {| search: string, selected_id: SearchType |};

export default class Navbar extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            search: "",
            selected_id: "song",
        };
    }
    handleSubmit = (event: SyntheticEvent<>) => {
        event.preventDefault();
        this.props.onSearchClick(this.state.search, this.state.selected_id);
    };
    handleChange = (event: SyntheticEvent<HTMLInputElement>) => {
        (event.currentTarget: HTMLInputElement);
        this.setState({ search: event.currentTarget.value });
    };
    onSearchTypeClick = (type: SearchType) => {
        this.setState({ selected_id: type });
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
        const search_buttons = Object.keys(search_type).map(type => {
            return (
                <NavbarSearchTypeButton
                    key={type}
                    active_type={this.state.selected_id}
                    onClick={this.onSearchTypeClick}
                    type={type}
                />
            );
        });
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
                                {search_buttons}
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

                <NavbarForSelectedItems
                    child_data={this.props.child_data}
                    current_playlist={this.props.current_playlist}
                    onAddToPlaylist={this.props.addToPlaylist}
                    onEditInfo={this.props.editInfo}
                    onUpdateRatings={this.props.updateRatings}
                />
            </div>
        );
    }
}
