// @flow

import React from "react";

export type SearchType = "song" | "album" | "album_artist" | "artist";

type Props = {|
    +active_id: SearchType,
    +id: SearchType,
    +onClick: SearchType => void,
|};

export default class NavbarSearchTypeButton extends React.Component<Props> {
    onClick = (_event: SyntheticEvent<>): void => {
        this.props.onClick(this.props.id);
    };
    getLabel(): string {
        const id = this.props.id;
        switch (id) {
            case "song":
                return "Songs";
            case "album":
                return "Albums";
            case "album_artist":
                return "Artists";
            case "artist":
                return "All Artists";
            default:
                (id: empty);
                throw new String("Invalid id passed to NavbarSearchButton");
        }
    }
    render() {
        const { active_id, id } = this.props;
        const active_class = active_id === id ? "active" : "";
        const label = this.getLabel();
        return (
            <label
                className={"btn btn-outline-success " + active_class}
                onClick={this.onClick}
            >
                <input
                    type="radio"
                    name="options"
                    id={id + "-rb"}
                    autoComplete="off"
                />
                {label}
            </label>
        );
    }
}
