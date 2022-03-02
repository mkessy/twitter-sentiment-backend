"use strict";
// Create clients and set shared const values outside of the handler.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTweetSentiment = void 0;
const language_1 = require("@google-cloud/language");
const decoder_1 = require("./decoder");
const db_1 = require("./db");
const utils_1 = require("./utils");
const function_1 = require("fp-ts/lib/function");
const E = __importStar(require("fp-ts/Either"));
const TE = __importStar(require("fp-ts/TaskEither"));
// Get the DynamoDB table name from environment variables
const languageClient = new language_1.LanguageServiceClient();
/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
const processTweetSentiment = async (event, context) => {
    const response = await (0, function_1.pipe)(TE.bindTo("payload")((0, function_1.pipe)(E.fromNullable("Error: missing body")(event.body), E.chain(utils_1.parseJson), E.chainW(decoder_1.LambdaPayloadDecoder.decode), TE.fromEither)), TE.bindW("doc", ({ payload }) => (0, function_1.pipe)((0, utils_1.lambdaPayloadToSentimentDocument)(payload), (sentimentDoc) => (0, utils_1.analyzeSentimentTask)({ document: sentimentDoc })(languageClient))), TE.bindW("data", ({ payload, doc }) => {
        const [sentiment] = doc;
        const { ruleId, tweets } = payload;
        return (0, db_1.putItem)({
            ruleId,
            sentiment,
            tweets,
            timestamp: Date.now().toString(),
        });
    }), TE.map(({ data }) => data))();
    return (0, function_1.pipe)(response, E.fold((err) => ({ statusCode: 500, body: JSON.stringify(err) }), (result) => ({ statusCode: 200, body: JSON.stringify(result) })));
};
exports.processTweetSentiment = processTweetSentiment;
