# twitter-sentiment-backend


### Project Description
This project is a backend for tracking the [sentiment](https://en.wikipedia.org/wiki/Sentiment_analysis) of tweets in real-time. The client could represent the front-end of a dashboard application for tracking the tweet sentiment of a brand hashtag, public figure, current event etc. The main client facing server is powered by Express and Node.js. Sentiment is calculated by collating tweets that match specific [rules](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/api-reference/post-tweets-search-stream-rules#Validate) as defined by the Twitter API. Once a certain amount of tweets has been collected the tweets are sent to a lambda function that extracts the text into a document that is sent to the [Google Natural Language API](https://cloud.google.com/natural-language) for sentiment analysis. This data is then saved in AWS DynamoDB table where new records can be streamed as they are saved for a real-time view on the client.

### Project Notes
- This project relies heavily on [FP-TS](https://gcanti.github.io/fp-ts/) the typed functional programming library for TypeScript. I've found that functional programming paradigms greatly improve the flow, readability, error-handling, and testability of my code, especially when data processing relies on a multitude of asynchronous operations. Abstractions such as the [TaskEither](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html) monad provide a much cleaner approach to asynchornous data handling than working directly with the Promise API
- I also chose to use [RxJS](https://rxjs.dev/) on the server-side for handling the tweet streaming data from the Twitter API. RxJS is much easier to use and more feature rich than the lower-level Node Stream API. It is also a functional reactive programming libary and so fits well with FP-TS ecosystem.
- The project also makes heavy use of [IO-TS](https://gcanti.github.io/io-ts/) for runtime type validation. Io-ts provides a feature rich set of functions for defining validators/parsers that allow for the construction of composite types to represent domain models and request payloads. This way we have fully defined types and validators/parsers through and between all IO operations.



![cloud diagram](https://lucid.app/publicSegments/view/6bbd4cbe-c961-4c76-8141-28bc0dc73da5/image.png)
