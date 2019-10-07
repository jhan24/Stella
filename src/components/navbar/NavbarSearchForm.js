// @flow

import React from "react";
import NavbarSearchTypeButton, {
    search_type,
} from "./NavbarSearchTypeButton.js";

import type { SearchType } from "./NavbarSearchTypeButton.js";

type Props = {| onSubmit: (string, SearchType) => void |};
type State = {| search: string, selected_id: SearchType |};

export default class NavbarSearchForm extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            search: "",
            selected_id: "song",
        };
    }

    onSearchTypeClick = (type: SearchType) => {
        this.setState({ selected_id: type });
    };

    onSubmit = (event: SyntheticEvent<>) => {
        event.preventDefault();
        this.props.onSubmit(this.state.search, this.state.selected_id);
    };

    onTextChange = (event: SyntheticEvent<HTMLInputElement>) => {
        (event.currentTarget: HTMLInputElement);
        this.setState({ search: event.currentTarget.value });
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
            <form
                className="form-inline my-2 my-lg-0"
                onSubmit={this.onSubmit}
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
                    onChange={this.onTextChange}
                />
                <button
                    className="btn btn-outline-success my-2 my-sm-0"
                    type="submit"
                >
                    Search
                </button>
            </form>
        );
    }
}
