import express from "express";
import { promises as fs } from "fs";

const app = express();
app.use(express.json());
const PORT = 3000;

const fileContent = async () => {
    let data = await fs.readFile("store.json")
    return JSON.parse(data.toString());
}

app.get("/posts", async (req, res) => {
    try{
        const data = await fileContent();
        res.send(data);
    }
    catch(err){
        res.send(err);
    }
});

app.get("/post/:id", async (req, res) => {
    console.log("hello");
    try{
        const data = await fileContent();
        const posts = data.posts;
        let isFind = 0;
        for(let i = 0; i < posts.length; i++){
            if(posts[i].id == req.params['id']){
                isFind = 1;
                data.posts[i].views++;
                await fs.writeFile("store.json", JSON.stringify(data));
                res.send(posts[i]);
                break;
            }
        }
        if(!isFind) res.send(null);
    }
    catch(err){
        console.log(err);
        res.send(err);
    }
});

app.post("/addAuthor", async (req, res) => {
    try{
        const data = await fileContent();
        const id = data.authors.length;
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
    
        data.authors.push({
            id: id,
            first_name: firstName,
            last_name: lastName,
            posts: 0
        });

        await fs.writeFile("store.json", JSON.stringify(data));

        res.send({
            id: id,
            first_name: firstName,
            last_name: lastName,
            posts: 0
        });
    }
    catch(err){
        res.send(err);
    }
});

app.post("/addPost", async (req, res) => {
    try{
        const data = await fileContent();

        const id = data.posts.length;
        const authorId = req.body.authorId;
        const title = req.body.title;

        let isAuthorFound = 0;
        for(let i=0; i<data.authors.length; i++){
            if(data.authors[i].id == id){
                isAuthorFound = 1;
            }
        }

        if(!isAuthorFound){
            res.send({error: {message: "Invalid Author"}});
        }
        else{
            data.posts.push({
                id: id,
                title: title, 
                author: authorId,
                views: 0,
                reviews: 0
            })

            for(let i=0; i<data.authors.length; i++){
                if(data.authors[i].id == authorId){
                    data.authors[i].posts++;
                }
            }
    
            fs.writeFile("store.json", JSON.stringify(data));
    
            res.send({
                id: id,
                title: title, 
                author: authorId,
                views: 0,
                reviews: 0
            });
        }
        
    }
    catch(err){
        res.send(err);
    }
});

app.post("/deleteAuthor", async (req, res) => {
    try{
        const data = await fileContent();
        const id = req.body.id;

        let ind = -1;
        for(let i=0; i<data.authors.length; i++){
            if(data.authors[i].id == id){
                ind = i;
                break;
            }
        }

        if(ind == -1){
            res.send({error: {message: "Invalid Author"}});
        }
        else{
            let updatedPosts = [];
            for(let i=0; i<data.posts.length; i++){
                if(data.posts[i].author != id){
                    updatedPosts.push(data.posts[i]);
                }
            }

            data.posts = updatedPosts;
            data.authors = [...data.authors.slice(0, ind), ...data.authors.slice(ind+1)];
            await fs.writeFile("store.json", JSON.stringify(data));

            res.send("author successfully deleted")
        }
    }
    catch(err){
        res.send(err);
    }
});


app.post("/deletePost", async (req, res) => {
    try{
        const data = await fileContent();
        const id = req.body.id;

        let ind = -1;
        for(let i=0; i<data.posts.length; i++){
            if(data.posts[i].id == id){
                ind = i;
            }
        }

        if(ind == -1){
            res.send({error: {message: "Invalid post"}});
        }
        else{
            for(let i=0; i<data.authors.length; i++){
                if(data.authors[i].id == data.posts[ind].author){
                    data.authors[i].posts--;
                }
            }
            data.posts = [...data.posts.slice(0, ind), ...data.posts.slice(ind+1)];
            await fs.writeFile("store.json", JSON.stringify(data));

            res.send("post successfully deleted");
        }
    }
    catch(err){
        res.send(err);
    }
});



app.listen(PORT, (err) => {
    if(!err){
        console.log(`server is listining at ${PORT}`)
    }
    else{
        console.log(err);
    }
})