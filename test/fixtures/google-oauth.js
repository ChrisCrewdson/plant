/** @type {Dictionary<object>} */
const requests = {
  'accounts.google.com': {
    options: {
      host: 'accounts.google.com',
      port: 443,
      path: '/o/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'accounts.google.com',
        'User-Agent': 'Node-oauth',
        'Content-Length': 318,
      },
    },
    result: {
      access_token: 'yy99.this-is-access-token',
      expires_in: 3600,
      id_token: 'a-very-long-id-token',
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me',
      token_type: 'Bearer',
    },
  },
  'www.googleapis.com': {
    options: {
      host: 'www.googleapis.com',
      port: 443,
      path: '/plus/v1/people/me?access_token=yy99.this-is-access-token',
      method: 'GET',
      headers: {
        Host: 'www.googleapis.com',
        'User-Agent': 'Node-oauth',
        'Content-length': 0,
      },
    },
    result: {
      kind: 'plus#person',
      etag: '"etag/etag"',
      occupation: 'Director of Happiness',
      gender: 'male',
      emails: [
        {
          value: 'johnsmith@gmail.com',
          type: 'account',
        },
      ],
      urls: [],
      objectType: 'person',
      id: '1234567890',
      displayName: 'John Smith',
      name: {
        familyName: 'Smith',
        givenName: 'John',
      },
      tagline: 'fake tagline',
      aboutMe: 'Fake About Me',
      url: 'https://plus.google.com/+JohnSmith',
      image: {
        url: 'https://lh4.googleusercontent.com/stuff/photo.jpg?sz=50',
        isDefault: false,
      },
      organizations: [
      ],
      placesLived: [
      ],
      isPlusUser: true,
      verified: false,
      cover: {
        layout: 'banner',
        coverPhoto: {
          url: 'https://lh3.googleusercontent.com/stuff',
          height: 705,
          width: 940,
        },
        coverInfo: {
          topImageOffset: 0,
          leftImageOffset: 0,
        },
      },
    },
  },
};

module.exports = requests;
