# Backend for all platforms

In some days there will be a proper instruction how to implement the backend for mobile platform

Every request's header must include Bearer token:
- `Authorization`: 'Bearer `accessToken`'

## /profile
Load authenticated user.

## /profile/edit
Deny friend request.
#### Header:
- name: `new name` (optional)
- username: `new username` (optional)
- bio: `new bio` (optional)
- number: `new phonenumber` (optional)
- web: `new website` (optional)

## /profile/can-be-friends
Load possible friends by phonenumbers.
#### Header:
- phonenumbers: `phonenumber`

you can provide more phonenumbers by adding `,`

## /profile/friends
Loads your friends

## /profile/friend-requests
Load friend requests(received, sent).
#### Header:
- type: `type` (optional, R, S)

## /profile/be-friend
Sends friend request.
#### Header:
- friend: `friendIdentifier`

## /profile/accept-friend
Accept friend request.
#### Header:
- friend: `friendIdentifier`

## /profile/deny-friend
Deny friend request.
#### Header:
- friend: `friendIdentifier`

## /profile/delete-friend
Delete friend.
#### Header:
- friend: `friendIdentifier`

## /profile/timeline
Load timeline composed of videos from artist and friends who shared them

## /profile/delete-video
Delete video
#### Header:
- video_number: `video number`

## /profile/like-video
Add like to video
#### Header:
- video_owner: `video owner's identifier`
- video_number: `video number`

## /profile/remove-video-like
Remove like from video
#### Header:
- video_owner: `video owner's identifier`
- video_number: `video number`

## /profile/dislike-video
Add dislike to video
#### Header:
- video_owner: `video owner's identifier`
- video_number: `video number`

## /profile/remove-video-like
Remove dislike from video
#### Header:
- video_owner: `video owner's identifier`
- video_number: `video number`

## /profile/likes-video
Check if user likes video
#### Header:
- video_owner: `video owner's identifier`
- video_number: `video number`

## /profile/dislikes-video
Check if user dislikes video
#### Header:
- video_owner: `video owner's identifier`
- video_number: `video number`

## /profile/users-from-name
Search users by name
#### Header:
- text: `user's name query`

## /profile/admire
Admire user
#### Header:
- user: `user's identifier to admire`

## /profile/remove-admire
Remove user admire
#### Header:
- user: `user's identifier`

## /profile/all-video
Load all video available for the search when text field is empty

## /profile/videos-from-name
Search videos by title
#### Header:
- text: `video's title query`

## /profile/videos-from-user
Search videos by title
#### Header:
- user_identifier: `user's identifier`

## /login
Login or create new user
#### Header:
- name: `user's name`
- type: `user's type`
- photourl: `photo url` (optional)

## /profile/share-video
Share video with caption
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- caption: `caption` (maximum 140 characters)
- comment_identifier: `comment identifier`

## /profile/reply-to-comment
Share video with caption
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`
- caption: `caption` (maximum 140 characters)

## /profile/watch-video
Watch video(add one view)
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`

## /profile/like-comment
Like comment
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`

## /profile/remove-comment-like
Like comment
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`

## /profile/dislike-comment
Dislike comment
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`

## /profile/remove-comment-dislike
Remove comment like
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`

## /profile/likes-comment
Check if user likes comment
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`

## /profile/dislikes-comment
Check if user dislikes comment
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`
- comment_identifier: `comment_identifier`

## /profile/video-comments
Load video comments
#### Header:
- video_owner: `video owner identifier`
- video_number: `video number`

## /profile/user-from-id
Load user from id
#### Header:
- id: `user's identifier`

## /profile/videos-from-id
Load videos from id

## /profile/upload
Upload video as mp4 with title and description
#### headers:
- videourl: `video URL`
- title: `video title`
- desc: `video description`

## /profile/picture
Update user's profile image as png or jpeg
#### Multi-form data:
- file: `image(base 64)`

## /profile/notifications
Load all received push notifications


## /feedback
Sends feedback to us.
#### Body
- feedback : feedback

#### We have to add Email and password to config.env file.


## /reportVideo
Sends video reporting message to us.
#### Body
- videoURL : Url of the video to be reported
- reportMSG : The report message


## /profile/uploadThubnail
Uploads thumbnail to a particular video
#### headers
- v_index : index of video in the videolist to be uploaded
#### Multi-form data:
- file: `image(base 64)`


## /get-otp
send otp to phonenumber..
#### body
- phonenumber: phonenumber


## /otp-verify
verify otp...
#### body
- sid: service_id
- otp: OTP_Code
- phonenumber: phonenumber


## /profile/thumbnail
load home feed videos....

