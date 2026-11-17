import http from "http";

const PORT = process.env.PORT || 3000;

const playLists = [
    {
        id: 675,
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

const returnMatches = (reqUrl) =>
    reqUrl.match(/^\/api\/playlists\/([1-9]\d{2})$/); //e.g -> ['/api/videos/679', '679', index: 0,input: '/api/videos/679', groups: undefined]

function logger(req, res, next) {
    console.log(req.method, req.url);
    next();
}

function jsonMiddleWare(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
}

function returnAllPlaylists(req, res) {
    res.statusCode = 200;
    res.end(JSON.stringify(playLists));
}

function returnSinglePlaylist(req, res) {
    const requestId = Number(returnMatches(req.url)[1]);
    const playlist = playLists.find((obj) => obj.id === requestId);

    try {
        if (!playlist) throw new Error("Video not found");
        res.statusCode = 200;
        res.end(JSON.stringify(playlist));
    } catch (error) {
        console.error(error);

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404. Video not found");
    }
}

function postHandler(req, res) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const newPlaylist = JSON.parse(body);

        const duplicateFound = playLists.some(
            (obj) => obj.id === newPlaylist.id,
        );

        try {
            if (duplicateFound) {
                throw new Error("Playlist already exists");
            } else {
                //update the number property on the new video object
                const updatedPlaylistObj = updateNumberProperty();

                playLists.push(updatedPlaylistObj);

                res.statusCode = 201;
                res.end(JSON.stringify(playLists));

                function updateNumberProperty() {
                    let lastObjNumberProperty = playLists.at(-1).number;

                    let arr2D = Object.entries(newPlaylist);

                    arr2D.splice(1, 0, ["number", lastObjNumberProperty + 1]);

                    return Object.fromEntries(arr2D);
                }
            }
        } catch (error) {
            console.log(error);

            res.statusCode = 400;
            res.setHeader("Content-Type", "text/plain");
            res.end("Video exists");
        }
    });
}

const server = http.createServer((req, res) => {
    logger(req, res, () => {
        jsonMiddleWare(req, res, () => {
            try {
                if (req.method === "GET" && req.url === "/api/playlists") {
                    returnAllPlaylists(req, res);
                } else if (req.method === "GET" && returnMatches(req.url)) {
                    returnSinglePlaylist(req, res);
                } else if (
                    req.method === "POST" &&
                    req.url === "/api/playlists"
                ) {
                    postHandler(req, res);
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
    console.log("----------------------------");
});
