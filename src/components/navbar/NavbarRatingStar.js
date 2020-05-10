// @flow

import React from "react";

import { ratingToTier } from "../../utils.js";

type Props = {|
    +onUpdateRating: (number) => void,
    +value: number,
    +value_to_display: number,
|};

export default class NavbarRatingStar extends React.Component<Props> {
    _tier: number;

    constructor(props: Props) {
        super(props);
        this._tier = ratingToTier(props.value);
    }

    onUpdateRating = (event: SyntheticEvent<>) => {
        this.props.onUpdateRating(this.props.value);
    };

    render() {
        const left_offset = 5 + (this._tier - 1) * 20;
        const icon =
            this.props.value <= this.props.value_to_display
                ? "star"
                : "star_border";
        return (
            <i
                id={"navbar-rating-" + this._tier}
                onClick={this.onUpdateRating}
                className={"navbar-rating material-icons song-icon-button"}
                style={{
                    color: "gray",
                    top: 8,
                    left: left_offset,
                }}
            >
                {icon}
            </i>
        );
    }
}
