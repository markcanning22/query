import express, {Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

enum CommentStatus {
    PENDING = 'pending'
}

type Comment = {
    id: string;
    content: string;
    status: CommentStatus
    postId?: string;
}

type Post = {
    id: string;
    title: string;
    comments: Comment[]
}

const posts: {[index: string]: Post} = {};

app.get('/posts', (req: Request, res: Response): void => {
    res.send(posts);
});

app.post('/events', async (req: Request, res: Response): Promise<Response | undefined> => {
    const {type, data} = req.body;

    if (type === 'PostCreated') {
        const {id, title} = data;

        posts[id] = {
            id,
            title,
            comments: []
        };
    }

    if (type === 'CommentCreated') {
        const {id, content, postId, status} = data;

        const post: Post = posts[postId];
        const comment: Comment = {
            id,
            content,
            status
        };

        post.comments.push(comment);
    }

    if (type === 'CommentUpdated') {
        const {id, content, postId, status} = data;

        const post = posts[postId];

        const comment: Comment | undefined = post.comments.find((comment => {
            return comment.id === id;
        }));

        if (comment === undefined) {
            return res.send({message: 'Unable to find comment'}).status(404);
        }

        comment.status = status;
        comment.content = content;
    }

    console.log(posts);

    res.send({});
});

app.listen(4002, (): void => {
    console.log('Listening on 4002');
});