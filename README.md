# Derek Murphys DataMade Code Challenge: React Map

![2026 DataMade Code Challenge](https://github.com/datamade/code-challenge-v2/blob/main/map/static/images/2026-datamade-code-challenge.jpg)

## Intro for DataMade

Hello, and thank you for taking the time to review this code, as well as the interesting questions you've asked.

With the scope of this project defined as roughly 2 hours, I decided to keep my solutions fairly limited as I would when working with a freelance client. In particular I avoided changing files not mentioned in the initial "completing the challenge" steps, and solutions that seemed outside of 'budget' or would require additional context. You will see a few comments within the code where I note where the project could be expanded, and also a few comments describing why I made certain choices.

My professional work has mainly focused on frontend development using React. I have been considering returning to higher education for data science / analytics and learned the basics of python, but I am relatively inexperienced with it. With this in mind I used Codex ai client to assist me with solutions for the serializer and testing, as well as a final pass to check for potential errors and other blind spots.

Thank you again for your time and consideration, I look forward to your feedback and any future conversations.

-Derek

## Project Overview

This exercise is based on work that DataMade does every day: pulling data from the web, debugging tricky code, and presenting information to the world.

This exercise visualizes restaurant permit activity across Chicago community areas using Django and React. The frontend renders a Leaflet map using community area GeoJSON boundaries. Users can interact with the app by choosing a year, seeing overview stats (total permits issued, most permits issued for a singular area), map shading displaying where higher percentages of permits were issued, and further interaction for information of individual community areas.

The app will run in Docker, with migrations handled at startup and data loaded separately to populate community areas and permit records.

## Installation

Development requires a local installation of [Docker](https://docs.docker.com/get-started/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/). These are the only two system-level dependencies you should need.

Once you have Docker and Docker Compose installed, build the application containers from the project's root directory:

```bash
docker compose build
```

Load in the data:

```bash
docker compose run --rm app python manage.py loaddata map/fixtures/restaurant_permits.json map/fixtures/community_areas.json
```

And finally, run the app:

```bash
docker compose up
```

To run intergration tests:

```bash
 docker compose -f docker-compose.yml -f tests/docker-compose.yml run --rm app
```

The app will log to the console, and you should be able to visit it at http://localhost:8000

### Credit

Source of the code challenge:
https://github.com/datamade/code-challenge-v2

| Member    | GitHub Account                   |
| --------- | -------------------------------- |
| Hannah    | https://github.com/hancush       |
| Derek     | https://github.com/derekeder     |
| Monkruman | https://github.com/antidipyramid |
| Xavier    | https://github.com/xmedr         |
| Hayley    | https://github.com/haowens       |
