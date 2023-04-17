import { compile, exportScript } from "@/contracts/compile";
import { Address, Data, Lucid, OutRef, PolicyId, fromText } from "lucid-cardano";
import * as S from "@/schema";

import getImageNft from "@/contracts/kolours/image/main";
import { getUserAddressKeyHashes } from "@/helpers/lucid";
import { KolourNftMintingRedeemer } from "@/schema/teiki/kolours";

export type MintImageNft = {
  userAddress: Address,
  name: string,
}

export async function buildMintImageNft(lucid: Lucid, { userAddress, name }: MintImageNft) {
  const seedInput = (await lucid.utxosAt(userAddress))[0];

  console.log("Seed inp: ", seedInput);
  const script = exportScript(compile(getImageNft({ seedInput })));
  const imageNftMph = lucid.utils.validatorToScriptHash(script);

  console.log("AMMEM: ", imageNftMph);

  const imageNftUnit = imageNftMph + fromText(name);

  const { paymentKeyHash: userPkh, stakeKeyHash: userSkh } =
    getUserAddressKeyHashes(userAddress);

  let tx = lucid.newTx()
    .addSignerKey(userPkh)
    // .collectFrom([seedInput])
    .mintAssets(
      { [imageNftUnit]: 1n },
      S.toCbor(S.toData({ case: "Mint" }, KolourNftMintingRedeemer))
    )
    .attachMintingPolicy(script)
  return tx;
}
