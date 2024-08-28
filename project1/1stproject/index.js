// require('dotenv').config();
import express from 'express'
const app = express()
const port = process.env.PORT || 3000;
const data = {
  "login": "Abdullah-Kz",
  "id": 111400210,
  "node_id": "U_kgDOBqPVEg",
  "avatar_url": "https://avatars.githubusercontent.com/u/111400210?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/Abdullah-Kz",
  "html_url": "https://github.com/Abdullah-Kz",
  "followers_url": "https://api.github.com/users/Abdullah-Kz/followers",
  "following_url": "https://api.github.com/users/Abdullah-Kz/following{/other_user}",
  "gists_url": "https://api.github.com/users/Abdullah-Kz/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/Abdullah-Kz/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/Abdullah-Kz/subscriptions",
  "organizations_url": "https://api.github.com/users/Abdullah-Kz/orgs",
  "repos_url": "https://api.github.com/users/Abdullah-Kz/repos",
  "events_url": "https://api.github.com/users/Abdullah-Kz/events{/privacy}",
  "received_events_url": "https://api.github.com/users/Abdullah-Kz/received_events",
  "type": "User",
  "site_admin": false,
  "name": "Abdullah",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 6,
  "public_gists": 0,
  "followers": 0,
  "following": 1,
  "created_at": "2022-08-17T00:36:21Z",
  "updated_at": "2024-08-23T13:26:16Z"
}
app.use(express.static('dist'))
const jokes=[
  {
    "id": 1,
    "title": "How do you make a tissue dance?",
    "content": "You put a little boogie on it."
  },{
    "id": 2,
    "title": "Why did the chicken cross the road?",
    "content": "To get to the other side!"
  },
  {
    "id": 3,
    "title": "What do you call a fake noodle?",
    "content": "An Impasta!"
  }
]
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/Abdullah', (req, res) => {
    res.send('Hello Abdullah!')
})
app.get('/github', (req, res) => {
  res.json(data)
})
app.get('/api/jokes', (req, res) => {
  res.json(jokes)
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})