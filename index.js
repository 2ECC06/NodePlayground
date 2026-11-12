import http from "http";
const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
    // res.setHeader("Content-Type", "text/plain");
    // res.write("<h1>Hello World<h1/>");

    res.writeHead(500, { "Content-Type": "application" });
    res.end(JSON.stringify({ message: "Server Error" }));
});

server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
