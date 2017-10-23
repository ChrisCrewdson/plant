const mongo = require('../db/mongo')();
const { makeSlug, intToMoment } = require('../../app/libs/utils');
const marked = require('marked');

function buildXml(notes, httpHost) {
  const notesXml = notes.map((currNote) => {
    // If multiple plants, just list the name of the first one
    const title = (currNote.plants[0] && currNote.plants[0].title) || '(none)';
    const plantName = currNote.plants.length > 1
      ? `${title} (+ ${(currNote.plants.length - 1)} others)`
      : title;

    // Date must be RFC 822:
    // https://www.feedvalidator.org/docs/error/InvalidRFC2822Date.html
    const utcDate = intToMoment(currNote.date).format('ddd, DD MMM YYYY HH:mm:ss ZZ');
    // uctDate now looks like this: "Mon, 31 Jul 2017 00:00:00 -0700"

    // Create the link URL with note ID. This will also make it unique for GUID
    const slug = makeSlug(title);
    // uri pattern is:
    // host + /plant/ + slug + <plantId> + ?noteid=<noteId>#<noteId>
    // TODO: This is the Facebook "compatible" link. This is duplicated elsewhere.
    //       Need to move this to the utils or other module to DRY up the code.
    const uri = `${httpHost}/plant/${slug}/${currNote.plantIds[0]}?noteid=${currNote._id}#${currNote._id}`; // just the first

    const noteImages = currNote.images && currNote.images.length ? currNote.images : [];

    // Append images. RSS spec wants a full https|http given.
    // TODO: Can we inspect the headers of the requester to determine image size?
    //       Currently we're returning the /up/orig/ image which is massive. If we can
    //       return /up/md/ or /up/sm/ it will be much smaller.
    //       Need to research this later...
    const images = noteImages.map(img =>
      `<img src="https://i.plaaant.com/up/orig/${img.id}.${img.ext}" style="max-width: 100%" />`)
      .join('');

    const desc = (currNote.note ? marked(currNote.note) : '(no comment)') + // patch for empty
      images;

    return `<item>
        <title>${plantName}</title>
        <description><![CDATA[${desc}]]></description>
        <pubDate>${utcDate}</pubDate>
        <guid>${uri}</guid>
        <link>${uri}</link>
      </item>`;
  }).join('');

  return `\
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Latest Notes</title>
    <atom:link href="${httpHost}/rss" rel="self" type="application/rssxml" />
    <language>en-us</language>
    <link>${httpHost}/rss</link>
    <description>Plant progress.</description>
    ${notesXml}
  </channel>
</rss>`;
}

module.exports = (app) => {
  //
  // Set up the RSS route
  app.get('/rss', (req, res) => {
    const httpHost = `${req.protocol}://${req.get('host')}`;

    mongo.getNotesLatest(20)
      .then(notes => res.status(200).send(buildXml(notes, httpHost)))
      .catch(() => res.status(500).send({ success: false, message: 'RSS error' }));
  });
};
