// @flow

// get song info for all selected rows
// supplying both list and alt_list will have the function look at the returned element's classes to determine the list to use
export const getSelectedRows = (
    list: Array<mixed>,
    alt_list: Array<mixed>
): Array<mixed> => {
    const selected: any = document.getElementsByClassName("table-selected");
    if (alt_list != null) {
        if (selected.length > 0 && selected[0].classList.contains("song-row")) {
            list = alt_list;
        }
    }
    const songs = [];
    for (let i = 0; i < selected.length; i++) {
        const index = selected[i].rowIndex - 1;
        songs.push(list[index]);
    }
    return songs;
};
