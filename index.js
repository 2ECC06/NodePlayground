import http from "http";

const PORT = process.env.PORT || 3000;

function logger(req, res, next) {
    console.log(req.method, req.url, res.status);
    next();
}

const server = http.createServer((req, res) => {
    logger(req, res, () => {
        console.log("next() called");
    });
});

server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
