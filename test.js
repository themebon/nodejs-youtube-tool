// These lines make "require" available
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// var sentiment = require( 'wink-sentiment' );
//
// const result = sentiment( 'Excited to be part of the @imascientist team:-)!' );
//
// console.log(result)

const videoId = 'me8Bcd8-U38';
const comment_query = 'https://www.youtube.com/watch?v=me8Bcd8-U38';

let videoUrl;
if (comment_query) {
    let idFromUrl = comment_query.split('=');
    //console.log(idFromUrl[1])
    videoUrl = idFromUrl[1];
}
else if (videoId) {
    videoUrl = videoId;
}