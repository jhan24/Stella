// @flow

import React from "react";
import NavbarForSelectedItems from "./NavbarForSelectedItems.js";
import NavbarSearchForm from "./NavbarSearchForm.js";
import NavbarTabs from "./NavbarTabs.js";

import type { Id } from "../../types.js";

type Props = { updateRatings: (number, Array<Id>) => void } & any;

export default class Navbar extends React.Component<Props> {
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
                        <NavbarTabs onTabClicked={this.props.onTabClicked} />

                        <NavbarSearchForm onSubmit={this.props.onSearchClick} />
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
