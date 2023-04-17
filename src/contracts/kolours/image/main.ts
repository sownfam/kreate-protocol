import { OutRef } from "@/types";

import { HeliosScript, header, helios } from "../../program";

export type Params = {
  seedInput: OutRef;
};

export default function main({ seedInput }: Params): HeliosScript {
  return helios`
  ${header("minting", "nft__image")}

  const SEED_OUTPUT_ID: TxOutputId =
      TxOutputId::new(
        TxId::new(#${seedInput.txHash}),
        ${seedInput.outputIndex}
      )

  enum Redeemer {
    Mint
    Burn
  }

  func main(redeemer: Redeemer, ctx: ScriptContext) -> Bool{
    tx: Tx = ctx.tx;
    own_mph: MintingPolicyHash = ctx.get_current_minting_policy_hash();
    own_minted: Map[ByteArray]Int = tx.minted.get_policy(own_mph);

    redeemer.switch {
      Mint => {
        tx.inputs.any((input: TxInput) -> { input.output_id == SEED_OUTPUT_ID })
          && own_minted.all( (_, amount: Int) -> Bool { amount == 1 } )
      },
      Burn => {
        false
      }
    }
  }
  `;
}
