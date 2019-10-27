# Legion HQ
Legion HQ is a web-based tool and resource for Fantasy Flight Games: Star Wars: Legion. Legion HQ 2.0 is the improved version of the [Legion HQ](https://github.com/NicholasCBrown/legion-HQ "Legion HQ 1.0 Github").

# Current Major Features
## List Builder
Users can build lists in standard 800-point format, 1600-point grand army format, and Imperial Discipline's [500-point format](https://imperialdiscipline.blog/2019/06/04/creating-a-500-point-format-for-legion/).

# Planned Major Features
## Tournament Organizer
## Card Database
## Inventory Manager
## Tournament Data Analyzer
## Soundboard
## Custom Card Creator
## Custom Card Rater & Database
## List Rater & Database
## Mobile & Desktop App

# Planned Improvements
## Fifth Trooper Redesign
## Repo Reorganization
## General Code Refactor

# Improvements Over 1.0
- Major redesign of user interface with a focus on mobile browsers
- Moderate code refactor (~780kb -> ~280kb)
- Use of route based code splitting to decrease initial load time (fully loaded time: 3s -> 1.5s)
- Legion HQ 1.0 Desktop Stats: ![Screenshot](images/desktop1.png)

- Legion HQ 2.0 Desktop Stats: ![Screenshot](images/desktop2.png)

- Legion HQ 1.0 Mobile Stats: ![Screenshot](images/mobile2.png)

- Legion HQ 2.0 Mobile Stats: ![Screenshot](images/mobile1.png)

## Technology
Legion HQ's frontend is built in [React](https://reactjs.org/) using Facebook's [create-react-app](https://github.com/facebook/create-react-app) and currently resides in [Heroku](https://dashboard.heroku.com/). The backend database is hosted in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and the backend APIs are hosted on a [Lightsail](https://aws.amazon.com/lightsail/) instance.
### Planned Technological Improvements
- Frontend will be served on Amazon S3 buckets behind Cloudfront
- Backend API's will be on Amazon's Lambda functions behind API Gateway
- Frontend and Backend will be rewritten using Typescript
