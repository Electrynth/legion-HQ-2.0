# Legion-HQ 2.0
List builder, inventory manager, and card database for FFG's Star Wars Legion game.

## Major Changes from 1.0

1. Major refactor of code (~75%)
2. Minor redesign of interface
3. Upgrading Material-UI from ~3.0 to ~4.0
4. Move from file based data to 100% database
5. Card Database browser feature
6. Code splitting
7. Image optimization (Convert all PNGs to JPGs)
8. Inventory feature so users can see what they lists they are able to build
9. Suggestion feature that looks at a subset of lists in the database
10. Statistical analysis of units and upgrades (Importing and then integrating a CSV)
11. Mobile app (React Native)
12. Event feature (a la List Fortress for X-Wing)
13. Various QoL features

## Application Pages
List of pages. Yet to be decided if this will be a single-page application.
### Home - /home
If user is logged in they can view links to their lists as well as their user page (/user/:id). Also has link to card database (/cards) and event database (/events).
### User - /user/:id
Shows name/alias of user, link to user's blog, list of user's lists. If user viewing their own page they can change their user settings.
### List - /list
Interface to build a new list.
### List - /list/:id
Shows list in interface. If user viewing their own list they can edit it.
### Inventory - /inventory/:id
If user is logged in they can edit what products/singles they own or have access to.
### Cards - /cards
Card database where users can see all cards. Includes dynamic searching capabilities.
### Card - /cards/:id
Page dedicated to a single card that will display various statistics of the card.
### Events - /events
TBD
### Event - /events/:id
TBD
### Info - /info
Page dedicated to my contact info, maybe an about me section, maybe a donate button. This page will also have links to various other resources, blogs, discord stuff, and official pages for Legion

## Database Tables
Fields belonging to each table and descriptions of them.
### Cards
All the cards in the game.
- ID
- Card Name (Actual card name)
- Card Display Name (Card name that is display in the interface)
- Card Type (unit, upgrade, command, battle)
- Card Subtype (unit types, upgrade types, pip number, conditions, deployment, objective cards)
- Keywords (Any keywords on the card)
- Products (Products that contain this card)
- Card Image (URL to icon)
- Card Icon (URL to icon)
###### Unit Cards
- Base Cost (Base cost of unit)
- Uniqueness (Is it unique?)
- Ranks (Ranks this unit counts as)
- Factions (Factions allowed to use this unit)
- Upgrade Bar (List of default upgrade slots)
- Additional Tags (Mostly surge related tags for searching purposes)
- Entourage (List of units that are entouraged)
###### Upgrade Cards
- Base Cost (Base cost of upgrade)
- Uniqueness (Is it unique?)
- Factions (Factions allowed to use this upgrade)
- Requirements (Requirements for a unit to equip this upgrade)
###### Command Cards
- Factions (Factions allowed to use this command)
- Commanders (List of commanders allowed to use this command)
###### Battle Cards
- No additional fields

### Users
All the users who have signed in using Google OAuth.
- ID
- Name/Alias (Used for event/tournament input)
- Inventory ID
- Link to blog
- Enable Inventory (Yes or no)
- Default Color Scheme (White or black)
- Private (Yes or no)
- Language (EN or ES)
- Event Permission (Permission to create/edit/delete events)

### Lists
All lists made by users.
- ID
- User ID (User this list belongs to)
- Units (List of unit IDs and each of their upgrade IDs)
- Uniques (List of IDs of unique cards in this list)
- Title
- Notes
- Point Total
- Mode (Standard or Grand Army)
- Enable Suggestions (Yes or no; Builder suggests upgrades based on stats from "competitive" lists)
- Competitive List (Yes or no)

### Products
All official products released by FFG and their contents.
- ID
- Product ID (Such as swl01, etc...)
- Name of Product
- Units (List of units in product)
- Upgrades (List of upgrades in product)
- Commands (List of commands in product)
- Release Date
- Link to official FFG page of product
- MSRP

### Inventories
List of products owned by a user.
- ID
- User ID (User this inventory belongs to)
- Units (Units owned by user)
- Upgrades (Upgrades owned by user)
- Commands (Commands owned by user)

### Events
(TBD)
- ID
- Name of event
- Description of event
- Date Started
- Date Ended
- Country
- State
- Format
- Type
- Players (List of players)
  - Name of player
  - Link to list
- Rounds (List of objects)
  - Matchups (List of participating players)
  - Red Player
  - Blue Player
  - Objective Played
  - Deployment Played
  - Condition Played
  - Winning Player
  - Score
  - MoV
  - SoS

## Other Information

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
