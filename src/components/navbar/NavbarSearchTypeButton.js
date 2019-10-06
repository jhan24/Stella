// @flow

import React from "react";

export const search_type = {
    song: "Songs",
    album: "Albums",
    album_artist: "Artists",
    artist: "All Artists",
};

export type SearchType = $Keys<typeof search_type>;

type Props = {|
    +active_type: SearchType,
    +type: SearchType,
    +onClick: SearchType => void,
|};

export default class NavbarSearchTypeButton extends React.Component<Props> {
    onClick = (_event: SyntheticEvent<>): void => {
        this.props.onClick(this.props.type);
    };
    
    render() {
        const { active_type, type } = this.props;
        const active_class = active_type === type ? "active" : "";
        const label = search_type[type];
        return (
            <label
                className={"btn btn-outline-success " + active_class}
                onClick={this.onClick}
            >
                <input
                    type="radio"
                    name="options"
                    id={type + "-rb"}
                    autoComplete="off"
                />
                {label}
            </label>
        );
    }
}
