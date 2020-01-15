# plant

Running live at [Plaaant](https://plaaant.com)

To get a feel a well chronicled orchard of fruit trees visit
[Guy Ellis' Orchard](https://plaaant.com/location/guy-ellis-yard/5851d7d52967c2153ab6c856)
and use the "Filter" input near the top of the page to find fruit trees you might be interested
in learning about.

Plant is a website app to help you manage growing trees and plant.

[![Build Status](https://travis-ci.org/guyellis/plant.svg)](https://travis-ci.org/guyellis/plant)
[![Dependency Status](https://david-dm.org/guyellis/plant.svg)](https://david-dm.org/guyellis/plant)
[![Code Climate](https://codeclimate.com/github/guyellis/plant/badges/gpa.svg)](https://codeclimate.com/github/guyellis/plant)

* [Project Objectives](#objectives)
  * [Versions](#versions)
  * [Questions](#questions)
* [For Developers](#for-developers)
  * [Architecture Notes](#architecture)
  * [Developer Setup](#developer-setup)

# Objectives

* Allow users to track the plants that they're growing.
  * Provide stats on growth rates.
  * Pull in weather information.
  * Compare against other growers.
* Allow users to research plants to grow.
  * Users can search within a radius of their location for plants others are
  growing.
  * Users can determine likelihood of success.
* Assist users in management of their plants.
  * Send alerts to users when action needs to be taken based on time-of-year
  or on weather. For example, should prune/fertilize on X Date, or "there's
  a freeze warning, you need to protect your avocado tree."
* Usability
  * Users should be able to post entries about a tree from their yard on a smart
  phone.
  * Users should be able to take photos and add them to a plant entry from
  their smart phone while making a post.
  * Users should be able to operate the app while disconnected with syncing
  done later.

## Versions

## 0.0.1 MVP

* User can create an account using OAuth from their Google account.
* User can add/delete/update each plant in their yard.
* User can add entries to each plant. Each entry will have a date and
details.

## 0.0.2 and beyond

* Add features/fields to user's account.
  * Add Facebook as OAuth option.
  * Allow user to add their GPS location to their account.
* Add features to a plant post.
  * Allow photos to be added.
  * Add markdown for details to allow for formatting.
* Add structured fields for each plant.
  * Dates for planting, germination.
  * Multi-bud - treat each scion as its own tree but group on this.
  * Perennial/annual (other?)
* Add structured fields for data entry posts.
  * E.g. height, width etc. to calculate growth rates.
  * Applications of fertilizer, mulch etc for reporting on growth effectiveness.
  * Start and end dates for harvest. (Allow for reporting on year round
    production and prediction.)
  * Volume harvested.
* Perform calculations on entries to show changes. e.g. growth in gallons per
week.
* Use user's GPS location to pull in weather data from date of first plant
entry to current date.
* Keep user's weather data up-to-date.
* Use user's GPS location to allow them to compare their plants to the same
plants in nearby locations.
* Allow users to add parentage/genealogy to their plants.
  * i.e. if another user gave them a plant or they planted another plant from
  one that they're already documenting on the system then they can link a parent
  plant.
* Support multi-bud trees.
  * Allow for structured data entry for root stock(s) and multiple scions.
  * Allow dates for adding scions to trees.
* Allow for termination date of plants.
  * Distinguish between perennial and annuals. i.e. plants that are designed
  to die annually and those that aren't. Helps in reporting life and reason
  for death or disposal of perennial.
* Search
  * User can find a male pollinator for their female plant within a certain
  radius of their location.

## Questions

If you have questions or want to communicate with the maintainers of the
project then please [create an issue](https://github.com/guyellis/plant/issues).

# For Developers

## Architecture

### Components

#### plant

Components in the `/app/components/plant` folder.

Component naming uses CRUD (Create, Read, Update, Delete) names to identify what the component does.

* Plant
  * Container for showing and managing a single plant
  * All other components in this section are used by the Plant component directly or indirectly. i.e. Plant is the top parent
* PlantRead
  * Shows the details of the Plant
  * PlantEdit hidden
* PlantEdit
  * Create or Update a Plant.
  * PlantRead hidden
* Notes
  * Manages the Hide/Show "add note" functionality
  * Container to show a list of Notes
* NoteEdit
  * Create or Update a Note.
* NoteRead
  * Shows the details of a Note

#### plants

Components in the `/app/components/plants` folder.

Components for managing a collection and the listing of plants.

## Developer Setup

### Facebook and Google OAuth

You can start the site without setting up Facebook credentials.
As long as the NODE_ENV is not set to `production` you will be able to login as a dev user.
You do, however, need to set the Facebook and Google environment variables to a non-empty value.
In your ~/.bashrc or equivalent file (or a script you `source` before you start the server) set the following:

```
export PLANT_FB_ID=<facebook-app-id>
export PLANT_FB_SECRET=<facebook-app-secret>
export PLANT_GOOGLE_ID=<google-app-id>
export PLANT_GOOGLE_SECRET=<google-app-secret>
```

If want to use Facebook OAuth then you'll need to setup credentials.

(As with any site, the layout and options change over time so these instructions are an approximation.)

* Go to [developers.facebook.com](https://developers.facebook.com/) and on the menus click on `My Apps` and then select `Add a New App`.
* Select a WWW Website.
* Add a name (Plant is good) and click `Create New Facebook App ID`.
* There's a button to the top right to `Skip Quickstart` - hit that.
* You should end up on the Dashboard. From here you want the `App ID` and `App Secret`.
* Set the `PLANT_FB_ID` and `PLANT_FB_SECRET` environment variables to these values.

### MongoDB

If you have `Docker` installed then it will pull down and spin-up MongoDB for you when you start the server.

Otherwise, you need to install Docker (recommended) or MongoDB.

### Running the site

* Clone the repo locally.
* `npm i`
* Terminal Window #1: `npm run server`
  * Starts the server on port 3001 using the `/devops/run-server.sh` script. Edit this script to fine tune how the server starts.
* Terminal Window #2: `npm start`
  * Starts the Webpack Dev Server on port 9090
* Navigate: [http://localhost:9090](http://localhost:9090)

### Running the tests

```
npm t
```

### Debugging with VSCode

- Start MongoDB
- Terminal #1: Start the App/API Server with `npm run server`
- Terminal #2: Start the Dev Server with `npm start`
- VSCode: Select Chrome from Debug launch options and hit F5
