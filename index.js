import http from "http";

const PORT = process.env.PORT || 3000;

const playlists = [
    {
        id: 100,
        number: 1,
        title: "Title 1",
    },
    {
        id: 106,
        number: 2,
        title: "Title 2",
    },
    {
        id: 567,
        number: 3,
        title: "Title 3",
    },
];

const returnMatches = (reqUrl) => reqUrl.match(/^\/api\/playlists\/([1-9]\d{2})$/); //e.g -> ['/api/videos/679', '679', index: 0,input: '/api/videos/679', groups: undefined]

function logger(req, res, next) {
    console.log(req.method, req.url, "\n");
    next();
}

function jsonMiddleWare(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
}

//throws an error if the request body object isn't found in the "playlists" array
function checkIfPlaylistIsStored(req, res) {
    try {
        const requestId = Number(returnMatches(req.url)[1]);
        const playlist = playlists.find((obj) => obj.id === requestId);

        if (playlist) {
            return playlist;
        } else {
            throw new Error("Video not found");
        }
    } catch (error) {
        console.error(error);

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404. Video not found");
    }
}

//!GET handlers
function returnAllPlaylists(req, res) {
    res.statusCode = 200;
    res.end(JSON.stringify(playlists));
}

function returnSinglePlaylist(req, res) {
    const playlist = checkIfPlaylistIsStored(req, res);

    if (!playlist) return;

    res.statusCode = 200;
    res.end(JSON.stringify(playlist));
}

//!POST HANDLER
function createNewPlaylist(req, res) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const newPlaylist = JSON.parse(body);

        const playlistWithIdFound = playlists.some((obj) => obj.id === newPlaylist.id);

        const playlistWithSameNameFound = playlists.some(
            (obj) => obj.title === newPlaylist.title,
        );

        const errorsObj =
            validatePostPayload(
                newPlaylist,
                playlistWithIdFound,
                playlistWithSameNameFound,
            ) || {};

        if (Object.keys(errorsObj).length !== 0) {
            res.setHeader("Content-Type", "text/plain");
            res.statusCode = 400;

            if (errorsObj.fieldsIncomplete === true) {
                res.end("Please provide all required fields (id, number & title)");
            }

            if (errorsObj.playlistIdExists === true) {
                res.end("Playlist id exists");
            }

            if (errorsObj.playlistNameExists === true) {
                res.end("Playlist name exists");
            }

            return;
        }

        //update the number property on the new video object
        const updatedPlaylistObj = updateNumberProperty(newPlaylist);

        playlists.push(updatedPlaylistObj);

        res.statusCode = 201;
        res.end(JSON.stringify(playlists));
    });
}

function validatePostPayload(postPayload, playlistIdExists, playlistNameExists) {
    const { id, number, title } = postPayload;
    const errorObj = {};

    try {
        //ensures the payloads contain the required fields
        if (!id || !number || !title) {
            errorObj.fieldsIncomplete = true;
            throw new Error("Server Error. Fields incomplete");
        }

        if (playlistIdExists) {
            errorObj.playlistIdExists = true;
            throw new Error("Server Error. Playlist id already exists");
        }

        if (playlistNameExists) {
            errorObj.playlistNameExists = true;
            throw new Error("Server Error. Playlist name already exists");
        }
    } catch (error) {
        console.error(error);
        return errorObj;
    }
}

function updateNumberProperty(postPayload) {
    if (postPayload.number) delete postPayload.number;

    let lastObjNumberProperty = playlists.at(-1).number;

    let arr2D = Object.entries(postPayload);

    arr2D.splice(1, 0, ["number", lastObjNumberProperty + 1]);

    return Object.fromEntries(arr2D);
}

//!PATCH HANDLER
function modifyPlaylistName(req, res) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const reqBody = JSON.parse(body);
        const playlistToUpdate = checkIfPlaylistIsStored(req, res);
        if (!playlistToUpdate) return;

        const errorsObj = validatePatchPayload(reqBody) ?? {};
        console.log(errorsObj);

        if (Object.keys(errorsObj).length !== 0) {
            res.setHeader("Content-Type", "text/plain");
            res.statusCode = 400;

            if (errorsObj.noTitleField === true) {
                res.end("The 'title' field was not provided");
            }

            if (errorsObj.multipleFieldsPresent === true) {
                res.end("Only the 'title' field is required");
            }

            if (errorsObj.playlistNameTaken === true) {
                res.end("This playlist name has been taken");
            }
        } else {
            playlistToUpdate.title = reqBody.title;

            res.statusCode = 200;
            res.end(JSON.stringify(playlists));
        }
    });
}

function validatePatchPayload(requestPayload) {
    const payloadKeys = Object.keys(requestPayload);
    const errorsObj = {};

    try {
        if (!requestPayload.title) {
            errorsObj.noTitleField = true;
            throw new Error("Server Error. No 'title' field");
        }

        if (payloadKeys.length > 1 || payloadKeys.some((key) => key !== "title")) {
            errorsObj.multipleFieldsPresent = true;
            throw new Error("Server Error. Only one 'title' field is required");
        }

        if (playlists.find((obj) => obj.title === requestPayload.title)) {
            errorsObj.playlistNameTaken = true;
            throw new Error("Server Error. Playlist name has been taken");
        }
    } catch (error) {
        console.error(error);
        return errorsObj;
    }
}

const server = http.createServer((req, res) => {
    logger(req, res, () => {
        jsonMiddleWare(req, res, () => {
            try {
                if (req.method === "GET" && req.url === "/api/playlists") {
                    returnAllPlaylists(req, res);
                } else if (req.method === "GET" && returnMatches(req.url)) {
                    returnSinglePlaylist(req, res);
                } else if (req.method === "POST" && req.url === "/api/playlists") {
                    createNewPlaylist(req, res);
                } else if (req.method === "PATCH" && returnMatches(req.url)) {
                    modifyPlaylistName(req, res);
                } else {
                    res.statusCode = 500;
                    throw new Error("Wrong HTTP request");
                }
            } catch (error) {
                console.error(error);

                res.writeHead(res.statusCode, {
                    "Content-Type": "text/plain",
                });

                res.end("Can't handle request");
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT} \n`);
    console.log("----------------------------\n");
});
