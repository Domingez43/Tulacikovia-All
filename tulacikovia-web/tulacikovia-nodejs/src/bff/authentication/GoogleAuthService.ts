// import { google } from 'googleapis';

// /**
//  * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
//  * from the client_secret.json file. To get these credentials for your application, visit
//  * https://console.cloud.google.com/apis/credentials.
//  */
// const oauth2Client = new google.auth.OAuth2(
//     "1091699786629-sfmd04ra42cplgbqe66p66bn5ngfralv.apps.googleusercontent.com",
//     "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",
//     "https://relyonproject.com"
//   );
  
//   // Access scopes for read-only Drive activity.
// const scopes = [
//     'https://www.googleapis.com/auth/drive.metadata.readonly'
//   ];

//   // Generate a url that asks permissions for the Drive activity scope
//  const authorizationUrl = oauth2Client.generateAuthUrl({
//     // 'online' (default) or 'offline' (gets refresh_token)
//     access_type: 'offline',
//     /** Pass in the scopes array defined above.
//       * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
//     scope: scopes,
//     // Enable incremental authorization. Recommended as a best practice.
//     include_granted_scopes: true
//   });

//   res.writeHead(301, { "Location": authorizationUrl });


//TODO: NAJ MAREK ZROBI
//! XDDDDDDDDD