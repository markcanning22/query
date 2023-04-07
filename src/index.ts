import express, {Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

interface Comment
{
    id: string;
    content: string;
}

interface Post
{
    id: string;
    title: string;
    comments: Comment[]
}

const posts: {[index: string]: Post} = {};

app.get('/posts', (req: Request, res: Response): void => {
    res.send(posts);
});

app.post('/events', (req: Request, res: Response): void => {
    const {type, data} = req.body;

    if (type === 'PostCreated') {
        const {id, title} = data;

        posts[id] = {id, title, comments: []};
    }

    if (type === 'CommentCreated') {
        const {id, content, postId} = data;

        const post: Post = posts[postId];
        post.comments.push({id, content});
    }

    console.log(posts);

    res.send({});
});

app.listen(4002, (): void => {
    console.log('Listening on 4002');
});