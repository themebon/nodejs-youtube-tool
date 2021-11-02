// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import path from 'path';
import {youtube} from "scrape-youtube";
const { getInfo } = require('ytdl-getinfo');
var sentiment = require( 'wink-sentiment' );
const axios = require('axios');
const __dirname = path.resolve();

const express = require('express');
const bodyParser = require("body-parser");

const app = express();

//Set public directory
app.use(express.static('public'));

//Set view engine to ejs
app.set("view engine", "ejs");

//Tell Express where we keep our index.ejs
app.set("views", __dirname + "/views");

//Use body-parser
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {

    const search_query = req.query.search_query;

    if (!search_query) {
        res.render('index-default', {title: 'Please Search for a keyword'})
    }
    //console.log(search_query)
        try {
            youtube.search(search_query).then((results) => {
                // Unless you specify a type, it will only return 'video' results
                //console.log(results.videos);
                if (results.videos) {
                    res.render('index', {videos: results.videos, search_query: search_query, title: 'Home'})
                }
                else {
                    res.render('index', {title: 'Home'})
                }
            });

        } catch (error) {
            res.json('Something Went Wrong');
            console.log(error);
        }

});



app.get('/video-detail/:videoId?', function (req, res) {

    //console.log(req.params.videoId)
    try {

        const videoId = req.params.videoId;
        const video_query = req.query.video_query;

        let videoUrl;
        if (videoId) {
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
        else if (video_query) {
            videoUrl = video_query;
        }
        else {
            res.render('video-single', {videoInfo: {}, title: 'Single Video'})
        }


        getInfo(videoUrl).then(videoInfo => {
            if (videoInfo) {
                //console.log(videoInfo)
                res.render('video-single', {videoInfo: videoInfo.items[0], title: 'Single Video'})
            }
            else {
                res.render('video-single', {title: 'Single Video'})
            }

        });


    } catch (error) {
        res.json('Something Went Wrong');
        console.log(error);
    }

});




app.get('/comments/:videoId?', function (req, res) {

    try {

        const videoId = req.params.videoId;
        const comment_query = req.query.comment_query;

        let apiVideoId;
        if (comment_query) {
            let idFromUrl = comment_query.split('=');
            //console.log(idFromUrl[1])
            apiVideoId = idFromUrl[1];
        }
        else if (videoId) {
            apiVideoId = videoId;
        }
        else {
            res.render('comments-default', {title: 'Comments'})
        }

        const apiUrl = `https://flask-youtube-comments-api.herokuapp.com/${apiVideoId}`;

        // Make a request for a user with a given ID
        axios.get(apiUrl)
            .then(function (response) {

                if (response) {
                    // handle success
                    let comments = response.data;
                    //console.log(comments)
                    let commentsWithScores = [];
                    for (let i = 0; i < comments.length; i++) {
                        //console.log(comment.text);
                        const textSentiment = sentiment( comments[i].text );
                        const score = textSentiment.score;


                        let status = 'neutral';
                        if (score === 0) {
                            status = 'neutral';
                        }
                        if (score < 0) {
                            status = 'negative';
                        }
                        else if (score > 0) {
                            status = 'positive';
                        }

                        commentsWithScores.push({'text': comments[i].text, 'score': score, 'status': status })
                    }

                    if (commentsWithScores.length) {
                        //console.log(commentsWithScores);
                        res.render('comments', {comments: commentsWithScores, 'totalComments': comments.length, 'videoId': apiVideoId, title: 'Comments'})
                    }
                    else {
                        res.render('comments', {title: 'Comments'})
                    }

                }
                else {
                    res.render('comments', {title: 'Comments'})
                }



            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });

    } catch (error) {
        res.json('Something Went Wrong');
        console.log(error);
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`))