const Base = require('../Base');
const React = require('react');
const Paper = require('material-ui/Paper').default;
const Markdown = require('../common/Markdown');

const markdown =
`# Plant Privacy Policy

## Contents

* Information Collection
* Information Usage
* Information Protection
* Cookie Usage
* 3rd Party Disclosure
* 3rd Party Links
* Google AdSense
* Fair Information Practices
* COPPA
* CalOPPA
* Our Contact Information

This privacy policy has been compiled to better serve those who are concerned with how their \
'Personally identifiable information' (PII) is being used online. PII, as used in US privacy \
law and information security, is information that can be used on its own or with other \
information to identify, contact, or locate a single person, or to identify an individual in \
context. Please read our privacy policy carefully to get a clear understanding of how we collect, \
use, protect or otherwise handle your Personally Identifiable Information in accordance with our \
website.

**What personal information do we collect from the people that visit our blog, website or app?**

When registering on our site, as appropriate, you may be asked to enter your name, email address \
or other details to help you with your experience.

**When do we collect information?**

We collect information from you when you register on our site or enter information on our site.

**How do we use your information?**

We may use the information we collect from you when you register in the following ways:

* To personalize user's experience and to allow us to deliver the type of content in which you \
are most interested.

**How do we protect visitor information?**

Our website is scanned on a regular basis for security holes and known vulnerabilities in order to \
make your visit to our site as safe as possible.

We use regular Malware Scanning.

We use an SSL certificate.

We only provide articles and information, we never ask for personal or private information like \
credit card numbers.

**Do we use 'cookies'?**

We do not use cookies for tracking purposes

You can choose to have your computer warn you each time a cookie is being sent, or you can choose \
to turn off all cookies. You do this through your browser (like Internet Explorer) settings. Each \
browser is a little different, so look at your browser's Help menu to learn the correct way to \
modify your cookies.

**Third Party Disclosure**

We do not sell, trade, or otherwise transfer to outside parties your personally identifiable \
information.

**Third party links**

Occasionally, at our discretion, we may include or offer third party products or services on our \
website. These third party sites have separate and independent privacy policies. We therefore have \
no responsibility or liability for the content and activities of these linked sites. Nonetheless, \
we seek to protect the integrity of our site and welcome any feedback about these sites.

**Google**

Google's advertising requirements can be summed up by Google's Advertising Principles. They are \
put in place to provide a positive experience for users. \
https://support.google.com/adwordspolicy/answer/1316548?hl=en

We have not enabled Google AdSense on our site but we may do so in the future.

**California Online Privacy Protection Act**

CalOPPA is the first state law in the nation to require commercial websites and online services \
to post a privacy policy. The law's reach stretches well beyond California to require a person or \
company in the United States (and conceivably the world) that operates websites collecting \
personally identifiable information from California consumers to post a conspicuous privacy \
policy on its website stating exactly the information being collected and those individuals with \
whom it is being shared, and to comply with this policy. - See more at: \
http://consumercal.org/california-online-privacy-protection-act-caloppa/#sthash.0FdRbT51.dpuf

**According to CalOPPA we agree to the following:**
  
* Users can visit our site anonymously
* Once this privacy policy is created, we will add a link to it on our home page, or as a minimum \
on the first significant page after entering our website.
* Our Privacy Policy link includes the word 'Privacy', and can be easily be found on the page \
specified above.

Users will be notified of any privacy policy changes:

* On our Privacy Policy Page

Users are able to change their personal information:

* By emailing us
* By logging in to their account

**How does our site handle do not track signals?**

We honor do not track signals and do not track, plant cookies, or use advertising when a Do Not \
Track (DNT) browser mechanism is in place.

**Does our site allow third party behavioral tracking?**

It's also important to note that we do not allow third party behavioral tracking

**COPPA (Children Online Privacy Protection Act)**

When it comes to the collection of personal information from children under 13, the Children's \
Online Privacy Protection Act (COPPA) puts parents in control. The Federal Trade Commission, the \
nation's consumer protection agency, enforces the COPPA Rule, which spells out what operators of \
websites and online services must do to protect children's privacy and safety online.

We do not specifically market to children under 13.

**Fair Information Practices**
  
The Fair Information Practices Principles form the backbone of privacy law in the United States \
and the concepts they include have played a significant role in the development of data \
protection laws around the globe. Understanding the Fair Information Practice Principles and how \
they should be implemented is critical to comply with the various privacy laws that protect \
personal information.

**In order to be in line with Fair Information Practices we will take the following responsive \
action, should a data breach occur:**
  
We will notify the users via email

* Within 7 business days

We will notify the users via in site notification

* Within 7 business days
  
**CAN SPAM Act**
  
The CAN-SPAM Act is a law that sets the rules for commercial email, establishes requirements for \
commercial messages, gives recipients the right to have emails stopped from being sent to them, \
and spells out tough penalties for violations.

**To be in accordance with CANSPAM we agree to the following:**

If at any time you would like to unsubscribe from receiving future emails, you can email us \
and we will promptly remove you from ALL correspondence.

**Contacting Us**

If there are any questions regarding this privacy policy you may contact us using the information \
below.

https://plaaant.com
wildfiction@gmail.com

Last Edited on 2017-06-14
`;

function privacy() {
  const paperStyle = {
    padding: 20,
    width: '100%',
    margin: 20,
    display: 'inline-block',
  };

  return (
    <Base>
      <Paper style={paperStyle} zDepth={5}>
        <Markdown markdown={markdown} />
      </Paper>
    </Base>
  );
}

module.exports = privacy;
