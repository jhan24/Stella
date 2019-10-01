// @flow

import React from "react";

export type NavbarSearchTypeButtonID =
    | "song"
    | "album"
    | "album_artist"
    | "artist";

type Props = {|
    +activeId: NavbarSearchTypeButtonID,
    +id: NavbarSearchTypeButtonID,
    +onClick: NavbarSearchTypeButtonID => void,
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
        const { activeId, id } = this.props;
        const activeClass = activeId === id ? "active" : "";
        const label = this.getLabel();
        return (
            <label
                className={"btn btn-outline-success " + activeClass}
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
