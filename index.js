import http from "http";

const PORT = process.env.PORT || 3000;

const watchLater = [
    {
        id: 100,
        number: 1,
        title: "Title 1",
        duration: "18:25",
    },
    {
        id: 101,
        number: 2,
        title: "Title 2",
        duration: "18:25",
    },
    {
        id: 102,
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

    if (req.url === "/api/videos") {
        res.statusCode = 200;
        res.end(JSON.stringify(watchLater));
        return;
    }

    if (regexMatches) {
        const id = Number(regexMatches[1]);
        const video = watchLater.find((obj) => obj.id === id);

        if (video) {
            res.statusCode = 200;
            res.end(JSON.stringify(video));
            return;
        }
    }

    res.statusCode = 404;
    res.writeHead(res.statusCode, {
        "Content-Type": "text/plain",
    });

    regexMatches
        ? res.end("404 Error. Video not found")
        : res.end("404 Error. Data not found");
}

function postHandler(req, res) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const newUser = JSON.parse(body);

        const duplicateFound = watchLater.some(
            (video) => video.id === newUser.id,
        );

        if (duplicateFound) {
            console.log("duplicate found");
        } else {
            const lastObj = watchLater.forEach((obj, index) => {
                const lastIndex = watchLater.length - 1;
                if (index === lastIndex) return index;
            });

            newUser.number = watchLater.indexOf();
            // console.log(newUser);
            // watchLater.push(newUser);
        }

        res.end();
        return;
        res.status = 201;
    });
}

function respondIfBadRequest(req, res, error) {
    if (res.statusCode === 401) {
        console.error(error);

        res.writeHead(res.statusCode, {
            "Content-Type": "text/plain",
        });

        res.end("Wrong request");
    }
}

const server = http.createServer((req, res) => {
    logger(req, res, () => {
        jsonMiddleWare(req, res, () => {
            if (req.method === "GET") {
                getHandler(req, res);
            } else if (req.method === "POST") {
                postHandler(req, res);
            } else {
                try {
                    res.statusCode = 401;
                    throw new Error("Wrong request");
                } catch (error) {
                    respondIfBadRequest(req, res, error);
                }
            }
        });
    });
});

server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
