# twitter-sentiment-backend


### Project Description
This project is a backend for tracking the [sentiment](https://en.wikipedia.org/wiki/Sentiment_analysis) of tweets in real-time. The client could represent the front-end of a dashboard application for tracking the tweet sentiment of a brand hashtag, public figure, current event etc. The main client facing server is powered by Express and Node.js. The app is cloud-based using a number of AWS services. Sentiment is calculated by collating tweets that match specific [rules](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/api-reference/post-tweets-search-stream-rules#Validate) as defined by the Twitter API. Once a certain amount of tweets has been collected (determined by the settings of the SQS queue for a given topic) the tweets are sent to a lambda function that extracts the text into a document that is sent to the [Google Natural Language API](https://cloud.google.com/natural-language) for sentiment analysis. This data is then saved in AWS DynamoDB table where new records can be streamed as they are saved for a real-time view on the client.

### Project Notes
- Writing the logic for managing the streaming connection with twitter API was one of the more challenging parts of this project. I chose to use [xstate](https://xstate.js.org/docs/) to manage that connection. Xstate allows you to write state charts that declaratively map the possible states of a function or application. A live http long poll based streaming connection can be in many different states (connecting, connected, retrying, timedout) and managing them fluently is critical. Furthermore downstream processing (like published streamed tweets to an AWS SNS topic) adds further complexity. E.g. what to do if publishing to SNS fails? How long should the stream connection stay open? Should it automatically restart? Xstate allows for mapping out this logic explicitly and building state machines that can communicate with each other with defined events. ![xstate chart](https://user-images.githubusercontent.com/4350125/175186408-55ae071b-9fc0-4a3a-b127-94bb463f11e2.png)


- This project relies heavily on [FP-TS](https://gcanti.github.io/fp-ts/) the typed functional programming library for TypeScript. I've found that functional programming paradigms greatly improve the flow, readability, error-handling, and testability of code, especially when data processing relies on a multitude of asynchronous operations. Abstractions such as the [TaskEither](https://gcanti.github.io/fp-ts/modules/TaskEither.ts.html) monad provide a much cleaner approach to asynchornous data handling than working directly with the Promise API
- The project also makes heavy use of [IO-TS](https://gcanti.github.io/io-ts/) for runtime type validation. Io-ts provides a feature rich set of functions for defining validators/parsers that allow for the construction of composite types to represent domain models and request payloads. This way we have fully defined types and validators/parsers through and between all IO operations.



![cloud diagram](https://lucid.app/publicSegments/view/6bbd4cbe-c961-4c76-8141-28bc0dc73da5/image.png)
