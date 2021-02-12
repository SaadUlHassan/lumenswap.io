import store from 'src/store';
import StellarSDK from 'stellar-sdk';
import getSwapTRX from './getSwapTRX';
import hideModal from 'src/actions/modal/hide';
import showTxnStatus from 'src/actions/modal/transactionStatus';
import reportSuccessfulSwap from 'src/api/metrics/reportSuccessfulSwap';
import { trsStatus } from 'src/constants/enum';
import createManageBuyOfferMaker from 'src/api/createMangeBuyOfferMaker';
import reportFailureSwap from 'src/api/metrics/reportFailureSwap';
import showWaitingModal from 'src/actions/modal/waiting';
import transformTrezorTransaction from 'src/helpers/transformTrezor';
import TrezorConnect from 'trezor-connect';
import getCreateManageBuyOfferTRX from './getCreateManageBuyOfferTRX';
import getAssetDetails from 'src/helpers/getAssetDetails';

const server = new StellarSDK.Server(process.env.REACT_APP_HORIZON);

export default async function swapTokenWithTrezor() {
  const { checkout, user, userToken } = store.getState();

  try {
    const account = await server.loadAccount(checkout.fromAddress);
    const fee = await server.fetchBaseFee();

    let needToTrust;
    if (checkout.toAsset.issuer === 'native') {
      needToTrust = false;
    } else {
      needToTrust = !userToken.find(
        (token) =>
          token.asset_code === checkout.toAsset.code &&
          token.asset_issuer === checkout.toAsset.issuer
      );
    }

    let transaction = new StellarSDK.TransactionBuilder(account, {
      fee,
      networkPassphrase: StellarSDK.Networks.PUBLIC,
    });

    if (needToTrust) {
      // transaction = transaction.addOperation(
      //   StellarSDK.Operation.changeTrust({
      //     asset: getAssetDetails(checkout.toAsset),
      //   })
      // );
    }

    transaction = transaction
      .addOperation(
        StellarSDK.Operation.manageSellOffer({
          selling: getAssetDetails(checkout.fromAsset),
          buying: getAssetDetails(checkout.toAsset),
          amount: (
            checkout.fromAmount *
            checkout.counterPrice *
            (1 - checkout.tolerance)
          ).toFixed(7),
          price: {
            n: 1 * 10000000,
            d: Math.floor(
              (checkout.counterPrice * (1 - checkout.tolerance)).toFixed(7) *
                10000000
            ),
          },
          offerId: 0,
        })
      )
      .setTimeout(30)
      .build();

    const params = transformTrezorTransaction("m/44'/148'/0'", transaction);
    const signedFromTrezor = await TrezorConnect.stellarSignTransaction(params);
    console.log(signedFromTrezor);

    // const keyPair = StellarSDK.Keypair.fromPublicKey(user.detail.publicKey);
    // const hint = keyPair.signatureHint();
    // const decorated = new StellarSDK.xdr.DecoratedSignature({
    //   hint: hint,
    //   signature: signedFromTrezor.signature,
    // });
    // transaction.signatures.push(decorated);

    // const result = await server.submitTransaction(transaction);
    // hideModal();
    // reportSuccessfulSwap();
    // showTxnStatus({
    //   status: trsStatus.SUCCESS,
    //   message: result.hash,
    //   action: () => {
    //     global.window.open(
    //       `https://lumenscan.io/txns/${result.hash}`,
    //       '_blank'
    //     );
    //   },
    // });
  } catch (e) {
    console.log(e);
    hideModal();
    reportFailureSwap();

    if (e?.response?.data?.extras?.result_codes?.operations) {
      const code = e.response.data.extras.result_codes.operations[1]
        ? e.response.data.extras.result_codes.operations[1]
        : e.response.data.extras.result_codes.operations[0];

      if (code === 'op_under_dest_min') {
        showTxnStatus({
          status: trsStatus.WARNING,
          message:
            'Your order is too large to be processed by the network. Do you want to register it as an active order on the network?',
          action: () => {
            createManageBuyOfferMaker();
          },
        });
      } else if (code === 'op_underfunded') {
        showTxnStatus({
          status: trsStatus.FAIL,
          message: `You have not enough funds to send and still satisfy "${checkout.fromAsset.code}" selling liabilities, Note that if sending XLM then the you must additionally maintain its minimum XLM reserve.`,
        });
      } else {
        showTxnStatus({
          status: trsStatus.FAIL,
          message: `There is some issue in your transaction. reason: ${code}`,
        });
      }
    } else {
      if (e.message) {
        showTxnStatus({
          status: trsStatus.FAIL,
          message: e.message,
        });
      } else {
        showTxnStatus({
          status: trsStatus.FAIL,
          message: 'There is some issue in your transaction.',
        });
      }
    }
  }
}
