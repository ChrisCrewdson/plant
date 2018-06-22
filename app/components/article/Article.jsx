// This is a temporary component so that I can quickly get a single article on the site.

const React = require('react');
const Base = require('../base/Base');
const Markdown = require('../common/Markdown');

// Once this is in the DB use this MongoId for the insert: 58a9d4ec27b363e3630c969b
// Url will be something like: /article/fruit-tree-emergency/58a9d4ec27b363e3630c969b

const markdown = `**911 Operator:** 911 - what's your emergency?

**Fruit Tree Addict:** I just planted my fruit trees and now it's raining on them.

**Operator:** Are in a safe place sir?

**Addict:** I don't know it's raining.

**Operator:** Where are you right now sir?

**Addict:** I'm next to one of the trees I planted.

**Operator:** Do you have an umbrella in your hand sir?

**Addict:** Yes, yes, … *(sobbing)* I'm holding it over the tree so it doesn't get wet.

**Operator:** Okay sir, remain calm, I'm going to help you. Is there lightning in the area?

**Addict:** Yes, everywhere.

**Operator:** Okay sir, I need you to move to a safe place. Can you put down the umbrella and get inside a house?

**Addict:** Yes, … *(muffled sound)* I'm in my house.

**Operator:** Is there anyone in your house that can be with you?

**Addict:** No, my wife and kids have gone to a PTA meeting. I'm supposed to be there as well.

**Operator:** Please sit down sir. I'm familiar with this problem and I can help you. I need you to look at the photos on your phone. What do you see?

**Addict:** I see trees and flowers and leaves.

**Operator:** Are there any photos of your wife or children on the phone sir?

**Addict:** No, only the trees.

**Operator:** This is normal sir, this is a common condition. I need you to make another check sir. Have a look at the list of the last 10 numbers that you dialed. Who were they to?

**Addict:** They are to my local nurseries. Except for one of them which is to a guy from Facebook that going to give me a Mulberry Tree.

**Operator:** Sir, when you call the tree nurseries do they immediately recognize your voice and greet you by name?

**Addict:** Yes, always.

**Operator:** We're going to get help over to you right now sir. In the meantime I would like you to go online and go to a support group. It's called [Fruit Trees Anonymous](https://www.facebook.com/groups/589635491185478/). There are other people just like you who will be able to help you. Sit tight and we have someone on their way.

**Addict:** Okay... *(sobbing)*.

...CLICK…`;

function article() {
  const style = {
    marginBottom: '50px',
    marginLeft: '25px',
    marginTop: '70px',
  };

  return (
    <Base>
      <div style={style}>
        <Markdown markdown={markdown} />
      </div>
    </Base>
  );
}

module.exports = article;
