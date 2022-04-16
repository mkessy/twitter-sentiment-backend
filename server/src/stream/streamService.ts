import {
  groupAndPostToLambda,
  nodeTweetStreamToObservable,
} from "./processStream";
import { twitterAPIService } from "./twitterStreamAPI";
import { reconnectStream } from "./reconnect";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import { NewError } from "../Error/Error";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { Observable, Subject } from "rxjs";

const getStreamConnection = (
  onNodeStreamFailureCallback: (err: unknown) => void
) => {
  return pipe(
    twitterAPIService(axiosHttpClientEnv).connectToTweetStream,
    TE.orElse(reconnectStream),
    TE.map((stream) =>
      nodeTweetStreamToObservable(stream, onNodeStreamFailureCallback)
    )
    // inject error messages by folding the containe Either (?)
  );

  //return processStream(rawStream.right).pipe(share());
};

type ProcessedStreamItem<ProcessedItem> = ProcessedItem extends Observable<
  infer T
>
  ? T
  : never;

// class that has ownership over the tweet stream
// can be subscribed to
// should maintain the only connection instances to the twitter api
function createStreamService() {
  class StreamService {
    private _eventBus$: Subject<E.Either<NewError, unknown>> | null = null;
    constructor() {
      this.cleanUp = this.cleanUp.bind(this);
      // dont initialize eventbus in constructor since we don't want to make
      // a stream connection to the twitter API until necessary
    }

    private cleanUp(err: unknown) {
      console.info(
        "StreamService: error occured! Completeing stream and unsubscribing.",
        err
      );
      if (this._eventBus$ !== null) {
        this._eventBus$.complete();
        this._eventBus$.unsubscribe();
        this._eventBus$ = null;
      }
    }

    public async getListener() {
      // if eventbus hasn't been initialized
      if (this._eventBus$ === null) {
        console.info("fetching stream connection");
        const streamConnection = await getStreamConnection(this.cleanUp)();

        if (E.isLeft(streamConnection)) {
          console.info(
            "failed to connect to stream after multiple retry attemps"
          );
          return Promise.reject(`${streamConnection.left}`);
        } else {
          console.info("sucessfully connected to stream. processing...");
          const [rawStream$, nodeStreamCleanUp] = streamConnection.right;

          const source$ = groupAndPostToLambda(rawStream$);
          this._eventBus$ = new Subject<E.Either<NewError, unknown>>();
          source$.subscribe(this._eventBus$).add(() => {
            console.info("tearing down stream");
            nodeStreamCleanUp();
          });
          return this._eventBus$.asObservable();
        }
      } else {
        return this._eventBus$.asObservable();
      }
    }
  }

  return new StreamService();
}

const StreamService = createStreamService();

export default StreamService;
