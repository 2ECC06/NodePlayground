import fs from "fs/promises";
import http from "http";
import path from "path";
import url from "url";

const PORT = process.env.PORT || 3000;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(async (req, res) => {
    try {
        if (req.method !== "GET") throw new Error("Method not allowed");

        let notFound = false;
        let fileName;

        switch (req.url) {
            case "/":
                fileName = "index.html";
                break;
            case "/about":
                fileName = "about.html";
                break;
            case "/contact":
                fileName = "contact-us.html";
                break;
            default: //like the else block
                notFound = true;
                fileName = "404-page.html";
                break;
        }

        res.writeHead(notFound ? 404 : 200, { "Content-Type": "text/html" });

        const data = await fs.readFile(
            path.join(__dirname, "public", fileName),
        );

        res.write(data);
        res.end();
    } catch (error) {
        console.log(error);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error");
    }
});

fs.readFile("example.txt", "utf-8", (err, data) => {
    if (err) console.log(err);

    console.log(data);
});

server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});
