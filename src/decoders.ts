import * as D from "io-ts/Decoder";
import { option } from "io-ts-types/lib/option";
import { unknown } from "io-ts";
import { pipe } from "fp-ts/lib/function";

const AddRuleObject = D.struct({
  value: D.string,
  tag: D.string,
});

export const DeleteRulesDecoder = D.struct({
  delete: D.struct({
    ids: D.array(D.string),
  }),
});

export const AddRulesDecoder = D.struct({
  add: D.array(AddRuleObject),
});

const ErrorDecoder = D.partial({
  errors: D.array(
    D.struct({
      parameters: D.UnknownRecord,
      message: D.string,
    })
  ),
  value: D.string,
  details: D.array(D.string),
  title: D.string,
  type: D.string,
});

export const GetRulesResponseDecoder = pipe(
  D.struct({
    data: D.array(
      D.struct({
        id: D.string,
        value: D.string,
        tag: D.string,
      })
    ),
    meta: D.struct({
      sent: D.string,
      result_count: D.number,
    }),
  }),
  D.intersect(ErrorDecoder)
);

export const AddRulesResponseDecoder = pipe(
  D.partial({
    data: D.array(
      D.struct({
        id: D.string,
        value: D.string,
        tag: D.string,
      })
    ),
    meta: D.struct({
      sent: D.string,
      summary: D.partial({
        created: D.number,
        not_created: D.number,
        valid: D.number,
        not_valid: D.number,
      }),
    }),
  }),
  D.intersect(ErrorDecoder)
);

export const DeleteRulesResponseDecoder = pipe(
  D.partial({
    meta: D.struct({
      sent: D.string,
      summary: D.partial({
        deleted: D.number,
        not_deleted: D.number,
      }),
    }),
  }),
  D.intersect(ErrorDecoder)
);
