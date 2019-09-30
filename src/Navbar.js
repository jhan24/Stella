import React from "react"
import { getSelectedRows } from "./componentUtils.js"

export default class Navbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            search: "",
            selected: 0,
            stars: [
                "star_border",
                "star_border",
                "star_border",
                "star_border",
                "star_border",
            ],
        }
    }
    handleSubmit = event => {
        event.preventDefault()
        this.props.onSearchClick(this.state.search, this.state.selected)
    }
    handleChange = event => {
        this.setState({ search: event.target.value })
    }
    onSearchType = type => event => {
        this.setState({ selected: type })
    }
    addNext = event => {
        this.props.addToPlaylist(
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            1
        )
    }
    addQueue = event => {
        this.props.addToPlaylist(
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            ),
            0
        )
    }
    editInfo = event => {
        this.props.editInfo(
            "song",
            getSelectedRows(
                this.props.current_playlist,
                this.props.child_data.data
            )
        )
    }
    updateRating = new_rating => event => {
        let selected = document.getElementsByClassName("table-selected")
        let list = this.props.current_playlist
        if (selected.length > 0 && selected[0].classList.contains("song-row")) {
            list = this.props.child_data.data
        }
        let song_ids = []
        for (let i = 0; i < selected.length; i++) {
            song_ids.push(list[selected[i].rowIndex - 1].id)
        }
        this.props.updateRatings(new_rating, song_ids)

        // modify the navbar rating stars
        let rating_stars = document.getElementsByClassName("navbar-rating")
        let rating_tier = Math.floor((new_rating + 32) / 64) + 1
        for (let i = 0; i < rating_stars.length; i++) {
            if (i < rating_tier) {
                rating_stars[i].innerHTML = "star"
            } else {
                rating_stars[i].innerHTML = "star_border"
            }
        }
    }
    onMouseEnter = event => {
        document.getElementById("search-button-group").style.opacity = 100
    }
    onMouseLeave = event => {
        document.getElementById("search-button-group").style.opacity = 0
    }
    render() {
        const stars = this.state.stars
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
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
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
                                <label
                                    className="btn btn-outline-success active"
                                    onClick={this.onSearchType(0)}
                                >
                                    <input
                                        type="radio"
                                        name="options"
                                        id="song-rb"
                                        autoComplete="off"
                                    />
                                    Songs
                                </label>
                                <label
                                    className="btn btn-outline-success"
                                    onClick={this.onSearchType(1)}
                                >
                                    <input
                                        type="radio"
                                        name="options"
                                        id="album-rb"
                                        autoComplete="off"
                                    />
                                    Albums
                                </label>
                                <label
                                    className="btn btn-outline-success"
                                    onClick={this.onSearchType(2)}
                                >
                                    <input
                                        type="radio"
                                        name="options"
                                        id="album_artist-rb"
                                        autoComplete="off"
                                    />
                                    Artists
                                </label>
                                <label
                                    className="btn btn-outline-success"
                                    onClick={this.onSearchType(3)}
                                >
                                    <input
                                        type="radio"
                                        name="options"
                                        id="artist-rb"
                                        autoComplete="off"
                                    />
                                    All Artists
                                </label>
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
                                        {stars[0]}
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
                                        {stars[1]}
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
                                        {stars[2]}
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
                                        {stars[3]}
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
                                        {stars[4]}
                                    </i>
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        )
    }
}
