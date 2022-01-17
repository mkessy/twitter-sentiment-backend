
## Filtered Stream

#### Elevated access
---

+ 25 rules per stream
+ 50 requests per 15 minutes when using the POST /2/t weets/search/stream/rules endpoint to add rules
+ Can only use the core operators when building your rule
+ Can build rules up to 512 characters in length
+ Cannot use the recovery and redundancy features

#### Operator Types
---
+ Standalone
  + can be used alone or together with any other operator
+ Conjunction-required
  + can only be used when at least one standalone operator is included
    + since they are too general and result in high tweet vol.


#### Possibly useful Operator for this project
---
+ :lang
  + Matches Tweets that have been classified by Twitter as being of a particular language (if, and only if, the tweet has been classified). It is important to note that each Tweet is currently only classified as being of one language, so AND’ing together multiple languages will yield no results.
+ @
  + Matches any Tweet that mentions the given username, if the username is a recognized entity (including the @ character).
Example: (@twitterdev OR @twitterapi) -@twitter
+ context: 
  + NEW Matches Tweets with a specific domain id and/or domain id, enitity id pair where * represents a wildcard. To learn more about this operator, please visit our page on Tweet annotations.

+ entity: 
  + NEW Matches Tweets with a specific entity string value. To learn more about this operator, please visit our page on annotations.



