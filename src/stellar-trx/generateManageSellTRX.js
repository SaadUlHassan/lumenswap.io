import isSameAsset from 'helpers/isSameAsset';
import sevenDigit from 'helpers/sevenDigit';
import StellarSDK from 'stellar-sdk';
import store from 'store';

const server = new StellarSDK.Server(process.env.REACT_APP_HORIZON);

export default async function generateManageSellTRX(
  address,
  buyingAsset,
  sellingAsset,
  amount,
  price,
  offerId,
) {
  const account = await server.loadAccount(address);

  let transaction = new StellarSDK.TransactionBuilder(account, {
    fee: 100000,
    networkPassphrase: StellarSDK.Networks.PUBLIC,
  });

  const storeData = store.getState();
  if (!storeData.userBalance.find((i) => isSameAsset(i.asset, buyingAsset))) {
    transaction = transaction.addOperation(
      StellarSDK.Operation.changeTrust({
        asset: buyingAsset,
      }),
    );
  }
  if (!storeData.userBalance.find((i) => isSameAsset(i.asset, sellingAsset))) {
    transaction = transaction.addOperation(
      StellarSDK.Operation.changeTrust({
        asset: sellingAsset,
      }),
    );
  }

  transaction = transaction.addOperation(
    StellarSDK.Operation.manageSellOffer({
      selling: sellingAsset,
      buying: buyingAsset,
      amount: sevenDigit(amount).toString(),
      price: sevenDigit(price).toString(),
      offerId,
    }),
  )
    .setTimeout(30)
    .build();

  return transaction;
}
