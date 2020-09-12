# First Node / Express Server

Random dude gave me a free VM, so I used it to stand between my portfolio and my firebase firestore.
https://justinechang.me

# WHY?
Firestore currently does not have the ability to limit the number of accesses in a given amount of time if there is not authentication applied. So I would need to either make a Firebase Function to rate limit, or if I had a VM I could limit it there. Luckily now I have a VM!

# Features


  - Rate limiting - Does not allow viewer to spam my Firestore database and cause me to exceed the free tier limit.
  - IP Location logging - I log the location of the people that visit my portfolio (https://ip-api.com/)
