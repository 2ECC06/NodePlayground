import http from "http";

const PORT = process.env.PORT || 3000;

const watchLater = [
    {
        id: 675,
        number: 1,
        title: "Title 1",
        duration: "18:25",
    },
    {
        id: 106,
        number: 2,
        title: "Title 2",
        duration: "18:25",
    },
    {
        id: 567,
        number: 3,
        title: "Title 3",
        duration: "18:25",
    },
];

function logger(req, res, next) {
    console.log(req.method, req.url);
    next();
}

function jsonMiddleWare(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
}

function getHandler(req, res) {
    const regexMatches = req.url.match(/^\/api\/videos\/([1-9]\d{2})$/); //e.g ['/api/videos/679', '679', index: 0,input: '/api/videos/679', groups: undefined]
    let infoReturned = false;
    let singleVideoRequest = regexMatches ? true : false;

    try {
        if (singleVideoRequest) {
            returnSingleVideo();
        } else {
            returnAllVideos();
        }

        if (!infoReturned) throw new Error("Bad GET request");
    } catch (error) {
        console.error(error);

        res.statusCode = 404;
        res.writeHead(res.statusCode, {
            "Content-Type": "text/plain",
        });

        regexMatches
            ? res.end("404 Error. Video not found")
            : res.end("404 Error. Wrong request");
    }

    function returnAllVideos() {
        res.statusCode = 200;
        infoReturned = true;

        res.end(JSON.stringify(watchLater));
    }

    function returnSingleVideo() {
        const id = Number(regexMatches[1]);
        const video = watchLater.find((obj) => obj.id === id);

        if (video) {
            res.statusCode = 200;
            infoReturned = true;

            res.end(JSON.stringify(video));
            return;
        }
    }
}

function postHandler(req, res) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const newVideo = JSON.parse(body);

        const duplicateFound = watchLater.some(
            (video) => video.id === newVideo.id,
        );

        try {
            if (duplicateFound) {
                throw new Error("Video already exists");
            } else {
                console.log("hello");
                //update the number property on the new video object
                const updatedVideoObj = updateNumberProperty();

                watchLater.push(updatedVideoObj);

                // res.statusCode = 201;
                // res.end(JSON.stringify(watchLater));

                function updateNumberProperty() {
                    let lastVideo = structuredClone(watchLater.at(-1));

                    let arr2D = Object.entries(lastVideo);

                    arr2D.splice(1, 1, ["number", lastVideo.number + 1]);

                    let newArr = arr2D;

                    return Object.fromEntries(newArr);
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
                if (req.method === "GET" && req.url === "/api/videos") {
                    getHandler(req, res);
                } else if (req.method === "POST" && req.url === "/api/videos") {
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
