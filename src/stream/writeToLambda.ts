import { Writable } from "stream";
import { StreamId, Tweet } from "../types";

type SampleSize = number;

interface TweetStoreConfig {
  streamSettings: Map<StreamId, SampleSize>;
  ruleToStreamIdMap: Map<string, StreamId>;
}

// rewrite to
class TweetStore {
  ruleToStreamIdMap: Map<string, StreamId>;
  store: Map<StreamId, Tweet[]>;
  config: TweetStoreConfig;
  sendToRemote: <T>(payload: {
    streamId: StreamId;
    tweets: Tweet[];
  }) => Promise<T>;

  constructor(
    config: TweetStoreConfig,
    sendToRemote: <T>(payload: {
      streamId: StreamId;
      tweets: Tweet[];
    }) => Promise<T>
  ) {
    this.store = new Map<StreamId, Tweet[]>();
    this.config = config;
    this.sendToRemote = sendToRemote;
  }

  /**
   * name
   */
  public async pushTweet(tweet: Tweet) {
    const { ruleToStreamIdMap, streamSettings } = this.config;
    const matchingRuleId = tweet.matching_rules[0].id;
    const tweetStreamId = ruleToStreamIdMap.get(matchingRuleId);
    const numTweetsInStore = this.store.get(tweetStreamId).length;
    const storeCapacity = streamSettings.get(tweetStreamId);
    const tweetsInStore = this.store.get(tweetStreamId);

    // if we've reached the sample-size for the streamId
    // send the payload to remote and empty the store
    if (numTweetsInStore + 1 === storeCapacity) {
      const tweets = [...tweetsInStore, tweet];
      this.store.set(tweetStreamId, []);
      await this.sendToRemote({ streamId: tweetStreamId, tweets });
      return {
        _tag: "SENT_TO_REMOTE",
        payload: { streamId: tweetStreamId, tweets },
      };
    } else {
      this.store.set(tweetStreamId, [...tweetsInStore, tweet]);
      return {
        _tag: "ADDED_TO_STORE",
        payload: { streamId: tweetStreamId, tweet },
      };
    }
  }
}
