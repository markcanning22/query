import express, {Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios, {AxiosResponse} from 'axios';

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

type Event = {
    type: string,
    data: any
}

const posts: {[index: string]: Post} = {};

const handleEvent = (event: Event) => {
    const {type, data} = event;

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
            throw new Error('Unable to find comment');
        }

        comment.status = status;
        comment.content = content;
    }
};

app.get('/posts', (req: Request, res: Response): void => {
    res.send(posts);
});

app.post('/events', (req: Request, res: Response): Response | undefined => {
    try {
        handleEvent(req.body);
    } catch (error) {
        return res.send({message: error}).status(500);
    }

    res.send({});
});

app.listen(4002, async (): Promise<void> => {
    console.log('Listening on 4002');

    const res: AxiosResponse = await axios.get('http://event-bus-srv:4005/events');

    let event: Event;
    for (event of res.data) {
        console.log('Processing event: ' + event.type);

        handleEvent(event);
    }
});