const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

axios.get('https://bulletin.du.edu/undergraduate/coursedescriptions/comp/')
    .then(response => {
        const $ = cheerio.load(response.data);

        let courses = [];

        $('.courseblock').each((index, element) => {

            const titleLine = $(element).find('.courseblocktitle strong').text();
            const desc = $(element).find('.courseblockdesc').text();

            const parts = titleLine.split(/\s+/);
            const dept = parts[0];
            const number = parseInt(parts[1]);

            if (dept === "COMP" && number >= 3000 && !desc.includes("Prerequisite")) {

                const title = parts.slice(2).join(' ').split('(')[0].trim();

                courses.push({
                    course: dept + "-" + parts[1],
                    title: title
                });
            }
        });

        const result = {
            courses: courses
        };

        fs.writeFileSync('results/bulletin.json', JSON.stringify(result, null, 4));
        console.log("Saved results/bulletin.json");
    })
    .catch(error => {
        console.error('Error fetching and parsing the page:', error);
    });



axios.get('https://denverpioneers.com/')
.then(response => {

    const html = response.data;

    const pos = html.indexOf('"type":"events"');
    const start = html.lastIndexOf('var obj = {', pos);
    const end = html.indexOf('};', start);

    const text = html.substring(start + 'var obj = '.length, end + 1);
    const data = JSON.parse(text);

    let events = [];

    data.data.forEach(game => { 
        if (game.sport && game.opponent && game.date) {
            
            events.push({
                duTeam: game.sport.title,
                opponent: game.opponent.title,
                date: game.date
            });
        }

    });

    fs.writeFileSync('results/athletic_events.json', JSON.stringify({ events: events }, null, 4));
    console.log("Saved results/athletic_events.json");

})
.catch(error => {
    console.error('Error fetching and parsing the page', error);
});



axios.get('https://www.du.edu/calendar?search=&start_date=2025-01-01&end_date=2025-12-31#events-listing-date-filter-anchor')
    .then(response => {

        const $ = cheerio.load(response.data);

        let events = [];

        $('.events-listing__item').each((index, element) => {

            const date = $(element).find('p').first().text().trim()
            const title = $(element).find('h3').text().trim()
            const time = $(element).find('.icon-du-clock').parent().text().trim()

            const description = $(element).find('a.event-card').attr('href');

            let event = {
                title: title,
                date: date,
                description: description
            };

            if (time) {
                event.time = time;
            }

            events.push(event);

        });

        const result = {
            events: events
        };

        fs.writeFileSync('results/calendar_events.json', JSON.stringify(result, null, 4));
        console.log("Saved results/calendar_events.json");

    })
    .catch(error => {
    console.error('Error fetching and parsing the page', error);
    });
